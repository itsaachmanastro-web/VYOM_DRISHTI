import React, { useState, useEffect } from 'react';
import { useMissionStore } from '../../store/missionStore';
import { 
  PlayCircle, 
  Cpu, 
  HardDrive, 
  Radio, 
  ShieldCheck, 
  Code, 
  Copy, 
  Check, 
  Wifi, 
  WifiOff, 
  Video, 
  Send, 
  RotateCw, 
  Trash2, 
  Download, 
  Play, 
  Pause, 
  Maximize2, 
  X, 
  ChevronRight, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Layers, 
  Database, 
  ExternalLink,
  Search,
  Filter,
  RefreshCw,
  Signal,
  Eye,
  Sliders
} from 'lucide-react';
import { videoRecorderService } from '../../services/videoRecorderService';

interface VideoRecordingItem {
  id: string;
  filename: string;
  camera: string;
  duration: string;
  resolution: string;
  sizeMb: number;
  validationState: 'VALIDATED' | 'PROCESSING' | 'FLAGGED';
  storageLocation: string;
  timestamp: string;
  videoUrl?: string;
}

interface UplinkPacketItem {
  id: string;
  type: 'HOI_TELEMETRY' | 'STEP_CONFIRMATION' | 'ANOMALY_VECTOR' | 'KEYPOINT_BURST';
  sizeKb: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  createdMet: string;
  createdUtc: string;
  status: 'READY' | 'QUEUED' | 'TRANSMITTING' | 'SENT' | 'FAILED';
  destination: string;
}

interface TransmissionLogItem {
  utcTime: string;
  packetId: string;
  payload: string;
  size: string;
  destination: string;
  status: 'SENT' | 'READY' | 'FAILED' | 'QUEUED';
  latencyMs: number;
  integrity: 'VALID' | 'CORRUPTED';
}

