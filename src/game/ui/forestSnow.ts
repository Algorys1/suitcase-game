import Phaser from 'phaser';
import { reducedMotion } from './adventureMap';
import { FOREST_STROKE_LENGTH, inForestSnow, snowSegmentLength } from '../../domain/forestDrawing';
import type { SnowPoint } from '../../domain/forestDrawing';
import type { WorldFrame } from './pilotWorlds';

const animalTrail: readonly SnowPoint[] = [
  { x: 0.76, y: 0.95 }, { x: 0.77, y: 0.90 }, { x: 0.73, y: 0.85 },
  { x: 0.67, y: 0.81 }, { x: 0.60, y: 0.78 }, { x: 0.54, y: 0.75 },
  { x: 0.55, y: 0.72 }, { x: 0.60, y: 0.69 }, { x: 0.66, y: 0.66 },
  { x: 0.71, y: 0.63 }, { x: 0.74, y: 0.60 }, { x: 0.75, y: 0.58 },
];

function paw(scene: Phaser.Scene, art: WorldFrame, x: number, y: number, scale = 1) {
  const g = scene.add.graphics({ x, y }).setName('forest-paw');
  const size = Math.max(1.2, art.width * 0.004) * scale;
  g.fillStyle(0xa79bbb, 0.55).fillEllipse(0, size * 0.3, size * 1.4, size);
  for (let i = -1; i <= 1; i++) g.fillEllipse(i * size * 0.65, -size * 0.55,
    size * 0.58, size * 0.72);
  g.lineStyle(Math.max(0.5, size * 0.2), 0xfff6ed, 0.7)
    .lineBetween(-size * 0.6, size * 0.75, size * 0.5, size * 0.75);
  return g;
}

/** Both postcard and exploration share the same feather and saved animal trail. */
export function drawForestSnow(scene: Phaser.Scene, art: WorldFrame, steps: readonly number[], awakening = false) {
  const objects: Array<Phaser.GameObjects.Image | Phaser.GameObjects.Graphics> = [];
  const reduced = reducedMotion(), complete = steps.length === 3;
  const count = complete ? animalTrail.length : steps.length * 2;
  animalTrail.slice(0, count).forEach((point, i) => {
    const foot = paw(scene, art, art.left + art.width * (point.x + (i % 2 ? 0.007 : -0.007)),
      art.top + art.height * point.y, 1 - i * 0.035).setName(`forest-trail-${i}`);
    objects.push(foot);
    if (awakening && !reduced) {
      foot.setAlpha(0);
      scene.tweens.add({ targets: foot, alpha: 1, delay: i * 105, duration: 160 });
    }
  });
  const feather = scene.add.image(art.left + art.width * 0.259, art.top + art.height * 0.655,
    'adventure-forest-feather').setName('forest-feather');
  feather.setScale(art.width * 0.205 / feather.width);
  objects.push(feather);
  if (awakening && !reduced) {
    scene.tweens.add({ targets: feather, x: art.left + art.width * 0.62, y: art.top + art.height * 0.78,
      angle: -16, delay: 650, duration: 800, ease: 'Sine.InOut' });
    scene.tweens.add({ targets: feather, alpha: 0, delay: 1750, duration: 220 });
  }
  return { objects, feather };
}

