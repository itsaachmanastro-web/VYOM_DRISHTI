import { 
  DatasetManifest, 
  DatasetSequence, 
  MultimodalDatasetSample, 
  PoseKeypoint,
  StepStatus 
} from '../types/mission';

/**
 * Standard 5-step sequence definition for "Sample Cartridge Installation" (BAS-SCI-01)
 */
export const SAMPLE_CARTRIDGE_STEPS = [
  { stepNumber: 1, stepCode: 'SCI-STP-01', name: 'Open Payload Rack', action: 'OPEN_PAYLOAD_RACK', object: 'Payload-Rack-Latch-C4' },
  { stepNumber: 2, stepCode: 'SCI-STP-02', name: 'Collect Sample', action: 'COLLECT_SAMPLE', object: 'Biological-Sample-Vial-A' },
  { stepNumber: 3, stepCode: 'SCI-STP-03', name: 'Clean Sample Area', action: 'CLEAN_SAMPLE_AREA', object: 'Ultrasonic-Cleaner-Stage' },
  { stepNumber: 4, stepCode: 'SCI-STP-04', name: 'Install Sample Cartridge', action: 'INSTALL_SAMPLE_CARTRIDGE', object: 'Microfluidic-Cartridge-Dock' },
  { stepNumber: 5, stepCode: 'SCI-STP-05', name: 'Seal Cartridge', action: 'SEAL_CARTRIDGE', object: 'Hermetic-Seal-Clamps' }
];

/**
 * Helper to generate synthetic MoveNet 17 keypoints
 */
function generateKeypoints(stepIdx: number, progress: number, noise: number = 0.01): PoseKeypoint[] {
  const n = () => (Math.random() - 0.5) * noise;
  
  // Base torso positions
  const nose = { name: 'nose', x: 0.50 + n(), y: 0.28 + n(), score: 0.98 };
  const leftEye = { name: 'left_eye', x: 0.48 + n(), y: 0.26 + n(), score: 0.98 };
  const rightEye = { name: 'right_eye', x: 0.52 + n(), y: 0.26 + n(), score: 0.98 };
  const leftShoulder = { name: 'left_shoulder', x: 0.42 + n(), y: 0.36 + n(), score: 0.96 };
  const rightShoulder = { name: 'right_shoulder', x: 0.58 + n(), y: 0.36 + n(), score: 0.97 };
  const leftHip = { name: 'left_hip', x: 0.44 + n(), y: 0.64 + n(), score: 0.94 };
  const rightHip = { name: 'right_hip', x: 0.56 + n(), y: 0.64 + n(), score: 0.94 };
  const leftKnee = { name: 'left_knee', x: 0.43 + n(), y: 0.78 + n(), score: 0.91 };
  const rightKnee = { name: 'right_knee', x: 0.57 + n(), y: 0.78 + n(), score: 0.92 };
  const leftAnkle = { name: 'left_ankle', x: 0.42 + n(), y: 0.90 + n(), score: 0.88 };
  const rightAnkle = { name: 'right_ankle', x: 0.58 + n(), y: 0.90 + n(), score: 0.89 };

  // Arms dynamic trajectory based on step
  let rWristY = 0.50;
  let rWristX = 0.62;
  let rElbowY = 0.45;
  let rElbowX = 0.60;

  if (stepIdx === 0) {
    // Open Rack (upper right reach)
    rWristY = 0.32 - Math.sin(progress * Math.PI) * 0.08;
    rWristX = 0.68 + Math.cos(progress * Math.PI) * 0.04;
    rElbowY = 0.38;
    rElbowX = 0.64;
  } else if (stepIdx === 1) {
    // Collect Sample (mid-center reach)
    rWristY = 0.48 - Math.sin(progress * Math.PI) * 0.05;
    rWristX = 0.54 + Math.sin(progress * Math.PI) * 0.04;
    rElbowY = 0.46;
    rElbowX = 0.58;
  } else if (stepIdx === 2) {
    // Clean Sample Area (lateral sweep motion)
    rWristY = 0.52;
    rWristX = 0.48 + Math.sin(progress * Math.PI * 2) * 0.10;
    rElbowY = 0.48;
    rElbowX = 0.55;
  } else if (stepIdx === 3) {
    // Install Cartridge (precise insert at center)
    rWristY = 0.46 + Math.sin(progress * Math.PI) * 0.03;
    rWristX = 0.52;
    rElbowY = 0.44;
    rElbowX = 0.58;
  } else if (stepIdx === 4) {
    // Seal Cartridge (two-hand clamp press)
    rWristY = 0.44;
    rWristX = 0.54;
    rElbowY = 0.42;
    rElbowX = 0.60;
  }

  const leftWrist = { name: 'left_wrist', x: 0.38 + n(), y: 0.52 + n(), score: 0.94 };
  const leftElbow = { name: 'left_elbow', x: 0.40 + n(), y: 0.44 + n(), score: 0.95 };
  const rightElbow = { name: 'right_elbow', x: rElbowX + n(), y: rElbowY + n(), score: 0.96 };
  const rightWrist = { name: 'right_wrist', x: rWristX + n(), y: rWristY + n(), score: 0.97 };

  return [
    nose, leftEye, rightEye,
    leftShoulder, rightShoulder,
    leftElbow, rightElbow,
    leftWrist, rightWrist,
    leftHip, rightHip,
    leftKnee, rightKnee,
    leftAnkle, rightAnkle
  ];
}

