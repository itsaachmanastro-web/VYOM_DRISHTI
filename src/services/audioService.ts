/**
 * VYOM DRISHTI AI — Dual Voice Engine Architecture
 * Completely separates Speech-to-Text (Microphone) and Text-to-Speech (Speaker)
 * Real Honest Capability Detection without Fake Offline Claims
 */

import { connectionManager } from './connectionManager';

export type VoiceInputState = 'READY' | 'LISTENING' | 'PROCESSING' | 'COMPLETED' | 'UNAVAILABLE' | 'ERROR';
export type VoiceOutputState = 'IDLE' | 'SPEAKING' | 'MUTED' | 'ERROR';
export type VoiceCapability = 'VOICE_ONLINE' | 'VOICE_LOCAL' | 'VOICE_UNAVAILABLE';

/**
 * 1. Voice Input Engine (Microphone / STT)
 */
export class VoiceInputEngine {
  private recognition: any = null;
  private isListening: boolean = false;
  private state: VoiceInputState = 'READY';

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionClass) {
      try {
        this.recognition = new SpeechRecognitionClass();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        this.state = 'READY';
      } catch (e) {
        console.warn('SpeechRecognition initialization error:', e);
        this.state = 'UNAVAILABLE';
      }
    } else {
      this.state = 'UNAVAILABLE';
    }
  }

  public getCapability(): VoiceCapability {
    if (!this.recognition) return 'VOICE_UNAVAILABLE';
    return connectionManager.isOnline() ? 'VOICE_ONLINE' : 'VOICE_UNAVAILABLE';
  }

  public isAvailable(): boolean {
    return !!this.recognition;
  }

  public getState(): VoiceInputState {
    return this.state;
  }

  public startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onStateChange: (state: VoiceInputState) => void,
    onError: (errMsg: string) => void
  ): boolean {
    if (!this.recognition) {
      this.initRecognition();
    }

    if (!this.recognition) {
      this.state = 'UNAVAILABLE';
      onStateChange('UNAVAILABLE');
      onError('Microphone speech recognition is not supported in this browser.');
      return false;
    }

    // Check actual connectivity honestly
    if (!connectionManager.isOnline()) {
      this.state = 'UNAVAILABLE';
      onStateChange('UNAVAILABLE');
      onError('Browser speech recognition requires an internet connection. Text Mission AI and Local Voice Output remain 100% active offline.');
      return false;
    }

    try {
      this.recognition.onstart = () => {
        this.isListening = true;
        this.state = 'LISTENING';
        onStateChange('LISTENING');
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          this.state = 'PROCESSING';
          onStateChange('PROCESSING');
          onResult(finalTranscript.trim(), true);
        } else if (interimTranscript) {
          onResult(interimTranscript.trim(), false);
        }
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        this.state = 'ERROR';
        onStateChange('ERROR');

        let msg = `Microphone error: ${event.error}`;
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          msg = 'Microphone access is blocked. Please allow microphone access in your browser.';
        } else if (event.error === 'no-speech') {
          msg = 'No speech was detected. Please try speaking again.';
        } else if (event.error === 'network') {
          msg = 'Browser speech recognition requires an internet connection. Text Mission AI remains 100% active offline.';
        }
        onError(msg);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.state = 'COMPLETED';
        onStateChange('COMPLETED');
        setTimeout(() => {
          this.state = 'READY';
          onStateChange('READY');
        }, 400);
      };

      this.recognition.start();
      return true;
    } catch (e: any) {
      this.isListening = false;
      this.state = 'ERROR';
      onStateChange('ERROR');
      onError(e.message || 'Microphone access is unavailable.');
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Safe ignore
      }
      this.isListening = false;
      this.state = 'READY';
    }
  }
}

/**
 * 2. Offline Voice Output Engine (Speaker / TTS)
 * Powered by local OS SpeechSynthesis (100% Offline)
 */
