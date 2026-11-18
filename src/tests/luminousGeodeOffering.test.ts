import { expect, it } from 'vitest';
import { ProgressStore } from '../services/storage';

it('welcomes the octopus through the collected geode without collecting the Reef souvenir', () => {
  let saved = JSON.stringify({ schemaVersion: 1, language: 'fr',
    discoveredDestinationIds: ['grottes_sporiferes', 'recif_de_verre'],
    pendingSouvenirIds: ['grottes_sporiferes', 'recif_de_verre'], welcomedReefVisitor: true });
  const storage = { getItem: () => saved, setItem: (_: string, value: string) => { saved = value; } };
  const store = new ProgressStore(() => storage);
  expect(store.read().welcomedReefVisitor).toBeUndefined();
  expect(store.offerLuminousGeode()).toBe(false);
  for (let i = 0; i < 3; i++) store.touchExploration('grottes_sporiferes', i);
  const before = store.read();
  expect(store.offerLuminousGeode()).toBe(true);
  expect(store.offerLuminousGeode()).toBe(false);
  const restored = new ProgressStore(() => storage);
  expect(restored.read()).toEqual({ ...before, welcomedReefVisitor: true });
  expect(restored.unlockedSouvenirIds()).toEqual(['grottes_sporiferes']);
});
