import type { WordProgress } from '../store/progressStore';

export function getMasteryLevel(progress: WordProgress | undefined): 0 | 1 | 2 | 3 | 4 {
  if (!progress || progress.exposureCount === 0) return 0;
  if (progress.correct === 0) return 1;
  if (progress.correct < 3) return 2;
  if (progress.correct < 5) return 3;
  return 4;
}
