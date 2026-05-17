import { Settings, PlayCircle } from 'lucide-react';
import type { Category } from '../../data/vocabulary.types';

interface Props {
  categories: Category[];
  allCategory: Category;
  onStart: (category: Category) => void;
  onSettings: () => void;
  sentenceCount: number;
  onStartSentences: () => void;
  hasActiveSession: boolean;
  activeCategory: Category | null;
  completedCount: number;
  onResume: () => void;
}

export function HomeScreen({
  categories, allCategory, onStart, onSettings,
  sentenceCount, onStartSentences,
  hasActiveSession, activeCategory, completedCount, onResume,
}: Props) {
  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-primary)' }}>
      <div className="flex items-center justify-between px-6 pt-8 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Burmafy
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Learn Burmese through play
          </p>
        </div>
        <button
          onClick={onSettings}
          className="p-2 rounded-full transition-colors"
          style={{ color: 'var(--text-muted)' }}
          aria-label="Settings"
        >
          <Settings size={22} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-8">

        {/* Continue session banner */}
        {hasActiveSession && activeCategory && (
          <div className="mb-5">
            <button
              onClick={onResume}
              className="flex items-center gap-4 p-4 rounded-2xl border-2 w-full text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{
                background: activeCategory.color + '18',
                borderColor: activeCategory.color + '80',
                boxShadow: `0 4px 12px ${activeCategory.color}30`,
              }}
            >
              <PlayCircle size={32} color={activeCategory.color} />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm" style={{ color: activeCategory.color }}>
                  Continue
                </div>
                <div className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                  {activeCategory.label}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {completedCount} / {activeCategory.items.length} words done
                </div>
              </div>
            </button>
          </div>
        )}

        <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
          Choose a category
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onStart(cat)}
              className="flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'var(--card-surface)',
                borderColor: cat.color + '50',
                boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
              }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: cat.color + '25' }}
              >
                <span className="text-2xl">{cat.icon}</span>
              </div>
              <div>
                <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {cat.label}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {cat.description}
                </div>
                <div className="text-xs mt-1 font-medium" style={{ color: cat.color }}>
                  {cat.items.length} words
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* All Words mega-set */}
        <div className="mt-3">
          <button
            onClick={() => onStart(allCategory)}
            className="flex items-center gap-4 p-5 rounded-2xl border-2 w-full text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'var(--card-surface)',
              borderColor: allCategory.color + '50',
              boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
            }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: allCategory.color + '25' }}
            >
              <span className="text-2xl">{allCategory.icon}</span>
            </div>
            <div>
              <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {allCategory.label}
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {allCategory.description}
              </div>
              <div className="text-xs mt-1 font-medium" style={{ color: allCategory.color }}>
                {allCategory.items.length} words
              </div>
            </div>
          </button>
        </div>

        {/* Sentence Practice */}
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
            Sentence Practice
          </p>
          <button
            onClick={sentenceCount > 0 ? onStartSentences : undefined}
            className="flex items-center gap-4 p-4 rounded-2xl border-2 w-full text-left transition-all"
            style={{
              background: 'var(--card-surface)',
              borderColor: sentenceCount > 0 ? '#a78bfa60' : 'var(--card-border)',
              opacity: sentenceCount === 0 ? 0.55 : 1,
              cursor: sentenceCount === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            <span className="text-3xl">{sentenceCount > 0 ? '📝' : '🔒'}</span>
            <div>
              <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                Sentence Practice
              </div>
              {sentenceCount > 0 ? (
                <div className="text-xs mt-0.5 font-medium" style={{ color: '#a78bfa' }}>
                  {sentenceCount} sentence{sentenceCount !== 1 ? 's' : ''} unlocked
                </div>
              ) : (
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Answer words correctly to unlock
                </div>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
