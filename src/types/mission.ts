export type SeverityLevel = 'INFO' | 'WARNING' | 'SEQUENCE ERROR' | 'CRITICAL';

export type StepStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED' | 'OUT_OF_SEQUENCE' | 'REPEATED';

export type ValidationState = 
  | 'IDLE'
  | 'ACTIVE'
  | 'VERIFYING'
  | 'CORRECT'
  | 'INCORRECT'
  | 'SKIPPED'
  | 'OUT_OF_SEQUENCE'
  | 'RETRY_REQUIRED'
  | 'COMPLETED';

export interface BoundingBox {
  id: string;
  label: string;
  category: 'HUMAN' | 'TOOL' | 'VIAL' | 'EQUIPMENT' | 'CONTAINER';
  confidence: number;
  x: number; // 0-1 percentage
  y: number; // 0-1 percentage
  width: number;
  height: number;
  color?: string;
}

export interface PoseKeypoint {
  name: string;
  x: number;
  y: number;
  score: number;
  z3d?: number;
}

export interface HandObjectInteraction {
  active: boolean;
  hand: 'LEFT' | 'RIGHT' | 'BOTH';
  targetObject: string;
  interactionType: 'GRIP' | 'HOLDING' | 'INSERTING' | 'PIPETTING' | 'SWAPPING' | 'SCANNING' | 'LID_OPEN' | 'LID_CLOSE' | 'REACHING' | 'RESTING';
  gScore: number; // 0 to 1 confidence
  vector: { startX: number; startY: number; endX: number; endY: number };
}

export interface ExperimentStep {
  stepNumber: number;
  stepCode: string;
  title: string;
  expectedAction: string;
  targetObject: string;
  durationEstimateSec: number;
  safetyRequirement: string;
  scientificRationale: string;
  voicePrompt: string;
  validationRules: {
    requiredObjects: string[];
    requiredHandInteraction: string;
    requiredKinematicAction?: string;
    forbiddenActions?: string[];
  };
}

export interface StepExecutionRecord {
  stepNumber: number;
  stepCode: string;
  title: string;
  expectedAction: string;
  recognizedAction: string;
  status: StepStatus;
  validationState: ValidationState;
  startTime: string;
  endTime?: string;
  confidence: number;
  detectedObjects: string[];
  notes: string;
  deviationReason?: string;
  voiceAlertIssued?: string;
  durationSec: number;
}

export interface ExperimentProtocol {
  id: string;
  code: string;
  name: string;
  category: 'BIOLOGICAL' | 'CRYSTALLOGRAPHY' | 'PHYSICAL_SCIENCES' | 'CELL_CULTURE';
  rackLocation: string;
  principalInvestigator: string;
  description: string;
  totalSteps: number;
  steps: ExperimentStep[];
  hazardLevel: 'LOW' | 'BIO-SAFETY-1' | 'BIO-SAFETY-2' | 'THERMAL';
}

export interface MissionLogEvent {
  id: string;
  timestamp: string;
  metTimestamp: string;
  event: string;
  category: 'AI_PERCEPTION' | 'EXPERIMENT_ENGINE' | 'CAMERA' | 'VOICE_ALERT' | 'SYSTEM' | 'GROUND_UPLINK' | 'MISSION_AI';
  severity: SeverityLevel;
  confidence: number;
  source: string;
  details?: Record<string, any>;
  hashSeal?: string;
}

export interface VoiceAlertItem {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  severity: SeverityLevel;
  spokenText: string;
  stepNumber?: number;
  acknowledged: boolean;
  soundType: 'CHIME' | 'WARNING_BEEP' | 'ALARM' | 'SUCCESS';
}

export interface TelemetryMetrics {
  missionId: string;
  experimentId: string;
  metSeconds: number;
  edgeCpuLoad: number;
  edgeNpuLoad: number;
  edgeFps: number;
  edgeLatencyMs: number;
  cameraStatus: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  localDiskFreeGb: number;
  localDiskTotalGb: number;
  networkStatus: 'ORBITAL_PASS' | 'BLACKOUT' | 'LOW_BW_UPLINK';
  uplinkBandwidthKbps: number;
  rawStreamBandwidthMbps: number;
  bandwidthSavingsPercent: number;
  activeCameraId: string;
}