/**
 * Generate a complete sequence with specified step order and timing
 */
export function generateSequence(
  sequenceId: string,
  type: 'SUCCESS' | 'OUT_OF_SEQUENCE' | 'SKIPPED_STEP' | 'INCORRECT_ACTION',
  description: string,
  stepOrder: number[], // 1-indexed steps
  options?: {
    framesPerStep?: number;
    fps?: number;
    cameraAngle?: 'FRONT_RACK' | 'OBLIQUE_TOP' | 'SIDE_BAY';
    astronautOrientation?: 'NORMAL_UPRIGHT' | 'INVERTED_PITCH' | 'LATERAL_ROLL';
    noiseRatio?: number;
  }
): DatasetSequence {
  const framesPerStep = options?.framesPerStep || 45; // 1.5s per step at 30 fps
  const fps = options?.fps || 30;
  const cameraAngle = options?.cameraAngle || 'FRONT_RACK';
  const astronautOrientation = options?.astronautOrientation || 'NORMAL_UPRIGHT';
  const noiseRatio = options?.noiseRatio || 0.01;

  const samples: MultimodalDatasetSample[] = [];
  const stepTransitions: DatasetSequence['stepTransitions'] = [];

  let currentGlobalFrame = 0;

  stepOrder.forEach((stepNum, idx) => {
    const stepDef = SAMPLE_CARTRIDGE_STEPS.find(s => s.stepNumber === stepNum) || SAMPLE_CARTRIDGE_STEPS[0];
    const startFrame = currentGlobalFrame;

    let status: StepStatus = 'COMPLETED';
    let isCompliant = true;

    if (type === 'OUT_OF_SEQUENCE' && idx === 2 && stepNum === 4) {
      status = 'OUT_OF_SEQUENCE';
      isCompliant = false;
    } else if (type === 'SKIPPED_STEP' && idx === 2 && stepNum === 4) {
      status = 'SKIPPED';
      isCompliant = false;
    } else if (type === 'INCORRECT_ACTION') {
      status = 'REPEATED';
      isCompliant = false;
    }

    for (let f = 0; f < framesPerStep; f++) {
      const progress = f / framesPerStep;
      const frameId = currentGlobalFrame++;
      const timestampMs = Math.round((frameId / fps) * 1000);

      const keypoints = generateKeypoints(stepNum - 1, progress, noiseRatio);
      const rWrist = keypoints.find(k => k.name === 'right_wrist')!;

      // Synthetic object bounding box
      const targetObjBox = {
        id: `obj-${stepDef.object.toLowerCase()}`,
        name: stepDef.object,
        x: stepNum === 1 ? 0.65 : stepNum === 2 ? 0.52 : stepNum === 3 ? 0.45 : 0.50,
        y: stepNum === 1 ? 0.30 : stepNum === 2 ? 0.46 : stepNum === 3 ? 0.50 : 0.44,
        width: 0.15,
        height: 0.18,
        confidence: 0.96
      };

      const dist3d = Math.hypot(rWrist.x - (targetObjBox.x + 0.075), rWrist.y - (targetObjBox.y + 0.09));

      const sample: MultimodalDatasetSample = {
        frameId,
        timestampMs,
        stepNumber: stepNum,
        stepCode: stepDef.stepCode,
        astronautBoundingBox: {
          x: 0.35,
          y: 0.20,
          width: 0.30,
          height: 0.72,
          confidence: +(0.97 + (Math.random() - 0.5) * 0.02).toFixed(3)
        },
        poseKeypoints: keypoints,
        jointAngles: {
          rightElbow: Math.round(135 + Math.sin(progress * Math.PI) * 25),
          leftElbow: 140,
          rightShoulder: Math.round(50 + Math.cos(progress * Math.PI) * 20),
          leftShoulder: 45,
          rightKnee: 175,
          leftKnee: 172
        },
        detectedObjects: [
          targetObjBox,
          { id: 'rack-frame-01', name: 'EXPRESS-RACK-04', x: 0.25, y: 0.10, width: 0.55, height: 0.85, confidence: 0.99 }
        ],
        hoiVector: {
          active: dist3d < 0.15,
          hand: 'RIGHT',
          targetObject: stepDef.object,
          distance3dMeters: +(dist3d * 1.8).toFixed(3),
          startX: rWrist.x,
          startY: rWrist.y,
          endX: targetObjBox.x + 0.075,
          endY: targetObjBox.y + 0.09
        },
        actionLabel: stepDef.action,
        actionConfidence: +(0.95 + (Math.random() - 0.5) * 0.04).toFixed(3),
        isStandardCompliant: isCompliant,
        cameraViewAngle: cameraAngle,
        astronautOrientation
      };

      samples.push(sample);
    }

    const endFrame = currentGlobalFrame - 1;
    stepTransitions.push({
      stepNumber: stepNum,
      stepCode: stepDef.stepCode,
      startFrame,
      endFrame,
      status
    });
  });

  return {
    sequenceId,
    type,
    description,
    protocolCode: 'BAS-SCI-01',
    totalFrames: samples.length,
    fps,
    stepTransitions,
    samples,
    metadata: {
      astronautOrientation,
      ambientLightingLux: 450,
      sensorNoiseRatio: noiseRatio,
      generatedAt: new Date().toISOString()
    }
  };
}

