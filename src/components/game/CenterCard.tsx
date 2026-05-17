import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import type { VocabularyItem, CardSide } from '../../data/vocabulary.types';
import { Card } from '../ui/Card';

interface Props {
  item: VocabularyItem;
  mode: CardSide;
  accentColor?: string;
  shakeKey: number;
}

export function CenterCard({ item, mode, accentColor, shakeKey }: Props) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: 'center-card',
  });

  return (
    <motion.div
      key={shakeKey}
      animate={shakeKey > 0 ? { x: [0, -10, 10, -10, 10, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing z-10"
    >
      <motion.div
        animate={{
          scale: isDragging ? 1.08 : 1,
          filter: isDragging ? 'drop-shadow(0 8px 20px rgba(0,0,0,0.5))' : 'none',
        }}
        transition={{ duration: 0.15 }}
      >
        <div
          ref={setNodeRef}
          {...listeners}
          {...attributes}
          style={{ opacity: isDragging ? 0.4 : 1 }}
        >
          <Card item={item} mode={mode} size="center" accentColor={accentColor} />
        </div>
      </motion.div>
    </motion.div>
  );
}
