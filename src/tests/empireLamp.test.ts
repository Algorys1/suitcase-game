import { describe, expect, it } from 'vitest';
import { freshLampRub, inLamp, lampBody, lampRubComplete, rubLamp } from '../domain/empireLamp';
import { ProgressStore } from '../services/storage';
import { beginTravel, createSession, revealResult } from '../domain/session';

const id = 'empire_des_sables';
describe('frottement de la lampe de l’Empire', () => {
  it('demande un vrai va-et-vient, sans compter les clics, sauts et mouvements hors lampe', () => {
    const center: { x: number; y: number } = { x: lampBody.x, y: lampBody.y }, right = { x: center.x + 0.045, y: center.y };
    expect(inLamp(center)).toBe(true);
    expect(inLamp({ x: NaN, y: 0 })).toBe(false);
    const empty = freshLampRub();
    expect(rubLamp(empty, center, center)).toBe(empty);
    expect(rubLamp(empty, center, { x: 0, y: 0 })).toBe(empty);
    expect(rubLamp(empty, center, { x: center.x + 0.066, y: center.y })).toBe(empty);
    expect(lampRubComplete(rubLamp(empty, center, right))).toBe(false);
    let state = freshLampRub(), previous = center;
    for (const offset of [0.045, -0.045, 0.045, -0.045, 0.045]) {
      const target = { x: center.x + offset, y: center.y };
      const start = previous;
      for (let i = 1; i <= 8; i++) {
        const next = { x: start.x + (target.x - start.x) * i / 8, y: center.y };
        state = rubLamp(state, previous, next); previous = next;
      }
    }
    expect(state.turns).toBeGreaterThanOrEqual(2);
    expect(lampRubComplete(state)).toBe(true);
    expect(lampRubComplete({ ...state, turns: 0 })).toBe(false);
    expect(lampRubComplete(freshLampRub())).toBe(false);
  });
  it('enregistre la résolution une seule fois, sans débit sur place, et la retrouve au rechargement', () => {
    let saved: string | null = null, writes = 0;
    const storage = { getItem: () => saved, setItem: (_: string, value: string) => { saved = value; writes++; } };
    let store = new ProgressStore(() => storage);
    store.saveSession(revealResult(beginTravel(createSession(), ['palm', 'ruins'])));
    expect(store.explore(id)).toBe(false);
    expect(store.touchExploration(id, 1).activated).toBe(false);
    expect(store.touchExploration(id, 0)).toEqual({ activated: true, complete: true, collected: true });
    const count = writes;
    expect(store.touchExploration(id, 0).collected).toBe(false);
    expect(writes).toBe(count);
    store = new ProgressStore(() => storage);
    expect(store.explorationSteps(id)).toEqual([0]);
    expect(store.unlockedSouvenirIds()).toEqual([id]);
    expect(store.read().expedition?.charges).toBe(9);
  });
  it('préserve les anciennes récompenses et reste jouable sans stockage', () => {
    const old = new ProgressStore(() => ({ getItem: () => JSON.stringify({ schemaVersion: 1,
      discoveredDestinationIds: [id] }), setItem: () => {} }));
    expect(old.explorationSteps(id)).toEqual([0]);
    const store = new ProgressStore(() => { throw new Error('blocked'); });
    expect(store.touchExploration(id, 0).activated).toBe(false);
    store.saveSession(revealResult(beginTravel(createSession(), ['ruins', 'palm'])));
    expect(store.touchExploration(id, 0).collected).toBe(true);
  });
});
