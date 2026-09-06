import { useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import MentalLenses from '../../components/MentalLenses/MentalLenses';
import styles from './ResultView.module.css';

export default function ResultView({
  topic,
  selectedLens,
  onSelectLens,
  onSelectDuration,
  onRespin,
}) {
  const { t } = useLanguage();
  const headingRef = useRef(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  }

  return (
    <section
      className={styles.view}
      aria-label={t.yourTopic}
    >
      <p className="eyebrow">{t.yourTopic}</p>

      {/* Pure typography topic without box/border */}
      <h1
        ref={headingRef}
        className={styles.topic}
        tabIndex={-1}
      >
        {topic}
      </h1>

      {/* Thinking Angles / Mental Lenses */}
      <MentalLenses
        selectedLens={selectedLens}
        onSelectLens={onSelectLens}
      />

      <div className={styles.durationSection}>
        <p className={styles.hint}>
          {t.chooseDuration}
        </p>

        <div
          className={styles.durationGrid}
          role="group"
          aria-label={t.chooseDuration}
        >
          {t.durations.map(({ minutes, label }) => (
            <button
              key={minutes}
              className={styles.durationCard}
              onMouseMove={handleMouseMove}
              onClick={() => onSelectDuration(minutes)}
              aria-label={`${minutes} ${t.min}`}
            >
              <span className={styles.num}>{minutes}</span>
              <span className={styles.unit}>{t.min}</span>
              <span className={styles.cardLabel}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        id="btn-respin"
        className={styles.respinBtn}
        onClick={onRespin}
        aria-label={t.tryAnother}
      >
        {t.tryAnother}
      </button>
    </section>
  );
}
