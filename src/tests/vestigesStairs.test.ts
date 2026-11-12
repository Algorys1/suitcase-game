import { describe, expect, it } from 'vitest';
import { overStairFrontier, stairFlights, stairFrontier, stairTiles } from '../domain/vestigesStairs';
import { ProgressStore, decodeProgress } from '../services/storage';
import { beginTravel, createSession, revealResult } from '../domain/session';

const id = 'vestiges_celestes';
describe('escalier des Vestiges célestes', () => {
  it('accroche au bord du chemin et refuse les dalles à leur repos ou les données invalides', () => {
    expect(stairFlights).toHaveLength(3);
    expect(stairTiles).toHaveLength(3);
    for (let count = 0; count < 3; count++) {
      expect(overStairFrontier(stairFrontier(count), count)).toBe(true);
      for (const tile of stairTiles) expect(overStairFrontier(tile, count)).toBe(false);
    }
    for (const count of [-1, 0.5, 3, NaN]) expect(overStairFrontier(stairFrontier(0), count)).toBe(false);
    expect(overStairFrontier({ x: NaN, y: 0 }, 0)).toBe(false);
    expect(overStairFrontier({ x: 0, y: Infinity }, 0)).toBe(false);
    expect(overStairFrontier(stairFrontier(0), 0, 0, 1)).toBe(false);
  });

  it('accepte les six ordres des trois pierres sans doublon ni charge supplémentaire', () => {
    for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) for (let c = 0; c < 3; c++) {
        const order = [a, b, c]; if (new Set(order).size !== 3) continue;
        let saved: string | null = null, writes = 0;
        const storage = { getItem: () => saved, setItem: (_: string, value: string) => { saved = value; writes++; } };
        let store = new ProgressStore(() => storage);
        store.setLanguage('en');
        store.saveSession(revealResult(beginTravel(createSession(), ['cloud', 'ruins'])));
        expect(store.explore(id)).toBe(false);
        order.forEach((index, position) => {
          const before = writes, result = store.touchExploration(id, index);
          expect(result.collected).toBe(position === 2);
          expect(writes - before).toBe(1);
          expect(store.touchExploration(id, index).activated).toBe(false);
          store = new ProgressStore(() => storage);
          expect(store.explorationSteps(id)).toHaveLength(position + 1);
        });
        expect(store.unlockedSouvenirIds()).toEqual([id]);
        expect(store.read().expedition?.charges).toBe(9);
        expect(store.read().language).toBe('en');
      }
  });

  it('garde les récompenses du puzzle rejeté et ignore ses anciens réglages', () => {
    for (const old of [undefined, [0]]) {
      const store = new ProgressStore(() => ({ getItem: () => JSON.stringify({ schemaVersion: 1, language: 'en',
        discoveredDestinationIds: [id], pilotSteps: { [id]: old }, vestigesMosaic: [0, 0] }), setItem: () => {} }));
      expect(store.explorationSteps(id)).toEqual([0, 1, 2]);
      expect(store.unlockedSouvenirIds()).toEqual([id]);
      expect(store.read()).not.toHaveProperty('vestigesMosaic');
    }
    const unfinished = new ProgressStore(() => ({ getItem: () => JSON.stringify({ schemaVersion: 1,
      discoveredDestinationIds: [id], pendingSouvenirIds: [id], vestigesMosaic: [2, 3] }), setItem: () => {} }));
    expect(unfinished.explorationSteps(id)).toEqual([]);
    expect(unfinished.unlockedSouvenirIds()).toEqual([]);
  });

  it('récupère les étapes invalides et ne partage pas les tableaux de sauvegarde', () => {
    const decoded = decodeProgress(JSON.stringify({ schemaVersion: 1, discoveredDestinationIds: [id], vestigesLayout: 2,
      pendingSouvenirIds: [id], pilotSteps: { [id]: [2, 2, -1, 3, '0', null, 1.5] } }));
    expect(decoded.pilotSteps?.[id]).toEqual([2]);
    const store = new ProgressStore(() => ({ getItem: () => JSON.stringify(decoded), setItem: () => {} }));
    store.read().pilotSteps![id]!.push(0);
    expect(store.explorationSteps(id)).toEqual([2]);
    expect(store.touchExploration(id, 9).activated).toBe(false);
  });

  it('reste jouable en mémoire si le stockage est bloqué', () => {
    const store = new ProgressStore(() => { throw new Error('blocked'); });
    store.saveSession(revealResult(beginTravel(createSession(), ['cloud', 'ruins'])));
    for (const index of [2, 0, 1]) store.touchExploration(id, index);
    expect(store.unlockedSouvenirIds()).toEqual([id]);
    expect(store.persistent).toBe(false);
    expect(store.read().expedition?.charges).toBe(9);
  });

  it('migre les anciennes dalles partielles et distingue les nouvelles pierres au rechargement', () => {
    for (const old of [[3], [3, 1], [0, 1, 2, 3]]) {
      const decoded = decodeProgress(JSON.stringify({ schemaVersion: 1, discoveredDestinationIds: [id],
        pendingSouvenirIds: [id], pilotSteps: { [id]: old } }));
      expect(decoded.pilotSteps?.[id]).toEqual(Array.from({ length: Math.min(3, old.length) }, (_, i) => i));
      expect(decodeProgress(JSON.stringify(decoded))).toEqual(decoded);
    }
  });
});
