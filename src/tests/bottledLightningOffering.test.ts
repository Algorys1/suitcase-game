import { expect, it } from 'vitest';
import { ProgressStore } from '../services/storage';

it('welcomes the griffin through the collected bottled lightning without collecting the vestiges souvenir', () => {
  let saved = JSON.stringify({ schemaVersion: 1, language: 'fr',
    discoveredDestinationIds: ['tempete_ecarlate', 'vestiges_celestes'],
    pendingSouvenirIds: ['tempete_ecarlate', 'vestiges_celestes'], welcomedVestigesVisitor: true });
  const storage = { getItem: () => saved, setItem: (_: string, value: string) => { saved = value; } };
  const store = new ProgressStore(() => storage);
  expect(store.read().welcomedVestigesVisitor).toBeUndefined();
  expect(store.offerBottledLightning()).toBe(false);
  for (let i = 0; i < 2; i++) store.touchExploration('tempete_ecarlate', i);
  const before = store.read();
  expect(store.offerBottledLightning()).toBe(true);
  expect(store.offerBottledLightning()).toBe(false);
  const restored = new ProgressStore(() => storage);
  expect(restored.read()).toEqual({ ...before, welcomedVestigesVisitor: true });
  expect(restored.unlockedSouvenirIds()).toEqual(['tempete_ecarlate']);
});
