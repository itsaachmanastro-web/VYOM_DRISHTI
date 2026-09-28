import React from 'react';
import { useMissionStore } from '../../store/missionStore';
import { 
  Rocket, 
  Play, 
  User, 
  ArrowRight, 
  Orbit, 
  ShieldCheck, 
  Lock 
} from 'lucide-react';

export const LandingCTA: React.FC = () => {
  const { setCurrentView, session } = useMissionStore();

  const handleLaunch = () => {
    if (session) {
      setCurrentView('live-monitor');
    } else {
      setCurrentView('login');
    }
  };

  return (
    <section className="relative py-24 px-4 sm:px-8 max-w-[1700px] mx-auto z-10 select-none">
      
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-950/90 via-[#070D1F]/90 to-indigo-950/90 backdrop-blur-2xl border border-cyan-500/40 text-center space-y-6 shadow-[0_0_60px_rgba(0,229,255,0.2)] relative overflow-hidden">
        
        {/* Glow accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono">
            <Orbit className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '16s' }} />
            <span>MISSION CONTROL WORKSPACE READY</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold font-display text-white tracking-tight leading-tight">
            Launch On-Board Activity Recognition Console
          </h2>

          <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
            Test live webcam human gesture validation, inject real-time step deviations, monitor 3D microgravity kinematics, and consult the grounded Gemini AI mission assistant.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={handleLaunch}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold font-mono text-sm tracking-wider flex items-center gap-3 shadow-[0_0_30px_rgba(0,229,255,0.45)] transition transform hover:-translate-y-0.5"
            >
              {session ? <Rocket className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              <span>{session ? 'ENTER MISSION CONSOLE' : 'SECURE LOGIN & LAUNCH'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                if (session) setCurrentView('sequence');
                else setCurrentView('login');
              }}
              className="px-6 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-cyan-500/50 font-mono text-xs font-semibold flex items-center gap-2 transition"
            >
              <Play className="w-4 h-4 text-cyan-400 fill-current" />
              <span>Test Protocol Simulator</span>
            </button>

            <button
              onClick={() => {
                if (session) setCurrentView('hmr-3d');
                else setCurrentView('login');
              }}
              className="px-6 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-purple-500/50 font-mono text-xs font-semibold flex items-center gap-2 transition"
            >
              <User className="w-4 h-4 text-purple-400" />
              <span>3D Digital Twin</span>
            </button>
          </div>
        </div>

        {/* SIH Footer Stamp */}
        <div className="relative z-10 pt-8 mt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div>VYOM DRISHTI AI • SMART INDIA HACKATHON 2026 • PS #26174</div>
          <div className="text-cyan-400 font-bold">DEVELOPED BY TEAM AVISHKARX</div>
        </div>

      </div>

    </section>
  );
};
