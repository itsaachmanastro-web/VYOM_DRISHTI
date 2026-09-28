import { ExperimentProtocol, StepExecutionRecord, VoiceAlertItem, MissionLogEvent } from '../types/mission';
import { ValidationResult } from './protocolEngine';

export interface MissionAiContext {
  protocol: ExperimentProtocol;
  currentStepIndex: number;
  validationResult: ValidationResult;
  currentActionName: string;
  actionConfidence: number;
  executionRecords: StepExecutionRecord[];
  alerts: VoiceAlertItem[];
  logs: MissionLogEvent[];
  isWebcamActive: boolean;
  isRealTrackingActive: boolean;
}

export class MissionAiService {
  public static generateResponse(userQuery: string, context: MissionAiContext): string {
    const query = userQuery.toLowerCase().trim();
    const currentStep = context.protocol.steps[context.currentStepIndex];
    const totalSteps = context.protocol.totalSteps;
    const completedRecords = context.executionRecords.filter(r => r.status === 'COMPLETED');
    const failedRecords = context.executionRecords.filter(r => r.status === 'SKIPPED' || r.validationState === 'INCORRECT' || r.validationState === 'OUT_OF_SEQUENCE');

    // 1. "What am I supposed to do now?" / "Current instruction"
    if (query.includes('what') && (query.includes('do') || query.includes('instruction') || query.includes('expected') || query.includes('now'))) {
      if (!currentStep) {
        return `All ${totalSteps} steps of protocol ${context.protocol.code} are complete. All biological seals and telemetry records are verified.`;
      }
      return `For Step ${currentStep.stepNumber} (${currentStep.title}), you are required to: "${currentStep.expectedAction}". Target instrument: ${currentStep.targetObject}. ${currentStep.safetyRequirement}`;
    }

    // 2. "Why was this step rejected?" / "Why not verified?" / "What did I do wrong?"
    if (query.includes('why') && (query.includes('reject') || query.includes('failed') || query.includes('not verified') || query.includes('incorrect') || query.includes('wrong'))) {
      if (context.validationResult.validationState === 'CORRECT') {
        return `Step ${currentStep?.stepNumber} is currently validated. Detected action "${context.currentActionName}" satisfies the SOP requirements.`;
      }
      if (context.validationResult.deviationReason) {
        return `Step ${currentStep?.stepNumber} was not verified because: ${context.validationResult.deviationReason}. Expected action is "${currentStep?.expectedAction}".`;
      }
      return `Step ${currentStep?.stepNumber} requires "${currentStep?.expectedAction}". The system detected "${context.currentActionName}", which does not satisfy the spatial/kinematic validation criteria for this step. Please hold the required pose steadily.`;
    }

    // 3. "What is the next procedure?" / "Next step"
    if (query.includes('next') && (query.includes('step') || query.includes('procedure') || query.includes('action'))) {
      const nextStep = context.protocol.steps[context.currentStepIndex + 1];
      if (!nextStep) {
        return `You are currently on the final step (Step ${currentStep?.stepNumber}). Completing this will finalize and seal the experiment manifest.`;
      }
      return `The next procedure is Step ${nextStep.stepNumber}: "${nextStep.title}". Expected action: "${nextStep.expectedAction}".`;
    }

    // 4. "Show me the last detected error" / "Last error" / "Alerts"
    if (query.includes('error') || query.includes('deviation') || query.includes('warning') || query.includes('alert')) {
      const lastAlert = context.alerts[0];
      if (lastAlert) {
        return `Last logged telemetry alert [${lastAlert.severity}] at ${lastAlert.timestamp}: "${lastAlert.title}" — ${lastAlert.message}`;
      }
      if (failedRecords.length > 0) {
        const lastFail = failedRecords[failedRecords.length - 1];
        return `Last recorded deviation occurred on Step ${lastFail.stepNumber} (${lastFail.title}): ${lastFail.deviationReason || 'Out-of-sequence motion detected'}.`;
      }
      return `No active sequence errors or safety violations are currently logged in the flight recorder.`;
    }

    // 5. "Summarize this experiment" / "Status" / "Overview"
    if (query.includes('summarize') || query.includes('summary') || query.includes('status') || query.includes('overview') || query.includes('progress')) {
      return `Experiment Summary: ${context.protocol.code} (${context.protocol.name}). Location: ${context.protocol.rackLocation}. Hazard Level: ${context.protocol.hazardLevel}. Progress: ${completedRecords.length}/${totalSteps} steps completed. Tracking Engine: ${context.isWebcamActive ? 'Live Edge Webcam (MoveNet WebGL)' : 'Simulated Payload Rack'}.`;
    }

    // 6. Generic Fallback grounded in truth
    return `Mission Assistant telemetry active. Current Protocol: ${context.protocol.code}, Step ${currentStep?.stepNumber}/${totalSteps}: "${currentStep?.expectedAction}". Detected Action: "${context.currentActionName}" (Status: ${context.validationResult.validationState}). You can ask me what to do now, why a step failed, or for an experiment summary.`;
  }
}
