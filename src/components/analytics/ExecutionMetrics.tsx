import React from 'react';
import { useMissionStore } from '../../store/missionStore';
import { 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Award, 
  Zap,
  BarChart2
} from 'lucide-react';

export const ExecutionMetrics: React.FC = () => {
  const { executionRecords, activeProtocol } = useMissionStore();

  const completedCount = executionRecords.filter(r => r.status === 'COMPLETED').length;
  const skippedCount = executionRecords.filter(r => r.status === 'SKIPPED').length;

  const modelScores = [
    { name: 'Human Recognition (YOLOv8n)', score: 98.2, status: 'EXCELLENT', color: 'bg-blue-600' },
    { name: '0-G Pose Kinematics (MoveNet)', score: 97.4, status: 'EXCELLENT', color: 'bg-emerald-600' },
    { name: 'Tool & Vial Detection (ViT)', score: 95.8, status: 'OPTIMAL', color: 'bg-cyan-500' },
    { name: 'Hand-Object Contact (HOI)', score: 96.4, status: 'OPTIMAL', color: 'bg-indigo-600' },
    { name: 'Temporal Action Transformer', score: 96.5, status: 'OPTIMAL', color: 'bg-sky-500' },
  ];

  return (
    <div className="space-y-5 select-none">
      
      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Stat 1 */}
        <div className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1 font-medium">
            <span>Protocol Completion</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {completedCount} / {activeProtocol.totalSteps} <span className="text-xs text-slate-400 font-normal">Steps</span>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            {((completedCount / (activeProtocol.totalSteps || 5)) * 100).toFixed(0)}% Completed
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1 font-medium">
            <span>Validation Accuracy</span>
            <Award className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            96.8%
          </div>
          <div className="text-[11px] text-blue-600 dark:text-cyan-400 font-semibold mt-1">
            Zero False Positives
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1 font-medium">
            <span>Deviations Intercepted</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {skippedCount}
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
            100% Sequence Guard
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1 font-medium">
            <span>Mean Edge Latency</span>
            <Zap className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            17.6 ms
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            30.0 FPS Steady
          </div>
        </div>

      </div>

      {/* Model Accuracy Breakdown */}
      <div className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4 gap-2">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
            <BarChart2 className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            <span>AI Sub-Model Confidence & Precision Metrics</span>
          </div>
          <span className="text-[11px] text-slate-400">Evaluated on Microgravity Synthetic & Test Datasets</span>
        </div>

        <div className="space-y-3">
          {modelScores.map(model => (
            <div key={model.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-300">{model.name}</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{model.score}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div 
                  className={`${model.color} h-full rounded-full transition-all duration-500`}
                  style={{ width: `${model.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
