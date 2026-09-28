import React from 'react';
import { useMissionStore } from '../../store/missionStore';
import { 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  FastForward, 
  Volume2, 
  Sliders, 
  Sparkles,
  RefreshCw,
  ShieldAlert
} from 'lucide-react';

export const SimulationControls: React.FC = () => {
  const { 
    advanceToNextStep, 
    simulateAction, 
    resetExperiment, 
    activeProtocol, 
    currentStepIndex,
    runSuccessfulDemo,
    runOutOfSequenceDemo,
    runSkippedStepDemo,
    runIncorrectActionDemo
  } = useMissionStore();

  const isLastStep = currentStepIndex >= activeProtocol.totalSteps - 1;

  return (
    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span className="text-slate-900 dark:text-white font-bold">One-Click Demonstration Scenarios</span>
        </div>
        <span className="text-slate-500 text-[10px]">Benchmark: BAS-SCI-01</span>
      </div>

      {/* 4 One-Click Scenario Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        
        {/* 1. Successful */}
        <button
          onClick={runSuccessfulDemo}
          className="flex flex-col items-start p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 transition text-left group shadow-sm"
        >
          <div className="flex items-center justify-between w-full mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">1→2→3→4→5</span>
          </div>
          <span className="font-bold">Successful Flow</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Nominal 5-step run</span>
        </button>

        {/* 2. Out-of-Sequence */}
        <button
          onClick={runOutOfSequenceDemo}
          className="flex flex-col items-start p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-300 transition text-left group shadow-sm"
        >
          <div className="flex items-center justify-between w-full mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400">Step 4 Early</span>
          </div>
          <span className="font-bold">Out-of-Sequence</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">1→2→4→3→5 deviation</span>
        </button>

        {/* 3. Skipped Step */}
        <button
          onClick={runSkippedStepDemo}
          className="flex flex-col items-start p-3 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-700 dark:text-orange-300 transition text-left group shadow-sm"
        >
          <div className="flex items-center justify-between w-full mb-1">
            <ShieldAlert className="w-4 h-4 text-orange-500" />
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-600 dark:text-orange-400">Omit Step 3</span>
          </div>
          <span className="font-bold">Skipped Step</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Clean area omitted</span>
        </button>

        {/* 4. Incorrect Action */}
        <button
          onClick={runIncorrectActionDemo}
          className="flex flex-col items-start p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-700 dark:text-rose-300 transition text-left group shadow-sm"
        >
          <div className="flex items-center justify-between w-full mb-1">
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-600 dark:text-rose-400">Hazard</span>
          </div>
          <span className="font-bold">Incorrect Action</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Wrong object contact</span>
        </button>

      </div>

      {/* Manual Step Injection & Reset Row */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={advanceToNextStep}
            disabled={isLastStep}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold flex items-center gap-1.5 shadow-sm shadow-blue-500/20"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Next Step ({currentStepIndex + 1}/{activeProtocol.totalSteps})</span>
          </button>

          <button
            onClick={() => simulateAction('SKIPPED')}
            disabled={isLastStep}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700"
          >
            Inject Skip (⚠)
          </button>
        </div>

        <button
          onClick={resetExperiment}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
        >
          <RotateCcw className="w-3.5 h-3.5 text-blue-500" />
          <span>Reset Experiment</span>
        </button>
      </div>

    </div>
  );
};
