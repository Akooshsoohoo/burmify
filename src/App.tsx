import { useState, useMemo } from 'react';
import type { CSSProperties } from 'react';
import vocabularyData from './data/vocabulary.json';
import type { Category as RawCategory, PronunciationDisplay } from './data/vocabulary.types';
import { useProgressStore } from './store/progressStore';
import { useSettingsStore } from './store/settingsStore';
import { shuffle } from './utils/shuffleQueue';

// ── Types ────────────────────────────────────────────────────────────────────

interface Word { id: string; burmese: string; roman: string; en: string; }

interface Cat {
  id: string;
  label: string;
  desc: string;
  wordCount: number;
  done: number;
  sample: string;
  words: Word[];
}

interface SentEx {
  burmese: string[];
  blankIndex: number;
  answer: string;
  options: string[];
  optionsEn: string[];
  fullEn: string;
}

type Screen = 'home' | 'game' | 'results' | 'settings' | 'sentence';

// ── Theme ─────────────────────────────────────────────────────────────────────

const A = {
  serif: '"Newsreader", "Iowan Old Style", Georgia, serif',
  sans: '"Geist", "Söhne", "Helvetica Neue", system-ui, sans-serif',
  bur: '"Noto Sans Myanmar", sans-serif',
  bg: 'oklch(96.5% 0.012 80)',
  paper: 'oklch(98.5% 0.008 80)',
  rule: 'oklch(85% 0.013 70)',
  ink: 'oklch(20% 0.018 60)',
  inkSoft: 'oklch(38% 0.018 60)',
  muted: 'oklch(56% 0.022 60)',
  accent: 'oklch(48% 0.13 32)',
  accentSft: 'oklch(48% 0.13 32 / 0.10)',
  good: 'oklch(48% 0.11 145)',
  bad: 'oklch(50% 0.16 25)',
  onAccent: 'oklch(98.5% 0.008 80)',
  shadow: '0 1px 0 rgba(0,0,0,0.02), 0 24px 60px -30px rgba(40,30,20,0.18)',
} as const;

// ── Static sentence data ──────────────────────────────────────────────────────

const SENTENCES: SentEx[] = [
  {
    burmese: ['ကျွန်တော်', '___', 'သောက်ချင်တယ်'],
    blankIndex: 1,
    answer: 'ရေ',
    options: ['ထမင်း', 'ရေ', 'လက်ဖက်ရည်', 'ကော်ဖီ'],
    optionsEn: ['rice', 'water', 'tea', 'coffee'],
    fullEn: 'I want to drink water.',
  },
  {
    burmese: ['ကျွန်တော်', '___', 'ဆာတယ်'],
    blankIndex: 1,
    answer: 'ဗိုက်',
    options: ['ဗိုက်', 'ခေါင်း', 'ထမင်း', 'ရေ'],
    optionsEn: ['belly/hungry', 'head', 'rice', 'water'],
    fullEn: 'I am hungry.',
  },
  {
    burmese: ['ဒီနေ့', 'ပူ', '___'],
    blankIndex: 2,
    answer: 'တယ်',
    options: ['တယ်', 'ဘူး', 'လား', 'ပါ'],
    optionsEn: ['(statement)', '(negative)', '(question)', '(polite)'],
    fullEn: 'It is hot today.',
  },
];

// ── Primitive atoms ───────────────────────────────────────────────────────────

function Rule({ style }: { style?: CSSProperties }) {
  return <div style={{ height: 1, background: A.rule, ...style }} />;
}

