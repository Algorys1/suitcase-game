import { expect, it } from 'vitest';
import { ProgressStore } from '../services/storage';

it('welcomes the dragon through the collected lantern fruit without collecting the kingdom souvenir', () => {
  let saved = JSON.stringify({ schemaVersion: 1, language: 'fr',
    discoveredDestinationIds: ['jungle_incandescente', 'royaume_des_spores_celestes'],
    pendingSouvenirIds: ['jungle_incandescente', 'royaume_des_spores_celestes'], welcomedKingdomVisitor: true });
  const storage = { getItem: () => saved, setItem: (_: string, value: string) => { saved = value; } };
  const store = new ProgressStore(() => storage);
  expect(store.read().welcomedKingdomVisitor).toBeUndefined();
  expect(store.offerLanternFruit()).toBe(false);
  for (let i = 0; i < 2; i++) store.touchExploration('jungle_incandescente', i);
  const before = store.read();
  expect(store.offerLanternFruit()).toBe(true);
  expect(store.offerLanternFruit()).toBe(false);
  const restored = new ProgressStore(() => storage);
  expect(restored.read()).toEqual({ ...before, welcomedKingdomVisitor: true });
  expect(restored.unlockedSouvenirIds()).toEqual(['jungle_incandescente']);
});
