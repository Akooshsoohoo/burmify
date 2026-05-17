import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PronunciationDisplay } from '../data/vocabulary.types';

type LayoutMode = 'corners' | 'diamond';

interface SettingsState {
  pronunciationDisplay: PronunciationDisplay;
  audioEnabled: boolean;
  showBurmeseScript: boolean;
  layoutMode: LayoutMode;
  setPronunciationDisplay: (v: PronunciationDisplay) => void;
  toggleAudio: () => void;
  toggleBurmeseScript: () => void;
  toggleLayoutMode: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      pronunciationDisplay: 'phonetic',
      audioEnabled: true,
      showBurmeseScript: true,
      layoutMode: 'corners',
      setPronunciationDisplay: (v) => set({ pronunciationDisplay: v }),
      toggleAudio: () => set((s) => ({ audioEnabled: !s.audioEnabled })),
      toggleBurmeseScript: () => set((s) => ({ showBurmeseScript: !s.showBurmeseScript })),
      toggleLayoutMode: () => set((s) => ({ layoutMode: s.layoutMode === 'corners' ? 'diamond' : 'corners' })),
    }),
    { name: 'burmafy-settings' }
  )
);
