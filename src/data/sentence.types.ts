export interface SentenceSlot {
  position: number;
  correctItemId: string;
}

export interface SentenceTemplate {
  id: string;
  englishTemplate: string;
  slots: SentenceSlot[];
  distractorItemIds: string[];
  difficulty: 1 | 2 | 3;
}
