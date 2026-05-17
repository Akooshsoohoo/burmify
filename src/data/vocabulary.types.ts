export type CardSide = "burmese" | "english" | "image";
export type PronunciationDisplay = "romanization" | "phonetic" | "both";

export interface VocabularyItem {
  id: string;
  category: string;
  burmese: string;
  romanization: string;
  phonetic: string;
  english: string;
  image: string;
  audio: string;
  difficulty: 1 | 2 | 3;
  tags: string[];
}

export interface Category {
  id: string;
  label: string;
  description: string;
  color: string;
  icon: string;
  items: VocabularyItem[];
}

export interface VocabularyDatabase {
  version: number;
  categories: Category[];
}

export interface Round {
  question: VocabularyItem;
  corners: [VocabularyItem, VocabularyItem, VocabularyItem, VocabularyItem];
  correctCornerId: string;
  questionMode: CardSide;
  answerMode: CardSide;
}

export interface RoundResult {
  itemId: string;
  correct: boolean;
  attempts: number;
  timestamp: number;
}
