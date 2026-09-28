import React, { useState } from 'react';
import { useMissionStore } from '../../store/missionStore';
import { Bot, Send, Mic, MicOff, MessageSquare, Volume2, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';
import { voiceInputEngine, voiceOutputEngine, VoiceInputState } from '../../services/audioService';

export const CompactAssistantCard: React.FC = () => {
  const { 
    chatMessages, 
    sendChatMessage, 
    isAiThinking, 
    activeProtocol, 
    currentStepIndex, 
    isVoiceGuidanceEnabled, 
    toggleVoiceGuidance 
  } = useMissionStore();

  const [inputVal, setInputVal] = useState('');
  const [micState, setMicState] = useState<VoiceInputState>('READY');
  const [micError, setMicError] = useState<string | null>(null);
  const currentStep = activeProtocol.steps[currentStepIndex];

  const handleSend = (text?: string) => {
    const q = text || inputVal;
    if (!q.trim()) return;
    sendChatMessage(q);
    setInputVal('');
    setMicError(null);
  };

  const quickPrompts = [
    { label: 'Current Step', q: 'What is the current step?' },
    { label: 'Next Step', q: 'What should I do next?' },
    { label: 'Why Flagged?', q: 'Why did the previous step fail?' },
    { label: 'Show Progress', q: 'Show experiment progress' }
  ];

  const handleVoiceToggle = () => {
    if (micState === 'LISTENING') {
      voiceInputEngine.stopListening();
      setMicState('READY');
    } else {
      setMicError(null);
      const started = voiceInputEngine.startListening(
        (transcript, isFinal) => {
          setInputVal(transcript);
          if (isFinal && transcript.trim()) {
            sendChatMessage(transcript.trim(), true);
            setInputVal('');
          }
        },
        (state) => setMicState(state),
        (err) => setMicError(err)
      );

      if (!started) {
        setMicState('UNAVAILABLE');
      }
    }
  };

  const lastAiMessage = [...chatMessages].reverse().find(m => m.sender === 'MISSION_AI');

  const handleSpeakLatest = () => {
    if (lastAiMessage) {
      voiceOutputEngine.speakGuidance(lastAiMessage.text, true);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm select-none flex flex-col justify-between space-y-3">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-white text-xs block">
              Mission Assistant
            </span>
            <span className="text-[10px] text-slate-400 block">
              Local Offline AI • Zero Cloud
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleSpeakLatest}
            className="p-1.5 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition"
            title="Read Response (Speaker)"
          >
            <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
          </button>

          <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Local Active</span>
          </span>
        </div>
      </div>

      {/* Main AI Bubble */}
      <div className="py-1 flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
          <Bot className="w-4 h-4" />
        </div>

        <div className="flex-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl rounded-tl-none p-3 relative">
          
          {lastAiMessage?.source && (
            <div className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
              SOURCE: {lastAiMessage.source}
            </div>
          )}

          <p className="text-xs text-slate-800 dark:text-slate-100 leading-relaxed font-normal whitespace-pre-wrap">
            {lastAiMessage
              ? lastAiMessage.text
              : `Current step: ${currentStep?.title || 'Collect Sample'}.\n\nThe astronaut is currently performing the ${currentStep?.expectedAction?.toLowerCase() || 'sample collection'} procedure.`}
          </p>

          <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mt-1.5 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5" /> 100% On-Device Reasoning
            </span>
            <span>{lastAiMessage?.timestamp || 'T+00:00:00'}</span>
          </div>
        </div>
      </div>

      {/* Thinking State */}
      {isAiThinking && (
        <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Processing locally...</span>
        </div>
      )}

      {/* Mic Error Banner */}
      {micError && (
        <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-[11px]">
          {micError}
        </div>
      )}

      {/* 4 Standard Human Quick Prompts */}
      <div className="grid grid-cols-2 gap-1.5">
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p.q)}
            className="px-2.5 py-1.5 rounded-xl text-[10px] font-medium bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700/80 transition flex items-center gap-1 text-left truncate"
          >
            <MessageSquare className="w-2.5 h-2.5 opacity-60 shrink-0" />
            <span className="truncate">{p.label}</span>
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about procedure, safety, or next steps..."
          className="flex-1 bg-slate-50 dark:bg-slate-800 text-xs px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-800 dark:text-slate-100"
        />

        {/* Microphone Button */}
        <button
          type="button"
          onClick={handleVoiceToggle}
          className={`p-2 rounded-xl border transition ${
            micState === 'LISTENING'
              ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
          }`}
          title="Speak Question (Microphone)"
        >
          {micState === 'LISTENING' ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
        </button>

        {/* Send Button */}
        <button
          type="button"
          onClick={() => handleSend()}
          className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 transition"
          title="Send message"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
