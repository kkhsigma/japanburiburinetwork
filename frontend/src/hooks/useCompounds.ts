import { useQuery } from '@tanstack/react-query';
import { fetchCompounds, fetchCompound } from '@/lib/api';

export function useCompounds() {
  return useQuery({
    queryKey: ['compounds'],
    queryFn: fetchCompounds,
  });
}

export function useCompound(id: string) {
  return useQuery({
    queryKey: ['compound', id],
    queryFn: () => fetchCompound(id),
    enabled: !!id,
  });
}
