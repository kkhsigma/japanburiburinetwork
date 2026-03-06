import { useQuery } from '@tanstack/react-query';
import { fetchRecentUpdates } from '@/lib/api';

export function useRecentUpdates() {
  return useQuery({
    queryKey: ['updates', 'recent'],
    queryFn: fetchRecentUpdates,
  });
}
