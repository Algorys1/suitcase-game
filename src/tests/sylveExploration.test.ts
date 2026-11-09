import { describe, expect, it } from 'vitest';
import { ProgressStore, decodeProgress } from '../services/storage';
import { createSession, beginTravel, revealResult } from '../domain/session';

describe('Sylve: cinq dalles et rivière', () => {
  it('sauvegarde chaque dalle, ignore répétitions et collecte seulement à la cinquième', () => {
    let saved: string | null = null;
    const storage = { getItem: () => saved, setItem: (_key: string, value: string) => { saved = value; } };
    const first = new ProgressStore(() => storage);
    first.saveSession(revealResult(beginTravel(createSession(), ['tree', 'crystal'])));
    expect(first.explore('sylve_prismatique')).toBe(false);
    expect(first.touchExploration('sylve_prismatique', 4).collected).toBe(false);
    const resumed = new ProgressStore(() => storage);
    expect(resumed.explorationSteps('sylve_prismatique')).toEqual([4]);
    expect(resumed.touchExploration('sylve_prismatique', 4).activated).toBe(false);
    for (const index of [1, 3, 0]) expect(resumed.touchExploration('sylve_prismatique', index).collected).toBe(false);
    expect(resumed.unlockedSouvenirIds()).toEqual([]);
    expect(resumed.touchExploration('sylve_prismatique', 2).collected).toBe(true);
    expect(resumed.touchExploration('sylve_prismatique', 2).collected).toBe(false);
    const next = new ProgressStore(() => storage);
    expect(next.explorationSteps('sylve_prismatique')).toEqual([0, 1, 2, 3, 4]);
    expect(next.unlockedSouvenirIds()).toEqual(['sylve_prismatique']);
    expect(next.read().expedition?.charges).toBe(9);
  });

  it('valide les étapes et préserve les prismes déjà gagnés', () => {
    expect(decodeProgress(JSON.stringify({ schemaVersion: 1, discoveredDestinationIds: ['sylve_prismatique'],
      pendingSouvenirIds: ['sylve_prismatique'], pilotSteps: { sylve_prismatique: [4, 4, 5, -1, '2', 1] } }))
      .pilotSteps?.sylve_prismatique).toEqual([1, 4]);
    const legacy = new ProgressStore(() => ({ getItem: () => JSON.stringify({ schemaVersion: 1,
      discoveredDestinationIds: ['sylve_prismatique'] }), setItem: () => {} }));
    expect(legacy.explorationSteps('sylve_prismatique')).toEqual([0, 1, 2, 3, 4]);
    expect(legacy.touchExploration('sylve_prismatique', 0).collected).toBe(false);
  });
});
