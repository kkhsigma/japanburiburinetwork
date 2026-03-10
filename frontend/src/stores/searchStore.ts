import { create } from 'zustand';
import type { HybridSearchResult, SearchMode } from '@/types';

interface SearchState {
  query: string;
  mode: SearchMode;
  results: HybridSearchResult | null;
  isSearching: boolean;
  error: string | null;
  aiAnswer: string;
  aiIsStreaming: boolean;
  aiError: string | null;
  setQuery: (query: string) => void;
  setMode: (mode: SearchMode) => void;
  setResults: (results: HybridSearchResult) => void;
  clearSearch: () => void;
  setSearching: (searching: boolean) => void;
  setError: (error: string | null) => void;
  appendAiText: (text: string) => void;
  setAiStreaming: (streaming: boolean) => void;
  setAiError: (error: string | null) => void;
  resetAi: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  mode: 'search',
  results: null,
  isSearching: false,
  error: null,
  aiAnswer: '',
  aiIsStreaming: false,
  aiError: null,
  setQuery: (query) => set({ query }),
  setMode: (mode) => set({ mode }),
  setResults: (results) => set({ results }),
  clearSearch: () => set({ query: '', results: null, aiAnswer: '', aiIsStreaming: false, aiError: null }),
  setSearching: (isSearching) => set({ isSearching }),
  setError: (error) => set({ error }),
  appendAiText: (text) => set((state) => ({ aiAnswer: state.aiAnswer + text })),
  setAiStreaming: (aiIsStreaming) => set({ aiIsStreaming }),
  setAiError: (aiError) => set({ aiError }),
  resetAi: () => set({ aiAnswer: '', aiIsStreaming: false, aiError: null }),
}));
