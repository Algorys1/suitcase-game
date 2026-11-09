import Phaser from 'phaser';
import { reducedMotion } from './adventureMap';
import { findKingdomLedge, kingdomLedges } from '../../domain/kingdomClouds';
import type { WorldFrame } from './pilotWorlds';

const origins = [{ x: 0.59, y: 0.21 }, { x: 0.61, y: 0.66 }, { x: 0.21, y: 0.91 }];
const widths = [0.13, 0.14, 0.11];
const waterRegions = [
  { x: 0.418, y: 0.313, w: 0.067, h: 0.191 },
  { x: 0.438, y: 0.493, w: 0.123, h: 0.252 },
  { x: 0.290, y: 0.765, w: 0.058, h: 0.134 },
];
const waterBands = [
  [{ x: 0.451, w: 0.026, top: 0.339, bottom: 0.489 }],
  [{ x: 0.518, w: 0.041, top: 0.537, bottom: 0.725 },
    { x: 0.461, w: 0.012, top: 0.558, bottom: 0.683 }],
  [{ x: 0.321, w: 0.018, top: 0.790, bottom: 0.876 }],
];

/** Keep every original pixel outside the waterfalls and the collected parasol. */
export function kingdomBase(scene: Phaser.Scene): string {
  const key = 'kingdom-dormant-base', original = 'destination-royaume_des_spores_celestes';
  if (scene.textures.exists(key)) return key;
  if (!scene.textures.exists('adventure-kingdom-dormant')) return original;
  const f = scene.textures.getFrame(original), dry = scene.textures.getFrame('adventure-kingdom-dormant');
  const canvas = document.createElement('canvas'); canvas.width = f.width; canvas.height = f.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(f.source.image as CanvasImageSource, f.cutX, f.cutY, f.cutWidth, f.cutHeight,
    0, 0, canvas.width, canvas.height);
  for (const r of [...waterRegions, { x: 0.552, y: 0.539, w: 0.414, h: 0.361 }]) {
    const patch = document.createElement('canvas'); patch.width = canvas.width; patch.height = canvas.height;
    const pc = patch.getContext('2d', { willReadFrequently: true })!;
    pc.fillStyle = 'white'; pc.shadowColor = 'white'; pc.shadowBlur = 4;
    pc.fillRect(r.x * patch.width, r.y * patch.height, r.w * patch.width, r.h * patch.height);
    pc.globalCompositeOperation = 'source-in'; pc.shadowBlur = 0;
    pc.drawImage(dry.source.image as CanvasImageSource, dry.cutX, dry.cutY, dry.cutWidth, dry.cutHeight,
      0, 0, patch.width, patch.height);
    ctx.drawImage(patch, 0, 0);
  }
  scene.textures.addCanvas(key, canvas)?.get().setSize(canvas.width, canvas.height, 0, 0);
  return key;
}

function waterfallPaint(scene: Phaser.Scene, index: number): string {
  const key = `kingdom-water-paint-${index}`;
  if (scene.textures.exists(key)) return key;
  const f = scene.textures.getFrame('destination-royaume_des_spores_celestes');
  const canvas = document.createElement('canvas'); canvas.width = f.width; canvas.height = f.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!, r = waterRegions[index]!;
  ctx.fillStyle = 'white'; ctx.shadowColor = 'white'; ctx.shadowBlur = 4;
  ctx.fillRect(r.x * canvas.width, r.y * canvas.height, r.w * canvas.width, r.h * canvas.height);
  ctx.globalCompositeOperation = 'source-in'; ctx.shadowBlur = 0;
  ctx.drawImage(f.source.image as CanvasImageSource, f.cutX, f.cutY, f.cutWidth, f.cutHeight,
    0, 0, canvas.width, canvas.height);
  scene.textures.addCanvas(key, canvas)?.get().setSize(canvas.width, canvas.height, 0, 0);
  return key;
}

function addWaterfall(scene: Phaser.Scene, art: WorldFrame, index: number, reveal: boolean,
  onComplete?: () => void): Array<Phaser.GameObjects.Image | Phaser.GameObjects.Graphics> {
  const reduced = reducedMotion(), r = waterRegions[index]!;
  const fall = scene.add.image(art.left, art.top, waterfallPaint(scene, index)).setOrigin(0)
    .setDisplaySize(art.width, art.height).setName(`kingdom-waterfall-${index}`)
    .setData('reveal', reveal && !reduced ? 0 : 1);
  const frame = fall.frame;
  if (reveal && !reduced) {
    fall.setCrop(0, 0, frame.width, frame.height * r.y);
    scene.tweens.addCounter({ from: 0, to: 1, duration: 1150, ease: 'Sine.InOut', onUpdate: tween => {
      const p = tween.getValue() ?? 0;
      fall.setData('reveal', p).setCrop(0, 0, frame.width, frame.height * (r.y + (r.h + 0.01) * p));
    }, onComplete: () => { fall.setCrop().setData('reveal', 1); onComplete?.(); } });
  } else onComplete?.();
  const current = scene.add.graphics().setName(`kingdom-water-motion-${index}`);
  const draw = (phase: number) => {
    current.clear();
    for (const band of waterBands[index]!) {
      for (let i = 0; i < 8; i++) {
        const p = (phase + i / 8) % 1;
        const y = band.top + p * (band.bottom - band.top - 0.015);
        if (y + 0.015 > r.y + (r.h + 0.01) * Number(fall.getData('reveal'))) continue;
        const x = band.x + Math.sin(i * 2.2) * band.w * 0.36;
        current.lineStyle(Math.max(0.5, art.width * 0.0011), 0xf1fcff, Math.sin(p * Math.PI) * 0.65)
          .lineBetween(art.left + art.width * x, art.top + art.height * y,
            art.left + art.width * (x + 0.001), art.top + art.height * (y + 0.015));
      }
    }
  };
  draw(0.25);
  if (!reduced) scene.tweens.add({ targets: current, alpha: { from: 0.85, to: 1 },
    duration: 2100 + index * 370, repeat: -1,
    onUpdate: tween => draw(((tween.getValue() ?? 0.85) - 0.85) / 0.15) });
  return [fall, current];
}

