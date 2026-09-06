import { useState, useCallback, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { getLocalizedTopic } from './data/translations';
import Header from './components/Header/Header';
import TopicsPanel from './components/TopicsPanel/TopicsPanel';
import VaultModal from './components/VaultModal/VaultModal';
import IdleView from './views/IdleView/IdleView';
import ResultView from './views/ResultView/ResultView';
import TimerView from './views/TimerView/TimerView';
import DoneView from './views/DoneView/DoneView';
import { useTopics } from './hooks/useTopics';
import { useTimer } from './hooks/useTimer';
import { useDrum } from './hooks/useDrum';
import { getStreakStats } from './utils/vaultStorage';
import styles from './App.module.css';

// Views: 'idle' | 'result' | 'timer' | 'done'
function AppContent() {
  const { lang } = useLanguage();
  const [view, setView] = useState('idle');
  const [pickedTopic, setPickedTopic] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');
  const [selectedLens, setSelectedLens] = useState('firstPrinciples');
  const [selectedDuration, setSelectedDuration] = useState(5);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [streakStats, setStreakStats] = useState(() => getStreakStats());

  const { topics, addTopic, removeTopic } = useTopics(lang, selectedCategory);
  const { reelRef, drumWrapRef, spin, smartRandom } = useDrum(topics);

  // Sync picked topic when language changes
  useEffect(() => {
    if (pickedTopic) {
      setPickedTopic((prev) => getLocalizedTopic(prev, lang));
    }
  }, [lang]);

  const handleTimerDone = useCallback(() => setView('done'), []);
  const timer = useTimer(handleTimerDone);

  /* ── Spin ─────────────────────────────────────────── */
  const handleSpin = useCallback(() => {
    if (isSpinning || topics.length === 0) return;
    const topic = smartRandom();
    if (!topic) return;

    setIsSpinning(true);
    spin(topic, () => {
      setIsSpinning(false);
      setPickedTopic(topic);
      setTimeout(() => setView('result'), 450);
    });
  }, [isSpinning, topics.length, smartRandom, spin]);

  /* ── Re-spin ──────────────────────────────────────── */
  const handleRespin = useCallback(() => {
    setView('idle');
    setSessionNotes('');
    setTimeout(() => handleSpin(), 80);
  }, [handleSpin]);

  /* ── Select duration → start timer ───────────────── */
  const handleSelectDuration = useCallback((minutes, seconds = 0) => {
    const totalMinutes = seconds > 0 ? (seconds / 60) : minutes;
    setSelectedDuration(totalMinutes);
    timer.start(minutes, seconds);
    setView('timer');
  }, [timer]);

  /* ── Reset to idle ────────────────────────────────── */
  const handleReset = useCallback(() => {
    timer.reset();
    setPickedTopic('');
    setSessionNotes('');
    setView('idle');
  }, [timer]);

  return (
    <>
      <Header
        onOpenTopics={() => setIsPanelOpen(true)}
        topicsExpanded={isPanelOpen}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onOpenVault={() => setIsVaultOpen(true)}
        streakStats={streakStats}
      />

      <main id="main-content" className={styles.stage} aria-live="polite">
        {view === 'idle' && (
          <IdleView
            reelRef={reelRef}
            drumWrapRef={drumWrapRef}
            onSpin={handleSpin}
            isSpinning={isSpinning}
          />
        )}
        {view === 'result' && (
          <ResultView
            topic={pickedTopic}
            selectedLens={selectedLens}
            onSelectLens={setSelectedLens}
            onSelectDuration={handleSelectDuration}
            onRespin={handleRespin}
          />
        )}
        {view === 'timer' && (
          <TimerView
            topic={pickedTopic}
            selectedLens={selectedLens}
            displayTime={timer.displayTime}
            ringOffset={timer.ringOffset}
            isWarning={timer.isWarning}
            isPaused={timer.isPaused}
            onTogglePause={timer.togglePause}
            onReset={handleReset}
            notes={sessionNotes}
            onNotesChange={setSessionNotes}
          />
        )}
        {view === 'done' && (
          <DoneView
            topic={pickedTopic}
            notes={sessionNotes}
            duration={selectedDuration}
            selectedLens={selectedLens}
            onSpinAgain={handleReset}
            onSessionSaved={() => setStreakStats(getStreakStats())}
          />
        )}
      </main>

      <TopicsPanel
        isOpen={isPanelOpen}
        topics={topics}
        onClose={() => setIsPanelOpen(false)}
        onAdd={addTopic}
        onRemove={removeTopic}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <VaultModal
        isOpen={isVaultOpen}
        onClose={() => {
          setIsVaultOpen(false);
          setStreakStats(getStreakStats());
        }}
      />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}
