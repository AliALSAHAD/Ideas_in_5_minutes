import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { CATEGORIES } from '../../data/translations';
import CategoryIcon from '../icons/CategoryIcon';
import CategorySelector from '../CategorySelector/CategorySelector';
import styles from './Header.module.css';

export default function Header({
  onOpenTopics,
  topicsExpanded,
  selectedCategory,
  onSelectCategory,
  onOpenVault,
  streakStats = { sessionsToday: 0, streak: 0 },
}) {
  const { toggleLang, t, lang } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isDark = theme === 'dark';

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  function handleCategoryClick(catId) {
    onSelectCategory(catId);
    closeMobileMenu();
  }

  function handleTopicsClick() {
    closeMobileMenu();
    onOpenTopics();
  }

  function handleVaultClick() {
    closeMobileMenu();
    onOpenVault();
  }

  return (
    <header className={styles.header} role="banner">
      <span className={styles.logo} aria-label={t.title}>
        {t.title}
      </span>

      {/* ─── Desktop Navigation Bar ───────────────────── */}
      <div className={styles.navActions}>
        {/* Theme Toggle (Dark / Light) */}
        <button
          id="btn-toggle-theme"
          className={styles.themeBtn}
          onClick={toggleTheme}
          aria-label={isDark ? t.switchToLight : t.switchToDark}
          title={isDark ? t.switchToLight : t.switchToDark}
        >
          {isDark ? (
            <svg
              width="15" height="15" viewBox="0 0 24 24"
              fill="none" stroke="currentColor"
              strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg
              width="15" height="15" viewBox="0 0 24 24"
              fill="none" stroke="currentColor"
              strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        {/* Language Toggle */}
        <button
          id="btn-switch-lang"
          className={styles.langBtn}
          onClick={toggleLang}
          aria-label={t.switchLangAria}
          title={t.switchLangAria}
        >
          <svg
            width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor"
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span className={styles.langText}>{t.switchLang}</span>
        </button>

        {/* Thought Vault & Streak Button */}
        <button
          id="btn-open-vault"
          className={styles.vaultBtn}
          onClick={onOpenVault}
          aria-label={t.vault}
          title={t.vault}
        >
          <span className={styles.vaultIcon}>✦</span>
          <span className={styles.vaultText}>
            {streakStats.sessionsToday > 0 ? `${streakStats.sessionsToday} ${t.todaySessions}` : t.vault}
          </span>
          {streakStats.streak > 0 && (
            <span className={styles.streakBadge}>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="currentColor"
                className={styles.flameIcon}
                aria-hidden="true"
              >
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z" />
              </svg>
              <span>{streakStats.streak}</span>
            </span>
          )}
        </button>

        {/* Category selector */}
        <CategorySelector
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
        />

        {/* Topics Panel Trigger */}
        <button
          id="btn-manage-topics"
          className={styles.topicsBtn}
          onClick={onOpenTopics}
          aria-label={t.manageTopics}
          aria-expanded={topicsExpanded}
          aria-controls="topics-panel"
        >
          <svg
            width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor"
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="3" y1="6"  x2="21" y2="6"  />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
          <span>{t.topics}</span>
        </button>
      </div>

      {/* ─── Mobile Bar Actions (< 768px) ─────────────── */}
      <div className={styles.mobileNavActions}>
        {streakStats.streak > 0 && (
          <button
            className={styles.mobileStreakBtn}
            onClick={onOpenVault}
            aria-label={t.vault}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="currentColor"
              className={styles.flameIcon}
              aria-hidden="true"
            >
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z" />
            </svg>
            <span>{streakStats.streak}</span>
          </button>
        )}

        <button
          id="btn-mobile-burger"
          className={`${styles.burgerBtn} ${mobileMenuOpen ? styles.burgerBtnActive : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? t.close : 'Menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          )}
        </button>
      </div>

      {/* ─── Mobile Drawer Overlay & Panel ────────────── */}
      {mobileMenuOpen && (
        <div className={styles.drawerBackdrop} onClick={closeMobileMenu} aria-hidden="true" />
      )}

      <div
        className={`${styles.mobileDrawer} ${mobileMenuOpen ? styles.mobileDrawerOpen : ''}`}
        aria-hidden={!mobileMenuOpen}
      >
        <div className={styles.drawerInner}>
          {/* Categories */}
          <div className={styles.drawerSection}>
            <span className={styles.drawerSectionTitle}>{t.filterByCategory}</span>
            <div className={styles.drawerCategories}>
              {CATEGORIES.map(cat => {
                const isSelected = selectedCategory === cat.id;
                const label = lang === 'ar' ? cat.ar : cat.en;
                return (
                  <button
                    key={cat.id}
                    className={`${styles.drawerCatBtn} ${isSelected ? styles.drawerCatBtnActive : ''}`}
                    onClick={() => handleCategoryClick(cat.id)}
                  >
                    <span className={styles.drawerCatIcon}>
                      <CategoryIcon id={cat.id} size={15} />
                    </span>
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.drawerDivider} />

          {/* Navigation Links */}
          <div className={styles.drawerNavItems}>
            <button className={styles.drawerNavItem} onClick={handleTopicsClick}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
              <span>{t.manageTopics}</span>
            </button>

            <button className={styles.drawerNavItem} onClick={handleVaultClick}>
              <span className={styles.vaultIcon}>✦</span>
              <span>{t.vault}</span>
              {streakStats.streak > 0 && (
                <span className={styles.drawerStreakBadge}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className={styles.flameIcon}>
                    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z" />
                  </svg>
                  <span>{streakStats.streak} {t.dayStreak}</span>
                </span>
              )}
            </button>
          </div>

          <div className={styles.drawerDivider} />

          {/* Preferences (Lang + Theme) */}
          <div className={styles.drawerPrefs}>
            <button className={styles.drawerPrefBtn} onClick={toggleLang}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              <span>{t.switchLang}</span>
            </button>

            <button className={styles.drawerPrefBtn} onClick={toggleTheme}>
              {isDark ? (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"/>
                    <line x1="12" y1="1" x2="12" y2="3"/>
                    <line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="3" y2="12"/>
                    <line x1="21" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                  </svg>
                  <span>{t.switchToLight}</span>
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                  <span>{t.switchToDark}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
