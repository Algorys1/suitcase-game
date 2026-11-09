import { describe, expect, it } from 'vitest';
import { ProgressStore, decodeProgress } from '../services/storage';
import { createSession, beginTravel, revealResult } from '../domain/session';

describe('Nécropole : quatre gravures et lampes', () => {
  it('reprend chaque lampe, ignore les doublons et collecte au quatrième signe sans débit', () => {
    let saved: string | null = null;
    const storage = { getItem: () => saved, setItem: (_key: string, value: string) => { saved = value; } };
    const first = new ProgressStore(() => storage);
    first.setLanguage('en');
    first.saveSession(revealResult(beginTravel(createSession(), ['fire', 'ruins'])));
    expect(first.explore('necropole_ardente')).toBe(false);
    expect(first.touchExploration('necropole_ardente', 3).collected).toBe(false);
    const resumed = new ProgressStore(() => storage);
    expect(resumed.explorationSteps('necropole_ardente')).toEqual([3]);
    expect(resumed.touchExploration('necropole_ardente', 3).activated).toBe(false);
    for (const index of [1, 0]) expect(resumed.touchExploration('necropole_ardente', index).collected).toBe(false);
    expect(resumed.unlockedSouvenirIds()).toEqual([]);
    expect(resumed.touchExploration('necropole_ardente', 2).collected).toBe(true);
    expect(resumed.touchExploration('necropole_ardente', 2).collected).toBe(false);
    const next = new ProgressStore(() => storage);
    expect(next.explorationSteps('necropole_ardente')).toEqual([0, 1, 2, 3]);
    expect(next.unlockedSouvenirIds()).toEqual(['necropole_ardente']);
    expect(next.read().expedition?.charges).toBe(9);
    expect(next.read().language).toBe('en');
  });

  it('valide les étapes et conserve les lampes des anciennes collections', () => {
    expect(decodeProgress(JSON.stringify({ schemaVersion: 1, discoveredDestinationIds: ['necropole_ardente'],
      pendingSouvenirIds: ['necropole_ardente'], pilotSteps: { necropole_ardente: [3, 3, 4, -1, '2', 1] } }))
      .pilotSteps?.necropole_ardente).toEqual([1, 3]);
    const legacy = new ProgressStore(() => ({ getItem: () => JSON.stringify({ schemaVersion: 1,
      discoveredDestinationIds: ['necropole_ardente'] }), setItem: () => {} }));
    expect(legacy.explorationSteps('necropole_ardente')).toEqual([0, 1, 2, 3]);
    expect(legacy.touchExploration('necropole_ardente', 0).collected).toBe(false);
  });
});
