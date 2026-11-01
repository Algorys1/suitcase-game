import { describe, expect, it } from 'vitest';
import { decodeProgress, PROGRESS_KEY, ProgressStore } from '../services/storage';
import { destinations } from '../domain/recipes';
import { beginTravel, createSession } from '../domain/session';

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
  };
}

describe('lecture et validation des sauvegardes', () => {
  it('récupère proprement une sauvegarde absente, invalide ou de version inconnue', () => {
    for (const serialized of [null, '', '{broken', 'null', '42', 'true', '[]', '{}',
      '{"schemaVersion":2,"discoveredDestinationIds":[]}',
      '{"schemaVersion":1,"discoveredDestinationIds":"archipel_azur"}']) {
      expect(decodeProgress(serialized)).toEqual({ schemaVersion: 1, discoveredDestinationIds: [], language: 'fr' });
    }
  });

  it('filtre les IDs inconnus et les mauvais types, et déduplique les découvertes', () => {
    const progress = decodeProgress(JSON.stringify({ schemaVersion: 1, language: 'en',
      discoveredDestinationIds: ['archipel_azur', 'unknown', null, 12, {}, 'archipel_azur', 'mycelia', 'void'] }));
    expect(progress).toEqual({ schemaVersion: 1, language: 'en', discoveredDestinationIds: ['archipel_azur', 'mycelia'] });
  });

  it('récupère une langue manquante ou incorrecte avec le français sans perdre les lieux valides', () => {
    for (const language of [undefined, null, 'de', 12, {}]) {
      const progress = decodeProgress(JSON.stringify({ schemaVersion: 1, language, discoveredDestinationIds: ['mycelia'] }));
      expect(progress.language).toBe('fr');
      expect(progress.discoveredDestinationIds).toEqual(['mycelia']);
    }
  });
});

describe('carnet permanent', () => {
  it('conserve les découvertes et la langue lors du chargement par une nouvelle instance', () => {
    const storage = memoryStorage();
    const first = new ProgressStore(() => storage);
    expect(first.discover('archipel_azur')).toBe(true);
    first.setLanguage('en');
    const reloaded = new ProgressStore(() => storage);
    expect(reloaded.read()).toEqual({ schemaVersion: 1, language: 'en', discoveredDestinationIds: ['archipel_azur'] });
    expect(reloaded.persistent).toBe(true);
    reloaded.discover('mycelia');
    expect(new ProgressStore(() => storage).read().language).toBe('en');
  });

  it('ne débloque rien pour le Néant et ne crée aucun doublon lors d’une revisite', () => {
    const storage = memoryStorage();
    const store = new ProgressStore(() => storage);
    expect(store.discover('archipel_azur')).toBe(true);
    expect(store.discover('archipel_azur')).toBe(false);
    expect(store.discover('void')).toBe(false);
    expect(store.discover('unknown')).toBe(false);
    expect(store.read().discoveredDestinationIds).toEqual(['archipel_azur']);
  });

  it('sauvegarde immédiatement une découverte au départ, avant sa révélation', () => {
    const storage = memoryStorage();
    const store = new ProgressStore(() => storage);
    const travelling = beginTravel(createSession(), ['water', 'palm'], store.read().discoveredDestinationIds);
    expect(travelling.phase).toBe('travelling');
    const id = travelling.lastTrip?.destinationId;
    if (!id) throw new Error('Expected a destination');
    store.discover(id);
    const afterReload = new ProgressStore(() => storage);
    expect(afterReload.read().discoveredDestinationIds).toEqual(['archipel_azur']);
    const revisit = beginTravel(createSession(), ['palm', 'water'], afterReload.read().discoveredDestinationIds);
    expect(revisit.lastTrip?.isNewDiscovery).toBe(false);
    expect(revisit.charges).toBe(9);
  });

  it('ne stocke que les données permanentes et garde la session indépendante', () => {
    const storage = memoryStorage();
    const store = new ProgressStore(() => storage);
    store.discover('mycelia');
    const saved: unknown = JSON.parse(storage.getItem(PROGRESS_KEY) ?? 'null');
    expect(saved).toEqual({ schemaVersion: 1, language: 'fr', discoveredDestinationIds: ['mycelia'] });
    expect(createSession().charges).toBe(10);
    expect(createSession().visitedDestinationIds).toEqual([]);
    expect(store.read().discoveredDestinationIds).toEqual(['mycelia']);
  });

  it('protège la sauvegarde en mémoire contre une mutation de la valeur retournée', () => {
    const store = new ProgressStore(memoryStorage);
    store.discover('mycelia');
    const result = store.read();
    result.discoveredDestinationIds.push('archipel_azur');
    result.language = 'en';
    expect(store.read()).toEqual({ schemaVersion: 1, language: 'fr', discoveredDestinationIds: ['mycelia'] });
  });

  it('fonctionne avec les 30 découvertes et permet encore de voyager', () => {
    const storage = memoryStorage();
    const store = new ProgressStore(() => storage);
    for (const { id } of destinations) store.discover(id);
    const reloaded = new ProgressStore(() => storage);
    expect(reloaded.read().discoveredDestinationIds).toHaveLength(30);
    const travelling = beginTravel(createSession(), ['water', 'palm'], reloaded.read().discoveredDestinationIds);
    expect(travelling.charges).toBe(9);
    expect(travelling.lastTrip?.isNewDiscovery).toBe(false);
  });

  it('remplace une sauvegarde corrompue lors de la prochaine découverte', () => {
    const storage = memoryStorage();
    storage.setItem(PROGRESS_KEY, '{broken');
    const store = new ProgressStore(() => storage);
    expect(store.read().discoveredDestinationIds).toEqual([]);
    store.discover('mycelia');
    expect(new ProgressStore(() => storage).read().discoveredDestinationIds).toEqual(['mycelia']);
  });

  it('continue en mémoire si l’accès à localStorage lui-même est interdit', () => {
    const store = new ProgressStore(() => { throw new Error('Storage access blocked'); });
    expect(store.persistent).toBe(false);
    expect(store.discover('mycelia')).toBe(true);
    expect(store.read().discoveredDestinationIds).toEqual(['mycelia']);
    expect(store.discover('mycelia')).toBe(false);
    expect(store.persistent).toBe(false);
  });

  it('continue en mémoire si la lecture ou l’écriture échoue (quota, navigation privée)', () => {
    const unreadable = new ProgressStore(() => ({
      getItem: () => { throw new Error('Read denied'); }, setItem: () => { throw new Error('Write denied'); },
    }));
    unreadable.discover('mycelia');
    expect(unreadable.read().discoveredDestinationIds).toEqual(['mycelia']);
    expect(unreadable.persistent).toBe(false);
    const storage = memoryStorage();
    storage.setItem(PROGRESS_KEY, JSON.stringify({ schemaVersion: 1, language: 'en', discoveredDestinationIds: ['mycelia'] }));
    const full = new ProgressStore(() => ({ ...storage, setItem: () => { throw new Error('Quota exceeded'); } }));
    full.discover('archipel_azur');
    expect(full.read().discoveredDestinationIds).toEqual(['mycelia', 'archipel_azur']);
    expect(full.read().language).toBe('en');
    expect(full.persistent).toBe(false);
  });
});
