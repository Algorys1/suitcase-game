import fr from '../data/fr.json';
import en from '../data/en.json';
import { progressStore } from './storage';
import type { Language } from './storage';
import { destinationById } from '../domain/recipes';

export type Messages = typeof fr;
const catalogues: Record<Language, Messages> = { fr, en };

export function getTexts(language: Language = progressStore.read().language): Messages {
  return catalogues[language];
}

function lookup(messages: unknown, key: string): unknown {
  let value = messages;
  for (const segment of key.split('.')) {
    if (typeof value !== 'object' || value === null || !Object.hasOwn(value, segment)) return undefined;
    value = Reflect.get(value, segment);
  }
  return value;
}

/** Dynamic catalogue keys fall back to French, then to a readable generic label. */
export function resolveTranslation(key: string, primary: unknown, fallback: unknown = fr): string {
  const value = lookup(primary, key);
  if (typeof value === 'string' && value.trim()) return value;
  const backup = lookup(fallback, key);
  return typeof backup === 'string' && backup.trim() ? backup : fr.translationUnavailable;
}

export function translate(key: string, language: Language = progressStore.read().language): string {
  return resolveTranslation(key, getTexts(language));
}

export function getDestinationTexts(id: string): { title: string; story: string } | undefined {
  const destination = destinationById(id);
  if (!destination) return undefined;
  return { title: translate(destination.titleKey), story: translate(destination.storyKey) };
}

export function applyLanguageToDocument(): void {
  document.documentElement.lang = progressStore.read().language;
  document.title = getTexts().title;
}
