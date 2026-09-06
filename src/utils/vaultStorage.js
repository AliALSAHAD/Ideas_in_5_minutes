// Vault Storage & Streak Analytics for Ideas in 5 Minutes

const VAULT_KEY = 'ideas5min_vault_sessions_v1';

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getVaultSessions() {
  try {
    const raw = localStorage.getItem(VAULT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (_) {}
  return [];
}

export function saveVaultSession({ topic, duration, notes = '', lens = '', lang = 'ar' }) {
  if (!topic) return null;
  const sessions = getVaultSessions();
  const newSession = {
    id: `sess_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    topic,
    duration: duration ?? 5,
    notes: notes.trim(),
    lens,
    lang,
    timestamp: Date.now(),
    dateStr: getTodayStr(),
  };

  const updated = [newSession, ...sessions];
  try {
    localStorage.setItem(VAULT_KEY, JSON.stringify(updated));
  } catch (_) {}
  return newSession;
}

export function deleteVaultSession(id) {
  const sessions = getVaultSessions();
  const updated = sessions.filter((s) => s.id !== id);
  try {
    localStorage.setItem(VAULT_KEY, JSON.stringify(updated));
  } catch (_) {}
  return updated;
}

export function clearVaultSessions() {
  try {
    localStorage.removeItem(VAULT_KEY);
  } catch (_) {}
  return [];
}

export function getStreakStats() {
  const sessions = getVaultSessions();
  const today = getTodayStr();

  // 1. Sessions today
  const sessionsToday = sessions.filter((s) => s.dateStr === today).length;

  // 2. Unique active dates sorted descending
  const uniqueDates = Array.from(new Set(sessions.map((s) => s.dateStr))).sort().reverse();

  // 3. Calculate consecutive days streak
  let streak = 0;
  if (uniqueDates.length > 0) {
    const checkDate = new Date();
    // If today had no session, check if yesterday was the latest
    if (uniqueDates[0] === today) {
      streak = 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
      if (uniqueDates[0] === yesterdayStr) {
        streak = 1;
        checkDate.setDate(checkDate.getDate() - 2);
      }
    }

    if (streak > 0) {
      for (let i = 1; i < uniqueDates.length; i++) {
        const expected = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
        if (uniqueDates[i] === expected) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }
  }

  return {
    sessionsToday,
    streak,
    totalSessions: sessions.length,
  };
}

export function exportVaultToMarkdown(sessions, lang = 'ar') {
  if (!sessions || sessions.length === 0) return;
  const isAr = lang === 'ar';

  let md = `# ${isAr ? 'أرشيف أفكار في 5 دقائق ✦ Ideas in 5 Minutes' : 'Ideas in 5 Minutes — Thought Vault'}\n\n`;
  md += `> ${isAr ? 'تم تصدير هذا الأرشيف تلقائياً من تطبيق أفكار في 5 دقائق' : 'Exported from Ideas in 5 Minutes'}\n`;
  md += `> ${isAr ? 'إجمالي الجلسات' : 'Total Sessions'}: ${sessions.length} • ${new Date().toLocaleDateString()}\n\n---\n\n`;

  sessions.forEach((s, idx) => {
    const dateFormatted = new Date(s.timestamp).toLocaleString(isAr ? 'ar-SA' : 'en-US');
    md += `## ${idx + 1}. ${s.topic}\n`;
    md += `- **${isAr ? 'المدة' : 'Duration'}**: ${s.duration} ${isAr ? 'دقائق' : 'min'}\n`;
    md += `- **${isAr ? 'التاريخ' : 'Date'}**: ${dateFormatted}\n`;
    if (s.lens) md += `- **${isAr ? 'زاوية التفكير' : 'Thinking Lens'}**: ${s.lens}\n`;
    if (s.notes) {
      md += `\n### ${isAr ? 'الملاحظات والخواطر' : 'Session Notes'}:\n${s.notes}\n`;
    }
    md += `\n---\n\n`;
  });

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ideas-vault-${getTodayStr()}.md`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
