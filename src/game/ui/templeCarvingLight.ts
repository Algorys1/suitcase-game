import Phaser from 'phaser';
import { reducedMotion } from './adventureMap';
import type { WorldFrame } from './pilotWorlds';

// Hand-traced masks in the original painting's 1448 × 1086 coordinates.
const masks = [
  { id: 'right', x: 1095, y: 562, width: 70, height: 120 },
  { id: 'left', x: 689, y: 575, width: 64, height: 113 },
  { id: 'center', x: 867, y: 254, width: 130, height: 103 },
];
const padding = 30;

/** Soft light diffuses outward from the same carved strokes, without a rectangle. */
function haloTexture(scene: Phaser.Scene, index: number): string {
  const mask = masks[index]!;
  const key = `temple-carving-halo-texture-${index}`;
  if (scene.textures.exists(key)) return key;
  const frame = scene.textures.getFrame(`temple-carving-mask-${mask.id}`);
  const canvas = document.createElement('canvas');
  canvas.width = frame.width + padding * 2; canvas.height = frame.height + padding * 2;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return '__WHITE';
  context.filter = 'blur(9px)';
  context.drawImage(frame.source.image as CanvasImageSource, frame.cutX, frame.cutY,
    frame.cutWidth, frame.cutHeight, padding, padding, frame.width, frame.height);
  context.filter = 'blur(3px)'; context.globalAlpha = 0.55;
  context.drawImage(frame.source.image as CanvasImageSource, frame.cutX, frame.cutY,
    frame.cutWidth, frame.cutHeight, padding, padding, frame.width, frame.height);
  context.filter = 'none'; context.globalAlpha = 1;
  context.globalCompositeOperation = 'source-in'; context.fillStyle = '#ffd690';
  context.fillRect(0, 0, canvas.width, canvas.height);
  scene.textures.addCanvas(key, canvas);
  return key;
}

export function addTempleCarvingLight(scene: Phaser.Scene, art: WorldFrame, index: number,
  animate: boolean): void {
  const mask = masks[index]!;
  const key = `temple-carving-mask-${mask.id}`;
  if (!scene.textures.exists(key)) return;
  const reduced = reducedMotion();
  const width = art.width * mask.width / 1448, height = art.height * mask.height / 1086;
  const x = art.left + art.width * mask.x / 1448, y = art.top + art.height * mask.y / 1086;
  const core = scene.add.image(x, y, key).setOrigin(0).setDisplaySize(width, height)
    .setTint(0xffefcf).setAlpha(0.58).setName(`temple-carving-lit-${index}`);
  const frame = scene.textures.getFrame(key);
  const scale = width / frame.width;
  const halo = scene.add.image(x - padding * scale, y - padding * scale, haloTexture(scene, index))
    .setOrigin(0).setScale(scale).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.58)
    .setName(`temple-carving-halo-${index}`);
  const breathe = () => {
    core.setCrop(); halo.setCrop();
    if (!reduced) scene.tweens.add({ targets: halo, alpha: 0.43, duration: 3100 + index * 170,
      yoyo: true, repeat: -1, ease: 'Sine.InOut' });
  };
  if (!animate || reduced) { breathe(); return; }
  const state = { p: 0 };
  const reveal = () => {
    const row = frame.height * (1 - state.p);
    core.setCrop(0, row, frame.width, frame.height - row);
    halo.setCrop(0, padding + row, halo.width, frame.height - row + padding);
  };
  reveal();
  scene.tweens.add({ targets: state, p: 1, duration: 700, ease: 'Sine.InOut',
    onUpdate: reveal, onComplete: breathe });
}
