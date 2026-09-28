import React from 'react';
import { useMissionStore } from '../../store/missionStore';
import { 
  ShieldCheck, 
  Cpu, 
  User, 
  Box, 
  Layers, 
  Bot, 
  Camera, 
  Sparkles,
  ChevronRight
} from 'lucide-react';

export const SystemStatusCard: React.FC = () => {
  const { setCurrentView, isWebcamActive, connectionState } = useMissionStore();

  const statuses = [
    { label: 'AI Model', status: 'Active', isConnected: true },
    { label: 'Pose Estimation', status: 'Active', isConnected: true },
    { label: 'Object Detection', status: 'Active', isConnected: true },
    { label: 'Hand-Object Interaction', status: 'Active', isConnected: true },
    { label: 'Digital Twin', status: 'Active', isConnected: true },
    { label: 'Gemini AI', status: connectionState === 'ONLINE' ? 'Connected' : 'Local Fallback', isConnected: true },
    { label: 'Camera', status: isWebcamActive ? 'Active' : 'Standby', isConnected: isWebcamActive },
  ];

  return (
    <div className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-3.5 shadow-sm select-none">
      
      {/* Header matching Reference */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
            System Status
          </h3>
        </div>

        <span className="text-[10.5px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
          All Systems Nominal
        </span>
      </div>

      {/* Clean Status Rows matching Reference */}
      <div className="divide-y divide-slate-100 dark:divide-slate-850/60 text-xs">
        {statuses.map((item, idx) => (
          <div key={idx} className="py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <span className={`w-1.5 h-1.5 rounded-full ${item.isConnected ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              <span className="font-medium text-[11.5px]">{item.label}</span>
            </div>
            
            <span className={`font-semibold text-[11px] ${item.isConnected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
              {item.status}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
};
