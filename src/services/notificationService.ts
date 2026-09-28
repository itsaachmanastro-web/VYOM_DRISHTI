/**
 * VYOM DRISHTI AI — Event-Driven Notification Service
 * 
 * Central dispatcher connecting real-time mission events to user notifications:
 * - Sequence Validation events (Step Verified, Retry Required, Out of Sequence, Skipped)
 * - AI Engine events (Gemini Connected, Switched to Local AI)
 * - Hardware & Video events (Camera connected, Recording saved, IP stream status)
 * - Security & Session events (Login authenticated, Session expiring, Logged out)
 * - Offline-First persistence via IndexedDB
 */

import { NotificationItem, NotificationType } from '../types/notification';
import { indexedDbService } from './indexedDbService';

type NotificationListener = (notifications: NotificationItem[]) => void;

class NotificationService {
  private notifications: NotificationItem[] = [];
  private listeners: Set<NotificationListener> = new Set();
  private recentDedupMap: Map<string, number> = new Map();
  private isLoaded: boolean = false;

  constructor() {
    this.loadFromStorage();
  }

  private async loadFromStorage(): Promise<void> {
    try {
      const persisted = await indexedDbService.getAllNotifications();
      if (persisted && persisted.length > 0) {
        this.notifications = persisted;
      } else {
        // Seed default initial mission start notifications
        this.seedInitialNotifications();
      }
      this.isLoaded = true;
      this.notifyListeners();
    } catch (e) {
      console.warn('Could not load notifications from IndexedDB:', e);
      this.seedInitialNotifications();
      this.notifyListeners();
    }
  }

  private seedInitialNotifications(): void {
    const now = new Date();
    this.notifications = [
      {
        id: `notif-seed-1`,
        title: 'Step 1 Verified',
        message: 'Disengage mechanical latch and open payload rack door completed successfully.',
        type: 'SUCCESS',
        timestamp: new Date(now.getTime() - 4 * 60 * 1000).toISOString(),
        metTimestamp: 'T+04:18:40',
        read: true,
        dismissed: false,
        actionLink: 'sequence',
        sourceModule: 'SEQUENCE_VALIDATOR',
        dedupKey: 'STEP_1_VERIFIED'
      },
      {
        id: `notif-seed-2`,
        title: 'Mission AI Active',
        message: 'Local Mission AI and Edge Knowledge Base initialized in 100% Offline Mode.',
        type: 'AI',
        timestamp: new Date(now.getTime() - 3 * 60 * 1000).toISOString(),
        metTimestamp: 'T+04:19:10',
        read: false,
        dismissed: false,
        actionLink: 'assistant',
        sourceModule: 'AI_ROUTER',
        dedupKey: 'AI_INITIALIZED'
      },
      {
        id: `notif-seed-3`,
        title: 'Mission Access Authenticated',
        message: 'Secure session active for on-board scientific operations.',
        type: 'SECURITY',
        timestamp: new Date(now.getTime() - 2 * 60 * 1000).toISOString(),
        metTimestamp: 'T+04:19:35',
        read: false,
        dismissed: false,
        actionLink: 'overview',
        sourceModule: 'SECURITY_ENGINE',
        dedupKey: 'AUTH_SUCCESS_INIT'
      }
    ];
  }

  public subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    listener([...this.notifications]);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const list = [...this.notifications];
    this.listeners.forEach(fn => fn(list));
  }

  /**
   * Dispatches a new notification from any application event
   */
  public notify(params: {
    title: string;
    message: string;
    type: NotificationType;
    metTimestamp?: string;
    actionLink?: string;
    sourceModule: string;
    dedupKey?: string;
  }): NotificationItem | null {
    const now = Date.now();
    const dedup = params.dedupKey || `${params.sourceModule}-${params.title}`;

    // Prevent duplicate spam within 3.5 seconds
    const lastEmitted = this.recentDedupMap.get(dedup);
    if (lastEmitted && now - lastEmitted < 3500) {
      return null;
    }
    this.recentDedupMap.set(dedup, now);

    const formatMet = () => {
      if (params.metTimestamp) return params.metTimestamp;
      const d = new Date();
      return `T+${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
    };

    const newNotif: NotificationItem = {
      id: `notif-${now}-${Math.floor(Math.random() * 1000)}`,
      title: params.title,
      message: params.message,
      type: params.type,
      timestamp: new Date().toISOString(),
      metTimestamp: formatMet(),
      read: false,
      dismissed: false,
      actionLink: params.actionLink,
      sourceModule: params.sourceModule,
      dedupKey: dedup
    };

    this.notifications = [newNotif, ...this.notifications];
    this.notifyListeners();

    // Persist to IndexedDB
    indexedDbService.saveNotification(newNotif);

    return newNotif;
  }

  public getNotifications(): NotificationItem[] {
    return [...this.notifications];
  }

  public getUnreadCount(): number {
    return this.notifications.filter(n => !n.read && !n.dismissed).length;
  }

  public markAsRead(id: string): void {
    this.notifications = this.notifications.map(n => n.id === id ? { ...n, read: true } : n);
    this.notifyListeners();
    indexedDbService.markNotificationRead(id);
  }

  public markAllAsRead(): void {
    this.notifications = this.notifications.map(n => ({ ...n, read: true }));
    this.notifyListeners();
    indexedDbService.markAllNotificationsRead();
  }

  public dismiss(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
    indexedDbService.markNotificationRead(id);
  }

  public clearAll(): void {
    this.notifications = [];
    this.notifyListeners();
    indexedDbService.clearNotifications();
  }
}

export const notificationService = new NotificationService();
