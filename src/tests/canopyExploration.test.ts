import { describe, expect, it } from 'vitest';
import { ProgressStore, decodeProgress } from '../services/storage';
import { createSession, beginTravel, revealResult } from '../domain/session';

describe('gouttes et tasse de la canopée', () => {
  it('reprend les gouttes et collecte trois feuilles distinctes sans autre débit', () => {
    let saved: string | null = null;
    const storage = { getItem: () => saved, setItem: (_key: string, value: string) => { saved = value; } };
    const first = new ProgressStore(() => storage);
    first.setLanguage('en');
    first.saveSession(revealResult(beginTravel(createSession(), ['tree', 'cloud'])));
    expect(first.explore('canopee_des_brumes')).toBe(false);
    expect(first.touchExploration('canopee_des_brumes', 2).collected).toBe(false);
    const next = new ProgressStore(() => storage);
    expect(next.explorationSteps('canopee_des_brumes')).toEqual([2]);
    expect(next.touchExploration('canopee_des_brumes', 2).activated).toBe(false);
    expect(next.touchExploration('canopee_des_brumes', 0).collected).toBe(false);
    expect(next.unlockedSouvenirIds()).toEqual([]);
    expect(next.touchExploration('canopee_des_brumes', 1).collected).toBe(true);
    expect(next.touchExploration('canopee_des_brumes', 1).collected).toBe(false);
    expect(next.unlockedSouvenirIds()).toEqual(['canopee_des_brumes']);
    expect(next.read().expedition?.charges).toBe(9);
    expect(next.read().language).toBe('en');
  });

  it('valide les étapes et préserve les souvenirs déjà acquis', () => {
    expect(decodeProgress(JSON.stringify({ schemaVersion: 1, discoveredDestinationIds: ['canopee_des_brumes'],
      pendingSouvenirIds: ['canopee_des_brumes'], pilotSteps: { canopee_des_brumes: [1, 1, -1, 3, '0'] } }))
      .pilotSteps?.canopee_des_brumes).toEqual([1]);
    const legacy = new ProgressStore(() => ({ getItem: () => JSON.stringify({ schemaVersion: 1,
      discoveredDestinationIds: ['canopee_des_brumes'] }), setItem: () => {} }));
    expect(legacy.explorationSteps('canopee_des_brumes')).toEqual([0, 1, 2]);
    expect(legacy.touchExploration('canopee_des_brumes', 0).collected).toBe(false);
  });
});
