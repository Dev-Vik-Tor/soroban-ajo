import { useState, useEffect } from 'react';
import { queueAction, syncPendingActions } from '../utils/syncManager';

interface Action {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
}

export function useOfflineMode() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActions, setPendingActions] = useState<Action[]>([]);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      await syncPendingActions();
      // Refresh pending actions list
      setPendingActions([]);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addPendingAction = (action: Omit<Action, 'id' | 'timestamp'>) => {
    const fullAction: Action = {
      ...action,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };

    if (!isOnline) {
      queueAction(fullAction);
      setPendingActions(prev => [...prev, fullAction]);
    }
  };

  return { isOnline, pendingActions, queueAction: addPendingAction };
}