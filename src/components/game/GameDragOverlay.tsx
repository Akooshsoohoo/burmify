import { DragOverlay } from '@dnd-kit/core';
import type { VocabularyItem, CardSide } from '../../data/vocabulary.types';
import { Card } from '../ui/Card';

interface Props {
  activeItem: VocabularyItem | null;
  mode: CardSide;
  accentColor?: string;
}

export function GameDragOverlay({ activeItem, mode, accentColor }: Props) {
  return (
    <DragOverlay dropAnimation={null}>
      {activeItem ? (
        <div style={{ transform: 'scale(1.05)', opacity: 0.95, filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.5))' }}>
          <Card item={activeItem} mode={mode} size="center" accentColor={accentColor} />
        </div>
      ) : null}
    </DragOverlay>
  );
}
