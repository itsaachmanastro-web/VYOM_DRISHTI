import { ExperimentProtocol, ExperimentStep, StepMachineState, CompletedStepHistoryItem } from '../types/mission';

export interface ValidationConfig {
  VERIFICATION_DELAY_MS: number;        // Hold duration to confirm step (e.g. 1500ms)
  MIN_STABLE_DURATION_MS: number;       // Minimum continuous hold (e.g. 1200ms)
  CONFIDENCE_THRESHOLD: number;         // Model confidence threshold (e.g. 0.60)
  ACTION_STABILITY_PERCENT: number;     // Consensus in sliding window (e.g. 65%)
  FRAME_TOLERANCE: number;              // Tolerated noisy/missed frames without resetting
  POST_VERIFICATION_COOLDOWN_MS: number;// Grace period after verification before advancing step
  INCORRECT_TRIGGER_MS: number;         // Required duration of sustained intentional wrong action (3500ms)
  STEP_GRACE_PERIOD_MS: number;         // Initial grace period when step starts (5000ms)
}

export const DEFAULT_VALIDATION_CONFIG: ValidationConfig = {
  VERIFICATION_DELAY_MS: 1500,
  MIN_STABLE_DURATION_MS: 1200,
  CONFIDENCE_THRESHOLD: 0.60,
  ACTION_STABILITY_PERCENT: 0.65,
  FRAME_TOLERANCE: 10,
  POST_VERIFICATION_COOLDOWN_MS: 1200,
  INCORRECT_TRIGGER_MS: 3500,
  STEP_GRACE_PERIOD_MS: 5000,
};

export interface TemporalValidationUpdate {
  stepState: StepMachineState;
  smoothedAction: string;
  humanReadableAction: string;
  smoothedConfidence: number;
  countdownSec: number;
  holdProgressPct: number;
  statusMessage: string;
  instructionPrompt: string;
  shouldAdvance: boolean;
  isVerifiedLocked: boolean;
  completedTimestamp?: string;
  deviationReason?: string;
  voiceAlertText?: string;
}

interface FrameSample {
  action: string;
  confidence: number;
  timestamp: number;
}

export class TemporalValidator {
  private config: ValidationConfig;
  private currentStepNumber: number = 1;
  private stepState: StepMachineState = 'WAITING';
  private stepStartTime: number = Date.now();
  private holdStartTime: number | null = null;
  private errorStartTime: number | null = null;
  private hasWarnedForCurrentAttempt: boolean = false;
  private cooldownUntil: number | null = null;
  private toleranceRemaining: number = 10;
  private isLockedVerified: boolean = false;
  private completedTimestamp: string | null = null;

  // Sliding Temporal Voting Window (15 samples)
  private slidingWindow: FrameSample[] = [];
  private readonly WINDOW_SIZE = 15;

  constructor(config: Partial<ValidationConfig> = {}) {
    this.config = { ...DEFAULT_VALIDATION_CONFIG, ...config };
    this.toleranceRemaining = this.config.FRAME_TOLERANCE;
  }

  public updateConfig(newConfig: Partial<ValidationConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.toleranceRemaining = this.config.FRAME_TOLERANCE;
  }

  public getConfig(): ValidationConfig {
    return { ...this.config };
  }

  public resetForStep(stepNumber: number) {
    this.currentStepNumber = stepNumber;
    this.stepState = 'WAITING';
    this.stepStartTime = Date.now();
    this.holdStartTime = null;
    this.errorStartTime = null;
    this.hasWarnedForCurrentAttempt = false;
    this.cooldownUntil = null;
    this.toleranceRemaining = this.config.FRAME_TOLERANCE;
    this.isLockedVerified = false;
    this.completedTimestamp = null;
    this.slidingWindow = [];
  }

  public getStepState(): StepMachineState {
    return this.stepState;
  }

  public isVerified(): boolean {
    return this.isLockedVerified;
  }

