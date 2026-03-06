import { create } from 'zustand';

export type NotificationType = 'critical' | 'warning' | 'info' | 'success';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  alertId?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;

  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismissNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [
    {
      id: 'n1',
      type: 'critical',
      title: '新規指定薬物4種追加',
      description: 'THCP、HHCP、HHCH、HHC-Oが指定薬物リストに追加。2026年4月1日施行。',
      timestamp: '2026-03-04T10:00:00Z',
      read: false,
      alertId: '1',
    },
    {
      id: 'n2',
      type: 'warning',
      title: 'CBN規制審査中',
      description: '厚生労働省委員会がCBNの指定薬物指定を検討中。',
      timestamp: '2026-02-15T10:00:00Z',
      read: false,
      alertId: '3',
    },
    {
      id: 'n3',
      type: 'info',
      title: 'CBD輸入手続き変更',
      description: '輸入検証手続きの変更案に関するパブリックコメント募集中。',
      timestamp: '2026-02-20T10:00:00Z',
      read: true,
      alertId: '5',
    },
  ],
  unreadCount: 2,

  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  markRead: (id) => {
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id);
      if (!notification || notification.read) return state;
      return {
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    });
  },

  markAllRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  dismissNotification: (id) => {
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id);
      const wasUnread = notification && !notification.read;
      return {
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      };
    });
  },
}));
