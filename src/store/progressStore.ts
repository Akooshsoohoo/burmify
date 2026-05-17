import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RoundResult } from '../data/vocabulary.types';

export interface WordProgress {
  itemId: string;
  exposureCount: number;
  correct: number;
  incorrect: number;
  lastSeen: number;
}

interface ProgressState {
  wordProgress: Record<string, WordProgress>;
  totalSessions: number;
  recordResult: (result: RoundResult) => void;
  recordExposure: (itemId: string) => void;
  incrementSessions: () => void;
  getWordProgress: (itemId: string) => WordProgress | undefined;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      wordProgress: {},
      totalSessions: 0,
      recordResult: (result) =>
        set((s) => {
          const prev = s.wordProgress[result.itemId] ?? { itemId: result.itemId, exposureCount: 0, correct: 0, incorrect: 0, lastSeen: 0 };
          return {
            wordProgress: {
              ...s.wordProgress,
              [result.itemId]: {
                ...prev,
                correct: prev.correct + (result.correct ? 1 : 0),
                incorrect: prev.incorrect + (result.correct ? 0 : 1),
                lastSeen: result.timestamp,
              },
            },
          };
        }),
      recordExposure: (itemId) =>
        set((s) => {
          const prev = s.wordProgress[itemId] ?? { itemId, exposureCount: 0, correct: 0, incorrect: 0, lastSeen: 0 };
          return {
            wordProgress: {
              ...s.wordProgress,
              [itemId]: { ...prev, exposureCount: prev.exposureCount + 1, lastSeen: Date.now() },
            },
          };
        }),
      incrementSessions: () => set((s) => ({ totalSessions: s.totalSessions + 1 })),
      getWordProgress: (itemId) => get().wordProgress[itemId],
    }),
    { name: 'burmafy-progress' }
  )
);
