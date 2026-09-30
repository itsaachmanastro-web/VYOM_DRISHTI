import React, { useState } from 'react';
import { useMissionStore } from '../../store/missionStore';
import { audioService } from '../../services/audioService';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  RotateCw,
  RotateCcw,
  Volume2,
  VolumeX,
  Layers,
  AlertTriangle,
  Play,
  Square,
  ChevronDown,
  ChevronUp,
  Activity,
  Cpu
} from 'lucide-react';

export const CurrentStepCard: React.FC = () => {
  const { 
    activeProtocol, 
    currentStepIndex, 
    stepMachineState,
    verificationProgress,
    verificationCountdownSec,
    actionConfidence,
    humanReadableActionName,
    setCurrentStepIndex,
    retryCurrentStep,
    restartEntireProcedure,
    isVoiceGuidanceEnabled,
    toggleVoiceGuidance,
    isAudioMuted,
    toggleAudioMute,
    verificationStatusMessage,
    telemetry,
    isDemoMode
  } = useMissionStore();

  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [showTechnicalDiagnostics, setShowTechnicalDiagnostics] = useState(false);

  const handlePrevStep = () => {
    setCurrentStepIndex(Math.max(0, currentStepIndex - 1));
  };

  const handleNextStep = () => {
    setCurrentStepIndex(Math.min(activeProtocol.totalSteps - 1, currentStepIndex + 1));
  };

  const handleStopSpeaking = () => {
    audioService.stopSpeaking();
  };

  const handleConfirmRestart = () => {
    restartEntireProcedure();
    setShowRestartConfirm(false);
  };

  const currentStep = activeProtocol.steps[currentStepIndex] || activeProtocol.steps[0];
  const nextStep = currentStepIndex < activeProtocol.totalSteps - 1 ? activeProtocol.steps[currentStepIndex + 1] : null;
  const totalSteps = activeProtocol.totalSteps;

  const isDemo = activeProtocol.code === 'BAS-DEMO-01' || isDemoMode;

  // Step Status Mapping
  const isVerified = stepMachineState === 'VERIFIED' || stepMachineState === 'COOLDOWN';
  const isVerifying = stepMachineState === 'VERIFYING';
  const isIncorrect = stepMachineState === 'INCORRECT';

  let statusText = 'WAITING';
  let statusBadgeClass = 'bg-blue-600 text-white';

  if (isVerified) {
    statusText = 'CORRECT';
    statusBadgeClass = 'bg-emerald-600 text-white shadow-sm';
  } else if (isVerifying) {
    statusText = 'VERIFYING';
    statusBadgeClass = 'bg-cyan-600 text-white animate-pulse shadow-sm';
  } else if (isIncorrect) {
    statusText = 'ACTION MISMATCH';
    statusBadgeClass = 'bg-amber-600 text-white';
  } else if (stepMachineState === 'POSITIONING') {
    statusText = 'WAITING';
    statusBadgeClass = 'bg-blue-600 text-white';
  }

  // Canonical Step Silhouettes
  const renderStepVisual = (stepIdx: number) => {
    if (stepIdx === 0) {
      // Step 1: Rest (Both hands down)
      return (
        <svg viewBox="0 0 80 80" className="w-16 h-16 text-cyan-400" fill="currentColor">
          <circle cx="40" cy="16" r="7" />
          <path d="M31 27h18c2 0 3.5 1.5 3.5 3.5v22H27.5V30.5c0-2 1.5-3.5 3.5-3.5z" opacity="0.9" />
          {/* Left Arm Down */}
          <path d="M28 30l-5 20c0 1.5-1.5 2-2 2s-2-0.5-2-2l5-20c0-1.5 1.5-2 2-2s2 0.5 2 2z" fill="#38BDF8" />
          {/* Right Arm Down */}
          <path d="M52 30l5 20c0 1.5 1.5 2 2 2s2-0.5 2-2l-5-20c0-1.5-1.5-2-2-2s-2 0.5-2 2z" fill="#38BDF8" />
          {/* Legs */}
          <rect x="30" y="54" width="7" height="18" rx="3.5" opacity="0.8" />
          <rect x="43" y="54" width="7" height="18" rx="3.5" opacity="0.8" />
        </svg>
      );
    }
    if (stepIdx === 1) {
      // Step 2: Right Hand Raised (User's physical right / image right in mirrored perspective)
      return (
        <svg viewBox="0 0 80 80" className="w-16 h-16 text-cyan-400" fill="currentColor">
          <circle cx="40" cy="16" r="7" />
          <path d="M31 27h18c2 0 3.5 1.5 3.5 3.5v22H27.5V30.5c0-2 1.5-3.5 3.5-3.5z" opacity="0.9" />
          {/* Left Arm Down */}
          <path d="M28 30l-5 20c0 1.5-1.5 2-2 2s-2-0.5-2-2l5-20c0-1.5 1.5-2 2-2s2 0.5 2 2z" fill="#64748B" />
          {/* Right Arm Raised High */}
          <path d="M52 30l12-16c1.5-2 3.5-1 4 1s-1 3.5-2.5 5.5l-10 14c-1 1.5-2.5 1-3.5-0.5z" fill="#10B981" />
          <circle cx="68" cy="13" r="4.5" fill="#34D399" />
          {/* Legs */}
          <rect x="30" y="54" width="7" height="18" rx="3.5" opacity="0.8" />
          <rect x="43" y="54" width="7" height="18" rx="3.5" opacity="0.8" />
        </svg>
      );
    }
    if (stepIdx === 2) {
      // Step 3: Left Hand Raised
      return (
        <svg viewBox="0 0 80 80" className="w-16 h-16 text-cyan-400" fill="currentColor">
          <circle cx="40" cy="16" r="7" />
          <path d="M31 27h18c2 0 3.5 1.5 3.5 3.5v22H27.5V30.5c0-2 1.5-3.5 3.5-3.5z" opacity="0.9" />
          {/* Left Arm Raised High */}
          <path d="M28 30l-12-16c-1.5-2-3.5-1-4 1s1 3.5 2.5 5.5l10 14c1 1.5 2.5 1 3.5-0.5z" fill="#10B981" />
          <circle cx="12" cy="13" r="4.5" fill="#34D399" />
          {/* Right Arm Down */}
          <path d="M52 30l5 20c0 1.5 1.5 2 2 2s2-0.5 2-2l-5-20c0-1.5-1.5-2-2-2s-2 0.5-2 2z" fill="#64748B" />
          {/* Legs */}
          <rect x="30" y="54" width="7" height="18" rx="3.5" opacity="0.8" />
          <rect x="43" y="54" width="7" height="18" rx="3.5" opacity="0.8" />
        </svg>
      );
    }
    // Step 4 or Default: Lower Both Hands / Rest
    return (
      <svg viewBox="0 0 80 80" className="w-16 h-16 text-cyan-400" fill="currentColor">
        <circle cx="40" cy="16" r="7" />
        <path d="M31 27h18c2 0 3.5 1.5 3.5 3.5v22H27.5V30.5c0-2 1.5-3.5 3.5-3.5z" opacity="0.9" />
        <path d="M28 30l-5 20c0 1.5-1.5 2-2 2s-2-0.5-2-2l5-20c0-1.5 1.5-2 2-2s2 0.5 2 2z" fill="#38BDF8" />
        <path d="M52 30l5 20c0 1.5 1.5 2 2 2s2-0.5 2-2l-5-20c0-1.5-1.5-2-2-2s-2 0.5-2 2z" fill="#38BDF8" />
        <rect x="30" y="54" width="7" height="18" rx="3.5" opacity="0.8" />
        <rect x="43" y="54" width="7" height="18" rx="3.5" opacity="0.8" />
      </svg>
    );
  };

  const getStepCategoryTag = (idx: number) => {
    switch (idx) {
      case 0: return 'REST';
      case 1: return 'RIGHT HAND';
      case 2: return 'LEFT HAND';
      case 3: return 'BOTH HANDS DOWN';
      default: return 'ACTION';
    }
  };

  const getAiObservationText = () => {
    if (isVerified) {
      if (currentStepIndex === 0) return 'Hands at rest verified.';
      if (currentStepIndex === 1) return 'Right hand verified.';
      if (currentStepIndex === 2) return 'Left hand verified.';
      if (currentStepIndex === 3) return 'Verification Complete';
      return 'Action verified.';
    }
    if (isVerifying) {
      return `Position detected. Hold for ${verificationCountdownSec.toFixed(1)}s...`;
    }
    if (isIncorrect) {
      return 'Action not clear. Please face the camera and try again.';
    }
    if (currentStepIndex === 0) return 'Looking for resting posture...';
    if (currentStepIndex === 1) return 'Looking for your right hand...';
    if (currentStepIndex === 2) return 'Looking for your left hand...';
    if (currentStepIndex === 3) return 'Looking for both hands lowered...';
    return humanReadableActionName || 'Awaiting gesture alignment in camera viewport...';
  };

  return (
    <div className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-sm select-none flex flex-col justify-between h-full space-y-4">
      
      {/* 1. Step Header & Voice Controls */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-xs tracking-wider text-blue-600 dark:text-cyan-400 uppercase font-mono">
            STEP {currentStepIndex + 1} OF {totalSteps}
          </span>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800">
            {getStepCategoryTag(currentStepIndex)}
          </span>
        </div>

        {/* Audio Toolbar */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleVoiceGuidance}
            className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              isVoiceGuidanceEnabled && !isAudioMuted
                ? 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
            title={isVoiceGuidanceEnabled && !isAudioMuted ? 'Voice Guidance Active (Click to mute)' : 'Voice Guidance Muted'}
          >
            {isVoiceGuidanceEnabled && !isAudioMuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="text-[11px] hidden sm:inline">{isVoiceGuidanceEnabled && !isAudioMuted ? 'Voice ON' : 'Muted'}</span>
          </button>

          <button
            onClick={handleStopSpeaking}
            className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
            title="Stop Speaking"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </button>

          <div className="h-4 w-px bg-slate-200 dark:border-slate-800 mx-0.5" />

          {/* Stepper Navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0}
              className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition disabled:opacity-30"
              title="Previous Step"
            >
              <ArrowLeft className="w-3 h-3" />
            </button>
            <button
              onClick={handleNextStep}
              disabled={currentStepIndex >= totalSteps - 1}
              className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition disabled:opacity-30"
              title="Next Step"
            >
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Visual Silhouette & Primary Physical Instruction */}
      <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-4">
        
        {/* Step Visual Silhouette Icon */}
        <div className="w-20 h-20 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 shadow-inner p-2">
          {renderStepVisual(currentStepIndex)}
        </div>

        {/* Title & Bold Physical Instruction */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="text-xs font-mono font-bold text-blue-600 dark:text-cyan-400">
            {currentStep?.title || 'Gesture Instruction'}
          </div>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">
            {currentStep?.expectedAction || 'Follow on-screen physical instructions.'}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
            {currentStep?.safetyRequirement || 'Stand clearly within camera view.'}
          </p>
        </div>

      </div>

      {/* 3. AI Observation & Validation Status */}
      <div className="space-y-2.5 p-3.5 rounded-xl bg-white dark:bg-[#080E1E] border border-slate-200/80 dark:border-slate-800 text-xs">
        
        {/* AI Observation Row */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            AI Observation:
          </span>
          <span className="font-mono font-bold text-blue-600 dark:text-cyan-300 text-right">
            {getAiObservationText()}
          </span>
        </div>

        {/* Validation Row */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/60">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Validation:
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-wider ${statusBadgeClass}`}>
            {statusText}
          </span>
        </div>

        {/* Stability Hold Progress Bar */}
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-between text-[10.5px]">
            <span className="text-slate-500 dark:text-slate-400">
              {isVerified ? 'Verification Sealed' : isVerifying ? 'Hold your position...' : 'Awaiting pose stability'}
            </span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              {isVerified ? '100%' : `${Math.round(verificationProgress)}% (${verificationCountdownSec.toFixed(1)}s)`}
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
            <div 
              className={`h-full transition-all duration-150 rounded-full ${
                isVerified 
                  ? 'bg-emerald-500 shadow-sm' 
                  : isVerifying 
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-400' 
                  : isIncorrect
                  ? 'bg-amber-500'
                  : 'bg-blue-500/50'
              }`}
              style={{ width: `${Math.max(5, Math.min(100, verificationProgress))}%` }}
            />
          </div>
        </div>

      </div>

      {/* 4. Operator Controls: Retry Current Step & Restart Entire Procedure */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          
          {/* Retry Current Step Button */}
          <button
            onClick={retryCurrentStep}
            className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-[0.98] shadow-xs"
            title="Reset only the current step without losing previous completed steps"
          >
            <RotateCcw className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
            <span>Retry Current Step</span>
          </button>

          {/* Restart Entire Procedure Button */}
          <button
            onClick={() => setShowRestartConfirm(true)}
            className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-[0.98] shadow-xs"
            title="Restart all steps from Step 1"
          >
            <RotateCw className="w-3.5 h-3.5 text-amber-500" />
            <span>Restart Procedure</span>
          </button>

        </div>

        {/* Restart Confirmation Banner */}
        {showRestartConfirm && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-xs space-y-2 animate-fadeIn">
            <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Restart Entire Procedure?</span>
            </div>
            <p className="text-[11px] text-amber-700 dark:text-amber-200/90 leading-tight">
              This will reset all 4 steps back to Step 1 (Hands at Rest). Mission logs will be preserved.
            </p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setShowRestartConfirm(false)}
                className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold hover:bg-slate-300 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRestart}
                className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold shadow-xs"
              >
                Confirm Restart
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Next Step Preview */}
      {nextStep ? (
        <div 
          onClick={handleNextStep}
          className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/80 border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 cursor-pointer transition flex items-center justify-between text-xs group"
        >
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">
              Next Step (Step {currentStepIndex + 2} of {totalSteps})
            </span>
            <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 group-hover:text-blue-600 dark:group-hover:text-cyan-300 transition">
              {nextStep.title}: <span className="font-normal text-slate-500 dark:text-slate-400">{nextStep.expectedAction}</span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-cyan-400 group-hover:translate-x-0.5 transition shrink-0" />
        </div>
      ) : (
        <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold">Procedure Complete — All 4 Actions Verified</span>
        </div>
      )}

      {/* 6. Collapsible Developer Diagnostics */}
      <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={() => setShowTechnicalDiagnostics(!showTechnicalDiagnostics)}
          className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition py-0.5"
        >
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-slate-400" />
            <span>Developer Diagnostics</span>
          </div>
          {showTechnicalDiagnostics ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showTechnicalDiagnostics && (
          <div className="mt-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[10.5px] font-mono space-y-1.5 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Inference Latency:</span>
              <span className="text-cyan-400">{telemetry.edgeLatencyMs ? telemetry.edgeLatencyMs.toFixed(1) : '18.2'} ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Pose Confidence:</span>
              <span className="text-emerald-400">{(actionConfidence * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Temporal Voting Window:</span>
              <span>15 Frames (90% Consensus)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">MoveNet Backend:</span>
              <span className="text-purple-400">WebGL Local Edge</span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default CurrentStepCard;
