import { describe, expect, it } from 'vitest';
import { ProgressStore, decodeProgress } from '../services/storage';
import { createSession, beginTravel, revealResult } from '../domain/session';

describe('coraux et perle du recif', () => {
  it('reprend les reflets et collecte trois coraux distincts sans autre débit', () => {
    let saved: string | null = null;
    const storage = { getItem: () => saved, setItem: (_key: string, value: string) => { saved = value; } };
    const first = new ProgressStore(() => storage);
    first.setLanguage('en');
    first.saveSession(revealResult(beginTravel(createSession(), ['water', 'crystal'])));
    expect(first.explore('recif_de_verre')).toBe(false);
    expect(first.touchExploration('recif_de_verre', 2).collected).toBe(false);
    const next = new ProgressStore(() => storage);
    expect(next.explorationSteps('recif_de_verre')).toEqual([2]);
    expect(next.touchExploration('recif_de_verre', 2).activated).toBe(false);
    expect(next.touchExploration('recif_de_verre', 0).collected).toBe(false);
    expect(next.unlockedSouvenirIds()).toEqual([]);
    expect(next.touchExploration('recif_de_verre', 1).collected).toBe(true);
    expect(next.touchExploration('recif_de_verre', 1).collected).toBe(false);
    expect(next.unlockedSouvenirIds()).toEqual(['recif_de_verre']);
    expect(next.read().expedition?.charges).toBe(9);
    expect(next.read().language).toBe('en');
  });

  it('valide les étapes et préserve les souvenirs déjà acquis', () => {
    expect(decodeProgress(JSON.stringify({ schemaVersion: 1, discoveredDestinationIds: ['recif_de_verre'],
      pendingSouvenirIds: ['recif_de_verre'], pilotSteps: { recif_de_verre: [1, 1, -1, 3, '0'] } }))
      .pilotSteps?.recif_de_verre).toEqual([1]);
    const legacy = new ProgressStore(() => ({ getItem: () => JSON.stringify({ schemaVersion: 1,
      discoveredDestinationIds: ['recif_de_verre'] }), setItem: () => {} }));
    expect(legacy.explorationSteps('recif_de_verre')).toEqual([0, 1, 2]);
    expect(legacy.touchExploration('recif_de_verre', 0).collected).toBe(false);
  });
});
