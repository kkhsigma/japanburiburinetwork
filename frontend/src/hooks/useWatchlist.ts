import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  fetchWatchlistHighlights,
} from '@/lib/api';
import { useWatchlistStore } from '@/stores/watchlistStore';
import type { WatchlistEntry } from '@/types';

export function useWatchlist() {
  return useQuery({
    queryKey: ['watchlist'],
    queryFn: fetchWatchlist,
  });
}

export function useWatchlistHighlights() {
  return useQuery({
    queryKey: ['watchlist', 'highlights'],
    queryFn: fetchWatchlistHighlights,
    refetchInterval: 120000, // Refetch every 2 min
  });
}

export function useAddToWatchlist() {
  const queryClient = useQueryClient();
  const { addEntry } = useWatchlistStore.getState();

  return useMutation({
    mutationFn: addToWatchlist,
    // Optimistic update
    onMutate: async (newEntry) => {
      await queryClient.cancelQueries({ queryKey: ['watchlist'] });
      const optimisticEntry: WatchlistEntry = {
        id: `temp-${Date.now()}`,
        user_id: '',
        entity_type: newEntry.entity_type as WatchlistEntry['entity_type'],
        entity_id: newEntry.entity_id,
        entity_name: newEntry.entity_name,
        created_at: new Date().toISOString(),
        notification_enabled: newEntry.notification_enabled ?? true,
      };
      addEntry(optimisticEntry);
      return { optimisticEntry };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
    onError: (_err, _vars, context) => {
      if (context?.optimisticEntry) {
        useWatchlistStore.getState().removeEntry(context.optimisticEntry.id);
      }
    },
  });
}

export function useRemoveFromWatchlist() {
  const queryClient = useQueryClient();
  const store = useWatchlistStore.getState();

  return useMutation({
    mutationFn: removeFromWatchlist,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['watchlist'] });
      const removed = store.entries.find((e) => e.id === id);
      store.removeEntry(id);
      return { removed };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
    onError: (_err, _id, context) => {
      if (context?.removed) {
        store.addEntry(context.removed);
      }
    },
  });
}
