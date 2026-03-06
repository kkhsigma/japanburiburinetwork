import { create } from 'zustand';
import type { Alert, AlertFilters } from '@/types';

interface AlertsState {
  alerts: Alert[];
  selectedAlert: Alert | null;
  filters: AlertFilters;
  isLoading: boolean;
  error: string | null;

  setAlerts: (alerts: Alert[]) => void;
  setSelectedAlert: (alert: Alert | null) => void;
  setFilters: (filters: Partial<AlertFilters>) => void;
  resetFilters: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const defaultFilters: AlertFilters = {
  page: 1,
  limit: 20,
};

export const useAlertsStore = create<AlertsState>((set) => ({
  alerts: [],
  selectedAlert: null,
  filters: defaultFilters,
  isLoading: false,
  error: null,

  setAlerts: (alerts) => set({ alerts }),
  setSelectedAlert: (alert) => set({ selectedAlert: alert }),
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  resetFilters: () => set({ filters: defaultFilters }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
