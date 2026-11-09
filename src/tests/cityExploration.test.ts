import { describe, expect, it } from 'vitest';
import { ProgressStore, decodeProgress } from '../services/storage';
import { createSession, beginTravel, revealResult } from '../domain/session';

describe('fenetres et flocons de la cite', () => {
  it('reprend les fenetres et collecte trois groupes distincts sans autre débit', () => {
    let saved: string | null = null;
    const storage = { getItem: () => saved, setItem: (_key: string, value: string) => { saved = value; } };
    const first = new ProgressStore(() => storage);
    first.setLanguage('en');
    first.saveSession(revealResult(beginTravel(createSession(), ['snow', 'ruins'])));
    expect(first.explore('cite_immobile')).toBe(false);
    expect(first.touchExploration('cite_immobile', 2).collected).toBe(false);
    const next = new ProgressStore(() => storage);
    expect(next.explorationSteps('cite_immobile')).toEqual([2]);
    expect(next.touchExploration('cite_immobile', 2).activated).toBe(false);
    expect(next.touchExploration('cite_immobile', 0).collected).toBe(false);
    expect(next.unlockedSouvenirIds()).toEqual([]);
    expect(next.touchExploration('cite_immobile', 1).collected).toBe(true);
    expect(next.touchExploration('cite_immobile', 1).collected).toBe(false);
    expect(next.unlockedSouvenirIds()).toEqual(['cite_immobile']);
    expect(next.read().expedition?.charges).toBe(9);
    expect(next.read().language).toBe('en');
  });

  it('valide les étapes et préserve les souvenirs déjà acquis', () => {
    expect(decodeProgress(JSON.stringify({ schemaVersion: 1, discoveredDestinationIds: ['cite_immobile'],
      pendingSouvenirIds: ['cite_immobile'], pilotSteps: { cite_immobile: [1, 1, -1, 3, '0'] } }))
      .pilotSteps?.cite_immobile).toEqual([1]);
    const legacy = new ProgressStore(() => ({ getItem: () => JSON.stringify({ schemaVersion: 1,
      discoveredDestinationIds: ['cite_immobile'] }), setItem: () => {} }));
    expect(legacy.explorationSteps('cite_immobile')).toEqual([0, 1, 2]);
    expect(legacy.touchExploration('cite_immobile', 0).collected).toBe(false);
  });
});
