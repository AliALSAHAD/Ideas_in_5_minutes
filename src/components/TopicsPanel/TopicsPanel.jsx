import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../../context/LanguageContext';
import { CATEGORIES } from '../../data/translations';
import CategoryIcon from '../icons/CategoryIcon';
import styles from './TopicsPanel.module.css';

export default function TopicsPanel({
  isOpen,
  topics,
  onClose,
  onAdd,
  onRemove,
  selectedCategory,
  onSelectCategory,
}) {
  const { lang, t } = useLanguage();
  const inputRef = useRef(null);
  const closeBtnRef = useRef(null);

  // Focus trap & close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => closeBtnRef.current?.focus(), 50);

    function onKeyDown(e) {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab') return;

      const panel = document.getElementById('topics-panel');
      const focusable = panel?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  function handleAdd() {
    const val = inputRef.current?.value ?? '';
    const ok = onAdd(val);
    if (ok && inputRef.current) inputRef.current.value = '';
  }

  function handleInputKey(e) {
    if (e.key === 'Enter') handleAdd();
  }

  const panel = (
    <>
      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropVisible : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        id="topics-panel"
        className={`${styles.panel} ${isOpen ? styles.panelOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={t.topicsPool}
        aria-hidden={!isOpen}
      >
        <div className={styles.inner}>
          {/* Header */}
          <div className={styles.head}>
            <div className={styles.headLeft}>
              <h2 className={styles.title}>{t.topicsPool}</h2>
              <span className={styles.badge}>{topics.length} {t.topicsCount}</span>
            </div>
            <button
              ref={closeBtnRef}
              className={styles.closeBtn}
              onClick={onClose}
              aria-label={t.close}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
                aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Category Tabs */}
          <div className={styles.catTabs} role="tablist" aria-label={t.filterByCategory}>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const label = lang === 'ar' ? cat.ar : cat.en;
              return (
                <button
                  key={cat.id}
                  role="tab"
                  aria-selected={isSelected}
                  className={`${styles.catTab} ${isSelected ? styles.catTabActive : ''}`}
                  onClick={() => onSelectCategory(cat.id)}
                >
                  <span className={styles.tabIcon}>
                    <CategoryIcon id={cat.id} size={15} />
                  </span>
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          <p className={styles.desc}>{t.customTopicsDesc}</p>

          {/* List */}
          <ul className={styles.list} role="list">
            {topics.length === 0 && (
              <li className={styles.empty}>{t.emptyPoolWarning}</li>
            )}
            {topics.map((topic, idx) => (
              <li key={`${topic}-${idx}`} className={styles.item} role="listitem">
                <span className={styles.itemIndex}>{idx + 1}</span>
                <span className={styles.itemText}>{topic}</span>
                <button
                  className={styles.deleteBtn}
                  onClick={() => onRemove(idx)}
                  aria-label={`Delete: ${topic}`}
                  title="Delete topic"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                    aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </li>
            ))}
          </ul>

          {/* Add input */}
          <div className={styles.addRow}>
            <input
              ref={inputRef}
              type="text"
              className={styles.input}
              placeholder={t.addTopicPlaceholder}
              maxLength={80}
              aria-label={t.addTopicPlaceholder}
              onKeyDown={handleInputKey}
            />
            <button
              className={styles.addBtn}
              onClick={handleAdd}
              aria-label={t.add}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );

  return createPortal(panel, document.body);
}