export function addForestDrawing(scene: Phaser.Scene, art: WorldFrame, steps: readonly number[],
  onStroke: (index: number, x: number, y: number) => void, awakening: boolean): () => void {
  const { feather } = drawForestSnow(scene, art, steps, awakening);
  const reduced = reducedMotion(), home = { x: feather.x, y: feather.y };
  const drawings: Phaser.GameObjects.Graphics[] = [], paws: Phaser.GameObjects.Graphics[] = [];
  let dragging = false, returning = false, length = 0, pawDistance = 0;
  let previous: SnowPoint | undefined, ink: Phaser.GameObjects.Graphics | undefined;
  let completed = steps.length;
  feather.setInteractive();
  scene.input.setDraggable(feather);
  const retire = (objects: Phaser.GameObjects.Graphics[], limit: number) => {
    while (objects.length > limit) {
      const oldest = objects.shift()!; scene.tweens.killTweensOf(oldest); oldest.destroy();
    }
  };
  const returnHome = () => {
    const center = feather.getCenter();
    feather.setOrigin(0.5).setPosition(center.x, center.y);
    if (reduced) { feather.setPosition(home.x, home.y).setAngle(0); returning = false; return; }
    returning = true;
    scene.tweens.add({ targets: feather, ...home, angle: 0, duration: 350, ease: 'Sine.InOut',
      onComplete: () => { returning = false; } });
  };
  feather.on('dragstart', (pointer: Phaser.Input.Pointer) => {
    if (awakening || returning || scene.children.getByName('tutorial-paper')) return;
    dragging = true; length = 0; pawDistance = 0; previous = undefined;
    ink = scene.add.graphics().setName('forest-snow-stroke'); drawings.push(ink); retire(drawings, 24);
    feather.setOrigin(0.035, 0.92).setPosition(pointer.x, pointer.y).setAngle(-12).setDepth(5);
  });
  feather.on('drag', (pointer: Phaser.Input.Pointer) => {
    if (!dragging || !ink) return;
    feather.setPosition(Phaser.Math.Clamp(pointer.x, art.left, art.left + art.width),
      Phaser.Math.Clamp(pointer.y, art.top, art.top + art.height));
    const point = { x: (pointer.x - art.left) / art.width, y: (pointer.y - art.top) / art.height };
    if (previous) {
      const distance = snowSegmentLength(previous, point);
      if (distance > 0.001) {
        const x1 = art.left + previous.x * art.width, y1 = art.top + previous.y * art.height;
        const x2 = pointer.x, y2 = pointer.y, width = Math.max(1.2, art.width * 0.004);
        ink.lineStyle(width + 1, 0xa99ab9, 0.25).lineBetween(x1, y1, x2, y2)
          .lineStyle(width * 0.5, 0x8c80a6, 0.55).lineBetween(x1, y1, x2, y2)
          .lineStyle(Math.max(0.5, width * 0.3), 0xfff8ee, 0.85).lineBetween(x1, y1 + width, x2, y2 + width);
        length += distance; pawDistance += distance;
        if (pawDistance >= 0.03) {
          pawDistance = 0;
          // Keep each companion print in the snow, whichever side of the stroke is free.
          const beside = [0.025, -0.025, 0].map(dx => ({ x: point.x + dx, y: point.y + 0.012 }))
            .find(inForestSnow);
          if (beside) {
            const foot = paw(scene, art, art.left + beside.x * art.width, art.top + beside.y * art.height);
            paws.push(foot); retire(paws, 72);
            if (!reduced) scene.tweens.add({ targets: foot, alpha: 0, delay: 10000, duration: 5000 });
          }
        }
      }
    }
    previous = inForestSnow(point) ? point : undefined;
  });
  feather.on('dragend', () => {
    if (!dragging) return;
    dragging = false; previous = undefined;
    const stroke = ink; ink = undefined;
    if (stroke && !reduced) scene.tweens.add({ targets: stroke, alpha: 0, delay: 6500, duration: 4500 });
    const qualifies = length >= FOREST_STROKE_LENGTH && completed < 3;
    length = 0;
    returnHome();
    if (qualifies) {
      const index = completed++;
      // Each completed gesture is saved once; ongoing gestures never count on cancellation.
      onStroke(index, art.left + art.width * 0.62, art.top + art.height * 0.78);
    }
  });
  const cancel = () => {
    if (!dragging) return;
    if (ink && !reduced) scene.tweens.add({ targets: ink, alpha: 0, delay: 6500, duration: 4500 });
    dragging = false; previous = undefined; length = 0; ink = undefined; returnHome();
  };
  scene.input.on('gameout', cancel); scene.game.events.on('blur', cancel);
  return () => {
    scene.input.off('gameout', cancel); scene.game.events.off('blur', cancel);
  };
}
