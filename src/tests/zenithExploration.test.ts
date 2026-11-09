import { describe, expect, it } from 'vitest';
import { ProgressStore, decodeProgress } from '../services/storage';
import { createSession, beginTravel, revealResult } from '../domain/session';

describe('arrosoir et pavillon du zenith', () => {
  it('reprend les arrosages et collecte trois massifs distincts sans autre débit', () => {
    let saved: string | null = null;
    const storage = { getItem: () => saved, setItem: (_key: string, value: string) => { saved = value; } };
    const first = new ProgressStore(() => storage);
    first.setLanguage('en');
    first.saveSession(revealResult(beginTravel(createSession(), ['palm', 'cloud'])));
    expect(first.explore('jardins_du_zenith')).toBe(false);
    expect(first.touchExploration('jardins_du_zenith', 2).collected).toBe(false);
    const next = new ProgressStore(() => storage);
    expect(next.explorationSteps('jardins_du_zenith')).toEqual([2]);
    expect(next.touchExploration('jardins_du_zenith', 2).activated).toBe(false);
    expect(next.touchExploration('jardins_du_zenith', 0).collected).toBe(false);
    expect(next.unlockedSouvenirIds()).toEqual([]);
    expect(next.touchExploration('jardins_du_zenith', 1).collected).toBe(true);
    expect(next.touchExploration('jardins_du_zenith', 1).collected).toBe(false);
    expect(next.unlockedSouvenirIds()).toEqual(['jardins_du_zenith']);
    expect(next.read().expedition?.charges).toBe(9);
    expect(next.read().language).toBe('en');
  });

  it('valide les étapes et préserve les souvenirs déjà acquis', () => {
    expect(decodeProgress(JSON.stringify({ schemaVersion: 1, discoveredDestinationIds: ['jardins_du_zenith'],
      pendingSouvenirIds: ['jardins_du_zenith'], pilotSteps: { jardins_du_zenith: [1, 1, -1, 3, '0'] } }))
      .pilotSteps?.jardins_du_zenith).toEqual([1]);
    const legacy = new ProgressStore(() => ({ getItem: () => JSON.stringify({ schemaVersion: 1,
      discoveredDestinationIds: ['jardins_du_zenith'] }), setItem: () => {} }));
    expect(legacy.explorationSteps('jardins_du_zenith')).toEqual([0, 1, 2]);
    expect(legacy.touchExploration('jardins_du_zenith', 0).collected).toBe(false);
  });
});
