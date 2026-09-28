import React from 'react';
import { useMissionStore } from '../../store/missionStore';
import { Cpu, HardDrive, Zap, CheckCircle2, ShieldCheck, Activity, BarChart2 } from 'lucide-react';
import { AerospaceBadge } from '../common/AerospaceBadge';

export const ModelMetricsCard: React.FC = () => {
  const { modelTelemetry } = useMissionStore();

  const models = [
    {
      key: 'humanDetector',
      name: 'Human Detector',
      engine: modelTelemetry.humanDetector.name,
      params: '3.16 M',
      memory: '12.4 MB (INT8 Quantized)',
      latency: `${modelTelemetry.humanDetector.latencyMs} ms`,
      throughput: '208 FPS',
      confidence: `${(modelTelemetry.humanDetector.confidence * 100).toFixed(1)}%`,
      status: modelTelemetry.humanDetector.status
    },
    {
      key: 'poseEstimator',
      name: '0-G Pose Estimator',
      engine: modelTelemetry.poseEstimator.name,
      params: '6.42 M',
      memory: '24.8 MB (FP16)',
      latency: `${modelTelemetry.poseEstimator.latencyMs} ms`,
      throughput: '161 FPS',
      confidence: '17/17 Joints (3D)',
      status: modelTelemetry.poseEstimator.status
    },
    {
      key: 'objectDetector',
      name: 'Space Payload ViT',
      engine: modelTelemetry.objectDetector.name,
      params: '8.80 M',
      memory: '34.2 MB (INT8)',
      latency: `${modelTelemetry.objectDetector.latencyMs} ms`,
      throughput: '196 FPS',
      confidence: `${modelTelemetry.objectDetector.detectedCount} Targets In Bay`,
      status: modelTelemetry.objectDetector.status
    },
    {
      key: 'hoiEngine',
      name: 'HOI Spatial GNN',
      engine: modelTelemetry.hoiEngine.name,
      params: '2.14 M',
      memory: '8.6 MB (INT8)',
      latency: `${modelTelemetry.hoiEngine.latencyMs} ms`,
      throughput: '256 FPS',
      confidence: 'G-Score: 96.4%',
      status: modelTelemetry.hoiEngine.status
    },
    {
      key: 'actionRecognizer',
      name: 'Action Transformer',
      engine: modelTelemetry.actionRecognizer.name,
      params: '14.2 M',
      memory: '56.0 MB (INT8)',
      latency: `${modelTelemetry.actionRecognizer.latencyMs} ms`,
      throughput: '119 FPS',
      confidence: `${(modelTelemetry.actionRecognizer.probability * 100).toFixed(1)}%`,
      status: modelTelemetry.actionRecognizer.status
    },
    {
      key: 'hmr3dModel',
      name: '3D Human Mesh Recovery',
      engine: modelTelemetry.hmr3dModel.name,
      params: '18.5 M',
      memory: '72.4 MB (FP16)',
      latency: `${modelTelemetry.hmr3dModel.latencyMs} ms`,
      throughput: '110 FPS',
      confidence: '6890 Mesh Vertices',
      status: modelTelemetry.hmr3dModel.status
    }
  ];

  return (
    <div className="p-5 rounded-lg border border-space-border bg-space-900/90 tech-corner-decor">
      <div className="flex items-center justify-between border-b border-space-border/80 pb-3 mb-4 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span className="text-white font-bold">EDGE MODEL BENCHMARKS & QUANTIZATION TELEMETRY</span>
        </div>
        <span className="text-space-400">TOTAL ON-BOARD FOOTPRINT: 208.4 MB</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
        {models.map((mod) => (
          <div key={mod.key} className="p-3.5 rounded bg-space-950 border border-space-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-cyan-300 font-bold">{mod.name}</span>
                <AerospaceBadge status="ONLINE" label="ACTIVE" size="sm" />
              </div>
              <div className="text-[11px] text-space-300 font-semibold truncate mb-2">{mod.engine}</div>

              <div className="space-y-1 text-[11px] text-space-400">
                <div className="flex justify-between">
                  <span>Parameters:</span>
                  <span className="text-white font-semibold">{mod.params}</span>
                </div>
                <div className="flex justify-between">
                  <span>Edge Memory:</span>
                  <span className="text-space-200">{mod.memory}</span>
                </div>
                <div className="flex justify-between">
                  <span>Inference Time:</span>
                  <span className="text-emerald-400 font-semibold">{mod.latency}</span>
                </div>
                <div className="flex justify-between">
                  <span>Throughput:</span>
                  <span className="text-sky-300">{mod.throughput}</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-space-border/60 flex items-center justify-between text-[11px]">
              <span className="text-space-500">Output Metric:</span>
              <span className="text-cyan-300 font-bold">{mod.confidence}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
