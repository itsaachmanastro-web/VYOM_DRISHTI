import React from 'react';
import { useMissionStore } from '../../store/missionStore';
import { 
  LayoutDashboard, 
  Video, 
  ListOrdered, 
  BrainCircuit, 
  Bot, 
  BellRing, 
  Box, 
  ScrollText, 
  BarChart3, 
  WifiOff, 
  Sliders,
  Compass
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const { currentView, setCurrentView, alerts } = useMissionStore();

  const unreadAlertsCount = alerts.filter(a => !a.acknowledged).length;

  const navItems = [
    { id: 'overview', label: 'Mission Overview', icon: LayoutDashboard, badge: null },
    { id: 'live-monitor', label: 'Live Monitor', icon: Video, badge: 'LIVE' },
    { id: 'sequence', label: 'Sequence Intelligence', icon: ListOrdered, badge: null },
    { id: 'perception', label: 'AI Perception', icon: BrainCircuit, badge: 'INT8' },
    { id: 'assistant', label: 'Mission Assistant', icon: Bot, badge: null },
    { id: 'alerts', label: 'Voice Alerts', icon: BellRing, badge: unreadAlertsCount > 0 ? `${unreadAlertsCount}` : null },
    { id: 'hmr-3d', label: '3D Spatial / HMR', icon: Box, badge: '3D' },
    { id: 'logs', label: 'Mission Log', icon: ScrollText, badge: null },
    { id: 'analytics', label: 'Telemetry & Bandwidth', icon: BarChart3, badge: '-95% BW' },
    { id: 'uplink', label: 'Offline & Uplink', icon: WifiOff, badge: null },
    { id: 'health', label: 'System Health', icon: Sliders, badge: null },
  ] as const;

  return (
    <nav className="bg-space-950 border-b border-space-border px-4 py-1.5 overflow-x-auto select-none">
      <div className="flex items-center justify-between min-w-max gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentView('landing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition border ${
              currentView === 'landing'
                ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/50 shadow-[0_0_8px_rgba(0,229,255,0.15)]'
                : 'text-space-400 hover:text-space-100 hover:bg-space-850 border-transparent'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Mission Portal</span>
          </button>
          
          <div className="h-4 w-px bg-space-border mx-1" />

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as any)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono transition border ${
                  isActive
                    ? 'bg-space-800 text-cyan-300 border-cyan-500/40 shadow-[0_0_10px_rgba(0,229,255,0.1)] font-semibold'
                    : 'text-space-400 hover:text-space-200 hover:bg-space-900 border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-space-500'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                    item.badge === 'LIVE' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40 animate-pulse' :
                    item.id === 'alerts' && unreadAlertsCount > 0 ? 'bg-rose-950 text-rose-300 border border-rose-500/60' :
                    'bg-space-850 text-space-400 border border-space-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Help / Info Pill */}
        <div className="hidden xl:flex items-center gap-2 text-[11px] font-mono text-space-500 bg-space-900 px-2.5 py-1 rounded border border-space-border/60">
          <span>SIH-2026: #26174</span>
          <span className="text-space-600">|</span>
          <span className="text-space-400">Team AvishkarX</span>
        </div>
      </div>
    </nav>
  );
};
