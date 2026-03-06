import { create } from 'zustand';
import type { UpdateCard } from '@/types';

type IntroPhase = 'idle' | 'growing' | 'scanning' | 'cards' | 'splitting' | 'done';

interface IntroState {
  phase: IntroPhase;
  progress: number;
  updateCards: UpdateCard[];
  currentCardIndex: number;
  shouldShowIntro: boolean;

  setPhase: (phase: IntroPhase) => void;
  setProgress: (progress: number) => void;
  setUpdateCards: (cards: UpdateCard[]) => void;
  dismissCard: () => void;
  setShouldShowIntro: (show: boolean) => void;
  checkShouldShowIntro: () => void;
  markVisited: () => void;
}

const TWENTY_FOUR_HOURS = 86400000;

export const useIntroStore = create<IntroState>((set, get) => ({
  phase: 'idle',
  progress: 0,
  updateCards: [],
  currentCardIndex: 0,
  shouldShowIntro: false,

  setPhase: (phase) => set({ phase }),
  setProgress: (progress) => set({ progress }),
  setUpdateCards: (cards) => set({ updateCards: cards, currentCardIndex: 0 }),

  dismissCard: () => {
    const { currentCardIndex, updateCards } = get();
    if (currentCardIndex < updateCards.length - 1) {
      set({ currentCardIndex: currentCardIndex + 1 });
    } else {
      set({ phase: 'splitting' });
    }
  },

  setShouldShowIntro: (show) => set({ shouldShowIntro: show }),

  checkShouldShowIntro: () => {
    if (typeof window === 'undefined') return;
    const lastVisit = localStorage.getItem('jbn_last_visit');
    const now = Date.now();
    const shouldShow = !lastVisit || now - Number(lastVisit) > TWENTY_FOUR_HOURS;
    set({ shouldShowIntro: shouldShow });
  },

  markVisited: () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('jbn_last_visit', String(Date.now()));
    }
    set({ phase: 'done', shouldShowIntro: false });
  },
}));
