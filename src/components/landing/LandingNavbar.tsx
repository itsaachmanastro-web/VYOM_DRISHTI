import React from 'react';
import { useMissionStore } from '../../store/missionStore';
import { Orbit, User, ShieldCheck, Lock } from 'lucide-react';

export const LandingNavbar: React.FC = () => {
  const { setCurrentView, session } = useMissionStore();

  const handleProtectedNavigation = (targetView: any) => {
    if (session) {
      setCurrentView(targetView);
    } else {
      setCurrentView('login');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 py-2.5 bg-[#02050E]/80 backdrop-blur-xl border-b border-slate-800/60 select-none">
      <div className="max-w-[1720px] mx-auto flex items-center justify-between gap-4 text-xs font-mono">
        
        {/* Left: Branding & Mission Designation */}
        <div className="flex items-center gap-4">
          <div 
            onClick={() => setCurrentView('landing')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 via-cyan-500 to-cyan-300 flex items-center justify-center text-slate-950 shadow-md shadow-cyan-500/20 group-hover:scale-105 transition">
              <Orbit className="w-4 h-4 text-slate-950 animate-spin" style={{ animationDuration: '25s' }} />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white text-sm sm:text-base tracking-wider font-display">
                VYOM DRISHTI
              </span>
              <span className="font-extrabold text-[#00E5FF] text-sm sm:text-base tracking-wider font-display drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]">
                AI
              </span>
            </div>
          </div>

          <div className="hidden xl:block h-4 w-px bg-slate-800 mx-1" />

          {/* Active Biological Experiment Code Name */}
          <div className="hidden md:block text-slate-400 font-sans text-[11px] font-medium tracking-tight">
            Protein Crystal Growth & Solution Inoculation (PCG)
          </div>
        </div>

        {/* Center: Live Mission Status Indicators */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 text-[10.5px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Experiment Running</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900/60 text-slate-300 border border-slate-800 text-[10.5px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]" />
            <span>System Online</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900/60 text-slate-300 border border-slate-800 text-[10.5px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>AI Active</span>
          </div>
        </div>

        {/* Right: Navigation Links & User Avatar */}
        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-4 sm:gap-6 text-xs font-sans">
            <button
              onClick={() => setCurrentView('landing')}
              className="text-white font-semibold relative py-1"
            >
              <span>Home</span>
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />
            </button>

            <button
              onClick={() => handleProtectedNavigation('live-monitor')}
              className="text-slate-400 hover:text-white transition font-medium"
            >
              Dashboard
            </button>

            <button
              onClick={() => handleProtectedNavigation('sequence')}
              className="text-slate-400 hover:text-white transition font-medium"
            >
              Experiments
            </button>

            <button
              onClick={() => handleProtectedNavigation('docs')}
              className="text-slate-400 hover:text-white transition font-medium"
            >
              Docs
            </button>
          </nav>

          {/* User Avatar Circle */}
          {session ? (
            <div 
              onClick={() => setCurrentView('live-monitor')}
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 p-0.5 cursor-pointer hover:scale-105 transition"
              title={`Logged in as ${session.user.displayName} (${session.user.role})`}
            >
              <div className="w-full h-full rounded-full bg-[#030712] flex items-center justify-center text-cyan-300 text-xs font-bold">
                {session.user.displayName.charAt(0)}
              </div>
            </div>
          ) : (
            <button
              onClick={() => setCurrentView('login')}
              className="w-8 h-8 rounded-full border border-slate-700 hover:border-cyan-400 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 flex items-center justify-center transition"
              title="Astronaut Login"
            >
              <User className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
