import { describe, expect, it } from 'vitest';
import { ProgressStore, decodeProgress } from '../services/storage';
import { createSession, beginTravel, revealResult } from '../domain/session';

describe('cristaux peints du désert', () => {
  it('mémorise les six cristaux dans leur ordre et collecte une seule fois sans débit supplémentaire', () => {
    let saved: string | null = null;
    const storage = { getItem: () => saved, setItem: (_key: string, value: string) => { saved = value; } };
    const first = new ProgressStore(() => storage);
    first.setLanguage('en');
    first.saveSession(revealResult(beginTravel(createSession(), ['rock', 'crystal'])));
    expect(first.explore('desert_de_cristal')).toBe(false);
    expect(first.touchExploration('desert_de_cristal', 1).collected).toBe(false);
    const next = new ProgressStore(() => storage);
    expect(next.explorationSteps('desert_de_cristal')).toEqual([1]);
    expect(next.touchExploration('desert_de_cristal', 1).activated).toBe(false);
    expect(next.touchExploration('desert_de_cristal', 2).collected).toBe(false);
    expect(next.touchExploration('desert_de_cristal', 0).collected).toBe(false);
    expect(next.touchExploration('desert_de_cristal', 5).collected).toBe(false);
    const resumed = new ProgressStore(() => storage);
    expect(resumed.explorationSteps('desert_de_cristal')).toEqual([1, 2, 0, 5]);
    expect(next.touchExploration('desert_de_cristal', 4).collected).toBe(false);
    expect(next.touchExploration('desert_de_cristal', 3).collected).toBe(true);
    expect(next.touchExploration('desert_de_cristal', 0).collected).toBe(false);
    expect(next.unlockedSouvenirIds()).toEqual(['desert_de_cristal']);
    expect(next.read().expedition?.charges).toBe(9);
    expect(next.read().language).toBe('en');
  });

  it('valide les références et préserve les sabliers anciens', () => {
    expect(decodeProgress(JSON.stringify({ schemaVersion: 1, discoveredDestinationIds: ['desert_de_cristal'],
      pendingSouvenirIds: ['desert_de_cristal'], pilotSteps: { desert_de_cristal: [1, 1, -1, 6, '0'] } }))
      .pilotSteps?.desert_de_cristal).toEqual([1]);
    const legacy = new ProgressStore(() => ({ getItem: () => JSON.stringify({ schemaVersion: 1,
      discoveredDestinationIds: ['desert_de_cristal'] }), setItem: () => {} }));
    expect(legacy.explorationSteps('desert_de_cristal')).toEqual([0, 1, 2, 3, 4, 5]);
    expect(legacy.touchExploration('desert_de_cristal', 0).collected).toBe(false);
    const oldDunes = new ProgressStore(() => ({ getItem: () => JSON.stringify({ schemaVersion: 1,
      discoveredDestinationIds: ['desert_de_cristal'], pilotSteps: { desert_de_cristal: [0, 1, 2] } }), setItem: () => {} }));
    expect(oldDunes.explorationSteps('desert_de_cristal')).toEqual([0, 1, 2, 3, 4, 5]);
    expect(oldDunes.unlockedSouvenirIds()).toEqual(['desert_de_cristal']);
  });
});