/** Shared paint and registration prevent any scenery swap when entering exploration. */
export function drawKingdomWaterfalls(scene: Phaser.Scene, art: WorldFrame, steps: readonly number[], awakening = false) {
  const objects: Array<Phaser.GameObjects.Image | Phaser.GameObjects.Graphics> = [];
  const clouds: Phaser.GameObjects.Image[] = [];
  steps.forEach(index => objects.push(...addWaterfall(scene, art, index, false)));
  kingdomLedges.forEach((ledge, index) => {
    const anchored = steps.includes(index), position = anchored ? ledge : origins[index]!;
    const cloud = scene.add.image(art.left + art.width * position.x, art.top + art.height * position.y,
      'adventure-kingdom-cloud').setName(anchored ? `kingdom-cloud-docked-${index}` : `kingdom-cloud-${index}`);
    cloud.setScale(art.width * widths[index]! / cloud.width);
    if (anchored) cloud.setScale(cloud.scaleX, cloud.scaleY * 0.70);
    clouds.push(cloud); objects.push(cloud);
  });
  if (steps.length < 3 || awakening) {
    const umbrella = scene.add.image(art.left + art.width * 0.759, art.top + art.height * 0.716,
      'adventure-kingdom-umbrella').setName('kingdom-umbrella');
    umbrella.setScale(art.width * 0.385 / umbrella.width); objects.push(umbrella);
    if (awakening && !reducedMotion()) {
      scene.tweens.add({ targets: umbrella, x: umbrella.x + art.width * 0.018, y: umbrella.y - art.height * 0.055,
        angle: -7, duration: 1000, ease: 'Sine.InOut' });
      scene.tweens.add({ targets: umbrella, alpha: 0, delay: 1150, duration: 300 });
    }
  }
  return { objects, clouds };
}

export function addKingdomClouds(scene: Phaser.Scene, art: WorldFrame, steps: readonly number[],
  onWatered: (index: number) => { activated: boolean; collected: boolean },
  onCollected: () => void, awakening: boolean): () => void {
  const { clouds } = drawKingdomWaterfalls(scene, art, steps, awakening);
  const reduced = reducedMotion(), watered = [...steps];
  let pending = 0, collected = false;
  const cancelers: Array<() => void> = [];
  clouds.forEach((cloud, source) => {
    if (steps.includes(source)) return;
    const home = { x: cloud.x, y: cloud.y }, homeScale = cloud.scaleX;
    let dragging = false, busy = awakening;
    cloud.setInteractive(); scene.input.setDraggable(cloud);
    const returnHome = () => {
      dragging = false; busy = true;
      if (reduced) { cloud.setPosition(home.x, home.y); busy = false; return; }
      scene.tweens.add({ targets: cloud, ...home, duration: 330, ease: 'Sine.InOut', onComplete: () => {
        busy = false;
      } });
    };
    cloud.on('dragstart', () => {
      if (busy || collected || scene.children.getByName('tutorial-paper')) return;
      scene.tweens.killTweensOf(cloud); dragging = true; cloud.setDepth(2);
    });
    cloud.on('drag', (_pointer: Phaser.Input.Pointer, x: number, y: number) => {
      if (dragging) cloud.setPosition(Phaser.Math.Clamp(x, art.left, art.left + art.width),
        Phaser.Math.Clamp(y, art.top, art.top + art.height));
    });
    cloud.on('dragend', () => {
      if (!dragging) return;
      dragging = false;
      const index = findKingdomLedge({ x: (cloud.x - art.left) / art.width, y: (cloud.y - art.top) / art.height },
        watered, Math.max(24 / art.width, 0.09), Math.max(22 / art.height, 0.075));
      if (index < 0) { returnHome(); return; }
      const result = onWatered(index);
      if (!result.activated) { returnHome(); return; }
      watered.push(index); collected ||= result.collected; pending++;
      busy = true; cloud.disableInteractive(); scene.input.setDraggable(cloud, false);
      cloud.setName(`kingdom-cloud-docked-${index}`);
      const ledge = kingdomLedges[index]!;
      const destination = { x: art.left + art.width * ledge.x, y: art.top + art.height * ledge.y };
      const scale = art.width * widths[index]! / cloud.width;
      const finish = () => {
        pending--;
        if (collected && pending === 0) onCollected();
      };
      if (reduced) {
        cloud.setPosition(destination.x, destination.y).setScale(scale, scale * 0.70);
        addWaterfall(scene, art, index, false); finish(); return;
      }
      scene.tweens.add({ targets: cloud, ...destination, scaleX: scale * 1.04, scaleY: scale * 0.60,
        duration: 380, ease: 'Sine.InOut', onComplete: () => {
          scene.tweens.add({ targets: cloud, scaleX: scale, scaleY: scale * 0.70, duration: 350 });
          addWaterfall(scene, art, index, true, finish);
        } });
    });
    // Losing the pointer cancels a loose-cloud gesture without spending or progressing.
    cancelers.push(() => { if (dragging) { scene.tweens.killTweensOf(cloud); cloud.setScale(homeScale); returnHome(); } });
  });
  const cancel = () => cancelers.forEach(stop => stop());
  scene.input.on('gameout', cancel); scene.game.events.on('blur', cancel);
  return () => { scene.input.off('gameout', cancel); scene.game.events.off('blur', cancel); };
}
