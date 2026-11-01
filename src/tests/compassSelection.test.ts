import { describe, expect, it } from 'vitest';
import catalogue from '../data/elements.json';
import fr from '../data/fr.json';
import en from '../data/en.json';
import { compassAngle, compassElements, COMPASS_STEP_DEGREES, initialCompassSelection, rotateSelection } from '../domain/compassSelection';
import { emptySlots, isReady, selectElement } from '../domain/preparation';
import type { Slots } from '../domain/preparation';

describe('boussole de sélection', () => {
  it('suit les dix éléments du catalogue, par crans de 36° depuis le haut', () => {
    expect(compassElements).toEqual(catalogue.map(({ id }) => id));
    expect(COMPASS_STEP_DEGREES).toBe(36);
    expect(compassElements.map(compassAngle)).toEqual([0, 36, 72, 108, 144, 180, 216, 252, 288, 324]);
  });

  it('repart toujours sur Arbre / Arbre, sans autoriser de départ', () => {
    const initial = initialCompassSelection();
    expect(initial).toEqual(['tree', 'tree']);
    expect(isReady(initial)).toBe(false);
    const modified = rotateSelection(initial, 0, 1);
    expect(modified).toEqual(['mushroom', 'tree']);
    expect(initialCompassSelection()).toEqual(initial);
    expect(initialCompassSelection()).not.toBe(initial);
  });

  it('fait un tour complet dans les deux sens sans modifier l’autre aiguille ni l’état initial', () => {
    for (const needle of [0, 1] as const) {
      for (const direction of [-1, 1] as const) {
        const original: Slots = Object.freeze(['tree', 'tree']);
        let selection = original;
        const visited = new Set();
        for (let step = 0; step < 10; step++) {
          selection = rotateSelection(selection, needle, direction);
          visited.add(selection[needle]);
          expect(selection[needle === 0 ? 1 : 0]).toBe('tree');
        }
        expect(visited.size).toBe(10);
        expect(selection).toEqual(original);
        expect(original).toEqual(['tree', 'tree']);
      }
    }
    expect(rotateSelection(['crystal', 'tree'], 0, 1)).toEqual(['tree', 'tree']);
    expect(rotateSelection(['tree', 'water'], 0, -1)).toEqual(['crystal', 'water']);
  });

  it('atteint les 100 états du cadran : 45 paires non ordonnées valides et 10 doublons invalides', () => {
    const pairs = new Set<string>();
    let invalid = 0;
    let selection = initialCompassSelection();
    for (let first = 0; first < 10; first++) {
      for (let second = 0; second < 10; second++) {
        if (isReady(selection)) pairs.add([...selection].sort().join('|'));
        else invalid++;
        expect(isReady(selection)).toBe(selection[0] !== selection[1]);
        selection = rotateSelection(selection, 1, 1);
      }
      selection = rotateSelection(selection, 0, 1);
    }
    expect(pairs.size).toBe(45);
    expect(invalid).toBe(10);
  });

  it('partage la sélection avec la palette et reflète les doublons sans masquer les choix', () => {
    const fromPalette = selectElement(initialCompassSelection(), 0, 'water');
    expect(fromPalette).toEqual(['water', 'tree']);
    expect(isReady(fromPalette)).toBe(true);
    const fromNeedle = rotateSelection(fromPalette, 0, -1);
    expect(fromNeedle).toEqual(['mushroom', 'tree']);
    const duplicate = selectElement(fromNeedle, 1, 'mushroom');
    expect(duplicate).toEqual(['mushroom', 'mushroom']);
    expect(isReady(duplicate)).toBe(false);
    expect(isReady(rotateSelection(duplicate, 1, 1))).toBe(true);
  });

  it('conserve le verrouillage des départs incomplets si un emplacement est vide', () => {
    expect(isReady(emptySlots())).toBe(false);
    expect(rotateSelection(emptySlots(), 0, 1)).toEqual(['tree', null]);
    expect(rotateSelection(emptySlots(), 1, -1)).toEqual([null, 'crystal']);
    expect(isReady(rotateSelection(emptySlots(), 0, 1))).toBe(false);
  });

  it('fournit les mêmes libellés de commandes en FR et EN', () => {
    const english: typeof fr.compass = en.compass;
    expect(Object.keys(english).sort()).toEqual(Object.keys(fr.compass).sort());
    for (const value of Object.values(english)) expect(value.trim()).not.toBe('');
  });
});
