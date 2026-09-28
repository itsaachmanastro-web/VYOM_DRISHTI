import React from 'react';
import { useMissionStore } from '../../store/missionStore';
import { Layers, ChevronRight, CheckCircle2 } from 'lucide-react';

export const ExperimentSequenceCard: React.FC = () => {
  const { 
    activeProtocol, 
    currentStepIndex, 
    setCurrentStepIndex,
    setCurrentView,
    isDemoMode 
  } = useMissionStore();

  const getStepIcon = (index: number) => {
    if (index === 0) {
      // Hands at Rest
      return (
        <svg viewBox="0 0 48 48" className="w-8 h-8 text-current" fill="currentColor">
          <circle cx="24" cy="10" r="4" />
          <path d="M19 16h10c1 0 2 1 2 2v14H17V18c0-1 1-2 2-2z" />
          <path d="M17 18l-3 12c0 1-1 1-1 1s-1 0-1-1l3-12c0-1 1-1 2 0z" />
          <path d="M31 18l3 12c0 1 1 1 1 1s1 0 1-1l-3-12c0-1-1-1-2 0z" />
          <rect x="18" y="32" width="4" height="12" rx="2" />
          <rect x="26" y="32" width="4" height="12" rx="2" />
        </svg>
      );
    }
    if (index === 1) {
      // Raise Right Hand
      return (
        <svg viewBox="0 0 48 48" className="w-8 h-8 text-current" fill="currentColor">
          <circle cx="24" cy="10" r="4" />
          <path d="M19 16h10c1 0 2 1 2 2v14H17V18c0-1 1-2 2-2z" />
          <path d="M17 18l-3 12c0 1-1 1-1 1s-1 0-1-1l3-12c0-1 1-1 2 0z" />
          <path d="M31 18l7-9c1-1 1-1 2 0s0 1-1 2l-6 8c-1 1-1 0-2-1z" />
          <rect x="18" y="32" width="4" height="12" rx="2" />
          <rect x="26" y="32" width="4" height="12" rx="2" />
        </svg>
      );
    }
    if (index === 2) {
      // Lower Right Hand
      return (
        <svg viewBox="0 0 48 48" className="w-8 h-8 text-current" fill="currentColor">
          <circle cx="24" cy="10" r="4" />
          <path d="M19 16h10c1 0 2 1 2 2v14H17V18c0-1 1-2 2-2z" />
          <path d="M17 18l-3 12c0 1-1 1-1 1s-1 0-1-1l3-12c0-1 1-1 2 0z" />
          <path d="M31 18l3 12c0 1 1 1 1 1s1 0 1-1l-3-12c0-1-1-1-2 0z" />
          <rect x="18" y="32" width="4" height="12" rx="2" />
          <rect x="26" y="32" width="4" height="12" rx="2" />
        </svg>
      );
    }
    if (index === 3) {
      // Raise Both Hands
      return (
        <svg viewBox="0 0 48 48" className="w-8 h-8 text-current" fill="currentColor">
          <circle cx="24" cy="10" r="4" />
          <path d="M19 16h10c1 0 2 1 2 2v14H17V18c0-1 1-2 2-2z" />
          <path d="M17 18l-7-9c-1-1-1-1-2 0s0 1 1 2l6 8c1 1 1 0 2-1z" />
          <path d="M31 18l7-9c1-1 1-1 2 0s0 1-1 2l-6 8c-1 1-1 0-2-1z" />
          <rect x="18" y="32" width="4" height="12" rx="2" />
          <rect x="26" y="32" width="4" height="12" rx="2" />
        </svg>
      );
    }
    // Return to Rest / Default
    return (
      <svg viewBox="0 0 48 48" className="w-8 h-8 text-current" fill="currentColor">
        <circle cx="24" cy="10" r="4" />
        <path d="M19 16h10c1 0 2 1 2 2v14H17V18c0-1 1-2 2-2z" />
        <path d="M17 18l-3 12c0 1-1 1-1 1s-1 0-1-1l3-12c0-1 1-1 2 0z" />
        <path d="M31 18l3 12c0 1 1 1 1 1s1 0 1-1l-3-12c0-1-1-1-2 0z" />
        <rect x="18" y="32" width="4" height="12" rx="2" />
        <rect x="26" y="32" width="4" height="12" rx="2" />
      </svg>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
            Experiment Sequence
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            {isDemoMode ? 'Demo Mode' : activeProtocol.code}
          </span>
        </div>

        <button 
          onClick={() => setCurrentView('sequence')}
          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold flex items-center gap-1 transition"
        >
          <span>View Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 5 Horizontal Step Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-3">
        {activeProtocol.steps.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <button
              key={step.stepCode}
              onClick={() => setCurrentStepIndex(idx)}
              className={`p-3 rounded-xl border flex flex-col items-center justify-between text-center transition-all ${
                isCurrent
                  ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 text-blue-900 dark:text-white ring-2 ring-blue-500/20 shadow-sm'
                  : isDone
                  ? 'bg-slate-50 dark:bg-slate-800/60 border-emerald-500/40 text-slate-700 dark:text-slate-200'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850'
              }`}
            >
              {/* Step number badge */}
              <div className="w-full flex justify-center mb-1.5">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isDone
                    ? 'bg-emerald-500 text-white'
                    : isCurrent
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}>
                  {isDone ? '✓' : step.stepNumber}
                </span>
              </div>

              {/* Title */}
              <div className={`text-xs font-bold leading-tight mb-2 truncate max-w-full ${
                isCurrent ? 'text-blue-700 dark:text-blue-300' : isDone ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500'
              }`}>
                {step.title}
              </div>

              {/* Silhouette Icon */}
              <div className={`mt-auto ${
                isCurrent ? 'text-blue-600 dark:text-blue-400' : isDone ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'
              }`}>
                {getStepIcon(idx)}
              </div>
            </button>
          );
        })}
      </div>

    </div>
  );
};
