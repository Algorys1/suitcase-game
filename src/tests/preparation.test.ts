import { describe, expect, it } from 'vitest';
import elements from '../data/elements.json';
import fr from '../data/fr.json';
import en from '../data/en.json';
import { emptySlots, isElementId, isReady, placeElement, removeElement } from '../domain/preparation';
import type { ElementId, Slots } from '../domain/preparation';

describe('préparation de la valise', () => {
  it('démarre avec exactement deux emplacements vides indépendants', () => {
    expect(emptySlots()).toEqual([null, null]);
    expect(emptySlots()).not.toBe(emptySlots());
    expect(isReady(emptySlots())).toBe(false);
  });

  it('accepte les 45 paires distinctes dans les deux ordres', () => {
    let count = 0;
    for (const [index, first] of elements.entries()) {
      for (const second of elements.slice(index + 1)) {
        for (const [a, b] of [[first.id, second.id], [second.id, first.id]]) {
          if (a === undefined || b === undefined) throw new Error('Missing test pair');
          const firstPlacement = placeElement(emptySlots(), 0, a);
          expect(firstPlacement.ok).toBe(true);
          expect(isReady(firstPlacement.slots)).toBe(false);
          const secondPlacement = placeElement(firstPlacement.slots, 1, b);
          expect(secondPlacement.ok).toBe(true);
          expect(isReady(secondPlacement.slots)).toBe(true);
          expect(secondPlacement.slots).toEqual([a, b]);
        }
        count++;
      }
    }
    expect(count).toBe(45);
  });

  it('refuse chaque doublon sans modifier la valise, même lors d’un remplacement', () => {
    for (const { id } of elements) {
      const first = placeElement(emptySlots(), 0, id).slots;
      expect(placeElement(first, 1, id)).toEqual({ ok: false, reason: 'duplicate', slots: first });
    }
    const full: Slots = ['water', 'palm'];
    expect(placeElement(full, 0, 'palm')).toEqual({ ok: false, reason: 'duplicate', slots: full });
    expect(isReady(['water', 'water'])).toBe(false);
  });

  it('remplace et retire un élément sans muter l’état précédent', () => {
    const before: Slots = Object.freeze(['water', 'palm']);
    const replaced = placeElement(before, 0, 'fire');
    expect(replaced.slots).toEqual(['fire', 'palm']);
    expect(before).toEqual(['water', 'palm']);
    const removed = removeElement(replaced.slots, 1);
    expect(removed).toEqual(['fire', null]);
    expect(isReady(removed)).toBe(false);
    expect(removeElement(removed, 0)).toEqual([null, null]);
    expect(removeElement(emptySlots(), 1)).toEqual([null, null]);
  });

  it('refuse les éléments inconnus', () => {
    const before = emptySlots();
    expect(placeElement(before, 0, 'unknown')).toEqual({ ok: false, reason: 'unknown', slots: before });
    for (const value of [null, undefined, '', 42, {}, 'WATER']) expect(isElementId(value)).toBe(false);
  });

  it('dispose des noms FR/EN pour chaque ID et respecte les clés du catalogue', () => {
    const names: Record<ElementId, { name: string }> = fr.elements;
    expect(Object.keys(names).sort()).toEqual(elements.map(({ id }) => id).sort());
    expect(Object.keys(en.elements).sort()).toEqual(Object.keys(names).sort());
    for (const { id, nameKey } of elements) {
      if (!isElementId(id)) throw new Error(`Unknown element: ${id}`);
      expect(nameKey).toBe(`elements.${id}.name`);
      expect(fr.elements[id].name.length).toBeGreaterThan(0);
      expect(en.elements[id].name.length).toBeGreaterThan(0);
    }
  });
});
