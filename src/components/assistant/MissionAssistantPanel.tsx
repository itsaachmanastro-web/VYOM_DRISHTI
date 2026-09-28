import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useMissionStore } from '../../store/missionStore';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sliders, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Folder, 
  ChevronsRight, 
  HelpCircle, 
  BarChart2, 
  FlaskConical, 
  Activity, 
  Database, 
  Zap, 
  Layers, 
  Cpu, 
  FileText, 
  Info,
  User,
  Clock,
  Calendar,
  X,
  Square,
  Radio,
  WifiOff,
  ShieldCheck,
  Disc,
  Play
} from 'lucide-react';
import { voiceInputEngine, voiceOutputEngine, VoiceInputState } from '../../services/audioService';
import { localStorageService, OfflineSelfTestResult } from '../../services/localStorageService';
import { connectionManager } from '../../services/connectionManager';

export const MissionAssistantPanel: React.FC = () => {
  const { 
    activeProtocol, 
    currentStepIndex, 
    validationResult, 
    hoiInteraction, 
    actionConfidence, 
    currentActionName, 
    humanReadableActionName, 
    isVoiceGuidanceEnabled, 
    toggleVoiceGuidance, 
    isAudioMuted, 
    toggleAudioMute, 
    stopSpeaking,
    chatMessages, 
    sendChatMessage, 
    isAiThinking, 
    voiceAssistantState,
    telemetry,
    realJointAngles,
    connectionState,
    runSuccessfulDemo,
    runOutOfSequenceDemo,
    runSkippedStepDemo
  } = useMissionStore();

  const [inputQuery, setInputQuery] = useState('');
  const [micState, setMicState] = useState<VoiceInputState>('READY');
  const [micTranscript, setMicTranscript] = useState('');
  const [micErrorMessage, setMicErrorMessage] = useState<string | null>(null);
  const [volumeLevel, setVolumeLevel] = useState<number>(Math.round(voiceOutputEngine.getVolume() * 100));
  const [activeSpeakingMsgId, setActiveSpeakingMsgId] = useState<string | null>(null);
  const [selfTestResult, setSelfTestResult] = useState<OfflineSelfTestResult | null>(null);
  const [isRunningSelfTest, setIsRunningSelfTest] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [showKnowledgeModal, setShowKnowledgeModal] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(3076); // ~51 mins

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const currentStep = activeProtocol.steps[currentStepIndex];
  const nextStep = activeProtocol.steps[currentStepIndex + 1];

  const isSpeakingNow = voiceAssistantState === 'SPEAKING' || !!activeSpeakingMsgId;

  // Auto-scroll chat to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiThinking]);

  // Stop speaking handler
  const handleStopSpeaking = useCallback(() => {
    stopSpeaking();
    voiceOutputEngine.stopSpeaking();
    setActiveSpeakingMsgId(null);
  }, [stopSpeaking]);

  // Global Keyboard Shortcuts (Escape to stop speaking, Ctrl+/ to focus input)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleStopSpeaking();
        if (micState === 'LISTENING') {
          voiceInputEngine.stopListening();
          setMicState('READY');
        }
      } else if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      handleStopSpeaking();
    };
  }, [handleStopSpeaking, micState]);

  // Elapsed Mission Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatElapsedTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle TTS Volume change
  const handleVolumeChange = (newVol: number) => {
    setVolumeLevel(newVol);
    voiceOutputEngine.setVolume(newVol / 100);
  };

  // Submit Text Message
  const handleSendMessage = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const query = (customQuery || inputQuery).trim();
    if (!query) return;

    // Interrupt prior speech when sending new message
    handleStopSpeaking();

    setInputQuery('');
    setMicTranscript('');
    setMicErrorMessage(null);
    await sendChatMessage(query, false);
  };

  // Read response text aloud via offline TTS
  const handleReadResponse = (text: string, msgId?: string) => {
    if (activeSpeakingMsgId === msgId) {
      handleStopSpeaking();
      return;
    }
    
    handleStopSpeaking();
    if (msgId) setActiveSpeakingMsgId(msgId);
    voiceOutputEngine.speakGuidance(text, true, 0, () => {
      setActiveSpeakingMsgId(null);
    });
  };

  // Read latest assistant response
  const handleReadLatestAssistantMessage = () => {
    if (isSpeakingNow) {
      handleStopSpeaking();
      return;
    }
    const lastAiMsg = [...chatMessages].reverse().find(m => m.sender === 'MISSION_AI');
    if (lastAiMsg) {
      handleReadResponse(lastAiMsg.text, lastAiMsg.id);
    }
  };

  // Toggle Microphone Voice Input (STT)
  const handleToggleMic = () => {
    if (micState === 'LISTENING') {
      voiceInputEngine.stopListening();
      setMicState('READY');
    } else {
      handleStopSpeaking();
      setMicErrorMessage(null);
      setMicTranscript('');
      
      const started = voiceInputEngine.startListening(
        (transcript, isFinal) => {
          setMicTranscript(transcript);
          setInputQuery(transcript);
          if (isFinal && transcript.trim()) {
            sendChatMessage(transcript.trim(), true);
            setMicTranscript('');
            setInputQuery('');
          }
        },
        (state) => {
          setMicState(state);
        },
        (err) => {
          setMicErrorMessage(err);
          setMicState('ERROR');
        }
      );

      if (!started) {
        setMicState('UNAVAILABLE');
      }
    }
  };

  // Run Self-Test
  const handleRunSelfTest = () => {
    setIsRunningSelfTest(true);
    setSelfTestResult(null);
    setTimeout(() => {
      const res = localStorageService.runOfflineSelfTest();
      setSelfTestResult(res);
      setIsRunningSelfTest(false);
    }, 400);
  };

  const isOnlineMode = connectionState === 'ONLINE';

  // 6 Quick Question Cards (Top Row)
  const topQuestionCards = [
    {
      icon: Folder,
      iconColor: 'text-blue-600 dark:text-cyan-400',
      tag: 'Current Step',
      title: currentStep?.title || 'Collect Sample',
      sub: 'What is the current step?',
      query: 'What is the current step?',
      highlight: true
    },
    {
      icon: ChevronsRight,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      tag: 'What happens next?',
      title: nextStep?.title || 'Clean Sample Area',
      sub: 'What should I do next?',
      query: 'What should I do next?'
    },
    {
      icon: HelpCircle,
      iconColor: 'text-teal-600 dark:text-teal-400',
      tag: 'Anomaly Analysis',
      title: validationResult?.validationState === 'CORRECT' ? 'Nominal Alignment' : 'Analyze Step Deviation',
      sub: 'Why was the step flagged?',
      query: 'Why was the step flagged?'
    },
    {
      icon: BarChart2,
      iconColor: 'text-blue-600 dark:text-blue-400',
      tag: 'Edge Telemetry',
      title: `${telemetry.edgeLatencyMs.toFixed(1)}ms • ${telemetry.bandwidthSavingsPercent}% Save`,
      sub: 'What is the telemetry status?',
      query: 'What is the edge latency and telemetry bandwidth?'
    },
    {
      icon: Cpu,
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      tag: 'System Health',
      title: 'Air-Gapped • 42.4°C',
      sub: 'Show hardware diagnostics',
      query: 'Show system status and hardware diagnostics'
    },
    {
      icon: Activity,
      iconColor: 'text-sky-600 dark:text-sky-400',
      tag: '3D Digital Twin',
      title: `Elbow ${realJointAngles.rightElbow.toFixed(0)}° • 60 FPS`,
      sub: 'Astronaut joint angles',
      query: 'What are the astronaut joint angles and 3D digital twin state?'
    }
  ];

  // Try Asking suggestions inside workspace
  const tryAskingPills = [
    'What is the current step?',
    'What should I do next?',
    'Why was the step flagged?',
    'Show telemetry & latency',
    'Show system diagnostics',
    'What are the joint angles?',
    'Explain this experiment protocol',
    'Summarize mission progress'
  ];

  // Quick Action List Items (Right Panel)
  const quickActionItems = [
    { label: 'What is the current step & expected action?', icon: User, query: 'What is the current step?' },
    { label: 'What should I do next in protocol?', icon: ChevronsRight, query: 'What should I do next?' },
    { label: 'Why was this step flagged / verified?', icon: HelpCircle, query: 'Why was this step flagged?' },
    { label: 'Explain experiment scientific SOP', icon: FileText, query: 'Explain this experiment protocol' },
    { label: 'What are astronaut joint angles & posture?', icon: Activity, query: 'What are the astronaut joint angles and 3D digital twin state?' },
    { label: 'Show edge telemetry & bandwidth reduction', icon: BarChart2, query: 'What is the edge latency and telemetry bandwidth?' },
    { label: 'Check hardware thermals & NVMe SMART', icon: Cpu, query: 'Show system status and hardware diagnostics' }
  ];

  return (
    <div className="space-y-5 select-none">
      
      {/* 1. Page Header Bar & Knowledge Base Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Title & Subtitle */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-cyan-400 shrink-0 shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Mission Assistant
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                100% Offline Standalone Local AI
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
              On-board reasoning engine grounded in live telemetry, MoveNet biomechanics, sequence validation, and offline SOP flight documents.
            </p>
          </div>
        </div>

        {/* Right: Controls Bar (Auto-Read Toggle, Stop Speaking Button, Knowledge Base Modal) */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Active Speaking Indicator & Prominent STOP Button */}
          {isSpeakingNow && (
            <button
              onClick={handleStopSpeaking}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm animate-pulse transition shrink-0"
              title="Stop speech playback immediately (or press Esc)"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>STOP SPEAKING (Esc)</span>
            </button>
          )}

          {/* Auto-Read Toggle */}
          <button
            onClick={toggleVoiceGuidance}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition shadow-xs ${
              isVoiceGuidanceEnabled
                ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-cyan-300'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
            }`}
            title="Toggle automatic speech reading of assistant responses"
          >
            {isVoiceGuidanceEnabled ? <Volume2 className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>Auto-Read: {isVoiceGuidanceEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Local Knowledge Base Pill Card */}
          <div 
            onClick={() => setShowKnowledgeModal(true)}
            className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 hover:border-blue-400 dark:hover:border-blue-600 rounded-xl px-3 py-1.5 shadow-xs flex items-center gap-2 cursor-pointer transition group shrink-0"
          >
            <Database className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition">
              Offline Knowledge Base
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition" />
          </div>
        </div>

      </div>

      {/* 2. Top Row: 6 Compact Quick Action Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {topQuestionCards.map((card, idx) => {
          const IconComp = card.icon;
          return (
            <div
              key={idx}
              onClick={() => handleSendMessage(undefined, card.query)}
              className={`p-3.5 rounded-xl border transition cursor-pointer text-left flex flex-col justify-between group shadow-xs ${
                card.highlight
                  ? 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700/80 ring-1 ring-blue-500/20'
                  : 'bg-white dark:bg-[#0D1527] border-slate-200/90 dark:border-slate-800/90 hover:border-blue-300 dark:hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <IconComp className={`w-3.5 h-3.5 ${card.iconColor}`} />
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                    {card.tag}
                  </span>
                </div>
                <div className="font-bold text-xs text-slate-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition line-clamp-1">
                  {card.title}
                </div>
              </div>
              <div className="text-[9.5px] text-slate-400 mt-2 truncate">
                {card.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Main Operational Grid: AI Workspace (70%) + Context & Actions Panel (30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left / Primary Column (8 of 12 cols = ~67-70%) */}
        <div className="lg:col-span-8 space-y-4">
          
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-4 sm:p-5 shadow-xs space-y-4 flex flex-col justify-between min-h-[580px]">
            
            {/* Main Assistant Card Header */}
            <div className="flex flex-wrap items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
              <div className="flex items-center gap-2.5">
                <Bot className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  VYOM DRISHTI Mission Assistant
                </span>
                
                {/* Mode Tag */}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  AIR-GAPPED
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-md border border-blue-100 dark:border-blue-900/60">
                  Grounding: Live Telemetry & Biomechanics
                </span>
                <button 
                  onClick={() => setShowDebugPanel(!showDebugPanel)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
                  title="Toggle subsystem diagnostics"
                >
                  {showDebugPanel ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Diagnostic Drawer (Collapsible) */}
            {showDebugPanel && (
              <div className="p-3 rounded-lg bg-slate-900 border border-blue-900/80 text-xs text-slate-300 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 text-[11px] font-bold text-cyan-400">
                  <div className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" />
                    <span>ON-BOARD AI SUBSYSTEM DIAGNOSTICS</span>
                  </div>
                  <button onClick={() => setShowDebugPanel(false)} className="text-slate-400 hover:text-white">✕</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <div className="text-slate-500 uppercase font-mono">Engine</div>
                    <div className="font-bold text-emerald-400 mt-0.5">100% Offline Local AI</div>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <div className="text-slate-500 uppercase font-mono">STT Engine</div>
                    <div className="font-bold text-emerald-400 mt-0.5">{connectionManager.isOnline() ? 'Web Speech API' : 'Fallback Ready'}</div>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <div className="text-slate-500 uppercase font-mono">TTS Engine</div>
                    <div className="font-bold text-emerald-400 mt-0.5">Local Synthesis (Offline)</div>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-slate-500 uppercase font-mono">Self-Test</div>
                      <div className="font-bold text-white mt-0.5">Full Audit</div>
                    </div>
                    <button 
                      onClick={handleRunSelfTest} 
                      disabled={isRunningSelfTest}
                      className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold hover:bg-blue-500 transition"
                    >
                      {isRunningSelfTest ? '...' : 'Run'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Conversation Viewport */}
            <div className="flex-1 overflow-y-auto space-y-4 max-h-[380px] pr-1">
              
              {/* Initial Standalone Callout Greeting */}
              <div className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-2xl p-4 sm:p-5 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-3.5 shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="font-bold text-xs text-slate-900 dark:text-white">
                    VYOM DRISHTI Mission Assistant initialized. Operating in 100% Offline Standalone Mode.
                  </div>
                  <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    I am connected to the live MoveNet biomechanics stream, spatial HOI vectors, edge telemetry pipeline, and on-board experiment SOPs. Ask any operational question.
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono pt-0.5">
                    <span>Active Protocol: {activeProtocol.code}</span>
                    <span>•</span>
                    <span>Step {currentStepIndex + 1}/{activeProtocol.steps.length}: {currentStep?.expectedAction}</span>
                  </div>
                </div>
              </div>

              {/* Suggestions Row: Try Asking */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Try asking:
                </div>
                <div className="flex flex-wrap gap-2">
                  {tryAskingPills.map((pill, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(undefined, pill)}
                      className="px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950 hover:border-blue-300 dark:hover:border-blue-700 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 transition shadow-xs"
                    >
                      {pill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Conversation History */}
              {chatMessages.map((msg) => {
                const isUser = msg.sender === 'USER';
                const isThisMsgSpeaking = activeSpeakingMsgId === msg.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} pt-2`}
                  >
                    <div
                      className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed shadow-xs ${
                        isUser
                          ? 'bg-blue-600 text-white rounded-tr-none font-medium'
                          : 'bg-slate-50/90 dark:bg-[#070B19] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none space-y-2'
                      }`}
                    >
                      {/* Assistant Header & Source Badge */}
                      {!isUser && (
                        <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-slate-800 pb-1.5 text-[10px]">
                          <div className="flex items-center gap-1.5 text-blue-600 dark:text-cyan-400 font-bold">
                            <Bot className="w-3.5 h-3.5" />
                            <span>MISSION ASSISTANT</span>
                          </div>
                          
                          {msg.source && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono">
                              SOURCE: {msg.source} {msg.provenanceLabel ? `[${msg.provenanceLabel}]` : ''}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Text Content */}
                      <div className="whitespace-pre-wrap font-sans text-xs text-slate-800 dark:text-slate-100">
                        {msg.text}
                      </div>

                      {/* Assistant Footer with Read/Stop Response Button */}
                      {!isUser && (
                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/80 text-[10px] text-slate-500 dark:text-slate-400">
                          <span className="font-mono">{msg.timestamp}</span>
                          <button
                            onClick={() => handleReadResponse(msg.text, msg.id)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-medium transition ${
                              isThisMsgSpeaking
                                ? 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700 animate-pulse'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                            }`}
                            title={isThisMsgSpeaking ? 'Stop speech playback' : 'Read this response aloud'}
                          >
                            {isThisMsgSpeaking ? (
                              <>
                                <Square className="w-3 h-3 fill-current" />
                                <span>Stop Speaking</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3 h-3" />
                                <span>Read Aloud</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {isUser && (
                      <span className="text-[10px] text-slate-400 mt-1 px-1 font-mono">
                        {msg.timestamp}
                      </span>
                    )}
                  </div>
                );
              })}

              {/* Thinking State */}
              {isAiThinking && (
                <div className="flex flex-col items-start pt-2">
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-blue-800 text-blue-300 text-xs flex items-center gap-3 shadow-sm">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                    <div>
                      <div className="font-semibold text-white">Analyzing query against live telemetry...</div>
                      <div className="text-[10px] text-slate-400">Querying MoveNet Keypoints, Biomechanical Posture & Offline SOPs</div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Microphone Listening Status Banner */}
            {micState === 'LISTENING' && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-200 text-xs flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span className="font-bold">Listening for astronaut voice command...</span>
                </div>
                {micTranscript && <span className="italic">"{micTranscript}"</span>}
              </div>
            )}

            {/* Speaking Status Banner */}
            {isSpeakingNow && (
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-cyan-200 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                  <span className="font-semibold">Voice audio playback active (Offline TTS)</span>
                </div>
                <button
                  type="button"
                  onClick={handleStopSpeaking}
                  className="px-2.5 py-0.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] flex items-center gap-1 transition"
                >
                  <Square className="w-2.5 h-2.5 fill-current" />
                  <span>Interrupt / Stop (Esc)</span>
                </button>
              </div>
            )}

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              
              <div className="flex items-center gap-2">
                
                {/* [Speak] Button */}
                <button
                  type="button"
                  onClick={handleToggleMic}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition shadow-xs shrink-0 ${
                    micState === 'LISTENING'
                      ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-600 animate-pulse'
                      : 'bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800'
                  }`}
                  title={micState === 'LISTENING' ? 'Stop listening' : 'Start voice input (Speech to Text)'}
                >
                  {micState === 'LISTENING' ? <MicOff className="w-3.5 h-3.5 text-white" /> : <Mic className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />}
                  <span>{micState === 'LISTENING' ? 'Stop' : 'Speak'}</span>
                </button>

                {/* Input Text Box */}
                <input
                  ref={inputRef}
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Ask about the step, telemetry, diagnostics, digital twin, or SOP..."
                  className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                />

                {/* [Send] Button */}
                <button
                  type="submit"
                  disabled={!inputQuery.trim() || isAiThinking}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-xs disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>

                {/* [Read / Stop Response] Button */}
                <button
                  type="button"
                  onClick={handleReadLatestAssistantMessage}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition shadow-xs shrink-0 ${
                    isSpeakingNow
                      ? 'bg-rose-50 dark:bg-rose-950 border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300'
                      : 'bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800'
                  }`}
                  title={isSpeakingNow ? 'Stop speech playback' : 'Read latest response aloud'}
                >
                  {isSpeakingNow ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current text-rose-600" />
                      <span className="hidden sm:inline">Stop Audio</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                      <span className="hidden sm:inline">Read Response</span>
                    </>
                  )}
                </button>

              </div>

              {/* Sub-bar: Volume Slider & Offline Demo Actions */}
              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 gap-3">
                <div className="flex items-center gap-2">
                  <button 
                    type="button"
                    onClick={toggleAudioMute}
                    className="p-1 rounded text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                    title={isAudioMuted ? 'Unmute audio' : 'Mute audio'}
                  >
                    {isAudioMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                  <span>Volume:</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isAudioMuted ? 0 : volumeLevel}
                    onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                    className="w-20 accent-blue-600"
                  />
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{isAudioMuted ? 'MUTED' : `${volumeLevel}%`}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span>Simulate Mission Events:</span>
                  <button
                    type="button"
                    onClick={runSuccessfulDemo}
                    className="px-2.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] transition"
                  >
                    1. Nominal Flow
                  </button>
                  <button
                    type="button"
                    onClick={runOutOfSequenceDemo}
                    className="px-2.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-bold text-[10px] transition"
                  >
                    2. Sequence Deviation
                  </button>
                  <button
                    type="button"
                    onClick={runSkippedStepDemo}
                    className="px-2.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-bold text-[10px] transition"
                  >
                    3. Skipped Step
                  </button>
                </div>
              </div>

            </form>

          </div>

        </div>

        {/* Right Column (4 of 12 cols = ~30-33%) */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Card 1: Context Information & Live Grounding */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-4 sm:p-5 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5 text-xs font-bold text-slate-900 dark:text-white">
              <Layers className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              <span>Live Mission Context</span>
            </div>

            <div className="space-y-3 text-xs">
              
              {/* Experiment */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 shrink-0">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Experiment</span>
                </div>
                <div className="font-semibold text-slate-900 dark:text-white text-right line-clamp-2">
                  {activeProtocol.name}
                </div>
              </div>

              {/* Protocol Code */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 shrink-0">
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                  <span>Protocol Code</span>
                </div>
                <div className="font-mono font-bold text-blue-600 dark:text-cyan-400">
                  {activeProtocol.code}
                </div>
              </div>

              {/* Current Step */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 shrink-0">
                  <Folder className="w-3.5 h-3.5 text-slate-400" />
                  <span>Current Step</span>
                </div>
                <div className="font-semibold text-slate-900 dark:text-white text-right">
                  {currentStepIndex + 1} / {activeProtocol.steps.length} {currentStep?.title || 'Collect Sample'}
                </div>
              </div>

              {/* MoveNet Confidence */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 shrink-0">
                  <Activity className="w-3.5 h-3.5 text-slate-400" />
                  <span>AI Detection</span>
                </div>
                <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {(actionConfidence * 100).toFixed(1)}% ({currentActionName})
                </div>
              </div>

              {/* HOI Target Object */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 shrink-0">
                  <Disc className="w-3.5 h-3.5 text-slate-400" />
                  <span>HOI Target</span>
                </div>
                <div className="font-mono text-xs text-slate-800 dark:text-slate-200">
                  {hoiInteraction?.targetObject || 'Biological-Sample-Vial-A'}
                </div>
              </div>

              {/* Edge Telemetry */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 shrink-0">
                  <Radio className="w-3.5 h-3.5 text-slate-400" />
                  <span>Edge Latency</span>
                </div>
                <div className="font-mono font-bold text-slate-900 dark:text-white">
                  {telemetry.edgeLatencyMs.toFixed(1)} ms ({telemetry.edgeFps.toFixed(1)} FPS)
                </div>
              </div>

              {/* Elapsed Time */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 shrink-0">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Elapsed Time</span>
                </div>
                <div className="font-mono font-bold text-blue-600 dark:text-cyan-400">
                  {formatElapsedTime(elapsedSeconds)}
                </div>
              </div>

              {/* Mode */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 shrink-0">
                  <Cpu className="w-3.5 h-3.5 text-slate-400" />
                  <span>AI Engine</span>
                </div>
                <div className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                  100% Offline Standalone
                </div>
              </div>

            </div>
          </div>

          {/* Card 2: Quick Actions */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5 text-xs font-bold text-slate-900 dark:text-white">
              <Zap className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              <span>Operational Questions</span>
            </div>

            <div className="space-y-1.5">
              {quickActionItems.map((qa, i) => {
                const QIcon = qa.icon;
                return (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(undefined, qa.query)}
                    className="w-full p-2.5 rounded-lg border border-slate-200/70 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 bg-slate-50/40 dark:bg-slate-900/40 hover:bg-blue-50/50 dark:hover:bg-blue-950/40 flex items-center justify-between text-left transition group shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <QIcon className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition truncate">
                        {qa.label}
                      </span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition shrink-0 ml-1" />
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* 4. Local Knowledge Base Modal (When Clicked) */}
      {showKnowledgeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-cyan-400">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Offline Local Knowledge Base</h3>
                  <p className="text-[11px] text-slate-400">Deterministic On-board Flight Documents & Verified SOPs</p>
                </div>
              </div>
              <button 
                onClick={() => setShowKnowledgeModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <div className="font-bold text-slate-900 dark:text-white">1. System Architecture Documentation</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Complete specifications for MoveNet edge keypoint estimation, microgravity biomechanics kinematics, and air-gapped sync pipelines.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <div className="font-bold text-slate-900 dark:text-white">2. Experiment Standard Operating Procedures (SOPs)</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Step-by-step verified protocols for PCG-01, Gaganyaan HAR-01, Cell Culture Fixation-02, and Fluid Dynamics-01.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <div className="font-bold text-slate-900 dark:text-white">3. On-Board Safety & Emergency Guidelines</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  ISRO / BAS safety protocols, out-of-sequence recovery actions, contamination containment, and telemetry anomaly matrices.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowKnowledgeModal(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
