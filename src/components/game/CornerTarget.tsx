import { useDroppable } from '@dnd-kit/core';
import type { VocabularyItem, CardSide } from '../../data/vocabulary.types';
import { Card } from '../ui/Card';

type Position = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

const positionClasses: Record<Position, string> = {
  'top-left': 'top-6 left-6',
  'top-right': 'top-6 right-6',
  'bottom-left': 'bottom-6 left-6',
  'bottom-right': 'bottom-6 right-6',
};

interface Props {
  item: VocabularyItem;
  mode: CardSide;
  position: Position;
  accentColor?: string;
}

export function CornerTarget({ item, mode, position, accentColor }: Props) {
  const id = `${position}-${item.id}`;
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`absolute ${positionClasses[position]}`}
      style={{
        outline: isOver ? 'none' : `2px dashed ${accentColor ?? 'var(--card-border)'}35`,
        outlineOffset: '4px',
        borderRadius: '18px',
      }}
    >
      <Card
        item={item}
        mode={mode}
        size="corner"
        isOver={isOver}
        accentColor={accentColor}
      />
    </div>
  );
}
