import React, { useState } from 'react';
import { 
  Activity, 
  User, 
  Box, 
  Layers, 
  Sparkles, 
  ShieldCheck, 
  Cpu, 
  TrendingUp,
  Crosshair
} from 'lucide-react';

export const LandingPerceptionConsole: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pose' | 'hoi' | 'drift'>('pose');

  return (
    <section className="relative py-20 px-4 sm:px-8 max-w-[1700px] mx-auto z-10 select-none">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono backdrop-blur-md">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>MULTI-MODAL TENSOR ENGINE</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
          Unified Multi-Modal Vision Perception
        </h2>

        <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
          Simultaneously tracking human kinematics, payload instruments, and physical contact vectors to eliminate false step verifications.
        </p>
      </div>

      {/* Main Console Box */}
      <div className="rounded-3xl bg-[#070D1F]/80 backdrop-blur-2xl border border-cyan-500/40 p-6 lg:p-8 shadow-[0_0_50px_rgba(0,229,255,0.12)]">
        
        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-2 bg-slate-900/90 p-1 rounded-2xl border border-slate-700">
            <button
              onClick={() => setActiveTab('pose')}
              className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 ${
                activeTab === 'pose'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>17-Keypoint Pose</span>
            </button>

            <button
              onClick={() => setActiveTab('hoi')}
              className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 ${
                activeTab === 'hoi'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Hand-Object (HOI)</span>
            </button>

            <button
              onClick={() => setActiveTab('drift')}
              className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 ${
                activeTab === 'drift'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>0-G Spatial Drift</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-400 font-bold">EDGE NPU ACTIVE</span>
            <span>•</span>
            <span>30.0 FPS / 18.4ms</span>
          </div>
        </div>

        {/* Console Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-6">
          
          {/* Visual Display Screen */}
          <div className="lg:col-span-7 rounded-2xl bg-[#040814] border border-slate-800 p-6 min-h-[300px] flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="text-cyan-400 font-bold">DETECTION VIEWPORT: RACK-CAM-01</span>
              <span>FOV: 110° • 1080p WebGL</span>
            </div>

            {/* Interactive Wireframe / Graphics based on tab */}
            {activeTab === 'pose' && (
              <div className="my-auto py-4 flex flex-col items-center justify-center space-y-3">
                <div className="relative w-48 h-32 flex items-center justify-center">
                  <svg viewBox="0 0 200 120" className="w-full h-full text-cyan-400 stroke-current" fill="none" strokeWidth="2">
                    <circle cx="100" cy="20" r="8" fill="#00E5FF" fillOpacity="0.2" />
                    <line x1="100" y1="28" x2="100" y2="70" />
                    <line x1="75" y1="40" x2="125" y2="40" />
                    <line x1="75" y1="40" x2="60" y2="65" />
                    <line x1="60" y1="65" x2="65" y2="95" />
                    <line x1="125" y1="40" x2="145" y2="55" />
                    <line x1="145" y1="55" x2="160" y2="35" stroke="#10B981" strokeWidth="2.5" />
                    <circle cx="160" cy="35" r="4" fill="#10B981" />
                  </svg>
                </div>
                <div className="text-xs font-mono text-emerald-400 font-bold text-center">
                  RIGHT HAND ELEVATION VERIFIED • CONFIDENCE: 98.4%
                </div>
              </div>
            )}

            {activeTab === 'hoi' && (
              <div className="my-auto py-4 flex flex-col items-center justify-center space-y-3">
                <div className="flex items-center gap-6">
                  <div className="p-4 rounded-xl border border-cyan-400/80 bg-cyan-500/10 text-center text-xs font-mono">
                    <div className="text-cyan-300 font-bold">Astronaut Hand</div>
                    <div className="text-[10px] text-slate-400 mt-1">Coords [X: 42, Y: 18]</div>
                  </div>

                  <div className="w-16 h-0.5 bg-dashed bg-emerald-400 relative">
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-mono text-emerald-400 font-bold">CONTACT</span>
                  </div>

                  <div className="p-4 rounded-xl border border-emerald-400/80 bg-emerald-500/10 text-center text-xs font-mono">
                    <div className="text-emerald-300 font-bold">Cell Cassette A2</div>
                    <div className="text-[10px] text-slate-400 mt-1">Thermal Lock Closed</div>
                  </div>
                </div>
                <div className="text-xs font-mono text-cyan-300 font-bold text-center">
                  HOI RELATION: ASPIRATION & EXTRACTION ACTIVE
                </div>
              </div>
            )}

            {activeTab === 'drift' && (
              <div className="my-auto py-4 flex flex-col items-center justify-center space-y-3 font-mono text-xs">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-slate-400 text-[10px]">PITCH</div>
                    <div className="text-white font-bold text-base mt-1">-12.4°</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-slate-400 text-[10px]">ROLL</div>
                    <div className="text-white font-bold text-base mt-1">+6.2°</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-slate-400 text-[10px]">YAW</div>
                    <div className="text-white font-bold text-base mt-1">+34.8°</div>
                  </div>
                </div>
                <div className="text-xs font-mono text-emerald-400 font-bold text-center">
                  DISTANCE TO GLOVEBOX: 46.8 CM (NOMINAL SOP ENVELOPE)
                </div>
              </div>
            )}

            <div className="text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-900 flex justify-between">
              <span>BUFFER: 15-FRAME SLIDING WINDOW</span>
              <span>VERIFIED: 1.5s HOLD CRITERIA</span>
            </div>
          </div>

          {/* Right Metrics & Logic Breakdown */}
          <div className="lg:col-span-5 space-y-4 font-sans text-xs">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">
                Orientation-Agnostic Biomechanical Kinematics
              </h3>
              <p className="text-slate-300 leading-relaxed">
                Traditional pose detection fails when astronauts float inverted or sideways. VYOM DRISHTI uses relative joint angle transformations calibrated to the spacecraft coordinate frame.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <div className="p-3 rounded-2xl bg-[#040814]/80 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300 font-medium">Kinematic Pose Tracking</span>
                <span className="text-cyan-400 font-mono font-bold">17 Keypoints (30 FPS)</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#040814]/80 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300 font-medium">Tool Interaction Proximity</span>
                <span className="text-emerald-400 font-mono font-bold">&lt; 3.5 cm Intersection</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#040814]/80 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300 font-medium">Temporal Stabilization Hold</span>
                <span className="text-blue-400 font-mono font-bold">1.5s Continuous Lock</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </section>
  );
};
