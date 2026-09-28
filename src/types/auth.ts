/**
 * VYOM DRISHTI AI — Authentication & Identity Types
 * Confidential Space Station Scientific Platform Access Control
 */

export type UserRole = 
  | 'ASTRONAUT' 
  | 'EXPERIMENT_OPERATOR' 
  | 'SCIENTIST' 
  | 'MISSION_ADMIN';

export interface UserIdentity {
  id: string;
  displayName: string;
  role: UserRole;
  maskedMissionId: string; // e.g. "••••••••4821"
  organization: string; // e.g. "ISRO / BAS Mission Control"
  rankOrTitle: string; // e.g. "Mission Specialist / Flight Scientist"
  permissions: string[];
  avatarColor?: string;
  assignedExperiments: string[];
}

export interface AuthSession {
  sessionId: string;
  token: string;
  user: UserIdentity;
  issuedAt: number; // epoch ms
  expiresAt: number; // epoch ms
  rememberDevice: boolean;
  lastActive: number;
}

export type AuthStatus = 
  | 'UNAUTHENTICATED' 
  | 'AUTHENTICATING' 
  | 'AUTHENTICATED' 
  | 'LOCKED' 
  | 'EXPIRED' 
  | 'ERROR';

export type AuthErrorType = 
  | 'INVALID_CREDENTIALS' 
  | 'ACCOUNT_LOCKED' 
  | 'SESSION_EXPIRED' 
  | 'NETWORK_ERROR' 
  | 'SERVICE_UNAVAILABLE' 
  | 'UNKNOWN';

export interface AuthResult {
  success: boolean;
  session?: AuthSession;
  error?: string;
  errorType?: AuthErrorType;
  lockoutRemainingSec?: number;
}
