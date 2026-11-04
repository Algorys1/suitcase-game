import { describe, expect, it } from 'vitest';
import { activityComplete, actOnWorld, decodeActivity } from '../domain/worldActivities';
import { beginTravel, createSession, revealResult } from '../domain/session';
import { decodeProgress, ProgressStore } from '../services/storage';

const memory = () => {
  let value: string | null = null;
  return { getItem: () => value, setItem: (_key: string, next: string) => { value = next; } };
};

describe('gestes des trois nouvelles escales', () => {
  it('dégage deux rigoles différentes et ne confond pas un autre geste avec un galet déplacé', () => {
    const empty = decodeActivity('archipel_azur', null);
    const first = actOnWorld('archipel_azur', empty, { type: 'move', index: 1 });
    expect(activityComplete('archipel_azur', first)).toBe(false);
    expect(actOnWorld('archipel_azur', first, { type: 'move', index: 1 })).toEqual(first);
    expect(actOnWorld('archipel_azur', first, { type: 'join', index: 0 })).toEqual(first);
    expect(activityComplete('archipel_azur', actOnWorld('archipel_azur', first, { type: 'move', index: 0 }))).toBe(true);
    expect(empty.moved).toEqual([]);
  });

  it('fait tourner le prisme dans les deux sens, reboucle et garde la réussite acquise', () => {
    const initial = decodeActivity('sylve_prismatique', null);
    let state = actOnWorld('sylve_prismatique', initial, { type: 'rotate', direction: -1 });
    expect(state.orientation).toBe(5);
    state = actOnWorld('sylve_prismatique', state, { type: 'rotate', direction: 1 });
    expect(state).toEqual(initial);
    for (let i = 0; i < 2; i++) state = actOnWorld('sylve_prismatique', state, { type: 'rotate', direction: 1 });
    expect(activityComplete('sylve_prismatique', state)).toBe(false);
    state = actOnWorld('sylve_prismatique', state, { type: 'rotate', direction: 1 });
    expect(activityComplete('sylve_prismatique', state)).toBe(true);
    expect(actOnWorld('sylve_prismatique', state, { type: 'rotate', direction: -1 })).toEqual(state);
  });

  it('exige les deux rubans distincts, dans un ordre libre', () => {
    for (const order of [[0, 1], [1, 0]]) {
      let state = decodeActivity('faille_des_contraires', null);
      state = actOnWorld('faille_des_contraires', state, { type: 'join', index: order[0]! });
      expect(activityComplete('faille_des_contraires', state)).toBe(false);
      expect(actOnWorld('faille_des_contraires', state, { type: 'join', index: 8 })).toEqual(state);
      expect(activityComplete('faille_des_contraires', actOnWorld('faille_des_contraires', state,
        { type: 'join', index: order[1]! }))).toBe(true);
    }
  });

  it('reprend les gestes partiels après rechargement et attribue une seule fois le souvenir sans charge', () => {
    const storage = memory();
    const store = new ProgressStore(() => storage);
    store.saveSession(revealResult(beginTravel(createSession(), ['water', 'palm'])));
    expect(store.explore('archipel_azur')).toBe(false);
    expect(store.act('archipel_azur', { type: 'move', index: 0 }).collected).toBe(false);
    const reloaded = new ProgressStore(() => storage);
    expect(reloaded.activityState('archipel_azur').moved).toEqual([0]);
    expect(reloaded.act('archipel_azur', { type: 'move', index: 1 }).collected).toBe(true);
    expect(reloaded.act('archipel_azur', { type: 'move', index: 1 }).collected).toBe(false);
    expect(reloaded.unlockedSouvenirIds()).toEqual(['archipel_azur']);
    expect(reloaded.read().expedition?.charges).toBe(9);
    reloaded.read().activities!.archipel_azur!.moved.pop();
    expect(reloaded.activityState('archipel_azur').moved).toEqual([0, 1]);
  });

  it('filtre les états malformés et les lieux non découverts sans perdre les anciennes collections', () => {
    const saved = decodeProgress(JSON.stringify({ schemaVersion: 1, language: 'en',
      discoveredDestinationIds: ['sylve_prismatique', 'archipel_azur'], pendingSouvenirIds: ['sylve_prismatique', 'archipel_azur'],
      activities: { sylve_prismatique: { orientation: 6 }, archipel_azur: { moved: [1, 1, -1, 0, 0.5, '0'] },
        faille_des_contraires: { moved: [0, 1] }, unknown: {} } }));
    expect(saved.activities).toEqual({ sylve_prismatique: { moved: [], orientation: 0 }, archipel_azur: { moved: [0, 1], orientation: 0 } });
    expect(saved.pendingSouvenirIds).toEqual(['sylve_prismatique']);
    const legacy = new ProgressStore(() => ({ getItem: () => JSON.stringify({ schemaVersion: 1,
      discoveredDestinationIds: ['archipel_azur', 'sylve_prismatique', 'faille_des_contraires'] }), setItem: () => {} }));
    for (const id of ['archipel_azur', 'sylve_prismatique', 'faille_des_contraires'] as const)
      expect(activityComplete(id, legacy.activityState(id))).toBe(true);
    expect(new ProgressStore(memory).act('sylve_prismatique', { type: 'rotate', direction: 1 }))
      .toEqual({ changed: false, collected: false });
  });

  it('termine le prisme même si le navigateur bloque la sauvegarde', () => {
    const store = new ProgressStore(() => { throw Error('blocked'); });
    store.setLanguage('en');
    store.saveSession(revealResult(beginTravel(createSession(), ['tree', 'crystal'])));
    for (let i = 0; i < 3; i++) store.act('sylve_prismatique', { type: 'rotate', direction: 1 });
    expect(store.unlockedSouvenirIds()).toEqual(['sylve_prismatique']);
    expect(store.read().language).toBe('en');
    expect(store.read().expedition?.charges).toBe(9);
    expect(store.persistent).toBe(false);
  });
});