export const OfflineUplinkManager: React.FC = () => {
  const { 
    telemetry, 
    activeProtocol, 
    currentStepIndex,
    executionRecords,
    addNotification 
  } = useMissionStore();

  // Active Tab: 'telemetry' | 'recordings' | 'queue' | 'logs'
  const [activeTab, setActiveTab] = useState<'telemetry' | 'recordings' | 'queue' | 'logs'>('telemetry');

  // Low-BW Mode State
  const [isLowBwMode, setIsLowBwMode] = useState<boolean>(true);

  // Orbital Pass Simulation Modal State
  const [isOrbitalModalOpen, setIsOrbitalModalOpen] = useState<boolean>(false);
  const [isSimulatingPass, setIsSimulatingPass] = useState<boolean>(false);
  const [passCountdown, setPassCountdown] = useState<number>(522); // ~8m 42s in seconds
  const [passTransmissionProgress, setPassTransmissionProgress] = useState<number>(0);

  // Copy Feedback
  const [hasCopiedJson, setHasCopiedJson] = useState<boolean>(false);
  const [hasCopiedHash, setHasCopiedHash] = useState<boolean>(false);

  // Video Recordings State
  const [recordings, setRecordings] = useState<VideoRecordingItem[]>([
    {
      id: 'REC-0814-CAM0',
      filename: 'cam0_overhead_run0814.webm',
      camera: 'CAM-01 (Overhead Bay)',
      duration: '04m 12s',
      resolution: '1920x1080 @ 30fps',
      sizeMb: 24.5,
      validationState: 'VALIDATED',
      storageLocation: '/data/videos/cam0_overhead_run0814.webm',
      timestamp: '2026-09-28 19:55:00 UTC'
    },
    {
      id: 'REC-0814-CAM1',
      filename: 'cam1_rack_front_run0814.webm',
      camera: 'CAM-02 (Express Rack C4)',
      duration: '03m 45s',
      resolution: '1920x1080 @ 30fps',
      sizeMb: 18.2,
      validationState: 'VALIDATED',
      storageLocation: '/data/videos/cam1_rack_front_run0814.webm',
      timestamp: '2026-09-28 19:55:00 UTC'
    },
    {
      id: 'REC-0814-SYNC',
      filename: 'blackbox_sync_stream.mp4',
      camera: 'CAM-SYNC (Genlock Multi-angle)',
      duration: '02m 30s',
      resolution: '1280x720 @ 60fps',
      sizeMb: 8.5,
      validationState: 'VALIDATED',
      storageLocation: '/data/videos/blackbox_sync_stream.mp4',
      timestamp: '2026-09-28 19:58:30 UTC'
    }
  ]);

  // Selected Video Preview Modal
  const [previewVideo, setPreviewVideo] = useState<VideoRecordingItem | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(true);

  // Live Video Ingestion / Recording State
  const [isLiveRecording, setIsLiveRecording] = useState<boolean>(false);

  // Uplink Queue State
  const [uplinkQueue, setUplinkQueue] = useState<UplinkPacketItem[]>([
    {
      id: '#27',
      type: 'HOI_TELEMETRY',
      sizeKb: 2.4,
      priority: 'HIGH',
      createdMet: 'T+04:22:15',
      createdUtc: '2026-09-28 20:21:58',
      status: 'READY',
      destination: 'ISTRAC Ground Control (Bengaluru)'
    },
    {
      id: '#28',
      type: 'STEP_CONFIRMATION',
      sizeKb: 0.8,
      priority: 'HIGH',
      createdMet: 'T+04:22:30',
      createdUtc: '2026-09-28 20:22:10',
      status: 'QUEUED',
      destination: 'ISTRAC Ground Control (Bengaluru)'
    }
  ]);

  // Transmission Logs History State
  const [transmissionLogs, setTransmissionLogs] = useState<TransmissionLogItem[]>([
    {
      utcTime: '20:04:17',
      packetId: '#27',
      payload: 'BAS-SCI-01',
      size: '2.4 KB',
      destination: 'Ground Control',
      status: 'READY',
      latencyMs: 17.6,
      integrity: 'VALID'
    },
    {
      utcTime: '19:58:45',
      packetId: '#26',
      payload: 'BAS-SCI-01',
      size: '1.8 KB',
      destination: 'Ground Control',
      status: 'SENT',
      latencyMs: 16.2,
      integrity: 'VALID'
    },
    {
      utcTime: '19:52:10',
      packetId: '#25',
      payload: 'BAS-SCI-01',
      size: '2.1 KB',
      destination: 'Ground Control',
      status: 'SENT',
      latencyMs: 18.4,
      integrity: 'VALID'
    },
    {
      utcTime: '19:45:00',
      packetId: '#24',
      payload: 'BAS-SCI-01',
      size: '0.9 KB',
      destination: 'Ground Control',
      status: 'SENT',
      latencyMs: 15.8,
      integrity: 'VALID'
    },
    {
      utcTime: '19:38:22',
      packetId: '#23',
      payload: 'BAS-SCI-01',
      size: '3.4 KB',
      destination: 'Ground Control',
      status: 'SENT',
      latencyMs: 19.1,
      integrity: 'VALID'
    }
  ]);

  const [logSearchQuery, setLogSearchQuery] = useState<string>('');

  // Structured Real Telemetry Packet matching prompt specifications
  const activeStep = activeProtocol.steps[currentStepIndex] || activeProtocol.steps[1] || {
    id: 'step-02',
    name: 'Collect Sample Vial',
    actionRequired: 'COLLECT_SAMPLE_VIAL',
    targetEquipment: 'Sample-Container'
  };

  const structuredPacket = {
    packetHeader: {
      mission: 'BAS-EXP-2026-ALPHA',
      payloadId: activeProtocol.code || 'BAS-SCI-01',
      met: 'T+04:22:15',
      timestampUtc: '2026-09-28T20:21:58.091Z',
      sequenceValidation: 'CORRECT'
    },
    activeState: {
      stepIndex: 2,
      action: 'COLLECT_SAMPLE_VIAL',
      confidence: 0.982,
      roiTarget: 'Sample-Container',
      gScore: 0.964
    },
    telemetry: {
      astronautDetected: true,
      poseKeypoints: 17,
      camera: {
        id: 'CAM-01',
        mode: 'RGBD',
        resolution: '1280x720',
        alignment: 'Rack-C4',
        calibration_status: 'OK'
      }
    }
  };

  const packetJsonString = JSON.stringify(structuredPacket, null, 2);
  const securityHash = 'a9f8e7d6cb5038f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0e9f8';

  // Copy to clipboard handlers
  const handleCopyJson = () => {
    navigator.clipboard.writeText(packetJsonString);
    setHasCopiedJson(true);
    setTimeout(() => setHasCopiedJson(false), 2000);
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(securityHash);
    setHasCopiedHash(true);
    setTimeout(() => setHasCopiedHash(false), 2000);
  };

  // Transmit next packet handler
  const handleTransmitNext = (packetId?: string) => {
    const targetId = packetId || uplinkQueue.find(p => p.status === 'READY' || p.status === 'QUEUED')?.id;
    if (!targetId) return;

    setUplinkQueue(prev => prev.map(p => p.id === targetId ? { ...p, status: 'TRANSMITTING' } : p));

    setTimeout(() => {
      setUplinkQueue(prev => prev.map(p => p.id === targetId ? { ...p, status: 'SENT' } : p));
      
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      setTransmissionLogs(prev => [
        {
          utcTime: timeStr,
          packetId: targetId,
          payload: activeProtocol.code || 'BAS-SCI-01',
          size: '2.4 KB',
          destination: 'Ground Control',
          status: 'SENT',
          latencyMs: parseFloat((16 + Math.random() * 3).toFixed(1)),
          integrity: 'VALID'
        },
        ...prev
      ]);

      addNotification({
        title: `Telemetry Packet ${targetId} Transmitted`,
        message: 'Successfully downlinked structured packet to ISTRAC Ground Control.',
        type: 'SYSTEM',
        sourceModule: 'Offline Uplink Controller'
      });
    }, 700);
  };

  // Clear completed packets handler
  const handleClearCompleted = () => {
    setUplinkQueue(prev => prev.filter(p => p.status !== 'SENT'));
  };

  // Retry failed packets handler
  const handleRetryFailed = () => {
    setUplinkQueue(prev => prev.map(p => p.status === 'FAILED' ? { ...p, status: 'READY' } : p));
  };

  // Delete recording handler
  const handleDeleteRecording = (id: string) => {
    setRecordings(prev => prev.filter(r => r.id !== id));
  };

  // Orbital Pass Simulation Execution
  const handleExecutePassDownlink = () => {
    setIsSimulatingPass(true);
    setPassTransmissionProgress(0);

    const interval = setInterval(() => {
      setPassTransmissionProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSimulatingPass(false);
          setUplinkQueue(queue => queue.map(p => ({ ...p, status: 'SENT' })));
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  // Dynamic storage calculation
  const totalDiskGb = 512.0;
  const usedDiskGb = 412.8;
  const storagePercentage = ((usedDiskGb / totalDiskGb) * 100).toFixed(1);

  const standbyPacketCount = uplinkQueue.filter(p => p.status === 'READY' || p.status === 'QUEUED').length;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1440px] mx-auto select-none transition-colors duration-200">
      
      {/* 1. Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">Recordings</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 dark:text-slate-200 font-semibold">Offline Uplink Controller</span>
      </div>

      {/* 2. Page Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Recordings & Offline Uplink Controller
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              On-board blackbox video recordings, cryptographic telemetry packets & deep-space downlink queue
            </p>
          </div>
        </div>

        {/* Right-Side Header Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsOrbitalModalOpen(true)}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 bg-white dark:bg-slate-900 shadow-sm"
          >
            <Radio className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Simulate Orbital Pass</span>
          </button>
          
          <button
            onClick={() => setIsLowBwMode(!isLowBwMode)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition shadow-sm border ${
              isLowBwMode
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-white text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            <Signal className="w-3.5 h-3.5" />
            <span>Low-BW Mode</span>
          </button>
        </div>
      </div>

      {/* Low-BW Mode Simulation Banner */}
      {isLowBwMode && (
        <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold">LOW-BANDWIDTH MODE ACTIVE (SIMULATION):</span>
            <span className="text-emerald-700 dark:text-emerald-400">
              Structured JSON telemetry packets prioritized at 2.4 kbps. Full 1080p video records remain stored on NVMe SSD for AOS downlink passes.
            </span>
          </div>
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
            94.6% Bandwidth Conserved
          </span>
        </div>
      )}

      {/* 3. Top 4 Information Metric Cards (Grid of 4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Edge AI Pipeline */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-start gap-3.5 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center shrink-0">
            <Eye className="w-5 h-5" />
          </div>
          <div className="space-y-0.5 flex-1 min-w-0">
            <div className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              EDGE AI PIPELINE
            </div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white">
              100% Local Inference
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
              Zero cloud latency dependencies
            </div>
          </div>
        </div>

        {/* Card 2: Local Blackbox SSD */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-start gap-3.5 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1 min-w-0">
            <div className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              LOCAL BLACKBOX SSD
            </div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white flex items-center justify-between">
              <span>{usedDiskGb} GB / {totalDiskGb} GB</span>
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">{storagePercentage}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full" style={{ width: `${storagePercentage}%` }} />
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
              Uncompressed 1080p recordings
            </div>
          </div>
        </div>

        {/* Card 3: Transmission Queue */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-start gap-3.5 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center shrink-0">
            <Radio className="w-5 h-5" />
          </div>
          <div className="space-y-0.5 flex-1 min-w-0">
            <div className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              TRANSMISSION QUEUE
            </div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white">
              {standbyPacketCount} Packets Standby
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
              Automatic relay on next AOS pass
            </div>
          </div>
        </div>

        {/* Card 4: Security Seal */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-start gap-3.5 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-0.5 flex-1 min-w-0">
            <div className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              SECURITY SEAL
            </div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white">
              SHA-256 HMAC
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
              Cryptographically protected
            </div>
          </div>
        </div>

      </div>

      {/* 4. Tab Navigation Ribbon */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pt-2">
        <div className="flex items-center gap-6 text-xs">
          
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`pb-3 font-semibold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'telemetry'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Telemetry Packet Preview</span>
          </button>

          <button
            onClick={() => setActiveTab('recordings')}
            className={`pb-3 font-semibold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'recordings'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Video Recordings</span>
          </button>

          <button
            onClick={() => setActiveTab('queue')}
            className={`pb-3 font-semibold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'queue'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Uplink Queue</span>
            {standbyPacketCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                {standbyPacketCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`pb-3 font-semibold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'logs'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Transmission Logs</span>
          </button>

        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 pb-3">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Ready for Uplink</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: TELEMETRY PACKET PREVIEW (Default View Matching Reference) */}
      {/* ========================================================================= */}
      {activeTab === 'telemetry' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Left Column (8 / 12 ~ 67% to 72%): Structured JSON Code Surface */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            
            {/* JSON Viewer Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xs font-bold text-slate-900 dark:text-white">
                  Structured JSON Packet (2.4 KB)
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  Packet #27
                </span>
                
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 hidden sm:inline">
                  28 Sep 2026 20:04:17 UTC
                </span>

                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800">
                  VALID
                </span>

                <div className="px-2 py-0.5 rounded text-[11px] font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80">
                  Formatted JSON ⌵
                </div>

                <button
                  onClick={handleCopyJson}
                  className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition"
                  title="Copy JSON to clipboard"
                >
                  {hasCopiedJson ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{hasCopiedJson ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Dark Scientific Code Editor Surface */}
            <div className="bg-[#0B1120] text-slate-100 rounded-xl border border-slate-800/80 p-4 font-mono text-xs leading-relaxed overflow-x-auto shadow-inner flex">
              
              {/* Line Numbers Gutter */}
              <div className="select-none text-slate-600 text-right pr-4 border-r border-slate-800/80 space-y-0.5 font-mono text-xs shrink-0">
                <div>1</div>
                <div>2</div>
                <div>3</div>
                <div>4</div>
                <div>5</div>
                <div>6</div>
                <div>7</div>
                <div>8</div>
                <div>9</div>
                <div>10</div>
                <div>11</div>
                <div>12</div>
                <div>13</div>
                <div>14</div>
                <div>15</div>
                <div>16</div>
                <div>17</div>
                <div>18</div>
                <div>19</div>
                <div>20</div>
              </div>

              {/* Formatted Code Block */}
              <div className="pl-4 space-y-0.5 min-w-[420px]">
                <div><span className="text-slate-400">{'{'}</span></div>
                
                {/* packetHeader */}
                <div className="pl-4">
                  <span className="text-cyan-300">"packetHeader"</span><span className="text-slate-400">: {'{'}</span>
                </div>
                <div className="pl-8">
                  <span className="text-cyan-300">"mission"</span><span className="text-slate-400">: </span><span className="text-amber-300">"BAS-EXP-2026-ALPHA"</span><span className="text-slate-400">,</span>
                </div>
                <div className="pl-8">
                  <span className="text-cyan-300">"payloadId"</span><span className="text-slate-400">: </span><span className="text-amber-300">"BAS-SCI-01"</span><span className="text-slate-400">,</span>
                </div>
                <div className="pl-8">
                  <span className="text-cyan-300">"met"</span><span className="text-slate-400">: </span><span className="text-amber-300">"T+04:22:15"</span><span className="text-slate-400">,</span>
                </div>
                <div className="pl-8">
                  <span className="text-cyan-300">"timestampUtc"</span><span className="text-slate-400">: </span><span className="text-amber-300">"2026-09-28T20:21:58.091Z"</span><span className="text-slate-400">,</span>
                </div>
                <div className="pl-8">
                  <span className="text-cyan-300">"sequenceValidation"</span><span className="text-slate-400">: </span><span className="text-emerald-400 font-bold">"CORRECT"</span>
                </div>
                <div className="pl-4"><span className="text-slate-400">{'}'},</span></div>

                {/* activeState */}
                <div className="pl-4">
                  <span className="text-cyan-300">"activeState"</span><span className="text-slate-400">: {'{'}</span>
                </div>
                <div className="pl-8">
                  <span className="text-cyan-300">"stepIndex"</span><span className="text-slate-400">: </span><span className="text-purple-300 font-bold">2</span><span className="text-slate-400">,</span>
                </div>
                <div className="pl-8">
                  <span className="text-cyan-300">"action"</span><span className="text-slate-400">: </span><span className="text-amber-300">"COLLECT_SAMPLE_VIAL"</span><span className="text-slate-400">,</span>
                </div>
                <div className="pl-8">
                  <span className="text-cyan-300">"confidence"</span><span className="text-slate-400">: </span><span className="text-emerald-400">0.982</span><span className="text-slate-400">,</span>
                </div>
                <div className="pl-8">
                  <span className="text-cyan-300">"roiTarget"</span><span className="text-slate-400">: </span><span className="text-amber-300">"Sample-Container"</span><span className="text-slate-400">,</span>
                </div>
                <div className="pl-8">
                  <span className="text-cyan-300">"gScore"</span><span className="text-slate-400">: </span><span className="text-emerald-400">0.964</span>
                </div>
                <div className="pl-4"><span className="text-slate-400">{'}'},</span></div>

                {/* telemetry */}
                <div className="pl-4">
                  <span className="text-cyan-300">"telemetry"</span><span className="text-slate-400">: {'{'}</span>
                </div>
                <div className="pl-8">
                  <span className="text-cyan-300">"astronautDetected"</span><span className="text-slate-400">: </span><span className="text-emerald-400">true</span><span className="text-slate-400">,</span>
                </div>
                <div className="pl-8">
                  <span className="text-cyan-300">"poseKeypoints"</span><span className="text-slate-400">: </span><span className="text-purple-300">17</span><span className="text-slate-400">,</span>
                </div>
                <div className="pl-8">
                  <span className="text-cyan-300">"camera"</span><span className="text-slate-400">: {'{'}</span>
                </div>
                <div className="pl-12">
                  <span className="text-cyan-300">"id"</span><span className="text-slate-400">: </span><span className="text-amber-300">"CAM-01"</span><span className="text-slate-400">,</span>
                </div>
                <div className="pl-12">
                  <span className="text-cyan-300">"mode"</span><span className="text-slate-400">: </span><span className="text-amber-300">"RGBD"</span><span className="text-slate-400">,</span>
                </div>
                <div className="pl-12">
                  <span className="text-cyan-300">"resolution"</span><span className="text-slate-400">: </span><span className="text-amber-300">"1280x720"</span><span className="text-slate-400">,</span>
                </div>
                <div className="pl-12">
                  <span className="text-cyan-300">"alignment"</span><span className="text-slate-400">: </span><span className="text-amber-300">"Rack_C4"</span><span className="text-slate-400">,</span>
                </div>
                <div className="pl-12">
                  <span className="text-cyan-300">"calibration_status"</span><span className="text-slate-400">: </span><span className="text-emerald-400">"OK"</span>
                </div>
                <div className="pl-8"><span className="text-slate-400">{'}'}</span></div>
                <div className="pl-4"><span className="text-slate-400">{'}'}</span></div>
                <div><span className="text-slate-400">{'}'}</span></div>
              </div>

            </div>

          </div>

          {/* Right Column (4 / 12 ~ 28% to 33%): 3 Clean Information Cards */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Card 1: Packet Details */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Packet Details
              </h3>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                <div className="py-2 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Packet ID</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">#27</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">MET Timestamp</span>
                  <span className="font-mono text-slate-900 dark:text-white">T+04:22:15</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">UTC Timestamp</span>
                  <span className="font-mono text-slate-900 dark:text-white">2026-09-28 20:21:58</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Size</span>
                  <span className="font-mono text-slate-900 dark:text-white">2.4 KB</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Validation</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">CORRECT</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Mission</span>
                  <span className="font-mono text-slate-900 dark:text-white">BAS-EXP-2026-ALPHA</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Payload ID</span>
                  <span className="font-mono text-slate-900 dark:text-white">BAS-SCI-01</span>
                </div>
              </div>
            </div>

            {/* Card 2: Current Experiment Step */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <Code className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Current Experiment Step</span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                <div className="py-2 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Step Index</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">2</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Action</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">COLLECT_SAMPLE_VIAL</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Confidence</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">98.2%</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">ROI Target</span>
                  <span className="font-mono text-slate-900 dark:text-white">Sample-Container</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">G-Score</span>
                  <span className="font-mono text-slate-900 dark:text-white">0.964</span>
                </div>
              </div>
            </div>

            {/* Card 3: Security Seal */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Security Seal</span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                <div className="py-2 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Algorithm</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">SHA-256</span>
                </div>
                <div className="py-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Hash</span>
                    <button
                      onClick={handleCopyHash}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition p-1"
                      title="Copy full cryptographic hash"
                    >
                      {hasCopiedHash ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="font-mono text-[11px] text-slate-600 dark:text-slate-300 break-all bg-slate-50 dark:bg-slate-800/50 p-2 rounded border border-slate-200/60 dark:border-slate-700/60">
                    a9f8e7d6cb5...3d21b0e9f8
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: VIDEO RECORDINGS */}
      {/* ========================================================================= */}
      {activeTab === 'recordings' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                On-Board Blackbox Video Records ({recordings.length} files)
              </h2>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  alert("Live recording pipeline active. Video buffer streaming to /data/videos partition.");
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition shadow-sm"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Capture Blackbox Clip</span>
              </button>
            </div>
          </div>

          {/* Recordings Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                  <th className="py-3 px-4">Recording ID / Filename</th>
                  <th className="py-3 px-4">Camera Source</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Resolution</th>
                  <th className="py-3 px-4">File Size</th>
                  <th className="py-3 px-4">Validation State</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
                {recordings.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{rec.id}</div>
                      <div className="text-slate-500 text-[10px]">{rec.filename}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-sans">
                      {rec.camera}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {rec.duration}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {rec.resolution}
                    </td>
                    <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">
                      {rec.sizeMb} MB
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800">
                        {rec.validationState}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setPreviewVideo(rec)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-400 dark:hover:bg-blue-900/60 font-semibold text-xs transition"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Preview</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            const blob = new Blob(["VYOM_DRISHTI_RAW_VIDEO_STREAM"], { type: 'video/webm' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = rec.filename;
                            a.click();
                            a.remove();
                          }}
                          className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                          title="Download recording"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteRecording(rec.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                          title="Delete recording from NVMe partition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Storage Path: <span className="font-mono text-blue-600 dark:text-blue-400">/data/videos/</span> (Encrypted local disk partition)</span>
            <span>Zero cloud uploads in Low-BW mode</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: UPLINK QUEUE */}
      {/* ========================================================================= */}
      {activeTab === 'queue' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Telemetry & Video Packet Uplink Queue ({uplinkQueue.length} items)
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleTransmitNext()}
                disabled={standbyPacketCount === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition shadow-sm disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transmit Next</span>
              </button>

              <button
                onClick={handleRetryFailed}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Failed</span>
              </button>

              <button
                onClick={handleClearCompleted}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Completed</span>
              </button>
            </div>
          </div>

          {/* Queue Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                  <th className="py-3 px-4">Packet ID</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Created (MET / UTC)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
                {uplinkQueue.map((pkt) => (
                  <tr key={pkt.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {pkt.id}
                    </td>
                    <td className="py-3 px-4 text-blue-600 dark:text-blue-400 font-bold">
                      {pkt.type}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      {pkt.sizeKb} KB
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        pkt.priority === 'HIGH'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                      }`}>
                        {pkt.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {pkt.createdMet} • {pkt.createdUtc}
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        pkt.status === 'READY'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400'
                          : pkt.status === 'TRANSMITTING'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-400 animate-pulse'
                          : pkt.status === 'SENT'
                          ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {pkt.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-sans truncate max-w-[200px]">
                      {pkt.destination}
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      {pkt.status === 'READY' && (
                        <button
                          onClick={() => handleTransmitNext(pkt.id)}
                          className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition"
                        >
                          Transmit
                        </button>
                      )}
                      {pkt.status === 'SENT' && (
                        <span className="text-slate-400 text-xs flex items-center justify-end gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-500" /> Relayed
                        </span>
                      )}
                      {pkt.status === 'TRANSMITTING' && (
                        <span className="text-blue-600 dark:text-blue-400 text-xs font-semibold animate-pulse">
                          Transmitting...
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: TRANSMISSION LOGS */}
      {/* ========================================================================= */}
      {activeTab === 'logs' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Cryptographic Ground Uplink Transmission History
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter logs..."
                  value={logSearchQuery}
                  onChange={(e) => setLogSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={() => {
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(transmissionLogs, null, 2));
                  const a = document.createElement('a');
                  a.href = dataStr;
                  a.download = `transmission_logs_${Date.now()}.json`;
                  a.click();
                  a.remove();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
            </div>
          </div>

          {/* Logs Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                  <th className="py-3 px-4">UTC Time</th>
                  <th className="py-3 px-4">Packet ID</th>
                  <th className="py-3 px-4">Payload</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Latency</th>
                  <th className="py-3 px-4 text-right">Integrity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
                {transmissionLogs
                  .filter(l => !logSearchQuery || l.packetId.includes(logSearchQuery) || l.payload.includes(logSearchQuery))
                  .map((log, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-sans">
                        {log.utcTime}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {log.packetId}
                      </td>
                      <td className="py-3 px-4 text-blue-600 dark:text-blue-400">
                        {log.payload}
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                        {log.size}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-sans">
                        {log.destination}
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.status === 'SENT'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                            : 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {log.latencyMs} ms
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {log.integrity}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Video Preview Modal */}
      {/* ========================================================================= */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    {previewVideo.filename}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {previewVideo.camera} • {previewVideo.resolution}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewVideo(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Video Canvas / Stream Player */}
            <div className="relative bg-slate-950 aspect-video flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
                <div className="w-16 h-16 rounded-full bg-blue-600/30 border border-blue-400/50 flex items-center justify-center text-blue-400 animate-pulse">
                  <Play className="w-8 h-8 fill-current ml-1" />
                </div>
                <div>
                  <div className="font-mono text-sm font-bold text-white tracking-wider">
                    BLACKBOX ON-BOARD FEED REPLAY
                  </div>
                  <div className="font-mono text-xs text-slate-400 mt-1">
                    Frame Timestamp: 2026-09-28 20:04:17.412 UTC • 1080p WebM
                  </div>
                </div>
              </div>

              {/* HUD Overlay Badges */}
              <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/60 backdrop-blur-md text-[10px] font-mono text-emerald-400 border border-emerald-500/30">
                ● LIVE BUFFER SYNC
              </div>
              <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black/60 backdrop-blur-md text-[10px] font-mono text-white/80">
                BITRATE: 45.0 Mbps UNCOMPRESSED
              </div>
            </div>

            {/* Video Controls Bar */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlayingPreview(!isPlayingPreview)}
                  className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  {isPlayingPreview ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                </button>
                <span className="font-mono text-xs text-slate-600 dark:text-slate-300">
                  01:42 / {previewVideo.duration}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewVideo(null)}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition"
                >
                  Close Player
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Simulate Orbital Pass & Downlink Modal */}
      {/* ========================================================================= */}
      {isOrbitalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Simulate Orbital Pass & Ground Downlink
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    AOS contact with ISTRAC 32m Deep-Space Ground Antenna
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOrbitalModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Metrics */}
            <div className="p-6 space-y-4 text-xs">
              
              <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-900 dark:text-blue-200">Orbital Phase:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    AOS In Contact
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Ground Target:</span>
                  <span className="font-medium text-slate-900 dark:text-white">ISTRAC Ground Station, Bengaluru</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Downlink Bandwidth:</span>
                  <span className="font-mono text-slate-900 dark:text-white">128.0 kbps (S-Band Direct)</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Packets in Buffer:</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{standbyPacketCount} Structured Packets (3.2 KB)</span>
                </div>
              </div>

              {/* Transmission Progress */}
              {isSimulatingPass && (
                <div className="space-y-2">
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">Transmitting telemetry packets...</span>
                    <span>{passTransmissionProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full transition-all duration-200" style={{ width: `${passTransmissionProgress}%` }} />
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                100% Deterministic aerospace relay simulation
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsOrbitalModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition"
                >
                  Close
                </button>
                <button
                  onClick={handleExecutePassDownlink}
                  disabled={isSimulatingPass || standbyPacketCount === 0}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition shadow-sm disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Execute Downlink Relay</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default OfflineUplinkManager;
