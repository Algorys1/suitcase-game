import { describe, expect, it } from 'vitest';
import { lanternFruit, heatSources, overLanternFruit } from '../domain/jungleHeat';
import { ProgressStore, decodeProgress } from '../services/storage';
import { beginTravel, createSession, revealResult } from '../domain/session';

const id = 'jungle_incandescente';
describe('chaleur du fruit-lanterne', () => {
  it('distingue le fruit des sources et rejette les coordonnées invalides', () => {
    expect(overLanternFruit(lanternFruit.x, lanternFruit.y)).toBe(true);
    for (const source of heatSources) expect(overLanternFruit(source.x, source.y)).toBe(false);
    expect(overLanternFruit(NaN, 0)).toBe(false);
    expect(overLanternFruit(0, Infinity)).toBe(false);
  });
  it('accepte les deux ordres, reprend le premier apport et ne collecte qu’une fois', () => {
    for (const order of [[0, 1], [1, 0]]) {
      let saved: string | null = null, writes = 0;
      const storage = { getItem: () => saved, setItem: (_: string, value: string) => { saved = value; writes++; } };
      let store = new ProgressStore(() => storage);
      store.setLanguage('en');
      store.saveSession(revealResult(beginTravel(createSession(), ['tree', 'fire'])));
      expect(store.explore(id)).toBe(false);
      expect(store.touchExploration(id, 3).activated).toBe(false);
      for (const [position, index] of order.entries()) {
        expect(store.touchExploration(id, index)).toEqual({ activated: true, complete: position === 1, collected: position === 1 });
        const before = writes;
        expect(store.touchExploration(id, index).activated).toBe(false);
        expect(writes).toBe(before);
        store = new ProgressStore(() => storage);
        expect(store.explorationSteps(id)).toHaveLength(position + 1);
        expect(store.read().expedition?.charges).toBe(9);
        expect(store.read().language).toBe('en');
      }
      expect(store.unlockedSouvenirIds()).toEqual([id]);
    }
  });
  it('garde les anciennes récompenses et nettoie les étapes invalides', () => {
    const old = new ProgressStore(() => ({ getItem: () => JSON.stringify({ schemaVersion: 1,
      discoveredDestinationIds: [id] }), setItem: () => {} }));
    expect(old.explorationSteps(id)).toEqual([0, 1]);
    expect(decodeProgress(JSON.stringify({ schemaVersion: 1, discoveredDestinationIds: [id],
      pendingSouvenirIds: [id], pilotSteps: { [id]: [1, 1, -1, 2, '0'] } })).pilotSteps?.[id]).toEqual([1]);
  });
  it('reste jouable en mémoire quand le stockage est indisponible', () => {
    const store = new ProgressStore(() => { throw new Error('blocked'); });
    expect(store.touchExploration(id, 0).activated).toBe(false);
    store.saveSession(revealResult(beginTravel(createSession(), ['tree', 'fire'])));
    expect(store.touchExploration(id, 1).activated).toBe(true);
    expect(store.touchExploration(id, 0).collected).toBe(true);
    expect(store.touchExploration(id, 0).collected).toBe(false);
  });
});
