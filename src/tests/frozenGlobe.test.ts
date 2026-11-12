import { describe, expect, it } from 'vitest';
import { globe, globeSources, overGlobe } from '../domain/frozenGlobe';
import { activateTarget, validSteps } from '../domain/pilotExploration';
import { ProgressStore, decodeProgress } from '../services/storage';
import { beginTravel, createSession, revealResult } from '../domain/session';

const id = 'mer_figee';
describe('globe de la Mer figée', () => {
  it('reçoit les matières dans le verre et non à leur source', () => {
    expect(overGlobe(globe.x, globe.y)).toBe(true);
    for (const source of globeSources) expect(overGlobe(source.x, source.y)).toBe(false);
    expect(overGlobe(NaN, 0)).toBe(false);
    expect(overGlobe(0, Infinity)).toBe(false);
  });
  it('impose neige, glace puis étoiles, sans stocker les gestes prématurés', () => {
    expect(activateTarget(id, [], 1)).toEqual([]);
    expect(activateTarget(id, [], 2)).toEqual([]);
    expect(activateTarget(id, [0], 2)).toEqual([0]);
    expect(activateTarget(id, [0], 0)).toEqual([0]);
    expect(validSteps(id, [0, 2, -1, '1'])).toEqual([0]);
    expect(decodeProgress(JSON.stringify({ schemaVersion: 1, discoveredDestinationIds: [id],
      pendingSouvenirIds: [id], pilotSteps: { [id]: [1, 2] } })).pilotSteps?.[id] ?? []).toEqual([]);
  });
  it('reprend chaque étape, conserve les charges et donne un seul souvenir au dernier dépôt', () => {
    let saved: string | null = null;
    const storage = { getItem: () => saved, setItem: (_: string, value: string) => { saved = value; } };
    let store = new ProgressStore(() => storage);
    store.saveSession(revealResult(beginTravel(createSession(), ['water', 'snow'])));
    expect(store.explore(id)).toBe(false);
    for (let index = 0; index < 3; index++) {
      if (index < 2) expect(store.touchExploration(id, 2).activated).toBe(false);
      const result = store.touchExploration(id, index);
      expect(result.collected).toBe(index === 2);
      expect(result.activated).toBe(true);
      store = new ProgressStore(() => storage);
      expect(store.explorationSteps(id)).toHaveLength(index + 1);
      expect(store.read().expedition?.charges).toBe(9);
    }
    expect(store.unlockedSouvenirIds()).toEqual([id]);
    expect(store.touchExploration(id, 2)).toMatchObject({ activated: false, collected: false });
  });
  it('conserve les anciennes récompenses et reste jouable sans localStorage', () => {
    for (const steps of [undefined, [0]]) {
      const old = new ProgressStore(() => ({ getItem: () => JSON.stringify({ schemaVersion: 1,
        discoveredDestinationIds: [id], pilotSteps: { [id]: steps } }), setItem: () => {} }));
      expect(old.explorationSteps(id)).toEqual([0, 1, 2]);
    }
    const store = new ProgressStore(() => { throw new Error('blocked'); });
    expect(store.touchExploration(id, 0).activated).toBe(false);
    store.saveSession(revealResult(beginTravel(createSession(), ['water', 'snow'])));
    expect(store.touchExploration(id, 0).activated).toBe(true);
    expect(store.touchExploration(id, 1).collected).toBe(false);
    expect(store.touchExploration(id, 2).collected).toBe(true);
  });
});
