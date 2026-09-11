import { useLanguage } from '../../context/LanguageContext';
import Drum from '../../components/Drum/Drum';
import styles from './IdleView.module.css';

export default function IdleView({ reelRef, drumWrapRef, onSpin, isSpinning }) {
  const { t } = useLanguage();

  function handleSpinClick() {
    if (isSpinning) return;
    onSpin();
  }

  return (
    <section className={styles.view} aria-label={t.heroTitle}>
      {/* Hero Presentation */}
      <header className={styles.heroHeader}>
        <h1 className={styles.heroTitle}>
          {t.heroTitle}
        </h1>
        <p className={styles.heroSubtitle}>
          {t.heroSubtitle}
        </p>
      </header>

      {/* Interactive Drum Centerpiece */}
      <div className={styles.drumSection}>
        <Drum reelRef={reelRef} drumWrapRef={drumWrapRef} />
      </div>

      {/* Primary Action & Guidance */}
      <div className={styles.actionSection}>
        <button
          id="btn-spin"
          className={`${styles.spinBtn} ${isSpinning ? styles.spinning : ''}`}
          onClick={handleSpinClick}
          disabled={isSpinning}
          aria-label={isSpinning ? t.spinning : t.spin}
        >
          <span className={styles.spinLabel}>
            {isSpinning ? t.spinning : t.spin}
          </span>
          <span className={styles.spinSub}>
            {isSpinning ? t.findingTopic : t.pickTopic}
          </span>
        </button>

        <p className={styles.heroHint}>
          {t.heroHint}
        </p>
      </div>
    </section>
  );
}