/**
 * Generate Dataset A (Success Sequences)
 */
export function generateDatasetA(): DatasetManifest {
  const seq1 = generateSequence(
    'SUCCESS_001',
    'SUCCESS',
    'Nominal baseline sequence (1->2->3->4->5) at standard speed and front camera view',
    [1, 2, 3, 4, 5],
    { framesPerStep: 45, cameraAngle: 'FRONT_RACK', astronautOrientation: 'NORMAL_UPRIGHT' }
  );

  const seq2 = generateSequence(
    'SUCCESS_002',
    'SUCCESS',
    'Fast nominal sequence (1->2->3->4->5) with 15° microgravity roll tilt and oblique angle',
    [1, 2, 3, 4, 5],
    { framesPerStep: 30, cameraAngle: 'OBLIQUE_TOP', astronautOrientation: 'LATERAL_ROLL', noiseRatio: 0.015 }
  );

  return {
    datasetId: 'DATASET-A-SUCCESS',
    name: 'Dataset A: Verified Successful Sequences',
    category: 'A_SUCCESS',
    totalSequences: 2,
    totalFrames: seq1.totalFrames + seq2.totalFrames,
    sequences: [seq1, seq2],
    createdAt: new Date().toISOString()
  };
}

/**
 * Generate Dataset B (Failure Sequences: Out of Sequence & Skipped)
 */
