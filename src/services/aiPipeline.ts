import { 
  BoundingBox, 
  PoseKeypoint, 
  HandObjectInteraction, 
  ExperimentStep, 
  ExperimentProtocol 
} from '../types/mission';
import { ValidationResult } from './protocolEngine';


/**
 * Interface for Object Detection (e.g. YOLOv8 / ViT / Edge Quantized)
 */
export interface IObjectDetector {
  id: string;
  name: string;
  detect(
    input: HTMLCanvasElement | HTMLVideoElement | ImageData
  ): Promise<{ objects: BoundingBox[]; latencyMs: number }>;
}

/**
 * Interface for Human Pose Estimation (e.g. MoveNet / BlazePose / ZeroG-PoseNet)
 */
export interface IPoseEstimator {
  id: string;
  name: string;
  estimatePose(
    input: HTMLCanvasElement | HTMLVideoElement | ImageData
  ): Promise<{
    keypoints: PoseKeypoint[];
    score: number;
    jointAngles: {
      rightElbow: number;
      leftElbow: number;
      rightShoulder: number;
      leftShoulder: number;
      rightKnee: number;
      leftKnee: number;
    };
    latencyMs: number;
  }>;
}

/**
 * Interface for Hand-Object Interaction (HOI) Detection & Proximity Vector Engine
 */
export interface IHOIDetector {
  id: string;
  name: string;
  evaluateInteraction(
    keypoints: PoseKeypoint[],
    objects: BoundingBox[]
  ): HandObjectInteraction;
}

/**
 * Interface for Temporal Action Recognition (e.g. Action-Transformer / Rule Engine)
 */
export interface IActivityRecognizer {
  id: string;
  name: string;
  classifyAction(
    keypoints: PoseKeypoint[],
    jointAngles: Record<string, number>,
    hoi: HandObjectInteraction
  ): {
    actionName: string;
    confidence: number;
    isMicrogravityNormal: boolean;
  };
}

/**
 * Interface for Deterministic Protocol Sequence Engine (SOP State Machine)
 */
export interface ISequenceEngine {
  validateStepProgression(
    protocol: ExperimentProtocol,
    currentStepIndex: number,
    detectedAction: string,
    hoi: HandObjectInteraction
  ): ValidationResult;
}

/**
 * Concrete Default HOI Detector: Evaluates spatial Euclidean distances
 * between wrists/hands and payload rack object bounding boxes.
 */
export class DefaultHOIDetector implements IHOIDetector {
  id = 'space-hoi-spatial-v1';
  name = 'SpaceHOI Euclidean Proximity Engine';

  evaluateInteraction(
    keypoints: PoseKeypoint[],
    objects: BoundingBox[]
  ): HandObjectInteraction {
    const rightWrist = keypoints.find(k => k.name === 'right_wrist');
    const leftWrist = keypoints.find(k => k.name === 'left_wrist');

    let closestObj: BoundingBox | null = null;
    let minDistance = Infinity;
    let actingHand: 'LEFT' | 'RIGHT' | 'BOTH' = 'RIGHT';
    let startX = 0.5;
    let startY = 0.5;

    // Check right wrist proximity
    if (rightWrist && rightWrist.score > 0.3) {
      for (const obj of objects) {
        const objCenterX = obj.x + obj.width / 2;
        const objCenterY = obj.y + obj.height / 2;
        const dist = Math.hypot(rightWrist.x - objCenterX, rightWrist.y - objCenterY);

        if (dist < minDistance) {
          minDistance = dist;
          closestObj = obj;
          actingHand = 'RIGHT';
          startX = rightWrist.x;
          startY = rightWrist.y;
        }
      }
    }

    // Check left wrist proximity
    if (leftWrist && leftWrist.score > 0.3) {
      for (const obj of objects) {
        const objCenterX = obj.x + obj.width / 2;
        const objCenterY = obj.y + obj.height / 2;
        const dist = Math.hypot(leftWrist.x - objCenterX, leftWrist.y - objCenterY);

        if (dist < minDistance) {
          minDistance = dist;
          closestObj = obj;
          actingHand = 'LEFT';
          startX = leftWrist.x;
          startY = leftWrist.y;
        }
      }
    }

    // Contact threshold (e.g. within 0.18 normalized space)
    const isContact = minDistance < 0.18 && closestObj !== null;

    return {
      active: isContact,
      hand: actingHand,
      targetObject: closestObj ? closestObj.label : 'None',
      interactionType: isContact ? 'GRIP' : 'RESTING',
      gScore: isContact ? +(1 - minDistance * 2).toFixed(3) : 0.4,
      vector: closestObj ? {
        startX,
        startY,
        endX: closestObj.x + closestObj.width / 2,
        endY: closestObj.y + closestObj.height / 2
      } : { startX: 0.5, startY: 0.5, endX: 0.5, endY: 0.5 }
    };
  }
}

