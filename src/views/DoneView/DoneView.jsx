import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { saveVaultSession } from '../../utils/vaultStorage';
import { generateStudioCard } from '../../utils/cardGenerator';
import { LENSES } from '../../components/MentalLenses/MentalLenses';
import styles from './DoneView.module.css';

export default function DoneView({
  topic,
  notes,
  duration = 5,
  selectedLens = 'firstPrinciples',
  onSpinAgain,
  onSessionSaved,
}) {
  const { t, lang } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [isExportingCard, setIsExportingCard] = useState(false);
  const hasSavedRef = useRef(false);

  const currentLensObj = LENSES.find((l) => l.id === selectedLens) || LENSES[0];

  // Automatically save to local Vault archive once on session completion
  useEffect(() => {
    if (!hasSavedRef.current && topic) {
      hasSavedRef.current = true;
      saveVaultSession({
        topic,
        duration,
        notes,
        lens: selectedLens,
        lang,
      });
      if (onSessionSaved) {
        onSessionSaved();
      }
    }
  }, [topic, duration, notes, selectedLens, lang, onSessionSaved]);

  function handleCopy() {
    if (!notes) return;
    navigator.clipboard.writeText(notes).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  }

  function handleDownloadTxt() {
    if (!notes) return;
    const content = `Ideas in 5 Minutes — Session Notes\nTopic: ${topic}\nLens: ${t[currentLensObj.key]}\nDate: ${new Date().toLocaleString()}\n\n---\nNotes:\n${notes}\n`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `idea-${topic.slice(0, 20).replace(/[^\w\s\u0600-\u06FF-]/g, '')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleExportStudioCard() {
    if (isExportingCard) return;
    setIsExportingCard(true);
    try {
      await generateStudioCard({
        topic,
        duration,
        notes,
        lang,
        lensName: t[currentLensObj.key],
      });
    } catch (err) {
      console.error('Failed to export studio card:', err);
    } finally {
      setIsExportingCard(false);
    }
  }

  return (
    <section className={styles.view} aria-label={t.timesUp}>
      <div className={styles.icon} aria-hidden="true">✦</div>
      <h1 className={styles.heading}>{t.timesUp}</h1>
      <p className={styles.sub}>{topic}</p>

      {/* ─── Captured Notes Card ──────────────────────── */}
      {notes && notes.trim().length > 0 && (
        <div className={styles.notesCard}>
          <div className={styles.notesHead}>
            <span className={styles.notesTitle}>{t.notesTaken}</span>
            <div className={styles.notesActions}>
              <button
                className={`${styles.copyBtn} ${copied ? styles.copiedSuccess : ''}`}
                onClick={handleCopy}
                aria-label={copied ? t.copied : t.copyNotes}
              >
                {copied ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                )}
                <span>{copied ? t.copied : t.copyNotes}</span>
              </button>

              <button
                className={styles.downloadBtn}
                onClick={handleDownloadTxt}
                aria-label={t.downloadNotes}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                <span>{t.downloadNotes}</span>
              </button>
            </div>
          </div>

          <div className={styles.notesBody}>
            {notes}
          </div>
        </div>
      )}

      {/* ─── Studio Card Export & Actions ─────────────── */}
      <div className={styles.actionCluster}>
        <button
          id="btn-export-studio-card"
          className={styles.studioCardBtn}
          onClick={handleExportStudioCard}
          disabled={isExportingCard}
          aria-label={t.exportStudioCard}
        >
          {isExportingCard ? (
            <span className={styles.spinner} aria-hidden="true"></span>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          )}
          <span>{isExportingCard ? t.generatingCard : t.exportStudioCard}</span>
        </button>

        <button
          id="btn-spin-again"
          className={styles.againBtn}
          onClick={onSpinAgain}
          aria-label={t.spinAgain}
        >
          {t.spinAgain}
        </button>
      </div>
    </section>
  );
}
