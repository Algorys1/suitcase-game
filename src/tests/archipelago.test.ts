import { describe, expect, it } from 'vitest';
import { pilotTargetCounts, pilotTargets } from '../domain/pilotExploration';
import { beginTravel, createSession, revealResult } from '../domain/session';
import { decodeProgress, ProgressStore } from '../services/storage';

const memory = () => {
  let saved: string | null = null;
  return { getItem: () => saved, setItem: (_key: string, value: string) => { saved = value; } };
};

describe('coquillage révélé par les reflets', () => {
  it('exige six reflets différents, garde les étapes après rechargement et collecte une seule fois', () => {
    expect(pilotTargets.archipel_azur).toHaveLength(pilotTargetCounts.archipel_azur);
    const storage = memory();
    const first = new ProgressStore(() => storage);
    first.saveSession(revealResult(beginTravel(createSession(), ['water', 'palm'])));
    expect(first.explore('archipel_azur')).toBe(false);
    first.touchExploration('archipel_azur', 4);
    first.touchExploration('archipel_azur', 1);
    const store = new ProgressStore(() => storage);
    expect(store.explorationSteps('archipel_azur')).toEqual([1, 4]);
    expect(store.touchExploration('archipel_azur', 1).activated).toBe(false);
    for (const index of [5, 0, 3]) expect(store.touchExploration('archipel_azur', index).collected).toBe(false);
    expect(store.unlockedSouvenirIds()).toEqual([]);
    expect(store.touchExploration('archipel_azur', 2).collected).toBe(true);
    expect(store.touchExploration('archipel_azur', 2).collected).toBe(false);
    expect(store.unlockedSouvenirIds()).toEqual(['archipel_azur']);
    expect(store.read().expedition?.charges).toBe(9);
  });

  it('filtre les reflets invalides et garde les coquillages déjà acquis', () => {
    const decoded = decodeProgress(JSON.stringify({ schemaVersion: 1, discoveredDestinationIds: ['archipel_azur'],
      pendingSouvenirIds: ['archipel_azur'], pilotSteps: { archipel_azur: [0, 0, 4, -1, 6, 1.5, '2'] } }));
    expect(decoded.pilotSteps?.archipel_azur).toEqual([0, 4]);
    expect(decoded.pendingSouvenirIds).toEqual(['archipel_azur']);
    const legacy = new ProgressStore(() => ({ getItem: () => JSON.stringify({ schemaVersion: 1,
      discoveredDestinationIds: ['archipel_azur'] }), setItem: () => {} }));
    expect(legacy.explorationSteps('archipel_azur')).toEqual([0, 1, 2, 3, 4, 5]);
    expect(legacy.touchExploration('archipel_azur', 0).collected).toBe(false);
  });

  it('fonctionne en mémoire sans stockage, sans modifier la langue ni les charges', () => {
    const store = new ProgressStore(() => { throw Error('blocked'); });
    store.setLanguage('en');
    store.saveSession(revealResult(beginTravel(createSession(), ['water', 'palm'])));
    for (const index of [3, 2, 5, 4, 1, 0]) store.touchExploration('archipel_azur', index);
    expect(store.persistent).toBe(false);
    expect(store.unlockedSouvenirIds()).toEqual(['archipel_azur']);
    expect(store.read().language).toBe('en');
    expect(store.read().expedition?.charges).toBe(9);
  });
});
