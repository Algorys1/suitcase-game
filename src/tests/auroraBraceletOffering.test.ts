import { expect, it } from 'vitest';
import { ProgressStore } from '../services/storage';

it('welcomes the yeti through the collected aurora bracelet without collecting the palace souvenir', () => {
  let saved = JSON.stringify({ schemaVersion: 1, language: 'fr',
    discoveredDestinationIds: ['atoll_boreal', 'palais_de_givre'],
    pendingSouvenirIds: ['atoll_boreal', 'palais_de_givre'], welcomedPalaceVisitor: true });
  const storage = { getItem: () => saved, setItem: (_: string, value: string) => { saved = value; } };
  const store = new ProgressStore(() => storage);
  expect(store.read().welcomedPalaceVisitor).toBeUndefined();
  expect(store.offerAuroraBracelet()).toBe(false);
  for (let i = 0; i < 2; i++) store.touchExploration('atoll_boreal', i);
  const before = store.read();
  expect(store.offerAuroraBracelet()).toBe(true);
  expect(store.offerAuroraBracelet()).toBe(false);
  const restored = new ProgressStore(() => storage);
  expect(restored.read()).toEqual({ ...before, welcomedPalaceVisitor: true });
  expect(restored.unlockedSouvenirIds()).toEqual(['atoll_boreal']);
});
