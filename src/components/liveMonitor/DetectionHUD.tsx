import React, { useState } from 'react';
import { useMissionStore } from '../../store/missionStore';
import { CurrentStepCard } from './CurrentStepCard';
import { AiValidationCard } from './AiValidationCard';
import { Sliders, RotateCcw, ChevronDown, ChevronUp, Play, AlertTriangle, ShieldAlert, RefreshCw } from 'lucide-react';

export const DetectionHUD: React.FC = () => {
  const { 
    advanceToNextStep, 
    simulateAction, 
    resetExperiment, 
    activeProtocol, 
    currentStepIndex,
    detectionSettings,
    updateDetectionSettings 
  } = useMissionStore();

  const [showSimDrawer, setShowSimDrawer] = useState(false);
  const isLastStep = currentStepIndex >= activeProtocol.totalSteps - 1;

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Current Step Card */}
      <CurrentStepCard />

      {/* 2. AI Validation Card */}
      <AiValidationCard />

      {/* 3. Collapsible Simulation & Sensitivity Tools (Scientist / Reviewer Testing) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <button
          onClick={() => setShowSimDrawer(!showSimDrawer)}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition text-xs font-semibold text-slate-700 dark:text-slate-300"
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Simulation & Sensitivity Testing Tools</span>
          </div>
          {showSimDrawer ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {showSimDrawer && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={advanceToNextStep}
                disabled={isLastStep}
                className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-semibold hover:bg-emerald-100 flex items-center justify-center gap-1.5 transition disabled:opacity-40"
              >
                <span>Simulate Step (✓)</span>
              </button>

              <button
                onClick={() => simulateAction('SKIPPED')}
                disabled={isLastStep}
                className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-semibold hover:bg-rose-100 flex items-center justify-center gap-1.5 transition disabled:opacity-40"
              >
                <span>Inject Skip (⚠)</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-500">Hold Duration: {(detectionSettings.durationMs / 1000).toFixed(1)}s</span>
              <button
                onClick={resetExperiment}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1 transition text-[11px]"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Step 1</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
