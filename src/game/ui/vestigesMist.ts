import type Phaser from 'phaser';
import type { WorldFrame } from './pilotWorlds';
import { reducedMotion } from './adventureMap';

const region = { left: 0.27, top: 0.34, width: 0.60, height: 0.52 };
const treadLine = (x: number) => 1.025 - x * 0.82;
let wisp: HTMLCanvasElement | undefined, mask: HTMLCanvasElement | undefined, serial = 0;
const smooth = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function noise(x: number, y: number): number {
  const ix = Math.floor(x), iy = Math.floor(y), fx = smooth(0, 1, x - ix), fy = smooth(0, 1, y - iy);
  const hash = (a: number, b: number) => { const n = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return n - Math.floor(n); };
  const a = hash(ix, iy) * (1 - fx) + hash(ix + 1, iy) * fx;
  const b = hash(ix, iy + 1) * (1 - fx) + hash(ix + 1, iy + 1) * fx;
  return a * (1 - fy) + b * fy;
}

/** A feathered, irregular veil rather than circles or a reused cloud icon. */
function mistPaint(): HTMLCanvasElement {
  if (wisp) return wisp;
  wisp = document.createElement('canvas'); wisp.width = 256; wisp.height = 96;
  const ctx = wisp.getContext('2d', { willReadFrequently: true })!;
  const pixels = ctx.createImageData(256, 96);
  for (let y = 0; y < 96; y++) for (let x = 0; x < 256; x++) {
    const u = x / 255, v = y / 95;
    const center = 0.50 + Math.sin(u * 7.3) * 0.10 + Math.sin(u * 19 + 1) * 0.035;
    const spread = 0.20 + Math.sin(u * 12 + 0.8) * 0.060;
    const body = Math.exp(-(((v - center) / spread) ** 2) * 1.8);
    const veil = Math.exp(-(((v - 0.55) / 0.26) ** 2) * 2) * 0.22;
    const texture = noise(u * 6, v * 4) * 0.55 + noise(u * 13 + 5, v * 8 + 1) * 0.30
      + noise(u * 27, v * 17) * 0.15;
    const alpha = (body + veil) * Math.sin(u * Math.PI) ** 1.2 * smooth(0.10, 0.60, texture);
    const i = (y * 256 + x) * 4;
    pixels.data[i] = 255 - v * 32; pixels.data[i + 1] = 239 - v * 31;
    pixels.data[i + 2] = 232 + v * 8; pixels.data[i + 3] = Math.min(255, alpha * 255);
  }
  ctx.putImageData(pixels, 0, 0);
  return wisp;
}

function overTreads(): HTMLCanvasElement {
  if (mask) return mask;
  mask = document.createElement('canvas'); mask.width = 256; mask.height = 192;
  const ctx = mask.getContext('2d', { willReadFrequently: true })!, pixels = ctx.createImageData(256, 192);
  for (let y = 0; y < 192; y++) for (let x = 0; x < 256; x++) {
    const u = x / 255, wx = region.left + u * region.width, wy = region.top + y / 191 * region.height;
    // A shallow veil follows the walking surface, with soft edges on the risers.
    const distance = (wy - treadLine(wx)) / 0.075;
    const alpha = Math.exp(-(distance * distance) * 1.8)
      * Math.sin(u * Math.PI) ** 0.7;
    const i = (y * 256 + x) * 4;
    pixels.data[i] = 255; pixels.data[i + 1] = 255; pixels.data[i + 2] = 255; pixels.data[i + 3] = alpha * 255;
  }
  ctx.putImageData(pixels, 0, 0);
  return mask;
}

/** Completed landscapes only. No interaction, progression, or save field. */
export function drawVestigesMist(scene: Phaser.Scene, art: WorldFrame, complete: boolean): Phaser.GameObjects.Image[] {
  if (!complete) return [];
  const key = `vestiges-mist-${++serial}`, texture = scene.textures.createCanvas(key, 256, 256);
  if (!texture) return [];
  texture.get().setSize(256, 192, 0, 0);
  const ctx = texture.getContext(), paint = mistPaint(), limit = overTreads();
  const image = scene.add.image(art.left + art.width * region.left, art.top + art.height * region.top, key)
    .setOrigin(0).setDisplaySize(art.width * region.width, art.height * region.height).setName('vestiges-mist');
  const state = { phase: 0.25 };
  const draw = (phase: number) => {
    ctx.clearRect(0, 0, 256, 256);
    for (let i = 0; i < 3; i++) {
      const p = (phase + [0.07, 0.41, 0.78][i]!) % 1;
      // Uneven spacing, different volumes and a varying speed break the repeated ribbons.
      const travel = p - Math.sin(p * Math.PI * 2) / (Math.PI * 2) * 0.65;
      const x = 0.32 + travel * 0.47;
      const y = treadLine(x) + Math.sin(p * Math.PI * 4 + i) * 0.009;
      const width = [0.27, 0.18, 0.23][i]! * (1 + Math.sin(p * 9 + i) * 0.12) / region.width * 256;
      const height = [0.12, 0.075, 0.105][i]! * (1 + Math.sin(p * 7 - i) * 0.15) / region.height * 192;
      ctx.globalAlpha = Math.sin(p * Math.PI) ** 0.8 * [0.80, 0.58, 0.72][i]!
        * (0.75 + Math.sin(p * Math.PI * 6 + i) * 0.25);
      ctx.drawImage(paint, (x - region.left) / region.width * 256 - width / 2,
        (y - region.top) / region.height * 192 - height / 2, width, height);
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'destination-in'; ctx.drawImage(limit, 0, 0);
    ctx.globalCompositeOperation = 'source-over'; texture.refresh();
  };
  draw(0.25);
  if (!reducedMotion()) scene.tweens.add({ targets: state, phase: 1.25, duration: 26000, repeat: -1,
    onUpdate: () => draw(state.phase) });
  image.once('destroy', () => { scene.tweens.killTweensOf(state); scene.textures.remove(key); });
  return [image];
}
