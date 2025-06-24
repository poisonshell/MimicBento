'use client';

import { useEffect, useState } from 'react';
import { BlockModule, BlockConfig, BlockConfigForm } from '@/types/bento';

function ClockBlockComponent() {
  const [time, setTime] = useState<Date | null>(null);
  const [timeZone, setTimeZone] = useState('');

  useEffect(() => {
    // Set initial time on client-side mount
    setTime(new Date());

    const timerId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    const tz = Intl.DateTimeFormat()
      .resolvedOptions()
      .timeZone.replace(/_/g, ' ');
    setTimeZone(tz);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  const formattedTime = time
    ? time.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    : '--:--';

  return (
    <div className="p-4 h-full w-full flex flex-col items-center justify-center text-center bg-gradient-to-br from-indigo-500 to-fuchsia-500 rounded-xl overflow-hidden">
      <div className="text-6xl font-bold tracking-tighter text-white">
        {formattedTime}
      </div>
      <div className="text-xs text-white/80 mt-1 truncate">{timeZone}</div>
    </div>
  );
}

// Block configuration
const config: BlockConfig = {
  type: 'clock',
  name: 'Clock',
  icon: 'FiClock',
  description: 'Live clock showing current time',
  defaultSize: 'small',
  supportedSizes: ['small', 'medium'],
  category: 'utility',
  version: '1.0.0',
  author: {
    name: 'MimicBento',
  },
};

// Configuration form (minimal for clock)
const configForm: BlockConfigForm = {
  fields: [
    {
      key: 'timezone',
      label: 'Timezone',
      type: 'select',
      defaultValue: 'auto',
      options: [
        { value: 'auto', label: 'Auto-detect' },
        { value: 'UTC', label: 'UTC' },
        { value: 'America/New_York', label: 'Eastern Time' },
        { value: 'America/Chicago', label: 'Central Time' },
        { value: 'America/Denver', label: 'Mountain Time' },
        { value: 'America/Los_Angeles', label: 'Pacific Time' },
        { value: 'Europe/London', label: 'London' },
        { value: 'Europe/Paris', label: 'Paris' },
        { value: 'Asia/Tokyo', label: 'Tokyo' },
      ],
      help: 'Choose the timezone to display',
    },
    {
      key: 'format',
      label: 'Time Format',
      type: 'select',
      defaultValue: '24h',
      options: [
        { value: '12h', label: '12-hour (AM/PM)' },
        { value: '24h', label: '24-hour' },
      ],
    },
  ],
};

// Default content when creating a new clock block
const getDefaultContent = () => ({
  timezone: 'auto',
  format: '24h',
});

// Block module export
export const blockModule: BlockModule = {
  config,
  Component: ClockBlockComponent,
  configForm,
  getDefaultContent,
};

// Export the component for backwards compatibility
export default ClockBlockComponent;
