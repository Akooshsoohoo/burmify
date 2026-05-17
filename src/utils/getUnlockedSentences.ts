import type { SentenceTemplate } from '../data/sentence.types';
import type { WordProgress } from '../store/progressStore';
import { getMasteryLevel } from './getMasteryLevel';

export function getUnlockedSentences(
  templates: SentenceTemplate[],
  wordProgress: Record<string, WordProgress>
): SentenceTemplate[] {
  return templates.filter((template) =>
    template.slots.every((slot) => getMasteryLevel(wordProgress[slot.correctItemId]) >= 2)
  );
}