function Icon({ name, size = 18, color = 'currentColor', strokeWidth = 1.5 }: {
  name: string; size?: number; color?: string; strokeWidth?: number;
}) {
  const s = strokeWidth;
  const paths: Record<string, React.ReactNode> = {
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 0 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h0a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></>,
    arrowL: <path d="M15 18l-6-6 6-6" />,
    arrowR: <path d="M9 6l6 6-6 6" />,
    play: <path d="M5 3l14 9-14 9V3z" />,
    check: <path d="M5 12l5 5L20 7" />,
    x: <><path d="M6 6l12 12" /><path d="M18 6L6 18" /></>,
    speaker: <><path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M19 12a4 4 0 0 0-2-3.5" /><path d="M19 12a4 4 0 0 1-2 3.5" /></>,
    refresh: <><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /><path d="M3 21v-5h5" /></>,
    home: <path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1V11z" />,
    pause: <><path d="M6 4h4v16H6z" /><path d="M14 4h4v16h-4z" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={s} strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

function CatMark({ index, sample, size = 56 }: { index: number; sample: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: A.paper, border: `1px solid ${A.rule}`,
      display: 'grid', placeItems: 'center', position: 'relative', flexShrink: 0,
    }}>
      <span style={{ fontFamily: A.bur, fontSize: size * 0.34, color: A.ink, lineHeight: 1 }}>{sample}</span>
      <span style={{
        position: 'absolute', top: -6, left: -6,
        fontFamily: A.sans, fontSize: 10, letterSpacing: '0.08em',
        color: A.muted, background: A.bg, padding: '2px 5px',
        borderRadius: 999, border: `1px solid ${A.rule}`,
      }}>{String(index).padStart(2, '0')}</span>
    </div>
  );
}

function Dots({ done, total }: { done: number; total: number }) {
  const max = 8;
  const cells = Math.min(total, max);
  const filled = cells > 0 ? Math.round((done / total) * cells) : 0;
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {Array.from({ length: cells }, (_, i) => (
        <span key={i} style={{
          width: 5, height: 5, borderRadius: '50%',
          background: i < filled ? A.accent : A.rule,
        }} />
      ))}
    </div>
  );
}

function SectionLabel({ children, style }: { children: React.ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ padding: '0 24px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10, ...style }}>
      <span style={{ fontFamily: A.sans, fontSize: 10, letterSpacing: '0.22em', color: A.muted, textTransform: 'uppercase' }}>
        {children}
      </span>
      <span style={{ flex: 1, height: 1, background: A.rule }} />
    </div>
  );
}

const catRowStyle: CSSProperties = {
  width: '100%', display: 'flex', alignItems: 'center', gap: 16,
  padding: '14px 14px', marginBottom: 8,
  background: A.paper, border: `1px solid ${A.rule}`, borderRadius: 14,
  textAlign: 'left', cursor: 'pointer', fontFamily: A.sans,
};

const iconBtn: CSSProperties = {
  width: 36, height: 36, borderRadius: 999,
  background: 'transparent', border: `1px solid ${A.rule}`,
  display: 'grid', placeItems: 'center', cursor: 'pointer',
};

// ── Home screen ───────────────────────────────────────────────────────────────

