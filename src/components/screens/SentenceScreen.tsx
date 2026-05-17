import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import type { SentenceTemplate } from '../../data/sentence.types';
import type { VocabularyItem } from '../../data/vocabulary.types';
import { useSettingsStore } from '../../store/settingsStore';
import { shuffle } from '../../utils/shuffleQueue';
import { ProgressBar } from '../game/ProgressBar';

interface Props {
  sentences: SentenceTemplate[];
  allItems: VocabularyItem[];
  onComplete: () => void;
}

function SlotBox({
  position,
  filledItem,
  shakeKey,
}: {
  position: number;
  filledItem: VocabularyItem | null;
  shakeKey: number;
}) {
  const showScript = useSettingsStore((s) => s.showBurmeseScript);
  const { setNodeRef, isOver } = useDroppable({ id: `slot-${position}` });
  const controls = useAnimation();

  useEffect(() => {
    if (shakeKey > 0) {
      void controls.start({ x: [0, -8, 8, -8, 8, 0], transition: { duration: 0.4 } });
    }
  }, [shakeKey, controls]);

  return (
    <motion.div
      animate={controls}
      ref={setNodeRef}
      className="inline-flex min-w-[90px] min-h-[52px] rounded-xl border-2 items-center justify-center px-2 mx-1"
      style={{
        borderStyle: filledItem ? 'solid' : 'dashed',
        borderColor: filledItem
          ? 'var(--accent-correct)'
          : isOver
          ? 'var(--accent-gold)'
          : 'var(--card-border)',
        background: filledItem
          ? 'var(--accent-correct)20'
          : isOver
          ? 'var(--accent-gold)10'
          : 'var(--card-surface)',
      }}
    >
      {filledItem ? (
        <div className="flex flex-col items-center gap-0.5">
          {showScript && (
            <span className="burmese text-sm font-bold leading-snug" style={{ color: 'var(--accent-correct)' }}>
              {filledItem.burmese}
            </span>
          )}
          <span
            className="text-xs font-medium text-center leading-snug"
            style={{ color: showScript ? 'var(--text-muted)' : 'var(--accent-correct)' }}
          >
            {filledItem.phonetic}
          </span>
        </div>
      ) : (
        <span style={{ color: 'var(--text-muted)', fontSize: '1.1rem', letterSpacing: '0.1em' }}>_ _</span>
      )}
    </motion.div>
  );
}

function WordBankCard({ item }: { item: VocabularyItem }) {
  const showScript = useSettingsStore((s) => s.showBurmeseScript);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="flex flex-col items-center justify-center px-3 py-2 rounded-xl border-2 cursor-grab active:cursor-grabbing select-none"
      style={{
        background: 'var(--card-surface)',
        borderColor: 'var(--card-border)',
        opacity: isDragging ? 0.3 : 1,
        transform: CSS.Translate.toString(transform),
        touchAction: 'none',
        minWidth: '70px',
      }}
    >
      {showScript && (
        <span className="burmese text-base font-bold leading-snug" style={{ color: 'var(--text-primary)' }}>
          {item.burmese}
        </span>
      )}
      <span
        className="text-xs font-medium text-center leading-snug"
        style={{
          color: 'var(--text-muted)',
          fontSize: showScript ? '' : '0.82rem',
        }}
      >
        {item.phonetic}
      </span>
    </div>
  );
}

function FloatingCard({ item }: { item: VocabularyItem }) {
  const showScript = useSettingsStore((s) => s.showBurmeseScript);
  return (
    <div
      className="flex flex-col items-center justify-center px-3 py-2 rounded-xl border-2 shadow-xl"
      style={{
        background: 'var(--card-surface)',
        borderColor: 'var(--accent-gold)',
        minWidth: '70px',
        transform: 'scale(1.05)',
      }}
    >
      {showScript && (
        <span className="burmese text-base font-bold" style={{ color: 'var(--text-primary)' }}>
          {item.burmese}
        </span>
      )}
      <span className="text-xs font-medium text-center" style={{ color: 'var(--text-muted)' }}>
        {item.phonetic}
      </span>
    </div>
  );
}

