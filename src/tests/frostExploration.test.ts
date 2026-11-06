import { describe, expect, it } from 'vitest';
import { ProgressStore, decodeProgress } from '../services/storage';
import { createSession, beginTravel, revealResult } from '../domain/session';

describe('branches enneigées du palais', () => {
  it('reprend les zones arrosées et collecte trois branches distinctes sans autre débit', () => {
    let saved: string | null = null;
    const storage = { getItem: () => saved, setItem: (_key: string, value: string) => { saved = value; } };
    const first = new ProgressStore(() => storage);
    first.setLanguage('en');
    first.saveSession(revealResult(beginTravel(createSession(), ['snow', 'crystal'])));
    expect(first.explore('palais_de_givre')).toBe(false);
    expect(first.touchExploration('palais_de_givre', 2).collected).toBe(false);
    const next = new ProgressStore(() => storage);
    expect(next.explorationSteps('palais_de_givre')).toEqual([2]);
    expect(next.touchExploration('palais_de_givre', 2).activated).toBe(false);
    expect(next.touchExploration('palais_de_givre', 0).collected).toBe(false);
    expect(next.unlockedSouvenirIds()).toEqual([]);
    expect(next.touchExploration('palais_de_givre', 1).collected).toBe(true);
    expect(next.touchExploration('palais_de_givre', 1).collected).toBe(false);
    expect(next.unlockedSouvenirIds()).toEqual(['palais_de_givre']);
    expect(next.read().expedition?.charges).toBe(9);
    expect(next.read().language).toBe('en');
  });

  it('valide les étapes et préserve les souvenirs déjà acquis', () => {
    expect(decodeProgress(JSON.stringify({ schemaVersion: 1, discoveredDestinationIds: ['palais_de_givre'],
      pendingSouvenirIds: ['palais_de_givre'], pilotSteps: { palais_de_givre: [1, 1, -1, 3, '0'] } }))
      .pilotSteps?.palais_de_givre).toEqual([1]);
    const legacy = new ProgressStore(() => ({ getItem: () => JSON.stringify({ schemaVersion: 1,
      discoveredDestinationIds: ['palais_de_givre'] }), setItem: () => {} }));
    expect(legacy.explorationSteps('palais_de_givre')).toEqual([0, 1, 2]);
    expect(legacy.touchExploration('palais_de_givre', 0).collected).toBe(false);
  });
});
