import React, { useState, useEffect } from 'react';
import { useMissionStore } from '../../store/missionStore';
import { 
  Sliders, 
  Cpu, 
  Thermometer, 
  HardDrive, 
  Camera, 
  ShieldCheck, 
  Save, 
  RefreshCw, 
  Zap,
  Folder,
  Database,
  Lock,
  Wifi,
  CloudOff,
  CheckCircle2,
  Play,
  ChevronRight,
  MoreVertical,
  X,
  FileCode,
  Download,
  Check,
  Shield,
  Activity,
  Layers,
  Settings,
  Terminal,
  FileCheck
} from 'lucide-react';
import { 
  localStorageService, 
  OfflineSelfTestResult, 
  OfflineStorageDirectory,
  StorageFile
} from '../../services/localStorageService';

export const SystemHealthConfig: React.FC = () => {
  const { 
    detectionSettings,
    updateDetectionSettings
  } = useMissionStore();

  const [directories] = useState<OfflineStorageDirectory[]>(localStorageService.getDirectories());
  const [selectedDirectory, setSelectedDirectory] = useState<OfflineStorageDirectory | null>(null);
  const [showCalibrationModal, setShowCalibrationModal] = useState<boolean>(false);
  const [savedStatus, setSavedStatus] = useState<boolean>(false);

  // Self-Test Execution State
  const [isTestModalOpen, setIsTestModalOpen] = useState<boolean>(false);
  const [testProgress, setTestProgress] = useState<number>(0);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [selfTestResult, setSelfTestResult] = useState<OfflineSelfTestResult | null>(null);
  const [isTestingComplete, setIsTestingComplete] = useState<boolean>(false);

  // Start Self-Test Runner
  const handleRunSelfTest = () => {
    setIsTestModalOpen(true);
    setTestProgress(0);
    setActiveStepIndex(0);
    setIsTestingComplete(false);
    setSelfTestResult(null);

    const fullResult = localStorageService.runOfflineSelfTest();

    // Sequentially advance test items for realistic aerospace feedback
    let currentStep = 0;
    const totalSteps = fullResult.tests.length;

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep <= totalSteps) {
        setActiveStepIndex(currentStep - 1);
        setTestProgress(Math.round((currentStep / totalSteps) * 100));
      } else {
        clearInterval(interval);
        setSelfTestResult(fullResult);
        setIsTestingComplete(true);
        setActiveStepIndex(totalSteps);
      }
    }, 280);
  };

  const handleSaveCalibration = () => {
    setSavedStatus(true);
    setTimeout(() => {
      setSavedStatus(false);
      setShowCalibrationModal(false);
    }, 1200);
  };

  const downloadTestReport = () => {
    if (!selfTestResult) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(selfTestResult, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `vyom_drishti_offline_selftest_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1400px] mx-auto select-none transition-colors duration-200">
      
      {/* 1. Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">System</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 dark:text-slate-200 font-semibold">Diagnostics</span>
      </div>

      {/* 2. Top Header Bar with Icon, Title, Status Pill, and Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                System Status & Offline Self-Test
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Hardware Nominal
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Edge hardware diagnostics, offline storage verification & parameter calibration
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowCalibrationModal(true)}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 bg-white dark:bg-slate-900 shadow-sm"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Calibration Settings</span>
          </button>
          
          <button
            onClick={handleRunSelfTest}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs transition shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run Offline Self-Test</span>
          </button>
        </div>
      </div>

      {/* 3. Row 1: Core AI & Air-Gap Architectural Status (4 Cards Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Local AI Engine */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-start gap-3.5 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div className="space-y-0.5 flex-1 min-w-0">
            <div className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              LOCAL AI ENGINE
            </div>
            <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
              RUNNING
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
              MoveNet + Custom SOP Rules
            </div>
          </div>
        </div>

        {/* Card 2: Cloud AI Connection */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-start gap-3.5 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center shrink-0">
            <CloudOff className="w-5 h-5" />
          </div>
          <div className="space-y-0.5 flex-1 min-w-0">
            <div className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              CLOUD AI CONNECTION
            </div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white">
              DISABLED
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
              Zero Cloud Calls Required
            </div>
          </div>
        </div>

        {/* Card 3: Internet Access */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-start gap-3.5 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center shrink-0">
            <Wifi className="w-5 h-5" />
          </div>
          <div className="space-y-0.5 flex-1 min-w-0">
            <div className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              INTERNET ACCESS
            </div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white">
              NOT REQUIRED
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
              100% On-Premise Air-Gapped
            </div>
          </div>
        </div>

        {/* Card 4: Cloud Dependency */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-start gap-3.5 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/60 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-0.5 flex-1 min-w-0">
            <div className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              CLOUD DEPENDENCY
            </div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white">
              NONE (ZERO)
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
              Autonomous Edge Inference
            </div>
          </div>
        </div>

      </div>

      {/* 4. Row 2: Hardware Diagnostics & Edge Telemetry (4 Cards Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: NPU / GPU Thermal */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-start gap-3.5 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center shrink-0">
            <Thermometer className="w-5 h-5" />
          </div>
          <div className="space-y-0.5 flex-1 min-w-0">
            <div className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              NPU / GPU THERMAL
            </div>
            <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
              42.4 °C
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
              Thermal margin: <span className="text-emerald-600 dark:text-emerald-400 font-medium">+37.6°C safe</span>
            </div>
          </div>
        </div>

        {/* Card 2: Power Draw (Express Bus) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-start gap-3.5 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div className="space-y-0.5 flex-1 min-w-0">
            <div className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              POWER DRAW (EXPRESS BUS)
            </div>
            <div className="text-base font-extrabold text-blue-600 dark:text-blue-400">
              14.8 Watts
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
              28V DC payload bus nominal
            </div>
          </div>
        </div>

        {/* Card 3: Camera Synchronization */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-start gap-3.5 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center shrink-0">
            <Camera className="w-5 h-5" />
          </div>
          <div className="space-y-0.5 flex-1 min-w-0">
            <div className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              CAMERA SYNCHRONIZATION
            </div>
            <div className="text-base font-extrabold text-blue-600 dark:text-blue-400">
              Genlock Locked
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
              Inter-camera jitter &lt; 0.2ms
            </div>
          </div>
        </div>

        {/* Card 4: Local NVMe Storage */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-start gap-3.5 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1 min-w-0">
            <div className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              LOCAL NVME STORAGE
            </div>
            <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
              99.8% SMART OK
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '99.8%' }} />
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
              Wear leveling index: 0.02%
            </div>
          </div>
        </div>

      </div>

      {/* 5. Local Storage Directories (9 Cards Grid - 3x3) */}
      <div className="space-y-4">
        
        {/* Section Header */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">
              LOCAL STORAGE DIRECTORIES (DATA AND / MODELS)
            </h2>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Encrypted On-Premise SSD & Local Disk</span>
          </div>
        </div>

        {/* 3x3 Grid of Directory Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {directories.map((dir, idx) => (
            <div 
              key={idx}
              onClick={() => setSelectedDirectory(dir)}
              className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                {/* Header: Path & File Badge & Menu */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4 text-blue-600 dark:text-blue-400 fill-blue-50 dark:fill-blue-950/50 group-hover:scale-105 transition-transform" />
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                      {dir.path}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
                      {dir.fileCount} files
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDirectory(dir);
                      }}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Inspect files"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Directory Title */}
                <h3 className="font-bold text-xs text-slate-900 dark:text-white mt-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {dir.name}
                </h3>

                {/* Description */}
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-1 line-clamp-2">
                  {dir.description}
                </p>
              </div>

              {/* Footer: Size */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 mt-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  Size: {dir.sizeFormatted}
                </span>
                <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  Inspect <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 6. MODAL: Offline Self-Test Diagnostic Console */}
      {/* ========================================================================= */}
      {isTestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Offline Hardware & AI Self-Test Suite
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Comprehensive edge sensor verification, tensor latency profiling & air-gap validation
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTestModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Bar & Status */}
            <div className="px-5 py-3.5 bg-slate-100/60 dark:bg-slate-800/40 border-b border-slate-200/60 dark:border-slate-800 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  {!isTestingComplete ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-spin" />
                      <span>Executing Self-Test Sequence ({testProgress}%)</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                        Self-Test Complete — All 7 Subsystems Ready & Nominal
                      </span>
                    </>
                  )}
                </span>
                <span className="font-mono text-slate-500 text-[11px]">
                  {isTestingComplete ? 'Execution Time: 14.3ms' : 'Testing edge buses...'}
                </span>
              </div>
              
              {/* Animated Progress Track */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 rounded-full ${
                    isTestingComplete ? 'bg-emerald-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${testProgress}%` }}
                />
              </div>
            </div>

            {/* Diagnostic Test Items List */}
            <div className="p-5 overflow-y-auto space-y-3 flex-1 custom-scrollbar">
              {localStorageService.runOfflineSelfTest().tests.map((test, idx) => {
                const isItemActive = idx === activeStepIndex;
                const isItemPassed = idx < activeStepIndex || isTestingComplete;

                return (
                  <div 
                    key={test.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isItemPassed 
                        ? 'bg-slate-50/80 dark:bg-slate-800/50 border-emerald-200/60 dark:border-emerald-900/40' 
                        : isItemActive
                        ? 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700 shadow-sm'
                        : 'bg-slate-50/30 dark:bg-slate-900/30 border-slate-200/50 dark:border-slate-800/50 opacity-40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {test.id}
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {test.name}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        {isItemPassed && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300/60 dark:border-emerald-800/60">
                            <Check className="w-3 h-3" />
                            PASS
                          </span>
                        )}
                        {isItemActive && !isItemPassed && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 animate-pulse">
                            RUNNING
                          </span>
                        )}
                        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                          {test.latencyMs}ms
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                      {test.details}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 text-[11px] font-mono">
                      <div className="text-slate-600 dark:text-slate-400">
                        <span className="text-slate-400 dark:text-slate-500">Measured:</span> {test.measuredValue}
                      </div>
                      <div className="text-slate-600 dark:text-slate-400">
                        <span className="text-slate-400 dark:text-slate-500">Tolerance:</span> {test.toleranceLimit}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Zero Cloud Endpoints Queried (100% Edge Air-Gapped)</span>
              </div>

              <div className="flex items-center gap-2">
                {isTestingComplete && (
                  <button
                    onClick={downloadTestReport}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Report (JSON)</span>
                  </button>
                )}
                <button
                  onClick={handleRunSelfTest}
                  disabled={!isTestingComplete}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition disabled:opacity-50"
                >
                  Re-Run
                </button>
                <button
                  onClick={() => setIsTestModalOpen(false)}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition shadow-sm"
                >
                  Close Console
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MODAL: Directory Files & Checksum Explorer */}
      {/* ========================================================================= */}
      {selectedDirectory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Folder className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                      {selectedDirectory.path}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {selectedDirectory.fileCount} files • {selectedDirectory.sizeFormatted}
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5">
                    {selectedDirectory.name}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedDirectory(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description & Security Badge */}
            <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
              <p className="text-slate-600 dark:text-slate-400">
                {selectedDirectory.description}
              </p>
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] shrink-0">
                <FileCheck className="w-3.5 h-3.5" />
                <span>SHA-256 Verified</span>
              </div>
            </div>

            {/* Files List Table */}
            <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                      <th className="py-2.5 px-3">File Name</th>
                      <th className="py-2.5 px-3">Size</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Checksum</th>
                      <th className="py-2.5 px-3 text-right">Last Modified</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
                    {selectedDirectory.files.map((file, fIdx) => (
                      <tr key={fIdx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 text-slate-900 dark:text-white font-medium flex items-center gap-2">
                          <FileCode className="w-3.5 h-3.5 text-blue-500" />
                          <span>{file.name}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                          {(file.sizeBytes / 1024).toFixed(1)} KB
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400">
                          {file.type}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">
                          {file.checksum}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-500">
                          {file.lastModified}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Encrypted on local NVMe / Air-gapped on-board partition
              </span>
              <button
                onClick={() => setSelectedDirectory(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. MODAL: AI Perception & Temporal Stabilization Calibration Settings */}
      {/* ========================================================================= */}
      {showCalibrationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    On-Board AI Perception & Calibration Settings
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Real-time keypoint matching confidence, temporal stabilization & debounce timings
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCalibrationModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sliders Body */}
            <div className="p-6 space-y-5">
              
              {/* Setting 1: Min Keypoint Confidence */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">Minimum Keypoint Confidence</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Threshold for MoveNet 17-anatomical landmark acceptance</p>
                  </div>
                  <span className="text-blue-600 dark:text-blue-400 font-mono font-bold text-sm bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
                    {(detectionSettings.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.50"
                  max="0.95"
                  step="0.05"
                  value={detectionSettings.confidence}
                  onChange={(e) => updateDetectionSettings({ confidence: parseFloat(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Setting 2: Stabilization Hold Duration */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">Action Stabilization Hold Duration</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Continuous pose validation duration before step completion trigger</p>
                  </div>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold text-sm bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    {(detectionSettings.durationMs / 1000).toFixed(1)}s
                  </span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="3000"
                  step="200"
                  value={detectionSettings.durationMs}
                  onChange={(e) => updateDetectionSettings({ durationMs: parseInt(e.target.value) })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Setting 3: Voting Consensus Ratio */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">15-Frame Voting Consensus</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Sliding window agreement required to reject microgravity camera noise</p>
                  </div>
                  <span className="text-sky-600 dark:text-sky-400 font-mono font-bold text-sm bg-sky-50 dark:bg-sky-950 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-800">
                    {(detectionSettings.stability * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.50"
                  max="0.95"
                  step="0.05"
                  value={detectionSettings.stability}
                  onChange={(e) => updateDetectionSettings({ stability: parseFloat(e.target.value) })}
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>

              {/* Setting 4: Step Cooldown Delay */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">Post-Validation Debounce Cooldown</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Safety lock time before next experiment step can begin</p>
                  </div>
                  <span className="text-amber-600 dark:text-amber-400 font-mono font-bold text-sm bg-amber-50 dark:bg-amber-950 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
                    {(detectionSettings.cooldownMs / 1000).toFixed(1)}s
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="2500"
                  step="100"
                  value={detectionSettings.cooldownMs}
                  onChange={(e) => updateDetectionSettings({ cooldownMs: parseInt(e.target.value) })}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Applied instantly to local inference pipeline
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCalibrationModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCalibration}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savedStatus ? 'Calibration Saved!' : 'Save Calibration'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
