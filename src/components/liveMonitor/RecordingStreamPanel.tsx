import React, { useState } from 'react';
import { useMissionStore } from '../../store/missionStore';
import { 
  Video, 
  Disc, 
  Square, 
  HardDrive, 
  Radio, 
  Cast, 
  CheckCircle2, 
  AlertCircle, 
  Server, 
  Wifi, 
  ShieldAlert,
  Download
} from 'lucide-react';

export const RecordingStreamPanel: React.FC = () => {
  const { 
    isRecording, 
    recordingStatus,
    startLocalRecording, 
    stopLocalRecording, 
    isStreaming, 
    streamEndpoint, 
    streamingStatus, 
    startStreaming, 
    stopStreaming, 
    setStreamEndpoint,
    telemetry 
  } = useMissionStore();

  const [inputUrl, setInputUrl] = useState(streamEndpoint);

  const handleToggleRecord = () => {
    if (isRecording) {
      stopLocalRecording();
    } else {
      // Find active canvas
      const canvas = document.querySelector('canvas') as HTMLCanvasElement | null;
      if (canvas) {
        startLocalRecording(canvas);
      }
    }
  };

  const handleToggleStream = () => {
    if (isStreaming) {
      stopStreaming();
    } else {
      setStreamEndpoint(inputUrl);
      startStreaming();
    }
  };

  const usedDiskPercent = Math.round(((telemetry.localDiskTotalGb - telemetry.localDiskFreeGb) / telemetry.localDiskTotalGb) * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      
      {/* 1. Local Video Recording & Storage Meter */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isRecording 
                ? 'bg-red-500/10 text-red-500 animate-pulse border border-red-500/30' 
                : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
            }`}>
              <Disc className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Local Video Recording</h4>
              <p className="text-[10px] text-slate-500">Zero-Loss Offline Blackbox Storage</p>
            </div>
          </div>

          <button
            onClick={handleToggleRecord}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm ${
              isRecording
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20 animate-pulse'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
            }`}
          >
            {isRecording ? (
              <>
                <Square className="w-3.5 h-3.5" />
                <span>Stop Recording</span>
              </>
            ) : (
              <>
                <Disc className="w-3.5 h-3.5" />
                <span>Record Video</span>
              </>
            )}
          </button>
        </div>

        {/* Local NVMe Storage Status */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
          <div className="flex justify-between items-center text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-slate-400" />
              <span>NVMe Blackbox Storage:</span>
            </span>
            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
              {telemetry.localDiskFreeGb.toFixed(1)} GB Free / {telemetry.localDiskTotalGb} GB
            </span>
          </div>

          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${usedDiskPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. RTSP / IP Camera Streaming Manager */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              streamingStatus === 'STREAMING'
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                : 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
            }`}>
              <Cast className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">IP / RTSP Stream Manager</h4>
              <p className="text-[10px] text-slate-500">On-Board IP Camera & Ground Gateway</p>
            </div>
          </div>

          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
            streamingStatus === 'STREAMING'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 animate-pulse'
              : streamingStatus === 'CONNECTING'
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
          }`}>
            {streamingStatus}
          </span>
        </div>

        {/* Stream Endpoint Input + Connect */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="rtsp://192.168.1.120:554/live/payload-rack-cam-01"
            className="flex-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          <button
            onClick={handleToggleStream}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              isStreaming
                ? 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                : 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm shadow-purple-500/20'
            }`}
          >
            {isStreaming ? 'Disconnect' : 'Connect'}
          </button>
        </div>
      </div>

    </div>
  );
};
