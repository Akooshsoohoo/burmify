import type { Round, VocabularyItem, CardSide } from '../data/vocabulary.types';
import { shuffle } from './shuffleQueue';

type CornerPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
const POSITIONS: CornerPosition[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

export function buildRound(
  question: VocabularyItem,
  allItems: VocabularyItem[],
  questionMode: CardSide,
  answerMode: CardSide,
  recentCorrectPositions: CornerPosition[] = []
): Round {
  const pool = allItems.filter(item => item.id !== question.id);
  const same = pool.filter(item => item.category === question.category);
  const other = pool.filter(item => item.category !== question.category);

  const distractorPool = same.length >= 3 ? same : [...same, ...other];
  const distractors = shuffle(distractorPool).slice(0, 3);

  while (distractors.length < 3) {
    distractors.push(question);
  }

  const shuffledPositions = shuffle(POSITIONS);
  const recentSet = new Set(recentCorrectPositions.slice(-2));
  const avoidedPositions = shuffledPositions.filter(p => !recentSet.has(p));
  const correctPosition = avoidedPositions.length > 0 ? avoidedPositions[0] : shuffledPositions[0];

  const otherPositions = shuffledPositions.filter(p => p !== correctPosition);
  const positionMap: Record<CornerPosition, VocabularyItem> = {
    'top-left': distractors[0],
    'top-right': distractors[1],
    'bottom-left': distractors[2],
    'bottom-right': question,
  };
  positionMap[correctPosition] = question;
  otherPositions.forEach((pos, i) => {
    positionMap[pos] = distractors[i];
  });

  const orderedCorners: [VocabularyItem, VocabularyItem, VocabularyItem, VocabularyItem] = [
    positionMap['top-left'],
    positionMap['top-right'],
    positionMap['bottom-left'],
    positionMap['bottom-right'],
  ];

  return {
    question,
    corners: orderedCorners,
    correctCornerId: `${correctPosition}-${question.id}`,
    questionMode,
    answerMode,
  };
}

export function getCornerPositionFromId(id: string): CornerPosition | null {
  const pos = id.split('-').slice(0, 2).join('-') as CornerPosition;
  return POSITIONS.includes(pos) ? pos : null;
}
