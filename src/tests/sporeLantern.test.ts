import { describe, expect, it } from 'vitest';
import { ProgressStore, decodeProgress } from '../services/storage';
import { beginTravel, continueSession, createSession, revealResult } from '../domain/session';

const memory = () => {
  let value: string | null = null;
  return { getItem: () => value, setItem: (_key: string, next: string) => { value = next; } };
};

describe('spore lantern correspondence', () => {
  it('requires a collected lantern and discovered forest, preserves activity, charges and souvenir', () => {
    const storage = memory(), store = new ProgressStore(() => storage);
    expect(store.offerSporeLantern()).toBe(false);
    store.saveSession(continueSession(revealResult(beginTravel(createSession(), ['tree', 'mushroom']))));
    store.saveSession(continueSession(revealResult(beginTravel(store.read().expedition!, ['tree', 'snow']))));
    expect(store.offerSporeLantern()).toBe(false);
    for (let i = 0; i < 5; i++) store.touchExploration('mycelia', i);
    const before = store.read();
    expect(store.offerSporeLantern()).toBe(true);
    expect(store.offerSporeLantern()).toBe(false);
    const after = new ProgressStore(() => storage).read();
    expect(after.welcomedForestVisitor).toBe(true);
    expect(after.expedition).toEqual(before.expedition);
    expect(after.pilotSteps).toEqual(before.pilotSteps);
    expect(store.unlockedSouvenirIds()).toContain('mycelia');
    expect(store.explorationSteps('foret_du_silence')).toEqual([]);
  });
  it('works from a permanent journal without an expedition', () => {
    const store = new ProgressStore(() => memory());
    store.discover('mycelia');
    expect(store.offerSporeLantern()).toBe(false);
    store.discover('foret_du_silence');
    expect(store.offerSporeLantern()).toBe(true);
    expect(store.read().expedition).toBeUndefined();
    store.reset();
    expect(store.read().welcomedForestVisitor).toBeUndefined();
  });
  it('ignores malformed, unsupported or unearned visitor flags without losing discoveries', () => {
    const base = { schemaVersion: 1, language: 'en', discoveredDestinationIds: ['mycelia', 'foret_du_silence'] };
    expect(decodeProgress(JSON.stringify({ ...base, welcomedForestVisitor: true })).welcomedForestVisitor).toBe(true);
    for (const value of ['yes', 1, false])
      expect(decodeProgress(JSON.stringify({ ...base, welcomedForestVisitor: value })).welcomedForestVisitor).toBeUndefined();
    const pending = decodeProgress(JSON.stringify({ ...base, welcomedForestVisitor: true, pendingSouvenirIds: ['mycelia'] }));
    expect(pending.welcomedForestVisitor).toBeUndefined();
    expect(pending.discoveredDestinationIds).toEqual(base.discoveredDestinationIds);
    expect(decodeProgress(JSON.stringify({ ...base, discoveredDestinationIds: ['mycelia'], welcomedForestVisitor: true }))
      .welcomedForestVisitor).toBeUndefined();
  });
});
