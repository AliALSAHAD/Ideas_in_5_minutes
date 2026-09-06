import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { CATEGORIES } from '../../data/translations';
import CategoryIcon from '../icons/CategoryIcon';
import styles from './CategorySelector.module.css';

export default function CategorySelector({ selectedCategory, onSelectCategory }) {
  const { lang, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const activeCat = CATEGORIES.find((c) => c.id === selectedCategory) || CATEGORIES[0];
  const activeLabel = lang === 'ar' ? activeCat.ar : activeCat.en;

  // Close on outside click or Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  function handleSelect(catId) {
    onSelectCategory(catId);
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className={styles.container}>
      <button
        id="btn-category-selector"
        className={`${styles.trigger} ${isOpen ? styles.triggerActive : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`${t.filterByCategory} ${activeLabel}`}
        title={t.filterByCategory}
      >
        <span className={styles.triggerIcon}>
          <CategoryIcon id={activeCat.id} size={14} />
        </span>
        <span className={styles.triggerLabel}>{activeLabel}</span>
        <svg
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className={styles.dropdown} role="listbox" aria-label={t.filterByCategory}>
          {CATEGORIES.map((cat) => {
            const isSelected = cat.id === selectedCategory;
            const label = lang === 'ar' ? cat.ar : cat.en;
            return (
              <button
                key={cat.id}
                role="option"
                aria-selected={isSelected}
                className={`${styles.option} ${isSelected ? styles.optionSelected : ''}`}
                onClick={() => handleSelect(cat.id)}
              >
                <span className={styles.optIcon}>
                  <CategoryIcon id={cat.id} size={15} />
                </span>
                <span className={styles.optLabel}>{label}</span>
                {isSelected && (
                  <svg
                    className={styles.checkIcon}
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
