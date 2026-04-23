// Offline storage utilities using IndexedDB

import type { Group } from '@/types'

interface Action {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
}

export interface CachedData {
  groups?: Group[];
  dashboardStats?: Record<string, unknown>;
  cachedAt: number;
}

class OfflineStorage {
  private db: IDBDatabase | null = null;
  private readonly dbName = 'AjoOfflineDB';
  private readonly version = 2;
  private readonly actionsStore = 'pendingActions';
  private readonly cacheStore = 'dataCache';

  async init(): Promise<void> {
    if (this.db) return;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.actionsStore)) {
          db.createObjectStore(this.actionsStore, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(this.cacheStore)) {
          db.createObjectStore(this.cacheStore, { keyPath: 'key' });
        }
      };
    });
  }

  // ── Pending Actions ──────────────────────────────────────────────────────────

  async addAction(action: Action): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([this.actionsStore], 'readwrite');
      const req = tx.objectStore(this.actionsStore).add(action);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve();
    });
  }

  async getAllActions(): Promise<Action[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([this.actionsStore], 'readonly');
      const req = tx.objectStore(this.actionsStore).getAll();
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(req.result);
    });
  }

  async removeAction(id: string): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([this.actionsStore], 'readwrite');
      const req = tx.objectStore(this.actionsStore).delete(id);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve();
    });
  }

  async clearAll(): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([this.actionsStore], 'readwrite');
      const req = tx.objectStore(this.actionsStore).clear();
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve();
    });
  }

  // ── Data Cache ───────────────────────────────────────────────────────────────

  async setCacheEntry<T>(key: string, data: T): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([this.cacheStore], 'readwrite');
      const req = tx.objectStore(this.cacheStore).put({ key, data, cachedAt: Date.now() });
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve();
    });
  }

  async getCacheEntry<T>(key: string): Promise<{ data: T; cachedAt: number } | null> {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([this.cacheStore], 'readonly');
      const req = tx.objectStore(this.cacheStore).get(key);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(req.result ?? null);
    });
  }

  /** Merge incoming groups with cached groups using last-write-wins on createdAt. */
  async mergeGroups(incoming: Group[]): Promise<Group[]> {
    const cached = await this.getCacheEntry<Group[]>('groups');
    const existing = cached?.data ?? [];
    const map = new Map<string, Group>(existing.map((g) => [g.id, g]));
    for (const group of incoming) {
      const prev = map.get(group.id);
      if (!prev || group.createdAt >= prev.createdAt) {
        map.set(group.id, group);
      }
    }
    const merged = Array.from(map.values());
    await this.setCacheEntry('groups', merged);
    return merged;
  }

  async getCachedGroups(): Promise<Group[]> {
    const entry = await this.getCacheEntry<Group[]>('groups');
    return entry?.data ?? [];
  }

  async setCachedDashboard(stats: Record<string, unknown>): Promise<void> {
    await this.setCacheEntry('dashboardStats', stats);
  }

  async getCachedDashboard(): Promise<Record<string, unknown> | null> {
    const entry = await this.getCacheEntry<Record<string, unknown>>('dashboardStats');
    return entry?.data ?? null;
  }
}

export const offlineStorage = new OfflineStorage();
