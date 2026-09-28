import { create } from 'zustand';
import { 
  ExperimentProtocol, 
  StepExecutionRecord, 
  BoundingBox, 
  PoseKeypoint, 
  HandObjectInteraction, 
  MissionLogEvent, 
  VoiceAlertItem, 
  TelemetryMetrics, 
  ModelTelemetry,
  ValidationState,
  StepStatus,
  TrajectoryPoint,
  ChatMessage,
  StepMachineState,
  CompletedStepHistoryItem,
  VideoSourceType,
  OrientationReferenceFrame,
  RecordingStatus,
  StreamingStatus,
  DatasetManifest,
  DatasetSequence
} from '../types/mission';
import { AuthSession, AuthStatus } from '../types/auth';
import { NotificationItem, NotificationType } from '../types/notification';
import { 
  EXPERIMENT_PROTOCOLS, 
  INITIAL_TELEMETRY, 
  INITIAL_MODEL_TELEMETRY, 
  INITIAL_LOGS, 
  INITIAL_ALERTS 
} from '../services/mockData';
import { ProtocolEngine, ValidationResult } from '../services/protocolEngine';
import { audioService } from '../services/audioService';
import { MissionAiService, MissionAiContext } from '../services/missionAiService';
import { temporalValidator } from '../services/temporalValidator';
import { geminiService, GeminiConfig, ConnectionTestResult } from '../services/geminiService';
import { 
  generateDatasetA, 
  generateDatasetB, 
  generateDatasetC,
  exportDatasetAsJSON,
  exportDatasetAsJSONL,
  exportDatasetAsCSV,
  downloadFile
} from '../services/datasetGenerator';
import { videoRecorderService } from '../services/videoRecorderService';
import { streamManagerService } from '../services/streamManagerService';
import { localMissionAssistant } from '../services/localMissionAssistant';
import { localStorageService } from '../services/localStorageService';
import { connectionManager, ConnectionState } from '../services/connectionManager';
import { aiRouter } from '../services/aiRouter';
import { indexedDbService } from '../services/indexedDbService';
import { authService } from '../services/authService';
import { notificationService } from '../services/notificationService';


interface MissionState {
  // Navigation & View
  currentView: 'landing' | 'login' | 'overview' | 'live-monitor' | 'sequence' | 'perception' | 'assistant' | 'alerts' | 'hmr-3d' | 'logs' | 'analytics' | 'uplink' | 'health' | 'dataset' | 'docs' | 'model-lab';
  setCurrentView: (view: MissionState['currentView']) => void;

