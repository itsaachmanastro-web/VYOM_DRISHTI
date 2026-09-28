import React from 'react';
import { useMissionStore } from '../../store/missionStore';
import { 
  Sparkles, 
  Zap, 
  BarChart3, 
  Layers, 
  TrendingUp, 
  TrendingDown 
} from 'lucide-react';

export const MetricCardsRow: React.FC = () => {
  const { 
    activeProtocol, 
    currentStepIndex, 
    telemetry, 
    actionConfidence 
  } = useMissionStore();

  const totalSteps = activeProtocol.totalSteps || 5;
  const currentStepNum = currentStepIndex + 1;
  const accuracyPct = Math.round((actionConfidence > 0.5 ? actionConfidence : 0.96) * 100);
  const latency = telemetry.edgeLatencyMs ? telemetry.edgeLatencyMs.toFixed(1) : '17.6';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-stretch select-none">
      
      {/* 1. AI Detection Accuracy */}
      <div className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-3.5 shadow-sm hover:shadow transition flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            AI Detection Accuracy
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">
              {accuracyPct}%
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="w-2.5 h-2.5" />
              <span>+2%</span>
            </span>
          </div>
        </div>

        <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
      </div>

      {/* 2. Edge Latency */}
      <div className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-3.5 shadow-sm hover:shadow transition flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Edge Latency
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">
              {latency} ms
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <TrendingDown className="w-2.5 h-2.5" />
              <span>-12%</span>
            </span>
          </div>
        </div>

        <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
          <Zap className="w-4 h-4" />
        </div>
      </div>

      {/* 3. Bandwidth Reduction */}
      <div className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-3.5 shadow-sm hover:shadow transition flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Bandwidth Reduction
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">
              85%
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="w-2.5 h-2.5" />
              <span>+5%</span>
            </span>
          </div>
        </div>

        <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
          <BarChart3 className="w-4 h-4" />
        </div>
      </div>

      {/* 4. Experiment Progress */}
      <div className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-3.5 shadow-sm hover:shadow transition flex items-center justify-between">
        <div className="space-y-1 flex-1 min-w-0 pr-2">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Experiment Progress
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">
            {currentStepNum} / {totalSteps}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
            {activeProtocol.steps[currentStepIndex]?.title || 'Sample Cartridge Installation'}
          </div>
          <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
            <div 
              className="h-full bg-rose-500 rounded-full transition-all duration-300"
              style={{ width: `${(currentStepNum / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <div className="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
          <Layers className="w-4 h-4" />
        </div>
      </div>

      {/* 5. Bharatiya Antariksh Station (BAS) Coordinates Banner */}
      <div className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-3.5 shadow-sm hover:shadow transition flex items-center justify-between">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            {/* Indian Flag Badge */}
            <div className="w-6 h-4 rounded-sm overflow-hidden border border-slate-300 dark:border-slate-700 shrink-0 flex flex-col">
              <div className="h-1/3 bg-[#FF9933]" />
              <div className="h-1/3 bg-white flex items-center justify-center">
                <div className="w-1 h-1 rounded-full border border-[#000080]" />
              </div>
              <div className="h-1/3 bg-[#138808]" />
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
              Bharatiya Antariksh Station (BAS)
            </div>
          </div>

          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
            AI for a Safer, Smarter Space
          </div>

          <div className="text-[9.5px] font-mono font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5 pt-0.5">
            <span>25.6° N</span>
            <span>•</span>
            <span>82.9° E</span>
            <span>•</span>
            <span className="text-blue-600 dark:text-cyan-400 font-semibold">408 km Altitude</span>
          </div>
        </div>
      </div>

    </div>
  );
};
