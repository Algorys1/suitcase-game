import { describe, expect, it } from 'vitest';
import { beginTravel, continueSession, createSession, decodeSession, revealResult } from '../domain/session';
import { decodeProgress, PROGRESS_KEY, ProgressStore } from '../services/storage';

function memoryStorage() {
  const values = new Map<string, string>();
  return { getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); } };
}

describe('expédition en pause', () => {
  it('reprend une préparation avec ses charges et son historique après rechargement', () => {
    const storage = memoryStorage();
    const store = new ProgressStore(() => storage);
    const trip = beginTravel(createSession(), ['water', 'palm']);
    const preparation = continueSession(revealResult(trip));
    store.saveSession(preparation);
    const reloaded = new ProgressStore(() => storage);
    expect(reloaded.read().expedition).toEqual(preparation);
    expect(reloaded.read().discoveredDestinationIds).toEqual(['archipel_azur']);
    reloaded.finishSession();
    expect(reloaded.read().expedition?.charges).toBe(9);
  });

  it('enregistre charges et découverte ensemble et reprend directement au résultat', () => {
    const storage = memoryStorage();
    const writes: string[] = [];
    const store = new ProgressStore(() => ({ ...storage, setItem: (key, value) => {
      writes.push(value); storage.setItem(key, value);
    } }));
    store.saveSession(beginTravel(createSession(), ['water', 'palm']));
    expect(writes).toHaveLength(1);
    const reloaded = new ProgressStore(() => storage);
    const result = reloaded.read().expedition!;
    expect(result.phase).toBe('result');
    expect(result.charges).toBe(9);
    expect(result.lastTrip?.isNewDiscovery).toBe(true);
    expect(reloaded.read().discoveredDestinationIds).toEqual(['archipel_azur']);
    reloaded.saveSession(result);
    expect(new ProgressStore(() => storage).read().expedition?.charges).toBe(9);
  });

  it('garde les revisites dans le bilan sans dupliquer les découvertes', () => {
    const storage = memoryStorage();
    const store = new ProgressStore(() => storage);
    const first = beginTravel(createSession(), ['water', 'palm']);
    store.saveSession(first);
    const second = beginTravel(continueSession(revealResult(first)), ['palm', 'water'], store.read().discoveredDestinationIds);
    store.saveSession(second);
    const reloaded = new ProgressStore(() => storage).read();
    expect(reloaded.expedition?.charges).toBe(8);
    expect(reloaded.expedition?.visitedDestinationIds).toEqual(['archipel_azur', 'archipel_azur']);
    expect(reloaded.expedition?.lastTrip?.isNewDiscovery).toBe(false);
    expect(reloaded.discoveredDestinationIds).toEqual(['archipel_azur']);
  });

  it('conserve le dernier Néant à zéro puis le bilan jusqu’à son retour à l’accueil', () => {
    const storage = memoryStorage();
    const store = new ProgressStore(() => storage);
    let session = createSession();
    for (let i = 0; i < 4; i++) session = continueSession(revealResult(beginTravel(session, ['tree', 'water'])));
    session = revealResult(beginTravel(session, ['tree', 'water']));
    store.saveSession(session);
    expect(new ProgressStore(() => storage).read().expedition).toEqual(session);
    store.finishSession();
    expect(store.read().expedition?.phase).toBe('result');
    store.saveSession(continueSession(session));
    expect(new ProgressStore(() => storage).read().expedition?.phase).toBe('ended');
    store.finishSession();
    expect(new ProgressStore(() => storage).read().expedition).toBeUndefined();
    store.saveSession(createSession());
    expect(store.read().expedition?.charges).toBe(10);
  });

  it('préserve une charge finale épuisée par un Néant coûtant deux', () => {
    let session = createSession();
    for (let i = 0; i < 9; i++) session = continueSession(revealResult(beginTravel(session, ['water', 'palm'])));
    const result = revealResult(beginTravel(session, ['tree', 'water']));
    expect(decodeSession(result)).toEqual(result);
    expect(decodeSession(continueSession(result))?.phase).toBe('ended');
  });

  it('changer de langue conserve l’expédition et terminer conserve le carnet', () => {
    const storage = memoryStorage();
    const store = new ProgressStore(() => storage);
    store.saveSession(beginTravel(createSession(), ['water', 'palm']));
    store.setLanguage('en');
    expect(new ProgressStore(() => storage).read().expedition?.charges).toBe(9);
    expect(store.read().language).toBe('en');
    let session = continueSession(store.read().expedition!);
    while (session.charges > 0) session = continueSession(revealResult(beginTravel(session, ['tree', 'water'])));
    store.saveSession(session);
    store.finishSession();
    expect(store.read()).toEqual({ schemaVersion: 1, language: 'en', discoveredDestinationIds: ['archipel_azur'],
      pendingSouvenirIds: ['archipel_azur'] });
  });

  it('ignore seulement une expédition invalide, sans perdre la langue ni les découvertes', () => {
    const valid = revealResult(beginTravel(createSession(), ['water', 'palm']));
    const invalid = [null, {}, { ...valid, charges: 10 }, { ...valid, charges: -1 },
      { ...valid, phase: 'unknown' }, { ...valid, voidTrips: 0.5 }, { ...valid, voidTrips: 100 },
      { ...valid, visitedDestinationIds: ['unknown'] }, { ...valid, newlyDiscoveredIds: ['mycelia'] },
      { ...valid, newlyDiscoveredIds: ['archipel_azur', 'archipel_azur'] },
      { ...valid, lastTrip: null }, { ...valid, lastTrip: { ...valid.lastTrip, cost: 2 } },
      { ...valid, lastTrip: { ...valid.lastTrip, destinationId: 'mycelia' } },
      { ...valid, lastTrip: { ...valid.lastTrip, firstVisitInSession: false } },
      { ...createSession(), phase: 'ended' }];
    for (const expedition of invalid) {
      expect(decodeProgress(JSON.stringify({ schemaVersion: 1, language: 'en',
        discoveredDestinationIds: ['mycelia'], expedition }))).toEqual({ schemaVersion: 1,
        language: 'en', discoveredDestinationIds: ['mycelia'] });
    }
  });

  it('ne partage pas les tableaux ni le dernier voyage avec les valeurs lues ou sauvegardées', () => {
    const store = new ProgressStore(memoryStorage);
    const original = beginTravel(createSession(), ['water', 'palm']);
    store.saveSession(original);
    original.lastTrip!.cost = 99;
    const copy = store.read().expedition!;
    copy.lastTrip!.cost = 42;
    (copy.visitedDestinationIds as string[]).push('mycelia');
    expect(store.read().expedition?.lastTrip?.cost).toBe(1);
    expect(store.read().expedition?.visitedDestinationIds).toEqual(['archipel_azur']);
  });

  it('continue en mémoire si le stockage est bloqué ou plein', () => {
    for (const storage of [() => { throw new Error('Denied'); }, () => ({
      getItem: () => null, setItem: () => { throw new Error('Quota'); },
    })]) {
      const store = new ProgressStore(storage);
      store.saveSession(beginTravel(createSession(), ['tree', 'water']));
      store.setLanguage('en');
      expect(store.read().expedition?.charges).toBe(8);
      expect(store.read().expedition?.voidTrips).toBe(1);
      expect(store.persistent).toBe(false);
    }
  });

  it('charge les anciennes sauvegardes sans inventer une expédition', () => {
    const storage = memoryStorage();
    storage.setItem(PROGRESS_KEY, JSON.stringify({ schemaVersion: 1,
      discoveredDestinationIds: ['mycelia'], language: 'en' }));
    const store = new ProgressStore(() => storage);
    expect(store.read().expedition).toBeUndefined();
    store.saveSession(createSession());
    expect(store.read().discoveredDestinationIds).toEqual(['mycelia']);
  });
});
