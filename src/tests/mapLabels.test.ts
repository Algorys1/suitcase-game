import { describe, expect, it } from 'vitest';
import { intersects, placeMapLabel } from '../game/ui/mapLabels';
import type { MapRect } from '../game/ui/mapLabels';

describe('légendes sur le papier de la carte', () => {
  it('déplace une légende hors des paysages sans déplacer les zones réservées', () => {
    const worlds = [{ x: 35, y: 40, width: 75, height: 75 }, { x: 135, y: 40, width: 75, height: 75 }];
    const snapshot = JSON.stringify(worlds);
    const result = placeMapLabel({ x: 40, y: 75, width: 68, height: 24 },
      { x: 10, y: 10, width: 240, height: 180 }, worlds);
    expect(result).toBeDefined();
    expect(worlds.every(world => !intersects(result!, world))).toBe(true);
    expect(JSON.stringify(worlds)).toBe(snapshot);
  });

  it('sépare dix noms et dix vignettes sur une petite feuille', () => {
    const limits = { x: 20, y: 10, width: 280, height: 400 };
    const worlds: MapRect[] = Array.from({ length: 10 }, (_, i) => ({
      x: 28 + i % 3 * 90, y: 15 + Math.floor(i / 3) * 95, width: 46, height: 46,
    }));
    const occupied = [...worlds];
    for (const world of worlds) {
      const caption = placeMapLabel({ x: world.x - 10, y: world.y + world.height + 5, width: 68, height: 26 }, limits, occupied);
      expect(caption).toBeDefined();
      expect(occupied.every(rect => !intersects(caption!, rect))).toBe(true);
      occupied.push(caption!);
    }
  });

  it('ne pose aucune légende dans un espace entièrement occupé', () => {
    const paper = { x: 0, y: 0, width: 100, height: 100 };
    expect(placeMapLabel({ x: 10, y: 10, width: 80, height: 24 }, paper, [paper])).toBeUndefined();
  });
});
