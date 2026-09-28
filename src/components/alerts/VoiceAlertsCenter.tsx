import React, { useState } from 'react';
import { useMissionStore } from '../../store/missionStore';
import { SeverityLevel, VoiceAlertItem } from '../../types/mission';
import { 
  BellRing, 
  Volume2, 
  VolumeX, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Info, 
  Play, 
  Check, 
  Trash2,
  Filter
} from 'lucide-react';
import { AerospaceBadge } from '../common/AerospaceBadge';
import { audioService } from '../../services/audioService';

export const VoiceAlertsCenter: React.FC = () => {
  const { 
    alerts, 
    triggerAlert, 
    acknowledgeAlert, 
    clearAllAlerts, 
    isAudioMuted, 
    toggleAudioMute,
    isVoiceGuidanceEnabled,
    toggleVoiceGuidance
  } = useMissionStore();

  const [filterSeverity, setFilterSeverity] = useState<'ALL' | SeverityLevel>('ALL');

  const filteredAlerts = alerts.filter(a => filterSeverity === 'ALL' || a.severity === filterSeverity);

  const replayAudio = (alert: VoiceAlertItem) => {
    if (alert.soundType === 'SUCCESS') audioService.playSuccessTone();
    else if (alert.soundType === 'WARNING_BEEP') audioService.playWarningTone();
    else if (alert.soundType === 'ALARM') audioService.playCriticalAlarm();
    else audioService.playAvionicsChirp();

    audioService.speakGuidance(alert.spokenText, true);
  };

  const handleTestAlert = (type: SeverityLevel) => {
    switch (type) {
      case 'INFO':
        triggerAlert({
          title: 'Step 04 Inoculation Completed',
          message: 'All 25 microliters successfully dispensed into well channel.',
          severity: 'INFO',
          spokenText: 'Step 04 completed. Inoculation verified.',
          soundType: 'SUCCESS'
        });
        break;
      case 'WARNING':
        triggerAlert({
          title: 'Hand Proximity Advisory',
          message: 'Glove contact near unsealed thermal exhaust port.',
          severity: 'WARNING',
          spokenText: 'Caution: Maintain safe distance from thermal exhaust port.',
          soundType: 'WARNING_BEEP'
        });
        break;
      case 'SEQUENCE ERROR':
        triggerAlert({
          title: 'Experiment Sequence Deviation',
          message: 'Centrifuge insertion attempted before sealing vapor chamber.',
          severity: 'SEQUENCE ERROR',
          spokenText: 'Warning: Sequence deviation detected. Seal vapor chamber first.',
          soundType: 'WARNING_BEEP'
        });
        break;
      case 'CRITICAL':
        triggerAlert({
          title: 'Critical Bio-Containment Pressure Warning',
          message: 'Negative differential pressure drop detected in Glovebox BGU-1.',
          severity: 'CRITICAL',
          spokenText: 'Critical Alert: Biosafety glovebox pressure deviation. Secure seals immediately.',
          soundType: 'ALARM'
        });
        break;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-mono text-xs">
      
      {/* 1. Header Toolbar */}
      <div className="p-5 rounded-lg border border-space-border bg-space-900/90 tech-corner-decor">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-space-border/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded bg-amber-950/80 border border-amber-500/50 text-amber-400">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base tracking-wider">VOICE ALERTS & ACOUSTIC DISPATCHER</h2>
              <p className="text-space-400 text-[11px]">REAL-TIME AEROSPACE CAUTION & WARNING SYSTEM</p>
            </div>
          </div>

          {/* Master Audio Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleAudioMute}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded border transition ${
                isAudioMuted
                  ? 'bg-rose-950 text-rose-300 border-rose-600'
                  : 'bg-space-950 text-space-200 border-space-border hover:bg-space-850'
              }`}
            >
              {isAudioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isAudioMuted ? 'UNMUTE AVIONICS TONES' : 'AVIONICS AUDIO ON'}</span>
            </button>

            <button
              onClick={clearAllAlerts}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-space-950 hover:bg-space-850 text-space-300 border border-space-border transition"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Acknowledge All</span>
            </button>
          </div>
        </div>

        {/* Test Alert Dispatch Bar */}
        <div className="mt-4 pt-2 flex flex-wrap items-center justify-between gap-3">
          <span className="text-space-400 text-[11px]">DISPATCH SIMULATED ACOUSTIC ALERT:</span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleTestAlert('INFO')}
              className="px-2.5 py-1 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/80 transition"
            >
              + Test INFO
            </button>
            <button
              onClick={() => handleTestAlert('WARNING')}
              className="px-2.5 py-1 rounded bg-amber-950/60 text-amber-300 border border-amber-500/40 hover:bg-amber-900/80 transition"
            >
              + Test WARNING
            </button>
            <button
              onClick={() => handleTestAlert('SEQUENCE ERROR')}
              className="px-2.5 py-1 rounded bg-rose-950/60 text-rose-300 border border-rose-500/40 hover:bg-rose-900/80 transition"
            >
              + Test SEQUENCE ERROR
            </button>
            <button
              onClick={() => handleTestAlert('CRITICAL')}
              className="px-2.5 py-1 rounded bg-rose-950 text-rose-200 border border-rose-500 hover:bg-rose-900 transition font-bold"
            >
              + Test CRITICAL ALARM
            </button>
          </div>
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-space-950 p-3 rounded-lg border border-space-border">
        <div className="flex items-center gap-2 text-space-400 text-[11px]">
          <Filter className="w-3.5 h-3.5 text-cyan-400" />
          <span>FILTER SEVERITY:</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(['ALL', 'INFO', 'WARNING', 'SEQUENCE ERROR', 'CRITICAL'] as const).map(sev => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1 rounded text-xs transition border ${
                filterSeverity === sev
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 font-bold'
                  : 'bg-space-900 text-space-400 border-space-border hover:text-space-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Alerts Stream List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center rounded-lg border border-space-border bg-space-900/50 text-space-500">
            No active alerts matching filter.
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                !alert.acknowledged
                  ? alert.severity === 'CRITICAL' || alert.severity === 'SEQUENCE ERROR'
                    ? 'bg-rose-950/40 border-rose-500/70 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                    : alert.severity === 'WARNING'
                    ? 'bg-amber-950/40 border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                    : 'bg-space-900 border-cyan-500/50'
                  : 'bg-space-950/60 border-space-border/60 opacity-80 hover:opacity-100'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5">
                  {alert.severity === 'CRITICAL' || alert.severity === 'SEQUENCE ERROR' ? (
                    <ShieldAlert className="w-5 h-5 text-rose-400" />
                  ) : alert.severity === 'WARNING' ? (
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Info className="w-5 h-5 text-cyan-400" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-sm">{alert.title}</span>
                    <span className="text-space-500 text-[10px]">{alert.timestamp}</span>
                  </div>

                  <p className="text-space-200 text-xs mt-1 font-sans">
                    {alert.message}
                  </p>

                  <div className="text-[11px] text-space-400 mt-1.5 flex items-center gap-2 bg-space-950/80 px-2 py-1 rounded border border-space-border/60 w-fit">
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Spoken Cue: "{alert.spokenText}"</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <button
                  onClick={() => replayAudio(alert)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-space-900 hover:bg-space-850 text-cyan-300 border border-cyan-500/40 transition"
                  title="Replay Audio Chime & Speech"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Replay</span>
                </button>

                {!alert.acknowledged ? (
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/50 transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Acknowledge</span>
                  </button>
                ) : (
                  <span className="text-[10px] text-space-500 px-2 py-1 bg-space-950 rounded border border-space-border">
                    ACKNOWLEDGED
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