function HomeScreen({ cats, onStart, onSettings, onSentence, sentenceCount }: {
  cats: Cat[];
  onStart: (c: Cat) => void;
  onSettings: () => void;
  onSentence: () => void;
  sentenceCount: number;
}) {
  const firstInProgress = cats.find(c => c.done > 0 && c.done < c.wordCount) ?? cats[0];
  return (
    <div style={{ background: A.bg, minHeight: '100%', paddingBottom: 40 }}>
      {/* Masthead */}
      <div style={{ padding: '8px 24px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: A.sans, fontSize: 10, letterSpacing: '0.22em', color: A.muted, textTransform: 'uppercase', marginBottom: 6 }}>
              Vol. 01 · Burmese
            </div>
            <h1 style={{ fontFamily: A.serif, fontSize: 38, fontWeight: 500, letterSpacing: '-0.02em', color: A.ink, lineHeight: 1, fontStyle: 'italic' }}>
              Burmify
            </h1>
          </div>
          <button onClick={onSettings} style={{ ...iconBtn, color: A.inkSoft }} aria-label="Settings">
            <Icon name="settings" size={18} />
          </button>
        </div>
        <p style={{ fontFamily: A.serif, fontSize: 15, color: A.inkSoft, marginTop: 14, lineHeight: 1.5, maxWidth: '88%' }}>
          A quiet study of conversational Burmese, one word at a time.
        </p>
      </div>

      <Rule style={{ marginBottom: 22 }} />

      {/* Continue / start button */}
      <div style={{ padding: '0 24px 22px' }}>
        <button onClick={() => onStart(firstInProgress)} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 14,
          padding: '14px 16px', background: A.accent, color: A.onAccent,
          border: 'none', borderRadius: 14, textAlign: 'left', cursor: 'pointer', fontFamily: A.sans,
        }}>
          <Icon name="play" size={16} color={A.onAccent} strokeWidth={1.8} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.7 }}>
              {firstInProgress.done > 0 ? `Continue · ${firstInProgress.done}/${firstInProgress.wordCount}` : 'Start learning'}
            </div>
            <div style={{ fontFamily: A.serif, fontSize: 18, fontStyle: 'italic', marginTop: 2 }}>
              {firstInProgress.label}
            </div>
          </div>
          <Icon name="arrowR" size={18} color={A.onAccent} strokeWidth={1.6} />
        </button>
      </div>

      {/* Library */}
      <SectionLabel>The Library</SectionLabel>

      <div style={{ padding: '0 24px' }}>
        {cats.map((c, i) => (
          <button key={c.id} onClick={() => onStart(c)} style={catRowStyle}>
            <CatMark index={i + 1} sample={c.sample} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: A.serif, fontSize: 19, color: A.ink, fontWeight: 500, letterSpacing: '-0.01em' }}>{c.label}</div>
              <div style={{ fontFamily: A.sans, fontSize: 12.5, color: A.muted, marginTop: 2 }}>{c.desc}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                <Dots done={c.done} total={c.wordCount} />
                <span style={{ fontFamily: A.sans, fontSize: 11, color: A.muted, fontVariantNumeric: 'tabular-nums' }}>
                  {c.done}/{c.wordCount}
                </span>
              </div>
            </div>
            <Icon name="arrowR" size={16} color={A.muted} />
          </button>
        ))}
      </div>

      {/* Sentences */}
      <SectionLabel style={{ marginTop: 28 }}>Sentences</SectionLabel>
      <div style={{ padding: '0 24px' }}>
        <button onClick={onSentence} style={{ ...catRowStyle, background: A.accentSft, borderColor: 'transparent' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 12,
            background: A.paper, border: `1px solid ${A.rule}`,
            display: 'grid', placeItems: 'center', flexShrink: 0,
          }}>
            <span style={{ fontFamily: A.serif, fontStyle: 'italic', fontSize: 22, color: A.accent }}>¶</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: A.serif, fontSize: 19, color: A.ink, fontWeight: 500, fontStyle: 'italic' }}>
              Sentence practice
            </div>
            <div style={{ fontFamily: A.sans, fontSize: 12.5, color: A.inkSoft, marginTop: 4 }}>
              {sentenceCount} sentence{sentenceCount !== 1 ? 's' : ''} · Read, choose, repeat.
            </div>
          </div>
          <Icon name="arrowR" size={16} color={A.inkSoft} />
        </button>
      </div>
    </div>
  );
}

// ── Game screen ───────────────────────────────────────────────────────────────

function AnswerBtn({ word, hint, onClick, state }: {
  word: Word; hint: string; onClick: () => void; state: 'idle' | 'correct' | 'wrong';
}) {
  const isCorrect = state === 'correct';
  const isWrong = state === 'wrong';
  return (
    <button onClick={onClick} style={{
      flex: '0 0 auto', minWidth: 130, padding: '14px 14px',
      background: isCorrect ? A.good : isWrong ? A.bad : A.paper,
      border: `1px solid ${isCorrect ? A.good : isWrong ? A.bad : A.rule}`,
      borderRadius: 14, cursor: 'pointer', textAlign: 'center',
      fontFamily: A.sans, transition: 'all 0.2s',
    }}>
      <div style={{
        fontFamily: A.serif, fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em',
        color: isCorrect || isWrong ? A.onAccent : A.ink, fontStyle: 'italic',
      }}>{word.en}</div>
      <div style={{
        fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase',
        color: isCorrect || isWrong ? 'rgba(255,255,255,0.6)' : A.muted, marginTop: 4,
      }}>Key · {hint}</div>
    </button>
  );
}

