import React, { useState, useRef, useEffect } from 'react';
import { useMissionStore } from '../../store/missionStore';
import { 
  User, 
  ShieldCheck, 
  LogOut, 
  Sun, 
  Moon, 
  ChevronDown, 
  Lock, 
  Sparkles, 
  Clock, 
  FlaskConical,
  Bell
} from 'lucide-react';
import { LogoutConfirmModal } from './LogoutConfirmModal';

interface UserProfileMenuProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  onOpenNotifications?: () => void;
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({ 
  isDarkMode, 
  toggleTheme,
  onOpenNotifications 
}) => {
  const { session, setCurrentView } = useMissionStore();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const user = session?.user || {
    displayName: 'A. Bhardwaj',
    role: 'ASTRONAUT' as const,
    maskedMissionId: '••••••••4821',
    organization: 'ISRO Human Space Flight Centre',
    rankOrTitle: 'Mission Specialist / Payload Commander',
    avatarColor: 'from-blue-600 to-indigo-600'
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      <div className="relative" ref={menuRef}>
        {/* Profile Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left group"
          title={`Profile: ${user.displayName} (${user.role})`}
        >
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
            {getInitials(user.displayName)}
          </div>
          
          <div className="hidden md:block leading-tight">
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
              <span>{user.displayName.includes('Astronaut') ? user.displayName : `Astronaut ${user.displayName}`}</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              BAS Crew
            </div>
          </div>
        </button>

        {/* Dropdown Panel */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-xl p-4 z-50 animate-fadeIn space-y-3.5">
            
            {/* Header Identity Card */}
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center shadow-sm">
                {getInitials(user.displayName)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-slate-900 dark:text-white truncate">{user.displayName}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user.rankOrTitle}</div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">{user.organization}</div>
              </div>
            </div>

            {/* Mission Identifier & Status Pill */}
            <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[10px] uppercase">Mission ID</span>
                <span className="font-bold text-cyan-300">{user.maskedMissionId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[10px] uppercase">Role Authorization</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-800/60 font-bold">
                  {user.role}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[10px] uppercase">Session Security</span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-sans">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Authenticated</span>
                </span>
              </div>
            </div>

            {/* Quick Actions List */}
            <div className="space-y-1 text-xs">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setCurrentView('overview');
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition text-left"
              >
                <FlaskConical className="w-3.5 h-3.5 text-blue-400" />
                <span>Mission Access Overview</span>
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  if (onOpenNotifications) onOpenNotifications();
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition text-left"
              >
                <Bell className="w-3.5 h-3.5 text-cyan-400" />
                <span>Notifications Center</span>
              </button>

              <button
                onClick={() => {
                  toggleTheme();
                }}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition text-left"
              >
                <div className="flex items-center gap-2.5">
                  {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-400" />}
                  <span>Interface Theme</span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase font-mono">{isDarkMode ? 'Dark' : 'Light'}</span>
              </button>
            </div>

            {/* Logout Action */}
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowLogoutModal(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-600/15 hover:bg-rose-600/25 border border-rose-500/30 text-rose-400 hover:text-rose-300 font-bold text-xs transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out of VYOM DRISHTI</span>
              </button>
            </div>

          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
    </>
  );
};
