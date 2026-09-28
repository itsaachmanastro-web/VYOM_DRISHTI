import React from 'react';
import { useMissionStore } from '../../store/missionStore';
import { Layers, Crosshair, Zap, Check, ArrowRight } from 'lucide-react';

export const HOIInteractionMatrix: React.FC = () => {
  const { hoiInteraction, boundingBoxes } = useMissionStore();

  const interactions = [
    { target: 'Micropipette-25uL', distanceCm: 2.1, contactState: 'ACTIVE_GRIP', gScore: 0.964, active: true },
    { target: 'Sample-Vial-04', distanceCm: 4.8, contactState: 'PROXIMITY_HOLD', gScore: 0.882, active: false },
    { target: 'Cryo-Cassette-A2', distanceCm: 9.4, contactState: 'ALIGNED_STAGE', gScore: 0.740, active: false },
    { target: 'Thermal-Locker-A2', distanceCm: 34.0, contactState: 'DISENGAGED', gScore: 0.120, active: false },
  ];

  return (
    <div className="p-5 rounded-lg border border-space-border bg-space-900/90 tech-corner-decor">
      <div className="flex items-center justify-between border-b border-space-border/80 pb-3 mb-4 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span className="text-white font-bold">HAND-OBJECT INTERACTION (HOI) SPATIAL CONTACT MATRIX</span>
        </div>
        <span className="text-emerald-400 font-bold">PRIMARY: {hoiInteraction.targetObject}</span>
      </div>

      <div className="overflow-x-auto font-mono text-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-space-border text-[11px] text-space-400 bg-space-950">
              <th className="p-2.5">PAYLOAD TARGET</th>
              <th className="p-2.5">DISTANCE</th>
              <th className="p-2.5">CONTACT STATE</th>
              <th className="p-2.5">G-SCORE CONFIDENCE</th>
              <th className="p-2.5 text-right">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-space-border/50">
            {interactions.map((item, idx) => (
              <tr key={idx} className={`hover:bg-space-850/50 transition ${item.active ? 'bg-emerald-950/20' : ''}`}>
                <td className="p-2.5 font-semibold text-white flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${item.active ? 'bg-emerald-400 animate-ping' : 'bg-space-600'}`} />
                  <span>{item.target}</span>
                </td>
                <td className="p-2.5 text-space-300">{item.distanceCm} cm</td>
                <td className="p-2.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] ${
                    item.active ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/40' : 'bg-space-950 text-space-400 border border-space-800'
                  }`}>
                    {item.contactState}
                  </span>
                </td>
                <td className="p-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-space-950 rounded overflow-hidden border border-space-800">
                      <div 
                        className={`h-full ${item.active ? 'bg-emerald-400' : 'bg-space-500'}`} 
                        style={{ width: `${item.gScore * 100}%` }}
                      />
                    </div>
                    <span className="text-space-300">{(item.gScore * 100).toFixed(1)}%</span>
                  </div>
                </td>
                <td className="p-2.5 text-right font-bold">
                  {item.active ? (
                    <span className="text-emerald-400">ENGAGED</span>
                  ) : (
                    <span className="text-space-500">MONITORED</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
