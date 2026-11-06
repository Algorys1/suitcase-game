import { describe, expect, it } from 'vitest';
import { ProgressStore, decodeProgress } from '../services/storage';
import { createSession, beginTravel, revealResult } from '../domain/session';

describe('nénuphars et lucioles du marais', () => {
  it('reprend les groupes réveillés et collecte trois nénuphars distincts sans autre débit', () => {
    let saved: string | null = null;
    const storage = { getItem: () => saved, setItem: (_key: string, value: string) => { saved = value; } };
    const first = new ProgressStore(() => storage);
    first.setLanguage('en');
    first.saveSession(revealResult(beginTravel(createSession(), ['water', 'mushroom'])));
    expect(first.explore('marais_des_lucioles')).toBe(false);
    expect(first.touchExploration('marais_des_lucioles', 2).collected).toBe(false);
    const next = new ProgressStore(() => storage);
    expect(next.explorationSteps('marais_des_lucioles')).toEqual([2]);
    expect(next.touchExploration('marais_des_lucioles', 2).activated).toBe(false);
    expect(next.touchExploration('marais_des_lucioles', 0).collected).toBe(false);
    expect(next.unlockedSouvenirIds()).toEqual([]);
    expect(next.touchExploration('marais_des_lucioles', 1).collected).toBe(true);
    expect(next.touchExploration('marais_des_lucioles', 1).collected).toBe(false);
    expect(next.unlockedSouvenirIds()).toEqual(['marais_des_lucioles']);
    expect(next.read().expedition?.charges).toBe(9);
    expect(next.read().language).toBe('en');
  });

  it('valide les étapes et préserve les fanaux déjà acquis', () => {
    expect(decodeProgress(JSON.stringify({ schemaVersion: 1, discoveredDestinationIds: ['marais_des_lucioles'],
      pendingSouvenirIds: ['marais_des_lucioles'], pilotSteps: { marais_des_lucioles: [1, 1, -1, 3, '0'] } }))
      .pilotSteps?.marais_des_lucioles).toEqual([1]);
    const legacy = new ProgressStore(() => ({ getItem: () => JSON.stringify({ schemaVersion: 1,
      discoveredDestinationIds: ['marais_des_lucioles'] }), setItem: () => {} }));
    expect(legacy.explorationSteps('marais_des_lucioles')).toEqual([0, 1, 2]);
    expect(legacy.touchExploration('marais_des_lucioles', 0).collected).toBe(false);
  });
});
