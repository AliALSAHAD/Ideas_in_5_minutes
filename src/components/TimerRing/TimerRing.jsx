import styles from './TimerRing.module.css';

const CIRCUMFERENCE = 540.35; // 2π × 86

export default function TimerRing({ displayTime, ringOffset, isWarning }) {
  return (
    <div
      className={styles.wrap}
      role="timer"
      aria-live="assertive"
      aria-label={`${displayTime} remaining`}
    >
      <svg
        className={styles.ring}
        viewBox="0 0 200 200"
        aria-hidden="true"
      >
        <circle className={styles.track} cx="100" cy="100" r="86" />
        <circle
          className={`${styles.progress} ${isWarning ? styles.warning : ''}`}
          cx="100"
          cy="100"
          r="86"
          style={{
            strokeDasharray: CIRCUMFERENCE,
            strokeDashoffset: ringOffset,
          }}
        />
      </svg>
      <div className={styles.display}>
        <span className={styles.time} aria-hidden="true">
          {displayTime}
        </span>
        <span className={styles.label}>remaining</span>
      </div>
    </div>
  );
}
