import React from 'react';
import { useMissionStore } from '../../store/missionStore';
import { 
  Radio, 
  ArrowDownRight,
  Database,
  TrendingDown,
  Sparkles,
  Zap,
  CheckCircle2
} from 'lucide-react';

export const BandwidthSavingsChart: React.FC = () => {
  const { telemetry } = useMissionStore();

  return (
    <div className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-5 sm:p-6 shadow-xs select-none space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-slate-900 dark:text-white font-bold text-sm sm:text-base tracking-tight">
              Deep-Space Bandwidth Reduction Telemetry
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
              Edge AI Telemetry vs Continuous Earth Video Streaming Downlink
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm sm:text-base">
            ~{telemetry.bandwidthSavingsPercent || 85}% SAVINGS
          </span>
          <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Optimal Link
          </span>
        </div>
      </div>

      {/* Comparison Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Card 1: Legacy Continuous Raw Video Streaming */}
        <div className="p-4 rounded-xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 space-y-2.5">
          <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 font-bold text-xs">
            <span>Legacy Raw Video Downlink</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 border border-rose-300 dark:border-rose-800 font-semibold">
              High Overhead
            </span>
          </div>

          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            45.0 <span className="text-xs font-normal text-slate-500 dark:text-slate-400">Mbps / stream</span>
          </div>

          <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
            Continuous uncompressed 1080p video downlink severely saturates deep-space Deep Space Network (DSN) transponders and is unavailable during orbital blackout windows.
          </p>

          <div className="pt-2 border-t border-rose-200/60 dark:border-rose-900/40 text-[11px] text-slate-500 dark:text-slate-400 flex justify-between">
            <span>Daily Data Volume:</span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">~486 GB / Day</span>
          </div>
        </div>

        {/* Card 2: VYOM DRISHTI Edge AI Structured Telemetry */}
        <div className="p-4 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 space-y-2.5">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 font-bold text-xs">
            <span>VYOM DRISHTI Structured Telemetry</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 font-semibold">
              Optimized
            </span>
          </div>

          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-cyan-400">
            2.4 <span className="text-xs font-normal text-slate-500 dark:text-slate-400">kbps / payload</span>
          </div>

          <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
            Only lightweight cryptographic event logs, step confirmations, and deviation warnings are uplinked to Ground Control. Full video is preserved on local SSD blackbox.
          </p>

          <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-900/40 text-[11px] text-slate-500 dark:text-slate-400 flex justify-between">
            <span>Daily Data Volume:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">~25.9 MB / Day (99.9% savings)</span>
          </div>
        </div>

      </div>

      {/* Visual Scientific Flow Comparison */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="text-xs text-slate-800 dark:text-slate-200 font-bold">
          Dataflow Architecture Comparison
        </div>
        
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center gap-3">
            <span className="w-28 text-slate-500 dark:text-slate-400 text-[11px] shrink-0 font-medium">Raw Stream:</span>
            <div className="flex-1 bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div className="bg-rose-500 h-full w-full rounded-full" />
            </div>
            <span className="text-rose-600 dark:text-rose-400 font-bold font-mono text-right w-20 text-[11px]">45,000 kbps</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-28 text-slate-500 dark:text-slate-400 text-[11px] shrink-0 font-medium">Vyom Uplink:</span>
            <div className="flex-1 bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div className="bg-emerald-500 h-full w-[2%] rounded-full" />
            </div>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono text-right w-20 text-[11px]">2.4 kbps</span>
          </div>
        </div>
      </div>

    </div>
  );
};