  public static formatHumanAction(action: string): string {
    if (!action) return 'Detecting...';
    const clean = action.toUpperCase().replace(/\s+/g, '_');
    switch (clean) {
      case 'HANDS_AT_REST':
      case 'RESTING_BASELINE':
        return 'Hands at rest';
      case 'RAISE_RIGHT_HAND':
        return 'Right hand raised';
      case 'LOWER_RIGHT_HAND':
        return 'Right hand lowered';
      case 'RAISE_BOTH_HANDS':
        return 'Both hands raised';
      case 'RAISE_LEFT_HAND':
        return 'Left hand raised';
      case 'HANDS_TOGETHER_CHEST':
        return 'Hands together at chest';
      case 'PREPARING_MOVEMENT':
        return 'Preparing / Adjusting';
      case 'CONTAINER_REACH_PICKUP':
        return 'Reaching for sample container';
      case 'CENTRAL_ALIGNMENT_TRANSFER':
        return 'Transferring sample';
      case 'PAYLOAD_DOCKING_LOWER':
        return 'Docking in payload rack';
      default:
        return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    }
  }

  /**
   * Evaluates a frame detection through temporal voting & patient state machine.
   */
  public processFrame(
    protocol: ExperimentProtocol,
    currentStepIndex: number,
    rawDetectedAction: string,
    rawConfidence: number,
    now: number = Date.now()
  ): TemporalValidationUpdate {
    const currentStep = protocol.steps[currentStepIndex];

    if (!currentStep) {
      return {
        stepState: 'VERIFIED',
        smoothedAction: 'COMPLETED',
        humanReadableAction: 'Demo Completed',
        smoothedConfidence: 1.0,
        countdownSec: 0,
        holdProgressPct: 100,
        statusMessage: '✓ All demo steps completed successfully!',
        instructionPrompt: 'Demo procedure complete. Great job!',
        shouldAdvance: false,
        isVerifiedLocked: true
      };
    }

    // Reset if step number changed
    if (this.currentStepNumber !== currentStep.stepNumber) {
      this.resetForStep(currentStep.stepNumber);
    }

    // 1. Sliding-Window Temporal Voting (Smooths out jitter)
    this.slidingWindow.push({
      action: rawDetectedAction,
      confidence: rawConfidence,
      timestamp: now
    });
    if (this.slidingWindow.length > this.WINDOW_SIZE) {
      this.slidingWindow.shift();
    }

    // Calculate dominant action in voting window
    const actionCounts: Record<string, { count: number; totalConf: number }> = {};
    for (const sample of this.slidingWindow) {
      if (!actionCounts[sample.action]) {
        actionCounts[sample.action] = { count: 0, totalConf: 0 };
      }
      actionCounts[sample.action].count++;
      actionCounts[sample.action].totalConf += sample.confidence;
    }

    let dominantAction = rawDetectedAction;
    let maxVotes = 0;
    let avgConfidence = rawConfidence;

    for (const [action, stat] of Object.entries(actionCounts)) {
      if (stat.count > maxVotes) {
        maxVotes = stat.count;
        dominantAction = action;
        avgConfidence = stat.totalConf / stat.count;
      }
    }

    const voteShare = maxVotes / this.slidingWindow.length;
    const isVoteStable = voteShare >= this.config.ACTION_STABILITY_PERCENT;
    const smoothedAction = isVoteStable ? dominantAction : rawDetectedAction;
    const humanReadable = TemporalValidator.formatHumanAction(smoothedAction);

    // 2. LOCKED VERIFIED / COOLDOWN HANDLING
    if (this.isLockedVerified) {
      if (this.cooldownUntil && now >= this.cooldownUntil) {
        this.cooldownUntil = null;
        return {
          stepState: 'VERIFIED',
          smoothedAction,
          humanReadableAction: humanReadable,
          smoothedConfidence: avgConfidence,
          countdownSec: 0,
          holdProgressPct: 100,
          statusMessage: `✓ Correct! Step ${currentStep.stepNumber} completed.`,
          instructionPrompt: currentStep.expectedAction,
          shouldAdvance: true,
          isVerifiedLocked: true,
          completedTimestamp: this.completedTimestamp || this.formatCurrentTime()
        };
      }

      // In cooldown grace period
      return {
        stepState: 'COOLDOWN',
        smoothedAction,
        humanReadableAction: humanReadable,
        smoothedConfidence: avgConfidence,
        countdownSec: 0,
        holdProgressPct: 100,
        statusMessage: `✓ Correct! Step ${currentStep.stepNumber} completed.`,
        instructionPrompt: currentStep.expectedAction,
        shouldAdvance: false,
        isVerifiedLocked: true,
        completedTimestamp: this.completedTimestamp || this.formatCurrentTime()
      };
    }

    // 3. CHECK IF ACTION SATISFIES STEP RULES
    const isMatchingAction = this.evaluateActionMatch(protocol, currentStep, smoothedAction, avgConfidence);

    // 4. STATE MACHINE TRANSITIONS (Patient, Forgiving, Non-Aggressive)
    if (isMatchingAction) {
      this.errorStartTime = null; // Clear error accumulator
      this.toleranceRemaining = this.config.FRAME_TOLERANCE;

      // Transition to POSITIONING / DETECTING
      if (this.stepState === 'WAITING' || this.stepState === 'INCORRECT') {
        this.stepState = 'POSITIONING';
        this.holdStartTime = now;
        return {
          stepState: 'POSITIONING',
          smoothedAction,
          humanReadableAction: humanReadable,
          smoothedConfidence: avgConfidence,
          countdownSec: +(this.config.VERIFICATION_DELAY_MS / 1000).toFixed(1),
          holdProgressPct: 15,
          statusMessage: 'Action detected — hold position...',
          instructionPrompt: currentStep.expectedAction,
          shouldAdvance: false,
          isVerifiedLocked: false
        };
      }

      if (this.stepState === 'POSITIONING' && this.slidingWindow.length >= 3) {
        this.stepState = 'VERIFYING';
        if (!this.holdStartTime) this.holdStartTime = now;
      }

      if (this.stepState === 'VERIFYING') {
        const elapsed = now - (this.holdStartTime || now);
        const remainingMs = Math.max(0, this.config.VERIFICATION_DELAY_MS - elapsed);
        const countdownSec = +(remainingMs / 1000).toFixed(1);
        const progressPct = Math.min(100, Math.max(15, Math.round((elapsed / this.config.VERIFICATION_DELAY_MS) * 100)));

        // STEP COMPLETED / VERIFIED!
        if (elapsed >= this.config.VERIFICATION_DELAY_MS) {
          this.stepState = 'VERIFIED';
          this.isLockedVerified = true;
          this.completedTimestamp = this.formatCurrentTime();
          this.cooldownUntil = now + this.config.POST_VERIFICATION_COOLDOWN_MS;

          const praiseVoice = currentStep.stepNumber === protocol.totalSteps
            ? 'Great job! Demo completed successfully.'
            : `Good! Step ${currentStep.stepNumber} completed.`;

          return {
            stepState: 'VERIFIED',
            smoothedAction,
            humanReadableAction: humanReadable,
            smoothedConfidence: avgConfidence,
            countdownSec: 0,
            holdProgressPct: 100,
            statusMessage: `✓ Correct! Step ${currentStep.stepNumber} completed.`,
            instructionPrompt: currentStep.expectedAction,
            shouldAdvance: false, // advance after cooldown
            isVerifiedLocked: true,
            completedTimestamp: this.completedTimestamp,
            voiceAlertText: praiseVoice
          };
        }

        // Holding during verification
        return {
          stepState: 'VERIFYING',
          smoothedAction,
          humanReadableAction: humanReadable,
          smoothedConfidence: avgConfidence,
          countdownSec,
          holdProgressPct: progressPct,
          statusMessage: `Action detected. Hold for ${countdownSec}s...`,
          instructionPrompt: currentStep.expectedAction,
          shouldAdvance: false,
          isVerifiedLocked: false
        };
      }

    } else {
      // Action is NOT matching in current frame
      if (this.stepState === 'VERIFYING' || this.stepState === 'POSITIONING') {
        this.toleranceRemaining--;

        if (this.toleranceRemaining > 0) {
          // Tolerate natural movement shifts without resetting verification
          const elapsed = now - (this.holdStartTime || now);
          const remainingMs = Math.max(0, this.config.VERIFICATION_DELAY_MS - elapsed);
          const countdownSec = +(remainingMs / 1000).toFixed(1);
          const progressPct = Math.min(100, Math.round((elapsed / this.config.VERIFICATION_DELAY_MS) * 100));

          return {
            stepState: this.stepState,
            smoothedAction,
            humanReadableAction: humanReadable,
            smoothedConfidence: avgConfidence,
            countdownSec,
            holdProgressPct: progressPct,
            statusMessage: `Hold steady: ${countdownSec}s...`,
            instructionPrompt: currentStep.expectedAction,
            shouldAdvance: false,
            isVerifiedLocked: false
          };
        } else {
          // Revert to POSITIONING / PREPARING
          this.stepState = 'WAITING';
          this.holdStartTime = null;
          this.toleranceRemaining = this.config.FRAME_TOLERANCE;
        }
      }

      // Check for clearly different action sustained for > 3.5 seconds
      const isTransitional = smoothedAction === 'PREPARING_MOVEMENT' || smoothedAction === 'HANDS_AT_REST';
      
      if (!isTransitional) {
        if (!this.errorStartTime) {
          this.errorStartTime = now;
        }
        const sustainedErrorMs = now - this.errorStartTime;

        // Only declare INCORRECT when sustained strongly for > 3.5s
        if (sustainedErrorMs >= this.config.INCORRECT_TRIGGER_MS) {
          this.stepState = 'INCORRECT';

          // Voice warning spoken AT MOST ONCE per step attempt
          let warningVoice: string | undefined = undefined;
          if (!this.hasWarnedForCurrentAttempt) {
            warningVoice = 'Please try the current step again.';
            this.hasWarnedForCurrentAttempt = true;
          }

          return {
            stepState: 'INCORRECT',
            smoothedAction,
            humanReadableAction: humanReadable,
            smoothedConfidence: avgConfidence,
            countdownSec: 0,
            holdProgressPct: 0,
            statusMessage: `⚠ Different action detected ("${humanReadable}"). Take your time to retry.`,
            instructionPrompt: currentStep.expectedAction,
            shouldAdvance: false,
            isVerifiedLocked: false,
            deviationReason: `Detected "${humanReadable}" instead of "${currentStep.expectedAction}".`,
            voiceAlertText: warningVoice
          };
        }
      } else {
        this.errorStartTime = null; // Clear if returning to neutral/rest
      }

      // Default: Patient WAITING / PREPARING state
      return {
        stepState: 'WAITING',
        smoothedAction,
        humanReadableAction: humanReadable,
        smoothedConfidence: avgConfidence,
        countdownSec: +(this.config.VERIFICATION_DELAY_MS / 1000).toFixed(1),
        holdProgressPct: 0,
        statusMessage: 'AI is watching... Take your time when ready.',
        instructionPrompt: currentStep.expectedAction,
        shouldAdvance: false,
        isVerifiedLocked: false
      };
    }

    return {
      stepState: this.stepState,
      smoothedAction,
      humanReadableAction: humanReadable,
      smoothedConfidence: avgConfidence,
      countdownSec: +(this.config.VERIFICATION_DELAY_MS / 1000).toFixed(1),
      holdProgressPct: 0,
      statusMessage: 'AI Watching — Ready when you are.',
      instructionPrompt: currentStep.expectedAction,
      shouldAdvance: false,
      isVerifiedLocked: false
    };
  }

