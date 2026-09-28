import React, { useState, useRef, useEffect } from 'react';
import { useMissionStore } from '../../store/missionStore';
import { NotificationItem, NotificationType } from '../../types/notification';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  Bot, 
  ShieldCheck, 
  Activity, 
  Clock, 
  X,
  ExternalLink
} from 'lucide-react';

interface NotificationCenterPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenterPanel: React.FC<NotificationCenterPanelProps> = ({ isOpen, onClose }) => {
  const { 
    notifications, 
    unreadNotificationCount, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    dismissNotification, 
    clearAllNotifications,
    setCurrentView 
  } = useMissionStore();

  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on escape or outside click
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredNotifications = filter === 'UNREAD' 
    ? notifications.filter(n => !n.read) 
    : notifications;

  // Format relative time (e.g. "2 min ago")
  const getRelativeTime = (isoString: string) => {
    try {
      const now = Date.now();
      const then = new Date(isoString).getTime();
      const diffSec = Math.floor((now - then) / 1000);

      if (diffSec < 45) return 'Just now';
      if (diffSec < 90) return '1 min ago';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)} min ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hr ago`;
      return `${Math.floor(diffSec / 86400)} d ago`;
    } catch {
      return 'Recent';
    }
  };

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'ERROR':
        return <AlertCircle className="w-4 h-4 text-rose-400" />;
      case 'AI':
        return <Bot className="w-4 h-4 text-violet-400" />;
      case 'SECURITY':
        return <ShieldCheck className="w-4 h-4 text-cyan-400" />;
      case 'MISSION':
        return <Activity className="w-4 h-4 text-blue-400" />;
      default:
        return <Info className="w-4 h-4 text-sky-400" />;
    }
  };

  const getTypeBadgeClass = (type: NotificationType) => {
    switch (type) {
      case 'SUCCESS':
        return 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60';
      case 'WARNING':
        return 'bg-amber-950/70 text-amber-300 border-amber-800/60';
      case 'ERROR':
        return 'bg-rose-950/70 text-rose-300 border-rose-800/60';
      case 'AI':
        return 'bg-violet-950/70 text-violet-300 border-violet-800/60';
      case 'SECURITY':
        return 'bg-cyan-950/70 text-cyan-300 border-cyan-800/60';
      case 'MISSION':
        return 'bg-blue-950/70 text-blue-300 border-blue-800/60';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const handleNotificationClick = (item: NotificationItem) => {
    markNotificationAsRead(item.id);
    if (item.actionLink) {
      setCurrentView(item.actionLink as any);
      onClose();
    }
  };

  return (
    <div 
      ref={panelRef}
      className="absolute right-0 top-12 w-80 sm:w-96 max-h-[85vh] rounded-2xl bg-[#0B132B] dark:bg-[#070B19] border border-slate-800 text-slate-200 shadow-2xl z-50 flex flex-col overflow-hidden animate-fadeIn"
    >
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-2 bg-[#0E1736]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white tracking-wide">NOTIFICATIONS</h3>
            <p className="text-[10px] text-slate-400">
              {unreadNotificationCount > 0 ? `${unreadNotificationCount} unread mission event${unreadNotificationCount > 1 ? 's' : ''}` : 'All events up to date'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {unreadNotificationCount > 0 && (
            <button
              onClick={markAllNotificationsAsRead}
              title="Mark all as read"
              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition text-xs flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Mark read</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 py-2 border-b border-slate-800/80 flex items-center justify-between text-xs bg-slate-900/40">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              filter === 'ALL' 
                ? 'bg-blue-600 text-white font-bold' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('UNREAD')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              filter === 'UNREAD' 
                ? 'bg-blue-600 text-white font-bold' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Unread ({unreadNotificationCount})
          </button>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={clearAllNotifications}
            className="text-[11px] text-slate-500 hover:text-rose-400 transition flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-1 max-h-[420px]">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-800/80 text-slate-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5 text-emerald-500/60" />
            </div>
            <p className="text-xs font-bold text-slate-400">No Notifications</p>
            <p className="text-[11px] text-slate-500">
              {filter === 'UNREAD' ? 'You have read all mission events.' : 'No mission events recorded yet.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleNotificationClick(item)}
              className={`p-3 rounded-xl transition cursor-pointer flex items-start gap-3 relative group ${
                !item.read 
                  ? 'bg-slate-900/90 hover:bg-slate-850 border border-blue-500/20' 
                  : 'hover:bg-slate-900/60 text-slate-400'
              }`}
            >
              {/* Unread indicator dot */}
              {!item.read && (
                <span className="w-2 h-2 rounded-full bg-blue-500 absolute top-3.5 right-3 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
              )}

              {/* Type Icon */}
              <div className="mt-0.5 p-1.5 rounded-lg bg-slate-800 border border-slate-700/80 shrink-0">
                {getTypeIcon(item.type)}
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 pr-3">
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold border uppercase ${getTypeBadgeClass(item.type)}`}>
                    {item.type}
                  </span>
                  <span className="text-xs font-bold text-white truncate">
                    {item.title}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-snug break-words">
                  {item.message}
                </p>

                <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono pt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{getRelativeTime(item.timestamp)}</span>
                  </span>
                  <span>•</span>
                  <span>{item.metTimestamp}</span>
                  {item.actionLink && (
                    <span className="text-blue-400 group-hover:underline flex items-center gap-0.5 ml-auto">
                      <span>View</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
              </div>

              {/* Dismiss button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  dismissNotification(item.id);
                }}
                title="Dismiss"
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-slate-300 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer System Persistence Note */}
      <div className="p-2.5 bg-slate-900/90 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between font-mono">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Offline Edge IndexedDB Synced</span>
        </span>
        <span className="text-slate-500">SIH #26174</span>
      </div>
    </div>
  );
};
