import { offlineStorage } from './offlineStorage';

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
  try {
    const pendingActions = await offlineStorage.getAllActions();

    for (const action of pendingActions) {
      try {
        // Attempt to sync the action
        await syncAction(action);
        // Remove from storage if successful
        await offlineStorage.removeAction(action.id);
      } catch (error) {
        console.error(`Failed to sync action ${action.id}:`, error);
        // Keep the action in storage for retry
      }
    }
  } catch (error) {
    console.error('Failed to sync pending actions:', error);
  }
}

async function syncAction(action: Action): Promise<void> {
  // This would integrate with your API service
  // For now, we'll simulate a sync
  console.log('Syncing action:', action);

  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 100));

  // In a real implementation, you would:
  // - Make the actual API request based on action.type
  // - Handle success/failure appropriately
  // - Update local state optimistically
}

export async function getPendingActionCount(): Promise<number> {
  try {
    const actions = await offlineStorage.getAllActions();
    return actions.length;
  } catch (error) {
    console.error('Failed to get pending action count:', error);
    return 0;
  }
}