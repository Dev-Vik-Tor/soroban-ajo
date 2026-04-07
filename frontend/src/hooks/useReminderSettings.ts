import { useState, useCallback } from 'react';

export interface ReminderPreferences {
  enabled: boolean;
  timing: 'immediate' | '1day' | '3days' | '1week';
  channels: ('email' | 'push' | 'sms')[];
  frequency: 'once' | 'daily' | 'weekly';
}

const DEFAULT_PREFERENCES: ReminderPreferences = {
  enabled: true,
  timing: '1day',
  channels: ['email', 'push'],
  frequency: 'daily',
};

export function useReminderSettings() {
  const [preferences, setPreferences] = useState<ReminderPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePreferences = useCallback(async (newPrefs: Partial<ReminderPreferences>) => {
    setLoading(true);
    setError(null);
    try {
      const updated = { ...preferences, ...newPrefs };
      setPreferences(updated);
      // TODO: Persist to backend
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update preferences';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [preferences]);

  const resetToDefaults = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
  }, []);

  return {
    preferences,
    updatePreferences,
    resetToDefaults,
    loading,
    error,
  };
}
