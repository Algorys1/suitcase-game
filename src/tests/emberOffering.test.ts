import { describe, expect, it } from 'vitest';
import { decodeProgress, ProgressStore } from '../services/storage';
import { beginTravel, continueSession, createSession, revealResult } from '../domain/session';

const memory = () => {
  let value: string | null = null;
  return { getItem: () => value, setItem: (_key: string, next: string) => { value = next; } };
};

describe('ember offering in the still city', () => {
  it('requires the collected ember and discovered city, without altering activity, collection or charges', () => {
    const storage = memory(), store = new ProgressStore(() => storage);
    expect(store.offerEmber()).toBe(false);
    store.saveSession(continueSession(revealResult(beginTravel(createSession(), ['fire', 'rock']))));
    store.saveSession(continueSession(revealResult(beginTravel(store.read().expedition!, ['snow', 'ruins']))));
    expect(store.offerEmber()).toBe(false);
    for (let i = 0; i < 3; i++) store.touchExploration('coeur_de_braise', i);
    const before = store.read();
    const collection = store.unlockedSouvenirIds();
    expect(store.offerEmber()).toBe(true);
    expect(store.offerEmber()).toBe(false);
    const restored = new ProgressStore(() => storage);
    expect(restored.read()).toEqual({ ...before, welcomedCityVisitor: true });
    expect(restored.unlockedSouvenirIds()).toEqual(collection);
    expect(restored.unlockedSouvenirIds()).not.toContain('cite_immobile');
    expect(restored.explorationSteps('cite_immobile')).toEqual([]);
  });
  it('allows the permanent journal without an expedition, and resets the meeting', () => {
    const storage = memory(), store = new ProgressStore(() => storage);
    store.discover('coeur_de_braise');
    expect(store.offerEmber()).toBe(false);
    store.discover('cite_immobile');
    expect(store.offerEmber()).toBe(true);
    expect(new ProgressStore(() => storage).read().expedition).toBeUndefined();
    store.reset();
    expect(new ProgressStore(() => storage).read().welcomedCityVisitor).toBeUndefined();
  });
  it('rejects invalid meeting flags and pending embers while retaining the journal', () => {
    const base = { schemaVersion: 1, language: 'en', discoveredDestinationIds: ['coeur_de_braise', 'cite_immobile'] };
    expect(decodeProgress(JSON.stringify({ ...base, welcomedCityVisitor: true })).welcomedCityVisitor).toBe(true);
    for (const flag of ['yes', 1, false, null])
      expect(decodeProgress(JSON.stringify({ ...base, welcomedCityVisitor: flag })).welcomedCityVisitor).toBeUndefined();
    const pending = decodeProgress(JSON.stringify({ ...base, welcomedCityVisitor: true, pendingSouvenirIds: ['coeur_de_braise'] }));
    expect(pending.welcomedCityVisitor).toBeUndefined();
    expect(pending.discoveredDestinationIds).toEqual(base.discoveredDestinationIds);
    expect(decodeProgress(JSON.stringify({ ...base, discoveredDestinationIds: ['coeur_de_braise'], welcomedCityVisitor: true }))
      .welcomedCityVisitor).toBeUndefined();
  });
  it('keeps the meeting in memory when browser storage is unavailable', () => {
    const store = new ProgressStore(() => { throw new Error('Denied'); });
    store.discover('coeur_de_braise'); store.discover('cite_immobile');
    expect(store.offerEmber()).toBe(true);
    expect(store.read().welcomedCityVisitor).toBe(true);
    expect(store.persistent).toBe(false);
  });
});
