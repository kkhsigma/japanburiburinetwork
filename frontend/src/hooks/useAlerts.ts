import { useQuery } from '@tanstack/react-query';
import { fetchAlerts, fetchAlert, fetchCriticalAlerts, fetchUpcomingAlerts } from '@/lib/api';
import type { AlertFilters } from '@/types';

export function useAlerts(filters: AlertFilters = {}) {
  return useQuery({
    queryKey: ['alerts', filters],
    queryFn: () => fetchAlerts(filters),
  });
}

export function useAlert(id: string) {
  return useQuery({
    queryKey: ['alert', id],
    queryFn: () => fetchAlert(id),
    enabled: !!id,
  });
}

export function useCriticalAlerts() {
  return useQuery({
    queryKey: ['alerts', 'critical'],
    queryFn: fetchCriticalAlerts,
    refetchInterval: 60000, // Refetch every 60s for critical alerts
  });
}

export function useUpcomingDates() {
  return useQuery({
    queryKey: ['alerts', 'upcoming'],
    queryFn: fetchUpcomingAlerts,
  });
}
