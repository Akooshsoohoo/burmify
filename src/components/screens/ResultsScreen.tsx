import { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Trophy, RotateCcw, Home } from 'lucide-react';
import type { RoundResult, VocabularyItem } from '../../data/vocabulary.types';

interface Props {
  score: number;
  total: number;
  maxStreak: number;
  history: RoundResult[];
  allItems: VocabularyItem[];
  onReplay: () => void;
  onHome: () => void;
}

export function ResultsScreen({ score, total, maxStreak, history, allItems, onReplay, onHome }: Props) {
  const pct = total === 0 ? 0 : Math.round((score / total) * 100);
  const itemMap = Object.fromEntries(allItems.map((item) => [item.id, item]));

  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    const controls = animate(count, pct, { duration: 1.2, ease: 'easeOut' });
    return controls.stop;
  }, [pct, count]);

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -12 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="flex flex-col items-center h-full px-6 pt-10 pb-6 overflow-y-auto" style={{ background: 'var(--bg-primary)' }}>
      <div className="flex flex-col items-center gap-3 w-full max-w-xs">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
        >
          <Trophy size={56} color="var(--accent-gold)" />
        </motion.div>

        <motion.h2
          className="text-2xl font-bold"
          style={{ color: 'var(--text-primary)' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          Session complete!
        </motion.h2>

        <motion.div
          className="text-6xl font-bold"
          style={{ color: 'var(--accent-correct)' }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <motion.span>{rounded}</motion.span>%
        </motion.div>

        <motion.p
          className="text-sm"
          style={{ color: 'var(--text-muted)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          {score} of {total} correct · best streak {maxStreak}
        </motion.p>
      </div>

      <motion.div
        className="flex flex-col gap-3 w-full max-w-xs mt-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <button
          onClick={onReplay}
          className="flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold transition-all hover:opacity-90 active:scale-[0.97]"
          style={{ background: 'var(--accent-correct)', color: '#0f0f1a', boxShadow: '0 4px 14px var(--accent-correct)40' }}
        >
          <RotateCcw size={18} />
          Play again
        </button>
        <button
          onClick={onHome}
          className="flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold border-2 transition-all hover:opacity-90 active:scale-[0.97]"
          style={{ borderColor: 'var(--card-border)', color: 'var(--text-primary)', background: 'var(--card-surface)' }}
        >
          <Home size={18} />
          Home
        </button>
      </motion.div>

      {history.length > 0 && (
        <div className="w-full max-w-xs mt-6">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
            This session
          </p>
          <motion.div
            className="flex flex-col gap-1.5"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {history.map((r, i) => {
              const word = itemMap[r.itemId];
              const label = word?.english ?? r.itemId;
              const attemptLabel = r.attempts === 1 ? '1st try' : `${r.attempts} tries`;
              return (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl"
                  style={{ background: 'var(--card-surface)' }}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: r.correct ? 'var(--accent-correct)' : 'var(--accent-wrong)' }}
                  />
                  <span className="text-sm flex-1 font-medium" style={{ color: 'var(--text-primary)' }}>
                    {label}
                  </span>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                    style={{
                      background: r.correct ? 'var(--accent-correct)20' : 'var(--accent-wrong)20',
                      color: r.correct ? 'var(--accent-correct)' : 'var(--accent-wrong)',
                    }}
                  >
                    {attemptLabel}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      )}
    </div>
  );
}
