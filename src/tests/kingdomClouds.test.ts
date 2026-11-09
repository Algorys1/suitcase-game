import { describe, expect, it } from 'vitest';
import { findKingdomLedge, kingdomLedges } from '../domain/kingdomClouds';
import { ProgressStore, decodeProgress } from '../services/storage';
import { beginTravel, createSession, revealResult } from '../domain/session';

describe('nuages et cascades du royaume', () => {
  it('accepte tous les rebords secs sans associer un nuage à une couleur ou à une île', () => {
    kingdomLedges.forEach((ledge, index) => {
      expect(findKingdomLedge(ledge, [])).toBe(index);
      expect(findKingdomLedge({ x: ledge.x + 0.04, y: ledge.y - 0.03 }, [])).toBe(index);
      expect(findKingdomLedge(ledge, [index])).toBe(-1);
    });
    expect(findKingdomLedge({ x: 0.8, y: 0.9 }, [])).toBe(-1);
    expect(findKingdomLedge({ x: NaN, y: 0.5 }, [])).toBe(-1);
    expect(findKingdomLedge(kingdomLedges[1], [0, 1, 2])).toBe(-1);
  });

  it('reprend l’eau en ordre libre, bloque les doublons et collecte sans autre charge', () => {
    let saved: string | null = null;
    const storage = { getItem: () => saved, setItem: (_: string, value: string) => { saved = value; } };
    const first = new ProgressStore(() => storage);
    first.setLanguage('en');
    first.saveSession(revealResult(beginTravel(createSession(), ['mushroom', 'cloud'])));
    expect(first.explore('royaume_des_spores_celestes')).toBe(false);
    expect(first.touchExploration('royaume_des_spores_celestes', 2).collected).toBe(false);
    const resumed = new ProgressStore(() => storage);
    expect(resumed.explorationSteps('royaume_des_spores_celestes')).toEqual([2]);
    expect(resumed.touchExploration('royaume_des_spores_celestes', 2).activated).toBe(false);
    expect(resumed.touchExploration('royaume_des_spores_celestes', 0).collected).toBe(false);
    expect(resumed.touchExploration('royaume_des_spores_celestes', 1).collected).toBe(true);
    expect(resumed.touchExploration('royaume_des_spores_celestes', 1).collected).toBe(false);
    expect(resumed.unlockedSouvenirIds()).toEqual(['royaume_des_spores_celestes']);
    expect(resumed.read().expedition?.charges).toBe(9);
    expect(resumed.read().language).toBe('en');
  });

  it('valide les étapes et garde les ombrelles des anciennes collections', () => {
    const id = 'royaume_des_spores_celestes';
    expect(decodeProgress(JSON.stringify({ schemaVersion: 1, discoveredDestinationIds: [id],
      pendingSouvenirIds: [id], pilotSteps: { [id]: [2, 2, 3, -1, '1', 0] } })).pilotSteps?.[id]).toEqual([0, 2]);
    const legacy = new ProgressStore(() => ({ getItem: () => JSON.stringify({ schemaVersion: 1,
      discoveredDestinationIds: [id] }), setItem: () => {} }));
    expect(legacy.explorationSteps(id)).toEqual([0, 1, 2]);
    expect(legacy.unlockedSouvenirIds()).toEqual([id]);
  });
});
