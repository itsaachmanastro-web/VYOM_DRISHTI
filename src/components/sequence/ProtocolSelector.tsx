import React from 'react';
import { useMissionStore } from '../../store/missionStore';
import { EXPERIMENT_PROTOCOLS } from '../../services/mockData';
import { Beaker, Dna, Waves, ShieldCheck, MapPin, UserCheck } from 'lucide-react';

export const ProtocolSelector: React.FC = () => {
  const { activeProtocol, setActiveProtocol } = useMissionStore();

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'BIOLOGICAL': return Dna;
      case 'CELL_CULTURE': return Beaker;
      case 'PHYSICAL_SCIENCES': return Waves;
      default: return Beaker;
    }
  };

  return (
    <div className="p-4 rounded-lg border border-space-border bg-space-900/90 tech-corner-decor">
      <div className="flex items-center justify-between border-b border-space-border/80 pb-2 mb-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Beaker className="w-4 h-4 text-cyan-400" />
          <span className="text-white font-bold">SELECT ON-BOARD PAYLOAD PROTOCOL</span>
        </div>
        <span className="text-space-400">ACTIVE: {activeProtocol.code}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
        {EXPERIMENT_PROTOCOLS.map(proto => {
          const Icon = getCategoryIcon(proto.category);
          const isSelected = activeProtocol.id === proto.id;

          return (
            <button
              key={proto.id}
              onClick={() => setActiveProtocol(proto.id)}
              className={`p-3 rounded text-left transition border ${
                isSelected
                  ? 'bg-cyan-950/70 border-cyan-500 text-white shadow-[0_0_12px_rgba(0,229,255,0.15)]'
                  : 'bg-space-950 border-space-border text-space-300 hover:border-space-border/80 hover:bg-space-850'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                  <Icon className="w-3.5 h-3.5" />
                  <span>{proto.code}</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-space-900 text-space-400 border border-space-border">
                  {proto.totalSteps} STEPS
                </span>
              </div>

              <div className="text-xs font-semibold text-white truncate mb-1">
                {proto.name}
              </div>

              <div className="text-[11px] text-space-400 font-sans line-clamp-2 mb-2">
                {proto.description}
              </div>

              <div className="pt-2 border-t border-space-border/50 flex items-center justify-between text-[10px] text-space-400">
                <span className="truncate max-w-[150px]">{proto.rackLocation}</span>
                <span className="text-emerald-400 font-semibold">{proto.hazardLevel}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
