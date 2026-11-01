import { describe, expect, it } from 'vitest';
import elements from '../data/elements.json';
import destinations from '../data/destinations.json';

// Guard the supplied catalogue without implementing recipe resolution yet.
describe('catalogue de référence', () => {
  it('conserve 10 éléments et 30 destinations avec des identifiants uniques', () => {
    expect(elements).toHaveLength(10);
    expect(new Set(elements.map(({ id }) => id)).size).toBe(10);
    expect(destinations).toHaveLength(30);
    expect(new Set(destinations.map(({ id }) => id)).size).toBe(30);
  });

  it('ne contient que des paires uniques de deux éléments distincts et connus', () => {
    const knownIds = new Set(elements.map(({ id }) => id));
    const pairs = destinations.map(({ elements: pair }) => {
      expect(pair).toHaveLength(2);
      expect(new Set(pair).size).toBe(2);
      for (const id of pair) expect(knownIds.has(id)).toBe(true);
      return [...pair].sort().join('|');
    });
    expect(new Set(pairs).size).toBe(30);
  });
});
