import { create } from 'zustand';
import type { UserSettings, NotificationPreference } from '@/types';

interface SettingsState {
  settings: UserSettings;
  isLoading: boolean;
  error: string | null;

  setSettings: (settings: UserSettings) => void;
  updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
  setNotificationPreference: (pref: NotificationPreference) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const defaultSettings: UserSettings = {
  notification_preference: 'critical_only',
  language: 'technical',
  intro_enabled: true,
  push_enabled: false,
};

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: defaultSettings,
  isLoading: false,
  error: null,

  setSettings: (settings) => set({ settings }),
  updateSetting: (key, value) =>
    set((state) => ({ settings: { ...state.settings, [key]: value } })),
  setNotificationPreference: (pref) =>
    set((state) => ({
      settings: { ...state.settings, notification_preference: pref },
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
