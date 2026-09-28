import React from 'react';
import { 
  Check, 
  X, 
  TrendingDown, 
  TrendingUp, 
  Radio, 
  ShieldCheck, 
  Users, 
  Globe2, 
  Rocket, 
  Sparkles,
  Award
} from 'lucide-react';

export const MissionBenefits: React.FC = () => {
  const comparisons = [
    {
      feature: 'Experiment Tracking',
      existing: 'Manual paper checklists & physical clipboards',
      vyom: 'Automated Real-Time AI Sequence Validation',
      vyomGood: true
    },
    {
      feature: 'Ground Support Dependency',
      existing: 'Relies on continuous Earth CAPCOM verbal check-ins',
      vyom: '100% Autonomous On-board Edge AI Guidance',
      vyomGood: true
    },
    {
      feature: 'Deep-Space Comm Delay',
      existing: 'Crippled by round-trip latency (up to 20 mins on Mars)',
      vyom: 'Local 18ms Real-Time Video Analysis at the Edge',
      vyomGood: true
    },
    {
      feature: 'Data Bandwidth Overhead',
      existing: 'Heavy raw video streaming saturates satellite downlink',
      vyom: '85–95% Bandwidth Reduction via Structured Telemetry',
      vyomGood: true
    },
    {
      feature: 'Microgravity Posture Tracking',
      existing: 'Standard 2D upright models fail in zero-g tumbling',
      vyom: 'Orientation-Agnostic 3D Human Mesh Recovery (HMR)',
      vyomGood: true
    },
    {
      feature: 'Error & Deviation Catching',
      existing: 'Errors only noticed hours/days later in post-analysis',
      vyom: 'Instant Voice Alerts on Skipped / Out-of-Sequence Steps',
      vyomGood: true
    }
  ];

  return (
    <section className="py-16 bg-space-900 border-b border-space-border relative">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded text-xs font-mono text-emerald-400 mb-3">
            <Award className="w-3.5 h-3.5" />
            <span>REAL SOLUTION • REAL IMPACT</span>
          </div>
          <h2 className="text-3xl font-display font-bold text-white">
            Operational Impact & Scientific Benefits
          </h2>
          <p className="text-sm text-space-300 font-mono mt-2">
            Transforming space biology, physics research, and astronaut safety across BAS, Gaganyaan, and deep-space habitats.
          </p>
        </div>

        {/* Comparison Matrix Table */}
        <div className="mb-14 overflow-x-auto">
          <div className="rounded-lg border border-space-border bg-space-950 overflow-hidden min-w-[700px]">
            <div className="grid grid-cols-12 bg-space-900 px-5 py-3 border-b border-space-border text-xs font-mono font-bold text-space-300 uppercase tracking-wider">
              <div className="col-span-3">Core Operational Feature</div>
              <div className="col-span-4 text-rose-400">Legacy / Existing Systems</div>
              <div className="col-span-5 text-cyan-400">VYOM DRISHTI AI Platform</div>
            </div>

            <div className="divide-y divide-space-border/60 text-xs font-mono">
              {comparisons.map((row, idx) => (
                <div key={idx} className="grid grid-cols-12 px-5 py-3.5 items-center hover:bg-space-900/50 transition">
                  <div className="col-span-3 text-space-200 font-semibold">{row.feature}</div>
                  <div className="col-span-4 text-space-400 flex items-start gap-2 pr-4">
                    <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{row.existing}</span>
                  </div>
                  <div className="col-span-5 text-emerald-300 flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="font-medium text-white">{row.vyom}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stakeholder Impact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 rounded-lg border border-space-border bg-space-950 tech-corner-decor">
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold mb-3">
              <Users className="w-4 h-4" />
              <span>ASTRONAUTS</span>
            </div>
            <h4 className="text-sm font-semibold text-white mb-2">Reduced Mental Load</h4>
            <p className="text-xs text-space-300 leading-relaxed">
              Eliminates the cognitive friction of reading complex SOP manuals while working in pressurized suits or biosafety gloveboxes.
            </p>
          </div>

          <div className="p-5 rounded-lg border border-space-border bg-space-950 tech-corner-decor">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold mb-3">
              <Radio className="w-4 h-4" />
              <span>MISSION CONTROL</span>
            </div>
            <h4 className="text-sm font-semibold text-white mb-2">Optimized Comms</h4>
            <p className="text-xs text-space-300 leading-relaxed">
              Flight directors receive verified step checkpoints without having to continuously monitor hundreds of video streams.
            </p>
          </div>

          <div className="p-5 rounded-lg border border-space-border bg-space-950 tech-corner-decor">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold mb-3">
              <Globe2 className="w-4 h-4" />
              <span>EARTH SCIENTISTS</span>
            </div>
            <h4 className="text-sm font-semibold text-white mb-2">Guaranteed Accuracy</h4>
            <p className="text-xs text-space-300 leading-relaxed">
              Principal investigators get validated, millisecond-timestamped execution manifests proving experimental protocol compliance.
            </p>
          </div>

          <div className="p-5 rounded-lg border border-space-border bg-space-950 tech-corner-decor">
            <div className="flex items-center gap-2 text-purple-400 font-mono text-xs font-bold mb-3">
              <Rocket className="w-4 h-4" />
              <span>DEEP SPACE & LUNAR</span>
            </div>
            <h4 className="text-sm font-semibold text-white mb-2">True Autonomy</h4>
            <p className="text-xs text-space-300 leading-relaxed">
              Provides the technological foundation for autonomous biological research during future Moon base and Mars transit missions.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
