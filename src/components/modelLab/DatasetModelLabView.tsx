import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useMissionStore } from '../../store/missionStore';
import { 
  Database, 
  Sparkles, 
  Layers, 
  Play, 
  BarChart3, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  RefreshCw, 
  UploadCloud, 
  Table, 
  Cpu, 
  Sliders, 
  RotateCcw, 
  Award, 
  Activity, 
  Zap, 
  Lock, 
  Eye, 
  Download, 
  Printer, 
  Info, 
  ArrowRight,
  TrendingUp,
  AlertCircle,
  FileCode,
  FileCheck2,
  ChevronDown,
  ChevronRight,
  Crosshair,
  List,
  Check,
  ArrowLeft
} from 'lucide-react';
import { 
  DatasetOverview, 
  DataQualityReport, 
  EDASummary, 
  PreprocessingPlan, 
  ModelTrainingConfig, 
  ModelComparisonRow, 
  ModelEvaluationMetrics, 
  ModelRegistryItem, 
  DataDriftReport, 
  TrainingStageProgress,
  ModelAlgorithm 
} from '../../types/modelLab';
import { mlEngineService } from '../../services/mlEngineService';
import { 
  ALL_SAMPLE_DATASETS, 
  SAMPLE_DATASET_KINEMATICS, 
  SAMPLE_DATASET_CRYSTALLIZATION, 
  SAMPLE_DATASET_SAFETY 
} from '../../data/sampleDatasets';

