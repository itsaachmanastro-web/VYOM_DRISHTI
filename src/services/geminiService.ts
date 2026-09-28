import { MissionAiContext, MissionAiService } from './missionAiService';

export interface GeminiConfig {
  apiKey: string;
  model: string;
  status: 'NOT_CONFIGURED' | 'TESTING' | 'CONNECTED' | 'ERROR';
  lastTestedAt?: string;
  errorMessage?: string;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  latencyMs?: number;
  modelUsed?: string;
  errorType?: 'INVALID_KEY' | 'QUOTA' | 'MODEL_UNAVAILABLE' | 'NETWORK' | 'UNKNOWN';
}

const STORAGE_KEY = 'vyom_gemini_config';
const DEFAULT_MODEL = 'gemini-1.5-flash';

export class GeminiService {
  private config: GeminiConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): GeminiConfig {
    if (typeof window === 'undefined') {
      return {
        apiKey: '',
        model: DEFAULT_MODEL,
        status: 'NOT_CONFIGURED'
      };
    }

    // 1. Check local storage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.apiKey) {
          return {
            apiKey: parsed.apiKey,
            model: parsed.model || DEFAULT_MODEL,
            status: parsed.status || 'CONNECTED',
            lastTestedAt: parsed.lastTestedAt
          };
        }
      }
    } catch (e) {
      console.warn('Failed to read Gemini config from localStorage:', e);
    }

    // 2. Check environment variable (if set in Vite env)
    const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
    if (envKey) {
      return {
        apiKey: envKey,
        model: (import.meta as any).env?.VITE_GEMINI_MODEL || DEFAULT_MODEL,
        status: 'CONNECTED'
      };
    }

    return {
      apiKey: '',
      model: DEFAULT_MODEL,
      status: 'NOT_CONFIGURED'
    };
  }

  public getConfig(): GeminiConfig {
    return { ...this.config };
  }

  public isConfigured(): boolean {
    return !!this.config.apiKey && this.config.apiKey.length > 5;
  }

  public getMaskedApiKey(): string {
    const key = this.config.apiKey;
    if (!key) return 'NO KEY SET';
    if (key.length <= 8) return '********';
    return `${key.slice(0, 4)}...${key.slice(-4)}`;
  }

  public saveConfig(apiKey: string, model: string = DEFAULT_MODEL): void {
    const trimmedKey = apiKey.trim();
    this.config = {
      apiKey: trimmedKey,
      model: model || DEFAULT_MODEL,
      status: trimmedKey ? 'CONNECTED' : 'NOT_CONFIGURED',
      lastTestedAt: trimmedKey ? new Date().toLocaleTimeString('en-GB') : undefined
    };

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
      } catch (e) {
        console.warn('Failed to save Gemini config:', e);
      }
    }
  }

  public async testConnection(apiKey: string, model: string = DEFAULT_MODEL): Promise<ConnectionTestResult> {
    const key = (apiKey || this.config.apiKey).trim();
    const selectedModel = model || this.config.model || DEFAULT_MODEL;

    if (!key) {
      return {
        success: false,
        message: 'No API key provided. Please enter a valid Gemini API key.',
        errorType: 'INVALID_KEY'
      };
    }

    const startTime = performance.now();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${key}`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: 'Ping from space station payload monitoring system VYOM DRISHTI. Reply with: "PONG: Ground and orbital link nominal."'
            }
          ]
        }
      ],
      generationConfig: {
        maxOutputTokens: 50,
        temperature: 0.1
      }
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const latencyMs = Math.round(performance.now() - startTime);

      if (response.ok) {
        const data = await response.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        this.config.status = 'CONNECTED';
        this.config.lastTestedAt = new Date().toLocaleTimeString('en-GB');
        this.config.errorMessage = undefined;
        this.saveConfig(key, selectedModel);

        return {
          success: true,
          message: `✓ Gemini connected successfully (${selectedModel}, ${latencyMs}ms)`,
          latencyMs,
          modelUsed: selectedModel
        };
      }

      // Handle specific HTTP error status codes
      const errorData = await response.json().catch(() => null);
      const errMsg = errorData?.error?.message || response.statusText;

      if (response.status === 400 || response.status === 403 || response.status === 401) {
        this.config.status = 'ERROR';
        this.config.errorMessage = 'Invalid API key or unauthorized.';
        return {
          success: false,
          message: `⚠ Invalid Gemini API Key: ${errMsg}`,
          errorType: 'INVALID_KEY'
        };
      }

      if (response.status === 404) {
        this.config.status = 'ERROR';
        this.config.errorMessage = `Model "${selectedModel}" unavailable.`;
        return {
          success: false,
          message: `⚠ Model Unavailable: "${selectedModel}" was not found or is deprecated. Try gemini-1.5-flash.`,
          errorType: 'MODEL_UNAVAILABLE'
        };
      }

      if (response.status === 429) {
        this.config.status = 'ERROR';
        this.config.errorMessage = 'Rate limit / Quota exceeded.';
        return {
          success: false,
          message: '⚠ Quota or rate limit exceeded on Gemini API.',
          errorType: 'QUOTA'
        };
      }

      this.config.status = 'ERROR';
      this.config.errorMessage = `Error (${response.status}): ${errMsg}`;
      return {
        success: false,
        message: `⚠ Gemini API Error (${response.status}): ${errMsg}`,
        errorType: 'UNKNOWN'
      };

    } catch (err: any) {
      this.config.status = 'ERROR';
      this.config.errorMessage = 'Network connection failed.';
      return {
        success: false,
        message: '⚠ Network error connecting to Gemini API. Check your internet connection.',
        errorType: 'NETWORK'
      };
    }
  }

  public async generateGroundedResponse(
    userQuery: string,
    context: MissionAiContext
  ): Promise<string> {
    const key = this.config.apiKey.trim();
    const model = this.config.model || DEFAULT_MODEL;

    // If no key configured, fallback to grounded deterministic telemetry engine
    if (!key) {
      const fallbackResponse = MissionAiService.generateResponse(userQuery, context);
      return `${fallbackResponse}\n\n[💡 Note: Connect your Gemini API Key in Settings to enable live neural reasoning.]`;
    }

    const currentStep = context.protocol.steps[context.currentStepIndex];
    const totalSteps = context.protocol.totalSteps;
    const completedSteps = context.executionRecords
      .filter(r => r.status === 'COMPLETED')
      .map(r => `Step ${r.stepNumber} (${r.title}) - Verified at ${r.endTime || 'nominal'}`)
      .join('; ') || 'None yet';

    const recentAlerts = context.alerts
      .slice(0, 3)
      .map(a => `[${a.severity}] ${a.title}: ${a.message}`)
      .join('; ') || 'No active alerts';

    const systemPrompt = `You are the VYOM DRISHTI Mission AI Assistant on-board the space station payload module (Columbus Experiment Rack).
Your task is to assist the astronaut in executing on-board biological and crystal payload procedures.

STRICT INSTRUCTIONS:
1. Answer using the provided live mission telemetry and experiment state.
2. NEVER invent or hallucinate telemetry values, detected keypoints, experiment events, or completed steps.
3. If the required information is not available in the context, clearly state: "I don't have enough mission telemetry to verify that."
4. Be concise, precise, professional, and clear for aerospace astronaut operations.
5. Provide actionable SOP guidance when the astronaut asks what to do, what failed, or what is next.

LIVE TELEMETRY & EXPERIMENT CONTEXT:
- Mission / Protocol: ${context.protocol.code} — "${context.protocol.name}"
- Payload Location: ${context.protocol.rackLocation}
- Hazard Rating: ${context.protocol.hazardLevel}
- Current Step: ${currentStep ? `Step ${currentStep.stepNumber} of ${totalSteps} ("${currentStep.title}")` : 'Protocol Finished'}
- Required Expected Action: "${currentStep?.expectedAction || 'None'}"
- Target Instrument / Object: "${currentStep?.targetObject || 'None'}"
- SOP Safety Requirement: "${currentStep?.safetyRequirement || 'None'}"
- AI MoveNet Detected Action: "${context.currentActionName}" (${(context.actionConfidence * 100).toFixed(1)}% confidence)
- Sequence Validation State: ${context.validationResult.validationState}
- Last Validation Deviation Reason: "${context.validationResult.deviationReason || 'None'}"
- Completed Steps: ${completedSteps}
- Recent Mission Alerts: ${recentAlerts}
- Edge Tracking Mode: ${context.isWebcamActive ? 'Live Edge Webcam (MoveNet WebGL)' : 'Simulated Payload Rack'}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `${systemPrompt}\n\nASTRONAUT QUERY: "${userQuery}"\n\nMISSION AI RESPONSE:`
            }
          ]
        }
      ],
      generationConfig: {
        maxOutputTokens: 350,
        temperature: 0.2,
        topP: 0.8
      }
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) {
          return text;
        }
      }

      console.warn(`Gemini API returned status ${response.status}, falling back to local deterministic engine`);
      return MissionAiService.generateResponse(userQuery, context);

    } catch (err) {
      console.warn('Gemini request failed, falling back to local deterministic engine:', err);
      return MissionAiService.generateResponse(userQuery, context);
    }
  }
}

export const geminiService = new GeminiService();
