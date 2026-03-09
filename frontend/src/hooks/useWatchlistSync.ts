import { useEffect } from 'react';
import { useWatchlistStore } from '@/stores/watchlistStore';
import { useWatchlist, useWatchlistHighlights, useAddToWatchlist, useRemoveFromWatchlist } from './useWatchlist';

/**
 * Syncs React Query watchlist data into the Zustand store.
 * Call this once near the top of your component tree.
 */
export function useWatchlistSync() {
  const { data: watchlistData } = useWatchlist();
  const { data: highlightsData } = useWatchlistHighlights();
  const { setEntries, setHighlights } = useWatchlistStore();

  useEffect(() => {
    if (watchlistData?.data) {
      setEntries(watchlistData.data);
    }
  }, [watchlistData, setEntries]);

  useEffect(() => {
    if (highlightsData?.data) {
      setHighlights(highlightsData.data);
    }
  }, [highlightsData, setHighlights]);
}

/**
 * Returns whether a compound is tracked in the watchlist.
 */
export function useIsTracked(compoundId: string): boolean {
  return useWatchlistStore((state) => state.entries.some((e) => e.entity_id === compoundId));
}

/**
 * Returns tracking state and a toggle function for a compound.
 */
export function useToggleTracking(compound: { id: string; name: string }) {
  const isTracked = useIsTracked(compound.id);
  const addMutation = useAddToWatchlist();
  const removeMutation = useRemoveFromWatchlist();
  const entries = useWatchlistStore((state) => state.entries);

  const isLoading = addMutation.isPending || removeMutation.isPending;

  const toggle = () => {
    if (isLoading) return;

    if (isTracked) {
      const entry = entries.find((e) => e.entity_id === compound.id);
      if (entry) {
        removeMutation.mutate(entry.id);
      }
    } else {
      addMutation.mutate({
        entity_type: 'compound',
        entity_id: compound.id,
        entity_name: compound.name,
        notification_enabled: true,
      });
    }
  };

  return { isTracked, toggle, isLoading };
}