  private evaluateActionMatch(
    protocol: ExperimentProtocol,
    step: ExperimentStep,
    detectedAction: string,
    confidence: number
  ): boolean {
    if (confidence < this.config.CONFIDENCE_THRESHOLD) return false;

    // Forgiving Demo Matching for BAS-DEMO-01
    if (protocol.code === 'BAS-DEMO-01') {
      const sNum = step.stepNumber;
      // Step 1: Hands at rest
      if (sNum === 1) {
        return detectedAction === 'HANDS_AT_REST' || detectedAction === 'RESTING_BASELINE' || detectedAction === 'LOWER_RIGHT_HAND';
      }
      // Step 2: Raise right hand
      if (sNum === 2) {
        return detectedAction === 'RAISE_RIGHT_HAND' || detectedAction === 'CONTAINER_REACH_PICKUP';
      }
      // Step 3: Lower right hand
      if (sNum === 3) {
        return detectedAction === 'LOWER_RIGHT_HAND' || detectedAction === 'HANDS_AT_REST' || detectedAction === 'RESTING_BASELINE';
      }
      // Step 4: Raise both hands
      if (sNum === 4) {
        return detectedAction === 'RAISE_BOTH_HANDS';
      }
      // Step 5: Return to rest
      if (sNum === 5) {
        return detectedAction === 'HANDS_AT_REST' || detectedAction === 'RESTING_BASELINE' || detectedAction === 'LOWER_RIGHT_HAND';
      }
      return false;
    }

    // Advanced Protocol Matching
    if (step.validationRules.requiredKinematicAction) {
      return detectedAction === step.validationRules.requiredKinematicAction;
    }

    return detectedAction.toUpperCase().includes(step.expectedAction.toUpperCase().split(' ')[0]);
  }

  private formatCurrentTime(): string {
    const d = new Date();
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    const s = d.getSeconds().toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  }
}

export const temporalValidator = new TemporalValidator();
