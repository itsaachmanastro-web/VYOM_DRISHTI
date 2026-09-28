import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { PoseKeypoint, TrajectoryPoint } from '../types/mission';

export interface RealPoseDetectionResult {
  keypoints: PoseKeypoint[];
  score: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  detectedAction: string;
  actionConfidence: number;
  jointAngles: {
    rightElbow: number;
    leftElbow: number;
    rightShoulder: number;
    leftShoulder: number;
    rightKnee: number;
    leftKnee: number;
  };
  angularVelocityDegSec: number;
  wristTrajectory: {
    right: TrajectoryPoint[];
    left: TrajectoryPoint[];
  };
}

class PoseDetectionService {
  private detector: poseDetection.PoseDetector | null = null;
  private isInitializing: boolean = false;
  private isModelReady: boolean = false;

  private prevAngles: { rightElbow: number; leftElbow: number; timestamp: number } = { rightElbow: 145, leftElbow: 140, timestamp: 0 };
  private rightWristTrail: TrajectoryPoint[] = [];
  private leftWristTrail: TrajectoryPoint[] = [];
  private maxTrailLength = 25;

  public async initDetector(): Promise<boolean> {
    if (this.isModelReady && this.detector) return true;
    if (this.isInitializing) return false;

    this.isInitializing = true;
    try {
      await tf.setBackend('webgl');
      await tf.ready();

      const model = poseDetection.SupportedModels.MoveNet;
      const detectorConfig: poseDetection.MoveNetModelConfig = {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        enableSmoothing: true,
        minPoseScore: 0.25
      };

      this.detector = await poseDetection.createDetector(model, detectorConfig);
      this.isModelReady = true;
      this.isInitializing = false;
      console.log('✅ MoveNet Pose Detector initialized on WebGL backend');
      return true;
    } catch (err) {
      console.warn('⚠️ Fallback to WebGL/CPU detector:', err);
      this.isInitializing = false;
      return false;
    }
  }

  public getIsReady(): boolean {
    return this.isModelReady;
  }

