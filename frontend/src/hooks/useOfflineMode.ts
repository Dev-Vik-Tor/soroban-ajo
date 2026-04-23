import { useOfflineContext } from '@/context/OfflineContext';
import type { Group } from '@/types';

interface Action {
  type: string;
  payload: any;
}

export interface UseOfflineModeReturn {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  cachedGroups: Group[];
  cachedDashboard: Record<string, unknown> | null;
  queueAction: (action: Action) => Promise<void>;
  refreshCache: () => Promise<void>;
}

/**
 * Convenience hook for offline mode state and actions.
 * Delegates to OfflineContext — must be used inside OfflineProvider.
 */
export function useOfflineMode(): UseOfflineModeReturn {
  const {
    isOnline,
    isSyncing,
    pendingCount,
    cachedGroups,
    cachedDashboard,
    addPendingAction,
    refreshCache,
  } = useOfflineContext();

  return {
    isOnline,
    isSyncing,
    pendingCount,
    cachedGroups,
    cachedDashboard,
    queueAction: addPendingAction,
    refreshCache,
  };
}
