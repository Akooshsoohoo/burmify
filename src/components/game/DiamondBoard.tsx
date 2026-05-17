import { useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Round } from '../../data/vocabulary.types';
import type { VocabularyItem, CardSide } from '../../data/vocabulary.types';
import { Card } from '../ui/Card';
import { FeedbackOverlay } from './FeedbackOverlay';
import { ProgressBar } from './ProgressBar';
import { ScoreCounter } from '../ui/ScoreCounter';

// corners[] is ordered [top-left, top-right, bottom-left, bottom-right]
// diamond mapping: index 0 → top (W/↑), 1 → right (D/→), 2 → bottom (S/↓), 3 → left (A/←)
const CORNER_IDS = ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const;

const KEY_HINTS = ['↑ W', '→ D', '↓ S', '← A'];

interface TargetProps {
  item: VocabularyItem;
  mode: CardSide;
  cornerId: string;
  hint: string;
  accentColor?: string;
  disabled: boolean;
  onSelect: (id: string) => void;
}

function DiamondTarget({ item, mode, cornerId, hint, accentColor, disabled, onSelect }: TargetProps) {
  return (
    <button
      onClick={() => !disabled && onSelect(cornerId)}
      className="flex flex-col items-center gap-1.5"
      style={{ cursor: disabled ? 'default' : 'pointer' }}
    >
      <Card item={item} mode={mode} size="diamond" accentColor={accentColor} />
      <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>{hint}</span>
    </button>
  );
}

interface Props {
  round: Round;
  feedback: 'correct' | 'incorrect' | null;
  shakeKey: number;
  score: number;
  streak: number;
  completed: number;
  total: number;
  accentColor?: string;
  onSelect: (cornerId: string) => void;
}

export function DiamondBoard({ round, feedback, shakeKey, score, streak, completed, total, accentColor, onSelect }: Props) {
  useEffect(() => {
    if (feedback) return;

    const handleKey = (e: KeyboardEvent) => {
      let i = -1;
      switch (e.key) {
        case 'ArrowUp':    case 'w': case 'W': i = 0; break;
        case 'ArrowRight': case 'd': case 'D': i = 1; break;
        case 'ArrowDown':  case 's': case 'S': i = 2; break;
        case 'ArrowLeft':  case 'a': case 'A': i = 3; break;
        default: return;
      }
      e.preventDefault();
      onSelect(`${CORNER_IDS[i]}-${round.corners[i].id}`);
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [round, feedback, onSelect]);

  const makeId = (i: number) => `${CORNER_IDS[i]}-${round.corners[i].id}`;
  const disabled = !!feedback;

  return (
    <div className="relative w-full h-full flex flex-col" style={{ background: 'var(--bg-primary)' }}>

      {/* Header: progress + score */}
      <div className="flex items-center px-4 pt-3 pb-2 gap-3 z-20">
        <div className="flex-1">
          <ProgressBar completed={completed} total={total} />
        </div>
        <ScoreCounter streak={streak} score={score} total={total} />
      </div>

      {/* Diamond layout: flex column, equal space */}
      <div className="flex-1 flex flex-col items-center justify-around pb-4">

        {/* Top answer */}
        <DiamondTarget
          item={round.corners[0]}
          mode={round.answerMode}
          cornerId={makeId(0)}
          hint={KEY_HINTS[0]}
          accentColor={accentColor}
          disabled={disabled}
          onSelect={onSelect}
        />

        {/* Middle row: left — center — right */}
        <div className="flex items-center justify-center gap-4 w-full px-4">
          <DiamondTarget
            item={round.corners[3]}
            mode={round.answerMode}
            cornerId={makeId(3)}
            hint={KEY_HINTS[3]}
            accentColor={accentColor}
            disabled={disabled}
            onSelect={onSelect}
          />

          <motion.div
            key={shakeKey}
            animate={shakeKey > 0 ? { x: [0, -10, 10, -10, 10, 0] } : { x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card item={round.question} mode={round.questionMode} size="corner" accentColor={accentColor} />
          </motion.div>

          <DiamondTarget
            item={round.corners[1]}
            mode={round.answerMode}
            cornerId={makeId(1)}
            hint={KEY_HINTS[1]}
            accentColor={accentColor}
            disabled={disabled}
            onSelect={onSelect}
          />
        </div>

        {/* Bottom answer */}
        <DiamondTarget
          item={round.corners[2]}
          mode={round.answerMode}
          cornerId={makeId(2)}
          hint={KEY_HINTS[2]}
          accentColor={accentColor}
          disabled={disabled}
          onSelect={onSelect}
        />

      </div>

      <FeedbackOverlay result={feedback} />
    </div>
  );
}
