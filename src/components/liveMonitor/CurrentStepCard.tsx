import React from 'react';
import { useMissionStore } from '../../store/missionStore';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  RotateCw,
  Clock,
  Layers
} from 'lucide-react';

export const CurrentStepCard: React.FC = () => {
  const { 
    activeProtocol, 
    currentStepIndex, 
    stepMachineState,
    verificationProgress,
    verificationCountdownSec,
    actionConfidence,
    currentActionName,
    humanReadableActionName,
    setCurrentStepIndex
  } = useMissionStore();

  const handlePrevStep = () => {
    setCurrentStepIndex(Math.max(0, currentStepIndex - 1));
  };

  const handleNextStep = () => {
    setCurrentStepIndex(Math.min(activeProtocol.totalSteps - 1, currentStepIndex + 1));
  };

  const currentStep = activeProtocol.steps[currentStepIndex];
  const nextStep = currentStepIndex < activeProtocol.totalSteps - 1 ? activeProtocol.steps[currentStepIndex + 1] : null;
  const totalSteps = activeProtocol.totalSteps;
  const currentStepNum = currentStep ? String(currentStep.stepNumber).padStart(2, '0') : '02';
  const nextStepNum = nextStep ? String(nextStep.stepNumber).padStart(2, '0') : '03';

  // Status mapping
  const isVerified = stepMachineState === 'VERIFIED' || stepMachineState === 'COOLDOWN';
  const isVerifying = stepMachineState === 'VERIFYING';
  const isIncorrect = stepMachineState === 'INCORRECT';

  let statusText = 'IN PROGRESS';
  let statusBadgeClass = 'bg-blue-600 text-white';

  if (isVerified) {
    statusText = 'VERIFIED';
    statusBadgeClass = 'bg-emerald-600 text-white';
  } else if (isVerifying) {
    statusText = 'VERIFYING';
    statusBadgeClass = 'bg-blue-600 text-white animate-pulse';
  } else if (isIncorrect) {
    statusText = 'ACTION MISMATCH';
    statusBadgeClass = 'bg-amber-600 text-white';
  }

  return (
    <div className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-4 shadow-sm select-none flex flex-col justify-between h-full space-y-3.5">
      
      {/* 1. Header Toolbar matching Reference */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
          <h2 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
            Current Step
          </h2>
        </div>

        {/* Step Navigation Arrows */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-blue-600 dark:text-cyan-400">
            Step {currentStepIndex + 1} / {totalSteps}
          </span>
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

      {/* 2. Step Title & Equipment Thumbnail Grid */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Blue Step Number Badge */}
          <div className="w-10 h-10 rounded-lg bg-blue-600 text-white font-mono font-bold text-lg flex items-center justify-center shrink-0 shadow-sm">
            {currentStepNum}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
              {currentStep?.title || 'Collect Sample'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {currentStep?.expectedAction || 'Retrieve biological sample vial from cold storage container.'}
            </p>
          </div>
        </div>

        {/* Scientific Payload Rack Thumbnail Icon */}
        <div className="w-12 h-14 rounded-lg bg-slate-900 border border-slate-700/80 p-1 shrink-0 flex flex-col items-center justify-between overflow-hidden shadow-inner hidden sm:flex">
          <div className="w-full h-2 bg-slate-800 rounded-sm" />
          <div className="flex gap-0.5 items-center">
            <div className="w-1.5 h-6 bg-cyan-400 rounded-sm" />
            <div className="w-1.5 h-6 bg-blue-500 rounded-sm" />
            <div className="w-1.5 h-6 bg-slate-600 rounded-sm" />
          </div>
          <div className="text-[7px] font-mono text-slate-400">PCG-01</div>
        </div>
      </div>

      {/* 3. Scientific Verification Details Block */}
      <div className="space-y-2.5 pt-1">
        
        {/* Status Pill */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Status:</span>
          <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold tracking-wide uppercase ${statusBadgeClass}`}>
            {statusText}
          </span>
        </div>

        {/* Expected Action */}
        <div className="text-xs space-y-0.5">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Expected Action</span>
          <p className="text-slate-800 dark:text-slate-200 font-medium leading-tight">
            {currentStep?.expectedAction || 'Pick up the sample container with your right hand.'}
          </p>
        </div>

        {/* AI Observation */}
        <div className="text-xs space-y-0.5">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">AI Observation</span>
          <p className="text-slate-800 dark:text-slate-200 font-medium leading-tight">
            {humanReadableActionName ? `${humanReadableActionName} detected.` : 'Hand and container interaction detected.'}
          </p>
        </div>

        {/* Validation Spinner & Status */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Validation</span>
          <div className="flex items-center gap-1.5 font-bold text-blue-600 dark:text-cyan-400">
            {isVerified ? (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>VERIFIED</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>VERIFYING...</span>
              </span>
            )}
          </div>
        </div>

      </div>

      {/* 4. Next Step Preview matching Reference */}
      <div 
        onClick={handleNextStep}
        className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-850/80 border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 cursor-pointer transition flex items-center justify-between text-xs group"
      >
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">Next Step</span>
          <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-2">
            <span className="text-blue-600 dark:text-cyan-400 font-mono">{nextStepNum}</span>
            <span className="group-hover:text-blue-600 dark:group-hover:text-cyan-300 transition">{nextStep?.title || 'Clean Sample Area'}</span>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-cyan-400 group-hover:translate-x-0.5 transition" />
      </div>

    </div>
  );
};
