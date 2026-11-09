import { describe, expect, it } from 'vitest';
import { nearStormLightning, nearStormMouth, stormMouth } from '../domain/stormLightning';
import { activateTarget, validSteps } from '../domain/pilotExploration';
import { ProgressStore, decodeProgress } from '../services/storage';
import { beginTravel, createSession, revealResult } from '../domain/session';

const id = 'tempete_ecarlate';
describe('le bouchon aimante l’orage', () => {
  it('accroche tout le grand éclair et tolère le dépôt près du col', () => {
    expect(nearStormLightning({ x: 0.39, y: 0.31 })).toBe(true);
    expect(nearStormLightning({ x: 0.53, y: 0.31 })).toBe(true);
    expect(nearStormLightning({ x: 0.65, y: 0.402 })).toBe(true);
    expect(nearStormLightning(stormMouth)).toBe(false);
    expect(nearStormLightning({ x: NaN, y: 0.3 })).toBe(false);
    expect(nearStormMouth({ x: stormMouth.x + 0.04, y: stormMouth.y - 0.02 })).toBe(true);
    expect(nearStormMouth({ x: 0.5, y: 0.28 })).toBe(false);
    expect(nearStormMouth({ x: Infinity, y: 0 })).toBe(false);
  });

  it('sauvegarde la capture avant le rebouchage, sans charge ni double souvenir', () => {
    let saved: string | null = null;
    const storage = { getItem: () => saved, setItem: (_: string, value: string) => { saved = value; } };
    const first = new ProgressStore(() => storage);
    first.setLanguage('en');
    first.saveSession(revealResult(beginTravel(createSession(), ['fire', 'cloud'])));
    expect(first.explore(id)).toBe(false);
    expect(first.touchExploration(id, 1).activated).toBe(false);
    expect(first.touchExploration(id, 0).collected).toBe(false);
    const resumed = new ProgressStore(() => storage);
    expect(resumed.explorationSteps(id)).toEqual([0]);
    expect(resumed.touchExploration(id, 0).activated).toBe(false);
    expect(resumed.touchExploration(id, 1).collected).toBe(true);
    expect(resumed.touchExploration(id, 1).collected).toBe(false);
    expect(resumed.unlockedSouvenirIds()).toEqual([id]);
    expect(resumed.read().expedition?.charges).toBe(9);
    expect(resumed.read().language).toBe('en');
    expect(new ProgressStore(() => storage).explorationSteps(id)).toEqual([0, 1]);
  });

  it('récupère les étapes invalides et garde les anciennes fioles acquises', () => {
    expect(activateTarget(id, [], 1)).toEqual([]);
    expect(validSteps(id, [1, 1, 4, -1, '0'])).toEqual([]);
    expect(decodeProgress(JSON.stringify({ schemaVersion: 1, discoveredDestinationIds: [id],
      pendingSouvenirIds: [id], pilotSteps: { [id]: [0, 0, 3, -1, '1'] } })).pilotSteps?.[id]).toEqual([0]);
    const legacy = new ProgressStore(() => ({ getItem: () => JSON.stringify({ schemaVersion: 1,
      discoveredDestinationIds: [id] }), setItem: () => {} }));
    expect(legacy.explorationSteps(id)).toEqual([0, 1]);
    expect(legacy.unlockedSouvenirIds()).toEqual([id]);
  });

  it('reste jouable en mémoire quand le stockage refuse les écritures', () => {
    const store = new ProgressStore(() => ({ getItem: () => null, setItem: () => { throw Error('blocked'); } }));
    store.saveSession(revealResult(beginTravel(createSession(), ['fire', 'cloud'])));
    expect(store.touchExploration(id, 0).activated).toBe(true);
    expect(store.touchExploration(id, 1).collected).toBe(true);
    expect(store.read().expedition?.charges).toBe(9);
    expect(store.persistent).toBe(false);
  });
});
