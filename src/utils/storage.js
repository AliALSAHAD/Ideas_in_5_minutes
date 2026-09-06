const STORAGE_VERSION = 'v5_concepts';
const BASE_KEY = `ideas5min_topics_${STORAGE_VERSION}_`;

// Automatically purge legacy cached questions
try {
  const toRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('ideas5min_topics_') && !key.includes(STORAGE_VERSION)) {
      toRemove.push(key);
    }
  }
  toRemove.forEach((k) => localStorage.removeItem(k));
} catch (_) { /* ignore */ }

export function loadTopics(defaultTopics, lang = 'ar', category = 'all') {
  try {
    const raw = localStorage.getItem(`${BASE_KEY}${category}_${lang}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_) { /* ignore */ }
  return [...defaultTopics];
}

export function persistTopics(topics, lang = 'ar', category = 'all') {
  try {
    localStorage.setItem(`${BASE_KEY}${category}_${lang}`, JSON.stringify(topics));
  } catch (_) { /* ignore */ }
}
