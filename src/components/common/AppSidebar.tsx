import React from 'react';
import { useMissionStore } from '../../store/missionStore';
import { 
  Home, 
  Video, 
  FlaskConical, 
  Database, 
  Bot, 
  Layers, 
  BarChart3, 
  FileText, 
  PlayCircle, 
  Monitor, 
  Settings,
  Orbit
} from 'lucide-react';

export const AppSidebar: React.FC = () => {
  const { 
    currentView, 
    setCurrentView 
  } = useMissionStore();

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: Home },
    { id: 'live-monitor', label: 'Live Monitor', icon: Video },
    { id: 'sequence', label: 'Experiments', icon: FlaskConical },
    { id: 'model-lab', label: 'Dataset & Model Lab', icon: Database },
    { id: 'assistant', label: 'AI Assistant', icon: Bot },
    { id: 'hmr-3d', label: '3D Digital Twin', icon: Layers },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'logs', label: 'Mission Logs', icon: FileText },
    { id: 'uplink', label: 'Recordings', icon: PlayCircle },
    { id: 'health', label: 'System', icon: Monitor },
    { id: 'dataset', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <aside className="w-60 bg-white dark:bg-[#070B19] text-slate-700 dark:text-slate-300 flex flex-col justify-between select-none shrink-0 border-r border-slate-200 dark:border-slate-800 transition-colors z-20">
      
      {/* Top Branding & Navigation */}
      <div className="flex flex-col">
        
        {/* Brand Header */}
        <div 
          onClick={() => setCurrentView('landing')}
          className="h-14 bg-[#070B19] px-4 flex items-center gap-2.5 cursor-pointer border-b border-slate-800 shrink-0"
        >
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <Orbit className="w-4 h-4 animate-spin" style={{ animationDuration: '24s' }} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-white text-sm tracking-wider font-sans">VYOM DRISHTI</span>
            <span className="font-extrabold text-cyan-400 text-sm tracking-wider font-sans">AI</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as any)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-cyan-400 font-bold border-l-4 border-blue-600'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 font-medium'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 transition ${isActive ? 'text-blue-600 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-500'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Bharatiya Antariksh Station (BAS) Telemetry Card */}
      <div className="p-3">
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            {/* Indian Flag SVG */}
            <div className="w-5 h-3.5 rounded-xs overflow-hidden shrink-0 border border-slate-300 dark:border-slate-700 flex flex-col">
              <div className="h-1/3 bg-[#FF9933]" />
              <div className="h-1/3 bg-white flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-[#000080]" />
              </div>
              <div className="h-1/3 bg-[#128807]" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-slate-900 dark:text-white text-[11px] leading-tight truncate">
                Bharatiya Antariksh
              </div>
              <div className="font-bold text-slate-900 dark:text-white text-[11px] leading-tight truncate">
                Station (BAS)
              </div>
            </div>
          </div>

          <div className="text-[10.5px] font-medium text-blue-600 dark:text-cyan-400">
            For Safer, Smarter Space
          </div>

          <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[10px] text-blue-600 dark:text-cyan-400 font-mono">
            <span>● 25.6° N</span>
            <span>● 82.9° E</span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            ● 408 km Altitude
          </div>
        </div>
      </div>

    </aside>
  );
};