export class LocalVoiceOutputEngine {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private voiceEnabled: boolean = true;
  private volume: number = 0.9;
  private voiceRate: number = 1.0;
  private voicePitch: number = 1.0;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private lastSpokenText: string = '';
  private lastSpokenTimestamp: number = 0;
  private state: VoiceOutputState = 'IDLE';

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.initVoice();
      };
      this.initVoice();
    }
  }

  private initVoice() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => 
      (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('David') || v.name.includes('Mark')) && 
      v.lang.startsWith('en')
    ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
    
    if (preferred) {
      this.selectedVoice = preferred;
    }
  }

  private initAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public getCapability(): 'LOCAL_TTS_ACTIVE' | 'TTS_UNAVAILABLE' {
    return typeof window !== 'undefined' && 'speechSynthesis' in window ? 'LOCAL_TTS_ACTIVE' : 'TTS_UNAVAILABLE';
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopSpeaking();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVoiceEnabled(enabled: boolean) {
    this.voiceEnabled = enabled;
    if (!enabled) {
      this.stopSpeaking();
    }
  }

  public getVoiceEnabled(): boolean {
    return this.voiceEnabled;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.volume;
  }

  public getLastSpokenText(): string {
    return this.lastSpokenText;
  }

  public isSpeaking(): boolean {
    return this.state === 'SPEAKING';
  }

  public speakGuidance(text: string, force: boolean = false, cooldownMs: number = 3000, onEnd?: () => void) {
    if ((this.isMuted || !this.voiceEnabled) && !force) {
      if (onEnd) onEnd();
      return;
    }
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    const now = Date.now();
    if (!force && this.lastSpokenText === text && now - this.lastSpokenTimestamp < cooldownMs) {
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Cancel any existing speech

      const utterance = new SpeechSynthesisUtterance(text);
      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }
      utterance.rate = this.voiceRate;
      utterance.pitch = this.voicePitch;
      utterance.volume = this.isMuted ? 0 : this.volume;

      this.state = 'SPEAKING';
      this.lastSpokenText = text;
      this.lastSpokenTimestamp = now;

      let hasFinished = false;
      const finish = () => {
        if (!hasFinished) {
          hasFinished = true;
          this.state = 'IDLE';
          if (onEnd) onEnd();
        }
      };

      utterance.onend = finish;
      utterance.onerror = finish;

      // Watchdog timer to ensure state transitions even if browser fails to fire onend
      const estimatedDurationMs = Math.max(1500, (text.split(/\s+/).length / 2.5) * 1000 + 1000);
      setTimeout(finish, estimatedDurationMs);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
      this.state = 'IDLE';
      if (onEnd) onEnd();
    }
  }

  public stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.state = 'IDLE';
    }
  }

  // --- Web Audio Avionics Tones ---

  public playAvionicsChirp() {
    if (this.isMuted) return;
    try {
      this.initAudioContext();
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1400, this.audioCtx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.06 * this.volume, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.09);
    } catch (e) {
      console.warn('Audio tone error', e);
    }
  }

  public playSuccessTone() {
    if (this.isMuted) return;
    try {
      this.initAudioContext();
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;
      const freqs = [523.25, 659.25, 783.99];
      freqs.forEach((freq, idx) => {
        const osc = this.audioCtx!.createOscillator();
        const gain = this.audioCtx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);
        gain.gain.setValueAtTime(0.08 * this.volume, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.25);
        osc.connect(gain);
        gain.connect(this.audioCtx!.destination);
        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.26);
      });
    } catch (e) {
      console.warn('Success tone error', e);
    }
  }

  public playWarningTone() {
    if (this.isMuted) return;
    try {
      this.initAudioContext();
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;
      [0, 0.15].forEach(delay => {
        const osc = this.audioCtx!.createOscillator();
        const gain = this.audioCtx!.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(660, now + delay);
        osc.frequency.setValueAtTime(880, now + delay + 0.05);
        gain.gain.setValueAtTime(0.07 * this.volume, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.1);
        osc.connect(gain);
        gain.connect(this.audioCtx!.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.11);
      });
    } catch (e) {
      console.warn('Warning tone error', e);
    }
  }

  public playCriticalAlarm() {
    if (this.isMuted) return;
    try {
      this.initAudioContext();
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;
      [0, 0.18, 0.36].forEach(delay => {
        const osc = this.audioCtx!.createOscillator();
        const gain = this.audioCtx!.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(1050, now + delay);
        osc.frequency.linearRampToValueAtTime(750, now + delay + 0.12);
        gain.gain.setValueAtTime(0.09 * this.volume, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.14);
        osc.connect(gain);
        gain.connect(this.audioCtx!.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.15);
      });
    } catch (e) {
      console.warn('Alarm error', e);
    }
  }
}

export const voiceInputEngine = new VoiceInputEngine();
export const voiceOutputEngine = new LocalVoiceOutputEngine();
export const audioService = voiceOutputEngine;
