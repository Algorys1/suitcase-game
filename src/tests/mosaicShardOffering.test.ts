import { expect, it } from 'vitest';
import { ProgressStore } from '../services/storage';

it('welcomes the axolotl only after the mosaic shard is collected', () => {
  let saved = JSON.stringify({ schemaVersion: 1, language: 'fr',
    discoveredDestinationIds: ['vestiges_celestes', 'ruines_englouties'],
    pendingSouvenirIds: ['vestiges_celestes', 'ruines_englouties'], welcomedRuinsVisitor: true });
  const storage = { getItem: () => saved, setItem: (_: string, value: string) => { saved = value; } };
  const store = new ProgressStore(() => storage);
  expect(store.read().welcomedRuinsVisitor).toBeUndefined();
  expect(store.offerSouvenir('vestiges_celestes', 'ruines_englouties')).toBe(false);
  for (let i = 0; i < 3; i++) store.touchExploration('vestiges_celestes', i);
  const before = store.read();
  expect(store.offerSouvenir('vestiges_celestes', 'ruines_englouties')).toBe(true);
  expect(store.offerSouvenir('vestiges_celestes', 'ruines_englouties')).toBe(false);
  const restored = new ProgressStore(() => storage);
  expect(restored.read()).toEqual({ ...before, welcomedRuinsVisitor: true });
  expect(restored.unlockedSouvenirIds()).toEqual(['vestiges_celestes']);
});
