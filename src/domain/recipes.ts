import catalogue from '../data/destinations.json';
import { isElementId } from './preparation';
import type { ElementId } from './preparation';

export type Destination = {
  id: string;
  elements: readonly [ElementId, ElementId];
  titleKey: string;
  storyKey: string;
  image: string;
};

export function recipeKey(first: string, second: string): string {
  return [first, second].sort().join('|');
}

export const destinations: readonly Destination[] = catalogue.map(entry => {
  const [first, second] = entry.elements;
  if (entry.elements.length !== 2 || !isElementId(first) || !isElementId(second) || first === second) {
    throw new Error(`Invalid recipe: ${entry.id}`);
  }
  return { ...entry, elements: [first, second] };
});

const recipes = new Map<string, Destination>();
const ids = new Set<string>();
for (const destination of destinations) {
  const key = recipeKey(...destination.elements);
  if (ids.has(destination.id) || recipes.has(key)) throw new Error(`Duplicate destination or recipe: ${destination.id}`);
  ids.add(destination.id);
  recipes.set(key, destination);
}
if (destinations.length !== 30) throw new Error('Expected 30 destinations');

/** null denotes the Void. Invalid selections are rejected before travelling. */
export function resolveRecipe(first: string, second: string): Destination | null {
  return recipes.get(recipeKey(first, second)) ?? null;
}

export function destinationById(id: string): Destination | undefined {
  return destinations.find(destination => destination.id === id);
}
