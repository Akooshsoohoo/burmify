import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSessionStore } from './store/sessionStore';
import { useProgressStore } from './store/progressStore';
import type { Category } from './data/vocabulary.types';
import type { SentenceTemplate } from './data/sentence.types';
import vocabularyData from './data/vocabulary.json';
import sentencesData from './data/sentences.json';
import { HomeScreen } from './components/screens/HomeScreen';
import { SessionScreen } from './components/screens/SessionScreen';
import { ExposureScreen } from './components/screens/ExposureScreen';
import { ResultsScreen } from './components/screens/ResultsScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { SentenceScreen } from './components/screens/SentenceScreen';
import { getUnlockedSentences } from './utils/getUnlockedSentences';
import { shuffle } from './utils/shuffleQueue';

type Screen = 'home' | 'session' | 'results' | 'settings' | 'sentence';

const db = vocabularyData as { version: number; categories: Category[] };
const sentenceTemplates = (sentencesData as { version: number; sentences: SentenceTemplate[] }).sentences;

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [activeSentences, setActiveSentences] = useState<SentenceTemplate[]>([]);
  const { startSession, status, score, maxStreak, roundHistory, endSession, categoryId } = useSessionStore();
  const { wordProgress } = useProgressStore();
  const completedCount = roundHistory.length;

  const allVocabItems = useMemo(() => db.categories.flatMap((c) => c.items), []);

  const allCategory: Category = useMemo(() => ({
    id: 'all',
    label: 'All Words',
    description: `All ${allVocabItems.length} words across every category`,
    color: '#a78bfa',
    icon: '📚',
    items: allVocabItems,
  }), [allVocabItems]);

  const activeCategory = useMemo(() => {
    if (!categoryId) return null;
    if (categoryId === 'all') return allCategory;
    return db.categories.find((c) => c.id === categoryId) ?? null;
  }, [categoryId, allCategory]);

  const unlockedSentences = useMemo(
    () => getUnlockedSentences(sentenceTemplates, wordProgress),
    [wordProgress]
  );

  const hasActiveSession = status === 'exposure' || status === 'playing' || status === 'animating';

  useEffect(() => {
    if (status === 'complete' && screen === 'session') {
      setScreen('results');
    }
  }, [status, screen]);

  const handleStart = (cat: Category) => {
    startSession(cat.id, cat.items);
    setScreen('session');
  };

  const handleReplay = () => {
    if (activeCategory) {
      startSession(activeCategory.id, activeCategory.items);
      setScreen('session');
    }
  };

  const handleHome = () => {
    endSession();
    setScreen('home');
  };

  const handlePause = () => setScreen('home');

  const handleResume = () => setScreen('session');

  const handleStartSentences = useCallback(() => {
    setActiveSentences(shuffle([...unlockedSentences]));
    setScreen('sentence');
  }, [unlockedSentences]);

  return (
    <div className="w-full h-[100svh] relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {screen === 'home' && (
        <HomeScreen
          categories={db.categories}
          allCategory={allCategory}
          onStart={handleStart}
          onSettings={() => setScreen('settings')}
          sentenceCount={unlockedSentences.length}
          onStartSentences={handleStartSentences}
          hasActiveSession={hasActiveSession}
          activeCategory={activeCategory}
          completedCount={completedCount}
          onResume={handleResume}
        />
      )}

      {screen === 'session' && activeCategory && status === 'exposure' && (
        <ExposureScreen
          accentColor={activeCategory.color}
          completed={completedCount}
          total={activeCategory.items.length}
          onPause={handlePause}
        />
      )}

      {screen === 'session' && activeCategory && (status === 'playing' || status === 'animating') && (
        <SessionScreen
          accentColor={activeCategory.color}
          totalWords={activeCategory.items.length}
          onPause={handlePause}
        />
      )}

      {screen === 'results' && (
        <ResultsScreen
          score={score}
          total={activeCategory?.items.length ?? 0}
          maxStreak={maxStreak}
          history={roundHistory}
          allItems={allVocabItems}
          onReplay={handleReplay}
          onHome={handleHome}
        />
      )}

      {screen === 'settings' && (
        <SettingsScreen onBack={() => setScreen('home')} />
      )}

      {screen === 'sentence' && activeSentences.length > 0 && (
        <SentenceScreen
          sentences={activeSentences}
          allItems={allVocabItems}
          onComplete={() => setScreen('home')}
        />
      )}
    </div>
  );
}
