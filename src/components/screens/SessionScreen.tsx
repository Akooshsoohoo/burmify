import { useState, useCallback, useRef } from 'react';
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { X } from 'lucide-react';
import { useSessionStore } from '../../store/sessionStore';
import { useProgressStore } from '../../store/progressStore';
import { useSettingsStore } from '../../store/settingsStore';
import { GameBoard } from '../game/GameBoard';
import { DiamondBoard } from '../game/DiamondBoard';
import { GameDragOverlay } from '../game/GameDragOverlay';
import type { VocabularyItem } from '../../data/vocabulary.types';

interface Props {
  accentColor?: string;
  totalWords: number;
  onPause?: () => void;
}

export function SessionScreen({ accentColor, totalWords, onPause }: Props) {
  const { currentRound, submitDrop, advanceRound, setStatus, score, streak, roundHistory, currentAttempts } = useSessionStore();
  const { recordResult } = useProgressStore();
  const layoutMode = useSettingsStore((s) => s.layoutMode);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [activeItem, setActiveItem] = useState<VocabularyItem | null>(null);
  const attemptsRef = useRef(currentAttempts);
  attemptsRef.current = currentAttempts;

  const handleSelect = useCallback((cornerId: string) => {
    if (!currentRound || feedback) return;
    setStatus('animating');
    const result = submitDrop(cornerId);

    if (result === 'correct') {
      recordResult({
        itemId: currentRound.question.id,
        correct: true,
        attempts: attemptsRef.current,
        timestamp: Date.now(),
      });
      setFeedback('correct');
      setTimeout(() => {
        setFeedback(null);
        advanceRound();
      }, 800);
    } else {
      recordResult({
        itemId: currentRound.question.id,
        correct: false,
        attempts: attemptsRef.current,
        timestamp: Date.now(),
      });
      setShakeKey((k) => k + 1);
      setFeedback('incorrect');
      setTimeout(() => {
        setFeedback(null);
        setStatus('playing');
      }, 600);
    }
  }, [currentRound, feedback, submitDrop, advanceRound, setStatus, recordResult]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    if (currentRound) setActiveItem(currentRound.question);
    void event;
  }, [currentRound]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveItem(null);
    const { over } = event;
    if (!over || !currentRound) return;
    handleSelect(over.id as string);
  }, [currentRound, handleSelect]);

  if (!currentRound) return null;

  const pauseButton = onPause && (
    <button
      onClick={onPause}
      className="absolute top-4 left-4 z-20 p-1.5 rounded-full"
      style={{ color: 'var(--text-muted)', background: 'var(--bg-primary)' }}
      aria-label="Exit session"
    >
      <X size={18} />
    </button>
  );

  if (layoutMode === 'diamond') {
    return (
      <div className="relative w-full h-full">
        {pauseButton}
        <DiamondBoard
          round={currentRound}
          feedback={feedback}
          shakeKey={shakeKey}
          score={score}
          streak={streak}
          completed={roundHistory.length}
          total={totalWords}
          accentColor={accentColor}
          onSelect={handleSelect}
        />
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="relative w-full h-full">
        {pauseButton}
        <GameBoard
          round={currentRound}
          feedback={feedback}
          shakeKey={shakeKey}
          score={score}
          streak={streak}
          completed={roundHistory.length}
          total={totalWords}
          accentColor={accentColor}
        />
        <GameDragOverlay
          activeItem={activeItem}
          mode={currentRound.questionMode}
          accentColor={accentColor}
        />
      </div>
    </DndContext>
  );
}
