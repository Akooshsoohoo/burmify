interface Props {
  completed: number;
  total: number;
}

export function ProgressBar({ completed, total }: Props) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  return (
    <div className="w-full h-2.5 rounded-full" style={{ background: 'var(--card-border)' }}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: 'var(--accent-correct)', boxShadow: '0 0 6px var(--accent-correct)60' }}
      />
    </div>
  );
}
