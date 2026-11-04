import { describe, expect, it } from 'vitest';
import { activateTarget, explorationComplete, pilotTargetCounts, pilotTargets, validSteps } from '../domain/pilotExploration';
import { beginTravel, continueSession, createSession, revealResult } from '../domain/session';
import { decodeProgress, ProgressStore } from '../services/storage';

const memory = () => {
  const values = new Map<string, string>();
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
};

describe('exploration des fenêtres et des sommets', () => {
  it('attend trois pics ou cinq fenêtres distincts, dans un ordre libre', () => {
    for (const id of ['cimes_eternelles', 'mycelia'] as const) {
      expect(pilotTargets[id]).toHaveLength(pilotTargetCounts[id]);
      let steps: number[] = [];
      for (let index = pilotTargetCounts[id] - 1; index >= 0; index--) {
        expect(explorationComplete(id, steps)).toBe(false);
        steps = activateTarget(id, steps, index);
        expect(activateTarget(id, steps, index)).toEqual(steps);
      }
      expect(explorationComplete(id, steps)).toBe(true);
    }
    expect(validSteps('mycelia', [0, 0, -1, 5, 2.5, '1', null, 4])).toEqual([0, 4]);
  });

  it('garde une progression partielle après rechargement et ne débloque pas le souvenir trop tôt', () => {
    const storage = memory();
    const first = new ProgressStore(() => storage);
    first.saveSession(revealResult(beginTravel(createSession(), ['rock', 'snow'])));
    expect(first.explore('cimes_eternelles')).toBe(false);
    first.touchExploration('cimes_eternelles', 2);
    const next = new ProgressStore(() => storage);
    expect(next.explorationSteps('cimes_eternelles')).toEqual([2]);
    expect(next.touchExploration('cimes_eternelles', 2).activated).toBe(false);
    expect(next.unlockedSouvenirIds()).toEqual([]);
    next.touchExploration('cimes_eternelles', 0);
    expect(next.touchExploration('cimes_eternelles', 1)).toEqual({ activated: true, complete: true, collected: true });
    expect(new ProgressStore(() => storage).unlockedSouvenirIds()).toEqual(['cimes_eternelles']);
    expect(next.read().expedition?.charges).toBe(9);
  });

  it('les cinq fenêtres sont nécessaires même après une offrande, sans récompense répétée', () => {
    const store = new ProgressStore(memory);
    const cimes = revealResult(beginTravel(createSession(), ['rock', 'snow']));
    store.saveSession(cimes);
    for (let i = 0; i < 3; i++) store.touchExploration('cimes_eternelles', i);
    store.saveSession(revealResult(beginTravel(continueSession(cimes), ['tree', 'mushroom'])));
    expect(store.offerBell()).toBe(true);
    for (const index of [4, 2, 0, 1]) expect(store.touchExploration('mycelia', index).collected).toBe(false);
    expect(store.unlockedSouvenirIds()).toEqual(['cimes_eternelles']);
    expect(store.touchExploration('mycelia', 3).collected).toBe(true);
    expect(store.touchExploration('mycelia', 3).collected).toBe(false);
    expect(store.read().discoveredDestinationIds).toEqual(['cimes_eternelles', 'mycelia']);
    expect(store.read().expedition?.charges).toBe(8);
  });

  it('ignore les étapes corrompues, les lieux inconnus et les lieux non découverts', () => {
    const saved = decodeProgress(JSON.stringify({ schemaVersion: 1, language: 'en', discoveredDestinationIds: ['mycelia'],
      pendingSouvenirIds: ['mycelia'], pilotSteps: { mycelia: [4, 0, 0, -1, 5, 1.2], cimes_eternelles: [0, 1, 2], unknown: [1] } }));
    expect(saved.pilotSteps).toEqual({ mycelia: [0, 4] });
    expect(saved.pendingSouvenirIds).toEqual(['mycelia']);
    const store = new ProgressStore(memory);
    expect(store.touchExploration('mycelia', 0)).toEqual({ activated: false, complete: false, collected: false });
  });

  it('préserve les anciennes collections et ne partage pas les tableaux sauvegardés', () => {
    const legacy = new ProgressStore(() => ({ getItem: () => JSON.stringify({ schemaVersion: 1,
      discoveredDestinationIds: ['cimes_eternelles'], language: 'fr' }), setItem: () => {} }));
    expect(legacy.explorationSteps('cimes_eternelles')).toEqual([0, 1, 2]);
    expect(legacy.touchExploration('cimes_eternelles', 1).collected).toBe(false);
    const store = new ProgressStore(memory);
    store.saveSession(revealResult(beginTravel(createSession(), ['rock', 'snow'])));
    store.touchExploration('cimes_eternelles', 1);
    store.read().pilotSteps!.cimes_eternelles!.push(0, 2);
    expect(store.explorationSteps('cimes_eternelles')).toEqual([1]);
  });

  it('fonctionne aussi sans stockage et conserve la langue et les charges', () => {
    const store = new ProgressStore(() => { throw Error('Denied'); });
    store.saveSession(revealResult(beginTravel(createSession(), ['tree', 'mushroom'])));
    store.setLanguage('en');
    for (let i = 0; i < 5; i++) store.touchExploration('mycelia', i);
    expect(store.persistent).toBe(false);
    expect(store.unlockedSouvenirIds()).toEqual(['mycelia']);
    expect(store.read().language).toBe('en');
    expect(store.read().expedition?.charges).toBe(9);
  });
});
