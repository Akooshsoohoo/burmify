import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';

interface Props {
  result: 'correct' | 'incorrect' | null;
}

export function FeedbackOverlay({ result }: Props) {
  return (
    <AnimatePresence>
      {result && (
        <motion.div
          key={result}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: result === 'correct' ? 'var(--accent-correct)' : 'var(--accent-wrong)',
              opacity: 0.12,
            }}
          />
          {result === 'correct' && (
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <CheckCircle size={80} color="var(--accent-correct)" strokeWidth={1.5} />
            </motion.div>
          )}
          {result === 'incorrect' && (
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <XCircle size={80} color="var(--accent-wrong)" strokeWidth={1.5} />
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