export interface ModelTelemetry {
  humanDetector: { name: string; latencyMs: number; confidence: number; quant: 'INT8' | 'FP16'; status: 'ACTIVE' | 'IDLE' };
  poseEstimator: { name: string; latencyMs: number; jointsTracked: number; orientation: string; status: 'ACTIVE' | 'IDLE' };
  objectDetector: { name: string; latencyMs: number; detectedCount: number; status: 'ACTIVE' | 'IDLE' };
  hoiEngine: { name: string; latencyMs: number; activeInteractions: number; status: 'ACTIVE' | 'IDLE' };
  actionRecognizer: { name: string; latencyMs: number; topPrediction: string; probability: number; status: 'ACTIVE' | 'IDLE' };
  hmr3dModel: { name: string; latencyMs: number; meshVertices: number; zeroGDriftRate: number; status: 'ACTIVE' | 'IDLE' };
}

export interface JointTelemetryData {
  id: string;
  name: string;
  angle: number;
  previousAngle: number;
  deltaAngle: number;
  angularVelocity: number; // rad/s or deg/s
  position: [number, number, number];
  movementType: 'Flexion' | 'Extension' | 'Abduction' | 'Adduction' | 'Neutral' | 'Static';
  confidence: number;
  timestamp: string;
}

export type VideoSourceType = 'WEBCAM' | 'VIDEO_FILE' | 'SIMULATION' | 'RTSP';

export type OrientationReferenceFrame = 'PAYLOAD_RACK' | 'WORLD';

export type RecordingStatus = 'IDLE' | 'RECORDING' | 'PAUSED' | 'SAVED';

export type StreamingStatus = 'DISCONNECTED' | 'CONNECTING' | 'STREAMING' | 'ERROR';

export interface MultimodalDatasetSample {
  frameId: number;
  timestampMs: number;
  stepNumber: number;
  stepCode: string;
  astronautBoundingBox: { x: number; y: number; width: number; height: number; confidence: number };
  poseKeypoints: PoseKeypoint[];
  jointAngles: {
    rightElbow: number;
    leftElbow: number;
    rightShoulder: number;
    leftShoulder: number;
    rightKnee: number;
    leftKnee: number;
  };
  detectedObjects: { id: string; name: string; x: number; y: number; width: number; height: number; confidence: number }[];
  hoiVector: {
    active: boolean;
    hand: 'LEFT' | 'RIGHT' | 'BOTH';
    targetObject: string;
    distance3dMeters: number;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  };
  actionLabel: string;
  actionConfidence: number;
  isStandardCompliant: boolean;
  cameraViewAngle: 'FRONT_RACK' | 'OBLIQUE_TOP' | 'SIDE_BAY';
  astronautOrientation: 'NORMAL_UPRIGHT' | 'INVERTED_PITCH' | 'LATERAL_ROLL';
}

export interface DatasetSequence {
  sequenceId: string;
  type: 'SUCCESS' | 'OUT_OF_SEQUENCE' | 'SKIPPED_STEP' | 'INCORRECT_ACTION';
  description: string;
  protocolCode: string;
  totalFrames: number;
  fps: number;
  stepTransitions: { stepNumber: number; stepCode: string; startFrame: number; endFrame: number; status: StepStatus }[];
  samples: MultimodalDatasetSample[];
  metadata: {
    astronautOrientation: string;
    ambientLightingLux: number;
    sensorNoiseRatio: number;
    generatedAt: string;
  };
}

export interface DatasetManifest {
  datasetId: string;
  name: string;
  category: 'A_SUCCESS' | 'B_FAILURE' | 'C_INCORRECT';
  totalSequences: number;
  totalFrames: number;
  sequences: DatasetSequence[];
  createdAt: string;
}

export interface TrajectoryPoint {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  sender: 'USER' | 'MISSION_AI';
  text: string;
  timestamp: string;
  contextTag?: string;
  source?: 'LOCAL MISSION CONTEXT' | 'LOCAL KNOWLEDGE BASE' | 'LIVE ACTIVITY MODEL';
  provenanceLabel?: string;
}

export type StepMachineState = 
  | 'WAITING'
  | 'POSITIONING'
  | 'VERIFYING'
  | 'VERIFIED'
  | 'COOLDOWN'
  | 'INCORRECT';

export interface CompletedStepHistoryItem {
  stepNumber: number;
  stepCode: string;
  title: string;
  expectedAction: string;
  recognizedAction: string;
  completedAt: string;
  confidence: number;
  durationSec: number;
}

