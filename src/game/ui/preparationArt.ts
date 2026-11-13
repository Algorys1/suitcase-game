import Phaser from 'phaser';
import elements from '../../data/elements.json';
import type { ElementId } from '../../domain/preparation';

/** The catalogue owns the element paths; UI-only objects have separate textures. */
export function preloadPreparationArt(scene: Phaser.Scene): void {
  for (const state of ['full', 'empty']) {
    const key = `preparation-metal-charge-${state}`;
    if (!scene.textures.exists(key)) scene.load.svg(key,
      `${import.meta.env.BASE_URL}assets/preparation/charge-${state}.svg`, { width: 96, height: 96 });
  }
  for (const element of elements) {
    const glyph = `preparation-glyph-${element.id}`;
    if (!scene.textures.exists(glyph)) scene.load.image(glyph,
      `${import.meta.env.BASE_URL}assets/preparation/glyphs/${element.id}.webp`);
  }
  for (const id of ['suitcase_closed', 'needle_teal', 'needle_violet', 'travel_desk',
    'suitcase_compass']) {
    const key = `preparation-${id}`;
    if (!scene.textures.exists(key)) scene.load.image(key, `${import.meta.env.BASE_URL}assets/preparation/${id}.webp`);
  }
}

export function preloadElementArt(scene: Phaser.Scene, ids?: readonly string[]): void {
  for (const element of elements) {
    if (ids && !ids.includes(element.id)) continue;
    const key = `preparation-element-${element.id}`;
    if (!scene.textures.exists(key)) scene.load.image(key, `${import.meta.env.BASE_URL}${element.image}`);
  }
}

/** Painted illuminated signs, shared by the lid and its two magical projections. */
export function drawElementGlyph(scene: Phaser.Scene, id: ElementId, x: number, y: number, size: number) {
  const key = `preparation-glyph-${id}`;
  if (!scene.textures.exists(key)) return drawElement(scene, id, x, y, size);
  const image = scene.add.image(x, y, key);
  image.setScale(Math.min(size / image.width, size / image.height));
  return image;
}

/** Original catalogue illustrations, still used beside the worlds on the route. */
export function drawElement(scene: Phaser.Scene, id: ElementId, x: number, y: number, size: number) {
  const key = `preparation-element-${id}`;
  if (!scene.textures.exists(key)) return undefined;
  const image = scene.add.image(x, y, key);
  image.setScale(Math.min(size / image.width, size / image.height));
  return image;
}

export function drawPreparationDesk(scene: Phaser.Scene, width: number, height: number): void {
  if (scene.textures.exists('preparation-travel_desk')) {
    // Cover without stretching; keep the map at the left edge in portrait.
    const portrait = width < 600;
    const image = scene.add.image(portrait ? 0 : width / 2, height / 2, 'preparation-travel_desk')
      .setOrigin(portrait ? 0 : 0.5, 0.5).setName('preparation-desk');
    image.setScale(Math.max(width / image.width, height / image.height));
    return;
  }
  // Warm, readable fallback if the illustrated table is unavailable.
  const desk = scene.add.graphics().setName('preparation-desk');
  desk.fillStyle(0xead5b6).fillRect(0, 0, width, height);
  desk.fillStyle(0xfff5df, 0.25).fillEllipse(width * 0.35, height * 0.42, width * 1.1, height * 1.2);
  // Fixed speckles suggest cloth without shimmering when a needle is dragged.
  for (let i = 0; i < 420; i++) {
    const x = (i * 127 + i * i * 13) % width;
    const y = (i * 79 + i * i * 7) % height;
    desk.fillStyle(i % 2 ? 0xfff4df : 0x79543f, 0.045).fillRect(x, y, 2, 1);
  }
  desk.lineStyle(1, 0xc6a46d, 0.22).strokeRoundedRect(6, 6, width - 12, height - 12, 12);
}
