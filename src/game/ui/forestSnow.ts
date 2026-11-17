import Phaser from 'phaser';
import { reducedMotion } from './adventureMap';
import { FOREST_STROKE_LENGTH, inForestSnow, snowSegmentLength } from '../../domain/forestDrawing';
import type { SnowPoint } from '../../domain/forestDrawing';
import type { WorldFrame } from './pilotWorlds';

/** Both postcard and exploration share the same feather and saved animal trail. */
export function drawForestSnow(scene: Phaser.Scene, art: WorldFrame, steps: readonly number[], awakening = false) {
  const objects: Array<Phaser.GameObjects.Image | Phaser.GameObjects.Graphics> = [];
  const reduced = reducedMotion();
  const trail = scene.textures.exists('adventure-forest-tracks')
    ? scene.add.image(art.left + art.width / 2, art.top + art.height / 2, 'adventure-forest-tracks')
      .setDisplaySize(art.width, art.height).setName('forest-painted-trail') : undefined;
  const revealTrail = (progress: number) => {
    if (!trail) return;
    const amount = Phaser.Math.Clamp(progress, 0, 1);
    const frame = trail.frame;
    // Reveal only the painted path region, from the foreground towards the trees.
    const upper = 1 - amount * 0.46;
    trail.setVisible(amount > 0).setCrop(frame.width * 0.46, frame.height * upper,
      frame.width * 0.40, frame.height * (1 - upper));
  };
  if (trail) objects.push(trail);
  revealTrail(steps.length / 3);
  const feather = scene.add.image(art.left + art.width * 0.259, art.top + art.height * 0.655,
    'adventure-forest-feather').setName('forest-feather');
  feather.setScale(art.width * 0.205 / feather.width);
  objects.push(feather);
  if (awakening && !reduced) {
    scene.tweens.add({ targets: feather, x: art.left + art.width * 0.62, y: art.top + art.height * 0.78,
      angle: -16, delay: 650, duration: 800, ease: 'Sine.InOut' });
    scene.tweens.add({ targets: feather, alpha: 0, delay: 1750, duration: 220 });
  }
  return { objects, feather, revealTrail };
}

export function addForestDrawing(scene: Phaser.Scene, art: WorldFrame, steps: readonly number[],
  onStroke: (index: number, x: number, y: number) => void, awakening: boolean): () => void {
  const { feather, revealTrail } = drawForestSnow(scene, art, steps, awakening);
  const reduced = reducedMotion(), home = { x: feather.x, y: feather.y };
  let dragging = false, returning = false, length = 0;
  let previous: SnowPoint | undefined;
  let completed = steps.length;
  feather.setInteractive();
  scene.input.setDraggable(feather);
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
    dragging = true; length = 0; previous = undefined;
    feather.setOrigin(0.035, 0.92).setPosition(pointer.x, pointer.y).setAngle(-12).setDepth(5);
  });
  feather.on('drag', (pointer: Phaser.Input.Pointer) => {
    if (!dragging) return;
    feather.setPosition(Phaser.Math.Clamp(pointer.x, art.left, art.left + art.width),
      Phaser.Math.Clamp(pointer.y, art.top, art.top + art.height));
    const point = { x: (pointer.x - art.left) / art.width, y: (pointer.y - art.top) / art.height };
    if (previous) {
      const distance = snowSegmentLength(previous, point);
      if (distance > 0.001) {
        length += distance;
        revealTrail((completed + Math.min(0.98, length / FOREST_STROKE_LENGTH)) / 3);
      }
    }
    previous = inForestSnow(point) ? point : undefined;
  });
  feather.on('dragend', () => {
    if (!dragging) return;
    dragging = false; previous = undefined;
    const qualifies = length >= FOREST_STROKE_LENGTH && completed < 3;
    length = 0;
    revealTrail((completed + (qualifies ? 1 : 0)) / 3);
    returnHome();
    if (qualifies) {
      const index = completed++;
      // Each completed gesture is saved once; ongoing gestures never count on cancellation.
      onStroke(index, art.left + art.width * 0.62, art.top + art.height * 0.78);
    }
  });
  const cancel = () => {
    if (!dragging) return;
    dragging = false; previous = undefined; length = 0; revealTrail(completed / 3); returnHome();
  };
  scene.input.on('gameout', cancel); scene.game.events.on('blur', cancel);
  return () => {
    scene.input.off('gameout', cancel); scene.game.events.off('blur', cancel);
  };
}
