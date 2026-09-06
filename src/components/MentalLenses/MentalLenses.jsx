import { useLanguage } from '../../context/LanguageContext';
import styles from './MentalLenses.module.css';

export const LENSES = [
  { id: 'firstPrinciples', key: 'lensFirstPrinciples', promptKey: 'lensFirstPrinciplesPrompt' },
  { id: 'challenge', key: 'lensChallenge', promptKey: 'lensChallengePrompt' },
  { id: 'future', key: 'lensFuture', promptKey: 'lensFuturePrompt' },
];

export default function MentalLenses({ selectedLens, onSelectLens, compact = false }) {
  const { t } = useLanguage();

  const currentLens = LENSES.find((l) => l.id === selectedLens) || LENSES[0];

  return (
    <div className={`${styles.wrap} ${compact ? styles.compact : ''}`}>
      <div className={styles.header}>
        <span className={styles.eyebrow}>{t.mentalLensesTitle}</span>
      </div>

      <div className={styles.tabs} role="tablist" aria-label={t.mentalLensesTitle}>
        {LENSES.map((l) => {
          const isActive = selectedLens === l.id;
          return (
            <button
              key={l.id}
              role="tab"
              aria-selected={isActive}
              className={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
              onClick={() => onSelectLens(l.id)}
            >
              {isActive && <span className={styles.activeDot} aria-hidden="true" />}
              <span>{t[l.key]}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.promptCard} role="region" aria-live="polite">
        <svg className={styles.sparkIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
        <p className={styles.promptText}>
          {t[currentLens.promptKey]}
        </p>
      </div>
    </div>
  );
}
