import styles from './Drum.module.css';

export default function Drum({ reelRef, drumWrapRef }) {
  return (
    <div ref={drumWrapRef} className={styles.wrap} aria-hidden="true">
      {/* Precision corner reticles */}
      <span className={`${styles.corner} ${styles.cornerTL}`} />
      <span className={`${styles.corner} ${styles.cornerTR}`} />
      <span className={`${styles.corner} ${styles.cornerBL}`} />
      <span className={`${styles.corner} ${styles.cornerBR}`} />

      <div className={styles.drum}>
        <div ref={reelRef} className={styles.reel} />
      </div>
      <div className={`${styles.shade} ${styles.shadeTop}`} />
      <div className={`${styles.shade} ${styles.shadeBottom}`} />
      <div className={styles.cursor} />
    </div>
  );
}
