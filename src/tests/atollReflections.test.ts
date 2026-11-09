import { describe, expect, it } from 'vitest';
import { atollBracelet, atollReflections, overAtollBracelet } from '../domain/atollReflections';
import { ProgressStore, decodeProgress } from '../services/storage';
import { beginTravel, createSession, revealResult } from '../domain/session';

const id = 'atoll_boreal';
describe('deux reflets pour le bracelet boréal', () => {
  it('accepte le bracelet largement sans accepter le lagon ni les valeurs invalides', () => {
    expect(overAtollBracelet(atollBracelet)).toBe(true);
    expect(overAtollBracelet({ x: 0.77, y: 0.73 })).toBe(true);
    for (const point of atollReflections) expect(overAtollBracelet(point)).toBe(false);
    expect(overAtollBracelet({ x: NaN, y: 0.7 })).toBe(false);
    expect(overAtollBracelet({ x: 0.7, y: Infinity })).toBe(false);
  });
  it('reprend chaque couleur en ordre libre sans doublon, avec le voyage déjà débité', () => {
    for (const firstColour of [0, 1]) {
      let saved: string | null = null;
      const storage = { getItem: () => saved, setItem: (_: string, value: string) => { saved = value; } };
      const first = new ProgressStore(() => storage);
      first.setLanguage('en');
      first.saveSession(revealResult(beginTravel(createSession(), ['palm', 'snow'])));
      expect(first.explore(id)).toBe(false);
      expect(first.touchExploration(id, firstColour).collected).toBe(false);
      const resumed = new ProgressStore(() => storage);
      expect(resumed.explorationSteps(id)).toEqual([firstColour]);
      expect(resumed.touchExploration(id, firstColour).activated).toBe(false);
      expect(resumed.touchExploration(id, 1 - firstColour).collected).toBe(true);
      expect(resumed.touchExploration(id, 1 - firstColour).collected).toBe(false);
      expect(resumed.unlockedSouvenirIds()).toEqual([id]);
      expect(resumed.read().expedition?.charges).toBe(9);
      expect(resumed.read().language).toBe('en');
    }
  });
  it('valide les étapes et garde les bracelets déjà acquis', () => {
    expect(decodeProgress(JSON.stringify({ schemaVersion: 1, discoveredDestinationIds: [id],
      pendingSouvenirIds: [id], pilotSteps: { [id]: [1, 1, 2, -1, '0'] } })).pilotSteps?.[id]).toEqual([1]);
    const legacy = new ProgressStore(() => ({ getItem: () => JSON.stringify({ schemaVersion: 1,
      discoveredDestinationIds: [id] }), setItem: () => {} }));
    expect(legacy.explorationSteps(id)).toEqual([0, 1]);
    expect(legacy.unlockedSouvenirIds()).toEqual([id]);
  });
  it('reste jouable en mémoire si le stockage refuse les écritures', () => {
    const store = new ProgressStore(() => ({ getItem: () => null, setItem: () => { throw Error('blocked'); } }));
    store.saveSession(revealResult(beginTravel(createSession(), ['palm', 'snow'])));
    expect(store.touchExploration(id, 1).collected).toBe(false);
    expect(store.touchExploration(id, 0).collected).toBe(true);
    expect(store.persistent).toBe(false);
    expect(store.read().expedition?.charges).toBe(9);
  });
});
