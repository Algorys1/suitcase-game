import { describe, expect, it } from 'vitest';
import { ProgressStore, decodeProgress } from '../services/storage';
import { createSession, beginTravel, revealResult } from '../domain/session';

describe('clé des ruines et deux bancs distincts', () => {
  it('reprend le premier banc, refuse les répétitions et collecte une seule fois sans débiter', () => {
    let saved: string | null = null;
    const storage = { getItem: () => saved, setItem: (_key: string, value: string) => { saved = value; } };
    const first = new ProgressStore(() => storage);
    first.saveSession(revealResult(beginTravel(createSession(), ['water', 'ruins'])));
    expect(first.explore('ruines_englouties')).toBe(false);
    expect(first.touchExploration('ruines_englouties', 1).collected).toBe(false);
    const next = new ProgressStore(() => storage);
    expect(next.explorationSteps('ruines_englouties')).toEqual([1]);
    expect(next.touchExploration('ruines_englouties', 1).activated).toBe(false);
    expect(next.unlockedSouvenirIds()).toEqual([]);
    expect(next.touchExploration('ruines_englouties', 0).collected).toBe(true);
    expect(next.touchExploration('ruines_englouties', 0).collected).toBe(false);
    expect(next.unlockedSouvenirIds()).toEqual(['ruines_englouties']);
    expect(next.read().expedition?.charges).toBe(9);
  });

  it('valide les étapes et conserve la clé des anciennes sauvegardes', () => {
    expect(decodeProgress(JSON.stringify({ schemaVersion: 1, discoveredDestinationIds: ['ruines_englouties'],
      pendingSouvenirIds: ['ruines_englouties'], pilotSteps: { ruines_englouties: [1, 1, -1, 2, '0'] } }))
      .pilotSteps?.ruines_englouties).toEqual([1]);
    const legacy = new ProgressStore(() => ({ getItem: () => JSON.stringify({ schemaVersion: 1,
      discoveredDestinationIds: ['ruines_englouties'] }), setItem: () => {} }));
    expect(legacy.explorationSteps('ruines_englouties')).toEqual([0, 1]);
    expect(legacy.touchExploration('ruines_englouties', 0).collected).toBe(false);
  });
});
