import React from 'react';
import { SeverityLevel, ValidationState, StepStatus } from '../../types/mission';

interface AerospaceBadgeProps {
  status: ValidationState | StepStatus | SeverityLevel | 'ONLINE' | 'OFFLINE' | 'DEGRADED' | 'LIVE' | 'STANDBY';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  pulsing?: boolean;
}

export const AerospaceBadge: React.FC<AerospaceBadgeProps> = ({ 
  status, 
  label, 
  size = 'md',
  pulsing = false 
}) => {
  let badgeStyle = 'bg-slate-800/80 text-slate-300 border-slate-700';
  let dotColor = 'bg-slate-400';
  let displayLabel = label || status;

  switch (status) {
    case 'CORRECT':
    case 'COMPLETED':
    case 'ONLINE':
    case 'LIVE':
      badgeStyle = 'bg-emerald-950/70 text-emerald-300 border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.2)]';
      dotColor = 'bg-emerald-400';
      if (!label && status === 'CORRECT') displayLabel = '✓ CORRECT STEP';
      break;
    case 'IN_PROGRESS':
      badgeStyle = 'bg-cyan-950/70 text-cyan-300 border-cyan-500/50 shadow-[0_0_8px_rgba(0,229,255,0.2)]';
      dotColor = 'bg-cyan-400';
      if (!label) displayLabel = '● IN PROGRESS';
      break;
    case 'SKIPPED':
    case 'WARNING':
    case 'DEGRADED':
      badgeStyle = 'bg-amber-950/70 text-amber-300 border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.2)]';
      dotColor = 'bg-amber-400';
      if (!label && status === 'SKIPPED') displayLabel = '⚠ SKIPPED STEP';
      break;
    case 'OUT_OF_SEQUENCE':
    case 'SEQUENCE ERROR':
    case 'CRITICAL':
    case 'OFFLINE':
      badgeStyle = 'bg-rose-950/70 text-rose-300 border-rose-500/60 shadow-[0_0_10px_rgba(239,68,68,0.25)]';
      dotColor = 'bg-rose-500';
      if (!label && status === 'OUT_OF_SEQUENCE') displayLabel = '⚠ OUT-OF-SEQUENCE';
      break;
    case 'REPEATED':
      badgeStyle = 'bg-indigo-950/70 text-indigo-300 border-indigo-500/50 shadow-[0_0_8px_rgba(99,102,241,0.2)]';
      dotColor = 'bg-indigo-400';
      if (!label) displayLabel = '↻ REPEATED STEP';
      break;
    case 'PENDING':
    case 'STANDBY':
    case 'IDLE':
      badgeStyle = 'bg-slate-900/80 text-slate-400 border-slate-700/80';
      dotColor = 'bg-slate-500';
      if (!label && status === 'IDLE') displayLabel = 'STANDBY';
      break;
    case 'INFO':
      badgeStyle = 'bg-sky-950/70 text-sky-300 border-sky-500/40';
      dotColor = 'bg-sky-400';
      break;
  }

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 tracking-wider',
    md: 'text-xs px-2.5 py-1 tracking-wider',
    lg: 'text-sm px-3.5 py-1.5 font-semibold tracking-wide'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono uppercase font-medium rounded-sm border ${badgeStyle} ${sizeClasses[size]} transition-all`}>
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${dotColor} ${pulsing ? 'animate-ping' : ''}`} />
      <span>{displayLabel}</span>
    </span>
  );
};
