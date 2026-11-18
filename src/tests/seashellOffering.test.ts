import { describe, expect, it } from 'vitest';
import { decodeProgress, ProgressStore } from '../services/storage';
import { beginTravel, continueSession, createSession, revealResult } from '../domain/session';

const memory = () => {
  let value: string | null = null;
  return { getItem: () => value, setItem: (_key: string, next: string) => { value = next; } };
};

describe('seashell offering in the frozen sea', () => {
  it('requires the collected seashell and discovered sea, without altering activity, collection or charges', () => {
    const storage = memory(), store = new ProgressStore(() => storage);
    expect(store.offerSeashell()).toBe(false);
    store.saveSession(continueSession(revealResult(beginTravel(createSession(), ['water', 'palm']))));
    store.saveSession(continueSession(revealResult(beginTravel(store.read().expedition!, ['water', 'snow']))));
    expect(store.offerSeashell()).toBe(false);
    for (let i = 0; i < 6; i++) store.touchExploration('archipel_azur', i);
    const before = store.read();
    const collection = store.unlockedSouvenirIds();
    expect(store.offerSeashell()).toBe(true);
    expect(store.offerSeashell()).toBe(false);
    const restored = new ProgressStore(() => storage);
    expect(restored.read()).toEqual({ ...before, welcomedSeaVisitor: true });
    expect(restored.unlockedSouvenirIds()).toEqual(collection);
    expect(restored.unlockedSouvenirIds()).not.toContain('mer_figee');
    expect(restored.explorationSteps('mer_figee')).toEqual([]);
  });
  it('allows the permanent journal without an expedition, and resets the meeting', () => {
    const storage = memory(), store = new ProgressStore(() => storage);
    store.discover('archipel_azur');
    expect(store.offerSeashell()).toBe(false);
    store.discover('mer_figee');
    expect(store.offerSeashell()).toBe(true);
    expect(new ProgressStore(() => storage).read().expedition).toBeUndefined();
    store.reset();
    expect(new ProgressStore(() => storage).read().welcomedSeaVisitor).toBeUndefined();
  });
  it('rejects invalid meeting flags and pending seashells while retaining the journal', () => {
    const base = { schemaVersion: 1, language: 'en', discoveredDestinationIds: ['archipel_azur', 'mer_figee'] };
    expect(decodeProgress(JSON.stringify({ ...base, welcomedSeaVisitor: true })).welcomedSeaVisitor).toBe(true);
    for (const flag of ['yes', 1, false, null])
      expect(decodeProgress(JSON.stringify({ ...base, welcomedSeaVisitor: flag })).welcomedSeaVisitor).toBeUndefined();
    const pending = decodeProgress(JSON.stringify({ ...base, welcomedSeaVisitor: true, pendingSouvenirIds: ['archipel_azur'] }));
    expect(pending.welcomedSeaVisitor).toBeUndefined();
    expect(pending.discoveredDestinationIds).toEqual(base.discoveredDestinationIds);
    expect(decodeProgress(JSON.stringify({ ...base, discoveredDestinationIds: ['archipel_azur'], welcomedSeaVisitor: true }))
      .welcomedSeaVisitor).toBeUndefined();
  });
  it('keeps the meeting in memory when browser storage is unavailable', () => {
    const store = new ProgressStore(() => { throw new Error('Denied'); });
    store.discover('archipel_azur'); store.discover('mer_figee');
    expect(store.offerSeashell()).toBe(true);
    expect(store.read().welcomedSeaVisitor).toBe(true);
    expect(store.persistent).toBe(false);
  });
});
