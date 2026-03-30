'use client';

import { useReminderSettings } from '@/hooks/useReminderSettings';
import { Mail, Bell, Smartphone, Clock } from 'lucide-react';

export function ReminderPreview() {
  const { preferences } = useReminderSettings();

  if (!preferences.enabled) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg text-gray-600">
        Reminders are disabled
      </div>
    );
  }

  const timingLabels: Record<string, string> = {
    immediate: 'Immediately',
    '1day': '1 Day Before',
    '3days': '3 Days Before',
    '1week': '1 Week Before',
  };

  const channelIcons: Record<string, any> = {
    email: Mail,
    push: Bell,
    sms: Smartphone,
  };

  return (
    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
      <h3 className="font-semibold text-blue-900">Reminder Preview</h3>
      
      <div className="flex items-center gap-2 text-sm">
        <Clock className="w-4 h-4" />
        <span>You'll receive reminders <strong>{timingLabels[preferences.timing]}</strong></span>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium">Via:</span>
        <div className="flex gap-2">
          {preferences.channels.map((channel) => {
            const Icon = channelIcons[channel];
            return (
              <div key={channel} className="flex items-center gap-1 bg-white px-2 py-1 rounded">
                <Icon className="w-3 h-3" />
                <span className="capitalize text-xs">{channel}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-xs text-gray-600">
        Frequency: <strong className="capitalize">{preferences.frequency}</strong>
      </div>
    </div>
  );
}
