import { useSettingsStore } from '../../store/settingsStore';

interface Props {
  romanization: string;
  phonetic: string;
  className?: string;
}

export function PronunciationLabel({ romanization, phonetic, className = '' }: Props) {
  const display = useSettingsStore((s) => s.pronunciationDisplay);

  if (display === 'romanization') {
    return (
      <span className={`text-xs text-[var(--text-muted)] italic ${className}`}>
        {romanization}
      </span>
    );
  }
  if (display === 'phonetic') {
    return (
      <span className={`text-xs text-[var(--accent-gold)] font-medium ${className}`}>
        {phonetic}
      </span>
    );
  }
  return (
    <span className={`flex flex-col items-center gap-0.5 ${className}`}>
      <span className="text-xs text-[var(--accent-gold)] font-medium">{phonetic}</span>
      <span className="text-[10px] text-[var(--text-muted)] italic">{romanization}</span>
    </span>
  );
}
