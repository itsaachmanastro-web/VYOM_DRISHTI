import { ExperimentProtocol, MissionLogEvent, VoiceAlertItem, TelemetryMetrics, ModelTelemetry } from '../types/mission';
import { getCanonicalProtocols } from '../data/canonicalExperiments';

export const EXPERIMENT_PROTOCOLS: ExperimentProtocol[] = getCanonicalProtocols();

export const INITIAL_TELEMETRY: TelemetryMetrics = {
  missionId: 'BAS-EXP-2026-ALPHA',
  experimentId: 'BAS-DEMO-01',
  metSeconds: 15732,
  edgeCpuLoad: 24.8,
  edgeNpuLoad: 68.2,
  edgeFps: 29.8,
  edgeLatencyMs: 18.4,
  cameraStatus: 'ONLINE',
  localDiskFreeGb: 412.6,
  localDiskTotalGb: 512.0,
  networkStatus: 'LOW_BW_UPLINK',
  uplinkBandwidthKbps: 2.4,
  rawStreamBandwidthMbps: 45.0,
  bandwidthSavingsPercent: 94.6,
  activeCameraId: 'CAM-01-PAYLOAD-FRONT'
};

export const INITIAL_MODEL_TELEMETRY: ModelTelemetry = {
  humanDetector: {
    name: 'YOLOv8n-Space-Quant (INT8) / MoveNet',
    latencyMs: 4.8,
    confidence: 0.982,
    quant: 'INT8',
    status: 'ACTIVE'
  },
  poseEstimator: {
    name: 'ZeroG-PoseNet (17 Keypoints, Orientation-Agnostic)',
    latencyMs: 6.2,
    jointsTracked: 17,
    orientation: 'PITCH: -14.2° | ROLL: +8.5° | YAW: 42.1°',
    status: 'ACTIVE'
  },
  objectDetector: {
    name: 'SpaceObject-ViT-Edge',
    latencyMs: 5.1,
    detectedCount: 4,
    status: 'ACTIVE'
  },
  hoiEngine: {
    name: 'SpaceHOI-SpatialGNN (Contact & Proximity Engine)',
    latencyMs: 3.9,
    activeInteractions: 1,
    status: 'ACTIVE'
  },
  actionRecognizer: {
    name: 'TemporalAction-Transformer (Sliding Window 64F)',
    latencyMs: 8.4,
    topPrediction: 'CONTAINER_REACH_PICKUP',
    probability: 0.964,
    status: 'ACTIVE'
  },
  hmr3dModel: {
    name: 'Orientation-Agnostic 3D HMR (Mesh Kinematics)',
    latencyMs: 9.1,
    meshVertices: 6890,
    zeroGDriftRate: 0.012,
    status: 'ACTIVE'
  }
};

export const INITIAL_LOGS: MissionLogEvent[] = [
  {
    id: 'log-001',
    timestamp: '2026-09-27T13:30:00.124Z',
    metTimestamp: 'T+04:15:00',
    event: 'Payload Rack EXPRESS-01 Power Bus Online',
    category: 'SYSTEM',
    severity: 'INFO',
    confidence: 1.0,
    source: 'BAS_POWER_MGMT',
    hashSeal: '9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e'
  },
  {
    id: 'log-002',
    timestamp: '2026-09-27T13:31:12.450Z',
    metTimestamp: 'T+04:16:12',
    event: 'Edge NPU Vision Pipeline Initialized [MoveNet & INT8 Quantized Models Loaded]',
    category: 'AI_PERCEPTION',
    severity: 'INFO',
    confidence: 0.998,
    source: 'EDGE_NPU_CORE_0',
    hashSeal: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0'
  },
  {
    id: 'log-003',
    timestamp: '2026-09-27T13:32:05.110Z',
    metTimestamp: 'T+04:17:05',
    event: 'Camera CAM-01 (RGB/Depth) Locked to Payload Rack C4 Coordinate Origin',
    category: 'CAMERA',
    severity: 'INFO',
    confidence: 0.985,
    source: 'CAM_DRIVER_01',
    hashSeal: 'e0d1c2b3a4f5968778695a4b3c2d1e0ff0e1d2c3b4a5968778695a4b3c2d1e0f'
  },
  {
    id: 'log-004',
    timestamp: '2026-09-27T13:33:40.820Z',
    metTimestamp: 'T+04:18:40',
    event: 'Astronaut detected in workspace. Pose tracking locked with 17 keypoints.',
    category: 'AI_PERCEPTION',
    severity: 'INFO',
    confidence: 0.974,
    source: 'ZEROG_POSENET',
    hashSeal: '87654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba09'
  },
  {
    id: 'log-005',
    timestamp: '2026-09-27T13:34:22.310Z',
    metTimestamp: 'T+04:19:22',
    event: 'Step 01 Validated: Operator calibrated at station origin.',
    category: 'EXPERIMENT_ENGINE',
    severity: 'INFO',
    confidence: 0.968,
    source: 'SEQ_VALIDATOR_V2',
    hashSeal: '543210abcdef9876543210abcdef9876543210abcdef9876543210abcdef9876'
  }
];

export const INITIAL_ALERTS: VoiceAlertItem[] = [
  {
    id: 'alert-01',
    timestamp: 'T+04:19:22',
    title: 'Step 01 Verified',
    message: 'Operator baseline stance calibrated at station origin.',
    severity: 'INFO',
    spokenText: 'Step 01 completed. Operator calibrated.',
    stepNumber: 1,
    acknowledged: true,
    soundType: 'SUCCESS'
  },
  {
    id: 'alert-02',
    timestamp: 'T+04:20:00',
    title: 'Next Step Advisory',
    message: 'Raise hand into upper rack zone to retrieve cryo-sample container.',
    severity: 'INFO',
    spokenText: 'Proceed to Step 02: Reach upward for sample container.',
    stepNumber: 2,
    acknowledged: true,
    soundType: 'CHIME'
  }
];
