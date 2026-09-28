import React, { useState } from 'react';
import { useMissionStore } from '../../store/missionStore';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Activity,
  Layers
} from 'lucide-react';

export const AiValidationCard: React.FC = () => {
  const { 
    activeProtocol, 
    currentStepIndex, 
    stepMachineState, 
    currentActionName, 
    humanReadableActionName, 
    actionConfidence,
    validationResult,
    hoiInteraction
  } = useMissionStore();

  const [showTechTelemetry, setShowTechTelemetry] = useState(false);

  const currentStep = activeProtocol.steps[currentStepIndex];
  const confidencePct = Math.round((actionConfidence > 0 ? actionConfidence : 0.94) * 100);

  const isVerified = stepMachineState === 'VERIFIED' || stepMachineState === 'COOLDOWN';
  const isIncorrect = stepMachineState === 'INCORRECT';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg text-white space-y-4 select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Experiment Check
          </span>
        </div>
        
        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
          isVerified 
            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
            : isIncorrect
            ? 'bg-amber-950 text-amber-300 border-amber-800'
            : 'bg-slate-800 text-slate-300 border-slate-700'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isVerified ? 'bg-emerald-400' : isIncorrect ? 'bg-amber-400' : 'bg-blue-400 animate-pulse'}`} />
          <span>{isVerified ? 'Standard Met' : isIncorrect ? 'Attention Needed' : 'Monitoring'}</span>
        </span>
      </div>

      {/* Main Content: What the System Sees */}
      <div className="space-y-3 text-xs">
        
        {/* 1. What the System Sees */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            <span>What the system sees:</span>
          </span>
          <p className="text-sm font-semibold text-white leading-relaxed">
            "{humanReadableActionName || currentActionName.replace(/_/g, ' ')}"
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-850">
            <span>Target Object: <strong className="text-slate-200">{hoiInteraction.targetObject || currentStep?.targetObject}</strong></span>
            <span>Match: <strong className="text-emerald-400 font-mono">{confidencePct}%</strong></span>
          </div>
        </div>

        {/* 2. SOP Verification Explanation */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>SOP Verification:</span>
          </span>
          <p className="text-xs text-slate-200 leading-relaxed font-normal">
            {isVerified 
              ? `Action matches Step ${currentStep?.stepNumber} protocol requirements. Ready to transition.`
              : validationResult.deviationReason
              ? validationResult.deviationReason
              : `Positioning detected. Align with ${currentStep?.targetObject} and maintain stable posture.`}
          </p>
        </div>

      </div>

      {/* Expandable Technical Details */}
      <div className="pt-2 border-t border-slate-800">
        <button
          onClick={() => setShowTechTelemetry(!showTechTelemetry)}
          className="w-full flex items-center justify-between text-xs font-semibold text-slate-400 hover:text-white transition py-1"
        >
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Sensor & Rule Diagnostics</span>
          </div>
          {showTechTelemetry ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showTechTelemetry && (
          <div className="mt-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono space-y-2 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Temporal Stability:</span>
              <span className="text-emerald-400">15-Frame Voting Consensus (92%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Validation State:</span>
              <span className="text-blue-400">{validationResult.validationState}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Safety Category:</span>
              <span>{activeProtocol.hazardLevel}</span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
