import React, { useState } from 'react';
import { 
  Camera, 
  Cpu, 
  User, 
  Layers, 
  Bot, 
  Database, 
  Radio, 
  CheckCircle2, 
  AlertTriangle, 
  Volume2, 
  ArrowRight, 
  ArrowDown, 
  Box, 
  Activity,
  HardDrive
} from 'lucide-react';
import { AerospaceBadge } from '../common/AerospaceBadge';

export const SystemArchitecture: React.FC = () => {
  const [selectedLayer, setSelectedLayer] = useState<'all' | 'edge' | 'perception' | 'sequence' | 'assistant' | 'uplink'>('all');

  return (
    <section className="py-16 bg-space-900 border-b border-space-border relative">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 rounded text-xs font-mono text-cyan-400 mb-3">
            <span>OFFLINE-FIRST END-TO-END ARCHITECTURE</span>
          </div>
          <h2 className="text-3xl font-display font-bold text-white">
            System Architecture & Data Flow Pipeline
          </h2>
          <p className="text-sm text-space-300 font-mono mt-2">
            Derived directly from SIH 2026 Problem Statement #26174 requirements. Autonomous edge computing without continuous Earth link dependency.
          </p>
        </div>

        {/* Interactive Architecture Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10 text-xs font-mono">
          {[
            { id: 'all', label: 'Full System View' },
            { id: 'edge', label: '1. Edge Hardware & Video Input' },
            { id: 'perception', label: '2. Multi-Modal AI Perception' },
            { id: 'sequence', label: '3. Sequence Validation Engine' },
            { id: 'assistant', label: '4. Voice Guidance & Alerts' },
            { id: 'uplink', label: '5. Local Blackbox & Earth Uplink' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedLayer(tab.id as any)}
              className={`px-3 py-1.5 rounded transition border ${
                selectedLayer === tab.id
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 font-semibold'
                  : 'bg-space-950 text-space-400 border-space-border hover:text-space-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Visual Pipeline Blocks */}
        <div className="space-y-6 max-w-5xl mx-auto">

          {/* Block 1: Input & Devices */}
          {(selectedLayer === 'all' || selectedLayer === 'edge') && (
            <div className="p-5 rounded-lg border border-space-border bg-space-950 tech-corner-decor">
              <div className="flex items-center justify-between border-b border-space-border/80 pb-3 mb-4">
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold">
                  <Camera className="w-4 h-4" />
                  <span>LAYER 01: ON-BOARD PAYLOAD CAMERAS & SENSORS</span>
                </div>
                <span className="text-[11px] font-mono text-space-500">MICROGRAVITY PAYLOAD RACK</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-3 rounded bg-space-900 border border-space-border">
                  <div className="text-white font-semibold flex items-center gap-1.5 mb-1">
                    <Camera className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Fixed-Payload Cameras</span>
                  </div>
                  <p className="text-space-400 text-[11px]">Primary wide RGB/Depth camera capturing astronaut & workspace at 30 FPS.</p>
                </div>

                <div className="p-3 rounded bg-space-900 border border-space-border">
                  <div className="text-white font-semibold flex items-center gap-1.5 mb-1">
                    <Box className="w-3.5 h-3.5 text-sky-400" />
                    <span>3D Payload Cameras</span>
                  </div>
                  <p className="text-space-400 text-[11px]">Multi-angle stereo cameras for orientation-agnostic 3D spatial recovery.</p>
                </div>

                <div className="p-3 rounded bg-space-900 border border-space-border">
                  <div className="text-white font-semibold flex items-center gap-1.5 mb-1">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Astronaut & Tools</span>
                  </div>
                  <p className="text-space-400 text-[11px]">Microgravity experimenter interacting with vials, pipettes, centrifuges.</p>
                </div>
              </div>
            </div>
          )}

          {/* Down Connector */}
          {(selectedLayer === 'all' || selectedLayer === 'perception') && (
            <div className="flex justify-center text-cyan-400">
              <ArrowDown className="w-5 h-5 animate-bounce" />
            </div>
          )}

          {/* Block 2: AI Perception Layer */}
          {(selectedLayer === 'all' || selectedLayer === 'perception') && (
            <div className="p-5 rounded-lg border border-cyan-500/40 bg-space-950 tech-corner-decor shadow-[0_0_15px_rgba(0,229,255,0.08)]">
              <div className="flex items-center justify-between border-b border-space-border/80 pb-3 mb-4">
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold">
                  <Cpu className="w-4 h-4" />
                  <span>LAYER 02: EDGE AI PERCEPTION UNIT (LOCAL INFERENCE)</span>
                </div>
                <AerospaceBadge status="ONLINE" label="NPU QUANT INT8" size="sm" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs font-mono">
                <div className="p-3 rounded bg-space-900 border border-space-border text-center">
                  <User className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                  <div className="font-semibold text-white">Human Recognition</div>
                  <div className="text-[10px] text-space-400 mt-1">YOLOv8n-Space (4.8ms)</div>
                </div>

                <div className="p-3 rounded bg-space-900 border border-space-border text-center">
                  <Activity className="w-4 h-4 text-sky-400 mx-auto mb-1" />
                  <div className="font-semibold text-white">Pose Estimation</div>
                  <div className="text-[10px] text-space-400 mt-1">17 Keypoints (0-G)</div>
                </div>

                <div className="p-3 rounded bg-space-900 border border-space-border text-center">
                  <Box className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                  <div className="font-semibold text-white">Object Detection</div>
                  <div className="text-[10px] text-space-400 mt-1">Vials, Tools, Lids</div>
                </div>

                <div className="p-3 rounded bg-space-900 border border-space-border text-center">
                  <Layers className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                  <div className="font-semibold text-white">Hand-Object (HOI)</div>
                  <div className="text-[10px] text-space-400 mt-1">G-Score Contact Matrix</div>
                </div>

                <div className="p-3 rounded bg-space-900 border border-space-border text-center col-span-2 sm:col-span-1">
                  <Bot className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
                  <div className="font-semibold text-white">3D HMR Kinematics</div>
                  <div className="text-[10px] text-space-400 mt-1">Mesh vs Payload Rack</div>
                </div>
              </div>
            </div>
          )}

          {/* Down Connector */}
          {(selectedLayer === 'all' || selectedLayer === 'sequence') && (
            <div className="flex justify-center text-cyan-400">
              <ArrowDown className="w-5 h-5 animate-bounce" />
            </div>
          )}

          {/* Block 3: Sequence Intelligence */}
          {(selectedLayer === 'all' || selectedLayer === 'sequence') && (
            <div className="p-5 rounded-lg border border-space-border bg-space-950 tech-corner-decor">
              <div className="flex items-center justify-between border-b border-space-border/80 pb-3 mb-4">
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>LAYER 03: EXPERIMENT SEQUENCE ENGINE & VALIDATION</span>
                </div>
                <span className="text-[11px] font-mono text-space-500">STATE MACHINE AUTOMATON</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 rounded bg-space-900 border border-space-border">
                  <span className="text-space-400 text-[10px] block">INPUT 1</span>
                  <span className="text-white font-semibold">Recognized Action</span>
                  <p className="text-space-400 text-[11px] mt-1">Classified temporal action stream.</p>
                </div>

                <div className="p-3 rounded bg-space-900 border border-space-border">
                  <span className="text-space-400 text-[10px] block">INPUT 2</span>
                  <span className="text-white font-semibold">Expected Protocol Step</span>
                  <p className="text-space-400 text-[11px] mt-1">Scientific SOP state sequence.</p>
                </div>

                <div className="p-3 rounded bg-space-900 border border-emerald-500/40 bg-emerald-950/20 col-span-2">
                  <span className="text-emerald-400 text-[10px] block font-bold">SEQUENCE VALIDATOR</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300">✓ Correct Step</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-900/60 text-amber-300">⚠ Skipped Step</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-900/60 text-rose-300">⚠ Out-of-Sequence</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-900/60 text-indigo-300">↻ Repeated Step</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Down Connector */}
          {(selectedLayer === 'all' || selectedLayer === 'assistant') && (
            <div className="flex justify-center text-cyan-400">
              <ArrowDown className="w-5 h-5 animate-bounce" />
            </div>
          )}

          {/* Block 4: Mission Assistant & Audio Alerts */}
          {(selectedLayer === 'all' || selectedLayer === 'assistant') && (
            <div className="p-5 rounded-lg border border-space-border bg-space-950 tech-corner-decor">
              <div className="flex items-center justify-between border-b border-space-border/80 pb-3 mb-4">
                <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold">
                  <Volume2 className="w-4 h-4" />
                  <span>LAYER 04: MISSION ASSISTANT & AVIONICS VOICE ALERTS</span>
                </div>
                <span className="text-[11px] font-mono text-space-500">ASTRONAUT CO-PILOT HUD</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3 rounded bg-space-900 border border-space-border">
                  <div className="text-cyan-300 font-semibold mb-1 flex items-center gap-1.5">
                    <Bot className="w-4 h-4" />
                    <span>Real-time Guidance Assistant</span>
                  </div>
                  <p className="text-space-300 text-[11px]">
                    Continuous observation & reasoning: tells astronaut exactly why a step is required and warns before hazardous errors occur.
                  </p>
                </div>

                <div className="p-3 rounded bg-space-900 border border-space-border">
                  <div className="text-amber-300 font-semibold mb-1 flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4" />
                    <span>Acoustic & Voice Alert Dispatcher</span>
                  </div>
                  <p className="text-space-300 text-[11px]">
                    Hands-free voice notifications (`INFO`, `WARNING`, `SEQUENCE ERROR`, `CRITICAL`) with avionics sound chimes.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Block 5: Storage & Ground Station Link */}
          {(selectedLayer === 'all' || selectedLayer === 'uplink') && (
            <div className="p-5 rounded-lg border border-space-border bg-space-950 tech-corner-decor">
              <div className="flex items-center justify-between border-b border-space-border/80 pb-3 mb-4">
                <div className="flex items-center gap-2 text-xs font-mono text-sky-400 font-bold">
                  <Radio className="w-4 h-4" />
                  <span>LAYER 05: LOCAL BLACKBOX STORAGE & GROUND CONTROL UPLINK</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 font-bold">~85-95% BANDWIDTH SAVINGS</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 rounded bg-space-900 border border-space-border">
                  <div className="text-white font-semibold flex items-center gap-1.5 mb-1">
                    <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Local SSD Storage</span>
                  </div>
                  <p className="text-space-400 text-[11px]">High-res raw video saved locally on spacecraft edge storage without consuming satellite comms.</p>
                </div>

                <div className="p-3 rounded bg-space-900 border border-space-border">
                  <div className="text-white font-semibold flex items-center gap-1.5 mb-1">
                    <Radio className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Lightweight Uplink (2.4 kbps)</span>
                  </div>
                  <p className="text-space-400 text-[11px]">Only structured JSON telemetry, validated steps, and anomalies transmitted to Earth.</p>
                </div>

                <div className="p-3 rounded bg-space-900 border border-space-border">
                  <div className="text-white font-semibold flex items-center gap-1.5 mb-1">
                    <Database className="w-3.5 h-3.5 text-amber-400" />
                    <span>Ground Station Station Pass</span>
                  </div>
                  <p className="text-space-400 text-[11px]">Selective on-demand IP video burst transmission during high-bandwidth orbital windows.</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
};
