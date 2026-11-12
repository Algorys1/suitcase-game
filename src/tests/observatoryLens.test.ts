import { describe, expect, it } from 'vitest';
import { canCaptureSky, lensProximity, lensSky, lensStand, overLensStand } from '../domain/observatoryLens';
import { activateTarget } from '../domain/pilotExploration';
import { ProgressStore, decodeProgress } from '../services/storage';
import { beginTravel, createSession, revealResult } from '../domain/session';

const id = 'observatoire_des_etoiles';
describe('lentille de l’Observatoire', () => {
  it('révèle les reflets progressivement près du groupe et les capture dans une zone tolérante', () => {
    expect(lensProximity(lensSky.x, lensSky.y)).toBe(1);
    expect(lensProximity(lensSky.x + 0.10, lensSky.y)).toBeGreaterThan(0);
    expect(lensProximity(lensSky.x + 0.10, lensSky.y)).toBeLessThan(1);
    expect(canCaptureSky(lensSky.x + 0.05, lensSky.y)).toBe(true);
    expect(canCaptureSky(lensSky.x + 0.10, lensSky.y)).toBe(false);
    expect(canCaptureSky(lensStand.x, lensStand.y)).toBe(false);
    expect(lensProximity(lensStand.x, lensStand.y)).toBe(0);
    expect(lensProximity(NaN, 0)).toBe(0);
    expect(canCaptureSky(Infinity, 0)).toBe(false);
    expect(overLensStand(lensStand.x, lensStand.y)).toBe(true);
    expect(overLensStand(lensSky.x, lensSky.y)).toBe(false);
    expect(overLensStand(0, NaN)).toBe(false);
  });
  it('interdit le retour avant la capture et récupère une sauvegarde partielle invalide', () => {
    expect(activateTarget(id, [], 1)).toEqual([]);
    expect(decodeProgress(JSON.stringify({ schemaVersion: 1, discoveredDestinationIds: [id],
      pendingSouvenirIds: [id], pilotSteps: { [id]: [1, 1, -1, '0'] } })).pilotSteps?.[id] ?? []).toEqual([]);
  });
  it('sauvegarde la capture séparément, la reprend et ne collecte qu’au retour sur le support', () => {
    let saved: string | null = null, writes = 0;
    const storage = { getItem: () => saved, setItem: (_: string, value: string) => { saved = value; writes++; } };
    let store = new ProgressStore(() => storage);
    store.setLanguage('en');
    store.saveSession(revealResult(beginTravel(createSession(), ['cloud', 'crystal'])));
    expect(store.explore(id)).toBe(false);
    expect(store.touchExploration(id, 1).activated).toBe(false);
    expect(store.touchExploration(id, 0)).toEqual({ activated: true, complete: false, collected: false });
    store = new ProgressStore(() => storage);
    expect(store.explorationSteps(id)).toEqual([0]);
    expect(store.unlockedSouvenirIds()).toEqual([]);
    expect(store.touchExploration(id, 1)).toEqual({ activated: true, complete: true, collected: true });
    const count = writes;
    expect(store.touchExploration(id, 1).collected).toBe(false);
    expect(writes).toBe(count);
    expect(store.read().expedition?.charges).toBe(9);
    expect(store.read().language).toBe('en');
    expect(store.unlockedSouvenirIds()).toEqual([id]);
  });
  it('préserve les anciennes récompenses et fonctionne sans stockage', () => {
    const old = new ProgressStore(() => ({ getItem: () => JSON.stringify({ schemaVersion: 1,
      discoveredDestinationIds: [id] }), setItem: () => {} }));
    expect(old.explorationSteps(id)).toEqual([0, 1]);
    const store = new ProgressStore(() => { throw new Error('blocked'); });
    store.saveSession(revealResult(beginTravel(createSession(), ['crystal', 'cloud'])));
    expect(store.touchExploration(id, 0).activated).toBe(true);
    expect(store.touchExploration(id, 1).collected).toBe(true);
  });
});
