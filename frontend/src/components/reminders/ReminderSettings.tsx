'use client';

import { useState } from 'react';
import { Bell, Mail, Smartphone, Clock } from 'lucide-react';
import { useReminderSettings, ReminderPreferences } from '@/hooks/useReminderSettings';

export function ReminderSettings() {
  const { preferences, updatePreferences, loading } = useReminderSettings();
  const [saved, setSaved] = useState(false);

  const handleToggle = async (key: keyof ReminderPreferences, value: any) => {
    await updatePreferences({ [key]: value });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChannelToggle = (channel: 'email' | 'push' | 'sms') => {
    const newChannels = preferences.channels.includes(channel)
      ? preferences.channels.filter(c => c !== channel)
      : [...preferences.channels, channel];
    handleToggle('channels', newChannels);
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="w-6 h-6" />
          Contribution Reminders
        </h2>
        {saved && <span className="text-green-600 text-sm">Saved!</span>}
      </div>

      {/* Enable/Disable */}
      <div className="border-b pb-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={preferences.enabled}
            onChange={(e) => handleToggle('enabled', e.target.checked)}
            disabled={loading}
            className="w-4 h-4"
          />
          <span className="font-medium">Enable Reminders</span>
        </label>
      </div>

      {preferences.enabled && (
        <>
          {/* Timing */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 font-medium">
              <Clock className="w-4 h-4" />
              Reminder Timing
            </label>
            <select
              value={preferences.timing}
              onChange={(e) => handleToggle('timing', e.target.value)}
              disabled={loading}
              className="w-full p-2 border rounded-md"
            >
              <option value="immediate">Immediately</option>
              <option value="1day">1 Day Before</option>
              <option value="3days">3 Days Before</option>
              <option value="1week">1 Week Before</option>
            </select>
          </div>

          {/* Frequency */}
          <div className="space-y-3">
            <label className="font-medium">Frequency</label>
            <select
              value={preferences.frequency}
              onChange={(e) => handleToggle('frequency', e.target.value)}
              disabled={loading}
              className="w-full p-2 border rounded-md"
            >
              <option value="once">Once</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          {/* Channels */}
          <div className="space-y-3">
            <label className="font-medium">Notification Channels</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.channels.includes('email')}
                  onChange={() => handleChannelToggle('email')}
                  disabled={loading}
                  className="w-4 h-4"
                />
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.channels.includes('push')}
                  onChange={() => handleChannelToggle('push')}
                  disabled={loading}
                  className="w-4 h-4"
                />
                <Bell className="w-4 h-4" />
                <span>Push Notification</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.channels.includes('sms')}
                  onChange={() => handleChannelToggle('sms')}
                  disabled={loading}
                  className="w-4 h-4"
                />
                <Smartphone className="w-4 h-4" />
                <span>SMS</span>
              </label>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