  public async estimatePose(video: HTMLVideoElement): Promise<RealPoseDetectionResult | null> {
    if (!this.detector || !this.isModelReady || video.readyState < 2) {
      return null;
    }

    try {
      const poses = await this.detector.estimatePoses(video, {
        maxPoses: 1,
        flipHorizontal: false
      });

      if (!poses || poses.length === 0) {
        return null;
      }

      const pose = poses[0];
      const videoWidth = video.videoWidth || 640;
      const videoHeight = video.videoHeight || 480;
      const now = Date.now();

      // Normalize keypoints to 0-1 percentage
      const keypoints: PoseKeypoint[] = pose.keypoints.map(kp => ({
        name: kp.name || 'unknown',
        x: kp.x / videoWidth,
        y: kp.y / videoHeight,
        score: kp.score || 0
      }));

      // Calculate Bounding Box
      let minX = 1, maxX = 0, minY = 1, maxY = 0;
      let validCount = 0;

      keypoints.forEach(kp => {
        if (kp.score > 0.3) {
          minX = Math.min(minX, kp.x);
          maxX = Math.max(maxX, kp.x);
          minY = Math.min(minY, kp.y);
          maxY = Math.max(maxY, kp.y);
          validCount++;
        }
      });

      if (validCount < 4) {
        return null;
      }

      const padX = 0.05;
      const padY = 0.05;
      const boundingBox = {
        x: Math.max(0, minX - padX),
        y: Math.max(0, minY - padY),
        width: Math.min(1, maxX - minX + padX * 2),
        height: Math.min(1, maxY - minY + padY * 2)
      };

      // Calculate Joint Angles
      const kpMap = new Map<string, PoseKeypoint>();
      keypoints.forEach(kp => kpMap.set(kp.name, kp));

      const calcAngle = (p1?: PoseKeypoint, p2?: PoseKeypoint, p3?: PoseKeypoint): number => {
        if (!p1 || !p2 || !p3 || p1.score < 0.3 || p2.score < 0.3 || p3.score < 0.3) return 140;
        const radians = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);
        let angle = Math.abs((radians * 180.0) / Math.PI);
        if (angle > 180.0) angle = 360 - angle;
        return Math.round(angle);
      };

      const rightElbowAngle = calcAngle(kpMap.get('right_shoulder'), kpMap.get('right_elbow'), kpMap.get('right_wrist'));
      const leftElbowAngle = calcAngle(kpMap.get('left_shoulder'), kpMap.get('left_elbow'), kpMap.get('left_wrist'));
      const rightShoulderAngle = calcAngle(kpMap.get('right_hip'), kpMap.get('right_shoulder'), kpMap.get('right_elbow'));
      const leftShoulderAngle = calcAngle(kpMap.get('left_hip'), kpMap.get('left_shoulder'), kpMap.get('left_elbow'));
      const rightKneeAngle = calcAngle(kpMap.get('right_hip'), kpMap.get('right_knee'), kpMap.get('right_ankle'));
      const leftKneeAngle = calcAngle(kpMap.get('left_hip'), kpMap.get('left_knee'), kpMap.get('left_ankle'));

      // Calculate Angular Velocity (deg/s)
      const dt = Math.max(0.016, (now - this.prevAngles.timestamp) / 1000);
      const angleDelta = Math.abs(rightElbowAngle - this.prevAngles.rightElbow);
      const angularVel = Math.round((angleDelta / dt) * 10) / 10;

      this.prevAngles = {
        rightElbow: rightElbowAngle,
        leftElbow: leftElbowAngle,
        timestamp: now
      };

      // Trajectory Tracking
      const rw = kpMap.get('right_wrist');
      const lw = kpMap.get('left_wrist');

      if (rw && rw.score > 0.4) {
        this.rightWristTrail.push({ x: rw.x, y: rw.y, z: rw.z3d || 0, timestamp: now });
        if (this.rightWristTrail.length > this.maxTrailLength) this.rightWristTrail.shift();
      }

      if (lw && lw.score > 0.4) {
        this.leftWristTrail.push({ x: lw.x, y: lw.y, z: lw.z3d || 0, timestamp: now });
        if (this.leftWristTrail.length > this.maxTrailLength) this.leftWristTrail.shift();
      }

      // Explicit Kinematic Action Classification (Forgiving relative joint logic)
      const rightWrist = kpMap.get('right_wrist');
      const leftWrist = kpMap.get('left_wrist');
      const rightElbow = kpMap.get('right_elbow');
      const leftElbow = kpMap.get('left_elbow');
      const rightShoulder = kpMap.get('right_shoulder');
      const leftShoulder = kpMap.get('left_shoulder');
      const rightHip = kpMap.get('right_hip');
      const leftHip = kpMap.get('left_hip');
      const nose = kpMap.get('nose');

      let rawAction = 'HANDS_AT_REST';
      let confidence = pose.score || 0.85;

      // Condition A: Right hand raised (wrist above shoulder OR wrist significantly above elbow)
      const rightWristElevated = (rightWrist && rightShoulder && rightWrist.score > 0.25 && rightWrist.y < rightShoulder.y + 0.08) ||
                                (rightWrist && rightElbow && rightWrist.score > 0.25 && rightWrist.y < rightElbow.y - 0.03);

      // Condition B: Left hand raised (wrist above shoulder OR wrist significantly above elbow)
      const leftWristElevated = (leftWrist && leftShoulder && leftWrist.score > 0.25 && leftWrist.y < leftShoulder.y + 0.08) ||
                               (leftWrist && leftElbow && leftWrist.score > 0.25 && leftWrist.y < leftElbow.y - 0.03);

      // Condition C: Hands together at chest
      const handsTogether = rightWrist && leftWrist && rightShoulder && leftShoulder &&
        rightWrist.score > 0.25 && leftWrist.score > 0.25 &&
        Math.hypot(rightWrist.x - leftWrist.x, rightWrist.y - leftWrist.y) < 0.28 &&
        rightWrist.y > (rightShoulder.y - 0.05) && (!rightHip || rightWrist.y < rightHip.y + 0.05);

      // Condition D: Hands resting / lowered
      const rightHandLow = !rightWristElevated || (rightWrist && rightHip && rightWrist.y > rightHip.y - 0.12);
      const leftHandLow = !leftWristElevated || (leftWrist && leftHip && leftWrist.y > leftHip.y - 0.12);

      if (rightWristElevated && leftWristElevated) {
        rawAction = 'RAISE_BOTH_HANDS';
        confidence = Math.max(rightWrist?.score || 0.8, leftWrist?.score || 0.8);
      } else if (rightWristElevated && !leftWristElevated) {
        rawAction = 'RAISE_RIGHT_HAND';
        confidence = rightWrist?.score || 0.85;
      } else if (leftWristElevated && !rightWristElevated) {
        rawAction = 'RAISE_LEFT_HAND';
        confidence = leftWrist?.score || 0.85;
      } else if (handsTogether) {
        rawAction = 'HANDS_TOGETHER_CHEST';
        confidence = ((rightWrist?.score || 0.8) + (leftWrist?.score || 0.8)) / 2;
      } else if (rightHandLow && leftHandLow) {
        rawAction = 'HANDS_AT_REST';
        confidence = Math.max(0.85, pose.score || 0.88);
      } else {
        // Natural transition / preparing movement
        rawAction = 'PREPARING_MOVEMENT';
        confidence = 0.80;
      }

      return {
        keypoints,
        score: pose.score || 0.9,
        boundingBox,
        detectedAction: rawAction,
        actionConfidence: Math.min(0.99, Math.max(0.60, confidence)),
        jointAngles: {
          rightElbow: rightElbowAngle,
          leftElbow: leftElbowAngle,
          rightShoulder: rightShoulderAngle,
          leftShoulder: leftShoulderAngle,
          rightKnee: rightKneeAngle,
          leftKnee: leftKneeAngle
        },
        angularVelocityDegSec: angularVel,
        wristTrajectory: {
          right: [...this.rightWristTrail],
          left: [...this.leftWristTrail]
        }
      };
    } catch (err) {
      console.warn('Pose estimation frame error:', err);
      return null;
    }
  }
}

export const poseDetectionService = new PoseDetectionService();
