import { describe, expect, it } from 'vitest';
import { beginTravel, continueSession, createSession, decodeSession, revealResult, sessionRoute } from '../domain/session';
import { decodeProgress, ProgressStore } from '../services/storage';

const memory = () => {
  const data = new Map<string, string>();
  return { getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => { data.set(key, value); } };
};

function collectCimes(store: ProgressStore): boolean {
  store.touchExploration('cimes_eternelles', 0);
  store.touchExploration('cimes_eternelles', 1);
  return store.touchExploration('cimes_eternelles', 2).collected;
}

describe('carte d’aventure et exploration', () => {
  it('conserve l’ordre des escales, du Néant et des revisites au rechargement', () => {
    let session = continueSession(revealResult(beginTravel(createSession(), ['rock', 'snow'])));
    session = continueSession(revealResult(beginTravel(session, ['tree', 'water'])));
    session = continueSession(revealResult(beginTravel(session, ['snow', 'rock'])));
    expect(session.charges).toBe(6);
    expect(sessionRoute(decodeSession(JSON.parse(JSON.stringify(session)))!))
      .toEqual(['cimes_eternelles', null, 'cimes_eternelles']);
    expect(sessionRoute(decodeSession({ ...session, route: ['unknown'] })!))
      .toEqual(['cimes_eternelles', 'cimes_eternelles', null]);
  });

  it('ne donne le nouveau souvenir qu’après exploration, sans charge ni doublon', () => {
    const storage = memory();
    const store = new ProgressStore(() => storage);
    const result = revealResult(beginTravel(createSession(), ['rock', 'snow']));
    store.saveSession(result);
    expect(store.unlockedSouvenirIds()).toEqual([]);
    expect(store.explore('unknown')).toBe(false);
    expect(store.explore('mycelia')).toBe(false);
    expect(store.explore('cimes_eternelles')).toBe(false);
    expect(collectCimes(store)).toBe(true);
    expect(store.explore('cimes_eternelles')).toBe(false);
    store.saveSession(continueSession(result));
    const reloaded = new ProgressStore(() => storage);
    expect(reloaded.unlockedSouvenirIds()).toEqual(['cimes_eternelles']);
    expect(reloaded.read().expedition?.charges).toBe(9);
    expect(reloaded.read().pendingSouvenirIds).toBeUndefined();
  });

  it('préserve les souvenirs acquis des anciennes sauvegardes et filtre les nouveaux champs', () => {
    const saved = { schemaVersion: 1, language: 'en', discoveredDestinationIds: ['mycelia', 'cimes_eternelles'] };
    expect(decodeProgress(JSON.stringify(saved))).toEqual(saved);
    expect(decodeProgress(JSON.stringify({ ...saved, pendingSouvenirIds: ['mycelia', 'void', 'mycelia', null],
      awakenedMycelia: true })).pendingSouvenirIds).toEqual(['mycelia']);
    expect(decodeProgress(JSON.stringify({ ...saved, pendingSouvenirIds: ['cimes_eternelles'],
      awakenedMycelia: true })).awakenedMycelia).toBeUndefined();
  });

  it('offre une empreinte de clochette seulement dans Mycélia visitée, et conserve le souvenir', () => {
    const storage = memory();
    const store = new ProgressStore(() => storage);
    let session = continueSession(revealResult(beginTravel(createSession(), ['rock', 'snow'])));
    store.saveSession(session);
    expect(store.offerBell()).toBe(false);
    collectCimes(store);
    expect(store.offerBell()).toBe(false);
    session = continueSession(revealResult(beginTravel(session, ['tree', 'mushroom'])));
    store.saveSession(session);
    expect(store.offerBell()).toBe(true);
    expect(store.offerBell()).toBe(false);
    const reloaded = new ProgressStore(() => storage);
    expect(reloaded.read().awakenedMycelia).toBe(true);
    expect(reloaded.unlockedSouvenirIds()).toContain('cimes_eternelles');
    expect(reloaded.read().expedition?.charges).toBe(8);
  });

  it('reste explorable au dernier voyage et en mémoire si le stockage est bloqué', () => {
    const store = new ProgressStore(() => { throw new Error('Denied'); });
    let session = createSession();
    for (let i = 0; i < 10; i++) session = continueSession(revealResult(beginTravel(session, ['rock', 'snow'])));
    store.saveSession(session);
    expect(store.read().expedition?.phase).toBe('ended');
    expect(collectCimes(store)).toBe(true);
    expect(store.read().expedition?.charges).toBe(0);
    expect(store.persistent).toBe(false);
  });
});
