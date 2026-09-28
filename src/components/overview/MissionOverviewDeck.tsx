import React, { useState } from 'react';
import { useMissionStore } from '../../store/missionStore';
import { 
  CheckCircle2, 
  Clock, 
  Cpu, 
  HardDrive, 
  Activity, 
  ChevronRight, 
  Video, 
  Radio, 
  ShieldCheck, 
  Sliders, 
  Bot, 
  Zap, 
  Thermometer, 
  Camera, 
  Play, 
  ExternalLink, 
  AlertCircle, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Check, 
  Circle,
  FlaskConical,
  BarChart3,
  Globe2,
  FileText,
  Lock,
  Layers,
  LayoutGrid
} from 'lucide-react';
import { ExperimentStep } from '../../types/mission';

export const MissionOverviewDeck: React.FC = () => {
  const { 
    session, 
    activeProtocol, 
    currentStepIndex, 
    telemetry, 
    setCurrentView,
    boundingBoxes,
    logs
  } = useMissionStore();

  const astronautName = session?.user?.displayName || 'Astronaut A. Bhardwaj';

  // Active step details
  const steps: ExperimentStep[] = activeProtocol?.steps || [];
  const currentStep: ExperimentStep = steps[currentStepIndex] || steps[1] || {
    stepNumber: 2,
    stepCode: 'STEP-02',
    title: 'Collect Sample Vial',
    scientificRationale: 'Retrieve the designated protein solution vial from the thermal rack container.',
    expectedAction: 'COLLECT_SAMPLE_VIAL',
    targetObject: 'Sample-Container',
    durationEstimateSec: 45,
    safetyRequirement: 'Maintain 0-G tether grip',
    voicePrompt: 'Collect sample vial from rack',
    validationRules: {
      requiredObjects: ['Sample-Container'],
      requiredHandInteraction: 'GRIP'
    }
  };

  const completedCount = Math.min(currentStepIndex, steps.length);
  const progressPercent = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 40;

  // Recent activity subset for the dashboard
  const recentLogs = logs.slice(0, 5);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1520px] mx-auto select-none transition-colors duration-200">
      
      {/* 1. Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">Dashboard</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 dark:text-slate-200 font-semibold">Mission Overview & Decision Center</span>
      </div>

      {/* 2. Top Header & Quick Action Launchers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Mission Overview & Decision Center
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Session
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              High-level experiment state, automated AI insights, health vitals & operational decision flow
            </p>
          </div>
        </div>

        {/* Action Buttons to navigate to specialized workspaces */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCurrentView('sequence')}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 bg-white dark:bg-slate-900 shadow-sm"
          >
            <FlaskConical className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Protocol Workflow</span>
          </button>
          
          <button
            onClick={() => setCurrentView('live-monitor')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs transition shadow-sm"
          >
            <Video className="w-3.5 h-3.5 fill-current" />
            <span>Open Live Monitor</span>
          </button>
        </div>
      </div>

      {/* 3. HERO: Active Mission & Experiment Summary Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-5 border-b border-slate-100 dark:border-slate-800/80">
          
          {/* Left Hero Context */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                ACTIVE SCIENTIFIC PAYLOAD
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {activeProtocol.code || 'BAS-SCI-01'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                RUNNING
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {activeProtocol.name || 'Protein Crystal Growth & Solution Inoculation (PCG)'}
            </h2>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Principal Investigator: <span className="font-semibold text-slate-700 dark:text-slate-300">{activeProtocol.principalInvestigator || 'Dr. K. Sivan (SAC-ISRO)'}</span> • Location: <span className="font-semibold text-slate-700 dark:text-slate-300">{activeProtocol.rackLocation || 'Express Rack-04'}</span> • Hazard: <span className="font-semibold text-slate-700 dark:text-slate-300">{activeProtocol.hazardLevel || 'Bio-Safety-1'}</span>
            </p>
          </div>

          {/* Right Progress Summary Block */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-4 min-w-[280px] lg:min-w-[320px] space-y-2.5 shrink-0">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-400">Sequence Progress</span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                {completedCount} / {steps.length} Steps ({progressPercent}%)
              </span>
            </div>

            {/* Smooth Progress Bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }} 
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
              <span>Current: <strong className="text-slate-800 dark:text-slate-200">{currentStep.title}</strong></span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">Nominal</span>
            </div>
          </div>

        </div>

        {/* Hero Bottom 4 Phase Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 text-xs">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">CURRENT PHASE</div>
            <div className="font-bold text-slate-900 dark:text-white mt-0.5">Incubation & Sample Inoculation</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Thermal equilibration at 22.0°C</div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">NEXT MILESTONE</div>
            <div className="font-bold text-slate-900 dark:text-white mt-0.5">03 Incubation Period</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Automated optical imaging scan</div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">OPERATOR PROFILE</div>
            <div className="font-bold text-slate-900 dark:text-white mt-0.5">{astronautName}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Astronaut BAS Flight Crew 01</div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">SESSION RUNTIME</div>
            <div className="font-mono font-bold text-blue-600 dark:text-blue-400 mt-0.5">04h 22m 15s MET</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Continuous 0-G telemetry lock</div>
          </div>
        </div>
      </div>

      {/* 4. KEY METRICS: Mission Health KPI Grid (5 Compact Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Metric 1: AI Validation Accuracy */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              AI ACCURACY
            </span>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +2.1%
            </span>
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            96.8%
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            Zero false step validations
          </div>
        </div>

        {/* Metric 2: Edge Inference Latency */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              EDGE LATENCY
            </span>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <TrendingDown className="w-3 h-3" /> -1.4ms
            </span>
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            23.2 ms
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            Steady 70 FPS inference loop
          </div>
        </div>

        {/* Metric 3: Bandwidth Reduction */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              BW REDUCTION
            </span>
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> Optimal
            </span>
          </div>
          <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
            85.4%
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            2.4 kbps telemetry vs 45 Mbps video
          </div>
        </div>

        {/* Metric 4: Power Draw */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              POWER DRAW
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              Nominal
            </span>
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            12.4 W
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            28V DC express bus payload
          </div>
        </div>

        {/* Metric 5: Local Storage SSD */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              STORAGE
            </span>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              SMART OK
            </span>
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            80.6%
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            412.8 GB / 512 GB NVMe
          </div>
        </div>

      </div>

      {/* 5. PRIMARY WORKSPACE (2 Main Columns: Left 7 Cols / Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ===================================================================== */}
        {/* LEFT COLUMN (7 / 12 ~ 58%): Experiment Progress, AI Insights, Activity */}
        {/* ===================================================================== */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card A: High-Level Experiment Sequence Timeline */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Experiment Sequence Timeline
                </h3>
              </div>
              <button 
                onClick={() => setCurrentView('sequence')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                Manage Protocols <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Stepper Timeline List */}
            <div className="space-y-3">
              {steps.map((step, idx) => {
                const isPassed = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div 
                    key={step.stepCode || idx}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isCurrent 
                        ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700 shadow-xs' 
                        : isPassed
                        ? 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-700/60'
                        : 'bg-white dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      
                      {/* Step Indicator & Info */}
                      <div className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                          isPassed 
                            ? 'bg-emerald-500 text-white' 
                            : isCurrent
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}>
                          {isPassed ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : `0${idx + 1}`}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className={`text-xs font-bold ${
                              isCurrent ? 'text-blue-900 dark:text-blue-200' : 'text-slate-900 dark:text-white'
                            }`}>
                              {step.title}
                            </h4>
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                CURRENT STEP
                              </span>
                            )}
                            {isPassed && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                COMPLETED
                              </span>
                            )}
                          </div>
                          
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {step.scientificRationale || step.safetyRequirement}
                          </p>
                        </div>
                      </div>

                      {/* Equipment Tag */}
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                        {step.targetObject || 'Rack-C4'}
                      </span>
                    </div>

                    {/* Active Step Real-time Callout */}
                    {isCurrent && (
                      <div className="mt-3 pt-2.5 border-t border-blue-200/60 dark:border-blue-800/60 flex items-center justify-between text-[11px]">
                        <div className="text-blue-800 dark:text-blue-300 font-medium">
                          Expected Action: <span className="font-mono font-bold">{step.expectedAction}</span>
                        </div>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> AI Validating Live
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card B: AI Insights & Real-Time Decision Center */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Automated AI Insights & Operator Recommendations
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                MoveNet + SOP Engine
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              
              {/* Insight 1 */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    HOI Interaction Verified
                  </span>
                  <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                    98.2%
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Sample vial successfully gripped and positioned within target tolerance corridor of Express Rack-04.
                </p>
                <div className="text-[10px] text-slate-400 pt-1">
                  Observation logged at 20:02:41 UTC
                </div>
              </div>

              {/* Insight 2 */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-blue-500" />
                    Kinematic Comfort Corridor
                  </span>
                  <span className="font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded">
                    Nominal
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Right arm elbow flexion steady at 118.0°. Microgravity drift minimal (0.012 m/s). Zero strain anomalies.
                </p>
                <div className="text-[10px] text-slate-400 pt-1">
                  17 anatomical joints active
                </div>
              </div>

            </div>

            {/* Operator Recommendation Banner */}
            <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-blue-900 dark:text-blue-200 block">
                  Next Operator Action:
                </span>
                <span className="text-[11px] text-blue-800 dark:text-blue-300">
                  Proceed to Step 3 Incubation buffer injection. Verify illumination sensor is green.
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setCurrentView('assistant')}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-xs flex items-center gap-1"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Consult Assistant</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card C: Recent Mission Activity Audit Log */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Recent Mission Activity
                </h3>
              </div>
              <button
                onClick={() => setCurrentView('logs')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                View Flight Logs <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {recentLogs.map((log) => (
                <div key={log.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
                      {log.metTimestamp || '20:03:12'}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        {log.event}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {log.source || 'AI_PERCEPTION'} • Confidence: {(log.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                    log.severity === 'CRITICAL' || log.severity === 'SEQUENCE ERROR'
                      ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      : log.severity === 'WARNING'
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                  }`}>
                    {log.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ===================================================================== */}
        {/* RIGHT COLUMN (5 / 12 ~ 42%): Preview Box, System Health, Station Info */}
        {/* ===================================================================== */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card D: Compact Live Experiment Preview (Non-Dominating) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Live Camera Preview (CAM-01)
                </h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                30 FPS LOCKED
              </span>
            </div>

            {/* Small 16:9 Video Canvas Thumbnail */}
            <div className="relative bg-slate-950 rounded-xl aspect-video overflow-hidden border border-slate-800 flex flex-col justify-between p-3">
              
              {/* Overlay HUD Tag */}
              <div className="flex items-center justify-between text-[10px] font-mono text-white/90">
                <span className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs border border-white/10">
                  CAM-01 • RACK-C4
                </span>
                <span className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-emerald-400 border border-emerald-500/20">
                  ● ASTRONAUT DETECTED
                </span>
              </div>

              {/* Center Visualization Graphic */}
              <div className="flex flex-col items-center justify-center text-center space-y-1 py-4">
                <div className="w-10 h-10 rounded-full bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400">
                  <Eye className="w-5 h-5" />
                </div>
                <div className="text-[11px] font-bold text-white tracking-wide">
                  AI Real-Time Perception Stream
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  17 Keypoints • Target: Sample-Container
                </div>
              </div>

              {/* Bottom HUD Tag */}
              <div className="flex items-center justify-between text-[10px] font-mono text-white/80">
                <span>GENLOCK: &lt;0.2ms</span>
                <span>ENC: WebM 1080p</span>
              </div>
            </div>

            {/* Primary Navigation Button to Full Live Monitor */}
            <button
              onClick={() => setCurrentView('live-monitor')}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-sm"
            >
              <Video className="w-3.5 h-3.5 fill-current" />
              <span>Open Full Live Monitor Workspace →</span>
            </button>
          </div>

          {/* Card E: Scannable System Health Matrix */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Edge Subsystems Vitals
                </h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                ● 100% Healthy
              </span>
            </div>

            {/* 2x3 Grid of Subsystem Health Badges */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
                <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-emerald-500" /> Local AI Engine
                </div>
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Running (FP16)
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
                <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                  <Camera className="w-3 h-3 text-blue-500" /> Camera Systems
                </div>
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Online (Dual Cam)
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
                <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                  <HardDrive className="w-3 h-3 text-emerald-500" /> NVMe Storage
                </div>
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  99.8% Healthy
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
                <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3 text-blue-500" /> Power Express
                </div>
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  12.4 W Nominal
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
                <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                  <Thermometer className="w-3 h-3 text-emerald-500" /> Thermal State
                </div>
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  42.4 °C Safe
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
                <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" /> Security Seal
                </div>
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  SHA-256 Active
                </div>
              </div>

            </div>

            <button
              onClick={() => setCurrentView('health')}
              className="w-full py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition"
            >
              Open Full System Diagnostics & Self-Test →
            </button>
          </div>

          {/* Card F: Bharatiya Antariksh Station (BAS) Orbital Position Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                {/* Indian Flag SVG Badge */}
                <div className="w-4 h-3 rounded-xs overflow-hidden shrink-0 border border-slate-300 dark:border-slate-700 flex flex-col">
                  <div className="h-1/3 bg-[#FF9933]" />
                  <div className="h-1/3 bg-white flex items-center justify-center">
                    <div className="w-0.5 h-0.5 rounded-full bg-[#000080]" />
                  </div>
                  <div className="h-1/3 bg-[#128807]" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Bharatiya Antariksh Station (BAS)
                </h3>
              </div>
              <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                LEO ORBIT
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 block font-bold">ALTITUDE</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">408.0 km</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 block font-bold">VELOCITY</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">7.67 km/s</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 block font-bold">COORDINATES</span>
                <span className="font-mono text-slate-900 dark:text-white text-[11px]">25.6° N, 82.9° E</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 block font-bold">NEXT GROUND AOS</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-[11px]">In 37 min (ISTRAC)</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 6. BOTTOM STATUS BANNER */}
      <div className="p-4 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs select-none">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>
            All primary systems operational. Experiment running normally on <strong>Bharatiya Antariksh Station (BAS)</strong>.
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-slate-500 dark:text-slate-400 text-[11px] font-mono">
          <span>Uplink Queue: <strong className="text-slate-900 dark:text-white">2 packets</strong></span>
          <span>•</span>
          <span>NVMe: <strong className="text-slate-900 dark:text-white">412.8 / 512 GB</strong></span>
          <span>•</span>
          <span className="text-blue-600 dark:text-blue-400 font-bold">100% Air-Gapped Local Inference</span>
        </div>
      </div>

    </div>
  );
};

export default MissionOverviewDeck;
