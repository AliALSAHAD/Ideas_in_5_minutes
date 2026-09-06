import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { ambientAudio } from '../../utils/audioEngine';
import styles from './AmbientSound.module.css';

const SOUNDS = [
  { id: 'off', labelKey: 'soundOff' },
  { id: 'rain', labelKey: 'soundRain' },
  { id: 'drone', labelKey: 'soundDrone' },
  { id: 'chrono', labelKey: 'soundChrono' },
];

export default function AmbientSound({ isPaused = false }) {
  const { t } = useLanguage();
  const [activeSound, setActiveSound] = useState('off');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function onDocClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // Handle timer pause/resume
  useEffect(() => {
    if (isPaused) {
      ambientAudio.stop();
    } else if (activeSound !== 'off') {
      ambientAudio.start(activeSound);
    }
  }, [isPaused, activeSound]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      ambientAudio.stop();
    };
  }, []);

  function handleSelect(id) {
    setActiveSound(id);
    setIsOpen(false);
    if (id === 'off') {
      ambientAudio.stop();
    } else {
      ambientAudio.start(id);
    }
  }

  const isPlaying = activeSound !== 'off' && !isPaused;
  const currentSoundObj = SOUNDS.find((s) => s.id === activeSound) || SOUNDS[0];

  return (
    <div ref={containerRef} className={styles.container}>
      <button
        className={`${styles.trigger} ${isPlaying ? styles.triggerPlaying : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={t.ambientFocus}
        title={t.ambientFocus}
      >
        {/* Waveform / Sound icon */}
        <div className={styles.waveIcon} aria-hidden="true">
          <span className={`${styles.bar} ${isPlaying ? styles.barAnim1 : ''}`} />
          <span className={`${styles.bar} ${isPlaying ? styles.barAnim2 : ''}`} />
          <span className={`${styles.bar} ${isPlaying ? styles.barAnim3 : ''}`} />
        </div>

        <span className={styles.label}>
          {activeSound === 'off' ? t.ambientFocus : t[currentSoundObj.labelKey]}
        </span>

        <svg className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className={styles.dropdown} role="menu">
          {SOUNDS.map((s) => {
            const isSelected = activeSound === s.id;
            return (
              <button
                key={s.id}
                role="menuitem"
                className={`${styles.option} ${isSelected ? styles.optionSelected : ''}`}
                onClick={() => handleSelect(s.id)}
              >
                <span className={styles.optionDot}>{isSelected ? '●' : '○'}</span>
                <span>{t[s.labelKey]}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
