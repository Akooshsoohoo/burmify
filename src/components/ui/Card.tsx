import { useState } from 'react';
import type { VocabularyItem } from '../../data/vocabulary.types';
import type { CardSide } from '../../data/vocabulary.types';
import { BurmeseText } from './BurmeseText';
import { PronunciationLabel } from './PronunciationLabel';

interface Props {
  item: VocabularyItem;
  mode: CardSide;
  size?: 'center' | 'corner' | 'diamond';
  isOver?: boolean;
  accentColor?: string;
  className?: string;
}

export function Card({ item, mode, size = 'corner', isOver = false, accentColor, className = '' }: Props) {
  const [imgError, setImgError] = useState(false);
  const isCenter = size === 'center';
  const sizeClass = size === 'center' ? 'w-[38vmin] h-[38vmin]' : size === 'diamond' ? 'w-[22vmin] h-[22vmin]' : 'w-[28vmin] h-[28vmin]';

  const borderStyle = isOver
    ? { borderColor: 'var(--accent-correct)', boxShadow: `0 0 20px var(--accent-correct)40` }
    : accentColor
    ? { borderColor: accentColor + '60' }
    : { borderColor: 'var(--card-border)' };

  return (
    <div
      className={`${sizeClass} flex flex-col items-center justify-center gap-2 rounded-2xl border-2 transition-all duration-150 ${className}`}
      style={{ background: 'var(--card-surface)', ...borderStyle }}
    >
      {mode === 'image' && (
        <>
          {!imgError ? (
            <img
              src={`/images/categories/${item.image}`}
              alt={item.english}
              className="w-2/3 h-2/3 object-contain rounded-lg"
              onError={() => setImgError(true)}
            />
          ) : (
            <div
              className="w-2/3 h-2/3 rounded-lg flex items-center justify-center text-3xl"
              style={{ background: accentColor ? accentColor + '30' : 'var(--card-border)' }}
            >
              🖼️
            </div>
          )}
          <span className="text-sm font-medium text-[var(--text-muted)] px-2 text-center">{item.english}</span>
        </>
      )}

      {mode === 'burmese' && (
        <>
          <BurmeseText text={item.burmese} size={isCenter ? 'xl' : size === 'diamond' ? 'sm' : 'lg'} />
          <PronunciationLabel romanization={item.romanization} phonetic={item.phonetic} />
        </>
      )}

      {mode === 'english' && (
        <span className={`font-semibold text-center px-2 text-[var(--text-primary)] ${isCenter ? 'text-3xl' : size === 'diamond' ? 'text-base' : 'text-xl'}`}>
          {item.english}
        </span>
      )}
    </div>
  );
}
