import type { Round } from '../../data/vocabulary.types';
import { CenterCard } from './CenterCard';
import { CornerTarget } from './CornerTarget';
import { FeedbackOverlay } from './FeedbackOverlay';
import { ProgressBar } from './ProgressBar';
import { ScoreCounter } from '../ui/ScoreCounter';

type Position = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
const POSITIONS: Position[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

interface Props {
  round: Round;
  feedback: 'correct' | 'incorrect' | null;
  shakeKey: number;
  score: number;
  streak: number;
  completed: number;
  total: number;
  accentColor?: string;
}

export function GameBoard({ round, feedback, shakeKey, score, streak, completed, total, accentColor }: Props) {
  return (
    <div
      className="relative w-full h-full touch-none"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div className="absolute top-0 left-0 right-0 px-4 pt-3 flex items-center justify-between z-20">
        <ProgressBar completed={completed} total={total} />
      </div>
      <div className="absolute top-3 right-4 z-20">
        <ScoreCounter streak={streak} score={score} total={total} />
      </div>

      {POSITIONS.map((pos, i) => (
        <CornerTarget
          key={`${pos}-${round.corners[i].id}`}
          item={round.corners[i]}
          mode={round.answerMode}
          position={pos}
          accentColor={accentColor}
        />
      ))}

      <CenterCard
        item={round.question}
        mode={round.questionMode}
        accentColor={accentColor}
        shakeKey={shakeKey}
      />

      <FeedbackOverlay result={feedback} />
    </div>
  );
}
