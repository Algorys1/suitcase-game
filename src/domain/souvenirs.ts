import definitions from '../data/souvenirs.json';

export type Souvenir = { destinationId: string; image: string; nameKey: string };
export const souvenirs: readonly Souvenir[] = definitions;

/** Artwork attached to a discovered place; exploration controls its revealed state in the UI. */
export function souvenirForDestination(id: string | null, discoveredIds: readonly string[]): Souvenir | undefined {
  if (id === null || !discoveredIds.includes(id)) return undefined;
  return souvenirs.find(souvenir => souvenir.destinationId === id);
}
