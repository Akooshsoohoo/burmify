import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Round, RoundResult, VocabularyItem, CardSide } from '../data/vocabulary.types';
import { buildRound } from '../utils/buildRound';
import { shuffle } from '../utils/shuffleQueue';

type SessionStatus = 'idle' | 'exposure' | 'playing' | 'animating' | 'complete';
type CornerPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface SessionState {
  categoryId: string | null;
  allItems: VocabularyItem[];
  queue: VocabularyItem[];
  currentRound: Round | null;
  currentExposureItem: VocabularyItem | null;
  roundHistory: RoundResult[];
  currentAttempts: number;
  score: number;
  streak: number;
  maxStreak: number;
  status: SessionStatus;
  recentCorrectPositions: CornerPosition[];

  startSession: (categoryId: string, items: VocabularyItem[]) => void;
  confirmExposure: () => void;
  submitDrop: (droppedCornerId: string) => 'correct' | 'incorrect';
  advanceRound: () => void;
  setStatus: (s: SessionStatus) => void;
  endSession: () => void;
}

function pickModePair(): { questionMode: CardSide; answerMode: CardSide } {
  const pairs = [
    { questionMode: 'burmese' as CardSide, answerMode: 'image' as CardSide },
    { questionMode: 'image' as CardSide,   answerMode: 'burmese' as CardSide },
    { questionMode: 'burmese' as CardSide, answerMode: 'english' as CardSide },
    { questionMode: 'english' as CardSide, answerMode: 'burmese' as CardSide },
  ];
  return pairs[Math.floor(Math.random() * pairs.length)];
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
  categoryId: null,
  allItems: [],
  queue: [],
  currentRound: null,
  currentExposureItem: null,
  roundHistory: [],
  currentAttempts: 0,
  score: 0,
  streak: 0,
  maxStreak: 0,
  status: 'idle',
  recentCorrectPositions: [],

  startSession: (categoryId, items) => {
    const queue = shuffle([...items]);
    const first = queue[0];
    const rest = queue.slice(1);
    const { questionMode, answerMode } = pickModePair();
    const round = buildRound(first, items, questionMode, answerMode, []);
    set({
      categoryId,
      allItems: items,
      queue: rest,
      currentRound: round,
      currentExposureItem: first,
      roundHistory: [],
      currentAttempts: 0,
      score: 0,
      streak: 0,
      maxStreak: 0,
      status: 'exposure',
      recentCorrectPositions: [],
    });
  },

  confirmExposure: () => set({ status: 'playing' }),

  submitDrop: (droppedCornerId) => {
    const { currentRound } = get();
    if (!currentRound) return 'incorrect';
    const isCorrect = droppedCornerId === currentRound.correctCornerId;
    set((s) => ({ currentAttempts: s.currentAttempts + 1 }));
    if (isCorrect) {
      set((s) => {
        const newStreak = s.streak + 1;
        return {
          score: s.score + 1,
          streak: newStreak,
          maxStreak: Math.max(s.maxStreak, newStreak),
        };
      });
    } else {
      set({ streak: 0 });
    }
    return isCorrect ? 'correct' : 'incorrect';
  },

  advanceRound: () => {
    const { queue, allItems, roundHistory, currentRound, currentAttempts, recentCorrectPositions } = get();

    if (currentRound) {
      const correctPosition = currentRound.correctCornerId.split('-').slice(0, 2).join('-') as CornerPosition;
      const result: RoundResult = {
        itemId: currentRound.question.id,
        correct: currentAttempts === 1,
        attempts: currentAttempts,
        timestamp: Date.now(),
      };
      const newHistory = [...roundHistory, result];
      const newPositions = [...recentCorrectPositions, correctPosition].slice(-3) as CornerPosition[];

      if (queue.length === 0) {
        set({ roundHistory: newHistory, status: 'complete', currentRound: null, currentExposureItem: null, recentCorrectPositions: newPositions });
        return;
      }

      const next = queue[0];
      const remaining = queue.slice(1);
      const { questionMode, answerMode } = pickModePair();
      const round = buildRound(next, allItems, questionMode, answerMode, newPositions);
      set({
        queue: remaining,
        currentRound: round,
        currentExposureItem: next,
        currentAttempts: 0,
        roundHistory: newHistory,
        status: 'exposure',
        recentCorrectPositions: newPositions,
      });
    }
  },

    setStatus: (status) => set({ status }),
    endSession: () => set({ status: 'idle', currentRound: null, currentExposureItem: null }),
  }),
  {
    name: 'burmafy-session',
    partialize: (state) => ({
      categoryId: state.categoryId,
      allItems: state.allItems,
      queue: state.queue,
      currentRound: state.currentRound,
      currentExposureItem: state.currentExposureItem,
      roundHistory: state.roundHistory,
      currentAttempts: state.currentAttempts,
      score: state.score,
      streak: state.streak,
      maxStreak: state.maxStreak,
      status: state.status,
      recentCorrectPositions: state.recentCorrectPositions,
    }),
    onRehydrateStorage: () => (state) => {
      // Don't restore mid-animation — snap back to playing
      if (state && state.status === 'animating') state.status = 'playing';
    },
  }
));
