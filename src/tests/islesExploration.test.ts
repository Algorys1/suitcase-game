import { describe, expect, it } from 'vitest';
import { ProgressStore } from '../services/storage';
import { createSession, beginTravel, revealResult } from '../domain/session';

describe('traversée du pont des Îles suspendues', () => {
  it('conserve la traversée partielle et récompense cinq zones distinctes une seule fois', () => {
    let saved: string | null = null;
    const storage = { getItem: () => saved, setItem: (_key: string, value: string) => { saved = value; } };
    const first = new ProgressStore(() => storage);
    first.saveSession(revealResult(beginTravel(createSession(), ['rock', 'cloud'])));
    expect(first.explore('iles_suspendues')).toBe(false);
    for (const index of [4, 3]) expect(first.touchExploration('iles_suspendues', index).collected).toBe(false);
    const next = new ProgressStore(() => storage);
    expect(next.explorationSteps('iles_suspendues')).toEqual([3, 4]);
    expect(next.touchExploration('iles_suspendues', 3).activated).toBe(false);
    for (const index of [2, 1]) expect(next.touchExploration('iles_suspendues', index).collected).toBe(false);
    expect(next.touchExploration('iles_suspendues', 0).collected).toBe(true);
    expect(next.touchExploration('iles_suspendues', 0).collected).toBe(false);
    expect(next.unlockedSouvenirIds()).toEqual(['iles_suspendues']);
    expect(next.read().expedition?.charges).toBe(9);
  });

  it('conserve les galets des anciennes sauvegardes et leur paysage éveillé', () => {
    const legacy = new ProgressStore(() => ({ getItem: () => JSON.stringify({ schemaVersion: 1,
      discoveredDestinationIds: ['iles_suspendues'] }), setItem: () => {} }));
    expect(legacy.explorationSteps('iles_suspendues')).toEqual([0, 1, 2, 3, 4]);
    expect(legacy.touchExploration('iles_suspendues', 1).collected).toBe(false);
  });
});
