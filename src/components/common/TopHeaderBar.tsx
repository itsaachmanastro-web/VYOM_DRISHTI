import React, { useState, useEffect } from 'react';
import { useMissionStore } from '../../store/missionStore';
import { 
  Orbit, 
  Bell, 
  Sun, 
  Moon, 
  Clock, 
  CheckCircle2, 
  Cpu,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { NotificationCenterPanel } from '../notifications/NotificationCenterPanel';
import { UserProfileMenu } from './UserProfileMenu';

export const TopHeaderBar: React.FC = () => {
  const { 
    activeProtocol, 
    protocols, 
    setActiveProtocol, 
    startDemoMode,
    unreadNotificationCount,
    telemetry,
    tickTelemetry,
    connectionState,
    session
  } = useMissionStore();

  const [utcTime, setUtcTime] = useState<string>('28 Sep 2026 19:17:07 (UTC)');
  const [showProtocolMenu, setShowProtocolMenu] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    try {
      const storedTheme = typeof window !== 'undefined' ? localStorage.getItem('vyom_theme') : null;
      const isDark = storedTheme ? storedTheme === 'dark' : (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));
      setIsDarkMode(isDark);
      if (typeof document !== 'undefined') {
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    } catch (e) {
      setIsDarkMode(true);
    }
  }, []);

  // Live UTC Clock updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const day = now.getUTCDate().toString().padStart(2, '0');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[now.getUTCMonth()];
      const year = now.getUTCFullYear();
      const hours = now.getUTCHours().toString().padStart(2, '0');
      const mins = now.getUTCMinutes().toString().padStart(2, '0');
      const secs = now.getUTCSeconds().toString().padStart(2, '0');
      setUtcTime(`${day} ${month} ${year} | ${hours}:${mins}:${secs} (UTC)`);
    };

    updateTime();
    const timer = setInterval(() => {
      updateTime();
      tickTelemetry();
    }, 1000);

    return () => clearInterval(timer);
  }, [tickTelemetry]);

  // Toggle Theme with LocalStorage persistence
  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('vyom_theme', next ? 'dark' : 'light');
      }
    } catch (e) {
      console.warn('LocalStorage unavailable for theme storage');
    }
    if (typeof document !== 'undefined') {
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const userInitials = session?.user?.displayName
    ? session.user.displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'AB';

  return (
    <header className="bg-white dark:bg-[#070B19] border-b border-slate-200 dark:border-slate-800/90 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 select-none sticky top-0 z-30 transition-colors">
      
      {/* Left: Active Experiment Designation & Dropdown */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600/10 dark:bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-cyan-400 shrink-0">
          <Orbit className="w-4 h-4 animate-spin" style={{ animationDuration: '24s' }} />
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowProtocolMenu(!showProtocolMenu)}
            className="text-left group flex items-center gap-2"
          >
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-1.5 group-hover:text-blue-600 dark:group-hover:text-cyan-300 transition">
                <span>{activeProtocol.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {activeProtocol.code} • On-board Experiment
              </div>
            </div>
          </button>

          {/* Protocol Selection Dropdown */}
          {showProtocolMenu && (
            <div className="absolute left-0 mt-2 w-80 bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-slate-750 rounded-xl shadow-xl py-1.5 z-50 animate-fadeIn">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Select Active Experiment
              </div>
              {protocols.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setActiveProtocol(p.id);
                    setShowProtocolMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-start justify-between gap-2 transition ${
                    activeProtocol.id === p.id 
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold' 
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div>
                    <div className="font-bold leading-tight text-slate-900 dark:text-white">{p.name}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{p.code} • {p.totalSteps} Steps</div>
                  </div>
                  {activeProtocol.id === p.id && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center: 3 Scientific Status Indicators & 1-Click Demo Launcher */}
      <div className="hidden lg:flex items-center gap-3">
        {/* Quick Demo Mode Launcher */}
        <button
          onClick={startDemoMode}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-xs text-[11px] font-bold transition transform hover:scale-105 active:scale-95"
          title="Launch 4-Step Live Webcam Demo Experiment (MoveNet Real-Time Tracking)"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>4-Step Live Demo</span>
        </button>

        {/* Status 1: Experiment Running */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 text-[11px] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Experiment Running</span>
        </div>

        {/* Status 2: System Online */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-750 text-[11px] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span>System Online</span>
        </div>

        {/* Status 3: AI Active */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-750 text-[11px] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span>AI Active</span>
        </div>
      </div>

      {/* Right: Date/Time, Notifications, Theme Switcher & Astronaut Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        
        {/* UTC Date & Clock */}
        <div className="hidden xl:flex items-center gap-1.5 text-xs font-sans text-slate-500 dark:text-slate-400 font-medium">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{utcTime}</span>
        </div>

        {/* Real-Time Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            title="Real-time Mission Notifications"
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition relative ${
              showNotifications
                ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bell className="w-4 h-4" />
          </button>
          
          {unreadNotificationCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-rose-500 text-white text-[9.5px] font-bold flex items-center justify-center shadow-sm animate-pulse">
              {unreadNotificationCount}
            </span>
          )}

          {/* Slideout Notification Center */}
          <NotificationCenterPanel
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
          />
        </div>

        {/* Theme Switcher Toggle */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`}
          className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 flex items-center justify-center transition"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Astronaut Profile Pill */}
        <UserProfileMenu
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onOpenNotifications={() => setShowNotifications(true)}
        />

      </div>
    </header>
  );
};
