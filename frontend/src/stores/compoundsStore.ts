import { create } from 'zustand';
import type { Compound, CompoundStateTransition } from '@/types';

interface CompoundsState {
  compounds: Compound[];
  selectedCompound: Compound | null;
  selectedTimeline: CompoundStateTransition[];
  searchResults: Compound[];
  isLoading: boolean;
  error: string | null;

  setCompounds: (compounds: Compound[]) => void;
  setSelectedCompound: (compound: Compound | null) => void;
  setSelectedTimeline: (timeline: CompoundStateTransition[]) => void;
  setSearchResults: (results: Compound[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useCompoundsStore = create<CompoundsState>((set) => ({
  compounds: [],
  selectedCompound: null,
  selectedTimeline: [],
  searchResults: [],
  isLoading: false,
  error: null,

  setCompounds: (compounds) => set({ compounds }),
  setSelectedCompound: (compound) => set({ selectedCompound: compound }),
  setSelectedTimeline: (timeline) => set({ selectedTimeline: timeline }),
  setSearchResults: (results) => set({ searchResults: results }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
