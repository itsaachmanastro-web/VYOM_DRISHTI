/**
 * VYOM DRISHTI AI — Central AI Routing Layer
 * Routes queries between Gemini Cloud AI (when online & configured)
 * and Local Mission AI (when offline, air-gapped, or during network failover).
 * Provides 100% resilient zero-failure operation.
 */

import { connectionManager } from './connectionManager';
import { geminiService } from './geminiService';
import { localMissionAssistant, LocalAssistantContext, AssistantResponse } from './localMissionAssistant';

export interface AiRouterResult {
  text: string;
  source: 'LOCAL MISSION CONTEXT' | 'LOCAL KNOWLEDGE BASE' | 'LIVE ACTIVITY MODEL' | 'GOOGLE GEMINI AI';
  provenanceLabel: string;
  isOffline: boolean;
  engineUsed: 'GEMINI_ONLINE' | 'LOCAL_MISSION_AI' | 'LOCAL_FAILOVER';
  failoverNotice?: string;
}

export class AiRouter {
  /**
   * Main entry point for all AI questions in the application
   */
  public async routeQuery(
    userQuery: string,
    context: LocalAssistantContext
  ): Promise<AiRouterResult> {
    const isOnline = connectionManager.isOnline();
    const isGeminiConfigured = geminiService.isConfigured();

    // MODE A: Connected Mode with active Gemini Key
    if (isOnline && isGeminiConfigured) {
      try {
        // Enforce a strict timeout on cloud API calls to prevent UI hang
        const timeoutPromise = new Promise<null>((_, reject) => {
          setTimeout(() => reject(new Error('Gemini API timeout')), 4500);
        });

        const geminiPromise = geminiService.generateGroundedResponse(userQuery, {
          protocol: context.protocol,
          currentStepIndex: context.currentStepIndex,
          validationResult: context.validationResult,
          currentActionName: context.currentActionName,
          actionConfidence: context.actionConfidence,
          executionRecords: context.executionRecords,
          alerts: context.alerts,
          logs: context.logs,
          isWebcamActive: context.isWebcamActive,
          isRealTrackingActive: context.isRealTrackingActive
        });

        const responseText = await Promise.race([geminiPromise, timeoutPromise]);

        if (responseText && responseText.trim()) {
          return {
            text: responseText.trim(),
            source: 'GOOGLE GEMINI AI',
            provenanceLabel: geminiService.getConfig().model || 'gemini-1.5-flash',
            isOffline: false,
            engineUsed: 'GEMINI_ONLINE'
          };
        }

        // If Gemini returned blank, fall back to Local AI
        return this.executeLocalFallback(userQuery, context, 'Cloud returned empty response');
      } catch (err: any) {
        console.warn('Gemini request failed/timed out, automatically failing over to Local Mission AI:', err.message);
        return this.executeLocalFallback(userQuery, context, 'Automatic failover to Local Mission AI');
      }
    }

    // MODE B: Standalone Offline Mode (100% On-Device Deterministic Execution)
    const localResult = localMissionAssistant.generateResponse(userQuery, context);

    return {
      text: localResult.text,
      source: localResult.source,
      provenanceLabel: localResult.provenanceLabel,
      isOffline: true,
      engineUsed: 'LOCAL_MISSION_AI'
    };
  }

  private executeLocalFallback(
    userQuery: string,
    context: LocalAssistantContext,
    reason: string
  ): AiRouterResult {
    const localResult = localMissionAssistant.generateResponse(userQuery, context);

    return {
      text: localResult.text,
      source: localResult.source,
      provenanceLabel: 'LOCAL MISSION ENGINE (OFFLINE FALLBACK)',
      isOffline: true,
      engineUsed: 'LOCAL_FAILOVER',
      failoverNotice: `[Switched to Local AI: ${reason}]`
    };
  }
}

export const aiRouter = new AiRouter();
