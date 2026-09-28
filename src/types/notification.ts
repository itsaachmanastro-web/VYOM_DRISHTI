/**
 * VYOM DRISHTI AI — Event-Driven Real-Time Notification Types
 */

export type NotificationType = 
  | 'SUCCESS' 
  | 'INFO' 
  | 'WARNING' 
  | 'ERROR' 
  | 'MISSION' 
  | 'AI' 
  | 'SYSTEM' 
  | 'SECURITY';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string; // ISO 8601 string
  metTimestamp: string; // e.g. "T+04:18:40"
  read: boolean;
  dismissed: boolean;
  actionLink?: string; // e.g. "live-monitor", "sequence", "assistant"
  sourceModule: string; // e.g. "SEQUENCE_VALIDATOR", "AI_ROUTER", "CAMERA", "SECURITY_ENGINE"
  dedupKey?: string;
}
