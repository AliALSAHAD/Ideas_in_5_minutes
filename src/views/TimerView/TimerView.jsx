import { useLanguage } from '../../context/LanguageContext';
import TimerRing from '../../components/TimerRing/TimerRing';
import AmbientSound from '../../components/AmbientSound/AmbientSound';
import { LENSES } from '../../components/MentalLenses/MentalLenses';
import styles from './TimerView.module.css';

export default function TimerView({
  topic,
  selectedLens,
  displayTime,
  ringOffset,
  isWarning,
  isPaused,
  onTogglePause,
  onReset,
  notes,
  onNotesChange,
}) {
  const { t } = useLanguage();

  const currentLensObj = LENSES.find((l) => l.id === selectedLens) || LENSES[0];

  return (
    <section className={styles.view} aria-label={t.timeRemaining}>
      <p className="eyebrow">{t.yourTopic}</p>

      <h1 className={styles.topic}>{topic}</h1>

      {/* Lens Prompt Pill in Timer */}
      {selectedLens && (
        <div className={styles.lensNotice}>
          <span className={styles.lensBadge}>{t[currentLensObj.key]}</span>
          <span className={styles.lensPromptText}>{t[currentLensObj.promptKey]}</span>
        </div>
      )}

      <TimerRing
        displayTime={displayTime}
        ringOffset={ringOffset}
        isWarning={isWarning}
      />

      <div className={styles.actions}>
        <div className={styles.primaryActions}>
          <button
            className={styles.pauseBtn}
            onClick={onTogglePause}
            aria-label={isPaused ? t.resume : t.pause}
          >
            {isPaused ? (
              /* Play icon */
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            ) : (
              /* Pause icon */
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="6" y="4" width="4" height="16" rx="1"/>
                <rect x="14" y="4" width="4" height="16" rx="1"/>
              </svg>
            )}
            <span>{isPaused ? t.resume : t.pause}</span>
          </button>

          {/* Built-in Zen Ambient Soundscapes */}
          <AmbientSound isPaused={isPaused} />
        </div>

        <button
          className={styles.resetBtn}
          onClick={onReset}
          aria-label={t.reset}
        >
          {t.reset}
        </button>
      </div>

      {/* ─── Zen Scratchpad ─────────────────────────────── */}
      <div className={styles.scratchpadWrap}>
        <div className={styles.scratchpadHeader}>
          <svg className={styles.penIcon} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          <span>{t.scratchpadLabel}</span>
        </div>
        <textarea
          className={styles.scratchpadInput}
          value={notes || ''}
          onChange={(e) => onNotesChange?.(e.target.value)}
          placeholder={t.scratchpadPlaceholder}
          rows={2}
          aria-label={t.scratchpadLabel}
        />
      </div>
    </section>
  );
}
