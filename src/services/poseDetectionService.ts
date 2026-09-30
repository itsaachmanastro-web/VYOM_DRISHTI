import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { PoseKeypoint, TrajectoryPoint } from '../types/mission';

export interface KinematicRotations3D {
  torso: { pitch: number; roll: number; yaw: number };
  rightShoulder: { x: number; y: number; z: number };
  rightElbow: { x: number; y: number; z: number };
  leftShoulder: { x: number; y: number; z: number };
  leftElbow: { x: number; y: number; z: number };
  rightHip: { x: number; y: number; z: number };
  rightKnee: { x: number; y: number; z: number };
  leftHip: { x: number; y: number; z: number };
  leftKnee: { x: number; y: number; z: number };
}

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
  kinematics3D?: KinematicRotations3D;
  isTrackingLost?: boolean;
}

class PoseDetectionService {
  private detector: poseDetection.PoseDetector | null = null;
  private isInitializing: boolean = false;
  private isModelReady: boolean = false;

  private prevAngles: { rightElbow: number; leftElbow: number; timestamp: number } = { rightElbow: 145, leftElbow: 140, timestamp: 0 };
  private rightWristTrail: TrajectoryPoint[] = [];
  private leftWristTrail: TrajectoryPoint[] = [];
  private maxTrailLength = 25;

  // Smoothing cache for keypoints (EMA Filter)
  private smoothedKeypoints: Map<string, { x: number; y: number; score: number }> = new Map();
  private smoothingAlpha: number = 0.40; // Balanced between responsive and stable

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
        minPoseScore: 0.20
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

      // Normalize & Apply EMA Smoothing Filter on Keypoints
      const keypoints: PoseKeypoint[] = pose.keypoints.map(kp => {
        const rawX = kp.x / videoWidth;
        const rawY = kp.y / videoHeight;
        const name = kp.name || 'unknown';
        const score = kp.score || 0;

        const prev = this.smoothedKeypoints.get(name);
        let smoothedX = rawX;
        let smoothedY = rawY;

        if (prev && score > 0.2) {
          smoothedX = prev.x * (1 - this.smoothingAlpha) + rawX * this.smoothingAlpha;
          smoothedY = prev.y * (1 - this.smoothingAlpha) + rawY * this.smoothingAlpha;
        }

        this.smoothedKeypoints.set(name, { x: smoothedX, y: smoothedY, score });

        return {
          name,
          x: smoothedX,
          y: smoothedY,
          score
        };
      });

      // Calculate Bounding Box
      let minX = 1, maxX = 0, minY = 1, maxY = 0;
      let validCount = 0;

      keypoints.forEach(kp => {
        if (kp.score > 0.25) {
          minX = Math.min(minX, kp.x);
          maxX = Math.max(maxX, kp.x);
          minY = Math.min(minY, kp.y);
          maxY = Math.max(maxY, kp.y);
          validCount++;
        }
      });

      if (validCount < 4) {
        return {
          keypoints,
          score: 0.2,
          boundingBox: { x: 0, y: 0, width: 0, height: 0 },
          detectedAction: 'SEARCHING_ASTRONAUT',
          actionConfidence: 0.2,
          jointAngles: { rightElbow: 140, leftElbow: 140, rightShoulder: 40, leftShoulder: 40, rightKnee: 170, leftKnee: 170 },
          angularVelocityDegSec: 0,
          wristTrajectory: { right: [], left: [] },
          isTrackingLost: true
        };
      }

      const padX = 0.05;
      const padY = 0.05;
      const boundingBox = {
        x: Math.max(0, minX - padX),
        y: Math.max(0, minY - padY),
        width: Math.min(1, maxX - minX + padX * 2),
        height: Math.min(1, maxY - minY + padY * 2)
      };

      const kpMap = new Map<string, PoseKeypoint>();
      keypoints.forEach(kp => kpMap.set(kp.name, kp));