function GameScreen({ cat, onPause, onComplete, allWords }: {
  cat: Cat;
  onPause: () => void;
  onComplete: (score: number, total: number) => void;
  allWords: Word[];
}) {
  const { recordResult, incrementSessions } = useProgressStore();
  const total = Math.min(cat.words.length, 8);
  const wordPool = useMemo(() => {
    const catWords = cat.words;
    if (catWords.length >= 4) return shuffle(catWords);
    const extras = allWords.filter(w => !catWords.find(cw => cw.id === w.id));
    return shuffle([...catWords, ...extras]);
  }, [cat, allWords]);

  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [pickedIndex, setPickedIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const question = wordPool[round % wordPool.length];
  const corners = useMemo(() => {
    const others = wordPool.filter(w => w.id !== question.id).slice(0, 3);
    return shuffle([question, ...others]);
  }, [round, question, wordPool]);
  const correctIndex = corners.findIndex(w => w.id === question.id);

  function pick(i: number) {
    if (feedback) return;
    const ok = i === correctIndex;
    setPickedIndex(i);
    setFeedback(ok ? 'correct' : 'incorrect');
    recordResult({ itemId: question.id, correct: ok, attempts: 1, timestamp: Date.now() });
    if (ok) setScore(s => s + 1);
    setTimeout(() => {
      setFeedback(null);
      setPickedIndex(null);
      if (round + 1 >= total) {
        incrementSessions();
        onComplete(ok ? score + 1 : score, total);
      } else {
        setRound(r => r + 1);
      }
    }, 950);
  }

  const hints = ['W', 'D', 'S', 'A'];

  return (
    <div style={{ background: A.bg, minHeight: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Top bar */}
      <div style={{ padding: '8px 20px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onPause} style={{ ...iconBtn, width: 32, height: 32 }} aria-label="Pause">
          <Icon name="pause" size={13} color={A.inkSoft} />
        </button>
        <div style={{ flex: 1, height: 4, background: A.rule, borderRadius: 999, overflow: 'hidden' }}>
          <div style={{
            width: `${((round + (feedback ? 1 : 0)) / total) * 100}%`,
            height: '100%', background: A.accent, transition: 'width 0.4s',
          }} />
        </div>
        <div style={{ fontFamily: A.serif, fontSize: 14, color: A.ink, fontVariantNumeric: 'tabular-nums', fontStyle: 'italic' }}>
          {score}<span style={{ color: A.muted, fontStyle: 'normal' }}>/{total}</span>
        </div>
      </div>

      {/* Category label */}
      <div style={{ textAlign: 'center', fontFamily: A.sans, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: A.muted, marginBottom: 14 }}>
        {cat.label} · Round {round + 1}
      </div>

      {/* Question card */}
      <div style={{
        margin: '0 24px 14px', padding: '34px 24px 28px',
        background: A.paper, border: `1px solid ${A.rule}`, borderRadius: 22,
        textAlign: 'center', position: 'relative', boxShadow: A.shadow,
      }}>
        <div style={{ position: 'absolute', top: 14, left: 18, fontFamily: A.sans, fontSize: 9, letterSpacing: '0.2em', color: A.muted, textTransform: 'uppercase' }}>
          Word {round + 1}
        </div>
        <div style={{ fontFamily: A.bur, fontSize: 44, lineHeight: 1.15, color: A.ink, marginTop: 8 }}>{question.burmese}</div>
        <div style={{ fontFamily: A.serif, fontSize: 17, fontStyle: 'italic', color: A.inkSoft, marginTop: 10 }}>{question.roman}</div>
      </div>

      {/* Prompt */}
      <div style={{ textAlign: 'center', fontFamily: A.serif, fontSize: 14, fontStyle: 'italic', color: A.inkSoft, marginBottom: 14 }}>
        Which is the English?
      </div>

      {/* Diamond board */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', padding: '0 16px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <AnswerBtn word={corners[0]} hint={hints[0]} onClick={() => pick(0)}
            state={feedback ? (correctIndex === 0 ? 'correct' : pickedIndex === 0 ? 'wrong' : 'idle') : 'idle'} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <AnswerBtn word={corners[3]} hint={hints[3]} onClick={() => pick(3)}
            state={feedback ? (correctIndex === 3 ? 'correct' : pickedIndex === 3 ? 'wrong' : 'idle') : 'idle'} />
          <div style={{ width: 1, height: 60, background: A.rule, opacity: 0.5 }} />
          <AnswerBtn word={corners[1]} hint={hints[1]} onClick={() => pick(1)}
            state={feedback ? (correctIndex === 1 ? 'correct' : pickedIndex === 1 ? 'wrong' : 'idle') : 'idle'} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <AnswerBtn word={corners[2]} hint={hints[2]} onClick={() => pick(2)}
            state={feedback ? (correctIndex === 2 ? 'correct' : pickedIndex === 2 ? 'wrong' : 'idle') : 'idle'} />
        </div>
      </div>

      {/* Feedback overlay */}
      {feedback && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: feedback === 'correct' ? 'oklch(48% 0.11 145 / 0.06)' : 'oklch(50% 0.16 25 / 0.06)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 60,
        }}>
          <div style={{
            background: feedback === 'correct' ? A.good : A.bad,
            color: A.onAccent, padding: '10px 22px', borderRadius: 999,
            fontFamily: A.serif, fontStyle: 'italic', fontSize: 16,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Icon name={feedback === 'correct' ? 'check' : 'x'} size={14} color={A.onAccent} strokeWidth={2} />
            {feedback === 'correct' ? 'Yes — that is right.' : `It was "${question.en}".`}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Results screen ────────────────────────────────────────────────────────────

function StatBlock({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: A.serif, fontSize: 28, fontStyle: 'italic', color: A.ink, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      <div style={{ fontFamily: A.sans, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: A.muted, marginTop: 4 }}>{label}</div>
    </div>
  );
}

function ResultsScreen({ cat, score, total, onReplay, onHome }: {
  cat: Cat; score: number; total: number; onReplay: () => void; onHome: () => void;
}) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const preview = cat.words.slice(0, 6);

  const btnSolid: CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '14px 18px', background: A.accent, color: A.onAccent,
    border: 'none', borderRadius: 12, cursor: 'pointer',
    fontFamily: A.sans, fontSize: 13, fontWeight: 500, letterSpacing: '0.02em',
  };
  const btnGhost: CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '14px 18px', background: A.paper, color: A.ink,
    border: `1px solid ${A.rule}`, borderRadius: 12, cursor: 'pointer',
    fontFamily: A.sans, fontSize: 13, fontWeight: 500, letterSpacing: '0.02em',
  };

  return (
    <div style={{ background: A.bg, minHeight: '100%', paddingBottom: 32 }}>
      <div style={{ padding: '14px 24px 6px', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: A.sans, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: A.muted }}>
          Session complete
        </span>
        <button onClick={onHome} style={{ ...iconBtn, width: 32, height: 32, color: A.inkSoft }}>
          <Icon name="x" size={13} color={A.inkSoft} strokeWidth={1.8} />
        </button>
      </div>

      <div style={{ padding: '24px 24px 30px', textAlign: 'center' }}>
        <div style={{ fontFamily: A.serif, fontSize: 96, fontWeight: 400, fontStyle: 'italic', lineHeight: 1, color: A.ink, letterSpacing: '-0.04em' }}>
          {pct}<span style={{ fontSize: 32, color: A.muted, fontStyle: 'normal' }}>%</span>
        </div>
        <div style={{ fontFamily: A.serif, fontSize: 16, color: A.inkSoft, marginTop: 10, fontStyle: 'italic' }}>
          {pct >= 80 ? 'A graceful round.' : pct >= 50 ? 'Solid progress.' : 'Worth another pass.'}
        </div>
      </div>

      <Rule />

      <div style={{ padding: '18px 24px 4px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
        <StatBlock label="Correct" value={score} />
        <StatBlock label="Words" value={total} />
        <StatBlock label="Category" value={cat.wordCount} />
      </div>

      <Rule />

      <SectionLabel style={{ marginTop: 22, marginBottom: 10 }}>Reviewed</SectionLabel>
      <div style={{ padding: '0 24px' }}>
        {preview.map((w, i) => (
          <div key={w.id} style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0',
            borderBottom: i === preview.length - 1 ? 'none' : `1px solid ${A.rule}`,
          }}>
            <span style={{ fontFamily: A.bur, fontSize: 18, color: A.ink, minWidth: 90 }}>{w.burmese}</span>
            <span style={{ flex: 1, fontFamily: A.serif, fontStyle: 'italic', fontSize: 14, color: A.inkSoft }}>{w.en}</span>
            <Icon name="check" size={14} color={A.good} strokeWidth={2} />
          </div>
        ))}
      </div>

      <div style={{ padding: '24px 24px 0', display: 'flex', gap: 10 }}>
        <button onClick={onHome} style={{ ...btnGhost, flex: 1 }}>
          <Icon name="home" size={14} color={A.ink} /> Library
        </button>
        <button onClick={onReplay} style={{ ...btnSolid, flex: 1 }}>
          <Icon name="refresh" size={14} color={A.onAccent} /> Again
        </button>
      </div>
    </div>
  );
}

// ── Settings screen ───────────────────────────────────────────────────────────

function ToggleRow({ label, sub, value, onChange }: {
  label: string; sub: string; value: boolean; onChange: (v: boolean) => void;
}) {
  const rowStyle: CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: `1px solid ${A.rule}` };
  return (
    <div style={rowStyle}>
      <div>
        <div style={{ fontFamily: A.serif, fontSize: 15, color: A.ink, fontStyle: 'italic' }}>{label}</div>
        <div style={{ fontFamily: A.sans, fontSize: 11.5, color: A.muted, marginTop: 2 }}>{sub}</div>
      </div>
      <button onClick={() => onChange(!value)} style={{
        width: 44, height: 24, borderRadius: 999, position: 'relative',
        background: value ? A.accent : A.rule, border: 'none', cursor: 'pointer', transition: 'background 0.2s',
      }}>
        <span style={{
          position: 'absolute', top: 2, left: value ? 22 : 2, width: 20, height: 20,
          borderRadius: '50%', background: A.onAccent, transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
        }} />
      </button>
    </div>
  );
}

function Segmented({ value, onChange, options }: {
  value: string; onChange: (v: PronunciationDisplay) => void;
  options: { id: PronunciationDisplay; label: string }[];
}) {
  return (
    <div style={{ display: 'flex', background: A.paper, border: `1px solid ${A.rule}`, borderRadius: 12, padding: 3, gap: 0 }}>
      {options.map(o => (
        <button key={o.id} onClick={() => onChange(o.id)} style={{
          flex: 1, padding: '8px 0', border: 'none', cursor: 'pointer',
          background: value === o.id ? A.accent : 'transparent',
          color: value === o.id ? A.onAccent : A.inkSoft,
          fontFamily: A.serif, fontStyle: 'italic', fontSize: 14,
          borderRadius: 9, transition: 'all 0.15s',
        }}>{o.label}</button>
      ))}
    </div>
  );
}

function SettingsScreen({ onBack }: { onBack: () => void }) {
  const { pronunciationDisplay, audioEnabled, setPronunciationDisplay, toggleAudio } = useSettingsStore();
  const { wordProgress } = useProgressStore();
  const totalSeen = Object.keys(wordProgress).length;

  const rowStyle: CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: `1px solid ${A.rule}` };

  return (
    <div style={{ background: A.bg, minHeight: '100%' }}>
      <div style={{ padding: '8px 20px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={onBack} style={{ ...iconBtn, width: 32, height: 32, color: A.inkSoft }}>
          <Icon name="arrowL" size={14} color={A.inkSoft} />
        </button>
        <h2 style={{ fontFamily: A.serif, fontSize: 22, fontStyle: 'italic', color: A.ink, fontWeight: 500 }}>Settings</h2>
      </div>
      <Rule />

      <SectionLabel style={{ marginTop: 22, marginBottom: 10 }}>Pronunciation</SectionLabel>
      <div style={{ padding: '0 24px' }}>
        <Segmented value={pronunciationDisplay} onChange={setPronunciationDisplay} options={[
          { id: 'romanization', label: 'Roman' },
          { id: 'phonetic', label: 'Phonetic' },
          { id: 'both', label: 'Both' },
        ]} />
        <p style={{ fontFamily: A.serif, fontStyle: 'italic', fontSize: 13, color: A.muted, marginTop: 10, lineHeight: 1.5 }}>
          {pronunciationDisplay === 'romanization' && 'mingalaba — close to the written script.'}
          {pronunciationDisplay === 'phonetic' && 'ming ahh lah bah — easier for English speakers.'}
          {pronunciationDisplay === 'both' && 'Show both side by side on every card.'}
        </p>
      </div>

      <SectionLabel style={{ marginTop: 26, marginBottom: 8 }}>Session</SectionLabel>
      <div style={{ padding: '0 24px' }}>
        <ToggleRow label="Sound" sub="Spoken Burmese on each card." value={audioEnabled} onChange={toggleAudio} />
      </div>

      <SectionLabel style={{ marginTop: 26, marginBottom: 8 }}>Progress</SectionLabel>
      <div style={{ padding: '0 24px' }}>
        <div style={rowStyle}>
          <span style={{ fontFamily: A.serif, fontSize: 15, color: A.ink, fontStyle: 'italic' }}>Words practiced</span>
          <span style={{ fontFamily: A.sans, fontSize: 13, color: A.muted, fontVariantNumeric: 'tabular-nums' }}>{totalSeen}</span>
        </div>
        <div style={{ ...rowStyle, borderBottom: 'none' }}>
          <span style={{ fontFamily: A.serif, fontSize: 15, color: A.ink, fontStyle: 'italic' }}>v2.0 · Atelier</span>
          <span style={{ fontFamily: A.sans, fontSize: 11, color: A.muted }}>Burmify</span>
        </div>
      </div>
    </div>
  );
}

// ── Sentence screen ───────────────────────────────────────────────────────────

function SentenceScreen({ sentences, onDone }: { sentences: SentEx[]; onDone: () => void }) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  const s = sentences[idx];
  const correctIdx = s.options.indexOf(s.answer);

  function choose(i: number) {
    if (picked !== null) return;
    setPicked(i);
    if (i === correctIdx) {
      setTimeout(() => {
        if (idx + 1 >= sentences.length) {
          onDone();
        } else {
          setPicked(null);
          setIdx(i => i + 1);
        }
      }, 900);
    }
  }

  return (
    <div style={{ background: A.bg, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '8px 20px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onDone} style={{ ...iconBtn, width: 32, height: 32, color: A.inkSoft }}>
          <Icon name="x" size={13} color={A.inkSoft} strokeWidth={1.8} />
        </button>
        <div style={{ flex: 1, height: 4, background: A.rule, borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ width: `${((idx) / sentences.length) * 100}%`, height: '100%', background: A.accent }} />
        </div>
        <span style={{ fontFamily: A.serif, fontSize: 13, fontStyle: 'italic', color: A.muted, fontVariantNumeric: 'tabular-nums' }}>
          {idx + 1}/{sentences.length}
        </span>
      </div>

      <div style={{ textAlign: 'center', padding: '14px 24px 0' }}>
        <div style={{ fontFamily: A.sans, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: A.muted, marginBottom: 26 }}>
          Complete the sentence
        </div>
      </div>

      <div style={{ padding: '0 24px', textAlign: 'center', marginTop: 10 }}>
        <div style={{ fontFamily: A.bur, fontSize: 30, lineHeight: 1.5, color: A.ink, marginBottom: 18 }}>
          {s.burmese.map((tok, i) => (
            <span key={i} style={{ display: 'inline-block', marginRight: 6 }}>
              {i === s.blankIndex ? (
                <span style={{
                  display: 'inline-block', minWidth: 90,
                  padding: '2px 14px', borderBottom: `2px solid ${A.accent}`,
                  color: picked != null ? (picked === correctIdx ? A.good : A.bad) : A.ink,
                  background: picked != null ? (picked === correctIdx ? 'oklch(48% 0.11 145 / 0.08)' : 'oklch(50% 0.16 25 / 0.08)') : 'transparent',
                  borderRadius: '4px 4px 0 0',
                }}>
                  {picked != null ? s.options[picked] : '?'}
                </span>
              ) : tok}
            </span>
          ))}
        </div>
        <div style={{ fontFamily: A.serif, fontStyle: 'italic', fontSize: 16, color: A.inkSoft, lineHeight: 1.5 }}>
          "{s.fullEn}"
        </div>
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ padding: '20px 24px 24px' }}>
        <div style={{ fontFamily: A.sans, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: A.muted, marginBottom: 12 }}>
          Choose a word
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {s.options.map((opt, i) => {
            const isCorrect = picked === i && i === correctIdx;
            const isWrong = picked === i && i !== correctIdx;
            return (
              <button key={i} onClick={() => choose(i)} style={{
                padding: '14px 12px', borderRadius: 12, cursor: 'pointer',
                background: isCorrect ? A.good : isWrong ? A.bad : A.paper,
                color: isCorrect || isWrong ? A.onAccent : A.ink,
                border: `1px solid ${isCorrect ? A.good : isWrong ? A.bad : A.rule}`,
                fontFamily: A.bur, fontSize: 22, transition: 'all 0.2s',
              }}>
                <div>{opt}</div>
                <div style={{ fontFamily: A.serif, fontStyle: 'italic', fontSize: 11, color: isCorrect || isWrong ? 'rgba(255,255,255,0.8)' : A.muted, marginTop: 4 }}>
                  {s.optionsEn[i]}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────

const rawDb = vocabularyData as { version: number; categories: RawCategory[] };

export default function App() {
  const { wordProgress } = useProgressStore();
  const { pronunciationDisplay } = useSettingsStore();

  const [screen, setScreen] = useState<Screen>('home');
  const [activeCat, setActiveCat] = useState<Cat | null>(null);
  const [gameResult, setGameResult] = useState({ score: 0, total: 0 });

  const allWords: Word[] = useMemo(() =>
    rawDb.categories.flatMap(c =>
      c.items.map(item => ({
        id: item.id,
        burmese: item.burmese,
        roman: pronunciationDisplay === 'phonetic' ? item.phonetic
          : pronunciationDisplay === 'both' ? `${item.romanization} · ${item.phonetic}`
          : item.romanization,
        en: item.english,
      }))
    ), [pronunciationDisplay]);

  const cats: Cat[] = useMemo(() =>
    rawDb.categories.map(rawCat => ({
      id: rawCat.id,
      label: rawCat.label,
      desc: rawCat.description,
      wordCount: rawCat.items.length,
      done: rawCat.items.filter(item => (wordProgress[item.id]?.correct ?? 0) >= 1).length,
      sample: rawCat.items[0]?.burmese ?? '',
      words: rawCat.items.map(item => ({
        id: item.id,
        burmese: item.burmese,
        roman: pronunciationDisplay === 'phonetic' ? item.phonetic
          : pronunciationDisplay === 'both' ? `${item.romanization} · ${item.phonetic}`
          : item.romanization,
        en: item.english,
      })),
    })), [wordProgress, pronunciationDisplay]);

  function startGame(c: Cat) {
    setActiveCat(c);
    setScreen('game');
  }

  function handleGameComplete(score: number, total: number) {
    setGameResult({ score, total });
    setScreen('results');
  }

  return (
    <div style={{ width: '100%', height: '100svh', background: A.bg, overflow: 'hidden', position: 'relative' }}>
      <div style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
        {screen === 'home' && (
          <HomeScreen
            cats={cats}
            onStart={startGame}
            onSettings={() => setScreen('settings')}
            onSentence={() => setScreen('sentence')}
            sentenceCount={SENTENCES.length}
          />
        )}
        {screen === 'game' && activeCat && (
          <GameScreen
            cat={activeCat}
            allWords={allWords}
            onPause={() => setScreen('home')}
            onComplete={handleGameComplete}
          />
        )}
        {screen === 'results' && activeCat && (
          <ResultsScreen
            cat={activeCat}
            score={gameResult.score}
            total={gameResult.total}
            onReplay={() => startGame(activeCat)}
            onHome={() => setScreen('home')}
          />
        )}
        {screen === 'settings' && (
          <SettingsScreen onBack={() => setScreen('home')} />
        )}
        {screen === 'sentence' && (
          <SentenceScreen sentences={SENTENCES} onDone={() => setScreen('home')} />
        )}
      </div>
    </div>
  );
}
