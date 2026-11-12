import { describe, expect, it } from 'vitest';
import { gemRoute, overGemTarget } from '../domain/gemGarden';
import { activateTarget, validSteps } from '../domain/pilotExploration';
import { ProgressStore, decodeProgress } from '../services/storage';
import { beginTravel, createSession, revealResult } from '../domain/session';

const id = 'jardins_de_gemmes';
describe('lumière des Jardins de gemmes', () => {
  it('reçoit la lune sur le chapeau puis son reflet sur les clochettes', () => {
    gemRoute.forEach((route, index) => {
      expect(overGemTarget(index, route.target.x, route.target.y)).toBe(true);
      expect(overGemTarget(index, route.source.x, route.source.y)).toBe(false);
    });
    expect(overGemTarget(2, 0, 0)).toBe(false);
    expect(overGemTarget(0, NaN, 0)).toBe(false);
    expect(overGemTarget(1, 0, Infinity)).toBe(false);
  });
  it('refuse le reflet avant la lune et récupère les sauvegardes incomplètes', () => {
    expect(activateTarget(id, [], 1)).toEqual([]);
    expect(activateTarget(id, [0], 0)).toEqual([0]);
    expect(validSteps(id, [1, 1, -1, '0'])).toEqual([]);
    expect(decodeProgress(JSON.stringify({ schemaVersion: 1, discoveredDestinationIds: [id],
      pendingSouvenirIds: [id], pilotSteps: { [id]: [1] } })).pilotSteps?.[id] ?? []).toEqual([]);
  });
  it('sauvegarde avant animation, reprend le rayon et collecte une seule fois sans charge locale', () => {
    let saved: string | null = null, writes = 0;
    const storage = { getItem: () => saved, setItem: (_: string, value: string) => { saved = value; writes++; } };
    let store = new ProgressStore(() => storage);
    store.setLanguage('en');
    store.saveSession(revealResult(beginTravel(createSession(), ['mushroom', 'crystal'])));
    expect(store.explore(id)).toBe(false);
    expect(store.touchExploration(id, 1).activated).toBe(false);
    for (let index = 0; index < 2; index++) {
      expect(store.touchExploration(id, index)).toEqual({ activated: true, complete: index === 1, collected: index === 1 });
      const before = writes;
      expect(store.touchExploration(id, index).activated).toBe(false);
      expect(writes).toBe(before);
      store = new ProgressStore(() => storage);
      expect(store.explorationSteps(id)).toHaveLength(index + 1);
      expect(store.read().expedition?.charges).toBe(9);
      expect(store.read().language).toBe('en');
    }
    expect(store.unlockedSouvenirIds()).toEqual([id]);
  });
  it('préserve les anciens souvenirs et fonctionne sans stockage', () => {
    const old = new ProgressStore(() => ({ getItem: () => JSON.stringify({ schemaVersion: 1,
      discoveredDestinationIds: [id] }), setItem: () => {} }));
    expect(old.explorationSteps(id)).toEqual([0, 1]);
    const store = new ProgressStore(() => { throw new Error('blocked'); });
    store.saveSession(revealResult(beginTravel(createSession(), ['crystal', 'mushroom'])));
    expect(store.touchExploration(id, 0).activated).toBe(true);
    expect(store.touchExploration(id, 1).collected).toBe(true);
    expect(store.touchExploration(id, 1).collected).toBe(false);
  });
});
