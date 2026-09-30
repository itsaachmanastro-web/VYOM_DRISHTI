import { ExperimentProtocol, ExperimentStep, StepStatus, ValidationState } from '../types/mission';

export interface ValidationResult {
  stepNumber: number;
  validationState: ValidationState;
  recognizedAction: string;
  expectedAction: string;
  confidence: number;
  deviationReason?: string;
  recommendation: string;
  voiceAlertText: string;
  severity: 'INFO' | 'WARNING' | 'SEQUENCE ERROR' | 'CRITICAL';
}

export class ProtocolEngine {
  public static validateAction(
    protocol: ExperimentProtocol,
    currentStepNumber: number,
    detectedAction: string,
    detectedObjects: string[],
    handInteraction: string,
    confidence: number = 0.85
  ): ValidationResult {
    const currentStep = protocol.steps.find(s => s.stepNumber === currentStepNumber);
    if (!currentStep) {
      return {
        stepNumber: currentStepNumber,
        validationState: 'COMPLETED',
        recognizedAction: detectedAction,
        expectedAction: 'None (Protocol Finished)',
        confidence: 0,
        recommendation: 'All protocol steps successfully executed and validated.',
        voiceAlertText: 'Experiment procedure completed successfully.',
        severity: 'INFO'
      };
    }

    // Explicit Rule Matching for BAS-DEMO-01 (Canonical 4-Step Live Webcam Demo)
    if (protocol.code === 'BAS-DEMO-01') {
      const sNum = currentStep.stepNumber;

      // STEP 1: Hands at Rest
      if (sNum === 1) {
        if (detectedAction === 'HANDS_AT_REST' || detectedAction === 'RESTING_BASELINE' || detectedAction === 'LOWER_BOTH_HANDS') {
          return {
            stepNumber: 1,
            validationState: 'CORRECT',
            recognizedAction: 'Hands at Rest',
            expectedAction: currentStep.expectedAction,
            confidence,
            recommendation: 'Step 1 Verified. Proceed to Step 2: Raise your right hand.',
            voiceAlertText: 'Correct! Hands at rest verified. Now raise your right hand.',
            severity: 'INFO'
          };
        } else if (detectedAction === 'PREPARING_MOVEMENT') {
          return {
            stepNumber: 1,
            validationState: 'ACTIVE',
            recognizedAction: 'Preparing posture',
            expectedAction: currentStep.expectedAction,
            confidence,
            recommendation: 'Stand facing camera with both hands down.',
            voiceAlertText: '',
            severity: 'INFO'
          };
        } else {
          return {
            stepNumber: 1,
            validationState: 'INCORRECT',
            recognizedAction: detectedAction,
            expectedAction: currentStep.expectedAction,
            confidence,
            deviationReason: `Detected "${detectedAction}". Expected hands down at rest.`,
            recommendation: 'Stand facing camera with both hands down. Take your time.',
            voiceAlertText: 'Please try the current step again.',
            severity: 'WARNING'
          };
        }
      }

      // STEP 2: Raise Right Hand
      if (sNum === 2) {
        if (detectedAction === 'RAISE_RIGHT_HAND') {
          return {
            stepNumber: 2,
            validationState: 'CORRECT',
            recognizedAction: 'Right Hand Raised',
            expectedAction: currentStep.expectedAction,
            confidence,
            recommendation: 'Step 2 Verified. Proceed to Step 3: Raise your left hand.',
            voiceAlertText: 'Correct! Right hand raised. Now raise your left hand.',
            severity: 'INFO'
          };
        } else if (detectedAction === 'PREPARING_MOVEMENT' || detectedAction === 'HANDS_AT_REST') {
          return {
            stepNumber: 2,
            validationState: 'ACTIVE',
            recognizedAction: 'Preparing to raise right hand',
            expectedAction: currentStep.expectedAction,
            confidence,
            recommendation: 'Raise your right hand in front of the camera.',
            voiceAlertText: '',
            severity: 'INFO'
          };
        } else {
          return {
            stepNumber: 2,
            validationState: 'INCORRECT',
            recognizedAction: detectedAction,
            expectedAction: currentStep.expectedAction,
            confidence,
            deviationReason: `Detected "${detectedAction}". Expected right hand raised.`,
            recommendation: 'Raise your right hand. Take your time.',
            voiceAlertText: 'Please try the current step again.',
            severity: 'WARNING'
          };
        }
      }

      // STEP 3: Raise Left Hand
      if (sNum === 3) {
        if (detectedAction === 'RAISE_LEFT_HAND') {
          return {
            stepNumber: 3,
            validationState: 'CORRECT',
            recognizedAction: 'Left Hand Raised',
            expectedAction: currentStep.expectedAction,
            confidence,
            recommendation: 'Step 3 Verified. Proceed to Step 4: Lower both hands back down.',
            voiceAlertText: 'Correct! Left hand raised. Now lower both hands back down.',
            severity: 'INFO'
          };
        } else if (detectedAction === 'PREPARING_MOVEMENT' || detectedAction === 'HANDS_AT_REST' || detectedAction === 'RAISE_RIGHT_HAND') {
          return {
            stepNumber: 3,
            validationState: 'ACTIVE',
            recognizedAction: 'Preparing to raise left hand',
            expectedAction: currentStep.expectedAction,
            confidence,
            recommendation: 'Raise your left hand in front of the camera.',
            voiceAlertText: '',
            severity: 'INFO'
          };
        } else {
          return {
            stepNumber: 3,
            validationState: 'INCORRECT',
            recognizedAction: detectedAction,
            expectedAction: currentStep.expectedAction,
            confidence,
            deviationReason: `Detected "${detectedAction}". Expected left hand raised.`,
            recommendation: 'Raise your left hand. Take your time.',
            voiceAlertText: 'Please try the current step again.',
            severity: 'WARNING'
          };
        }
      }

      // STEP 4: Lower Both Hands (Return to Rest)
      if (sNum === 4) {
        if (detectedAction === 'HANDS_AT_REST' || detectedAction === 'RESTING_BASELINE' || detectedAction === 'LOWER_BOTH_HANDS') {
          return {
            stepNumber: 4,
            validationState: 'CORRECT',
            recognizedAction: 'Both Hands at Rest (Demo Complete)',
            expectedAction: currentStep.expectedAction,
            confidence,
            recommendation: 'Demo procedure complete. Great job!',
            voiceAlertText: 'Great job! All demo steps completed successfully. Procedure complete and verified.',
            severity: 'INFO'
          };
        } else {
          return {
            stepNumber: 4,
            validationState: 'ACTIVE',
            recognizedAction: detectedAction,
            expectedAction: currentStep.expectedAction,
            confidence,
            recommendation: 'Lower both hands back to the resting position.',
            voiceAlertText: '',
            severity: 'INFO'
          };
        }
      }
    }

    // Generic Protocol SOP Matching for BAS-BIO-04, GAGANYAAN-CELL-02, IMEX-PHYS-01
    const isActionMatch = 
      currentStep.expectedAction.toLowerCase().includes(detectedAction.toLowerCase()) ||
      detectedAction.toLowerCase().includes(currentStep.targetObject.toLowerCase()) ||
      currentStep.validationRules.requiredObjects.some(obj => detectedObjects.includes(obj));

    if (isActionMatch) {
      return {
        stepNumber: currentStepNumber,
        validationState: 'CORRECT',
        recognizedAction: detectedAction,
        expectedAction: currentStep.expectedAction,
        confidence,
        recommendation: `Step ${currentStepNumber} verified. Proceed to Step ${currentStepNumber + 1 > protocol.totalSteps ? 'Finalization' : currentStepNumber + 1}.`,
        voiceAlertText: `Step ${currentStepNumber} verified. Proceed to next step.`,
        severity: 'INFO'
      };
    }

    // Check if detected action matches a future step
    const matchedFutureStep = protocol.steps.find(s => 
      s.stepNumber > currentStepNumber && 
      (s.expectedAction.toLowerCase().includes(detectedAction.toLowerCase()) ||
       s.validationRules.requiredObjects.some(obj => detectedObjects.includes(obj)))
    );

    if (matchedFutureStep) {
      return {
        stepNumber: currentStepNumber,
        validationState: 'OUT_OF_SEQUENCE',
        recognizedAction: detectedAction,
        expectedAction: currentStep.expectedAction,
        confidence,
        deviationReason: `Detected Step ${matchedFutureStep.stepNumber} (${matchedFutureStep.title}) before completing Step ${currentStepNumber}.`,
        recommendation: `Out of sequence! Complete Step ${currentStepNumber}: "${currentStep.expectedAction}" first.`,
        voiceAlertText: 'That action is out of sequence. Please complete the current procedure first.',
        severity: 'SEQUENCE ERROR'
      };
    }

    // Incorrect action
    return {
      stepNumber: currentStepNumber,
      validationState: 'INCORRECT',
      recognizedAction: detectedAction,
      expectedAction: currentStep.expectedAction,
      confidence,
      deviationReason: `Detected action "${detectedAction}" does not match required action "${currentStep.expectedAction}".`,
      recommendation: `Please perform: "${currentStep.expectedAction}". Target: ${currentStep.targetObject}. Please repeat Step ${currentStepNumber}.`,
      voiceAlertText: 'Incorrect action detected. Please repeat the current step.',
      severity: 'WARNING'
    };
  }
}
