import { useQuery } from '@tanstack/react-query';
import { fetchSearch } from '@/lib/api';

export function useSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => fetchSearch(query),
    enabled: query.length >= 2,
    staleTime: 30000,
  });
}