export const DatasetModelLabView: React.FC = () => {
  const { addNotification, addLogEvent } = useMissionStore();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'DATASET' | 'EDA' | 'PREPROCESSING' | 'TRAIN' | 'PERFORMANCE' | 'REGISTRY' | 'REPORT'>('DATASET');
  
  // Mode: Standard (No-Code for Scientists) vs Expert (ML Engineers)
  const [trainingMode, setTrainingMode] = useState<'STANDARD' | 'EXPERT'>('STANDARD');

  // Active Dataset State
  const [currentDataset, setCurrentDataset] = useState<DatasetOverview>(() => {
    return mlEngineService.parseCSV(SAMPLE_DATASET_KINEMATICS.csvContent, SAMPLE_DATASET_KINEMATICS.filename);
  });

  // Selected Target Column
  const [targetColumn, setTargetColumn] = useState<string>(() => {
    return currentDataset.targetColumn || 'Activity_Class';
  });

  // Selected Feature for Distribution Histogram
  const [selectedDistFeature, setSelectedDistFeature] = useState<string>('Right_Shoulder_Angle');

  // Hidden File Input Ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Training Progress & Results
  const [trainingProgress, setTrainingProgress] = useState<TrainingStageProgress>({
    stage: 'IDLE',
    progressPercent: 0,
    currentMessage: 'Standing by for training initiation...'
  });

  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [bestModel, setBestModel] = useState<ModelComparisonRow | null>(null);
  const [comparisonRows, setComparisonRows] = useState<ModelComparisonRow[]>([]);
  const [detailedMetrics, setDetailedMetrics] = useState<Record<string, ModelEvaluationMetrics>>({});
  const [selectedModelKey, setSelectedModelKey] = useState<ModelAlgorithm>('RANDOM_FOREST');

  // Expert Mode Config State
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<ModelAlgorithm[]>([
    'LOGISTIC_REGRESSION',
    'DECISION_TREE',
    'RANDOM_FOREST',
    'GRADIENT_BOOSTING'
  ]);
  const [cvFolds, setCvFolds] = useState<number>(5);
  const [autoFeatureEng, setAutoFeatureEng] = useState<boolean>(true);
  const [imbalanceStrategy, setImbalanceStrategy] = useState<'CLASS_WEIGHTS' | 'RANDOM_OVERSAMPLING' | 'NONE'>('CLASS_WEIGHTS');

  // Model Registry State
  const [activeModelVersion, setActiveModelVersion] = useState<string>('v1.0-BASE-INT8');
  const [modelRegistry, setModelRegistry] = useState<ModelRegistryItem[]>([
    {
      version: 'v1.0-BASE-INT8',
      status: 'ACTIVE',
      createdAt: '2026-08-20 14:30 UTC',
      algorithm: 'Random Forest Ensemble',
      datasetName: 'BAS_Astronaut_Kinematics_v1.0.csv',
      datasetVersion: 'v1.0',
      f1Score: 0.939,
      accuracy: 0.948,
      precision: 0.939,
      recall: 0.941,
      rocAuc: 0.962,
      featureCount: 11,
      sampleCount: 38,
      author: 'Dr. S. Sharma (Principal Scientist)',
      description: 'Initial edge quantized baseline model for on-board activity recognition.'
    }
  ]);

  // Recompute Quality & EDA on dataset change
  const qualityReport: DataQualityReport = useMemo(() => {
    return mlEngineService.computeDataQuality(currentDataset);
  }, [currentDataset]);

  const edaSummary: EDASummary = useMemo(() => {
    return mlEngineService.generateEDA(currentDataset);
  }, [currentDataset]);

  const preprocessingPlan: PreprocessingPlan = useMemo(() => {
    return mlEngineService.buildPreprocessingPlan(currentDataset, targetColumn, autoFeatureEng);
  }, [currentDataset, targetColumn, autoFeatureEng]);

  const dataDriftReport: DataDriftReport = useMemo(() => {
    const baseline = mlEngineService.parseCSV(SAMPLE_DATASET_KINEMATICS.csvContent, 'Baseline_Kinematics_v1.0.csv');
    return mlEngineService.computeDataDrift(baseline, currentDataset);
  }, [currentDataset]);

  // Initial training execution on load so Performance tab is immediately populated with real metrics
  useEffect(() => {
    handleRunTraining(false);
  }, []);

  // Update default distribution feature if dataset changes
  useEffect(() => {
    if (currentDataset.columns.length > 0) {
      const numCol = currentDataset.columns.find(c => c.name !== targetColumn);
      if (numCol) setSelectedDistFeature(numCol.name);
    }
  }, [currentDataset, targetColumn]);

  // Handle file drop/upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const parsed = mlEngineService.parseCSV(text, file.name);
        setCurrentDataset(parsed);
        if (parsed.targetColumn) {
          setTargetColumn(parsed.targetColumn);
        }
        addNotification({
          title: 'Research Dataset Loaded',
          message: `Successfully loaded "${file.name}" with ${parsed.rowCount} samples and ${parsed.columnCount} features.`,
          type: 'SUCCESS',
          sourceModule: 'DATASET_LAB'
        });
      } catch (err: any) {
        addNotification({
          title: 'Dataset Parsing Error',
          message: err.message || 'Unable to parse CSV file format.',
          type: 'ERROR',
          sourceModule: 'DATASET_LAB'
        });
      }
    };
    reader.readAsText(file);
  };

  // Load sample dataset
  const handleLoadSampleDataset = (sample: typeof ALL_SAMPLE_DATASETS[0]) => {
    try {
      const parsed = mlEngineService.parseCSV(sample.csvContent, sample.filename);
      setCurrentDataset(parsed);
      setTargetColumn(sample.targetColumn);
      addNotification({
        title: 'Sample Dataset Activated',
        message: `Loaded ${sample.name} for No-Code ML experimentation.`,
        type: 'INFO',
        sourceModule: 'DATASET_LAB'
      });
    } catch (e: any) {
      console.warn(e);
    }
  };

  // Run Real ML Training Pipeline
  const handleRunTraining = async (showNotifications: boolean = true) => {
    setIsTraining(true);
    const config: ModelTrainingConfig = {
      mode: trainingMode,
      targetColumn,
      selectedFeatures: currentDataset.columns.filter(c => c.name !== targetColumn).map(c => c.name),
      selectedAlgorithms: trainingMode === 'STANDARD' ? ['LOGISTIC_REGRESSION', 'DECISION_TREE', 'RANDOM_FOREST', 'GRADIENT_BOOSTING'] : selectedAlgorithms,
      autoFeatureEngineering: autoFeatureEng,
      handleClassImbalance: true,
      imbalanceStrategy,
      crossValidationFolds: cvFolds
    };

    try {
      const result = await mlEngineService.trainAndEvaluateModels(currentDataset, config, (prog) => {
        setTrainingProgress(prog);
      });

      setBestModel(result.bestModel);
      setComparisonRows(result.comparisonTable);
      setDetailedMetrics(result.detailedMetrics);
      setSelectedModelKey(result.bestModel.algorithmKey);
      setIsTraining(false);

      // Add to Model Registry as Candidate
      const newCandidateVersion = `v1.${modelRegistry.length}-CANDIDATE`;
      const registryItem: ModelRegistryItem = {
        version: newCandidateVersion,
        status: 'CANDIDATE',
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
        algorithm: result.bestModel.algorithmName,
        datasetName: currentDataset.name,
        datasetVersion: `v1.${modelRegistry.length}`,
        f1Score: result.bestModel.f1Score,
        accuracy: result.bestModel.accuracy,
        precision: result.bestModel.precision,
        recall: result.bestModel.recall,
        rocAuc: result.bestModel.rocAuc,
        featureCount: currentDataset.columns.length - 1 + (autoFeatureEng ? 2 : 0),
        sampleCount: currentDataset.rowCount,
        author: 'Mission Scientist (Automated Edge Lab)',
        description: `Candidate model trained via ${trainingMode} Mode on ${currentDataset.name}.`
      };

      setModelRegistry(prev => {
        if (prev.some(m => m.version === newCandidateVersion)) return prev;
        return [registryItem, ...prev];
      });

      if (showNotifications) {
        addNotification({
          title: 'Model Training Complete',
          message: `Best model "${result.bestModel.algorithmName}" achieved F1: ${(result.bestModel.f1Score * 100).toFixed(1)}% and Accuracy: ${(result.bestModel.accuracy * 100).toFixed(1)}%.`,
          type: 'SUCCESS',
          sourceModule: 'MODEL_LAB'
        });

        addLogEvent({
          event: `Retrained Candidate Model [${result.bestModel.algorithmName}]: F1 ${(result.bestModel.f1Score * 100).toFixed(1)}%, Accuracy ${(result.bestModel.accuracy * 100).toFixed(1)}%`,
          category: 'AI_PERCEPTION',
          severity: 'INFO',
          confidence: result.bestModel.f1Score,
          source: 'ML_TRAINER'
        });

        // Switch to Performance tab to review results
        setActiveTab('PERFORMANCE');
      }
    } catch (err: any) {
      setIsTraining(false);
      setTrainingProgress({
        stage: 'ERROR',
        progressPercent: 0,
        currentMessage: 'Training failed.',
        error: err.message || 'Unknown ML training error.'
      });
    }
  };

  // Activate Candidate Model in Registry
  const handleActivateModel = (candidateVersion: string) => {
    setModelRegistry(prev => prev.map(m => {
      if (m.version === candidateVersion) return { ...m, status: 'ACTIVE' };
      if (m.status === 'ACTIVE') return { ...m, status: 'ARCHIVED' };
      return m;
    }));
    setActiveModelVersion(candidateVersion);

    addNotification({
      title: 'Model Activated for On-Board Inference',
      message: `Model ${candidateVersion} is now the active production classifier on BAS edge hardware.`,
      type: 'SECURITY',
      sourceModule: 'MODEL_REGISTRY'
    });
  };

  // Compute Histogram Distribution for Selected Feature
  const histogramData = useMemo(() => {
    const rawValues = currentDataset.rawPreview
      .map(r => Number(r[selectedDistFeature]))
      .filter(v => !isNaN(v) && v !== null);

    if (rawValues.length === 0) {
      return [
        { bin: '-1.0', count: 0 },
        { bin: '-0.8', count: 1 },
        { bin: '-0.5', count: 2 },
        { bin: '-0.2', count: 5 },
        { bin: '0.0', count: 12 },
        { bin: '0.2', count: 8 },
        { bin: '0.5', count: 6 },
        { bin: '0.8', count: 3 },
        { bin: '1.0', count: 1 }
      ];
    }

    const min = Math.min(...rawValues);
    const max = Math.max(...rawValues);
    const binCount = 14;
    const step = (max - min) / binCount || 1;

    const bins = Array.from({ length: binCount }, (_, i) => {
      const lower = min + i * step;
      const upper = lower + step;
      const count = rawValues.filter(v => v >= lower && (i === binCount - 1 ? v <= upper : v < upper)).length;
      return {
        bin: lower.toFixed(1),
        count
      };
    });

    return bins;
  }, [currentDataset, selectedDistFeature]);

  const maxBinCount = Math.max(...histogramData.map(b => b.count), 1);

  // Stepper Items
  const workflowSteps = [
    { id: 'DATASET', num: 1, label: 'Dataset Upload & Preview' },
    { id: 'EDA', num: 2, label: 'Automated EDA & Quality' },
    { id: 'PREPROCESSING', num: 3, label: 'Preprocessing Pipeline' },
    { id: 'TRAIN', num: 4, label: 'Model Training' },
    { id: 'PERFORMANCE', num: 5, label: 'Metrics & Explainability' },
    { id: 'REGISTRY', num: 6, label: 'Model Registry & Deploy' },
  ] as const;

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1600px] mx-auto select-none font-sans text-slate-800 dark:text-slate-100">
      
      {/* 1. Breadcrumb Sub-Header */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <button 
          onClick={() => setActiveTab('DATASET')} 
          className="hover:text-blue-600 dark:hover:text-cyan-400 flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dataset & Model Lab</span>
        </button>
      </div>

      {/* 2. Page Header Title & Action Buttons Matching Reference */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Dataset & AI Model Training Laboratory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-4xl leading-relaxed">
            Upload newly collected flight experiment telemetry, run automated statistical EDA, execute leakage-free preprocessing, train and evaluate candidate edge models, and safely activate calibrated weights on BAS hardware.
          </p>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Mode Dropdown */}
          <div className="relative">
            <select
              value={trainingMode}
              onChange={(e) => setTrainingMode(e.target.value as any)}
              className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-slate-800 rounded-lg pl-3 pr-8 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer shadow-xs"
            >
              <option value="STANDARD">Standard Mode</option>
              <option value="EXPERT">Expert Mode (ML Eng)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Train Models Button */}
          <button
            onClick={() => handleRunTraining(true)}
            disabled={isTraining}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition disabled:opacity-50"
          >
            <span>{isTraining ? 'Training Models...' : 'Train Models'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Four Summary KPI Metric Cards Matching Reference */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Card 1: Active Dataset */}
        <div 
          onClick={() => setActiveTab('DATASET')}
          className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-3.5 shadow-xs hover:border-blue-400 transition cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-cyan-400 shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Active Dataset
              </div>
              <div className="font-bold text-xs text-slate-900 dark:text-white truncate font-mono mt-0.5">
                {currentDataset.name}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {currentDataset.rowCount} rows · {currentDataset.columnCount} features
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition shrink-0" />
        </div>

        {/* Card 2: Data Quality */}
        <div 
          onClick={() => setActiveTab('EDA')}
          className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-3.5 shadow-xs hover:border-emerald-400 transition cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Data Quality
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="font-bold text-sm text-slate-900 dark:text-white font-mono">
                  {qualityReport.overallScore} / 100
                </span>
                <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {qualityReport.rating || 'Excellent'}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {qualityReport.items.filter(i => i.status === 'EXCELLENT').length}/5 checks passed
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition shrink-0" />
        </div>

        {/* Card 3: Target Variable */}
        <div 
          onClick={() => setActiveTab('PREPROCESSING')}
          className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-3.5 shadow-xs hover:border-purple-400 transition cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
              <Crosshair className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Target Variable
              </div>
              <div className="font-bold text-xs text-slate-900 dark:text-white truncate font-mono mt-0.5">
                {targetColumn}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Multi-Class Classification
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition shrink-0" />
        </div>

        {/* Card 4: Active Model */}
        <div 
          onClick={() => setActiveTab('REGISTRY')}
          className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-3.5 shadow-xs hover:border-amber-400 transition cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Active Model
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-bold text-xs text-slate-900 dark:text-white font-mono truncate">
                  {activeModelVersion}
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 shrink-0">
                  <span className="w-1 h-1 rounded-full bg-emerald-500" />
                  Active
                </span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                F1 Score: {bestModel ? (bestModel.f1Score * 100).toFixed(1) + '%' : '93.9%'}
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition shrink-0" />
        </div>

      </div>

      {/* 4. Horizontal ML Workflow Stepper Matching Reference */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs font-medium">
        {workflowSteps.map((step, idx) => {
          const isActive = activeTab === step.id;
          const isPast = workflowSteps.findIndex(s => s.id === activeTab) > idx;

          return (
            <React.Fragment key={step.id}>
              <button
                onClick={() => setActiveTab(step.id as any)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : isPast
                    ? 'bg-slate-100 dark:bg-slate-800/80 text-blue-600 dark:text-cyan-400 font-semibold'
                    : 'bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isActive 
                    ? 'bg-white text-blue-600' 
                    : isPast 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  {isPast ? '✓' : step.num}
                </span>
                <span>{step.label}</span>
              </button>

              {idx < workflowSteps.length - 1 && (
                <span className="text-slate-300 dark:text-slate-700 text-xs shrink-0">→</span>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* 5. Main Step 1 (DATASET) Content Grid Matching Reference */}
      {activeTab === 'DATASET' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* LEFT COLUMN (Approx 68% - 8 Cols): Upload Area & Dataset Preview Table */}
          <div className="lg:col-span-8 space-y-5">
            
            {/* Upload Dataset Card */}
            <div className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-5 shadow-xs space-y-4">
              
              {/* Card Tabs */}
              <div className="flex items-center gap-6 border-b border-slate-100 dark:border-slate-800 pb-2.5 text-xs font-semibold">
                <button className="flex items-center gap-1.5 text-blue-600 dark:text-cyan-400 border-b-2 border-blue-600 pb-2.5 -mb-2.5 font-bold">
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload Dataset</span>
                </button>
                <button className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 pb-2.5">
                  <Table className="w-3.5 h-3.5" />
                  <span>From On-board Storage</span>
                </button>
                <button className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 pb-2.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>From Mission Library</span>
                </button>
              </div>

              {/* Large Dashed Dropzone */}
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-750 hover:border-blue-400 dark:hover:border-blue-500 rounded-xl p-8 flex flex-col items-center justify-center text-center transition bg-slate-50/40 dark:bg-slate-900/30 group">
                
                {/* Real File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json,.parquet"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                  <UploadCloud className="w-6 h-6" />
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Upload New Research Telemetry Dataset
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                  Drag & drop your scientific dataset here, or click to browse files.
                </p>

                {/* Format Badges */}
                <div className="flex items-center gap-2 mt-4 text-[10px] text-slate-400">
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300">CSV</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300">JSON</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300">Parquet</span>
                  <span>|</span>
                  <span>Max 50 MB</span>
                  <span>•</span>
                  <span>Local Processing Only</span>
                </div>

                {/* Browse Files Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
                >
                  Browse Files
                </button>
              </div>

            </div>

            {/* Dataset Preview Card */}
            <div className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl overflow-hidden shadow-xs space-y-3 p-4 sm:p-5">
              
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    Dataset Preview
                  </h3>
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                    {currentDataset.name}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {currentDataset.rowCount} rows · {currentDataset.columnCount} features
                  </span>
                </div>

                <button 
                  onClick={() => setActiveTab('EDA')}
                  className="text-xs text-blue-600 dark:text-cyan-400 hover:underline font-semibold"
                >
                  View Full Dataset
                </button>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="p-2.5 border-b border-slate-200 dark:border-slate-800">#</th>
                      {currentDataset.columns.slice(0, 8).map(col => (
                        <th 
                          key={col.name} 
                          className={`p-2.5 border-b border-slate-200 dark:border-slate-800 whitespace-nowrap ${
                            col.name === targetColumn ? 'text-blue-600 dark:text-cyan-400 bg-blue-50/50 dark:bg-blue-950/20' : ''
                          }`}
                        >
                          {col.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {currentDataset.rawPreview.slice(0, 6).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                        <td className="p-2.5 text-slate-400 font-bold">{idx + 1}</td>
                        {currentDataset.columns.slice(0, 8).map(col => (
                          <td 
                            key={col.name} 
                            className={`p-2.5 whitespace-nowrap ${
                              col.name === targetColumn ? 'font-bold text-blue-600 dark:text-cyan-400 bg-blue-50/20 dark:bg-blue-950/10' : ''
                            }`}
                          >
                            {String(row[col.name] ?? '—')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>

          </div>

          {/* RIGHT COLUMN (Approx 32% - 4 Cols): Sample Datasets, Statistics, Feature Histogram */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* 1. On-board Sample Datasets Card */}
            <div className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  <FileCode className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                  <span>On-board Sample Datasets</span>
                </div>
                <span className="text-[11px] text-blue-600 dark:text-cyan-400 font-semibold cursor-pointer">View All</span>
              </div>

              <div className="space-y-2.5">
                {ALL_SAMPLE_DATASETS.map(sample => (
                  <div
                    key={sample.id}
                    className="p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 bg-slate-50/40 dark:bg-slate-900/40 flex items-start justify-between gap-2 transition"
                  >
                    <div className="min-w-0 flex items-start gap-2">
                      <FileText className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                          {sample.name}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          Target: <span className="font-mono font-semibold text-slate-600 dark:text-slate-300">{sample.targetColumn}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleLoadSampleDataset(sample)}
                      className="px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-cyan-400 hover:bg-blue-600 hover:text-white border border-blue-200 dark:border-blue-800 text-[10px] font-bold transition shrink-0"
                    >
                      Load
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Dataset Statistics Card */}
            <div className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  <BarChart3 className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                  <span>Dataset Statistics</span>
                </div>
                <span className="text-[11px] text-blue-600 dark:text-cyan-400 font-semibold cursor-pointer">View Details</span>
              </div>

              {/* 4 Metric Blocks */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                  <div className="text-base font-extrabold text-slate-900 dark:text-white font-mono">
                    {currentDataset.rowCount}
                  </div>
                  <div className="text-[9.5px] text-slate-400 mt-0.5 leading-tight">
                    Total Samples
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                  <div className="text-base font-extrabold text-slate-900 dark:text-white font-mono">
                    {currentDataset.columnCount}
                  </div>
                  <div className="text-[9.5px] text-slate-400 mt-0.5 leading-tight">
                    Total Features
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                  <div className="text-base font-extrabold text-slate-900 dark:text-white font-mono">
                    {edaSummary.targetDistribution.length || 6}
                  </div>
                  <div className="text-[9.5px] text-slate-400 mt-0.5 leading-tight">
                    Activity Classes
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                  <div className="text-base font-extrabold text-slate-900 dark:text-white font-mono">
                    0.2 MB
                  </div>
                  <div className="text-[9.5px] text-slate-400 mt-0.5 leading-tight">
                    File Size
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Feature Distribution Histogram Card */}
            <div className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                  <Activity className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                  <span>Feature Distribution</span>
                </div>

                {/* Feature Selector Dropdown */}
                <div className="relative">
                  <select
                    value={selectedDistFeature}
                    onChange={(e) => setSelectedDistFeature(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded pl-2 pr-6 py-1 text-[10px] font-mono text-slate-700 dark:text-slate-300 outline-none appearance-none cursor-pointer"
                  >
                    {currentDataset.columns.filter(c => c.name !== targetColumn).map(c => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 absolute right-1.5 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Histogram Visualizer */}
              <div className="pt-2">
                <div className="h-28 flex items-end gap-1 px-2 border-b border-l border-slate-200 dark:border-slate-800 pb-1">
                  {histogramData.map((bin, i) => {
                    const heightPct = Math.max(8, (bin.count / maxBinCount) * 100);
                    return (
                      <div 
                        key={i} 
                        className="flex-1 flex flex-col items-center justify-end h-full group relative"
                        title={`Bin ${bin.bin}: ${bin.count} samples`}
                      >
                        <div 
                          className="w-full bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-cyan-400 rounded-t-xs transition-all duration-300"
                          style={{ height: `${heightPct}%` }}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* X Axis Labels */}
                <div className="flex justify-between text-[8.5px] font-mono text-slate-400 pt-1 px-1">
                  <span>-1.0</span>
                  <span>-0.5</span>
                  <span>0.0</span>
                  <span>0.5</span>
                  <span>1.0</span>
                </div>
                <div className="text-[9px] text-center text-slate-400 font-mono mt-0.5">
                  Value Distribution (Normalized)
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* 6. Step 2 (EDA) View */}
      {activeTab === 'EDA' && (
        <div className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                Automated Exploratory Data Analysis (EDA) & Quality Report
              </h2>
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
              Score: {qualityReport.overallScore} / 100 ({qualityReport.rating})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {qualityReport.items.map((item, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">{item.name}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    item.status === 'EXCELLENT' 
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' 
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  {item.details}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Step 3 (PREPROCESSING) View */}
      {activeTab === 'PREPROCESSING' && (
        <div className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                Automated ML Preprocessing Pipeline
              </h2>
            </div>
            <span className="text-xs text-blue-600 dark:text-cyan-400 font-semibold">
              7 Pipeline Stages Configured
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {preprocessingPlan.steps.map((pStep, idx) => (
              <div key={idx} className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-xs text-slate-900 dark:text-white">{pStep.title}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  {pStep.description}
                </p>
                <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  Status: Ready
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. Step 4 (TRAIN) & Step 5 (PERFORMANCE) Views */}
      {(activeTab === 'TRAIN' || activeTab === 'PERFORMANCE') && (
        <div className="space-y-5">
          {/* Performance Summary */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                  Model Evaluation & Performance Benchmark
                </h2>
              </div>
              <span className="text-xs text-slate-400">
                Cross-Validated on {currentDataset.rowCount} samples
              </span>
            </div>

            {/* Performance Comparison Table */}
            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-[10px] uppercase font-bold">
                  <tr>
                    <th className="p-3 border-b border-slate-200 dark:border-slate-800">Model Algorithm</th>
                    <th className="p-3 border-b border-slate-200 dark:border-slate-800">Accuracy</th>
                    <th className="p-3 border-b border-slate-200 dark:border-slate-800">Precision</th>
                    <th className="p-3 border-b border-slate-200 dark:border-slate-800">Recall</th>
                    <th className="p-3 border-b border-slate-200 dark:border-slate-800">F1 Score</th>
                    <th className="p-3 border-b border-slate-200 dark:border-slate-800">Edge Latency</th>
                    <th className="p-3 border-b border-slate-200 dark:border-slate-800">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {comparisonRows.map((row) => (
                    <tr 
                      key={row.algorithmKey}
                      onClick={() => setSelectedModelKey(row.algorithmKey)}
                      className={`cursor-pointer transition ${
                        selectedModelKey === row.algorithmKey 
                          ? 'bg-blue-50/70 dark:bg-blue-950/40 font-bold' 
                          : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="p-3 text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{row.algorithmName}</span>
                        {row.isBestCandidate && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200">
                            BEST
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-mono">{(row.accuracy * 100).toFixed(1)}%</td>
                      <td className="p-3 font-mono">{(row.precision * 100).toFixed(1)}%</td>
                      <td className="p-3 font-mono">{(row.recall * 100).toFixed(1)}%</td>
                      <td className="p-3 font-mono text-blue-600 dark:text-cyan-400 font-bold">{(row.f1Score * 100).toFixed(1)}%</td>
                      <td className="p-3 font-mono">{row.inferenceLatencyMs.toFixed(1)} ms</td>
                      <td className="p-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          Evaluated
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* 9. Step 6 (REGISTRY) View */}
      {activeTab === 'REGISTRY' && (
        <div className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                Model Registry & Edge Deployment
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              Active Production Weight: <strong className="text-slate-900 dark:text-white font-mono">{activeModelVersion}</strong>
            </span>
          </div>

          <div className="space-y-3">
            {modelRegistry.map((reg) => (
              <div 
                key={reg.version}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-wrap items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">{reg.version}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      reg.status === 'ACTIVE' 
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200' 
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {reg.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {reg.algorithm} • Trained on {reg.datasetName} • {reg.createdAt}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right font-mono text-xs">
                    <div className="font-bold text-slate-900 dark:text-white">F1: {(reg.f1Score * 100).toFixed(1)}%</div>
                    <div className="text-slate-400 text-[10px]">Acc: {(reg.accuracy * 100).toFixed(1)}%</div>
                  </div>

                  {reg.status !== 'ACTIVE' && (
                    <button
                      onClick={() => handleActivateModel(reg.version)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs"
                    >
                      Deploy to BAS
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default DatasetModelLabView;
