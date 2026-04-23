import { offlineStorage } from './offlineStorage';
import { backendApiClient } from '@/lib/apiClient';

interface Action {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
}

export async function queueAction(action: Action): Promise<void> {
  try {
    await offlineStorage.addAction(action);
  } catch (error) {
    console.error('Failed to queue action:', error);
  }
}

export async function syncPendingActions(): Promise<void> {
  const pendingActions = await offlineStorage.getAllActions();

  for (const action of pendingActions) {
    try {
      await syncAction(action);
      await offlineStorage.removeAction(action.id);
    } catch (error) {
      console.error(`Failed to sync action ${action.id}:`, error);
      // Keep in storage for retry on next sync
    }
  }

  // Refresh data cache after sync
  try {
    const groups = await backendApiClient.request<any[]>({ path: '/api/v1/groups', method: 'GET' });
    if (Array.isArray(groups)) {
      await offlineStorage.mergeGroups(groups);
    }
  } catch {
    // Network still flaky — cached data remains valid
  }
}

/**
 * Execute a single queued action against the real API.
 * Uses last-write-wins: the server is authoritative on success.
 */
async function syncAction(action: Action): Promise<void> {
  switch (action.type) {
    case 'createGroup':
      await backendApiClient.request({
        path: '/api/v1/groups',
        method: 'POST',
        body: action.payload,
      });
      break;

    case 'joinGroup':
      await backendApiClient.request({
        path: `/api/v1/groups/${action.payload.groupId}/join`,
        method: 'POST',
        body: { publicKey: action.payload.publicKey },
      });
      break;

    case 'contribute':
      await backendApiClient.request({
        path: `/api/v1/groups/${action.payload.groupId}/contribute`,
        method: 'POST',
        body: {
          amount: action.payload.amount,
          signedXdr: action.payload.signedXdr,
        },
      });
      break;

    default:
      // Generic fallback: POST to /api/v1/actions with the full action payload
      await backendApiClient.request({
        path: '/api/v1/actions',
        method: 'POST',
        body: action,
      });
  }
}

export async function getPendingActionCount(): Promise<number> {
  try {
    const actions = await offlineStorage.getAllActions();
    return actions.length;
  } catch {
    return 0;
  }
}
