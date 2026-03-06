import { create } from 'zustand';
import type { Alert, Compound } from '@/types';

interface SearchState {
  query: string;
  results: {
    compounds: Compound[];
    alerts: Alert[];
    products: unknown[];  // v1
  };
  isSearching: boolean;
  error: string | null;

  setQuery: (query: string) => void;
  setResults: (results: SearchState['results']) => void;
  clearSearch: () => void;
  setSearching: (searching: boolean) => void;
  setError: (error: string | null) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  results: { compounds: [], alerts: [], products: [] },
  isSearching: false,
  error: null,

  setQuery: (query) => set({ query }),
  setResults: (results) => set({ results }),
  clearSearch: () =>
    set({ query: '', results: { compounds: [], alerts: [], products: [] } }),
  setSearching: (isSearching) => set({ isSearching }),
  setError: (error) => set({ error }),
}));
