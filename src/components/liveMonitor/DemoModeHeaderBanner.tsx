import React from 'react';
import { useMissionStore } from '../../store/missionStore';
import { 
  Play, 
  RotateCcw, 
  RotateCw, 
  CheckCircle2, 
  Sparkles, 
  Video, 
  Volume2, 
  VolumeX, 
  AlertTriangle,
  Layers,
  ArrowRight
} from 'lucide-react';

export const DemoModeHeaderBanner: React.FC = () => {
  const { 
    activeProtocol, 
    isDemoMode, 
    startDemoMode, 
    exitDemoMode,
    retryCurrentStep, 
    restartEntireProcedure, 
    currentStepIndex, 
    stepMachineState,
    verificationProgress,
    verificationCountdownSec,
    humanReadableActionName,
    isVoiceGuidanceEnabled,
    toggleVoiceGuidance,
    isAudioMuted,
    toggleAudioMute,
    isWebcamActive,
    setIsWebcamActive
  } = useMissionStore();

  const isDemoActive = activeProtocol.code === 'BAS-DEMO-01';
  const currentStep = activeProtocol.steps[currentStepIndex];
  const isVerified = stepMachineState === 'VERIFIED' || stepMachineState === 'COOLDOWN';
  const isVerifying = stepMachineState === 'VERIFYING';
  const isIncorrect = stepMachineState === 'INCORRECT';

  return (
    <div className={`p-4 rounded-xl border select-none transition-all shadow-sm ${
      isDemoActive 
        ? 'bg-gradient-to-r from-blue-950/80 via-slate-900/90 to-cyan-950/70 border-cyan-500/50 text-white' 
        : 'bg-white dark:bg-[#0D1527] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100'
    }`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Demo Status & Current Step Information */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
            isDemoActive 
              ? 'bg-cyan-500 text-slate-950 font-bold' 
              : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-blue-800'
          }`}>
            <Sparkles className="w-5 h-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-sm tracking-tight">
                {isDemoActive ? 'Real-Time Webcam Hand Verification Demo (BAS-DEMO-01)' : 'Mission Experiment Mode'}
              </span>
              
              {isDemoActive ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 animate-pulse">
                  ● 4-Step Gesture Verification Active
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  {activeProtocol.code} • {activeProtocol.name}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 dark:text-slate-300 mt-1 leading-snug">
              {isDemoActive ? (
                <span>
                  Step <strong className="text-white font-mono">{currentStepIndex + 1}/4</strong>: {currentStep?.title} — <span className="text-cyan-300 font-semibold">{currentStep?.expectedAction}</span>
                </span>
              ) : (
                <span>
                  Switch to the interactive 4-step live webcam demo for real-time gesture verification with voice guidance.
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {isDemoActive ? (
            <>
              {/* Voice Guidance Toggle */}
              <button
                onClick={toggleVoiceGuidance}
                className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition ${
                  isVoiceGuidanceEnabled && !isAudioMuted
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-xs'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
                title={isVoiceGuidanceEnabled ? 'Voice Guidance Active' : 'Voice Guidance Muted'}
              >
                {isVoiceGuidanceEnabled && !isAudioMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span className="hidden sm:inline">Voice</span>
              </button>

              {/* Retry Step Button */}
              <button
                onClick={retryCurrentStep}
                className="px-3 py-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition active:scale-[0.98]"
                title="Reset current step without losing completed steps"
              >
                <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                <span>Retry Step</span>
              </button>

              {/* Restart All Button */}
              <button
                onClick={restartEntireProcedure}
                className="px-3 py-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition active:scale-[0.98]"
                title="Restart all 4 steps to Step 1"
              >
                <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                <span>Restart All</span>
              </button>

              {/* Exit Demo Button */}
              <button
                onClick={exitDemoMode}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition"
              >
                Exit Demo
              </button>
            </>
          ) : (
            <button
              onClick={startDemoMode}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-extrabold text-xs tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.35)] transition transform hover:-translate-y-0.5"
            >
              <Video className="w-4 h-4" />
              <span>Launch 4-Step Webcam Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

      {/* Progress Strip during active demo */}
      {isDemoActive && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">Live Observation:</span>
            <span className="font-mono font-bold text-cyan-300">
              {humanReadableActionName || 'Neutral Body Posture'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">Consensus Hold:</span>
              <span className="font-mono font-bold text-white">
                {isVerified ? '100% (VERIFIED)' : `${Math.round(verificationProgress)}% (${verificationCountdownSec.toFixed(1)}s)`}
              </span>
            </div>
            
            {/* Tiny mini bar */}
            <div className="w-24 h-2 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className={`h-full transition-all duration-150 rounded-full ${
                  isVerified ? 'bg-emerald-400' : isVerifying ? 'bg-cyan-400' : isIncorrect ? 'bg-amber-400' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.max(5, Math.min(100, verificationProgress))}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
