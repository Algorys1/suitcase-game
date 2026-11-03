import { describe, expect, it } from 'vitest';
import elements from '../data/elements.json';
import destinations from '../data/destinations.json';
import fr from '../data/fr.json';
import en from '../data/en.json';

const illustrations = import.meta.glob('../../public/assets/destinations/*.webp', {
  eager: true, query: '?url', import: 'default',
});

describe('catalogue de référence', () => {
  it('livre une illustration et des textes FR/EN complets pour les 30 destinations', () => {
    for (const destination of destinations) {
      expect(illustrations).toHaveProperty(`../../public/${destination.image}`);
      for (const catalogue of [fr, en]) {
        const content = catalogue.destinations[destination.id as keyof typeof catalogue.destinations];
        expect(content.title.trim().length).toBeGreaterThan(0);
        expect(content.story.trim().length).toBeGreaterThan(40);
        expect(content.title + content.story).not.toMatch(/provisoire|pending|à écrire|placeholder/i);
      }
    }
  });

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
