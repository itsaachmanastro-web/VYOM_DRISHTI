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

    // Explicit Rule Matching for BAS-DEMO-01 (Simple Live Webcam Demo)
    if (protocol.code === 'BAS-DEMO-01') {
      const sNum = currentStep.stepNumber;

      // STEP 1: Hands at Rest
      if (sNum === 1) {
        if (detectedAction === 'HANDS_AT_REST' || detectedAction === 'RESTING_BASELINE' || detectedAction === 'LOWER_RIGHT_HAND') {
          return {
            stepNumber: 1,
            validationState: 'CORRECT',
            recognizedAction: 'Hands at Rest',
            expectedAction: currentStep.expectedAction,
            confidence,
            recommendation: 'Step 1 Verified. Proceed to Step 2: Slowly raise your right hand.',
            voiceAlertText: 'Good! Step one completed.',
            severity: 'INFO'
          };
        } else if (detectedAction === 'PREPARING_MOVEMENT') {
          return {
            stepNumber: 1,
            validationState: 'ACTIVE',
            recognizedAction: 'Preparing posture',
            expectedAction: currentStep.expectedAction,
            confidence,
            recommendation: 'Place both hands down and stay still for a moment.',
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
            recommendation: 'Place both hands down and stay still for a moment. Take your time.',
            voiceAlertText: 'Please try the current step again.',
            severity: 'WARNING'
          };
        }
      }

      // STEP 2: Raise Right Hand
      if (sNum === 2) {
        if (detectedAction === 'RAISE_RIGHT_HAND' || detectedAction === 'CONTAINER_REACH_PICKUP') {
          return {
            stepNumber: 2,
            validationState: 'CORRECT',
            recognizedAction: 'Right Hand Raised',
            expectedAction: currentStep.expectedAction,
            confidence,
            recommendation: 'Step 2 Verified. Proceed to Step 3: Lower your right hand.',
            voiceAlertText: 'Good! Step two completed.',
            severity: 'INFO'
          };
        } else if (detectedAction === 'PREPARING_MOVEMENT' || detectedAction === 'HANDS_AT_REST') {
          return {
            stepNumber: 2,
            validationState: 'ACTIVE',
            recognizedAction: 'Preparing to raise right hand',
            expectedAction: currentStep.expectedAction,
            confidence,
            recommendation: 'Slowly raise your right hand in front of the camera.',
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
            recommendation: 'Slowly raise your right hand. Take your time.',
            voiceAlertText: 'Please try the current step again.',
            severity: 'WARNING'
          };
        }
      }

      // STEP 3: Lower Right Hand
      if (sNum === 3) {
        if (detectedAction === 'LOWER_RIGHT_HAND' || detectedAction === 'HANDS_AT_REST' || detectedAction === 'RESTING_BASELINE') {
          return {
            stepNumber: 3,
            validationState: 'CORRECT',
            recognizedAction: 'Right Hand Lowered to Rest',
            expectedAction: currentStep.expectedAction,
            confidence,
            recommendation: 'Step 3 Verified. Proceed to Step 4: Raise both hands.',
            voiceAlertText: 'Good! Step three completed.',
            severity: 'INFO'
          };
        } else if (detectedAction === 'PREPARING_MOVEMENT' || detectedAction === 'RAISE_RIGHT_HAND') {
          return {
            stepNumber: 3,
            validationState: 'ACTIVE',
            recognizedAction: 'Preparing to lower hand',
            expectedAction: currentStep.expectedAction,
            confidence,
            recommendation: 'Lower your right hand down to resting position.',
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
            deviationReason: `Detected "${detectedAction}". Expected right hand lowered.`,
            recommendation: 'Lower your right hand to your side.',
            voiceAlertText: 'Please try the current step again.',
            severity: 'WARNING'
          };
        }
      }

      // STEP 4: Raise Both Hands
      if (sNum === 4) {
        if (detectedAction === 'RAISE_BOTH_HANDS') {
          return {
            stepNumber: 4,
            validationState: 'CORRECT',
            recognizedAction: 'Both Hands Raised',
            expectedAction: currentStep.expectedAction,
            confidence,
            recommendation: 'Step 4 Verified. Proceed to Step 5: Return both hands to resting position.',
            voiceAlertText: 'Excellent! Step four completed.',
            severity: 'INFO'
          };
        } else if (detectedAction === 'PREPARING_MOVEMENT' || detectedAction === 'HANDS_AT_REST' || detectedAction === 'RAISE_RIGHT_HAND' || detectedAction === 'RAISE_LEFT_HAND') {
          return {
            stepNumber: 4,
            validationState: 'ACTIVE',
            recognizedAction: 'Preparing both hands',
            expectedAction: currentStep.expectedAction,
            confidence,
            recommendation: 'Raise both hands up in front of the camera.',
            voiceAlertText: '',
            severity: 'INFO'
          };
        } else {
          return {
            stepNumber: 4,
            validationState: 'INCORRECT',
            recognizedAction: detectedAction,
            expectedAction: currentStep.expectedAction,
            confidence,
            deviationReason: `Detected "${detectedAction}". Expected both hands raised.`,
            recommendation: 'Raise both hands upward. Take your time.',
            voiceAlertText: 'Please try the current step again.',
            severity: 'WARNING'
          };
        }
      }

      // STEP 5: Return to Rest
      if (sNum === 5) {
        if (detectedAction === 'HANDS_AT_REST' || detectedAction === 'RESTING_BASELINE' || detectedAction === 'LOWER_RIGHT_HAND') {
          return {
            stepNumber: 5,
            validationState: 'CORRECT',
            recognizedAction: 'Both Hands at Rest (Demo Complete)',
            expectedAction: currentStep.expectedAction,
            confidence,
            recommendation: 'Demo procedure complete. Great job!',
            voiceAlertText: 'Great job! Demo completed successfully.',
            severity: 'INFO'
          };
        } else {
          return {
            stepNumber: 5,
            validationState: 'ACTIVE',
            recognizedAction: detectedAction,
            expectedAction: currentStep.expectedAction,
            confidence,
            recommendation: 'Return both hands to the resting position.',
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
