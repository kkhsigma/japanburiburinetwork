import { useQuery } from '@tanstack/react-query';
import { fetchCompounds, fetchCompound } from '@/lib/api';
import { mockCompounds } from '@/lib/mock-data';

export function useCompounds() {
  return useQuery({
    queryKey: ['compounds'],
    queryFn: fetchCompounds,
    placeholderData: () => ({
      data: mockCompounds,
    }),
  });
}

export function useCompound(id: string) {
  return useQuery({
    queryKey: ['compound', id],
    queryFn: () => fetchCompound(id),
    enabled: !!id,
    placeholderData: () => {
      const compound = mockCompounds.find((c) => c.id === id);
      return compound ? { data: compound, timeline: [], related_alerts: [], sources: [] } : undefined;
    },
  });
}
