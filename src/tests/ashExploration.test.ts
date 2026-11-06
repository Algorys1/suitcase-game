import { describe, expect, it } from 'vitest';
import { ProgressStore, decodeProgress } from '../services/storage';
import { createSession, beginTravel, revealResult } from '../domain/session';
import { validSteps } from '../domain/pilotExploration';

describe('volcan et graine de l’île des cendres', () => {
  it('reprend trois pressions successives et donne un seul souvenir sans autre débit', () => {
    let saved: string | null = null;
    const storage = { getItem: () => saved, setItem: (_key: string, value: string) => { saved = value; } };
    const first = new ProgressStore(() => storage);
    first.setLanguage('en');
    first.saveSession(revealResult(beginTravel(createSession(), ['fire', 'palm'])));
    expect(first.explore('ile_des_cendres')).toBe(false);
    expect(first.touchExploration('ile_des_cendres', 2).activated).toBe(false);
    expect(first.touchExploration('ile_des_cendres', 0).activated).toBe(true);
    const next = new ProgressStore(() => storage);
    expect(next.explorationSteps('ile_des_cendres')).toEqual([0]);
    expect(next.touchExploration('ile_des_cendres', 0).activated).toBe(false);
    expect(next.touchExploration('ile_des_cendres', 1).collected).toBe(false);
    expect(next.unlockedSouvenirIds()).toEqual([]);
    expect(next.touchExploration('ile_des_cendres', 2).collected).toBe(true);
    expect(next.touchExploration('ile_des_cendres', 2).collected).toBe(false);
    expect(next.unlockedSouvenirIds()).toEqual(['ile_des_cendres']);
    expect(next.read().expedition?.charges).toBe(9);
    expect(next.read().language).toBe('en');
  });

  it('valide les étapes successives et préserve les graines déjà acquises', () => {
    expect(validSteps('ile_des_cendres', [2, 0, 0, -1, '1'])).toEqual([0]);
    expect(decodeProgress(JSON.stringify({ schemaVersion: 1, discoveredDestinationIds: ['ile_des_cendres'],
      pendingSouvenirIds: ['ile_des_cendres'], pilotSteps: { ile_des_cendres: [0, 1, 1, 4] } }))
      .pilotSteps?.ile_des_cendres).toEqual([0, 1]);
    const legacy = new ProgressStore(() => ({ getItem: () => JSON.stringify({ schemaVersion: 1,
      discoveredDestinationIds: ['ile_des_cendres'] }), setItem: () => {} }));
    expect(legacy.explorationSteps('ile_des_cendres')).toEqual([0, 1, 2]);
    expect(legacy.touchExploration('ile_des_cendres', 0).collected).toBe(false);
  });
});
