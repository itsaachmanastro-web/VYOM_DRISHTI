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
  Activity
} from 'lucide-react';

export const CoreCapabilities: React.FC = () => {
  const capabilities = [
    {
      icon: Eye,
      title: 'Edge-Based Real-Time Video Analysis',
      tag: 'LOCAL NPU INFERENCE',
      desc: 'Processes multi-angle video feeds directly onboard the spacecraft payload rack at 30 FPS / 18ms latency with zero dependence on ground station connectivity.',
      accent: 'cyan'
    },
    {
      icon: GitCommit,
      title: 'Experiment Sequence Intelligence',
      tag: 'PROTOCOL AUTOMATON',
      desc: 'Dynamically maps recognized astronaut actions against active Standard Operating Procedures (SOPs), pinpointing exact current step and validating progression.',
      accent: 'emerald'
    },
    {
      icon: Compass,
      title: 'Next-Step Guidance & Error Detection',
      tag: 'COGNITIVE COPILOT',
      desc: 'Provides continuous operational recommendations, detects skipped steps, identifies out-of-sequence actions, and flags repetitive procedure loops.',
      accent: 'sky'
    },
    {
      icon: BrainCircuit,
      title: 'Multi-Modal AI Perception',
      tag: 'UNIFIED TENSOR STACK',
      desc: 'Fuses human detection, orientation-agnostic pose keypoints, payload tool detection, and hand-object interaction (HOI) into high-fidelity action recognition.',
      accent: 'amber'
    },
    {
      icon: Volume2,
      title: 'Avionics Voice Alerts & Guidance',
      tag: 'HANDS-FREE TTS & AUDIO',
      desc: 'Synthesizes real-time acoustic caution chimes and spoken voice prompts to keep astronauts focused on physical manipulations inside biosafety gloveboxes.',
      accent: 'rose'
    },
    {
      icon: Box,
      title: '3D Human Mesh Recovery (HMR)',
      tag: 'MICROGRAVITY KINEMATICS',
      desc: 'Tracks full-body kinematic posture and zero-g body drift relative to the Bharatiya Antariksh Station (BAS) biological payload rack coordinate system.',
      accent: 'purple'
    },
    {
      icon: HardDrive,
      title: 'Offline-First Blackbox & Storage',
      tag: 'LOCAL DISK + TELEMETRY',
      desc: 'Stores high-resolution uncompressed video on local SSD blackbox while transmitting only lightweight structured telemetry packets to Earth Ground Control.',
      accent: 'blue'
    },
    {
      icon: ShieldCheck,
      title: 'Cryptographic Flight Audit Log',
      tag: 'SHA-256 SEALED AUDIT',
      desc: 'Generates tamper-evident execution manifests with millisecond timestamps, confidence indices, and cryptographic hashes for post-flight science peer review.',
      accent: 'emerald'
    }
  ];

  return (
    <section className="py-16 bg-space-950 border-b border-space-border relative">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 bg-space-900 border border-space-border px-3 py-1 rounded text-xs font-mono text-cyan-300 mb-3">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>PRIMARY SYSTEM MODULES</span>
          </div>
          <h2 className="text-3xl font-display font-bold text-white">
            Core Technological Capabilities
          </h2>
          <p className="text-sm text-space-300 font-mono mt-2">
            Engineered specifically for microgravity space habitats, biological payloads, and deep-space missions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {capabilities.map((cap, idx) => {
            const Icon = cap.icon;
            return (
              <div 
                key={idx}
                className="p-5 rounded-lg border border-space-border bg-space-900/80 hover:border-cyan-500/50 transition duration-200 flex flex-col justify-between group tech-corner-decor"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded bg-space-950 border border-space-border text-cyan-400 group-hover:text-white group-hover:bg-cyan-500/20 transition">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono bg-space-950 text-space-400 px-2 py-0.5 rounded border border-space-border">
                      {cap.tag}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold font-display text-white mb-2 group-hover:text-cyan-300 transition">
                    {cap.title}
                  </h3>

                  <p className="text-xs text-space-300 leading-relaxed font-sans">
                    {cap.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-space-border/60 flex items-center justify-between text-[11px] font-mono text-space-400">
                  <span>MODULE {String(idx + 1).padStart(2, '0')}</span>
                  <span className="text-emerald-400">STATUS: VERIFIED</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
