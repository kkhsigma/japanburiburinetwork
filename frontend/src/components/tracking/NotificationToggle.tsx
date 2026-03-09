"use client";

import { Bell, BellOff } from 'lucide-react';
import { useWatchlistStore } from '@/stores/watchlistStore';

interface NotificationToggleProps {
  entryId: string;
  enabled: boolean;
}

export function NotificationToggle({ entryId, enabled }: NotificationToggleProps) {
  const toggleNotification = useWatchlistStore((state) => state.toggleNotification);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggleNotification(entryId);
      }}
      className={`
        inline-flex items-center justify-center
        rounded p-1 transition-colors duration-150
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40
        ${
          enabled
            ? 'text-accent-300 hover:text-accent-400'
            : 'text-text-muted hover:text-text-secondary'
        }
      `}
      title={enabled ? '通知オン' : '通知オフ'}
      aria-label={enabled ? 'Disable notifications' : 'Enable notifications'}
    >
      {enabled ? <Bell size={16} /> : <BellOff size={16} />}
    </button>
  );
}
