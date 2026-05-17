import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PronunciationDisplay } from '../data/vocabulary.types';

interface SettingsState {
  pronunciationDisplay: PronunciationDisplay;
  audioEnabled: boolean;
  showBurmeseScript: boolean;
  setPronunciationDisplay: (v: PronunciationDisplay) => void;
  toggleAudio: () => void;
  toggleBurmeseScript: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      pronunciationDisplay: 'phonetic',
      audioEnabled: true,
      showBurmeseScript: true,
      setPronunciationDisplay: (v) => set({ pronunciationDisplay: v }),
      toggleAudio: () => set((s) => ({ audioEnabled: !s.audioEnabled })),
      toggleBurmeseScript: () => set((s) => ({ showBurmeseScript: !s.showBurmeseScript })),
    }),
    { name: 'burmafy-settings' }
  )
);
