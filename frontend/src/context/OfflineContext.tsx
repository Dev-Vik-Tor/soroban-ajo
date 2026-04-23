'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { offlineStorage } from '@/utils/offlineStorage';
import { syncPendingActions, queueAction, getPendingActionCount } from '@/utils/syncManager';
import type { Group } from '@/types';

interface Action {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
}

interface OfflineContextValue {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  cachedGroups: Group[];
  cachedDashboard: Record<string, unknown> | null;
  addPendingAction: (action: Omit<Action, 'id' | 'timestamp'>) => Promise<void>;
  refreshCache: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextValue | null>(null);

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [cachedGroups, setCachedGroups] = useState<Group[]>([]);
  const [cachedDashboard, setCachedDashboard] = useState<Record<string, unknown> | null>(null);
  const wasOffline = useRef(false);

  const refreshCache = useCallback(async () => {
    const [groups, dashboard] = await Promise.all([
      offlineStorage.getCachedGroups(),
      offlineStorage.getCachedDashboard(),
    ]);
    setCachedGroups(groups);
    setCachedDashboard(dashboard);
    const count = await getPendingActionCount();
    setPendingCount(count);
  }, []);

  // Load cache on mount
  useEffect(() => {
    refreshCache();
  }, [refreshCache]);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      if (wasOffline.current) {
        wasOffline.current = false;
        setIsSyncing(true);
        try {
          await syncPendingActions();
        } finally {
          setIsSyncing(false);
          await refreshCache();
        }
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      wasOffline.current = true;
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshCache]);

  const addPendingAction = useCallback(
    async (action: Omit<Action, 'id' | 'timestamp'>) => {
      const full: Action = {
        ...action,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: Date.now(),
      };
      await queueAction(full);
      setPendingCount((c) => c + 1);
    },
    [],
  );

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        isSyncing,
        pendingCount,
        cachedGroups,
        cachedDashboard,
        addPendingAction,
        refreshCache,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

export function useOfflineContext(): OfflineContextValue {
  const ctx = useContext(OfflineContext);
  if (!ctx) throw new Error('useOfflineContext must be used within OfflineProvider');
  return ctx;
}
