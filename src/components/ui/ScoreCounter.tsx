import { Flame } from 'lucide-react';

interface Props {
  streak: number;
  score: number;
  total: number;
}

export function ScoreCounter({ streak, score, total }: Props) {
  return (
    <div className="flex items-center gap-4">
      {streak >= 2 && (
        <div className="flex items-center gap-1 text-[var(--accent-gold)]">
          <Flame size={18} fill="currentColor" />
          <span className="font-bold text-sm">{streak}</span>
        </div>
      )}
      <span
        className="text-xs font-bold px-2 py-0.5 rounded-full border"
        style={{ background: 'var(--card-surface)', borderColor: 'var(--card-border)', color: 'var(--text-muted)' }}
      >
        {score}/{total}
      </span>
    </div>
  );
}