      // Calculate 2D/3D Anatomical Joint Angles
      const calcAngle = (p1?: PoseKeypoint, p2?: PoseKeypoint, p3?: PoseKeypoint): number => {
        if (!p1 || !p2 || !p3 || p1.score < 0.25 || p2.score < 0.25 || p3.score < 0.25) return 140;
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

      if (rw && rw.score > 0.35) {
        this.rightWristTrail.push({ x: rw.x, y: rw.y, z: rw.z3d || 0, timestamp: now });
        if (this.rightWristTrail.length > this.maxTrailLength) this.rightWristTrail.shift();
      }

      if (lw && lw.score > 0.35) {
        this.leftWristTrail.push({ x: lw.x, y: lw.y, z: lw.z3d || 0, timestamp: now });
        if (this.leftWristTrail.length > this.maxTrailLength) this.leftWristTrail.shift();
      }

      // --- 3D KINEMATIC SOLVER FOR ASTRONAUT BONE ROTATIONS ---
      const rSh = kpMap.get('right_shoulder');
      const lSh = kpMap.get('left_shoulder');
      const rEl = kpMap.get('right_elbow');
      const lEl = kpMap.get('left_elbow');
      const rWr = kpMap.get('right_wrist');
      const lWr = kpMap.get('left_wrist');
      const rHip = kpMap.get('right_hip');
      const lHip = kpMap.get('left_hip');
      const rKn = kpMap.get('right_knee');
      const lKn = kpMap.get('left_knee');
      const rAnk = kpMap.get('right_ankle');
      const lAnk = kpMap.get('left_ankle');

      // 1. Torso Spine Roll & Pitch
      let torsoRoll = 0;
      let torsoPitch = 0;
      let torsoYaw = 0;

      if (rSh && lSh && rHip && lHip && rSh.score > 0.3 && lSh.score > 0.3) {
        const midShX = (rSh.x + lSh.x) / 2;
        const midShY = (rSh.y + lSh.y) / 2;
        const midHipX = (rHip.x + lHip.x) / 2;
        const midHipY = (rHip.y + lHip.y) / 2;

        // Roll: spine tilt
        torsoRoll = Math.atan2(midShX - midHipX, -(midShY - midHipY)) * 0.8;
        torsoRoll = Math.max(-0.45, Math.min(0.45, torsoRoll));

        // Shoulder tilt
        const shAngle = Math.atan2(lSh.y - rSh.y, lSh.x - rSh.x);
        torsoRoll += shAngle * 0.4;

        // Yaw: asymmetric shoulder distance relative to hips
        const shDist = Math.abs(lSh.x - rSh.x);
        const hipDist = Math.abs(lHip.x - rHip.x) || 0.2;
        torsoYaw = (shDist / hipDist - 1.0) * 0.5;
        torsoYaw = Math.max(-0.4, Math.min(0.4, torsoYaw));
      }

      // 2. Right Arm Kinematics (MoveNet image left = person's right)
      let rShoulderRotZ = -0.15;
      let rShoulderRotX = 0;
      let rShoulderRotY = 0;
      let rElbowRotX = 0.2;

      if (rSh && rEl && rSh.score > 0.25 && rEl.score > 0.25) {
        // Vector from Right Shoulder to Right Elbow (in anatomical rig coordinates)
        // dx: negative in image = moving outward to person's right
        const dx = -(rEl.x - rSh.x) * 2.2;
        const dy = -(rEl.y - rSh.y); // positive = above shoulder

        // Upper arm elevation angle in frontal plane
        rShoulderRotZ = Math.atan2(-dx, -dy);
        rShoulderRotZ = Math.max(-2.7, Math.min(0.35, rShoulderRotZ));

        // Arm forward pitch
        if (rWr && rWr.score > 0.25) {
          if (rWr.y < rSh.y - 0.05) {
            rShoulderRotX = 0.65; // Hand high up
          } else if (rWr.y < rEl.y) {
            rShoulderRotX = 0.45; // Forearm raised
          }
        }

        // Elbow Flexion
        if (rWr && rWr.score > 0.25) {
          const flexRad = Math.max(0, Math.min(2.5, ((180 - rightElbowAngle) * Math.PI) / 180));
          rElbowRotX = flexRad;
        }
      }

      // 3. Left Arm Kinematics (MoveNet image right = person's left)
      let lShoulderRotZ = 0.15;
      let lShoulderRotX = 0;
      let lShoulderRotY = 0;
      let lElbowRotX = 0.2;

      if (lSh && lEl && lSh.score > 0.25 && lEl.score > 0.25) {
        const dx = (lEl.x - lSh.x) * 2.2;
        const dy = -(lEl.y - lSh.y);

        lShoulderRotZ = Math.atan2(dx, -dy);
        lShoulderRotZ = Math.max(-0.35, Math.min(2.7, lShoulderRotZ));

        if (lWr && lWr.score > 0.25) {
          if (lWr.y < lSh.y - 0.05) {
            lShoulderRotX = 0.65;
          } else if (lWr.y < lEl.y) {
            lShoulderRotX = 0.45;
          }
        }

        if (lWr && lWr.score > 0.25) {
          const flexRad = Math.max(0, Math.min(2.5, ((180 - leftElbowAngle) * Math.PI) / 180));
          lElbowRotX = flexRad;
        }
      }

      // 4. Legs Kinematics
      let rHipRotX = 0;
      let rKneeRotX = 0.1;
      let lHipRotX = 0;
      let lKneeRotX = 0.1;

      if (rHip && rKn && rHip.score > 0.25 && rKn.score > 0.25) {
        const knFlex = Math.max(0, Math.min(2.2, ((180 - rightKneeAngle) * Math.PI) / 180));
        rKneeRotX = knFlex * 0.7;
        rHipRotX = -knFlex * 0.35;
      }

      if (lHip && lKn && lHip.score > 0.25 && lKn.score > 0.25) {
        const knFlex = Math.max(0, Math.min(2.2, ((180 - leftKneeAngle) * Math.PI) / 180));
        lKneeRotX = knFlex * 0.7;
        lHipRotX = -knFlex * 0.35;
      }

      const kinematics3D: KinematicRotations3D = {
        torso: { pitch: torsoPitch, roll: torsoRoll, yaw: torsoYaw },
        rightShoulder: { x: rShoulderRotX, y: rShoulderRotY, z: rShoulderRotZ },
        rightElbow: { x: rElbowRotX, y: 0, z: 0 },
        leftShoulder: { x: lShoulderRotX, y: lShoulderRotY, z: lShoulderRotZ },
        leftElbow: { x: lElbowRotX, y: 0, z: 0 },
        rightHip: { x: rHipRotX, y: 0, z: 0 },
        rightKnee: { x: rKneeRotX, y: 0, z: 0 },
        leftHip: { x: lHipRotX, y: 0, z: 0 },
        leftKnee: { x: lKneeRotX, y: 0, z: 0 }
      };

      // Action Classification (Accurate Hand Elevation & Rest Detection)
      const rWrScore = rWr?.score || 0;
      const lWrScore = lWr?.score || 0;
      const rShScore = rSh?.score || 0;
      const lShScore = lSh?.score || 0;
      const rElScore = rEl?.score || 0;
      const lElScore = lEl?.score || 0;

      const rightWristElevated = (rWr && rSh && rWrScore > 0.18 && rWr.y < rSh.y + 0.10) ||
                                (rWr && rEl && rWrScore > 0.18 && rWr.y < rEl.y - 0.02) ||
                                (rEl && rSh && rElScore > 0.18 && rEl.y < rSh.y + 0.05);

      const leftWristElevated = (lWr && lSh && lWrScore > 0.18 && lWr.y < lSh.y + 0.10) ||
                               (lWr && lEl && lWrScore > 0.18 && lWr.y < lEl.y - 0.02) ||
                               (lEl && lSh && lElScore > 0.18 && lEl.y < lSh.y + 0.05);

      const handsTogether = rWr && lWr && rSh && lSh &&
        rWrScore > 0.18 && lWrScore > 0.18 &&
        Math.hypot(rWr.x - lWr.x, rWr.y - lWr.y) < 0.28 &&
        rWr.y > (rSh.y - 0.05) && (!rHip || rWr.y < rHip.y + 0.05);

      const rightHandLow = !rightWristElevated || (rWr && rHip && rWr.y > rHip.y - 0.10);
      const leftHandLow = !leftWristElevated || (lWr && lHip && lWr.y > lHip.y - 0.10);

      let rawAction = 'HANDS_AT_REST';
      let confidence = pose.score || 0.88;

      if (rightWristElevated && leftWristElevated) {
        rawAction = 'RAISE_BOTH_HANDS';
        confidence = Math.max(rWrScore || 0.85, lWrScore || 0.85);
      } else if (rightWristElevated && !leftWristElevated) {
        rawAction = 'RAISE_RIGHT_HAND';
        confidence = Math.max(rWrScore, rElScore, 0.85);
      } else if (leftWristElevated && !rightWristElevated) {
        rawAction = 'RAISE_LEFT_HAND';
        confidence = Math.max(lWrScore, lElScore, 0.85);
      } else if (handsTogether) {
        rawAction = 'HANDS_TOGETHER_CHEST';
        confidence = ((rWrScore || 0.8) + (lWrScore || 0.8)) / 2;
      } else if (rightHandLow && leftHandLow) {
        rawAction = 'HANDS_AT_REST';
        confidence = Math.max(0.88, pose.score || 0.90);
      } else {
        rawAction = 'HANDS_AT_REST';
        confidence = 0.82;
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
        },
        kinematics3D,
        isTrackingLost: false
      };
    } catch (err) {
      console.warn('Pose estimation frame error:', err);
      return null;
    }
  }
}

export const poseDetectionService = new PoseDetectionService();