/**
 * Concrete Default Action Recognizer: Combines joint angles & HOI state
 */
export class DefaultActivityRecognizer implements IActivityRecognizer {
  id = 'space-action-transformer-edge';
  name = 'Edge Temporal Action Classifier';

  classifyAction(
    keypoints: PoseKeypoint[],
    jointAngles: Record<string, number>,
    hoi: HandObjectInteraction
  ): { actionName: string; confidence: number; isMicrogravityNormal: boolean } {
    const rightWrist = keypoints.find(k => k.name === 'right_wrist');
    const leftWrist = keypoints.find(k => k.name === 'left_wrist');
    const rightShoulder = keypoints.find(k => k.name === 'right_shoulder');
    const leftShoulder = keypoints.find(k => k.name === 'left_shoulder');

    const rightHandUp = rightWrist && rightShoulder && rightWrist.y < rightShoulder.y;
    const leftHandUp = leftWrist && leftShoulder && leftWrist.y < leftShoulder.y;

    if (hoi.active) {
      if (hoi.targetObject.toLowerCase().includes('rack') || hoi.targetObject.toLowerCase().includes('latch')) {
        return { actionName: 'OPEN_PAYLOAD_RACK', confidence: 0.95, isMicrogravityNormal: true };
      }
      if (hoi.targetObject.toLowerCase().includes('sample') || hoi.targetObject.toLowerCase().includes('vial')) {
        return { actionName: 'COLLECT_SAMPLE', confidence: 0.94, isMicrogravityNormal: true };
      }
      if (hoi.targetObject.toLowerCase().includes('clean') || hoi.targetObject.toLowerCase().includes('wipe') || hoi.targetObject.toLowerCase().includes('area')) {
        return { actionName: 'CLEAN_SAMPLE_AREA', confidence: 0.93, isMicrogravityNormal: true };
      }
      if (hoi.targetObject.toLowerCase().includes('cartridge')) {
        return { actionName: 'INSTALL_SAMPLE_CARTRIDGE', confidence: 0.96, isMicrogravityNormal: true };
      }
      if (hoi.targetObject.toLowerCase().includes('seal')) {
        return { actionName: 'SEAL_CARTRIDGE', confidence: 0.95, isMicrogravityNormal: true };
      }
      return { actionName: `INTERACT_${hoi.targetObject.toUpperCase()}`, confidence: 0.88, isMicrogravityNormal: true };
    }

    if (rightHandUp && leftHandUp) {
      return { actionName: 'RAISE_BOTH_HANDS', confidence: 0.96, isMicrogravityNormal: true };
    }
    if (rightHandUp) {
      return { actionName: 'RAISE_RIGHT_HAND', confidence: 0.94, isMicrogravityNormal: true };
    }
    if (leftHandUp) {
      return { actionName: 'RAISE_LEFT_HAND', confidence: 0.92, isMicrogravityNormal: true };
    }

    return { actionName: 'HANDS_AT_REST', confidence: 0.91, isMicrogravityNormal: true };
  }
}

/**
 * Export Singleton Pipeline Factory
 */
export const defaultHOIDetector = new DefaultHOIDetector();
export const defaultActivityRecognizer = new DefaultActivityRecognizer();
