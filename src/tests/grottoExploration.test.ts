import { describe, expect, it } from 'vitest';
import { ProgressStore, decodeProgress } from '../services/storage';
import { createSession, beginTravel, revealResult } from '../domain/session';

describe('champignons et spores des grottes', () => {
  it('reprend les spores et collecte trois chapeaux distincts sans autre débit', () => {
    let saved: string | null = null;
    const storage = { getItem: () => saved, setItem: (_key: string, value: string) => { saved = value; } };
    const first = new ProgressStore(() => storage);
    first.setLanguage('en');
    first.saveSession(revealResult(beginTravel(createSession(), ['mushroom', 'rock'])));
    expect(first.explore('grottes_sporiferes')).toBe(false);
    expect(first.touchExploration('grottes_sporiferes', 2).collected).toBe(false);
    const next = new ProgressStore(() => storage);
    expect(next.explorationSteps('grottes_sporiferes')).toEqual([2]);
    expect(next.touchExploration('grottes_sporiferes', 2).activated).toBe(false);
    expect(next.touchExploration('grottes_sporiferes', 0).collected).toBe(false);
    expect(next.unlockedSouvenirIds()).toEqual([]);
    expect(next.touchExploration('grottes_sporiferes', 1).collected).toBe(true);
    expect(next.touchExploration('grottes_sporiferes', 1).collected).toBe(false);
    expect(next.unlockedSouvenirIds()).toEqual(['grottes_sporiferes']);
    expect(next.read().expedition?.charges).toBe(9);
    expect(next.read().language).toBe('en');
  });

  it('valide les étapes et préserve les souvenirs déjà acquis', () => {
    expect(decodeProgress(JSON.stringify({ schemaVersion: 1, discoveredDestinationIds: ['grottes_sporiferes'],
      pendingSouvenirIds: ['grottes_sporiferes'], pilotSteps: { grottes_sporiferes: [1, 1, -1, 3, '0'] } }))
      .pilotSteps?.grottes_sporiferes).toEqual([1]);
    const legacy = new ProgressStore(() => ({ getItem: () => JSON.stringify({ schemaVersion: 1,
      discoveredDestinationIds: ['grottes_sporiferes'] }), setItem: () => {} }));
    expect(legacy.explorationSteps('grottes_sporiferes')).toEqual([0, 1, 2]);
    expect(legacy.touchExploration('grottes_sporiferes', 0).collected).toBe(false);
  });
});
