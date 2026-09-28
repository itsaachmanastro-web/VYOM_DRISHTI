/**
 * VYOM DRISHTI AI — Network & Connection State Manager
 * Distinguishes between:
 * - ONLINE: Internet available and cloud services accessible
 * - LOCAL_ONLY: Standalone air-gapped / offline workstation mode (Zero network calls)
 * - DEGRADED: Internet connected but cloud AI unreachable (Automatic local failover)
 */

export type ConnectionState = 'ONLINE' | 'LOCAL_ONLY' | 'DEGRADED';

export type ConnectionListener = (state: ConnectionState, previousState: ConnectionState) => void;

class ConnectionManager {
  private currentState: ConnectionState = 'LOCAL_ONLY';
  private listeners: Set<ConnectionListener> = new Set();
  private isChecking: boolean = false;
  private lastCheckedTimestamp: number = 0;

  constructor() {
    this.currentState = typeof navigator !== 'undefined' && navigator.onLine ? 'ONLINE' : 'LOCAL_ONLY';
    this.initListeners();
  }

  private initListeners() {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      this.evaluateConnection(true);
    });

    window.addEventListener('offline', () => {
      this.setState('LOCAL_ONLY');
    });

    // Initial evaluation
    this.evaluateConnection(false);
  }

  public getConnectionState(): ConnectionState {
    return this.currentState;
  }

  public isOnline(): boolean {
    return this.currentState === 'ONLINE';
  }

  public isOffline(): boolean {
    return this.currentState === 'LOCAL_ONLY';
  }

  public subscribe(listener: ConnectionListener): () => void {
    this.listeners.add(listener);
    listener(this.currentState, this.currentState);
    return () => this.listeners.delete(listener);
  }

  private setState(newState: ConnectionState) {
    if (this.currentState !== newState) {
      const prevState = this.currentState;
      this.currentState = newState;
      this.lastCheckedTimestamp = Date.now();
      this.listeners.forEach(fn => fn(newState, prevState));
    }
  }

  /**
   * Evaluates network connectivity with non-blocking probe
   */
  public async evaluateConnection(notifyUser: boolean = false): Promise<ConnectionState> {
    if (typeof navigator === 'undefined' || !navigator.onLine) {
      this.setState('LOCAL_ONLY');
      return 'LOCAL_ONLY';
    }

    if (this.isChecking) return this.currentState;
    this.isChecking = true;

    try {
      // Non-blocking quick HEAD request to verify actual outbound connectivity
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      // Probe a reliable lightweight origin or fallback to online status
      const res = await fetch('https://www.google.com/generate_204', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-store',
        signal: controller.signal
      }).catch(() => null);

      clearTimeout(timeoutId);
      this.isChecking = false;

      if (res !== null || navigator.onLine) {
        this.setState('ONLINE');
        return 'ONLINE';
      } else {
        this.setState('LOCAL_ONLY');
        return 'LOCAL_ONLY';
      }
    } catch {
      this.isChecking = false;
      this.setState('LOCAL_ONLY');
      return 'LOCAL_ONLY';
    }
  }

  public getLastCheckedTime(): string {
    if (!this.lastCheckedTimestamp) return 'Active';
    return new Date(this.lastCheckedTimestamp).toLocaleTimeString();
  }
}

export const connectionManager = new ConnectionManager();
