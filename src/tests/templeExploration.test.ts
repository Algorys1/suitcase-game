import { describe, expect, it } from 'vitest';
import { ProgressStore, decodeProgress } from '../services/storage';
import { createSession, beginTravel, revealResult } from '../domain/session';

describe('gravures et gardiens du temple', () => {
  it('reprend les gardiens et collecte trois gravures distinctes sans autre débit', () => {
    let saved: string | null = null;
    const storage = { getItem: () => saved, setItem: (_key: string, value: string) => { saved = value; } };
    const first = new ProgressStore(() => storage);
    first.setLanguage('en');
    first.saveSession(revealResult(beginTravel(createSession(), ['tree', 'ruins'])));
    expect(first.explore('temple_oublie')).toBe(false);
    expect(first.touchExploration('temple_oublie', 2).collected).toBe(false);
    const next = new ProgressStore(() => storage);
    expect(next.explorationSteps('temple_oublie')).toEqual([2]);
    expect(next.touchExploration('temple_oublie', 2).activated).toBe(false);
    expect(next.touchExploration('temple_oublie', 0).collected).toBe(false);
    expect(next.unlockedSouvenirIds()).toEqual([]);
    expect(next.touchExploration('temple_oublie', 1).collected).toBe(true);
    expect(next.touchExploration('temple_oublie', 1).collected).toBe(false);
    expect(next.unlockedSouvenirIds()).toEqual(['temple_oublie']);
    expect(next.read().expedition?.charges).toBe(9);
    expect(next.read().language).toBe('en');
  });

  it('valide les étapes et préserve les souvenirs déjà acquis', () => {
    expect(decodeProgress(JSON.stringify({ schemaVersion: 1, discoveredDestinationIds: ['temple_oublie'],
      pendingSouvenirIds: ['temple_oublie'], pilotSteps: { temple_oublie: [1, 1, -1, 3, '0'] } }))
      .pilotSteps?.temple_oublie).toEqual([1]);
    const legacy = new ProgressStore(() => ({ getItem: () => JSON.stringify({ schemaVersion: 1,
      discoveredDestinationIds: ['temple_oublie'] }), setItem: () => {} }));
    expect(legacy.explorationSteps('temple_oublie')).toEqual([0, 1, 2]);
    expect(legacy.touchExploration('temple_oublie', 0).collected).toBe(false);
  });
});
