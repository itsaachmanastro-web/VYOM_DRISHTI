import React from 'react';
import { useMissionStore } from '../../store/missionStore';
import { 
  ScrollText, 
  ChevronRight, 
  CheckCircle2, 
  Info,
  CircleDot
} from 'lucide-react';

export const RecentActivityLogCard: React.FC = () => {
  const { setCurrentView } = useMissionStore();

  const activityEvents = [
    {
      time: '19:17:04',
      event: 'Sample container detected',
      status: 'Verified',
      type: 'success'
    },
    {
      time: '19:16:52',
      event: 'Right hand raised',
      status: 'Verified',
      type: 'success'
    },
    {
      time: '19:16:35',
      event: 'Astronaut in frame',
      status: 'Detected',
      type: 'detected'
    },
    {
      time: '19:16:20',
      event: 'System initialized',
      status: 'Info',
      type: 'info'
    }
  ];

  return (
    <div className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-3.5 shadow-sm select-none">
      
      {/* Header matching Reference */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <ScrollText className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
          <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
            Recent Activity
          </h3>
        </div>

        <button 
          onClick={() => setCurrentView('logs')}
          className="text-xs text-blue-600 dark:text-cyan-400 hover:underline font-semibold"
        >
          View All
        </button>
      </div>

      {/* Activity Table Rows matching Reference */}
      <div className="divide-y divide-slate-100 dark:divide-slate-850/60 text-xs pt-1">
        {activityEvents.map((evt, idx) => (
          <div key={idx} className="py-2 flex items-center justify-between gap-2">
            <span className="font-mono text-[11px] text-slate-400 shrink-0">
              {evt.time}
            </span>
            
            <span className="font-medium text-slate-800 dark:text-slate-200 truncate flex-1 min-w-0 text-[11.5px]">
              {evt.event}
            </span>

            <div className="shrink-0 flex items-center gap-1 font-semibold text-[11px]">
              {evt.type === 'success' && (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>{evt.status}</span>
                </span>
              )}

              {evt.type === 'detected' && (
                <span className="text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                  <CircleDot className="w-3 h-3 text-cyan-500" />
                  <span>{evt.status}</span>
                </span>
              )}

              {evt.type === 'info' && (
                <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <Info className="w-3 h-3 text-blue-500" />
                  <span>{evt.status}</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
