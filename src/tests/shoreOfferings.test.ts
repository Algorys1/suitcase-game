import { expect, it } from 'vitest';
import { ProgressStore } from '../services/storage';

it.each([
  ['recif_de_verre', 'archipel_azur', 'welcomedIslandVisitor'],
  ['jardins_du_zenith', 'ile_des_cendres', 'welcomedAshVisitor'],
  ['sylve_prismatique', 'desert_de_cristal', 'welcomedDesertVisitor'],
] as const)('accepts %s in %s without resolving its local activity', (souvenir, world, welcomed) => {
  let saved = JSON.stringify({ schemaVersion: 1, language: 'fr',
    discoveredDestinationIds: [souvenir, world], pendingSouvenirIds: [world] });
  const storage = { getItem: () => saved, setItem: (_: string, value: string) => { saved = value; } };
  const store = new ProgressStore(() => storage);
  const before = store.read();

  expect(store.hasAvailableOffering()).toBe(true);
  expect(store.offerSouvenir(souvenir, 'mycelia')).toBe(false);
  expect(store.offerSouvenir(souvenir, world)).toBe(true);
  expect(store.offerSouvenir(souvenir, world)).toBe(false);
  const restored = new ProgressStore(() => storage);
  expect(restored.read()).toEqual({ ...before, [welcomed]: true });
  expect(restored.unlockedSouvenirIds()).toEqual([souvenir]);
});
