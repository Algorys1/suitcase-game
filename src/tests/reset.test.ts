import { describe, expect, it } from 'vitest';
import { PROGRESS_KEY, ProgressStore } from '../services/storage';
import { beginTravel, createSession } from '../domain/session';

const empty = { schemaVersion: 1, discoveredDestinationIds: [], language: 'fr' };
const saved = JSON.stringify({ schemaVersion: 1, language: 'en',
  discoveredDestinationIds: ['archipel_azur', 'cimes_eternelles', 'mycelia'],
  pendingSouvenirIds: ['archipel_azur'], pilotSteps: { archipel_azur: [0, 3] },
  awakenedMycelia: true, tutorialSeen: ['departure', 'exploration', 'souvenir'],
  expedition: beginTravel(createSession(), ['water', 'palm']) });

describe('réinitialisation de la sauvegarde', () => {
  it('efface seulement la clé du jeu et vide aussi la collection et le voyage en mémoire', () => {
    const values = new Map([[PROGRESS_KEY, saved], ['another-app', 'keep me']]);
    const storage = { getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => { values.set(key, value); },
      removeItem: (key: string) => { values.delete(key); } };
    const store = new ProgressStore(() => storage);
    expect(store.read().discoveredDestinationIds).toHaveLength(3);
    expect(store.read().expedition).toBeDefined();
    expect(store.reset()).toBe(true);
    expect(values.has(PROGRESS_KEY)).toBe(false);
    expect(values.get('another-app')).toBe('keep me');
    expect(store.read()).toEqual(empty);
    expect(new ProgressStore(() => storage).read()).toEqual(empty);
    expect(store.unlockedSouvenirIds()).toEqual([]);
  });

  it('réinitialise aussi les adaptateurs qui ne proposent que lecture et écriture', () => {
    let value: string | null = saved;
    const storage = { getItem: () => value, setItem: (_key: string, next: string) => { value = next; } };
    const store = new ProgressStore(() => storage);
    store.read();
    expect(store.reset()).toBe(true);
    expect(new ProgressStore(() => storage).read()).toEqual(empty);
  });

  it('signale un effacement bloqué et ne promet pas la persistance du reset en mémoire', () => {
    const storage = { getItem: () => saved, setItem: () => { throw Error('blocked'); },
      removeItem: () => { throw Error('blocked'); } };
    const store = new ProgressStore(() => storage);
    store.read();
    expect(store.reset()).toBe(false);
    expect(store.persistent).toBe(false);
    expect(store.read()).toEqual(empty);
    expect(new ProgressStore(() => storage).read().discoveredDestinationIds).toHaveLength(3);
    const denied = new ProgressStore(() => { throw Error('denied'); });
    expect(denied.reset()).toBe(false);
    expect(denied.read()).toEqual(empty);
  });
});
