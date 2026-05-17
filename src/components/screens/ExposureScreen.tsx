import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useSessionStore } from '../../store/sessionStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useProgressStore } from '../../store/progressStore';
import { ProgressBar } from '../game/ProgressBar';

interface Props {
  accentColor?: string;
  completed: number;
  total: number;
  onPause?: () => void;
}

export function ExposureScreen({ accentColor, completed, total, onPause }: Props) {
  const { currentExposureItem, confirmExposure } = useSessionStore();
  const showBurmeseScript = useSettingsStore((s) => s.showBurmeseScript);
  const { recordExposure } = useProgressStore();
  const [imgError, setImgError] = useState(false);

  const handleConfirm = useCallback(() => {
    if (currentExposureItem) recordExposure(currentExposureItem.id);
    confirmExposure();
  }, [currentExposureItem, recordExposure, confirmExposure]);

  useEffect(() => {
    window.addEventListener('keydown', handleConfirm);
    return () => window.removeEventListener('keydown', handleConfirm);
  }, [handleConfirm]);

  if (!currentExposureItem) return null;
  const item = currentExposureItem;

  return (
    <motion.div
      className="relative w-full h-full flex flex-col items-center justify-between pb-10 px-6 cursor-pointer"
      style={{ background: 'var(--bg-primary)' }}
      onClick={handleConfirm}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Top bar */}
      <div className="w-full pt-4 pb-2 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {onPause && (
            <button
              onClick={(e) => { e.stopPropagation(); onPause(); }}
              className="p-1.5 rounded-full flex-shrink-0"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Exit session"
            >
              <X size={18} />
            </button>
          )}
          <div className="flex-1">
            <ProgressBar completed={completed} total={total} />
          </div>
        </div>
        <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
          Learn this word
        </p>
      </div>

      {/* Main content */}
      <motion.div
        className="flex flex-col items-center gap-5 flex-1 justify-center w-full max-w-sm"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {/* Image */}
        <div
          className="w-40 h-40 rounded-3xl flex items-center justify-center overflow-hidden"
          style={{ background: accentColor ? accentColor + '20' : 'var(--card-surface)', border: `2px solid ${accentColor ?? 'var(--card-border)'}40` }}
        >
          {!imgError ? (
            <img
              src={`/images/categories/${item.image}`}
              alt={item.english}
              className="w-full h-full object-contain p-3"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="text-6xl">🖼️</span>
          )}
        </div>

        {/* Burmese text */}
        <div className="flex flex-col items-center gap-1">
          {showBurmeseScript && (
            <span
              className="burmese font-bold leading-relaxed text-center"
              style={{ fontSize: 'clamp(2rem, 8vw, 3.5rem)', color: 'var(--text-primary)' }}
            >
              {item.burmese}
            </span>
          )}

          {/* Phonetic — always shown on exposure */}
          <span className="text-lg font-semibold text-center" style={{ color: 'var(--accent-gold)' }}>
            {item.phonetic}
          </span>
          <span className="text-sm italic text-center" style={{ color: 'var(--text-muted)' }}>
            {item.romanization}
          </span>
        </div>

        {/* English */}
        <div
          className="px-6 py-2 rounded-2xl"
          style={{ background: accentColor ? accentColor + '20' : 'var(--card-surface)' }}
        >
          <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {item.english}
          </span>
        </div>
      </motion.div>

      {/* Got it button */}
      <motion.div
        className="w-full max-w-xs"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <button
          onClick={handleConfirm}
          className="w-full py-4 rounded-2xl text-center font-bold text-lg transition-all active:scale-[0.97]"
          style={{
            background: accentColor ?? 'var(--accent-correct)',
            color: '#0f0f1a',
            boxShadow: `0 4px 16px ${accentColor ?? 'var(--accent-correct)'}50`,
          }}
        >
          Got it — tap to quiz
        </button>
        <p className="text-center text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
          or tap anywhere
        </p>
        <motion.div
          className="w-3 h-3 rounded-full mx-auto mt-2"
          style={{ background: accentColor ?? 'var(--accent-correct)', opacity: 0.5 }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </motion.div>
  );
}
