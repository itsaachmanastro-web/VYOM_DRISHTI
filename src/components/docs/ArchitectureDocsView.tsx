import React, { useState } from 'react';
import { 
  FileCode, 
  Layers, 
  Cpu, 
  Database, 
  Compass, 
  ShieldCheck, 
  Activity, 
  Workflow, 
  CheckCircle2, 
  Terminal, 
  BookOpen, 
  Sparkles,
  Server,
  Radio,
  Sliders
} from 'lucide-react';

export const ArchitectureDocsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'PIPELINE' | 'DATASET' | 'INTERFACES' | 'ZERO_G' | 'OFFLINE' | 'PROTOCOLS'>('PIPELINE');

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto select-none">
      
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-cyan-400 border border-blue-500/20">
            TECHNICAL ARCHITECTURE & SPECIFICATION
          </span>
          <span className="text-xs text-slate-500">VYOM DRISHTI AI — SIH 2026 PS #26174</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
          System Architecture & Pipeline Documentation
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Engineering design, multimodal dataset format specifications, modular CV interfaces, zero-g kinematic transformations, and offline edge deployment guide.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-200/70 dark:bg-slate-900/80 border border-slate-300/60 dark:border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('PIPELINE')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'PIPELINE'
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-cyan-400 shadow-sm border border-blue-500/30 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Workflow className="w-4 h-4" />
          <span>Pipeline Architecture</span>
        </button>

        <button
          onClick={() => setActiveTab('DATASET')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'DATASET'
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-cyan-400 shadow-sm border border-blue-500/30 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Multimodal Datasets</span>
        </button>

        <button
          onClick={() => setActiveTab('INTERFACES')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'INTERFACES'
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-cyan-400 shadow-sm border border-blue-500/30 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Modular AI Interfaces</span>
        </button>

        <button
          onClick={() => setActiveTab('ZERO_G')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'ZERO_G'
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-cyan-400 shadow-sm border border-blue-500/30 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Orientation-Agnostic Kinematics</span>
        </button>

        <button
          onClick={() => setActiveTab('OFFLINE')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'OFFLINE'
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-cyan-400 shadow-sm border border-blue-500/30 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Offline Edge Self-Sufficiency</span>
        </button>

        <button
          onClick={() => setActiveTab('PROTOCOLS')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'PROTOCOLS'
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-cyan-400 shadow-sm border border-blue-500/30 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Adding New Protocols</span>
        </button>
      </div>

      {/* Tab 1: Pipeline Architecture */}
      {activeTab === 'PIPELINE' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Workflow className="w-5 h-5 text-blue-500" />
              <span>End-to-End Experiment Monitoring Data Flow</span>
            </h2>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              VYOM DRISHTI AI operates a low-latency, modular processing pipeline designed for on-board edge computers (such as ISRO/BAS NPU compute modules). The pipeline processes raw video frames through vision models, extracts hand-object spatial vectors, validates temporal stability over a 15-frame window, and transitions the deterministic state machine.
            </p>

            {/* ASCII Pipeline Block Diagram */}
            <div className="p-4 rounded-xl bg-slate-950 text-cyan-300 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
              <pre>{`
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   MULTI-SOURCE VIDEO INGESTION                                  │
│  [ Live Webcam (WebRTC) ]  [ Upload MP4 / Video File ]  [ 3D Synthetic Generator ]  [ IP/RTSP ] │
└───────────────────────────────────────────────┬─────────────────────────────────────────────────┘
                                                │ (Raw Video Frames @ 30 FPS)
                                                ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               MODULAR AI PERCEPTION PIPELINE                                    │
│  ┌─────────────────────────┐   ┌───────────────────────────┐   ┌─────────────────────────────┐  │
│  │ IObjectDetector         │   │ IPoseEstimator (MoveNet)  │   │ IHOIDetector                │  │
│  │ (Rack, Sample, Dock)    │   │ (17 Keypoints, 3D Norm)   │   │ (Hand-Object Grasp Vector)  │  │
│  └────────────┬────────────┘   └─────────────┬─────────────┘   └──────────────┬──────────────┘  │
│               └──────────────────────────────┼────────────────────────────────┘                 │
│                                              ▼                                                  │
│                                  IActivityRecognizer                                            │
│                          (Feature Extraction & Rule Engine)                                     │
│                                              ▼                                                  │
│                                   ITemporalValidator                                            │
│                       (15-Frame Sliding Window Stability Buffer)                                │
└───────────────────────────────────────────────┬─────────────────────────────────────────────────┘
                                                │ Confirmed Action Event
                                                ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                              DETERMINISTIC SEQUENCE ENGINE                                      │
│  State Machine: PENDING ──► IN_PROGRESS ──► VERIFIED (Hold 1.5s) ──► NEXT_STEP                  │
│                 └──► SKIPPED (Step 3 missing) / OUT_OF_SEQUENCE (Step 4 early) / INCORRECT      │
└──────────────────┬────────────────────────────┬─────────────────────────────┬───────────────────┘
                   │                            │                             │
                   ▼                            ▼                             ▼
┌───────────────────────────┐ ┌───────────────────────────┐ ┌───────────────────────────────────┐
│ Offline Voice Alerts      │ │ Cryptographic Log Engine  │ │ Orientation-Agnostic 3D Twin      │
│ (Web Speech TTS Synth)    │ │ (Timestamp, Step, Action, │ │ (Payload Rack Frame Reference,    │
│ "Step 2 done. Proceed..." │ │  JSON / CSV / TXT Export) │ │  Live Hand->Object Vector Lines)  │
└───────────────────────────┘ └───────────────────────────┘ └───────────────────────────────────┘
              `}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Multimodal Datasets */}
      {activeTab === 'DATASET' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-500" />
              <span>Multimodal Dataset Specification (Datasets A, B, C)</span>
            </h2>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Every synthetic sequence generated by VYOM DRISHTI AI includes complete frame-by-frame annotations for computer vision model training, benchmark evaluation, and flight compliance auditing.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 block">Dataset A: Success Sequences</span>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                  Nominal execution (1→2→3→4→5). Evaluates standard speed, varied zero-g roll/pitch angles, and smooth hand-object grasp vectors.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <span className="font-bold text-amber-600 dark:text-amber-400 block">Dataset B: Procedural Deviations</span>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                  Out-of-Sequence (1→2→4→3→5) and Skipped-Step (1→2→4→5 missing Step 3). Tests immediate procedural deviation detection.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 space-y-2">
                <span className="font-bold text-red-600 dark:text-red-400 block">Dataset C: Anomalous Actions</span>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                  Wrong tool interactions, hazardous high-voltage contacts, and erratic posture drift in microgravity.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] space-y-2 border border-slate-800">
              <span className="text-cyan-400 font-bold block">Multimodal JSON Sample Schema:</span>
              <pre className="overflow-x-auto text-slate-300">{`
{
  "frameId": 142,
  "timestampMs": 4733,
  "stepNumber": 4,
  "stepCode": "SCI-STP-04",
  "astronautBoundingBox": { "x": 0.35, "y": 0.20, "width": 0.30, "height": 0.72, "confidence": 0.985 },
  "poseKeypoints": [
    { "name": "nose", "x": 0.50, "y": 0.28, "score": 0.98 },
    { "name": "right_wrist", "x": 0.52, "y": 0.46, "score": 0.97 }
  ],
  "jointAngles": { "rightElbow": 142, "leftElbow": 140, "rightShoulder": 52, "leftShoulder": 45 },
  "detectedObjects": [
    { "id": "obj-microfluidic-cartridge-dock", "name": "Microfluidic-Cartridge-Dock", "x": 0.50, "y": 0.44, "width": 0.15, "height": 0.18 }
  ],
  "hoiVector": {
    "active": true,
    "hand": "RIGHT",
    "targetObject": "Microfluidic-Cartridge-Dock",
    "distance3dMeters": 0.082,
    "startX": 0.52, "startY": 0.46, "endX": 0.575, "endY": 0.53
  },
  "actionLabel": "INSTALL_SAMPLE_CARTRIDGE",
  "actionConfidence": 0.965,
  "isStandardCompliant": true,
  "cameraViewAngle": "FRONT_RACK",
  "astronautOrientation": "NORMAL_UPRIGHT"
}
              `}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Modular AI Interfaces */}
      {activeTab === 'INTERFACES' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCode className="w-5 h-5 text-purple-500" />
              <span>Modular TypeScript & Edge C++ Interface Contracts</span>
            </h2>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Every stage of the vision pipeline conforms to clean, loosely coupled interfaces allowing drop-in replacement of lightweight in-browser neural models (MoveNet, BlazePose) with custom quantized tensor engines (INT8 ONNX, TensorRT, or edge NPUs).
            </p>

            <div className="p-4 rounded-xl bg-slate-950 text-cyan-300 font-mono text-[11px] overflow-x-auto border border-slate-800">
              <pre>{`
export interface IObjectDetector {
  id: string;
  detect(frame: HTMLCanvasElement | ImageData): Promise<{ objects: BoundingBox[]; latencyMs: number }>;
}

export interface IPoseEstimator {
  id: string;
  estimatePose(frame: HTMLCanvasElement | HTMLVideoElement): Promise<{
    keypoints: PoseKeypoint[];
    score: number;
    jointAngles: Record<string, number>;
    latencyMs: number;
  }>;
}

export interface IHOIDetector {
  id: string;
  evaluateInteraction(keypoints: PoseKeypoint[], objects: BoundingBox[]): HandObjectInteraction;
}

export interface IActivityRecognizer {
  id: string;
  classifyAction(keypoints: PoseKeypoint[], jointAngles: Record<string, number>, hoi: HandObjectInteraction): {
    actionName: string;
    confidence: number;
    isMicrogravityNormal: boolean;
  };
}

export interface ISequenceEngine {
  validateStepProgression(protocol: ExperimentProtocol, currentStepIndex: number, detectedAction: string, hoi: HandObjectInteraction): ValidationResult;
}
              `}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Zero-G Kinematics */}
      {activeTab === 'ZERO_G' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-cyan-500" />
              <span>Orientation-Agnostic Coordinate Reference Frames</span>
            </h2>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              In microgravity (such as aboard the Bharatiya Antariksh Station), astronauts operate in full 6-DOF floating postures (pitch inverted -180°, sideways roll +90°). Conventional gravity-aligned pose algorithms produce false classifications when the body is inverted.
            </p>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <span className="font-bold text-slate-900 dark:text-white block">Payload Rack Origin Frame Transformation:</span>
              <p className="text-slate-600 dark:text-slate-300">
                1. <strong>Origin Anchor:</strong> Center-front datum point of EXPRESS Rack-04 [X0, Y0, Z0] = [0, 0, 0].
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                2. <strong>Body-Relative Joint Vectors:</strong> Elbow and shoulder flexion angles are computed via interior vector dot products arccos( (u · v) / (|u| |v|) ), which remain completely invariant under arbitrary 3D rigid body rotations in SO(3).
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                3. <strong>HOI Proximity:</strong> Euclidean distance is calculated between glove mesh vertices (P_hand) and object centroids (P_obj) in payload rack coordinates.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Offline Edge Self-Sufficiency */}
      {activeTab === 'OFFLINE' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span>100% Offline Standalone Operation</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <span className="font-bold text-slate-900 dark:text-white block">Edge Neural Inference</span>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                  TensorFlow.js WebGL and MoveNet run 100% in-browser on local GPU/NPU cores with 0 network calls required.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <span className="font-bold text-slate-900 dark:text-white block">Offline Voice Guidance</span>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                  Web Speech SpeechSynthesis operates completely offline using built-in system phonetic voices.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <span className="font-bold text-slate-900 dark:text-white block">Local Video Blackbox</span>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                  MediaRecorder streams raw and annotated frames directly to client memory and downloads local `.webm` files.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <span className="font-bold text-slate-900 dark:text-white block">Cryptographic Flight Logs</span>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                  Every sequence verification event is cryptographically hash-sealed locally and exportable to JSON/CSV.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Adding New Protocols */}
      {activeTab === 'PROTOCOLS' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <span>How to Define and Register New Scientific Protocols</span>
            </h2>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Adding a new multi-step scientific experiment to VYOM DRISHTI AI requires appending an entry to <code className="text-blue-500 font-mono">EXPERIMENT_PROTOCOLS</code> in <code className="text-cyan-500 font-mono">src/services/mockData.ts</code>:
            </p>

            <div className="p-4 rounded-xl bg-slate-950 text-cyan-300 font-mono text-[11px] overflow-x-auto border border-slate-800">
              <pre>{`
{
  id: 'exp-custom-bio-01',
  code: 'BAS-BIO-CUSTOM',
  name: 'Microgravity Plant Seed Fixation',
  totalSteps: 3,
  steps: [
    {
      stepNumber: 1,
      stepCode: 'CUST-STP-01',
      title: 'Retrieve Seed Pod',
      expectedAction: 'Extract seed cassette from incubator',
      targetObject: 'Seed-Pod-A1',
      validationRules: {
        requiredObjects: ['Seed-Pod-A1'],
        requiredHandInteraction: 'GRIP'
      }
    }
  ]
}
              `}</pre>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
