import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_TOPICS_EN, DEFAULT_TOPICS_AR, CATEGORY_TOPICS } from '../data/translations';
import { loadTopics, persistTopics } from '../utils/storage';

export function getCategoryDefaults(category = 'all', lang = 'ar') {
  if (category === 'all') {
    return lang === 'ar' ? DEFAULT_TOPICS_AR : DEFAULT_TOPICS_EN;
  }
  const items = CATEGORY_TOPICS[category] || [];
  return items.map((t) => (lang === 'ar' ? t.ar : t.en));
}

export function useTopics(lang = 'ar', category = 'all') {
  const [topics, setTopics] = useState(() => {
    const defaultList = getCategoryDefaults(category, lang);
    return loadTopics(defaultList, lang, category);
  });

  // Reload when language or category changes
  useEffect(() => {
    const list = getCategoryDefaults(category, lang);
    setTopics(loadTopics(list, lang, category));
  }, [lang, category]);

  // Persist whenever topics change
  useEffect(() => {
    persistTopics(topics, lang, category);
  }, [topics, lang, category]);

  const addTopic = useCallback((text) => {
    const trimmed = text.trim();
    if (!trimmed) return false;
    if (topics.includes(trimmed)) return false;
    setTopics((prev) => [...prev, trimmed]);
    return true;
  }, [topics]);

  const removeTopic = useCallback((index) => {
    setTopics((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const pickRandom = useCallback(() => {
    if (topics.length === 0) return null;
    return topics[Math.floor(Math.random() * topics.length)];
  }, [topics]);

  return { topics, addTopic, removeTopic, pickRandom };
}