export function generateDatasetB(): DatasetManifest {
  const seq1 = generateSequence(
    'FAILURE_001_OUT_OF_SEQUENCE',
    'OUT_OF_SEQUENCE',
    'Procedural error: Step 4 executed before Step 3 (1 -> 2 -> 4 -> 3 -> 5)',
    [1, 2, 4, 3, 5],
    { framesPerStep: 40, cameraAngle: 'FRONT_RACK' }
  );

  const seq2 = generateSequence(
    'FAILURE_002_SKIPPED_STEP',
    'SKIPPED_STEP',
    'Procedural omission: Step 3 (Clean Area) completely skipped (1 -> 2 -> 4 -> 5)',
    [1, 2, 4, 5],
    { framesPerStep: 40, cameraAngle: 'SIDE_BAY' }
  );

  return {
    datasetId: 'DATASET-B-FAILURE',
    name: 'Dataset B: Procedural Deviations (Out-of-Sequence & Skipped)',
    category: 'B_FAILURE',
    totalSequences: 2,
    totalFrames: seq1.totalFrames + seq2.totalFrames,
    sequences: [seq1, seq2],
    createdAt: new Date().toISOString()
  };
}

/**
 * Generate Dataset C (Incorrect Action / Unknown)
 */
export function generateDatasetC(): DatasetManifest {
  const seq1 = generateSequence(
    'INCORRECT_001_WRONG_OBJECT',
    'INCORRECT_ACTION',
    'Safety hazard: Operator touched emergency vent valve instead of sample cartridge',
    [1, 2, 1, 4, 5],
    { framesPerStep: 40, cameraAngle: 'FRONT_RACK' }
  );

  const seq2 = generateSequence(
    'INCORRECT_002_UNSTABLE_POSE',
    'INCORRECT_ACTION',
    'High angular velocity: Operator loss of footing in zero-g during cartridge insertion',
    [1, 2, 3, 2, 5],
    { framesPerStep: 35, cameraAngle: 'OBLIQUE_TOP', astronautOrientation: 'INVERTED_PITCH', noiseRatio: 0.03 }
  );

  return {
    datasetId: 'DATASET-C-INCORRECT',
    name: 'Dataset C: Anomalous Actions & Kinematic Instability',
    category: 'C_INCORRECT',
    totalSequences: 2,
    totalFrames: seq1.totalFrames + seq2.totalFrames,
    sequences: [seq1, seq2],
    createdAt: new Date().toISOString()
  };
}

/**
 * Export Utilities
 */
export function exportDatasetAsJSON(manifest: DatasetManifest): string {
  return JSON.stringify(manifest, null, 2);
}

export function exportDatasetAsJSONL(manifest: DatasetManifest): string {
  const lines: string[] = [];
  manifest.sequences.forEach(seq => {
    seq.samples.forEach(sample => {
      lines.push(JSON.stringify({
        datasetId: manifest.datasetId,
        sequenceId: seq.sequenceId,
        sequenceType: seq.type,
        ...sample
      }));
    });
  });
  return lines.join('\n');
}

export function exportDatasetAsCSV(manifest: DatasetManifest): string {
  const headers = [
    'SequenceId',
    'SequenceType',
    'FrameId',
    'TimestampMs',
    'StepNumber',
    'StepCode',
    'ActionLabel',
    'ActionConfidence',
    'IsCompliant',
    'HOI_Target',
    'HOI_Active',
    'HOI_DistanceM',
    'RightElbowAngle',
    'LeftElbowAngle',
    'AstronautBBox_X',
    'AstronautBBox_Y',
    'CameraAngle',
    'Orientation'
  ];

  const rows: string[] = [headers.join(',')];

  manifest.sequences.forEach(seq => {
    seq.samples.forEach(s => {
      rows.push([
        seq.sequenceId,
        seq.type,
        s.frameId,
        s.timestampMs,
        s.stepNumber,
        s.stepCode,
        s.actionLabel,
        s.actionConfidence,
        s.isStandardCompliant ? '1' : '0',
        `"${s.hoiVector.targetObject}"`,
        s.hoiVector.active ? '1' : '0',
        s.hoiVector.distance3dMeters,
        s.jointAngles.rightElbow,
        s.jointAngles.leftElbow,
        s.astronautBoundingBox.x,
        s.astronautBoundingBox.y,
        s.cameraViewAngle,
        s.astronautOrientation
      ].join(','));
    });
  });

  return rows.join('\n');
}

export function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
