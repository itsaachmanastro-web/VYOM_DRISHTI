import React, { useState } from 'react';
import { useMissionStore } from '../../store/missionStore';
import { ExperimentStep, StepExecutionRecord } from '../../types/mission';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  Info, 
  ArrowRight, 
  Layers, 
  Box, 
  ChevronRight,
  Eye
} from 'lucide-react';
import { AerospaceBadge } from '../common/AerospaceBadge';

export const SequenceTimeline: React.FC = () => {
  const { 
    activeProtocol, 
    currentStepIndex, 
    executionRecords,
    setCurrentStepIndex
  } = useMissionStore();

  const [selectedRecord, setSelectedRecord] = useState<StepExecutionRecord | null>(null);

  return (
    <div className="p-5 rounded-lg border border-space-border bg-space-900/90 tech-corner-decor">
      <div className="flex items-center justify-between border-b border-space-border/80 pb-3 mb-5 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="text-white font-bold tracking-wide">EXPERIMENT SEQUENCE EXECUTION TIMELINE</span>
        </div>
        <div className="text-space-400">
          PROGRESS: <strong className="text-cyan-300">{currentStepIndex + 1} / {activeProtocol.totalSteps}</strong> STEPS
        </div>
      </div>

      {/* Timeline Steps List */}
      <div className="space-y-3 font-mono">
        {activeProtocol.steps.map((step, idx) => {
          const record = executionRecords[idx] || {
            stepNumber: step.stepNumber,
            stepCode: step.stepCode,
            title: step.title,
            expectedAction: step.expectedAction,
            recognizedAction: 'Pending',
            status: 'PENDING',
            validationState: 'IDLE',
            startTime: '--',
            confidence: 0,
            detectedObjects: [],
            notes: 'Awaiting execution',
            durationSec: 0
          };

          const isCurrent = idx === currentStepIndex;

          return (
            <div
              key={step.stepCode}
              onClick={() => setSelectedRecord(record)}
              className={`p-3.5 rounded-lg border transition cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                isCurrent
                  ? 'bg-space-950 border-cyan-500/60 shadow-[0_0_12px_rgba(0,229,255,0.12)]'
                  : record.status === 'COMPLETED'
                  ? 'bg-space-950/70 border-space-border/90 hover:border-space-border hover:bg-space-850'
                  : record.status === 'SKIPPED'
                  ? 'bg-rose-950/20 border-rose-500/50 hover:bg-rose-950/30'
                  : 'bg-space-950/40 border-space-border/50 opacity-70 hover:opacity-100'
              }`}
            >
              {/* Left Step ID & Title */}
              <div className="flex items-start gap-3.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                  isCurrent ? 'bg-cyan-500 text-space-950 shadow-[0_0_10px_rgba(0,229,255,0.5)]' :
                  record.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/50' :
                  record.status === 'SKIPPED' ? 'bg-rose-950 text-rose-400 border border-rose-500/50' :
                  'bg-space-900 text-space-400 border border-space-800'
                }`}>
                  {step.stepNumber}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 text-xs font-bold">{step.stepCode}</span>
                    <span className="text-space-600">•</span>
                    <span className="text-white text-xs font-semibold">{step.title}</span>
                  </div>

                  <div className="text-[11px] text-space-300 mt-1 flex flex-wrap items-center gap-3">
                    <span>Expected: <strong className="text-space-100">{step.expectedAction}</strong></span>
                    <span>Target: <strong className="text-cyan-300">{step.targetObject}</strong></span>
                  </div>

                  {record.recognizedAction && record.recognizedAction !== 'Pending' && (
                    <div className="text-[11px] text-space-400 mt-1">
                      Recognized: <span className="text-emerald-300">{record.recognizedAction}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Status, Metrics & Details */}
              <div className="flex flex-wrap items-center gap-3 self-end md:self-center shrink-0">
                {record.confidence > 0 && (
                  <div className="text-[11px] text-space-400 text-right">
                    <div>Conf: <strong className="text-emerald-400">{(record.confidence * 100).toFixed(1)}%</strong></div>
                    <div className="text-[10px] text-space-500">{record.startTime}</div>
                  </div>
                )}

                <AerospaceBadge status={record.validationState !== 'IDLE' ? record.validationState : record.status} size="sm" />

                <button 
                  className="p-1.5 rounded bg-space-900 hover:bg-space-800 text-space-400 hover:text-cyan-300 transition"
                  title="Inspect Step Details"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Step Detail Modal Drawer */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-space-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-space-900 border border-cyan-500/50 rounded-lg p-6 max-w-xl w-full font-mono text-xs shadow-2xl space-y-4 tech-corner-decor">
            
            <div className="flex items-center justify-between border-b border-space-border pb-3">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 font-bold text-sm">STEP INSPECTION: {selectedRecord.stepCode}</span>
              </div>
              <AerospaceBadge status={selectedRecord.validationState} size="sm" />
            </div>

            <div>
              <h3 className="text-white text-base font-semibold font-display mb-1">{selectedRecord.title}</h3>
              <p className="text-space-300 text-xs font-sans">
                {activeProtocol.steps.find(s => s.stepNumber === selectedRecord.stepNumber)?.scientificRationale}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 rounded bg-space-950 border border-space-border">
              <div>
                <span className="text-space-500 text-[10px] uppercase block">EXPECTED ACTION</span>
                <span className="text-white font-medium">{selectedRecord.expectedAction}</span>
              </div>
              <div>
                <span className="text-space-500 text-[10px] uppercase block">RECOGNIZED ACTION</span>
                <span className="text-emerald-300 font-medium">{selectedRecord.recognizedAction}</span>
              </div>
              <div>
                <span className="text-space-500 text-[10px] uppercase block">START TIME</span>
                <span className="text-space-300">{selectedRecord.startTime}</span>
              </div>
              <div>
                <span className="text-space-500 text-[10px] uppercase block">AI CONFIDENCE</span>
                <span className="text-emerald-400 font-bold">{(selectedRecord.confidence * 100).toFixed(1)}%</span>
              </div>
            </div>

            {selectedRecord.deviationReason && (
              <div className="p-3 rounded bg-rose-950/50 border border-rose-500/50 text-rose-300 text-xs">
                <strong className="block mb-1">DEVIATION ANALYSIS:</strong>
                {selectedRecord.deviationReason}
              </div>
            )}

            <div className="p-3 rounded bg-space-950 border border-space-border text-space-300 text-[11px]">
              <strong className="text-cyan-300 block mb-1">EXECUTION NOTES:</strong>
              {selectedRecord.notes}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-space-950 font-bold text-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
