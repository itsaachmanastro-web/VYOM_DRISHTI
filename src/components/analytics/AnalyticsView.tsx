import React, { useState } from 'react';
import { useMissionStore } from '../../store/missionStore';
import { 
  Radio, 
  Database, 
  Video, 
  FileText, 
  BarChart2, 
  CheckSquare, 
  ShieldCheck, 
  AlertTriangle, 
  Zap, 
  TrendingUp, 
  Activity, 
  ChevronDown, 
  Info, 
  Sparkles,
  Leaf
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { telemetry, executionRecords, activeProtocol } = useMissionStore();

  const [unitMode, setUnitMode] = useState<'kbps' | 'Mbps'>('kbps');
  const [timeRange, setTimeRange] = useState<'Last 1 Hour' | 'Last 6 Hours' | 'Last 24 Hours'>('Last 1 Hour');
  const [metricTab, setMetricTab] = useState<'Latency' | 'FPS' | 'CPU' | 'Memory'>('Latency');

  const completedCount = executionRecords.filter(r => r.status === 'COMPLETED').length || 1;
  const totalSteps = activeProtocol.steps?.length || activeProtocol.totalSteps || 5;
  const completionPercent = Math.round((completedCount / totalSteps) * 100);

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto select-none">
      
      {/* 1. Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-medium">
        <span>Analytics</span>
        <span>&gt;</span>
        <span className="text-slate-700 dark:text-slate-300 font-semibold">Deep-Space Telemetry</span>
      </div>

      {/* 2. Page Header Bar & Top-Right Savings Pill */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Title & Subtitle with Icon */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-cyan-400 shrink-0 shadow-xs">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Deep-Space Bandwidth Reduction Telemetry
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Edge AI Telemetry vs Continuous Earth Video Streaming Downlink
            </p>
          </div>
        </div>

        {/* Right: Eco / Bandwidth Savings Card */}
        <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-xl px-4 py-2 flex items-center gap-3 shadow-2xs shrink-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Leaf className="w-4 h-4" />
          </div>
          <div>
            <div className="font-extrabold text-sm text-emerald-800 dark:text-emerald-300 font-mono leading-tight">
              ~94.6% SAVINGS
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <span>Optimal Link</span>
              <Info className="w-3 h-3 text-emerald-500 cursor-pointer" />
            </div>
          </div>
        </div>

      </div>

      {/* 3. Primary Comparison Section (2 Large Side-by-Side Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Left Card: Legacy Raw Video Downlink */}
        <div className="bg-white dark:bg-[#0D1527] border border-rose-200/90 dark:border-rose-900/60 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <Video className="w-4 h-4" />
                </div>
                <span className="font-bold text-xs text-rose-700 dark:text-rose-400">
                  Legacy Raw Video Downlink
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                High Overhead
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                45.0
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Mbps / stream
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Continuous uncompressed 1080p video downlink severely saturates deep-space Deep Space Network (DSN) transponders and is unavailable during orbital blackout windows.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <span>Daily Data Volume</span>
            </div>
            <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-xs">
              ~486 GB / Day
            </span>
          </div>
        </div>

        {/* Right Card: VYOM DRISHTI Structured Telemetry */}
        <div className="bg-white dark:bg-[#0D1527] border border-emerald-200/90 dark:border-emerald-900/60 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="font-bold text-xs text-emerald-700 dark:text-emerald-400">
                  VYOM DRISHTI Structured Telemetry
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Optimized
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-blue-600 dark:text-cyan-400 font-mono">
                2.4
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                kbps / payload
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Only lightweight cryptographic event logs, step confirmations, and deviation warnings are uplinked to Ground Control. Full video is preserved on local SSD blackbox.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <span>Daily Data Volume</span>
            </div>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
              ~25.0 MB / Day (94.6% savings)
            </span>
          </div>
        </div>

      </div>

      {/* 4. Dataflow Architecture Comparison (Full-Width Card) */}
      <div className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
            <BarChart2 className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            <span>Dataflow Architecture Comparison</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Legacy Downlink</span>
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-cyan-400" />
                <span>VYOM Telemetry</span>
              </span>
            </div>

            <select 
              value={unitMode}
              onChange={(e) => setUnitMode(e.target.value as any)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-[11px] font-mono text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
            >
              <option value="kbps">kbps</option>
              <option value="Mbps">Mbps</option>
            </select>
          </div>
        </div>

        <div className="space-y-3.5 pt-1 text-xs">
          
          {/* Row 1: Raw Stream */}
          <div className="flex items-center gap-4">
            <span className="w-40 text-slate-600 dark:text-slate-300 font-medium text-xs shrink-0">
              Raw Stream (Legacy)
            </span>
            <div className="flex-1 bg-slate-100 dark:bg-slate-800/60 rounded-full h-3.5 overflow-hidden">
              <div className="bg-rose-500 h-full w-[95%] rounded-full transition-all duration-500" />
            </div>
            <span className="font-mono font-bold text-rose-600 dark:text-rose-400 w-24 text-right text-xs">
              45,000 kbps
            </span>
          </div>

          {/* Row 2: Vyom Uplink */}
          <div className="flex items-center gap-4">
            <span className="w-40 text-slate-600 dark:text-slate-300 font-medium text-xs shrink-0">
              VYOM Uplink (Telemetry)
            </span>
            <div className="flex-1 bg-slate-100 dark:bg-slate-800/60 rounded-full h-3.5 overflow-hidden">
              <div className="bg-blue-600 dark:bg-cyan-400 h-full w-[3%] rounded-full transition-all duration-500" />
            </div>
            <span className="font-mono font-bold text-blue-600 dark:text-cyan-400 w-24 text-right text-xs">
              2.4 kbps
            </span>
          </div>

        </div>
      </div>

      {/* 5. KPI Metric Row (4 Cards in a 4-Column Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Protocol Completion */}
        <div className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-4 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
            <CheckSquare className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">Protocol Completion</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
            {completedCount} / {totalSteps} Steps
          </div>
          <div className="space-y-1">
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-blue-600 dark:bg-cyan-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <div className="text-[11px] font-bold text-blue-600 dark:text-cyan-400 font-mono">
              {completionPercent}% Completed
            </div>
          </div>
        </div>

        {/* Card 2: Validation Accuracy */}
        <div className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-4 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">Validation Accuracy</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
            96.8%
          </div>
          <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 pt-2.5">
            Zero False Positives
          </div>
        </div>

        {/* Card 3: Deviations Intercepted */}
        <div className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-4 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">Deviations Intercepted</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
            0
          </div>
          <div className="text-[11px] font-bold text-blue-600 dark:text-cyan-400 pt-2.5">
            100% Sequence Guard
          </div>
        </div>

        {/* Card 4: Mean Edge Latency */}
        <div className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-4 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
            <Zap className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">Mean Edge Latency</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
            17.6 ms
          </div>
          <div className="text-[11px] font-bold text-blue-600 dark:text-cyan-400 font-mono pt-2.5">
            30.0 FPS Steady
          </div>
        </div>

      </div>

      {/* 6. Scientific Analytics Section (2 Side-by-Side Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Chart 1: Bandwidth Over Time (Logarithmic Scale) */}
        <div className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
              <BarChart2 className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              <span>Bandwidth Over Time</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[10.5px] text-slate-500 dark:text-slate-400">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Legacy Downlink</span>
              </span>
              <span className="flex items-center gap-1 text-[10.5px] text-slate-500 dark:text-slate-400">
                <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-cyan-400" />
                <span>VYOM Telemetry</span>
              </span>
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-0.5 text-[10.5px] font-semibold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
              >
                <option value="Last 1 Hour">Last 1 Hour</option>
                <option value="Last 6 Hours">Last 6 Hours</option>
                <option value="Last 24 Hours">Last 24 Hours</option>
              </select>
            </div>
          </div>

          {/* SVG Scientific Logarithmic Graph */}
          <div className="pt-2 relative">
            <svg className="w-full h-44 overflow-visible" viewBox="0 0 360 140">
              <defs>
                <linearGradient id="roseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[15, 38, 62, 85, 108, 130].map((y, i) => (
                <line key={i} x1="38" y1={y} x2="350" y2={y} stroke="currentColor" className="text-slate-100 dark:text-slate-800/80" strokeDasharray="2" />
              ))}

              {/* Y Axis Log Labels */}
              <text x="34" y="18" textAnchor="end" className="text-[8px] fill-slate-400 font-mono">100,000</text>
              <text x="34" y="41" textAnchor="end" className="text-[8px] fill-slate-400 font-mono">10,000</text>
              <text x="34" y="65" textAnchor="end" className="text-[8px] fill-slate-400 font-mono">1,000</text>
              <text x="34" y="88" textAnchor="end" className="text-[8px] fill-slate-400 font-mono">100</text>
              <text x="34" y="111" textAnchor="end" className="text-[8px] fill-slate-400 font-mono">10</text>
              <text x="34" y="133" textAnchor="end" className="text-[8px] fill-slate-400 font-mono">1</text>

              {/* Y Axis Title */}
              <text x="10" y="75" textAnchor="middle" transform="rotate(-90 10 75)" className="text-[7.5px] fill-slate-400 font-mono">
                Bandwidth (kbps)
              </text>

              {/* Legacy Downlink Shaded Area & Curve (~45,000 kbps) */}
              <path 
                d="M 38,26 Q 80,24 130,28 T 220,25 T 300,27 T 350,26 L 350,130 L 38,130 Z" 
                fill="url(#roseGradient)" 
              />
              <path 
                d="M 38,26 Q 80,24 130,28 T 220,25 T 300,27 T 350,26" 
                fill="none" 
                stroke="#f43f5e" 
                strokeWidth="2" 
              />

              {/* Legacy Value Badge */}
              <rect x="230" y="12" width="90" height="14" rx="3" fill="#f43f5e" />
              <text x="275" y="22" textAnchor="middle" fill="#ffffff" className="text-[8.5px] font-bold font-mono">Legacy: 45,000 kbps</text>

              {/* VYOM Telemetry Line (~2.4 kbps) */}
              <path 
                d="M 38,124 Q 90,122 140,125 T 230,123 T 310,125 T 350,124" 
                fill="none" 
                stroke="#2563eb" 
                strokeWidth="2.2" 
                className="dark:stroke-cyan-400"
              />

              {/* VYOM Value Badge */}
              <rect x="240" y="108" width="72" height="14" rx="3" fill="#2563eb" className="dark:fill-cyan-600" />
              <text x="276" y="118" textAnchor="middle" fill="#ffffff" className="text-[8.5px] font-bold font-mono">VYOM: 2.4 kbps</text>
            </svg>

            {/* X Axis Time Labels */}
            <div className="flex justify-between text-[8.5px] font-mono text-slate-400 pl-10 pr-2 pt-1">
              <span>20:00</span>
              <span>20:10</span>
              <span>20:20</span>
              <span>20:30</span>
              <span>20:40</span>
              <span>20:50</span>
              <span>21:00</span>
            </div>
            <div className="text-[8.5px] text-center text-slate-400 font-mono mt-0.5">
              Time (UTC)
            </div>
          </div>
        </div>

        {/* Chart 2: Edge Latency & System Performance */}
        <div className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
              <Activity className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              <span>Edge Latency & System Performance</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[10.5px] font-semibold">
                {(['Latency', 'FPS', 'CPU', 'Memory'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setMetricTab(tab)}
                    className={`px-2 py-0.5 rounded transition ${
                      metricTab === tab
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-0.5 text-[10.5px] font-semibold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
              >
                <option value="Last 1 Hour">Last 1 Hour</option>
                <option value="Last 6 Hours">Last 6 Hours</option>
                <option value="Last 24 Hours">Last 24 Hours</option>
              </select>
            </div>
          </div>

          {/* SVG Performance Line Graph */}
          <div className="pt-2 relative">
            <svg className="w-full h-44 overflow-visible" viewBox="0 0 360 140">
              
              {/* Grid Lines */}
              {[15, 38, 62, 85, 108, 130].map((y, i) => (
                <line key={i} x1="32" y1={y} x2="350" y2={y} stroke="currentColor" className="text-slate-100 dark:text-slate-800/80" strokeDasharray="2" />
              ))}

              {/* Y Axis Labels */}
              <text x="28" y="18" textAnchor="end" className="text-[8px] fill-slate-400 font-mono">100</text>
              <text x="28" y="41" textAnchor="end" className="text-[8px] fill-slate-400 font-mono">80</text>
              <text x="28" y="65" textAnchor="end" className="text-[8px] fill-slate-400 font-mono">60</text>
              <text x="28" y="88" textAnchor="end" className="text-[8px] fill-slate-400 font-mono">40</text>
              <text x="28" y="111" textAnchor="end" className="text-[8px] fill-slate-400 font-mono">20</text>
              <text x="28" y="133" textAnchor="end" className="text-[8px] fill-slate-400 font-mono">0</text>

              {/* Y Axis Title */}
              <text x="10" y="75" textAnchor="middle" transform="rotate(-90 10 75)" className="text-[7.5px] fill-slate-400 font-mono">
                Latency (ms)
              </text>

              {/* Latency Jitter Curve */}
              <path 
                d="M 32,118 L 48,112 L 64,116 L 80,110 L 96,115 L 112,113 L 128,118 L 144,111 L 160,114 L 176,104 L 192,117 L 208,113 L 224,116 L 240,111 L 256,115 L 272,112 L 288,117 L 304,110 L 320,116 L 336,113 L 350,114" 
                fill="none" 
                stroke="#2563eb" 
                strokeWidth="2" 
                className="dark:stroke-cyan-400"
              />

              {/* Live Tooltip Pin on latest measurement point */}
              <circle cx="336" cy="113" r="3.5" fill="#2563eb" className="dark:fill-cyan-400" />
              <line x1="336" y1="78" x2="336" y2="113" stroke="#2563eb" strokeWidth="1" strokeDasharray="2" className="dark:stroke-cyan-400" />
              
              <g transform="translate(310, 58)">
                <rect x="0" y="0" width="48" height="20" rx="3" fill="#0f172a" />
                <text x="24" y="9" textAnchor="middle" fill="#ffffff" className="text-[8px] font-bold font-mono">17.6 ms</text>
                <text x="24" y="17" textAnchor="middle" fill="#94a3b8" className="text-[7px] font-mono">20:48:12</text>
              </g>

            </svg>

            {/* X Axis Time Labels */}
            <div className="flex justify-between text-[8.5px] font-mono text-slate-400 pl-8 pr-2 pt-1">
              <span>20:00</span>
              <span>20:10</span>
              <span>20:20</span>
              <span>20:30</span>
              <span>20:40</span>
              <span>20:50</span>
              <span>21:00</span>
            </div>
            <div className="text-[8.5px] text-center text-slate-400 font-mono mt-0.5">
              Time (UTC)
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
