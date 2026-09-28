import React from 'react';
import { 
  Zap, 
  Cpu, 
  HardDrive, 
  Radio, 
  ShieldCheck, 
  BarChart3, 
  ArrowRight 
} from 'lucide-react';

export const LandingMetricsSection: React.FC = () => {
  return (
    <section className="relative py-20 px-4 sm:px-8 max-w-[1700px] mx-auto z-10 select-none">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono backdrop-blur-md">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>EDGE PERFORMANCE BENCHMARKS</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
          High-Speed Edge Inference & Bandwidth Compression
        </h2>

        <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
          Comparing raw 4K orbital video downlink vs VYOM DRISHTI AI edge-evaluated telemetry packets.
        </p>
      </div>

      {/* 2-Column Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left: Bandwidth Comparison Box */}
        <div className="lg:col-span-7 p-6 lg:p-8 rounded-3xl bg-[#070D1F]/75 backdrop-blur-xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-base font-sans">
              Downlink Bandwidth Overhead Comparison
            </h3>
            <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-950/80 px-2.5 py-1 rounded-full border border-cyan-500/30">
              -85% to -95% Bandwidth Savings
            </span>
          </div>

          <div className="space-y-4 text-xs font-mono">
            {/* Stream A: Raw 4K Video */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Traditional Raw Video Downlink (4K @ 30 FPS)</span>
                <span className="text-rose-400 font-bold">25,000 kbps (High Latency + Dropout Risk)</span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500/80 rounded-full w-full" />
              </div>
            </div>

            {/* Stream B: VYOM DRISHTI JSON Telemetry */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-slate-300 font-bold">
                <span className="text-cyan-300">VYOM DRISHTI Edge Telemetry Packets</span>
                <span className="text-emerald-400">12.5 kbps (99.95% Bandwidth Reduction)</span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full w-[3%]" />
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-300 font-sans leading-relaxed pt-2">
            By executing multi-modal computer vision directly on the payload rack NPU, only verified state changes, step confirmations, and cryptographic audit hashes are beamed to Earth Ground Control.
          </p>
        </div>

        {/* Right: Edge Hardware Vitals */}
        <div className="lg:col-span-5 p-6 lg:p-8 rounded-3xl bg-[#070D1F]/75 backdrop-blur-xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-base font-sans">
              Edge Hardware Profiling
            </h3>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              INT8 ACCELERATED
            </span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#040814] border border-slate-800">
              <span className="text-slate-400">Model Inference Latency</span>
              <span className="text-cyan-300 font-bold">18.4 ms (54.3 FPS)</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#040814] border border-slate-800">
              <span className="text-slate-400">On-Chip Power Draw</span>
              <span className="text-emerald-400 font-bold">12.8 Watts (Spaceflight Rated)</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#040814] border border-slate-800">
              <span className="text-slate-400">Blackbox SSD Write</span>
              <span className="text-white font-bold">SHA-256 Sealed Logs</span>
            </div>
          </div>

          <div className="pt-2 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>OFFLINE RESILIENT</span>
            <span className="text-cyan-400">0 KB GROUND DEPENDENCY</span>
          </div>
        </div>

      </div>

    </section>
  );
};