  // Authentication & Session
  session: AuthSession | null;
  authStatus: AuthStatus;
  authError: string | null;
  login: (missionId: string, credential: string, rememberDevice?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkSession: () => AuthSession | null;

  // Real-Time Event Notifications
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  addNotification: (item: { title: string; message: string; type: NotificationType; actionLink?: string; sourceModule: string }) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;

  // Active Protocol
  protocols: ExperimentProtocol[];
  activeProtocol: ExperimentProtocol;
  setActiveProtocol: (protocolId: string) => void;
  currentStepIndex: number; // 0-based
  setCurrentStepIndex: (index: number) => void;

  // Step Execution Records
  executionRecords: StepExecutionRecord[];
  
  // Video Ingestion & Sources
  videoSourceType: VideoSourceType;
  videoSourceUrl: string | null;
  uploadedVideoFile: File | null;
  setVideoSource: (type: VideoSourceType, url?: string, file?: File) => void;

  // Real-time AI Perception State
  isSimulating: boolean;
  simulationSpeed: number;
  boundingBoxes: BoundingBox[];
  poseKeypoints: PoseKeypoint[];
  hoiInteraction: HandObjectInteraction;
  currentActionName: string;
  actionConfidence: number;
  validationResult: ValidationResult;

  // 3D Digital Twin Coordinate System
  orientationReferenceFrame: OrientationReferenceFrame;
  setOrientationReferenceFrame: (frame: OrientationReferenceFrame) => void;

  // Local Recording & Storage
  isRecording: boolean;
  recordingStatus: RecordingStatus;
  recordingDurationSec: number;
  recordedBytes: number;
  startLocalRecording: (canvasOrStream: HTMLCanvasElement | MediaStream) => boolean;
  stopLocalRecording: () => Promise<any>;

  // IP Streaming / RTSP Manager
  isStreaming: boolean;
  streamEndpoint: string;
  streamingStatus: StreamingStatus;
  startStreaming: () => Promise<void>;
  stopStreaming: () => void;
  setStreamEndpoint: (url: string) => void;

  // Multimodal Datasets & Replay Engine
  datasets: {
    datasetA: DatasetManifest;
    datasetB: DatasetManifest;
    datasetC: DatasetManifest;
  };
  activeDatasetCategory: 'A' | 'B' | 'C';
  activeSequenceIndex: number;
  isDatasetReplaying: boolean;
  replayProgress: number;
  setActiveDatasetCategory: (category: 'A' | 'B' | 'C') => void;
  setActiveSequenceIndex: (idx: number) => void;
  generateFreshDatasets: () => void;
  startDatasetReplay: (seq?: DatasetSequence) => void;
  stopDatasetReplay: () => void;
  exportActiveDataset: (format: 'JSON' | 'JSONL' | 'CSV') => void;

  // Telemetry & Hardware
  telemetry: TelemetryMetrics;
  modelTelemetry: ModelTelemetry;
  activeCamera: string;
  isWebcamActive: boolean;
  setActiveCamera: (camId: string) => void;
  setIsWebcamActive: (active: boolean) => void;

  // Logs & Alerts
  logs: MissionLogEvent[];
  alerts: VoiceAlertItem[];
  addLogEvent: (event: Omit<MissionLogEvent, 'id' | 'timestamp' | 'metTimestamp'>) => void;
  triggerAlert: (alert: Omit<VoiceAlertItem, 'id' | 'timestamp' | 'acknowledged'>) => void;
  acknowledgeAlert: (alertId: string) => void;
  clearAllAlerts: () => void;

  // Audio Settings
  isAudioMuted: boolean;
  isVoiceGuidanceEnabled: boolean;
  toggleAudioMute: () => void;
  toggleVoiceGuidance: () => void;
  stopSpeaking: () => void;

  // Real-Time In-Browser Pose & Joint Telemetry
  isRealTrackingActive: boolean;
  realModelScore: number;
  verificationProgress: number; // 0 to 100%
  lastSpokenVoiceCue: string;
  angularVelocity: number;
  wristTrajectories: {
    right: TrajectoryPoint[];
    left: TrajectoryPoint[];
  };
  realJointAngles: {
    rightElbow: number;
    leftElbow: number;
    rightShoulder: number;
    leftShoulder: number;
    rightKnee: number;
    leftKnee: number;
  };
  selectedJointInfo: {
    name: string;
    angle: number;
    position: [number, number, number];
    state: string;
    velocity: string;
  } | null;
  setSelectedJointInfo: (info: MissionState['selectedJointInfo']) => void;
  setVerificationProgress: (progress: number) => void;
  updateRealTimePose: (result: {
    keypoints: PoseKeypoint[];
    score: number;
    boundingBox: { x: number; y: number; width: number; height: number };
    detectedAction: string;
    actionConfidence: number;
    jointAngles: { rightElbow: number; leftElbow: number; rightShoulder: number; leftShoulder: number; rightKnee: number; leftKnee: number };
    angularVelocityDegSec?: number;
    wristTrajectory?: { right: TrajectoryPoint[]; left: TrajectoryPoint[] };
  }) => void;

  // Human-Friendly Step State Machine & Sequence History
  stepMachineState: StepMachineState;
  humanReadableActionName: string;
  verificationCountdownSec: number;
  verificationStatusMessage: string;
  stepHistory: CompletedStepHistoryItem[];
  resetSequenceHistory: () => void;

  // Connection & Offline-First State
  connectionState: ConnectionState;
  setConnectionState: (state: ConnectionState) => void;

  // Gemini AI Neural Engine & Voice Chat
  geminiConfig: GeminiConfig;
  isAiThinking: boolean;
  voiceAssistantState: 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING' | 'ERROR';
  setGeminiConfig: (config: Partial<GeminiConfig>) => void;
  testGeminiConnection: () => Promise<ConnectionTestResult>;
  setVoiceAssistantState: (state: MissionState['voiceAssistantState']) => void;
  chatMessages: ChatMessage[];
  sendChatMessage: (text: string, isVoiceInput?: boolean) => Promise<void>;
  
  // Advanced Detection Settings & Overlays
  detectionSettings: {
    confidence: number;
    durationMs: number;
    stability: number;
    cooldownMs: number;
  };
  showTechnicalOverlay: boolean;
  setShowTechnicalOverlay: (show: boolean) => void;
  updateDetectionSettings: (settings: Partial<{ confidence: number; durationMs: number; stability: number; cooldownMs: number }>) => void;

  // Demo Mode & 4 One-Click Scenarios
  isDemoMode: boolean;
  demoStatus: 'IDLE' | 'READY' | 'RUNNING' | 'PAUSED' | 'COMPLETED';
  startDemoMode: () => void;
  restartDemoMode: () => void;
  pauseDemoMode: () => void;
  resumeDemoMode: () => void;
  exitDemoMode: () => void;
  toggleDemoMode: (isDemo?: boolean) => void;

  // 4 Explicit Demo Scenarios
  runSuccessfulDemo: () => void;
  runOutOfSequenceDemo: () => void;
  runSkippedStepDemo: () => void;
  runIncorrectActionDemo: () => void;

  // Interactive Action Triggers
  advanceToNextStep: () => void;
  simulateAction: (actionType: 'CORRECT' | 'SKIPPED' | 'OUT_OF_SEQUENCE' | 'REPEATED', customAction?: string) => void;
  resetExperiment: () => void;
  toggleSimulation: () => void;
  tickTelemetry: () => void;
}

const generateInitialRecords = (protocol: ExperimentProtocol): StepExecutionRecord[] => {
  return protocol.steps.map((step, idx) => {
    if (idx === 0) {
      return {
        stepNumber: step.stepNumber,
        stepCode: step.stepCode,
        title: step.title,
        expectedAction: step.expectedAction,
        recognizedAction: `${step.title} Verified`,
        status: 'COMPLETED' as StepStatus,
        validationState: 'CORRECT' as ValidationState,
        startTime: 'T+04:18:40',
        endTime: 'T+04:19:22',
        confidence: 0.985,
        detectedObjects: step.validationRules.requiredObjects || [step.targetObject],
        notes: `${step.title} executed nominal. Safety criteria verified.`,
        durationSec: step.durationEstimateSec || 15
      };
    } else if (idx === 1) {
      return {
        stepNumber: step.stepNumber,
        stepCode: step.stepCode,
        title: step.title,
        expectedAction: step.expectedAction,
        recognizedAction: `${step.title} In Progress`,
        status: 'IN_PROGRESS' as StepStatus,
        validationState: 'ACTIVE' as ValidationState,
        startTime: 'T+04:19:40',
        confidence: 0.962,
        detectedObjects: step.validationRules.requiredObjects || [step.targetObject],
        notes: step.scientificRationale || 'Active handling in progress.',
        durationSec: step.durationEstimateSec || 12
      };
    } else {
      return {
        stepNumber: step.stepNumber,
        stepCode: step.stepCode,
        title: step.title,
        expectedAction: step.expectedAction,
        recognizedAction: 'Pending execution',
        status: 'PENDING' as StepStatus,
        validationState: 'IDLE' as ValidationState,
        startTime: '--',
        confidence: 0,
        detectedObjects: [],
        notes: 'Awaiting protocol sequence progression.',
        durationSec: 0
      };
    }
  });
};

let replayInterval: any = null;

export const useMissionStore = create<MissionState>((set, get) => {
  const initialProtocol = EXPERIMENT_PROTOCOLS[0]; // BAS-SCI-01 Sample Cartridge Installation
  const initialRecords = generateInitialRecords(initialProtocol);
  const initialValidation: ValidationResult = {
    stepNumber: 2,
    validationState: 'ACTIVE',
    recognizedAction: 'Collect Sample',
    expectedAction: initialProtocol.steps[1]?.expectedAction || 'Collect Sample',
    confidence: 0.962,
    recommendation: 'Step 2: Retrieve biological sample vial from cold storage container.',
    voiceAlertText: 'Step 01 validated. Proceed to Step 02: Collect Sample Vial.',
    severity: 'INFO'
  };

  const initialDatasets = {
    datasetA: generateDatasetA(),
    datasetB: generateDatasetB(),
    datasetC: generateDatasetC()
  };

  return {
    currentView: 'landing',
    setCurrentView: (view) => set({ currentView: view }),

    // Authentication & Session
    session: authService.getSession(),
    authStatus: authService.isAuthenticated() ? 'AUTHENTICATED' : 'UNAUTHENTICATED',
    authError: null,
    login: async (missionId, credential, remember = false) => {
      set({ authStatus: 'AUTHENTICATING', authError: null });
      const result = await authService.authenticate(missionId, credential, remember);
      if (result.success && result.session) {
        set({
          session: result.session,
          authStatus: 'AUTHENTICATED',
          authError: null,
          currentView: 'live-monitor'
        });
        get().addLogEvent({
          event: `Mission Operator authenticated: ${result.session.user.displayName} (${result.session.user.role}) [ID: ${result.session.user.maskedMissionId}]`,
          category: 'SYSTEM',
          severity: 'INFO',
          confidence: 1.0,
          source: 'AUTH_ENGINE'
        });
        notificationService.notify({
          title: 'Mission Access Authenticated',
          message: `${result.session.user.displayName} (${result.session.user.role}) authorized for on-board operations.`,
          type: 'SECURITY',
          sourceModule: 'SECURITY_ENGINE'
        });
        return { success: true };
      } else {
        set({
          session: null,
          authStatus: result.errorType === 'ACCOUNT_LOCKED' ? 'LOCKED' : 'ERROR',
          authError: result.error || 'Unable to authenticate.'
        });
        get().addLogEvent({
          event: `Authentication failed: ${result.error || 'Invalid credentials'}`,
          category: 'SYSTEM',
          severity: 'WARNING',
          confidence: 1.0,
          source: 'AUTH_ENGINE'
        });
        notificationService.notify({
          title: 'Authentication Failed',
          message: result.error || 'Authentication attempt failed. Security audit recorded.',
          type: 'SECURITY',
          sourceModule: 'SECURITY_ENGINE'
        });
        return { success: false, error: result.error };
      }
    },
    logout: () => {
      const currentSession = get().session;
      authService.invalidateSession();
      set({
        session: null,
        authStatus: 'UNAUTHENTICATED',
        authError: null,
        currentView: 'login'
      });
      get().addLogEvent({
        event: `Mission session ended for ${currentSession?.user.displayName || 'Operator'}. Session destroyed.`,
        category: 'SYSTEM',
        severity: 'INFO',
        confidence: 1.0,
        source: 'AUTH_ENGINE'
      });
      notificationService.notify({
        title: 'Mission Session Ended',
        message: 'Active session invalidated. Re-authentication required for mission access.',
        type: 'SECURITY',
        sourceModule: 'SECURITY_ENGINE'
      });
    },
    checkSession: () => {
      const s = authService.getSession();
      set({
        session: s,
        authStatus: s ? 'AUTHENTICATED' : 'UNAUTHENTICATED'
      });
      return s;
    },

    // Real-Time Notifications
    notifications: notificationService.getNotifications(),
    unreadNotificationCount: notificationService.getUnreadCount(),
    addNotification: (item) => {
      notificationService.notify(item);
    },
    markNotificationAsRead: (id) => {
      notificationService.markAsRead(id);
    },
    markAllNotificationsAsRead: () => {
      notificationService.markAllAsRead();
    },
    dismissNotification: (id) => {
      notificationService.dismiss(id);
    },
    clearAllNotifications: () => {
      notificationService.clearAll();
    },

    protocols: EXPERIMENT_PROTOCOLS,
    activeProtocol: initialProtocol,
    currentStepIndex: 1, // Currently on step 2 (index 1)
    setActiveProtocol: (protocolId) => {
      const normalized = (protocolId || '').toLowerCase().trim();
      const proto = EXPERIMENT_PROTOCOLS.find(p => 
        p.id.toLowerCase() === normalized || 
        p.code.toLowerCase() === normalized ||
        p.id.toLowerCase().includes(normalized) ||
        normalized.includes(p.id.toLowerCase()) ||
        (normalized.includes('phys') && p.code.includes('PHYS')) ||
        (normalized.includes('cell') && p.code.includes('CELL')) ||
        (normalized.includes('demo') && p.code.includes('DEMO')) ||
        (normalized.includes('sci') && p.code.includes('SCI'))
      ) || EXPERIMENT_PROTOCOLS[0];

      const newRecords = generateInitialRecords(proto);
      temporalValidator.resetForStep(1);
      const step1 = proto.steps[0] || { stepNumber: 1, title: 'Initiate Step', expectedAction: 'Standing by for step initiation' };

      set({
        activeProtocol: proto,
        currentStepIndex: 0,
        executionRecords: newRecords,
        stepHistory: [],
        stepMachineState: 'WAITING',
        verificationCountdownSec: 1.8,
        verificationProgress: 0,
        verificationStatusMessage: `Standing by for Step 1: ${step1.expectedAction}`,
        validationResult: {
          stepNumber: 1,
          validationState: 'IDLE',
          recognizedAction: 'Standing by for step initiation',
          expectedAction: step1.expectedAction,
          confidence: 0.95,
          recommendation: `Initiate Step 1: ${step1.title}`,
          voiceAlertText: `Protocol ${proto.code} selected. Ready for Step 1.`,
          severity: 'INFO'
        }
      });
      get().addLogEvent({
        event: `Active Protocol switched to ${proto.code} (${proto.name})`,
        category: 'EXPERIMENT_ENGINE',
        severity: 'INFO',
        confidence: 1.0,
        source: 'MISSION_CONTROL'
      });
    },
    setCurrentStepIndex: (index) => set({ currentStepIndex: index }),

    executionRecords: initialRecords,

    // Video Source Management
    videoSourceType: 'SIMULATION',
    videoSourceUrl: null,
    uploadedVideoFile: null,
    setVideoSource: (type, url, file) => {
      set({
        videoSourceType: type,
        videoSourceUrl: url || null,
        uploadedVideoFile: file || null,
        isWebcamActive: type === 'WEBCAM'
      });
      get().addLogEvent({
        event: `Video Ingestion Source changed to [${type}] ${url || file?.name || ''}`,
        category: 'CAMERA',
        severity: 'INFO',
        confidence: 1.0,
        source: 'VIDEO_PIPELINE'
      });
    },

    // 3D Reference Frame
    orientationReferenceFrame: 'PAYLOAD_RACK',
    setOrientationReferenceFrame: (frame) => {
      set({ orientationReferenceFrame: frame });
      get().addLogEvent({
        event: `3D Digital Twin Reference Frame set to [${frame}]`,
        category: 'SYSTEM',
        severity: 'INFO',
        confidence: 1.0,
        source: 'SPATIAL_ENGINE'
      });
    },

    // Local Recording State
    isRecording: false,
    recordingStatus: 'IDLE',
    recordingDurationSec: 0,
    recordedBytes: 0,
    startLocalRecording: (source) => {
      const ok = videoRecorderService.startRecording(source);
      if (ok) {
        set({ isRecording: true, recordingStatus: 'RECORDING' });
        get().triggerAlert({
          title: 'Local Video Recording Started',
          message: 'Zero-loss edge blackbox video recording active on local NVMe SSD.',
          severity: 'INFO',
          spokenText: 'Local video recording started.',
          soundType: 'SUCCESS'
        });
      }
      return ok;
    },
    stopLocalRecording: async () => {
      const metadata = await videoRecorderService.stopRecording();
      set({ isRecording: false, recordingStatus: 'SAVED' });
      if (metadata) {
        get().triggerAlert({
          title: 'Video Recording Saved',
          message: `Saved ${metadata.filename} (${(metadata.sizeBytes / (1024 * 1024)).toFixed(2)} MB, ${metadata.durationSec}s).`,
          severity: 'INFO',
          spokenText: 'Local video recording saved.',
          soundType: 'SUCCESS'
        });
      }
      return metadata;
    },

    // IP Streaming / RTSP State
    isStreaming: false,
    streamEndpoint: 'rtsp://192.168.1.120:554/live/payload-rack-cam-01',
    streamingStatus: 'DISCONNECTED',
    startStreaming: async () => {
      set({ isStreaming: true, streamingStatus: 'CONNECTING' });
      const ok = await streamManagerService.connectStream();
      if (ok) {
        set({ streamingStatus: 'STREAMING' });
        get().triggerAlert({
          title: 'IP Stream Connected',
          message: `Live RTSP telemetry stream locked to ${get().streamEndpoint}`,
          severity: 'INFO',
          spokenText: 'IP camera stream connected.',
          soundType: 'SUCCESS'
        });
      }
    },
    stopStreaming: () => {
      streamManagerService.disconnectStream();
      set({ isStreaming: false, streamingStatus: 'DISCONNECTED' });
    },
    setStreamEndpoint: (url) => {
      streamManagerService.updateConfig({ endpointUrl: url });
      set({ streamEndpoint: url });
    },

    // Datasets
    datasets: initialDatasets,
    activeDatasetCategory: 'A',
    activeSequenceIndex: 0,
    isDatasetReplaying: false,
    replayProgress: 0,
    setActiveDatasetCategory: (cat) => set({ activeDatasetCategory: cat, activeSequenceIndex: 0 }),
    setActiveSequenceIndex: (idx) => set({ activeSequenceIndex: idx }),
    generateFreshDatasets: () => {
      const fresh = {
        datasetA: generateDatasetA(),
        datasetB: generateDatasetB(),
        datasetC: generateDatasetC()
      };
      set({ datasets: fresh });
      get().triggerAlert({
        title: 'Multimodal Datasets Generated',
        message: 'Synthesized fresh Datasets A, B, and C with pose keypoints and HOI ground truth.',
        severity: 'INFO',
        spokenText: 'Multimodal datasets generated successfully.',
        soundType: 'SUCCESS'
      });
    },
    startDatasetReplay: (customSeq) => {
      if (replayInterval) clearInterval(replayInterval);
      const state = get();
      const currentCat = state.activeDatasetCategory;
      const manifest = currentCat === 'A' ? state.datasets.datasetA : currentCat === 'B' ? state.datasets.datasetB : state.datasets.datasetC;
      const seq = customSeq || manifest.sequences[state.activeSequenceIndex] || manifest.sequences[0];

      if (!seq || seq.samples.length === 0) return;

      set({ isDatasetReplaying: true, replayProgress: 0 });
      let fIdx = 0;

      replayInterval = setInterval(() => {
        if (fIdx >= seq.samples.length) {
          clearInterval(replayInterval);
          set({ isDatasetReplaying: false, replayProgress: 100 });
          return;
        }

        const sample = seq.samples[fIdx];
        fIdx++;
        set({
          replayProgress: Math.round((fIdx / seq.samples.length) * 100),
          poseKeypoints: sample.poseKeypoints,
          currentActionName: sample.actionLabel,
          actionConfidence: sample.actionConfidence,
          hoiInteraction: {
            active: sample.hoiVector.active,
            hand: sample.hoiVector.hand,
            targetObject: sample.hoiVector.targetObject,
            interactionType: sample.hoiVector.active ? 'GRIP' : 'RESTING',
            gScore: sample.actionConfidence,
            vector: {
              startX: sample.hoiVector.startX,
              startY: sample.hoiVector.startY,
              endX: sample.hoiVector.endX,
              endY: sample.hoiVector.endY
            }
          },
          realJointAngles: sample.jointAngles
        });
      }, 50); // 20 fps playback
    },
    stopDatasetReplay: () => {
      if (replayInterval) clearInterval(replayInterval);
      set({ isDatasetReplaying: false });
    },
    exportActiveDataset: (format) => {
      const state = get();
      const currentCat = state.activeDatasetCategory;
      const manifest = currentCat === 'A' ? state.datasets.datasetA : currentCat === 'B' ? state.datasets.datasetB : state.datasets.datasetC;

      if (format === 'JSON') {
        const json = exportDatasetAsJSON(manifest);
        downloadFile(`${manifest.datasetId}.json`, json, 'application/json');
      } else if (format === 'JSONL') {
        const jsonl = exportDatasetAsJSONL(manifest);
        downloadFile(`${manifest.datasetId}.jsonl`, jsonl, 'application/x-ndjson');
      } else {
        const csv = exportDatasetAsCSV(manifest);
        downloadFile(`${manifest.datasetId}.csv`, csv, 'text/csv');
      }
    },

    // 4 Demo Scenarios Execution
    runSuccessfulDemo: () => {
      const state = get();
      const proto = EXPERIMENT_PROTOCOLS.find(p => p.id === 'exp-bas-sci-01') || EXPERIMENT_PROTOCOLS[0];
      state.setActiveProtocol(proto.id);
      
      state.triggerAlert({
        title: 'Running Demo: Nominal 5-Step Execution',
        message: 'Simulating full successful protocol progression: Open Rack → Collect Sample → Clean Area → Install Cartridge → Seal.',
        severity: 'INFO',
        spokenText: 'Starting nominal five-step experiment sequence.',
        soundType: 'SUCCESS'
      });

      // Advance through steps with human-friendly interval
      let step = 0;
      const interval = setInterval(() => {
        if (step < proto.steps.length - 1) {
          get().advanceToNextStep();
          step++;
        } else {
          clearInterval(interval);
        }
      }, 2000);
    },

    runOutOfSequenceDemo: () => {
      const state = get();
      const proto = EXPERIMENT_PROTOCOLS.find(p => p.id === 'exp-bas-sci-01') || EXPERIMENT_PROTOCOLS[0];
      state.setActiveProtocol(proto.id);
      
      state.triggerAlert({
        title: 'Running Demo: Out-of-Sequence Action',
        message: 'Simulating Step 4 (Install Cartridge) executed before Step 3 (Clean Area).',
        severity: 'WARNING',
        spokenText: 'Warning: Out of sequence procedure initiated.',
        soundType: 'WARNING_BEEP'
      });

      setTimeout(() => {
        // Complete step 1
        get().advanceToNextStep();
        setTimeout(() => {
          // Attempt step 4 prematurely
          get().simulateAction('OUT_OF_SEQUENCE', 'INSTALL_SAMPLE_CARTRIDGE (Attempted before Clean Area)');
        }, 1500);
      }, 1000);
    },

    runSkippedStepDemo: () => {
      const state = get();
      const proto = EXPERIMENT_PROTOCOLS.find(p => p.id === 'exp-bas-sci-01') || EXPERIMENT_PROTOCOLS[0];
      state.setActiveProtocol(proto.id);

      state.triggerAlert({
        title: 'Running Demo: Skipped Step Omission',
        message: 'Simulating Step 3 (Clean Area) being omitted directly to Step 4.',
        severity: 'SEQUENCE ERROR',
        spokenText: 'Sequence Error: Step 3 Clean Area was skipped.',
        soundType: 'WARNING_BEEP'
      });

      setTimeout(() => {
        get().advanceToNextStep(); // to step 2
        setTimeout(() => {
          get().simulateAction('SKIPPED');
        }, 1500);
      }, 1000);
    },

    runIncorrectActionDemo: () => {
      const state = get();
      const proto = EXPERIMENT_PROTOCOLS.find(p => p.id === 'exp-bas-sci-01') || EXPERIMENT_PROTOCOLS[0];
      state.setActiveProtocol(proto.id);

      state.triggerAlert({
        title: 'Running Demo: Incorrect Action / Safety Hazard',
        message: 'Astronaut reached for High-Voltage Thermal Latch instead of Sample Vial.',
        severity: 'CRITICAL',
        spokenText: 'Critical Alert: Prohibited high-voltage contact detected.',
        soundType: 'ALARM'
      });

      setTimeout(() => {
        get().simulateAction('OUT_OF_SEQUENCE', 'UNAUTHORIZED_HIGH_VOLTAGE_LATCH_TOUCH');
      }, 1000);
    },

    isSimulating: true,
    simulationSpeed: 1.0,
    boundingBoxes: [
      { id: 'b1', label: 'Astronaut (Microgravity)', category: 'HUMAN', confidence: 0.98, x: 0.25, y: 0.15, width: 0.40, height: 0.72, color: '#00E5FF' },
      { id: 'b2', label: 'Biological-Sample-Vial-A', category: 'VIAL', confidence: 0.96, x: 0.52, y: 0.46, width: 0.12, height: 0.18, color: '#10B981' },
      { id: 'b3', label: 'EXPRESS-RACK-04', category: 'EQUIPMENT', confidence: 0.99, x: 0.15, y: 0.10, width: 0.70, height: 0.85, color: '#38BDF8' },
      { id: 'b4', label: 'Microfluidic-Cartridge-Dock', category: 'CONTAINER', confidence: 0.95, x: 0.48, y: 0.52, width: 0.20, height: 0.25, color: '#F59E0B' }
    ],
    poseKeypoints: [
      { name: 'nose', x: 0.45, y: 0.26, score: 0.99 },
      { name: 'left_eye', x: 0.43, y: 0.24, score: 0.98 },
      { name: 'right_eye', x: 0.47, y: 0.24, score: 0.98 },
      { name: 'left_shoulder', x: 0.38, y: 0.34, score: 0.96 },
      { name: 'right_shoulder', x: 0.54, y: 0.33, score: 0.97 },
      { name: 'left_elbow', x: 0.34, y: 0.48, score: 0.94 },
      { name: 'right_elbow', x: 0.56, y: 0.46, score: 0.95 },
      { name: 'left_wrist', x: 0.38, y: 0.54, score: 0.95 },
      { name: 'right_wrist', x: 0.52, y: 0.48, score: 0.97 },
      { name: 'left_hip', x: 0.40, y: 0.65, score: 0.92 },
      { name: 'right_hip', x: 0.50, y: 0.64, score: 0.93 },
      { name: 'left_knee', x: 0.38, y: 0.78, score: 0.91 },
      { name: 'right_knee', x: 0.52, y: 0.79, score: 0.92 },
      { name: 'left_ankle', x: 0.36, y: 0.88, score: 0.88 },
      { name: 'right_ankle', x: 0.54, y: 0.89, score: 0.89 }
    ],
    hoiInteraction: {
      active: true,
      hand: 'RIGHT',
      targetObject: 'Biological-Sample-Vial-A',
      interactionType: 'GRIP',
      gScore: 0.962,
      vector: { startX: 0.52, startY: 0.48, endX: 0.52, endY: 0.46 }
    },
    currentActionName: 'COLLECT_SAMPLE',
    actionConfidence: 0.962,
    validationResult: initialValidation,

    telemetry: INITIAL_TELEMETRY,
    modelTelemetry: INITIAL_MODEL_TELEMETRY,
    activeCamera: 'CAM-01-PAYLOAD-FRONT',
    isWebcamActive: false,
    setActiveCamera: (camId) => set({ activeCamera: camId }),
    setIsWebcamActive: (active) => set({ isWebcamActive: active }),

    // Human-Friendly Step State Machine & Telemetry
    isRealTrackingActive: false,
    realModelScore: 0.95,
    stepMachineState: 'WAITING',
    humanReadableActionName: 'Standing by for action',
    verificationCountdownSec: 1.8,
    verificationProgress: 0,
    verificationStatusMessage: 'Standing by for action',
    lastSpokenVoiceCue: 'Mission AI online. Ready for experiment protocol.',
    angularVelocity: 0,
    wristTrajectories: { right: [], left: [] },
    stepHistory: [
      {
        stepNumber: 1,
        stepCode: 'SCI-STP-01',
        title: 'Open Payload Rack',
        expectedAction: 'Disengage mechanical latch and open payload rack door.',
        recognizedAction: 'Payload Rack Unlatched and Locked Open',
        completedAt: '20:31:12',
        confidence: 0.985,
        durationSec: 15
      }
    ],
    resetSequenceHistory: () => set({ stepHistory: [] }),

    // Connection & Offline-First State
    connectionState: connectionManager.getConnectionState(),
    setConnectionState: (st) => {
      set({ connectionState: st });
      notificationService.notify({
        title: st === 'ONLINE' ? 'AI Service Connected' : 'Mission AI Switched to Local Mode',
        message: st === 'ONLINE' ? 'High-bandwidth cloud Gemini services available.' : 'Operating in 100% offline standalone mode with local knowledge base.',
        type: 'AI',
        sourceModule: 'AI_ROUTER'
      });
    },

    // Gemini AI Configuration & State
    geminiConfig: geminiService.getConfig(),
    isAiThinking: false,
    voiceAssistantState: 'IDLE',
    setGeminiConfig: (config) => {
      geminiService.saveConfig(config.apiKey ?? get().geminiConfig.apiKey, config.model ?? get().geminiConfig.model);
      set({ geminiConfig: geminiService.getConfig() });
    },
    testGeminiConnection: async () => {
      const state = get();
      set({ isAiThinking: true });
      const result = await geminiService.testConnection(state.geminiConfig.apiKey, state.geminiConfig.model);
      set({ 
        geminiConfig: geminiService.getConfig(),
        isAiThinking: false
      });
      return result;
    },
    setVoiceAssistantState: (st) => set({ voiceAssistantState: st }),

    // Advanced Detection Settings & Overlays
    detectionSettings: {
      confidence: 0.60,
      durationMs: 1500,
      stability: 0.65,
      cooldownMs: 1200
    },
    showTechnicalOverlay: false,
    setShowTechnicalOverlay: (show) => set({ showTechnicalOverlay: show }),
    updateDetectionSettings: (newSettings) => {
      const updated = { ...get().detectionSettings, ...newSettings };
      temporalValidator.updateConfig({
        CONFIDENCE_THRESHOLD: updated.confidence,
        VERIFICATION_DELAY_MS: updated.durationMs,
        ACTION_STABILITY_PERCENT: updated.stability,
        POST_VERIFICATION_COOLDOWN_MS: updated.cooldownMs
      });
      set({ detectionSettings: updated });
    },

    // Demo Mode implementation
    isDemoMode: true,
    demoStatus: 'READY',
    startDemoMode: () => {
      const demoProto = EXPERIMENT_PROTOCOLS.find(p => p.id === 'exp-bas-demo-01') || EXPERIMENT_PROTOCOLS[0];
      temporalValidator.resetForStep(1);
      set({
        isDemoMode: true,
        demoStatus: 'RUNNING',
        activeProtocol: demoProto,
        currentStepIndex: 0,
        isWebcamActive: true,
        stepMachineState: 'WAITING',
        verificationProgress: 0,
        verificationCountdownSec: 1.5,
        verificationStatusMessage: 'Demo Started: Place both hands down at rest.',
        stepHistory: []
      });
      audioService.speakGuidance('Live webcam demo started. Step 1: Place both hands down and stay still for a moment.', true);
    },
    restartDemoMode: () => {
      const demoProto = EXPERIMENT_PROTOCOLS.find(p => p.id === 'exp-bas-demo-01') || EXPERIMENT_PROTOCOLS[0];
      temporalValidator.resetForStep(1);
      set({
        isDemoMode: true,
        demoStatus: 'RUNNING',
        activeProtocol: demoProto,
        currentStepIndex: 0,
        stepMachineState: 'WAITING',
        verificationProgress: 0,
        verificationCountdownSec: 1.5,
        verificationStatusMessage: 'Demo Restarted: Step 1 — Hands at Rest',
        stepHistory: []
      });
      audioService.speakGuidance('Demo restarted. Step 1: Place both hands down and stay still.', true);
    },
    pauseDemoMode: () => {
      set({ demoStatus: 'PAUSED' });
    },
    resumeDemoMode: () => {
      set({ demoStatus: 'RUNNING' });
    },
    exitDemoMode: () => {
      const advProto = EXPERIMENT_PROTOCOLS.find(p => p.id === 'exp-bas-sci-01') || EXPERIMENT_PROTOCOLS[0];
      temporalValidator.resetForStep(1);
      set({
        isDemoMode: false,
        demoStatus: 'IDLE',
        activeProtocol: advProto,
        currentStepIndex: 0,
        stepMachineState: 'WAITING',
        verificationProgress: 0,
        stepHistory: []
      });
    },
    toggleDemoMode: (isDemo) => {
      const target = isDemo !== undefined ? isDemo : !get().isDemoMode;
      if (target) {
        get().startDemoMode();
      } else {
        get().exitDemoMode();
      }
    },

    realJointAngles: {
      rightElbow: 145,
      leftElbow: 140,
      rightShoulder: 45,
      leftShoulder: 40,
      rightKnee: 175,
      leftKnee: 170
    },
    selectedJointInfo: {
      name: 'Right Elbow (Humeroulnar)',
      angle: 145,
      position: [0.52, 0.22, 0.15],
      state: 'STABLE_FLEXION',
      velocity: '0.04 rad/s'
    },
    setSelectedJointInfo: (info) => set({ selectedJointInfo: info }),
    setVerificationProgress: (progress) => set({ verificationProgress: progress }),

    // Mission AI Chat
    chatMessages: [
      {
        id: 'msg-1',
        sender: 'MISSION_AI',
        text: 'VYOM DRISHTI Mission Assistant initialized. Operating in 100% Offline Standalone Mode. You can ask what action is required, why a step was flagged, or for experiment progress.',
        timestamp: 'T+04:15:00',
        source: 'LOCAL KNOWLEDGE BASE',
        provenanceLabel: 'SYSTEM ARCHITECTURE'
      }
    ],
    sendChatMessage: async (userText: string, isVoiceInput: boolean = false) => {
      const state = get();
      const formatMet = (secs: number) => {
        const h = Math.floor(secs / 3600).toString().padStart(2, '0');
        const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
        const s = Math.floor(secs % 60).toString().padStart(2, '0');
        return `T+${h}:${m}:${s}`;
      };

      const userMsg: ChatMessage = {
        id: `chat-${Date.now()}-u`,
        sender: 'USER',
        text: userText,
        timestamp: formatMet(state.telemetry.metSeconds)
      };

      // 1. Immediately append user message & show processing
      set({ 
        chatMessages: [...state.chatMessages, userMsg],
        isAiThinking: true,
        voiceAssistantState: isVoiceInput ? 'PROCESSING' : 'IDLE'
      });

      // Persist user message to IndexedDB
      indexedDbService.saveChatMessage(userMsg);

      const context = {
        protocol: state.activeProtocol,
        currentStepIndex: state.currentStepIndex,
        validationResult: state.validationResult,
        currentActionName: state.currentActionName,
        actionConfidence: state.actionConfidence,
        executionRecords: state.executionRecords,
        alerts: state.alerts,
        logs: state.logs,
        isWebcamActive: state.isWebcamActive,
        isRealTrackingActive: state.isRealTrackingActive,
        hoiInteraction: state.hoiInteraction,
        telemetry: state.telemetry,
        boundingBoxes: state.boundingBoxes,
        recentHistory: state.chatMessages.slice(-6).map((m, idx, arr) => {
          if (m.sender === 'USER') {
            const nextAi = arr.slice(idx + 1).find(x => x.sender === 'MISSION_AI');
            return {
              user: m.text,
              assistant: nextAi ? nextAi.text : ''
            };
          }
          return null;
        }).filter(Boolean) as { user: string; assistant: string }[]
      };

      // 2. Route query through central AI Router (Online Gemini or Offline Local AI with auto-failover)
      const routerResult = await aiRouter.routeQuery(userText, context);
      const aiReplyText = routerResult.text || "Step in progress. Please follow standard operational procedure.";

      const aiMsg: ChatMessage = {
        id: `chat-${Date.now()}-ai`,
        sender: 'MISSION_AI',
        text: aiReplyText,
        timestamp: formatMet(get().telemetry.metSeconds),
        source: routerResult.source as any,
        provenanceLabel: routerResult.provenanceLabel
      };

      // 3. Immediately render AI reply to UI and persist to IndexedDB
      set(s => ({
        chatMessages: [...s.chatMessages, aiMsg],
        isAiThinking: false,
        voiceAssistantState: (isVoiceInput || get().isVoiceGuidanceEnabled) ? 'SPEAKING' : 'IDLE',
        lastSpokenVoiceCue: aiReplyText
      }));

      indexedDbService.saveChatMessage(aiMsg);

      // 4. Optional TTS speech synthesis
      if (isVoiceInput || get().isVoiceGuidanceEnabled) {
        audioService.speakGuidance(aiReplyText, true, 0, () => {
          set({ voiceAssistantState: 'IDLE' });
        });
      }
    },

    updateRealTimePose: (result) => {
      const state = get();
      const proto = state.activeProtocol;
      const currentIdx = state.currentStepIndex;
      const currentStep = proto.steps[currentIdx];

      const humanBox: BoundingBox = {
        id: 'real-human',
        label: 'Astronaut (Live Edge Detection)',
        category: 'HUMAN',
        confidence: result.score,
        x: result.boundingBox.x,
        y: result.boundingBox.y,
        width: result.boundingBox.width,
        height: result.boundingBox.height,
        color: '#00E5FF'
      };

      const updatedBoxes = [humanBox, ...state.boundingBoxes.filter(b => b.category !== 'HUMAN')];

      const temporalUpdate = temporalValidator.processFrame(
        proto,
        currentIdx,
        result.detectedAction,
        result.actionConfidence
      );

      let mappedValState: ValidationState = 'ACTIVE';
      if (temporalUpdate.stepState === 'VERIFIED' || temporalUpdate.stepState === 'COOLDOWN') mappedValState = 'CORRECT';
      else if (temporalUpdate.stepState === 'INCORRECT') mappedValState = 'INCORRECT';
      else if (temporalUpdate.stepState === 'VERIFYING') mappedValState = 'VERIFYING';
      else if (temporalUpdate.stepState === 'POSITIONING') mappedValState = 'ACTIVE';
      else mappedValState = 'IDLE';

      const validation: ValidationResult = {
        stepNumber: currentStep ? currentStep.stepNumber : 1,
        validationState: mappedValState,
        recognizedAction: temporalUpdate.humanReadableAction,
        expectedAction: currentStep ? currentStep.expectedAction : 'None',
        confidence: temporalUpdate.smoothedConfidence,
        deviationReason: temporalUpdate.deviationReason,
        recommendation: temporalUpdate.deviationReason
          ? `SOP Alert: ${temporalUpdate.deviationReason} Required: "${currentStep?.expectedAction}".`
          : currentStep?.scientificRationale || 'Maintain standard operational posture.',
        voiceAlertText: temporalUpdate.voiceAlertText || '',
        severity: temporalUpdate.stepState === 'INCORRECT' ? 'WARNING' : 'INFO'
      };

      if (temporalUpdate.voiceAlertText && state.isVoiceGuidanceEnabled) {
        audioService.speakGuidance(temporalUpdate.voiceAlertText, temporalUpdate.stepState === 'VERIFIED', 4000);
      }

      set({
        isRealTrackingActive: true,
        realModelScore: result.score,
        poseKeypoints: result.keypoints,
        boundingBoxes: updatedBoxes,
        currentActionName: temporalUpdate.smoothedAction,
        humanReadableActionName: temporalUpdate.humanReadableAction,
        actionConfidence: temporalUpdate.smoothedConfidence,
        realJointAngles: result.jointAngles,
        angularVelocity: result.angularVelocityDegSec || 0,
        wristTrajectories: result.wristTrajectory || state.wristTrajectories,
        validationResult: validation,
        stepMachineState: temporalUpdate.stepState,
        verificationCountdownSec: temporalUpdate.countdownSec,
        verificationProgress: temporalUpdate.holdProgressPct,
        verificationStatusMessage: temporalUpdate.statusMessage,
        lastSpokenVoiceCue: audioService.getLastSpokenText() || state.lastSpokenVoiceCue
      });

      if (temporalUpdate.shouldAdvance) {
        get().advanceToNextStep();
      }
    },

    logs: INITIAL_LOGS,
    alerts: INITIAL_ALERTS,

    addLogEvent: (eventData) => {
      const state = get();
      const formatMet = (secs: number) => {
        const h = Math.floor(secs / 3600).toString().padStart(2, '0');
        const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
        const s = Math.floor(secs % 60).toString().padStart(2, '0');
        return `T+${h}:${m}:${s}`;
      };
      const newEvent: MissionLogEvent = {
        ...eventData,
        id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        metTimestamp: formatMet(state.telemetry.metSeconds),
        hashSeal: Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)
      };

      set({ logs: [newEvent, ...state.logs] });

      // Persist to IndexedDB
      indexedDbService.saveMissionLog(newEvent);

      // If offline, add to sync queue
      if (connectionManager.isOffline()) {
        indexedDbService.addToOfflineQueue({
          type: 'FLIGHT_LOG',
          payload: newEvent,
          timestamp: newEvent.timestamp
        });
      }
    },

    triggerAlert: (alertData) => {
      const state = get();
      const formatMet = (secs: number) => {
        const h = Math.floor(secs / 3600).toString().padStart(2, '0');
        const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
        const s = Math.floor(secs % 60).toString().padStart(2, '0');
        return `T+${h}:${m}:${s}`;
      };
      const newAlert: VoiceAlertItem = {
        ...alertData,
        id: `alert-${Date.now()}`,
        timestamp: formatMet(state.telemetry.metSeconds),
        acknowledged: false
      };

      if (newAlert.soundType === 'SUCCESS') audioService.playSuccessTone();
      else if (newAlert.soundType === 'WARNING_BEEP') audioService.playWarningTone();
      else if (newAlert.soundType === 'ALARM') audioService.playCriticalAlarm();
      else audioService.playAvionicsChirp();

      audioService.speakGuidance(newAlert.spokenText);

      state.addLogEvent({
        event: `[${newAlert.severity}] ${newAlert.title}: ${newAlert.message}`,
        category: 'VOICE_ALERT',
        severity: newAlert.severity,
        confidence: 0.98,
        source: 'VOICE_ALERT_DISPATCHER'
      });

      set({ alerts: [newAlert, ...state.alerts] });
    },

    acknowledgeAlert: (alertId) => {
      set(state => ({
        alerts: state.alerts.map(a => a.id === alertId ? { ...a, acknowledged: true } : a)
      }));
    },

    clearAllAlerts: () => {
      set(state => ({
        alerts: state.alerts.map(a => ({ ...a, acknowledged: true }))
      }));
    },

    isAudioMuted: false,
    isVoiceGuidanceEnabled: true,
    toggleAudioMute: () => {
      const nextMuted = !get().isAudioMuted;
      audioService.setMuted(nextMuted);
      set({ isAudioMuted: nextMuted });
    },
    toggleVoiceGuidance: () => {
      const nextVoice = !get().isVoiceGuidanceEnabled;
      audioService.setVoiceEnabled(nextVoice);
      set({ isVoiceGuidanceEnabled: nextVoice });
    },
    stopSpeaking: () => {
      audioService.stopSpeaking();
      set({ voiceAssistantState: 'IDLE' });
    },

    advanceToNextStep: () => {
      const state = get();
      const currentIdx = state.currentStepIndex;
      const proto = state.activeProtocol;

      if (currentIdx < proto.totalSteps - 1) {
        const nextIdx = currentIdx + 1;
        const currentStep = proto.steps[currentIdx];
        const nextStep = proto.steps[nextIdx];

        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

        const historyItem: CompletedStepHistoryItem = {
          stepNumber: currentStep.stepNumber,
          stepCode: currentStep.stepCode,
          title: currentStep.title,
          expectedAction: currentStep.expectedAction,
          recognizedAction: state.currentActionName.replace(/_/g, ' '),
          completedAt: timeStr,
          confidence: state.actionConfidence,
          durationSec: 18
        };

        const updatedHistory = [
          ...state.stepHistory.filter(h => h.stepNumber !== currentStep.stepNumber),
          historyItem
        ];

        temporalValidator.resetForStep(nextStep.stepNumber);

        const updatedRecords = [...state.executionRecords];
        updatedRecords[currentIdx] = {
          ...updatedRecords[currentIdx],
          status: 'COMPLETED',
          validationState: 'CORRECT',
          endTime: `T+04:${20 + nextIdx}:00`,
          confidence: 0.98
        };
        updatedRecords[nextIdx] = {
          ...updatedRecords[nextIdx],
          status: 'IN_PROGRESS',
          validationState: 'ACTIVE',
          startTime: `T+04:${20 + nextIdx}:05`,
          confidence: 0.95
        };

        const result: ValidationResult = {
          stepNumber: nextStep.stepNumber,
          validationState: 'ACTIVE',
          recognizedAction: nextStep.expectedAction,
          expectedAction: nextStep.expectedAction,
          confidence: 0.96,
          recommendation: `Step ${nextStep.stepNumber}: ${nextStep.title}. ${nextStep.scientificRationale}`,
          voiceAlertText: `Step ${currentStep.stepNumber} complete. Starting Step ${nextStep.stepNumber}: ${nextStep.title}.`,
          severity: 'INFO'
        };

        state.triggerAlert({
          title: `Step ${currentStep.stepNumber} Validated`,
          message: `Proceed to Step ${nextStep.stepNumber}: ${nextStep.title}`,
          severity: 'INFO',
          spokenText: result.voiceAlertText,
          stepNumber: nextStep.stepNumber,
          soundType: 'SUCCESS'
        });

        notificationService.notify({
          title: `Step ${currentStep.stepNumber} Verified`,
          message: `${currentStep.title} (${currentStep.expectedAction}) completed successfully. Proceed to Step ${nextStep.stepNumber}.`,
          type: 'SUCCESS',
          actionLink: 'sequence',
          sourceModule: 'SEQUENCE_VALIDATOR'
        });

        set({
          currentStepIndex: nextIdx,
          executionRecords: updatedRecords,
          validationResult: result,
          stepHistory: updatedHistory,
          stepMachineState: 'WAITING',
          verificationCountdownSec: 1.8,
          verificationProgress: 0,
          verificationStatusMessage: `Standing by for Step ${nextStep.stepNumber}: ${nextStep.expectedAction}`,
          currentActionName: nextStep.expectedAction.toUpperCase().replace(/\s+/g, '_'),
          actionConfidence: 0.965
        });
      } else {
        const currentStep = proto.steps[currentIdx];
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

        const finalHistoryItem: CompletedStepHistoryItem = {
          stepNumber: currentStep.stepNumber,
          stepCode: currentStep.stepCode,
          title: currentStep.title,
          expectedAction: currentStep.expectedAction,
          recognizedAction: state.currentActionName.replace(/_/g, ' '),
          completedAt: timeStr,
          confidence: state.actionConfidence,
          durationSec: 18
        };

        set({
          stepHistory: [...state.stepHistory.filter(h => h.stepNumber !== currentStep.stepNumber), finalHistoryItem],
          stepMachineState: 'VERIFIED',
          verificationStatusMessage: 'All protocol procedures completed and sealed.'
        });

        state.triggerAlert({
          title: 'Experiment Protocol Complete',
          message: `All ${proto.totalSteps} steps of ${proto.code} successfully executed and validated.`,
          severity: 'INFO',
          spokenText: `Mission protocol ${proto.code} completed successfully. Data logged and sealed.`,
          soundType: 'SUCCESS'
        });

        notificationService.notify({
          title: 'Experiment Completed',
          message: `All ${proto.totalSteps} steps of ${proto.code} (${proto.name}) successfully verified and sealed.`,
          type: 'SUCCESS',
          actionLink: 'sequence',
          sourceModule: 'SEQUENCE_VALIDATOR'
        });
      }
    },

    simulateAction: (actionType, customAction) => {
      const state = get();
      const proto = state.activeProtocol;
      const currentIdx = state.currentStepIndex;
      const currentStep = proto.steps[currentIdx];

      if (actionType === 'CORRECT') {
        state.advanceToNextStep();
      } else if (actionType === 'SKIPPED') {
        const targetStep = proto.steps[Math.min(currentIdx + 2, proto.totalSteps - 1)];
        const result = ProtocolEngine.validateAction(
          proto,
          currentStep.stepNumber,
          targetStep.expectedAction,
          targetStep.validationRules.requiredObjects,
          'GRIP'
        );

        const updatedRecords = [...state.executionRecords];
        updatedRecords[currentIdx] = {
          ...updatedRecords[currentIdx],
          status: 'SKIPPED',
          validationState: 'SKIPPED',
          notes: `Deviation: Attempted ${targetStep.title} before completing current step.`,
          deviationReason: result.deviationReason
        };

        state.triggerAlert({
          title: 'Sequence Error: Skipped Step Detected',
          message: result.deviationReason || 'Step skipped out of sequence',
          severity: 'SEQUENCE ERROR',
          spokenText: result.voiceAlertText,
          stepNumber: currentStep.stepNumber,
          soundType: 'WARNING_BEEP'
        });

        notificationService.notify({
          title: 'Sequence Error: Skipped Step',
          message: result.deviationReason || `Step ${currentStep.stepNumber} was omitted before ${targetStep.title}.`,
          type: 'WARNING',
          actionLink: 'sequence',
          sourceModule: 'SEQUENCE_VALIDATOR'
        });

        set({
          validationResult: result,
          executionRecords: updatedRecords,
          currentActionName: `SKIPPED_STEP_DETECTED_${targetStep.stepCode}`,
          actionConfidence: 0.92
        });
      } else if (actionType === 'OUT_OF_SEQUENCE') {
        const arbitraryAction = customAction || 'Unregistered Glovebox Valve Adjustment';
        const result = ProtocolEngine.validateAction(
          proto,
          currentStep.stepNumber,
          arbitraryAction,
          ['Unregistered-Valve'],
          'GRIP'
        );

        const updatedRecords = [...state.executionRecords];
        updatedRecords[currentIdx] = {
          ...updatedRecords[currentIdx],
          validationState: 'OUT_OF_SEQUENCE',
          deviationReason: result.deviationReason
        };

        state.triggerAlert({
          title: 'Deviation: Out-of-Sequence Action',
          message: `Unscheduled action "${arbitraryAction}" detected in payload bay.`,
          severity: 'WARNING',
          spokenText: result.voiceAlertText,
          stepNumber: currentStep.stepNumber,
          soundType: 'WARNING_BEEP'
        });

        notificationService.notify({
          title: 'Out of Sequence Action',
          message: `Unscheduled action "${arbitraryAction}" detected in payload bay. Step requires retry.`,
          type: 'WARNING',
          actionLink: 'sequence',
          sourceModule: 'SEQUENCE_VALIDATOR'
        });

        set({
          validationResult: result,
          executionRecords: updatedRecords,
          currentActionName: 'OUT_OF_SEQUENCE_ACTION',
          actionConfidence: 0.81
        });
      } else if (actionType === 'REPEATED') {
        const prevStep = proto.steps[Math.max(0, currentIdx - 1)];
        const result = ProtocolEngine.validateAction(
          proto,
          currentStep.stepNumber,
          prevStep.expectedAction,
          prevStep.validationRules.requiredObjects,
          'GRIP'
        );

        state.triggerAlert({
          title: 'Notice: Repeated Action',
          message: `Astronaut repeated action for Step ${prevStep.stepNumber} (${prevStep.title}).`,
          severity: 'WARNING',
          spokenText: result.voiceAlertText,
          stepNumber: currentStep.stepNumber,
          soundType: 'CHIME'
        });

        notificationService.notify({
          title: 'Notice: Repeated Step',
          message: `Action for Step ${prevStep.stepNumber} (${prevStep.title}) was repeated.`,
          type: 'INFO',
          actionLink: 'sequence',
          sourceModule: 'SEQUENCE_VALIDATOR'
        });

        set({
          validationResult: result,
          currentActionName: `REPEATED_STEP_${prevStep.stepCode}`,
          actionConfidence: 0.88
        });
      }
    },

    resetExperiment: () => {
      const state = get();
      const proto = state.activeProtocol;
      const newRecords = proto.steps.map((step, idx) => ({
        stepNumber: step.stepNumber,
        stepCode: step.stepCode,
        title: step.title,
        expectedAction: step.expectedAction,
        recognizedAction: idx === 0 ? 'Ready for initiation' : 'Pending',
        status: (idx === 0 ? 'IN_PROGRESS' : 'PENDING') as StepStatus,
        validationState: 'IDLE' as ValidationState,
        startTime: idx === 0 ? 'T+00:00:01' : '--',
        confidence: idx === 0 ? 0.95 : 0,
        detectedObjects: [],
        notes: idx === 0 ? 'Initiate step 1 to begin protocol.' : 'Pending sequence',
        durationSec: 0
      }));

      set({
        currentStepIndex: 0,
        executionRecords: newRecords,
        validationResult: {
          stepNumber: 1,
          validationState: 'IDLE',
          recognizedAction: 'Standing by for step initiation',
          expectedAction: proto.steps[0].expectedAction,
          confidence: 0.95,
          recommendation: `Begin Step 1: ${proto.steps[0].title}`,
          voiceAlertText: `Experiment ${proto.code} reset to Step 1. Ready.`,
          severity: 'INFO'
        }
      });

      state.addLogEvent({
        event: `Experiment ${proto.code} reset by Mission Operator`,
        category: 'EXPERIMENT_ENGINE',
        severity: 'INFO',
        confidence: 1.0,
        source: 'OPERATOR_CONSOLE'
      });
    },

    toggleSimulation: () => {
      set(state => ({ isSimulating: !state.isSimulating }));
    },

    tickTelemetry: () => {
      set(state => {
        const nextMet = state.telemetry.metSeconds + 1;
        const cpuVariation = (Math.random() - 0.5) * 1.5;
        const npuVariation = (Math.random() - 0.5) * 2.0;
        const fpsVariation = (Math.random() - 0.5) * 0.4;
        const latVariation = (Math.random() - 0.5) * 0.8;

        return {
          telemetry: {
            ...state.telemetry,
            metSeconds: nextMet,
            edgeCpuLoad: Math.min(95, Math.max(10, +(state.telemetry.edgeCpuLoad + cpuVariation).toFixed(1))),
            edgeNpuLoad: Math.min(98, Math.max(25, +(state.telemetry.edgeNpuLoad + npuVariation).toFixed(1))),
            edgeFps: Math.min(30.2, Math.max(28.0, +(state.telemetry.edgeFps + fpsVariation).toFixed(1))),
            edgeLatencyMs: Math.min(25.0, Math.max(15.0, +(state.telemetry.edgeLatencyMs + latVariation).toFixed(1))),
          }
        };
      });
    }
  };
});

// Reactively synchronize store when notification service updates
notificationService.subscribe((notifs) => {
  useMissionStore.setState({
    notifications: notifs,
    unreadNotificationCount: notifs.filter(n => !n.read && !n.dismissed).length
  });
});

