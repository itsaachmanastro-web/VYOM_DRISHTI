import React from 'react';
import { 
  Eye, 
  GitCommit, 
  Compass, 
  BrainCircuit, 
  Volume2, 
  HardDrive, 
  Box, 
  ShieldCheck, 
  Zap, 
  Orbit 
} from 'lucide-react';

export const LandingCapabilities: React.FC = () => {
  const capabilities = [
    {
      icon: Eye,
      title: 'Edge-Based Real-Time Vision',
      tag: '18ms INFERENCE',
      desc: 'Processes multi-angle video feeds directly onboard the spacecraft payload rack at 30 FPS with zero dependence on ground station uplink.',
      telemetry: 'LATENCY: 18.4ms • 30 FPS'
    },
    {
      icon: GitCommit,
      title: 'Sequence Automaton Intelligence',
      tag: 'PROTOCOL ENGINE',
      desc: 'Dynamically maps recognized astronaut actions against Standard Operating Procedures (SOPs), validating step progression and temporal stability.',
      telemetry: 'ACCURACY: 95.8% • SLIDING BUFFER'
    },
    {
      icon: Compass,
      title: 'Next-Step Cognitive Guidance',
      tag: 'AI COPILOT',
      desc: 'Provides continuous operational recommendations, detects skipped steps, identifies out-of-sequence actions, and flags repetitive loops.',
      telemetry: 'STATE: PATIENT HOLD • 0 FALSE ALARMS'
    },
    {
      icon: BrainCircuit,
      title: 'Multi-Modal Perception Fusion',
      tag: 'TENSOR STACK',
      desc: 'Fuses human detection, orientation-agnostic pose keypoints, payload tool detection, and hand-object interaction (HOI) into robust action recognition.',
      telemetry: '17 KEYPOINTS • HOI MATRIX'
    },
    {
      icon: Volume2,
      title: 'Avionics Voice Assistant & TTS',
      tag: 'HANDS-FREE TTS',
      desc: 'Synthesizes real-time spoken voice guidance and cautionary chimes to keep astronauts focused on physical manipulations inside biosafety gloveboxes.',
      telemetry: 'TTS SYNTH • GEMINI REST'
    },
    {
      icon: Box,
      title: '3D Human Mesh Recovery (HMR)',
      tag: '0-G KINEMATICS',
      desc: 'Tracks full-body kinematic posture and zero-g body drift relative to the Bharatiya Antariksh Station (BAS) biological payload rack.',
      telemetry: 'EULER PITCH/ROLL/YAW • 12 JOINTS'
    }
  ];

  return (
    <section className="relative py-20 px-4 sm:px-8 max-w-[1700px] mx-auto z-10 select-none">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono backdrop-blur-md">
          <Orbit className="w-3.5 h-3.5 text-cyan-400" />
          <span>ON-BOARD FLIGHT CAPABILITIES</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
          Engineered for Microgravity Space Stations
        </h2>

        <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
          Autonomously validating complex astronaut biological payloads and microgravity procedures under strict deep-space bandwidth constraints.
        </p>
      </div>

      {/* 6 Capabilities Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {capabilities.map((cap, idx) => {
          const Icon = cap.icon;
          return (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-[#070D1F]/75 backdrop-blur-xl border border-slate-800 hover:border-cyan-500/50 transition duration-300 flex flex-col justify-between group shadow-lg hover:shadow-[0_0_25px_rgba(0,229,255,0.12)]"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:text-white group-hover:bg-cyan-500 transition">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                    {cap.tag}
                  </span>
                </div>

                <h3 className="text-base font-bold font-sans text-white mb-2 group-hover:text-cyan-300 transition">
                  {cap.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {cap.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="text-cyan-400/90 font-semibold">{cap.telemetry}</span>
                <span className="text-emerald-400 font-bold">● VERIFIED</span>
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
};
