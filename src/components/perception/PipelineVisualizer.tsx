import React from 'react';
import { 
  Camera, 
  Cpu, 
  User, 
  Activity, 
  Box, 
  Layers, 
  Bot, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Zap
} from 'lucide-react';
import { AerospaceBadge } from '../common/AerospaceBadge';

export const PipelineVisualizer: React.FC = () => {
  const stages = [
    {
      id: 'input',
      title: '1. SENSOR INGESTION',
      name: 'Payload Camera Feed',
      metric: '1080p @ 30 FPS',
      latency: '0.4 ms',
      icon: Camera,
      color: 'text-cyan-400',
      borderColor: 'border-cyan-500/40'
    },
    {
      id: 'human',
      title: '2. HUMAN BOUNDING',
      name: 'YOLOv8n-Space INT8',
      metric: '1 Human Locked',
      latency: '4.8 ms',
      icon: User,
      color: 'text-cyan-300',
      borderColor: 'border-cyan-500/40'
    },
    {
      id: 'pose',
      title: '3. ZERO-G POSE',
      name: 'ZeroG-PoseNet',
      metric: '17 Keypoints (3D)',
      latency: '6.2 ms',
      icon: Activity,
      color: 'text-sky-400',
      borderColor: 'border-sky-500/40'
    },
    {
      id: 'object',
      title: '4. OBJECT DETECTION',
      name: 'SpaceObject-ViT',
      metric: '4 Objects Tracked',
      latency: '5.1 ms',
      icon: Box,
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500/40'
    },
    {
      id: 'hoi',
      title: '5. HOI REASONING',
      name: 'Spatial GNN HOI',
      metric: 'G-Score: 96.4%',
      latency: '3.9 ms',
      icon: Layers,
      color: 'text-amber-400',
      borderColor: 'border-amber-500/40'
    },
    {
      id: 'har',
      title: '6. ACTION RECOGNITION',
      name: 'Action Transformer',
      metric: 'Sliding Win (64F)',
      latency: '8.4 ms',
      icon: Bot,
      color: 'text-purple-400',
      borderColor: 'border-purple-500/40'
    },
    {
      id: 'validator',
      title: '7. SEQUENCE ENGINE',
      name: 'Protocol State Engine',
      metric: 'Validation: CORRECT',
      latency: '0.8 ms',
      icon: CheckCircle2,
      color: 'text-emerald-300',
      borderColor: 'border-emerald-500/60'
    }
  ];

  return (
    <div className="p-5 rounded-lg border border-space-border bg-space-900/90 tech-corner-decor">
      <div className="flex items-center justify-between border-b border-space-border/80 pb-3 mb-5 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span className="text-white font-bold tracking-wider">END-TO-END ON-BOARD AI PERCEPTION PIPELINE</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-space-400">TOTAL LATENCY:</span>
          <span className="text-cyan-300 font-bold">18.4 ms (54 FPS Theoretical)</span>
        </div>
      </div>

      {/* Horizontal Sequential Pipeline Flow */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3 font-mono">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          return (
            <div 
              key={stage.id}
              className={`p-3 rounded bg-space-950 border ${stage.borderColor} flex flex-col justify-between relative group hover:bg-space-850 transition`}
            >
              <div>
                <span className="text-[9px] text-space-500 block mb-1 font-bold">{stage.title}</span>
                <div className="flex items-center gap-1.5 mb-2">
                  <Icon className={`w-4 h-4 ${stage.color}`} />
                  <span className="text-white font-semibold text-xs truncate">{stage.name}</span>
                </div>
                <div className="text-[10px] text-space-300 bg-space-900 px-2 py-1 rounded border border-space-border/60">
                  {stage.metric}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-space-border/50 flex items-center justify-between text-[10px]">
                <span className="text-space-500">Latency:</span>
                <span className="text-cyan-300 font-semibold">{stage.latency}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
