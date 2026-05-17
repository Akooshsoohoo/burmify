import { useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Round } from '../../data/vocabulary.types';
import { Card } from '../ui/Card';
import { FeedbackOverlay } from './FeedbackOverlay';
import { ProgressBar } from './ProgressBar';
import { ScoreCounter } from '../ui/ScoreCounter';

// corners array is ordered [top-left, top-right, bottom-left, bottom-right]
// we remap to diamond positions: top, right, bottom, left
type DiamondPos = 'top' | 'right' | 'bottom' | 'left';

const CORNER_IDS = ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const;
const DIAMOND_POSITIONS: DiamondPos[] = ['top', 'right', 'bottom', 'left'];

const positionClasses: Record<DiamondPos, string> = {
  top: 'absolute top-[18%] left-1/2 -translate-x-1/2',
  right: 'absolute right-[3%] top-1/2 -translate-y-1/2',
  bottom: 'absolute bottom-[20%] left-1/2 -translate-x-1/2',
  left: 'absolute left-[3%] top-1/2 -translate-y-1/2',
};

const KEY_HINTS: Record<DiamondPos, string> = {
  top: '↑ W',
  right: '→ D',
  bottom: '↓ S',
  left: '← A',
};

const KEY_HINT_CLASS: Record<DiamondPos, string> = {
  top: 'absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap',
  right: 'absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap',
  bottom: 'absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap',
  left: 'absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap',
};

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
      let posIndex = -1;
      switch (e.key) {
        case 'ArrowUp':    case 'w': case 'W': posIndex = 0; break;
        case 'ArrowRight': case 'd': case 'D': posIndex = 1; break;
        case 'ArrowDown':  case 's': case 'S': posIndex = 2; break;
        case 'ArrowLeft':  case 'a': case 'A': posIndex = 3; break;
        default: return;
      }
      e.preventDefault();
      const corner = round.corners[posIndex];
      onSelect(`${CORNER_IDS[posIndex]}-${corner.id}`);
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [round, feedback, onSelect]);

  return (
    <div className="relative w-full h-full" style={{ background: 'var(--bg-primary)' }}>
      <div className="absolute top-0 left-0 right-0 px-4 pt-3 z-20">
        <ProgressBar completed={completed} total={total} />
      </div>
      <div className="absolute top-3 right-4 z-20">
        <ScoreCounter streak={streak} score={score} total={total} />
      </div>

      {DIAMOND_POSITIONS.map((diamondPos, i) => {
        const corner = round.corners[i];
        const cornerId = `${CORNER_IDS[i]}-${corner.id}`;
        return (
          <button
            key={cornerId}
            className={`${positionClasses[diamondPos]} z-10`}
            onClick={() => !feedback && onSelect(cornerId)}
            style={{ cursor: feedback ? 'default' : 'pointer' }}
          >
            <div className="relative">
              <Card
                item={corner}
                mode={round.answerMode}
                size="diamond"
                accentColor={accentColor}
              />
              <span
                className={`${KEY_HINT_CLASS[diamondPos]} text-[10px] font-medium`}
                style={{ color: 'var(--text-muted)' }}
              >
                {KEY_HINTS[diamondPos]}
              </span>
            </div>
          </button>
        );
      })}

      <motion.div
        key={shakeKey}
        animate={shakeKey > 0 ? { x: [0, -10, 10, -10, 10, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
      >
        <Card item={round.question} mode={round.questionMode} size="center" accentColor={accentColor} />
      </motion.div>

      <FeedbackOverlay result={feedback} />
    </div>
  );
}
