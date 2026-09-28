import React, { useEffect } from 'react';
import { useMissionStore } from '../../store/missionStore';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Radio, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Camera,
  ShieldCheck,
  Clock,
  Layers
} from 'lucide-react';
import { AerospaceBadge } from './AerospaceBadge';

export const TelemetryBar: React.FC = () => {
  const { 
    telemetry, 
    tickTelemetry, 
    isAudioMuted, 
    toggleAudioMute, 
    isVoiceGuidanceEnabled, 
    toggleVoiceGuidance,
    activeProtocol
  } = useMissionStore();

  useEffect(() => {
    const interval = setInterval(() => {
      tickTelemetry();
    }, 1000);
    return () => clearInterval(interval);
  }, [tickTelemetry]);

  const formatMET = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSecs % 3600) / 60).toString().padStart(2, '0');
    const seconds = Math.floor(totalSecs % 60).toString().padStart(2, '0');
    return `T+${hours}:${minutes}:${seconds}`;
  };

  const getUtcTime = () => {
    const now = new Date();
    return now.toISOString().substring(11, 19) + ' UTC';
  };

  return (
    <header className="bg-space-900 border-b border-space-border px-4 py-2 text-xs font-mono text-space-200 select-none">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Mission & Orbit Designation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border-r border-space-border/80 pr-3">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-display font-bold text-white tracking-widest text-sm uppercase">
              VYOM DRISHTI AI
            </span>
            <span className="text-[10px] bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded font-mono">
              BAS-EXP-2026
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-4 text-space-400">
            <div className="flex items-center gap-1.5">
              <span className="text-space-500">STATION:</span>
              <span className="text-space-200 font-semibold">BHARATIYA ANTARIKSH STATION (BAS)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-space-500">PAYLOAD:</span>
              <span className="text-cyan-300">{activeProtocol.code}</span>
            </div>
          </div>
        </div>

        {/* Center: Mission Clock (MET & UTC) */}
        <div className="flex items-center gap-4 bg-space-950/80 px-3 py-1 rounded border border-space-border/60">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-space-400 text-[11px]">MET:</span>
            <span className="text-cyan-300 font-bold text-sm tracking-widest">
              {formatMET(telemetry.metSeconds)}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1 border-l border-space-border/80 pl-3 text-space-400 text-[11px]">
            <span>{getUtcTime()}</span>
          </div>
        </div>

        {/* Right: Telemetry Health & Hardware Vitals */}
        <div className="flex items-center gap-3">
          {/* Edge NPU Load */}
          <div className="hidden md:flex items-center gap-1.5 bg-space-850 px-2 py-0.5 rounded border border-space-border">
            <Cpu className="w-3.5 h-3.5 text-space-400" />
            <span className="text-space-400">NPU:</span>
            <span className={`font-semibold ${telemetry.edgeNpuLoad > 85 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {telemetry.edgeNpuLoad}%
            </span>
            <span className="text-space-500">({telemetry.edgeLatencyMs}ms)</span>
          </div>

          {/* Edge FPS */}
          <div className="hidden sm:flex items-center gap-1.5 bg-space-850 px-2 py-0.5 rounded border border-space-border">
            <Activity className="w-3.5 h-3.5 text-space-400" />
            <span className="text-space-400">FPS:</span>
            <span className="text-cyan-300 font-semibold">{telemetry.edgeFps}</span>
          </div>

          {/* Local Storage Disk */}
          <div className="hidden xl:flex items-center gap-1.5 bg-space-850 px-2 py-0.5 rounded border border-space-border">
            <HardDrive className="w-3.5 h-3.5 text-space-400" />
            <span className="text-space-400">SSD:</span>
            <span className="text-space-200">{telemetry.localDiskFreeGb}GB Free</span>
          </div>

          {/* Offline / Low-BW Status */}
          <div className="flex items-center gap-1.5">
            <AerospaceBadge 
              status="ONLINE" 
              label="EDGE AI ACTIVE" 
              size="sm" 
            />
            <span className="hidden sm:inline-block">
              <AerospaceBadge 
                status={telemetry.networkStatus === 'LOW_BW_UPLINK' ? 'INFO' : 'WARNING'}
                label={telemetry.networkStatus === 'LOW_BW_UPLINK' ? 'LOW-BW UPLINK (2.4k)' : 'ORBITAL BLACKOUT'}
                size="sm"
              />
            </span>
          </div>

          {/* Audio Controls */}
          <div className="flex items-center gap-1 border-l border-space-border/80 pl-2">
            <button
              onClick={toggleAudioMute}
              title={isAudioMuted ? "Unmute avionics chimes" : "Mute avionics chimes"}
              className={`p-1.5 rounded transition ${isAudioMuted ? 'bg-rose-950/60 text-rose-400 border border-rose-800/50' : 'bg-space-800 text-space-300 hover:text-cyan-300'}`}
            >
              {isAudioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={toggleVoiceGuidance}
              title={isVoiceGuidanceEnabled ? "Disable TTS voice guidance" : "Enable TTS voice guidance"}
              className={`p-1.5 rounded transition ${!isVoiceGuidanceEnabled ? 'bg-amber-950/60 text-amber-400 border border-amber-800/50' : 'bg-space-800 text-space-300 hover:text-cyan-300'}`}
            >
              {isVoiceGuidanceEnabled ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
