import { expect, it } from 'vitest';
import { ProgressStore } from '../services/storage';

it('welcomes the frog through the collected gem flower without collecting the marsh souvenir', () => {
  let saved = JSON.stringify({ schemaVersion: 1, language: 'fr',
    discoveredDestinationIds: ['jardins_de_gemmes', 'marais_des_lucioles'],
    pendingSouvenirIds: ['jardins_de_gemmes', 'marais_des_lucioles'], welcomedMarshVisitor: true });
  const storage = { getItem: () => saved, setItem: (_: string, value: string) => { saved = value; } };
  const store = new ProgressStore(() => storage);
  expect(store.read().welcomedMarshVisitor).toBeUndefined();
  expect(store.offerGemFlower()).toBe(false);
  for (let i = 0; i < 2; i++) store.touchExploration('jardins_de_gemmes', i);
  const before = store.read();
  expect(store.offerGemFlower()).toBe(true);
  expect(store.offerGemFlower()).toBe(false);
  const restored = new ProgressStore(() => storage);
  expect(restored.read()).toEqual({ ...before, welcomedMarshVisitor: true });
  expect(restored.unlockedSouvenirIds()).toEqual(['jardins_de_gemmes']);
});
