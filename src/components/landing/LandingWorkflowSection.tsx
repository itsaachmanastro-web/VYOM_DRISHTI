import React from 'react';
import { 
  GitFork, 
  CheckCircle2, 
  AlertTriangle, 
  Timer, 
  ArrowRight, 
  Layers, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';

export const LandingWorkflowSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Cassette Extraction & Verification',
      action: 'Extract Cryo-Cassette A2 and verify thermal seal status.',
      status: 'VERIFIED',
      statusColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40',
      time: 'T+04:19:22'
    },
    {
      num: '02',
      title: 'Buffer Inoculation into Well-Matrix',
      action: 'Aspirate 25uL buffer into cassette well #3 without bubble induction.',
      status: 'ACTIVE VERIFYING',
      statusColor: 'text-cyan-300 bg-cyan-950/60 border-cyan-500/40 animate-pulse',
      time: 'T+04:20:05'
    },
    {
      num: '03',
      title: 'Centrifugal Incubation Run',
      action: 'Transfer cassette to micro-centrifuge slot #1 and latch lid.',
      status: 'PENDING',
      statusColor: 'text-slate-400 bg-slate-900 border-slate-700',
      time: 'T+04:21:40'
    },
    {
      num: '04',
      title: 'Fluorescence Staining & Thermal Seal',
      action: 'Inject fluor-tag reagent and engage magnetic safety seal.',
      status: 'PENDING',
      statusColor: 'text-slate-400 bg-slate-900 border-slate-700',
      time: 'T+04:23:10'
    }
  ];

  return (
    <section className="relative py-20 px-4 sm:px-8 max-w-[1700px] mx-auto z-10 select-none">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono backdrop-blur-md">
          <GitFork className="w-3.5 h-3.5 text-cyan-400 rotate-90" />
          <span>EXPERIMENT AUTOMATON INTELLIGENCE</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
          Deterministic Procedure Sequence Validation
        </h2>

        <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
          State-machine intelligence monitoring every physical manipulation against active Standard Operating Procedures (SOPs).
        </p>
      </div>

      {/* Horizontal Step Timeline Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((s, idx) => (
          <div
            key={idx}
            className="p-5 rounded-3xl bg-[#070D1F]/75 backdrop-blur-xl border border-slate-800 flex flex-col justify-between space-y-4 hover:border-cyan-500/40 transition"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-mono font-bold text-slate-500">
                  {s.num}
                </span>
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${s.statusColor}`}>
                  {s.status}
                </span>
              </div>

              <h3 className="text-sm font-bold font-sans text-white leading-snug mb-1.5">
                {s.title}
              </h3>

              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                {s.action}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>MET: {s.time}</span>
              <span className="text-cyan-400 font-bold">15-FRAME BUFFER</span>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
};
