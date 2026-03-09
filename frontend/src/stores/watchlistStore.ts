import { create } from 'zustand';
import type { WatchlistEntry, WatchlistHighlight } from '@/types';

interface WatchlistState {
  entries: WatchlistEntry[];
  highlights: WatchlistHighlight[];
  isLoading: boolean;
  error: string | null;

  setEntries: (entries: WatchlistEntry[]) => void;
  addEntry: (entry: WatchlistEntry) => void;
  removeEntry: (id: string) => void;
  setHighlights: (highlights: WatchlistHighlight[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  isTracked: (entityId: string) => boolean;
  toggleNotification: (id: string) => void;
}

export const useWatchlistStore = create<WatchlistState>((set, get) => ({
  entries: [],
  highlights: [],
  isLoading: false,
  error: null,

  setEntries: (entries) => set({ entries }),
  addEntry: (entry) =>
    set((state) => ({ entries: [...state.entries, entry] })),
  removeEntry: (id) =>
    set((state) => ({ entries: state.entries.filter((e) => e.id !== id) })),
  setHighlights: (highlights) => set({ highlights }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  isTracked: (entityId: string) =>
    get().entries.some((e) => e.entity_id === entityId),
  toggleNotification: (id: string) =>
    set((state) => ({
      entries: state.entries.map((e) =>
        e.id === id ? { ...e, notification_enabled: !e.notification_enabled } : e
      ),
    })),
}));
