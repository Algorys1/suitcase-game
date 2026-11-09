import { describe, expect, it } from 'vitest';
import { FOREST_STROKE_LENGTH, inForestSnow, snowSegmentLength } from '../domain/forestDrawing';
import { ProgressStore, decodeProgress } from '../services/storage';
import { createSession, beginTravel, revealResult } from '../domain/session';

describe('dessin libre dans la neige', () => {
  it('accepte les traits dans plusieurs directions sans imposer de motif', () => {
    const a = { x: 0.67, y: 0.91 }, b = { x: 0.74, y: 0.95 };
    expect(snowSegmentLength(a, b)).toBeGreaterThan(FOREST_STROKE_LENGTH);
    expect(snowSegmentLength(b, a)).toBe(snowSegmentLength(a, b));
    expect(snowSegmentLength(a, a)).toBe(0);
  });

  it('exclut souche, arbres et segments traversant les bords du chemin', () => {
    expect(inForestSnow({ x: 0.3, y: 0.65 })).toBe(false);
    expect(inForestSnow({ x: 0.2, y: 0.3 })).toBe(false);
    expect(inForestSnow({ x: NaN, y: 0.8 })).toBe(false);
    expect(snowSegmentLength({ x: 0.3, y: 0.65 }, { x: 0.7, y: 0.9 })).toBe(0);
    const a = { x: 0.75, y: 0.95 }, b = { x: 0.75, y: 0.60 };
    expect(inForestSnow(a)).toBe(true); expect(inForestSnow(b)).toBe(true);
    expect(snowSegmentLength(a, b)).toBe(0);
  });

  it('reprend trois gestes successifs et conserve le souvenir sans autre charge', () => {
    let saved: string | null = null;
    const storage = { getItem: () => saved, setItem: (_key: string, value: string) => { saved = value; } };
    const first = new ProgressStore(() => storage);
    first.saveSession(revealResult(beginTravel(createSession(), ['tree', 'snow'])));
    expect(first.explore('foret_du_silence')).toBe(false);
    expect(first.touchExploration('foret_du_silence', 2).activated).toBe(false);
    expect(first.touchExploration('foret_du_silence', 0).collected).toBe(false);
    const next = new ProgressStore(() => storage);
    expect(next.explorationSteps('foret_du_silence')).toEqual([0]);
    expect(next.touchExploration('foret_du_silence', 0).activated).toBe(false);
    expect(next.touchExploration('foret_du_silence', 1).collected).toBe(false);
    expect(next.touchExploration('foret_du_silence', 2).collected).toBe(true);
    expect(next.touchExploration('foret_du_silence', 2).collected).toBe(false);
    expect(next.unlockedSouvenirIds()).toEqual(['foret_du_silence']);
    expect(next.read().expedition?.charges).toBe(9);
  });

  it('valide les gestes successifs et préserve les anciennes plumes', () => {
    expect(decodeProgress(JSON.stringify({ schemaVersion: 1, discoveredDestinationIds: ['foret_du_silence'],
      pendingSouvenirIds: ['foret_du_silence'], pilotSteps: { foret_du_silence: [0, 0, 2, 3, -1, '1'] } }))
      .pilotSteps?.foret_du_silence).toEqual([0]);
    const old = new ProgressStore(() => ({ getItem: () => JSON.stringify({ schemaVersion: 1,
      discoveredDestinationIds: ['foret_du_silence'] }), setItem: () => {} }));
    expect(old.explorationSteps('foret_du_silence')).toEqual([0, 1, 2]);
    expect(old.touchExploration('foret_du_silence', 0).collected).toBe(false);
  });
});
