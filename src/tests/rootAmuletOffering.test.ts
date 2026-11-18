import { expect, it } from 'vitest';
import { ProgressStore } from '../services/storage';

it('welcomes the fennec through the collected amulet without collecting the Empire souvenir', () => {
  let saved = JSON.stringify({ schemaVersion: 1, language: 'fr',
    discoveredDestinationIds: ['temple_oublie', 'empire_des_sables'],
    pendingSouvenirIds: ['temple_oublie', 'empire_des_sables'], welcomedEmpireVisitor: true });
  const storage = { getItem: () => saved, setItem: (_: string, value: string) => { saved = value; } };
  const store = new ProgressStore(() => storage);
  expect(store.read().welcomedEmpireVisitor).toBeUndefined();
  expect(store.offerRootAmulet()).toBe(false);
  for (let i = 0; i < 3; i++) store.touchExploration('temple_oublie', i);
  const before = store.read();
  expect(store.offerRootAmulet()).toBe(true);
  expect(store.offerRootAmulet()).toBe(false);
  const restored = new ProgressStore(() => storage);
  expect(restored.read()).toEqual({ ...before, welcomedEmpireVisitor: true });
  expect(restored.unlockedSouvenirIds()).toEqual(['temple_oublie']);
});
