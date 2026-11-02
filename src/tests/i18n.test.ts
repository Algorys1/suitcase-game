import { describe, expect, it } from 'vitest';
import fr from '../data/fr.json';
import en from '../data/en.json';
import catalogue from '../data/destinations.json';
import { getTexts, resolveTranslation, translate } from '../services/i18n';
import { ProgressStore } from '../services/storage';

function stringEntries(value: unknown, prefix = ''): Array<[string, string]> {
  if (typeof value === 'string') return [[prefix, value]];
  if (typeof value !== 'object' || value === null) return [];
  return Object.entries(value).flatMap(([key, child]) => stringEntries(child, prefix ? `${prefix}.${key}` : key));
}

describe('internationalisation FR / EN', () => {
  it('fournit les mêmes clés, des textes non vides et les mêmes paramètres dans les deux langues', () => {
    const french = stringEntries(fr);
    const english = new Map(stringEntries(en));
    expect([...english.keys()].sort()).toEqual(french.map(([key]) => key).sort());
    for (const [key, value] of french) {
      const translated = english.get(key);
      expect(value.trim(), key).not.toBe('');
      expect(translated?.trim(), key).toBeTruthy();
      expect([...(translated ?? '').matchAll(/\{([^}]+)\}/g)].map(match => match[1]).sort(), key)
        .toEqual([...value.matchAll(/\{([^}]+)\}/g)].map(match => match[1]).sort());
    }
  });

  it('sélectionne le catalogue de la langue demandée et résout les clés du contenu', () => {
    expect(getTexts('fr')).toBe(fr);
    expect(getTexts('en')).toBe(en);
    expect(translate('settings', 'fr')).toBe('Paramètres');
    expect(translate('settings', 'en')).toBe('Settings');
    for (const destination of catalogue) {
      expect(translate(destination.titleKey, 'fr')).toBeTruthy();
      expect(translate(destination.titleKey, 'en')).toContain('title pending');
      expect(translate(destination.storyKey, 'en')).toContain('placeholder');
    }
  });

  it('retombe sur le français pour une clé absente, vide ou de type incorrect', () => {
    expect(resolveTranslation('settings', {})).toBe(fr.settings);
    expect(resolveTranslation('settings', { settings: '' })).toBe(fr.settings);
    expect(resolveTranslation('settings', { settings: null })).toBe(fr.settings);
    expect(resolveTranslation('journey.continue', { journey: 42 })).toBe(fr.journey.continue);
    expect(resolveTranslation('destinations.archipel_azur.title', {})).toBe(fr.destinations.archipel_azur.title);
  });

  it('utilise un texte lisible pour une clé totalement inconnue sans exposer de chemin technique', () => {
    expect(resolveTranslation('unknown.deep.key', en)).toBe(fr.translationUnavailable);
    expect(resolveTranslation('constructor.name', en)).toBe(fr.translationUnavailable);
    expect(resolveTranslation('__proto__.constructor', en)).toBe(fr.translationUnavailable);
  });

  it('conserve les découvertes lors des changements de langue et du rechargement', () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => { values.set(key, value); },
    };
    const first = new ProgressStore(() => storage);
    first.discover('mycelia');
    first.setLanguage('en');
    const reloaded = new ProgressStore(() => storage);
    expect(reloaded.read()).toEqual({ schemaVersion: 1, discoveredDestinationIds: ['mycelia'], language: 'en' });
    reloaded.setLanguage('fr');
    expect(new ProgressStore(() => storage).read()).toEqual({ schemaVersion: 1, discoveredDestinationIds: ['mycelia'], language: 'fr' });
  });

  it('garde le choix de langue en mémoire si le stockage est bloqué', () => {
    const store = new ProgressStore(() => { throw new Error('Storage blocked'); });
    store.discover('mycelia');
    store.setLanguage('en');
    expect(store.read().language).toBe('en');
    expect(store.read().discoveredDestinationIds).toEqual(['mycelia']);
    expect(store.persistent).toBe(false);
  });
});
