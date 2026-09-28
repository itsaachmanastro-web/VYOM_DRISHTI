import React, { useState } from 'react';
import { useMissionStore } from '../../store/missionStore';
import { 
  Database, 
  Play, 
  Square, 
  Download, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Compass, 
  Activity, 
  Eye, 
  RefreshCw,
  FileCode,
  Table,
  Sliders,
  ShieldCheck
} from 'lucide-react';
import { DatasetSequence, MultimodalDatasetSample } from '../../types/mission';

export const DatasetManagerView: React.FC = () => {
  const { 
    datasets, 
    activeDatasetCategory, 
    activeSequenceIndex, 
    isDatasetReplaying, 
    replayProgress,
    setActiveDatasetCategory, 
    setActiveSequenceIndex, 
    generateFreshDatasets, 
    startDatasetReplay, 
    stopDatasetReplay, 
    exportActiveDataset 
  } = useMissionStore();

  const [selectedFrameIndex, setSelectedFrameIndex] = useState<number>(0);
  const [generatorNoise, setGeneratorNoise] = useState<number>(0.015);
  const [generatorFps, setGeneratorFps] = useState<number>(30);
  const [generatorOrientation, setGeneratorOrientation] = useState<'NORMAL_UPRIGHT' | 'INVERTED_PITCH' | 'LATERAL_ROLL'>('NORMAL_UPRIGHT');

  const currentManifest = activeDatasetCategory === 'A' 
    ? datasets.datasetA 
    : activeDatasetCategory === 'B' 
    ? datasets.datasetB 
    : datasets.datasetC;

  const currentSequence: DatasetSequence | undefined = currentManifest.sequences[activeSequenceIndex] || currentManifest.sequences[0];
  const currentSample: MultimodalDatasetSample | undefined = currentSequence?.samples[selectedFrameIndex] || currentSequence?.samples[0];

  const totalFramesAll = datasets.datasetA.totalFrames + datasets.datasetB.totalFrames + datasets.datasetC.totalFrames;
  const totalSequencesAll = datasets.datasetA.totalSequences + datasets.datasetB.totalSequences + datasets.datasetC.totalSequences;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto select-none">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-cyan-400 border border-blue-500/20">
              MULTIMODAL DATASET ENGINE
            </span>
            <span className="text-xs text-slate-500">BAS Experiment Ground Truth Repository</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Space Activity Recognition & Sequence Dataset
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Synthetic multimodal dataset generator (Datasets A, B, C) with 17-keypoint pose skeletons, 3D HOI vectors, and machine-readable JSON/JSONL/CSV exports.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => generateFreshDatasets()}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 transition border border-slate-200 dark:border-slate-700 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
            <span>Regenerate Datasets</span>
          </button>

          <div className="flex items-center gap-1 bg-blue-600 rounded-xl p-1 shadow-md shadow-blue-500/20">
            <button
              onClick={() => exportActiveDataset('JSON')}
              className="px-2.5 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-1.5 transition"
              title="Export Full Structured JSON"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>
            <button
              onClick={() => exportActiveDataset('JSONL')}
              className="px-2.5 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-1.5 transition"
              title="Export Machine Learning Line-by-Line JSONL"
            >
              <Database className="w-3.5 h-3.5" />
              <span>JSONL</span>
            </button>
            <button
              onClick={() => exportActiveDataset('CSV')}
              className="px-2.5 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-1.5 transition"
              title="Export Tabular CSV"
            >
              <Table className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dataset Statistics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Datasets</span>
            <Database className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">3 Classes</div>
          <div className="text-[11px] text-slate-500 mt-1">A (Success), B (Failure), C (Anomalous)</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sequences Generated</span>
            <Layers className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{totalSequencesAll} Runs</div>
          <div className="text-[11px] text-slate-500 mt-1">Varied speed, noise & angles</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Annotated Frames</span>
            <Activity className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{totalFramesAll} Frames</div>
          <div className="text-[11px] text-slate-500 mt-1">@ 30 FPS with 17 Keypoints</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Protocol Target</span>
            <ShieldCheck className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">BAS-SCI-01</div>
          <div className="text-[11px] text-slate-500 mt-1">Sample Cartridge Installation (5 Steps)</div>
        </div>
      </div>

      {/* Category Tabs: Dataset A vs B vs C */}
      <div className="flex items-center gap-3 p-1.5 rounded-2xl bg-slate-200/70 dark:bg-slate-900/80 border border-slate-300/60 dark:border-slate-800">
        <button
          onClick={() => setActiveDatasetCategory('A')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2.5 ${
            activeDatasetCategory === 'A'
              ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-500/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Dataset A: Verified Success Sequences (1→2→3→4→5)</span>
        </button>

        <button
          onClick={() => setActiveDatasetCategory('B')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2.5 ${
            activeDatasetCategory === 'B'
              ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm border border-amber-500/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Dataset B: Procedural Deviations (Out-of-Sequence & Skipped)</span>
        </button>

        <button
          onClick={() => setActiveDatasetCategory('C')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2.5 ${
            activeDatasetCategory === 'C'
              ? 'bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 shadow-sm border border-red-500/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <XCircle className="w-4 h-4" />
          <span>Dataset C: Anomalous Actions & Kinematic Instability</span>
        </button>
      </div>

      {/* Main Content Grid: Sequences List + Frame Inspector + Replay Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Sequence Cards List (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span>Sequences in {currentManifest.name}</span>
            <span className="text-[10px] text-slate-400">{currentManifest.sequences.length} Sequences</span>
          </div>

          <div className="space-y-3">
            {currentManifest.sequences.map((seq, idx) => {
              const isSelected = activeSequenceIndex === idx;
              return (
                <div
                  key={seq.sequenceId}
                  onClick={() => {
                    setActiveSequenceIndex(idx);
                    setSelectedFrameIndex(0);
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white dark:bg-slate-900 border-blue-500 shadow-md ring-1 ring-blue-500/20'
                      : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-blue-600 dark:text-cyan-400">
                      {seq.sequenceId}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      seq.type === 'SUCCESS'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : seq.type === 'OUT_OF_SEQUENCE'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        : seq.type === 'SKIPPED_STEP'
                        ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30'
                        : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30'
                    }`}>
                      {seq.type.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">
                    {seq.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-500">
                    <div>
                      <span className="block text-slate-400">Frames</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{seq.totalFrames}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400">FPS</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{seq.fps}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400">Orientation</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{seq.metadata.astronautOrientation}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Synthetic Generator Tweaks Card */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              <Sliders className="w-3.5 h-3.5 text-blue-500" />
              <span>Synthetic Generator Parameters</span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Astronaut Orientation</label>
                <select
                  value={generatorOrientation}
                  onChange={(e) => setGeneratorOrientation(e.target.value as any)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 text-xs"
                >
                  <option value="NORMAL_UPRIGHT">Normal Upright (Zero-G Neutral)</option>
                  <option value="INVERTED_PITCH">Inverted Pitch (-180° Inverted)</option>
                  <option value="LATERAL_ROLL">Lateral Roll (+90° Sideways)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                  <span>Sensor Noise Ratio</span>
                  <span className="font-mono">{(generatorNoise * 100).toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="0.005"
                  max="0.05"
                  step="0.005"
                  value={generatorNoise}
                  onChange={(e) => setGeneratorNoise(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Frame Inspector & Replay Console (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Replay Console Header */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-mono font-bold text-blue-600 dark:text-cyan-400">
                  {currentSequence?.sequenceId}
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {currentSequence?.description}
                </h3>
              </div>

              {/* Replay Controls */}
              <div className="flex items-center gap-2">
                {isDatasetReplaying ? (
                  <button
                    onClick={() => stopDatasetReplay()}
                    className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-red-500/20"
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>Stop Replay</span>
                  </button>
                ) : (
                  <button
                    onClick={() => startDatasetReplay(currentSequence)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-emerald-500/20"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Play Live Replay</span>
                  </button>
                )}
              </div>
            </div>

            {/* Replay Progress Bar */}
            {isDatasetReplaying && (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Replay Telemetry Progress</span>
                  <span className="font-mono font-bold text-emerald-500">{replayProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-100"
                    style={{ width: `${replayProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Frame Slider */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-500">Frame Scrubber: <strong className="text-slate-900 dark:text-white font-mono">#{selectedFrameIndex} / {(currentSequence?.samples.length || 1) - 1}</strong></span>
                <span className="text-slate-400 font-mono text-[11px]">T+{(currentSample?.timestampMs || 0) / 1000}s</span>
              </div>
              <input
                type="range"
                min="0"
                max={(currentSequence?.samples.length || 1) - 1}
                value={selectedFrameIndex}
                onChange={(e) => setSelectedFrameIndex(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>

          {/* Multimodal Frame Inspector Card */}
          {currentSample && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Joint Kinematics & Posture */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-blue-500" />
                    <span>Joint Angles & Pose Keypoints</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-cyan-400">
                    17 Keypoints Locked
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Right Elbow</span>
                    <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">{currentSample.jointAngles.rightElbow}°</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Left Elbow</span>
                    <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">{currentSample.jointAngles.leftElbow}°</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Right Shoulder</span>
                    <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">{currentSample.jointAngles.rightShoulder}°</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Right Knee</span>
                    <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">{currentSample.jointAngles.rightKnee}°</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 space-y-1 pt-1">
                  <div><strong>Astronaut Bounding Box:</strong> X={currentSample.astronautBoundingBox.x.toFixed(2)}, Y={currentSample.astronautBoundingBox.y.toFixed(2)}, W={currentSample.astronautBoundingBox.width.toFixed(2)}, H={currentSample.astronautBoundingBox.height.toFixed(2)}</div>
                  <div><strong>Confidence Score:</strong> {(currentSample.astronautBoundingBox.confidence * 100).toFixed(1)}%</div>
                </div>
              </div>

              {/* HOI & Action Classification */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Compass className="w-3.5 h-3.5 text-cyan-500" />
                    <span>HOI Vector & Classification</span>
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    currentSample.isStandardCompliant
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-red-500/10 text-red-600 dark:text-red-400'
                  }`}>
                    {currentSample.isStandardCompliant ? 'COMPLIANT' : 'DEVIATION'}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Action Ground Truth</span>
                    <div className="font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                      {currentSample.actionLabel}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Probability: {(currentSample.actionConfidence * 100).toFixed(1)}%
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">HOI Interaction Object</span>
                    <div className="font-bold text-cyan-600 dark:text-cyan-400 font-mono mt-0.5">
                      {currentSample.hoiVector.targetObject}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                      <span>Contact Active: <strong>{currentSample.hoiVector.active ? 'YES' : 'NO'}</strong></span>
                      <span>3D Distance: <strong>{currentSample.hoiVector.distance3dMeters}m</strong></span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Raw JSON Schema Preview */}
          <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 border border-slate-800 space-y-2 font-mono text-[11px]">
            <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
              <span>Machine-Readable Sample Payload Preview (Frame #{selectedFrameIndex})</span>
              <span className="text-[10px] text-cyan-400">application/json</span>
            </div>
            <pre className="max-h-48 overflow-y-auto p-2 bg-slate-950 rounded-xl text-slate-300">
              {JSON.stringify(currentSample, null, 2)}
            </pre>
          </div>

        </div>

      </div>

    </div>
  );
};
