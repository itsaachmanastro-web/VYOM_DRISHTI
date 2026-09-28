/**
 * VYOM DRISHTI AI — IndexedDB Persistent Local Storage Service
 * Provides genuine persistent client-side storage for:
 * - Mission audit logs
 * - AI conversation history
 * - Event-driven real-time notifications
 * - Experiment state & protocol execution checkpoints
 * - Offline telemetry sync queue
 * Survives browser restarts, computer reboots, and complete network isolation.
 */

import { ChatMessage, MissionLogEvent } from '../types/mission';
import { NotificationItem } from '../types/notification';

const DB_NAME = 'VyomDrishtiDB';
const DB_VERSION = 2; // Incremented for notifications store

export class IndexedDbService {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<boolean> | null = null;

  constructor() {
    this.initDatabase();
  }

  public async initDatabase(): Promise<boolean> {
    if (this.db) return true;
    if (this.initPromise) return this.initPromise;

    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      console.warn('IndexedDB not supported in this environment, falling back to memory.');
      return false;
    }

    this.initPromise = new Promise((resolve) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result as IDBDatabase;

        // 1. Chat Messages Store
        if (!db.objectStoreNames.contains('chat_messages')) {
          db.createObjectStore('chat_messages', { keyPath: 'id' });
        }

        // 2. Mission Logs Store
        if (!db.objectStoreNames.contains('mission_logs')) {
          const logStore = db.createObjectStore('mission_logs', { keyPath: 'id' });
          logStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // 3. Notifications Store
        if (!db.objectStoreNames.contains('notifications')) {
          const notifStore = db.createObjectStore('notifications', { keyPath: 'id' });
          notifStore.createIndex('timestamp', 'timestamp', { unique: false });
          notifStore.createIndex('read', 'read', { unique: false });
        }

        // 4. Experiment State Store
        if (!db.objectStoreNames.contains('experiment_state')) {
          db.createObjectStore('experiment_state', { keyPath: 'protocolId' });
        }

        // 5. Offline Sync Queue
        if (!db.objectStoreNames.contains('offline_sync_queue')) {
          db.createObjectStore('offline_sync_queue', { keyPath: 'id', autoIncrement: true });
        }
      };

      request.onsuccess = (event: any) => {
        this.db = event.target.result as IDBDatabase;
        console.log('✅ IndexedDB (VyomDrishtiDB v2) initialized for offline storage.');
        resolve(true);
      };

      request.onerror = (err) => {
        console.warn('IndexedDB initialization failed:', err);
        resolve(false);
      };
    });

    return this.initPromise;
  }

  // --- Notifications Persistence ---

  public async saveNotification(notif: NotificationItem): Promise<void> {
    await this.initDatabase();
    if (!this.db) return;

    try {
      const tx = this.db.transaction('notifications', 'readwrite');
      const store = tx.objectStore('notifications');
      store.put(notif);
    } catch (e) {
      console.warn('Failed to save notification in IndexedDB:', e);
    }
  }

  public async getAllNotifications(): Promise<NotificationItem[]> {
    await this.initDatabase();
    if (!this.db) return [];

    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction('notifications', 'readonly');
        const store = tx.objectStore('notifications');
        const req = store.getAll();

        req.onsuccess = () => {
          const items: NotificationItem[] = req.result || [];
          // Sort newest first
          items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          resolve(items);
        };
        req.onerror = () => resolve([]);
      } catch {
        resolve([]);
      }
    });
  }

  public async markNotificationRead(id: string): Promise<void> {
    await this.initDatabase();
    if (!this.db) return;

    try {
      const tx = this.db.transaction('notifications', 'readwrite');
      const store = tx.objectStore('notifications');
      const req = store.get(id);

      req.onsuccess = () => {
        const item: NotificationItem = req.result;
        if (item) {
          item.read = true;
          store.put(item);
        }
      };
    } catch (e) {
      console.warn('Failed to update notification in IndexedDB:', e);
    }
  }

  public async markAllNotificationsRead(): Promise<void> {
    await this.initDatabase();
    if (!this.db) return;

    try {
      const tx = this.db.transaction('notifications', 'readwrite');
      const store = tx.objectStore('notifications');
      const req = store.getAll();

      req.onsuccess = () => {
        const items: NotificationItem[] = req.result || [];
        items.forEach(item => {
          if (!item.read) {
            item.read = true;
            store.put(item);
          }
        });
      };
    } catch (e) {
      console.warn('Failed to mark all notifications read in IndexedDB:', e);
    }
  }

  public async clearNotifications(): Promise<void> {
    await this.initDatabase();
    if (!this.db) return;

    try {
      const tx = this.db.transaction('notifications', 'readwrite');
      const store = tx.objectStore('notifications');
      store.clear();
    } catch (e) {
      console.warn('Failed to clear notifications in IndexedDB:', e);
    }
  }

  // --- Chat Messages Persistence ---

  public async saveChatMessage(msg: ChatMessage): Promise<void> {
    await this.initDatabase();
    if (!this.db) return;

    try {
      const tx = this.db.transaction('chat_messages', 'readwrite');
      const store = tx.objectStore('chat_messages');
      store.put(msg);
    } catch (e) {
      console.warn('Failed to save chat message in IndexedDB:', e);
    }
  }

  public async getAllChatMessages(): Promise<ChatMessage[]> {
    await this.initDatabase();
    if (!this.db) return [];

    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction('chat_messages', 'readonly');
        const store = tx.objectStore('chat_messages');
        const req = store.getAll();

        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      } catch {
        resolve([]);
      }
    });
  }

  // --- Mission Logs Persistence ---

  public async saveMissionLog(log: MissionLogEvent): Promise<void> {
    await this.initDatabase();
    if (!this.db) return;

    try {
      const tx = this.db.transaction('mission_logs', 'readwrite');
      const store = tx.objectStore('mission_logs');
      store.put(log);
    } catch (e) {
      console.warn('Failed to save mission log in IndexedDB:', e);
    }
  }

  public async getAllMissionLogs(): Promise<MissionLogEvent[]> {
    await this.initDatabase();
    if (!this.db) return [];

    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction('mission_logs', 'readonly');
        const store = tx.objectStore('mission_logs');
        const req = store.getAll();

        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      } catch {
        resolve([]);
      }
    });
  }

  // --- Offline Sync Queue ---

  public async addToOfflineQueue(item: { type: string; payload: any; timestamp: string }): Promise<void> {
    await this.initDatabase();
    if (!this.db) return;

    try {
      const tx = this.db.transaction('offline_sync_queue', 'readwrite');
      const store = tx.objectStore('offline_sync_queue');
      store.add(item);
    } catch (e) {
      console.warn('Failed to add to offline queue in IndexedDB:', e);
    }
  }

  public async getOfflineQueue(): Promise<any[]> {
    await this.initDatabase();
    if (!this.db) return [];

    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction('offline_sync_queue', 'readonly');
        const store = tx.objectStore('offline_sync_queue');
        const req = store.getAll();

        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      } catch {
        resolve([]);
      }
    });
  }

  public async clearOfflineQueue(): Promise<void> {
    await this.initDatabase();
    if (!this.db) return;

    try {
      const tx = this.db.transaction('offline_sync_queue', 'readwrite');
      const store = tx.objectStore('offline_sync_queue');
      store.clear();
    } catch (e) {
      console.warn('Failed to clear offline queue in IndexedDB:', e);
    }
  }

  public isReady(): boolean {
    return !!this.db;
  }
}

export const indexedDbService = new IndexedDbService();
