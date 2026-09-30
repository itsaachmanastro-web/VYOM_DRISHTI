import React, { useState, useMemo } from 'react';
import { useMissionStore } from '../../store/missionStore';
import { 
  Rocket, 
  Layers, 
  BookOpen, 
  Sliders, 
  Search, 
  ChevronDown, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2, 
  RotateCw, 
  Clock, 
  Check, 
  ChevronRight, 
  List, 
  FlaskConical, 
  AlertCircle, 
  Sparkles,
  RefreshCw,
  Eye,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { 
  CANONICAL_EXPERIMENTS, 
  CanonicalExperiment, 
  getExperimentById 
} from '../../data/canonicalExperiments';

export const ExperimentSequenceView: React.FC = () => {
  const { 
    protocols, 
    activeProtocol, 
    setActiveProtocol, 
    currentStepIndex, 
    setCurrentStepIndex,
    stepMachineState,
    humanReadableActionName,
    executionRecords,
    startDemoMode,
    setCurrentView
  } = useMissionStore();

  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'ALL' | 'LIBRARY' | 'CUSTOM'>('ACTIVE');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Active experiment resolved from canonical source of truth
  const activeExperiment: CanonicalExperiment = useMemo(() => {
    return getExperimentById(activeProtocol.code) || 
           getExperimentById(activeProtocol.id) || 
           CANONICAL_EXPERIMENTS[0];
  }, [activeProtocol.code, activeProtocol.id]);

  // Handle Stepping
  const totalSteps = activeProtocol.steps?.length || activeExperiment.totalSteps || 5;
  const currentStep = activeProtocol.steps[currentStepIndex] || activeProtocol.steps[0] || activeExperiment.steps[0];
  const nextStep = currentStepIndex < totalSteps - 1 ? activeProtocol.steps[currentStepIndex + 1] : null;

  const currentStepNum = currentStep ? String(currentStep.stepNumber).padStart(2, '0') : '01';
  const nextStepNum = nextStep ? String(nextStep.stepNumber).padStart(2, '0') : String(Math.min(totalSteps, currentStepIndex + 2)).padStart(2, '0');

  // Step Status Mapping
  const isVerified = stepMachineState === 'VERIFIED' || stepMachineState === 'COOLDOWN';
  const isVerifying = stepMachineState === 'VERIFYING';
  const isIncorrect = stepMachineState === 'INCORRECT';

  let statusText = 'IN PROGRESS';
  let statusBadgeClass = 'bg-blue-600 text-white';

  if (isVerified) {
    statusText = 'VERIFIED';
    statusBadgeClass = 'bg-emerald-600 text-white';
  } else if (isVerifying) {
    statusText = 'VERIFYING';
    statusBadgeClass = 'bg-blue-600 text-white animate-pulse';
  } else if (isIncorrect) {
    statusText = 'ACTION MISMATCH';
    statusBadgeClass = 'bg-amber-600 text-white';
  }

  // Handle image load error with fallback
  const handleImageError = (expId: string) => {
    setImageErrors(prev => ({ ...prev, [expId]: true }));
  };

  // Switch experiment handler (used by both card click and arrow button)
  const handleSelectExperiment = (exp: CanonicalExperiment, e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (exp.code === 'BAS-DEMO-01' || exp.id === 'exp-002') {
      startDemoMode();
    } else {
      setActiveProtocol(exp.id);
    }
  };

  // Filtered experiments based on tab, search query, and category
  const filteredExperiments = useMemo(() => {
    return CANONICAL_EXPERIMENTS.filter(exp => {
      // 1. Tab Filter
      if (activeTab === 'ACTIVE') {
        // Active tab shows running, demo, and available protocols
        if (exp.status === 'Completed' || exp.status === 'Paused') return false;
      } else if (activeTab === 'LIBRARY') {
        // Mission Library view
      } else if (activeTab === 'CUSTOM') {
        // Custom protocols
      }

      // 2. Category Filter
      if (selectedCategory !== 'ALL' && exp.categoryCode !== selectedCategory) {
        return false;
      }

      // 3. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = exp.title.toLowerCase().includes(q);
        const matchesShortTitle = exp.shortTitle.toLowerCase().includes(q);
        const matchesCode = exp.code.toLowerCase().includes(q);
        const matchesId = exp.id.toLowerCase().includes(q);
        const matchesDesc = exp.description.toLowerCase().includes(q);
        const matchesCategory = exp.category.toLowerCase().includes(q);
        const matchesTags = exp.tags.some(t => t.label.toLowerCase().includes(q));

        return matchesTitle || matchesShortTitle || matchesCode || matchesId || matchesDesc || matchesCategory || matchesTags;
      }

      return true;
    });
  }, [activeTab, selectedCategory, searchQuery]);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto select-none">
      
      {/* 1. Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Experiments
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage and execute on-board scientific experiments
        </p>
      </div>

      {/* 2. Navigation Tabs & Filter Bar Matching Reference */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        
        {/* Left Filter Tabs */}
        <div className="flex items-center gap-6 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`flex items-center gap-2 pb-2 transition border-b-2 shrink-0 ${
              activeTab === 'ACTIVE'
                ? 'border-blue-600 text-blue-600 dark:text-cyan-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Active Experiments</span>
          </button>

          <button
            onClick={() => setActiveTab('ALL')}
            className={`flex items-center gap-2 pb-2 transition border-b-2 shrink-0 ${
              activeTab === 'ALL'
                ? 'border-blue-600 text-blue-600 dark:text-cyan-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Experiments</span>
          </button>

          <button
            onClick={() => setActiveTab('LIBRARY')}
            className={`flex items-center gap-2 pb-2 transition border-b-2 shrink-0 ${
              activeTab === 'LIBRARY'
                ? 'border-blue-600 text-blue-600 dark:text-cyan-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Mission Library</span>
          </button>

          <button
            onClick={() => setActiveTab('CUSTOM')}
            className={`flex items-center gap-2 pb-2 transition border-b-2 shrink-0 ${
              activeTab === 'CUSTOM'
                ? 'border-blue-600 text-blue-600 dark:text-cyan-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Custom Protocols</span>
          </button>
        </div>

        {/* Right Search & Category Dropdown */}
        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search experiments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 w-44 sm:w-56"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-slate-800 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="BIO">Bio-Science</option>
              <option value="AI">AI/ML</option>
              <option value="LIFE">Life Science</option>
              <option value="PHYSICS">Physics</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

      </div>

      {/* 3. Four Experiment Cards Grid Matching Reference */}
      {filteredExperiments.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-[#0D1527] rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No matching experiments found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Try adjusting your search terms or selecting "All Categories".
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); setActiveTab('ACTIVE'); }}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredExperiments.map((exp) => {
            const isSelected = activeProtocol.code === exp.code || activeProtocol.id === exp.id || activeExperiment.code === exp.code;
            const hasImgError = imageErrors[exp.id];

            return (
              <div
                key={exp.id}
                role="button"
                tabIndex={0}
                onClick={(e) => handleSelectExperiment(exp, e)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelectExperiment(exp);
                  }
                }}
                className={`group bg-white dark:bg-[#0D1527] rounded-xl overflow-hidden cursor-pointer transition-all duration-200 flex flex-col justify-between border relative ${
                  isSelected 
                    ? 'border-2 border-blue-500 shadow-md ring-2 ring-blue-500/15' 
                    : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-700 hover:shadow-sm'
                }`}
              >
                {/* Card Image Banner */}
                <div className="h-28 relative overflow-hidden bg-slate-900 shrink-0">
                  {!hasImgError ? (
                    <img 
                      src={exp.image} 
                      alt={exp.title} 
                      onError={() => handleImageError(exp.id)}
                      className="w-full h-full object-cover opacity-85 group-hover:scale-104 transition-transform duration-500"
                    />
                  ) : (
                    /* Fallback Scientific Image Pattern */
                    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-blue-950 flex items-center justify-center p-4 text-center">
                      <div className="space-y-1">
                        <FlaskConical className="w-6 h-6 text-cyan-400 mx-auto opacity-70" />
                        <div className="font-mono text-[10px] text-cyan-300 font-bold">{exp.code}</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Step Count Badge (Top Right) */}
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
                    <span className="bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-700 shadow-xs">
                      {exp.totalSteps} Steps
                    </span>
                  </div>

                  {/* Running Status Badge (Top Left) */}
                  {exp.status === 'Running' && (
                    <div className="absolute top-2 left-2 z-10">
                      <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        Running
                      </span>
                    </div>
                  )}

                  {/* Demo Status Badge (Top Left) */}
                  {exp.status === 'Demo' && (
                    <div className="absolute top-2 left-2 z-10">
                      <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                        Demo
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="font-mono text-xs font-bold text-blue-600 dark:text-cyan-400">
                      {exp.code}
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-xs leading-snug line-clamp-2 mt-0.5 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition">
                      {exp.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {exp.description}
                    </p>
                  </div>

                  {/* Card Tags & Action Arrow Button */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {exp.tags.map((tag, idx) => (
                        <span 
                          key={idx} 
                          className={`text-[9.5px] font-semibold px-2 py-0.5 rounded-md ${tag.color}`}
                        >
                          {tag.label}
                        </span>
                      ))}
                    </div>

                    {/* Circular Action Arrow Button */}
                    <button
                      type="button"
                      aria-label={`Open ${exp.title}`}
                      onClick={(e) => handleSelectExperiment(exp, e)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition ${
                        isSelected 
                          ? 'bg-blue-600 text-white shadow-xs' 
                          : 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-cyan-400 group-hover:bg-blue-600 group-hover:text-white'
                      }`}
                    >
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 4. Bottom Two-Column Execution Grid Matching Reference */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* LEFT (60% - 7 Cols): Experiment Sequence Timeline Card */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
          
          {/* Header & Progress Indicator */}
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                <h2 className="font-bold text-slate-900 dark:text-white text-sm">
                  Experiment Sequence: <span className="text-blue-600 dark:text-cyan-400 font-mono">{activeExperiment.code}</span>
                </h2>
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Progress: <strong className="text-blue-600 dark:text-cyan-400 font-bold">{currentStepIndex + 1} / {totalSteps} Steps</strong>
              </span>
            </div>

            {/* Blue Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Sequence Steps List */}
          <div className="space-y-2 pt-1">
            {activeProtocol.steps.map((step, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const isPending = idx > currentStepIndex;

              return (
                <div
                  key={step.stepNumber}
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isCurrent 
                      ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/60 shadow-xs ring-1 ring-blue-500/10' 
                      : isPast
                      ? 'bg-white dark:bg-[#0D1527] border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      : 'bg-white dark:bg-[#0D1527] border-slate-100 dark:border-slate-800/80 opacity-75 hover:opacity-100'
                  }`}
                >
                  {/* Left Step Status & Number */}
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Status Circle */}
                    {isPast ? (
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    ) : isCurrent ? (
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                        {step.stepNumber}
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-700 text-slate-500 flex items-center justify-center shrink-0 text-xs font-semibold">
                        {step.stepNumber}
                      </div>
                    )}

                    {/* Step Title & Subtitle */}
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                        {step.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        <span className="font-mono text-slate-400 mr-1">{step.stepCode || `SCI-STEP-0${step.stepNumber}`}</span>
                        <span>{step.expectedAction}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Timing & Status Badge */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                      {isPast ? '00:02:14' : isCurrent ? '00:01:32' : '--'}
                    </span>

                    {isPast && (
                      <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Completed
                      </span>
                    )}

                    {isCurrent && (
                      <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                        In Progress
                      </span>
                    )}

                    {isPending && (
                      <span className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 text-[10px] font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        Pending
                      </span>
                    )}

                    <ChevronRight className={`w-3.5 h-3.5 ${isCurrent ? 'text-blue-600 dark:text-cyan-400' : 'text-slate-400'}`} />
                  </div>

                </div>
              );
            })}
          </div>

        </div>

        {/* RIGHT (40% - 5 Cols): Current Step Details Card */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
          
          {/* Header & Stepper Controls */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <List className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              <h2 className="font-bold text-slate-900 dark:text-white text-sm">
                Current Step Details
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-600 dark:text-cyan-400">
                Step {currentStepIndex + 1} / {totalSteps}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
                  disabled={currentStepIndex === 0}
                  className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition disabled:opacity-30"
                  title="Previous Step"
                >
                  <ArrowLeft className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setCurrentStepIndex(Math.min(totalSteps - 1, currentStepIndex + 1))}
                  disabled={currentStepIndex >= totalSteps - 1}
                  className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition disabled:opacity-30"
                  title="Next Step"
                >
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Current Step Title & Equipment Image Box */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-blue-600 text-white font-mono font-bold text-lg flex items-center justify-center shrink-0 shadow-xs">
                {currentStepNum}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
                  {currentStep?.title || 'Active Procedure'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {currentStep?.expectedAction || 'Follow standard operating procedure instructions.'}
                </p>
              </div>
            </div>

            {/* Equipment Preview Image */}
            <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-900">
              <img 
                src={activeExperiment.equipmentImage} 
                alt="Procedure Area" 
                onError={(e) => {
                  // If image fails, replace with inline placeholder
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=300&auto=format&fit=crop&q=80';
                }}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Verification Details Table */}
          <div className="space-y-3 pt-1 text-xs">
            
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Status:</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold tracking-wide uppercase ${statusBadgeClass}`}>
                {statusText}
              </span>
            </div>

            {/* Expected Action */}
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Expected Action</span>
              <p className="text-slate-800 dark:text-slate-200 font-medium leading-tight">
                {currentStep?.expectedAction || 'Maintain nominal procedure trajectory.'}
              </p>
            </div>

            {/* AI Observation */}
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">AI Observation</span>
              <p className="text-slate-800 dark:text-slate-200 font-medium leading-tight">
                {humanReadableActionName ? `${humanReadableActionName} detected.` : `${currentStep?.title || 'Procedure'} observation active.`}
              </p>
            </div>

            {/* Safety Requirement */}
            {currentStep?.safetyRequirement && (
              <div className="space-y-0.5">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Safety Protocol</span>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-tight">
                  {currentStep.safetyRequirement}
                </p>
              </div>
            )}

            {/* Validation State */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Validation</span>
              <div className="flex items-center gap-1.5 font-bold text-blue-600 dark:text-cyan-400">
                {isVerified ? (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>VERIFIED</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>VERIFYING...</span>
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* Next Step Box */}
          {nextStep ? (
            <div 
              onClick={() => setCurrentStepIndex(Math.min(totalSteps - 1, currentStepIndex + 1))}
              className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-850/80 border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 cursor-pointer transition flex items-center justify-between text-xs group"
            >
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">Next Step</span>
                <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-2">
                  <span className="text-blue-600 dark:text-cyan-400 font-mono">{nextStepNum}</span>
                  <span className="group-hover:text-blue-600 dark:group-hover:text-cyan-300 transition">{nextStep.title}</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-cyan-400 group-hover:translate-x-0.5 transition" />
            </div>
          ) : (
            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-bold">Protocol Sequence Complete</span>
            </div>
          )}

          {/* Quick Action: Launch Live Webcam Mode if BAS-DEMO-01 or any active protocol */}
          <div className="pt-2">
            <button
              onClick={() => {
                if (activeExperiment.code === 'BAS-DEMO-01') {
                  startDemoMode();
                } else {
                  setCurrentView('live-monitor');
                }
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold text-xs tracking-wide flex items-center justify-center gap-2 shadow-sm transition transform hover:-translate-y-0.5 active:scale-[0.99]"
            >
              <Sparkles className="w-4 h-4" />
              <span>{activeExperiment.code === 'BAS-DEMO-01' ? 'Launch Live 4-Step Webcam Demo' : 'Execute on Live Monitor'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

export default ExperimentSequenceView;
