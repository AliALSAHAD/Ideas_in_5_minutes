import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
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
  const { toggleLang, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === 'dark';

  return (
    <header className={styles.header} role="banner">
      <span className={styles.logo} aria-label={t.title}>
        {t.title}
      </span>

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
            /* Sun icon for switching to light */
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
            /* Moon icon for switching to dark */
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
            <span className={styles.streakBadge}>🔥 {streakStats.streak}</span>
          )}
        </button>

        {/* Category selector */}
        <CategorySelector
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
        />

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
    </header>
  );
}