export function SentenceScreen({ sentences, allItems, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filledSlots, setFilledSlots] = useState<Record<number, VocabularyItem>>({});
  const [shakeKeys, setShakeKeys] = useState<Record<number, number>>({});
  const [activeItem, setActiveItem] = useState<VocabularyItem | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } })
  );

  const itemMap = useMemo(() => {
    const map: Record<string, VocabularyItem> = {};
    allItems.forEach((item) => { map[item.id] = item; });
    return map;
  }, [allItems]);

  const currentTemplate = sentences[currentIndex];

  const wordBankIds = useMemo(
    () =>
      shuffle([
        ...currentTemplate.slots.map((s) => s.correctItemId),
        ...currentTemplate.distractorItemIds,
      ]),
    [currentTemplate]
  );

  useEffect(() => {
    setFilledSlots({});
    setShakeKeys({});
    setActiveItem(null);
  }, [currentIndex]);

  const placedIds = useMemo(
    () => new Set(Object.values(filledSlots).map((item) => item.id)),
    [filledSlots]
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const item = itemMap[String(event.active.id)];
      if (item) setActiveItem(item);
    },
    [itemMap]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveItem(null);
      const { active, over } = event;
      if (!over) return;

      const overId = String(over.id);
      if (!overId.startsWith('slot-')) return;

      const slotPosition = parseInt(overId.replace('slot-', ''), 10);
      if (filledSlots[slotPosition]) return;

      const slot = currentTemplate.slots.find((s) => s.position === slotPosition);
      if (!slot) return;

      const droppedItemId = String(active.id);

      if (droppedItemId === slot.correctItemId) {
        const item = itemMap[droppedItemId];
        const newFilled = { ...filledSlots, [slotPosition]: item };
        setFilledSlots(newFilled);

        if (Object.keys(newFilled).length === currentTemplate.slots.length) {
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            if (currentIndex + 1 >= sentences.length) {
              onComplete();
            } else {
              setCurrentIndex((i) => i + 1);
            }
          }, 900);
        }
      } else {
        setShakeKeys((prev) => ({
          ...prev,
          [slotPosition]: (prev[slotPosition] ?? 0) + 1,
        }));
      }
    },
    [currentIndex, currentTemplate, filledSlots, itemMap, sentences.length, onComplete]
  );

  if (!currentTemplate) return null;

  const templateParts = currentTemplate.englishTemplate.split(/\{(\d+)\}/);

  return (
    <div className="relative w-full h-full flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="flex-shrink-0 px-6 pt-4 pb-2 flex flex-col gap-2">
        <ProgressBar completed={currentIndex} total={sentences.length} />
        <p className="text-xs text-center font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Sentence Practice
        </p>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        {/* Sentence display */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-3">
          <p className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Fill in the blanks
          </p>
          <div className="flex flex-wrap items-center justify-center gap-y-3 max-w-xs">
            {templateParts.map((part, i) => {
              if (i % 2 === 0) {
                if (!part) return null;
                return (
                  <span key={i} className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {part}
                  </span>
                );
              } else {
                const position = parseInt(part, 10);
                return (
                  <SlotBox
                    key={i}
                    position={position}
                    filledItem={filledSlots[position] ?? null}
                    shakeKey={shakeKeys[position] ?? 0}
                  />
                );
              }
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="mx-6 h-px" style={{ background: 'var(--card-border)' }} />

        {/* Word bank */}
        <div className="flex-shrink-0 px-6 py-5">
          <p className="text-xs font-medium uppercase tracking-widest mb-3 text-center" style={{ color: 'var(--text-muted)' }}>
            Drag a word to the blank
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {wordBankIds
              .filter((id) => !placedIds.has(id))
              .map((id) => {
                const item = itemMap[id];
                if (!item) return null;
                return <WordBankCard key={id} item={item} />;
              })}
          </div>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeItem && <FloatingCard item={activeItem} />}
        </DragOverlay>
      </DndContext>

      {/* Success overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none"
            style={{ background: 'var(--bg-primary)cc' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <CheckCircle size={64} color="var(--accent-correct)" />
            </motion.div>
            <p className="text-2xl font-bold" style={{ color: 'var(--accent-correct)' }}>
              Correct!
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
