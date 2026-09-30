import React, { useState, useEffect } from 'react';
import { useMissionStore } from '../../store/missionStore';
import { 
  Rocket, 
  Play, 
  ArrowRight, 
  Activity, 
  Maximize2, 
  Clock, 
  Heart, 
  Zap, 
  Target 
} from 'lucide-react';

export const LandingHero: React.FC = () => {
  const { setCurrentView, session, startDemoMode } = useMissionStore();

  const [liveTime, setLiveTime] = useState('2025-09-27 20:48:33 IST');
  const [animTime, setAnimTime] = useState(0);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');
      setLiveTime(`${year}-${month}-${day} ${hours}:${mins}:${secs} IST`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);

    const animTimer = setInterval(() => {
      setAnimTime(t => t + 0.035);
    }, 30);

    return () => {
      clearInterval(timer);
      clearInterval(animTimer);
    };
  }, []);

  // Microgravity kinematic sway calculations
  const swayX = Math.sin(animTime * 1.3) * 3.2;
  const swayY = Math.cos(animTime * 1.0) * 2.2;
  const armRaise = Math.sin(animTime * 0.85) * 6.5;
  const scanY = (animTime * 32) % 135;

  return (
    <section className="relative pt-16 pb-3 px-6 sm:px-12 max-w-[1720px] mx-auto min-h-screen lg:h-screen w-full flex flex-col justify-between select-none z-10">
      
      {/* 2-Column Hero Grid: Left 55% / Right 45% strictly matching Image 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto w-full">
        
        {/* Left Column (approx 55%) */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-5">
          
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#040A18]/85 border border-cyan-500/40 text-cyan-300 text-[11px] font-mono backdrop-blur-md shadow-[0_0_12px_rgba(0,229,255,0.15)]">
            <span className="w-2 h-2 rounded-full border border-cyan-400 flex items-center justify-center">
              <span className="w-1 h-1 rounded-full bg-cyan-400" />
            </span>
            <span className="tracking-wider uppercase font-bold text-[10.5px]">
              BHARATIYA ANTARIKSH STATION (BAS) & GAGANYAAN READY
            </span>
            <span className="hidden sm:inline-block w-8 h-px bg-cyan-500/40 ml-1" />
          </div>

          {/* Main Heading */}
          <div className="space-y-1.5">
            <h1 className="text-5xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight font-display text-white leading-none">
              VYOM DRISHTI <span className="text-[#00E5FF] drop-shadow-[0_0_24px_rgba(0,229,255,0.45)]">AI</span>
            </h1>
            
            <h2 className="text-lg sm:text-xl xl:text-2xl font-bold text-slate-100 font-sans tracking-tight leading-snug">
              AI-Powered Human Activity Recognition for On-board BAS Experiments
            </h2>
          </div>

          {/* Paragraph Description */}
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans max-w-2xl">
            Real-time activity recognition, experiment sequence validation, next-step guidance and autonomous mission monitoring at the edge. Eliminates ground communication latency dependencies and cuts deep-space bandwidth overhead by up to <strong className="text-[#00E5FF] font-bold">85–95%</strong>.
          </p>

          {/* 3 Dark Glass KPI Cards */}
          <div className="grid grid-cols-3 gap-3.5 max-w-xl pt-1">
            
            {/* Card 1 */}
            <div className="p-3.5 rounded-xl bg-[#040A1A]/85 backdrop-blur-xl border border-cyan-500/30 shadow-lg space-y-1 hover:border-cyan-400/60 transition">
              <div className="flex items-center gap-1.5 text-cyan-400">
                <Target className="w-4 h-4 text-cyan-400" />
                <span className="text-lg sm:text-xl font-extrabold font-mono text-white">~95%+</span>
              </div>
              <div className="text-[10.5px] text-slate-400 font-sans leading-tight">
                Step Validation Accuracy
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-3.5 rounded-xl bg-[#040A1A]/85 backdrop-blur-xl border border-cyan-500/30 shadow-lg space-y-1 hover:border-cyan-400/60 transition">
              <div className="flex items-center gap-1.5 text-cyan-400">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="text-lg sm:text-xl font-extrabold font-mono text-white">~85%</span>
              </div>
              <div className="text-[10.5px] text-slate-400 font-sans leading-tight">
                Bandwidth Reduction
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-3.5 rounded-xl bg-[#040A1A]/85 backdrop-blur-xl border border-cyan-500/30 shadow-lg space-y-1 hover:border-cyan-400/60 transition">
              <div className="flex items-center gap-1.5 text-cyan-400">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span className="text-lg sm:text-xl font-extrabold font-mono text-white">18 ms</span>
              </div>
              <div className="text-[10.5px] text-slate-400 font-sans leading-tight">
                Local Edge Latency
              </div>
            </div>

          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <button
              onClick={() => {
                if (session) {
                  setCurrentView('live-monitor');
                } else {
                  setCurrentView('login');
                }
              }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-extrabold font-mono text-xs tracking-wider flex items-center gap-2.5 shadow-[0_0_30px_rgba(0,229,255,0.45)] transition transform hover:-translate-y-0.5"
            >
              <Rocket className="w-4 h-4 fill-current" />
              <span>{session ? 'ENTER MISSION CONSOLE' : 'LAUNCH MISSION CONSOLE'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                if (session) {
                  startDemoMode();
                } else {
                  setCurrentView('login');
                }
              }}
              className="px-5 py-3 rounded-xl bg-[#040A18]/85 hover:bg-slate-800/90 text-slate-200 border border-slate-700 hover:border-cyan-500/60 font-mono text-xs font-semibold flex items-center gap-2 backdrop-blur-xl transition"
            >
              <Play className="w-3.5 h-3.5 text-cyan-400 fill-current" />
              <span>Test Protocol Simulator</span>
            </button>
          </div>

        </div>

        {/* Right Column (approx 45%): Live Perception HUD Glass Console */}
        <div className="lg:col-span-5 xl:col-span-5">
          <div className="rounded-2xl border border-cyan-500/40 bg-[#040A18]/90 backdrop-blur-2xl p-4 sm:p-5 shadow-[0_0_40px_rgba(0,229,255,0.2)] relative overflow-hidden">
            
            {/* Top Ribbon */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/90 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white tracking-wider text-xs font-display">LIVE PERCEPTION</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold animate-pulse">
                  ● LIVE
                </span>
              </div>

              <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{liveTime}</span>
                </div>
                <Maximize2 className="w-3.5 h-3.5 hover:text-white cursor-pointer transition" />
              </div>
            </div>

            {/* Visual Viewport Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 my-3.5">
              
              {/* Center Kinematic Skeleton Viewport */}
              <div className="sm:col-span-8 rounded-xl bg-[#02050E] border border-slate-800 p-3.5 relative min-h-[210px] flex flex-col justify-between overflow-hidden shadow-inner">
                
                {/* Background Tech Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,229,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,229,255,0.04)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

                {/* Vertical Laser Scan Line */}
                <div 
                  className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_#00E5FF] pointer-events-none"
                  style={{ top: `${scanY}px` }}
                />

                {/* Header Tag */}
                <div className="flex items-center justify-between text-[11px] font-mono relative z-10">
                  <span className="text-slate-200 font-bold">Astronaut (ID-1)</span>
                  <span className="text-[#00E5FF] font-bold">98.2%</span>
                </div>

                {/* Animated Kinematic Skeleton (17 Keypoints) */}
                <div className="relative w-full h-32 flex items-center justify-center z-10 py-1">
                  <svg viewBox="0 0 200 150" className="w-44 h-32">
                    {/* Head */}
                    <circle cx={100 + swayX} cy={24 + swayY} r="7.5" fill="none" stroke="#00E5FF" strokeWidth="2" />
                    <circle cx={100 + swayX} cy={24 + swayY} r="2.5" fill="#00E5FF" />

                    {/* Spine */}
                    <line x1={100 + swayX} y1={32 + swayY} x2={100 + swayX * 0.5} y2={80 + swayY * 0.5} stroke="#00E5FF" strokeWidth="2" />

                    {/* Shoulders */}
                    <line x1={78 + swayX} y1={44 + swayY} x2={122 + swayX} y2={44 + swayY} stroke="#00E5FF" strokeWidth="2" />

                    {/* Left Arm (Resting Float) */}
                    <line x1={78 + swayX} y1={44 + swayY} x2={68 + swayX} y2={76 + swayY} stroke="#00E5FF" strokeWidth="2" />
                    <line x1={68 + swayX} y1={76 + swayY} x2={68 + swayX} y2={108 + swayY} stroke="#00E5FF" strokeWidth="2" />

                    {/* Right Arm (Active Manipulation) */}
                    <line x1={122 + swayX} y1={44 + swayY} x2={138 + swayX} y2={64 + armRaise + swayY} stroke="#00E5FF" strokeWidth="2" />
                    <line x1={138 + swayX} y1={64 + armRaise + swayY} x2={152 + swayX} y2={48 + armRaise * 1.4 + swayY} stroke="#10B981" strokeWidth="2.5" />

                    {/* Pelvis & Legs */}
                    <line x1={84 + swayX * 0.5} y1={80 + swayY * 0.5} x2={116 + swayX * 0.5} y2={80 + swayY * 0.5} stroke="#00E5FF" strokeWidth="2" />
                    <line x1={88 + swayX * 0.5} y1={80 + swayY * 0.5} x2={84} y2={120} stroke="#00E5FF" strokeWidth="2" />
                    <line x1={112 + swayX * 0.5} y1={80 + swayY * 0.5} x2={116} y2={120} stroke="#00E5FF" strokeWidth="2" />

                    {/* Glowing Keypoint Joints */}
                    {[
                      [100 + swayX, 24 + swayY],
                      [78 + swayX, 44 + swayY],
                      [122 + swayX, 44 + swayY],
                      [68 + swayX, 76 + swayY],
                      [138 + swayX, 64 + armRaise + swayY],
                      [68 + swayX, 108 + swayY],
                      [152 + swayX, 48 + armRaise * 1.4 + swayY],
                      [100 + swayX * 0.5, 80 + swayY * 0.5],
                      [84, 120],
                      [116, 120]
                    ].map(([kx, ky], idx) => (
                      <circle key={idx} cx={kx} cy={ky} r="2.8" fill={idx === 6 ? '#10B981' : '#00E5FF'} />
                    ))}
                  </svg>
                </div>

                {/* Bottom Tag */}
                <div className="text-[10px] font-mono text-slate-400 relative z-10">
                  17 Keypoints, Linked
                </div>
              </div>

              {/* Right Telemetry Column */}
              <div className="sm:col-span-4 space-y-2.5 flex flex-col justify-between">
                
                {/* Microgravity Gauge */}
                <div className="p-2.5 rounded-xl bg-[#02050E] border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400 text-[10px]">Microgravity:</span>
                    <span className="text-white font-bold text-[11px]">0.0g</span>
                  </div>
                  <div className="text-[#00E5FF] font-mono font-bold text-xs">25%</div>
                  
                  {/* Micro-graph line */}
                  <div className="h-6 w-full flex items-end gap-0.5 pt-1">
                    {[8, 12, 14, 11, 16, 18, 20, 19, 22, 21].map((h, i) => (
                      <div key={i} className="flex-1 bg-cyan-500/40 rounded-t hover:bg-cyan-400 transition" style={{ height: `${h}px` }} />
                    ))}
                  </div>
                </div>

                {/* Heart Rate Monitor */}
                <div className="p-2.5 rounded-xl bg-[#02050E] border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400 text-[10px]">HR:</span>
                    <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                      <Heart className="w-2.5 h-2.5 fill-current animate-ping" />
                      72 BPM
                    </span>
                  </div>

                  {/* ECG Pulse line */}
                  <div className="h-6 w-full flex items-center overflow-hidden">
                    <svg viewBox="0 0 100 24" className="w-full h-full text-emerald-400 stroke-current" fill="none" strokeWidth="2">
                      <path d="M0 12 L30 12 L35 4 L42 20 L48 8 L54 16 L60 12 L100 12" />
                    </svg>
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom Sequence Engine Status Box */}
            <div className="p-3 rounded-xl bg-[#02050E] border border-slate-800 space-y-1 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Sequence Engine:</span>
                <span className="text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>● ✓ CORRECT STEP</span>
                </span>
              </div>
              <div className="text-slate-200 text-[11px] leading-tight">
                <span className="text-[#00E5FF] font-bold">Active:</span> Inoculation buffer aspiration into Cell Cassette A2.
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Bottom Avionics Telemetry Coordinates Strip */}
      <div className="pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <span>LAT: <strong className="text-white">0.00°</strong></span>
          <span>•</span>
          <span>LON: <strong className="text-white">0.00°</strong></span>
          <span>•</span>
          <span>ALT: <strong className="text-[#00E5FF]">408 KM</strong></span>
          <span>•</span>
          <span>VEL: <strong className="text-[#00E5FF]">7.67 KM/S</strong></span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Indian Space Program Emblem */}
          <div className="w-5 h-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-white text-[10px] shadow-sm">
            🚀
          </div>
          <div>
            <div className="text-white font-bold text-[10px] leading-tight tracking-wider uppercase">
              INDIAN SPACE PROGRAM
            </div>
            <div className="text-[9px] text-slate-400 flex items-center gap-1">
              <span>FOR A BRIGHTER TOMORROW</span>
              <span className="text-orange-500 font-bold">•</span>
              <span className="text-white font-bold">•</span>
              <span className="text-emerald-500 font-bold">•</span>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};

export default LandingHero;
