import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  getVaultSessions,
  deleteVaultSession,
  clearVaultSessions,
  getStreakStats,
  exportVaultToMarkdown,
} from '../../utils/vaultStorage';
import styles from './VaultModal.module.css';

export default function VaultModal({ isOpen, onClose }) {
  const { lang, t } = useLanguage();
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({ sessionsToday: 0, streak: 0, totalSessions: 0 });
  const [copiedId, setCopiedId] = useState(null);
  const closeBtnRef = useRef(null);

  const refreshData = () => {
    setSessions(getVaultSessions());
    setStats(getStreakStats());
  };

  useEffect(() => {
    if (isOpen) {
      refreshData();
      setTimeout(() => closeBtnRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  function handleDelete(id) {
    const updated = deleteVaultSession(id);
    setSessions(updated);
    setStats(getStreakStats());
  }

  function handleClear() {
    if (window.confirm(lang === 'ar' ? 'هل أنت متأكد من مسح جميع جلسات الأرشيف؟' : 'Are you sure you want to clear all vault sessions?')) {
      clearVaultSessions();
      refreshData();
    }
  }

  function handleCopyNote(id, note) {
    if (!note) return;
    navigator.clipboard.writeText(note).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  function handleExport() {
    exportVaultToMarkdown(sessions, lang);
  }

  return (
    <>
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropVisible : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`${styles.panel} ${isOpen ? styles.panelOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={t.vault}
        aria-hidden={!isOpen}
      >
        <div className={styles.inner}>
          {/* Header */}
          <div className={styles.head}>
            <div className={styles.headLeft}>
              <h2 className={styles.title}>{t.vault}</h2>
              <span className={styles.badge}>
                {stats.totalSessions} {t.sessionsCount}
              </span>
            </div>
            <button
              ref={closeBtnRef}
              className={styles.closeBtn}
              onClick={onClose}
              aria-label={t.close}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Streak & Productivity Stats Card */}
          <div className={styles.statsCard}>
            <div className={styles.statItem}>
              <span className={styles.statVal}>{stats.sessionsToday}</span>
              <span className={styles.statLabel}>{t.todaySessions}</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statVal}>
                {stats.streak > 0 ? (
                  <span className={styles.streakStatWrap}>
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className={styles.flameIcon}
                      aria-hidden="true"
                    >
                      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z" />
                    </svg>
                    <span>{stats.streak}</span>
                  </span>
                ) : (
                  '0'
                )}
              </span>
              <span className={styles.statLabel}>{t.dayStreak}</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statVal}>{stats.totalSessions}</span>
              <span className={styles.statLabel}>{t.sessionsCount}</span>
            </div>
          </div>

          {/* Actions Bar */}
          {sessions.length > 0 && (
            <div className={styles.actionsBar}>
              <button className={styles.exportBtn} onClick={handleExport}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>{t.exportMarkdown}</span>
              </button>
              <button className={styles.clearBtn} onClick={handleClear}>
                {t.clearAll}
              </button>
            </div>
          )}

          {/* Sessions List */}
          <div className={styles.list}>
            {sessions.length === 0 ? (
              <div className={styles.empty}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={styles.emptyIcon} aria-hidden="true">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                <p>{t.emptyVault}</p>
              </div>
            ) : (
              sessions.map((sess) => {
                const dateStr = new Date(sess.timestamp).toLocaleDateString(
                  lang === 'ar' ? 'ar-SA' : 'en-US',
                  { month: 'short', day: 'numeric' }
                );
                return (
                  <div key={sess.id} className={styles.sessionCard}>
                    <div className={styles.cardTop}>
                      <span className={styles.topicName}>{sess.topic}</span>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(sess.id)}
                        aria-label="Delete"
                        title="Delete"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>

                    <div className={styles.cardMeta}>
                      <span className={styles.metaPill}>{dateStr}</span>
                      <span className={styles.metaPill}>
                        {sess.duration} {t.min}
                      </span>
                      {sess.lens && (
                        <span className={styles.metaLens}>
                          {t[`lens${sess.lens.charAt(0).toUpperCase() + sess.lens.slice(1)}`] || sess.lens}
                        </span>
                      )}
                    </div>

                    {sess.notes && (
                      <div className={styles.cardNotesBox}>
                        <p className={styles.cardNotesText}>{sess.notes}</p>
                        <button
                          className={styles.noteCopyBtn}
                          onClick={() => handleCopyNote(sess.id, sess.notes)}
                          aria-label="Copy note"
                        >
                          {copiedId === sess.id ? (
                            <span className={styles.copiedHint}>✓ {t.copied}</span>
                          ) : (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
