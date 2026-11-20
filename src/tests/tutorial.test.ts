import { describe, expect, it } from 'vitest';
import { decodeProgress, ProgressStore, tutorialSteps } from '../services/storage';
import { createSession } from '../domain/session';

describe('conseils de voyage persistants', () => {
  it('detects the first available offering in either discovery order', () => {
    for (const worlds of [['jardins_de_gemmes'], ['jardins_de_gemmes', 'marais_des_lucioles']]) {
      let value = JSON.stringify({ schemaVersion: 1, language: 'fr', discoveredDestinationIds: worlds,
        pendingSouvenirIds: ['jardins_de_gemmes'] });
      const storage = { getItem: () => value, setItem: (_key: string, next: string) => { value = next; } };
      const store = new ProgressStore(() => storage);
      expect(store.hasAvailableOffering()).toBe(false);
      store.touchExploration('jardins_de_gemmes', 0);
      store.touchExploration('jardins_de_gemmes', 1);
      expect(store.hasAvailableOffering()).toBe(worlds.length === 2);
      store.discover('marais_des_lucioles');
      expect(store.hasAvailableOffering()).toBe(true);
      expect(store.offerSouvenir('jardins_de_gemmes', 'mycelia')).toBe(false);
      store.acknowledgeTutorial('offering');
      expect(new ProgressStore(() => storage).read().tutorialSeen).toEqual(['offering']);
      expect(store.offerSouvenir('jardins_de_gemmes', 'marais_des_lucioles')).toBe(true);
      expect(store.hasAvailableOffering()).toBe(false);
    }
  });

  it('filtre les valeurs invalides sans toucher aux anciennes collections', () => {
    const base = { schemaVersion: 1, language: 'en', discoveredDestinationIds: ['mycelia'] };
    expect(decodeProgress(JSON.stringify(base))).toEqual(base);
    expect(decodeProgress(JSON.stringify({ ...base, tutorialSeen: ['exploration', 'unknown', {}, 'exploration', 2] })))
      .toEqual({ ...base, tutorialSeen: ['exploration'] });
    expect(decodeProgress(JSON.stringify({ ...base, tutorialSeen: 'souvenir' }))).toEqual(base);
  });

  it('ne rejoue pas les conseils acquittés et permet de tous les passer sans changer le voyage', () => {
    let value: string | null = null;
    const storage = { getItem: () => value, setItem: (_key: string, next: string) => { value = next; } };
    const store = new ProgressStore(() => storage);
    store.saveSession(createSession());
    store.setLanguage('en');
    store.discover('cimes_eternelles');
    const before = store.read();
    store.acknowledgeTutorial('departure');
    store.acknowledgeTutorial('departure');
    expect(new ProgressStore(() => storage).read().tutorialSeen).toEqual(['departure']);
    store.acknowledgeTutorial();
    const after = new ProgressStore(() => storage).read();
    expect(after).toEqual({ ...before, tutorialSeen: [...tutorialSteps] });
    after.tutorialSeen?.pop();
    expect(store.read().tutorialSeen).toHaveLength(tutorialSteps.length);
  });

  it('conserve les conseils en mémoire si le navigateur bloque le stockage', () => {
    const store = new ProgressStore(() => { throw new Error('blocked'); });
    store.acknowledgeTutorial('exploration');
    expect(store.read().tutorialSeen).toEqual(['exploration']);
    expect(store.persistent).toBe(false);
  });

  it('conserve les anciens conseils et mémorise les nouvelles étapes indépendamment', () => {
    let value = JSON.stringify({ schemaVersion: 1, language: 'fr', discoveredDestinationIds: ['mycelia'],
      tutorialSeen: ['departure', 'exploration', 'souvenir'] });
    const storage = { getItem: () => value, setItem: (_key: string, next: string) => { value = next; } };
    const store = new ProgressStore(() => storage);
    store.acknowledgeTutorial('needles');
    store.acknowledgeTutorial('energy');
    const restored = new ProgressStore(() => storage).read();
    expect(restored.tutorialSeen).toEqual(['departure', 'needles', 'energy', 'exploration', 'souvenir']);
    expect(restored.discoveredDestinationIds).toEqual(['mycelia']);
    expect(restored.language).toBe('fr');
    expect(restored.tutorialSeen).not.toContain('arrival');
  });
});
