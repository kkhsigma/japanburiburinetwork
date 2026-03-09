import { useQuery } from '@tanstack/react-query';
import { fetchAlerts, fetchAlert, fetchCriticalAlerts, fetchUpcomingAlerts } from '@/lib/api';
import { mockAlerts } from '@/lib/mock-data';
import type { AlertFilters } from '@/types';

export function useAlerts(filters: AlertFilters = {}) {
  return useQuery({
    queryKey: ['alerts', filters],
    queryFn: () => fetchAlerts(filters),
    placeholderData: () => {
      let filtered = [...mockAlerts];
      if (filters.severity) {
        filtered = filtered.filter((a) => a.severity === filters.severity);
      }
      if (filters.category) {
        filtered = filtered.filter((a) => a.category === filters.category);
      }
      if (filters.compound) {
        filtered = filtered.filter((a) =>
          a.compounds.some((c) => c.toLowerCase().includes(filters.compound!.toLowerCase()))
        );
      }
      if (filters.status) {
        filtered = filtered.filter((a) => a.status === filters.status);
      }
      return {
        data: filtered,
        pagination: {
          page: filters.page ?? 1,
          total: filtered.length,
          hasMore: false,
        },
      };
    },
  });
}

export function useAlert(id: string) {
  return useQuery({
    queryKey: ['alert', id],
    queryFn: () => fetchAlert(id),
    enabled: !!id,
    placeholderData: () => {
      const alert = mockAlerts.find((a) => a.id === id);
      return alert ? { data: alert } : undefined;
    },
  });
}

export function useCriticalAlerts() {
  return useQuery({
    queryKey: ['alerts', 'critical'],
    queryFn: fetchCriticalAlerts,
    refetchInterval: 60000,
    placeholderData: () => ({
      data: mockAlerts.filter((a) => a.severity === 'critical'),
    }),
  });
}

export function useUpcomingDates() {
  return useQuery({
    queryKey: ['alerts', 'upcoming'],
    queryFn: fetchUpcomingAlerts,
    placeholderData: () => ({
      data: mockAlerts.filter((a) => a.effective_at && new Date(a.effective_at) > new Date()),
    }),
  });
}
