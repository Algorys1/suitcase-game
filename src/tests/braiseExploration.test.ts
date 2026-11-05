import { describe, expect, it } from 'vitest';
import { ProgressStore, decodeProgress } from '../services/storage';
import { createSession, beginTravel, revealResult } from '../domain/session';

describe('colonnes du Cœur de braise', () => {
  it('garde les colonnes distinctes après reprise et collecte une seule fois sans charge supplémentaire', () => {
    let saved: string | null = null;
    const storage = { getItem: () => saved, setItem: (_key: string, value: string) => { saved = value; } };
    const first = new ProgressStore(() => storage);
    first.setLanguage('en');
    first.saveSession(revealResult(beginTravel(createSession(), ['fire', 'rock'])));
    expect(first.explore('coeur_de_braise')).toBe(false);
    expect(first.touchExploration('coeur_de_braise', 2).collected).toBe(false);
    const next = new ProgressStore(() => storage);
    expect(next.explorationSteps('coeur_de_braise')).toEqual([2]);
    expect(next.touchExploration('coeur_de_braise', 2).activated).toBe(false);
    expect(next.touchExploration('coeur_de_braise', 0).collected).toBe(false);
    expect(next.unlockedSouvenirIds()).toEqual([]);
    expect(next.touchExploration('coeur_de_braise', 1).collected).toBe(true);
    expect(next.touchExploration('coeur_de_braise', 1).collected).toBe(false);
    expect(next.unlockedSouvenirIds()).toEqual(['coeur_de_braise']);
    expect(next.read().expedition?.charges).toBe(9);
    expect(next.read().language).toBe('en');
  });

  it('filtre les mauvaises étapes et conserve les anciens souvenirs', () => {
    expect(decodeProgress(JSON.stringify({ schemaVersion: 1, discoveredDestinationIds: ['coeur_de_braise'],
      pendingSouvenirIds: ['coeur_de_braise'], pilotSteps: { coeur_de_braise: [1, 1, -1, 3, '0'] } }))
      .pilotSteps?.coeur_de_braise).toEqual([1]);
    const legacy = new ProgressStore(() => ({ getItem: () => JSON.stringify({ schemaVersion: 1,
      discoveredDestinationIds: ['coeur_de_braise'] }), setItem: () => {} }));
    expect(legacy.explorationSteps('coeur_de_braise')).toEqual([0, 1, 2]);
    expect(legacy.touchExploration('coeur_de_braise', 0).collected).toBe(false);
  });
});
