import Phaser from 'phaser';
import { AdventureControls, reducedMotion } from './adventureMap';
import { pilotTargets } from '../../domain/pilotExploration';
import type { WorldFrame } from './pilotWorlds';

// Outlines in the 1448 × 1086 source painting, front to back.
const slabs = [
  [[700, 1006], [797, 984], [884, 995], [919, 1017], [875, 1044], [736, 1048], [687, 1029]],
  [[594, 940], [751, 910], [961, 927], [1062, 956], [1021, 977], [895, 990], [680, 980], [585, 961]],
  [[559, 857], [674, 829], [802, 832], [885, 856], [827, 880], [744, 891], [613, 880]],
  [[689, 817], [818, 791], [942, 791], [987, 814], [860, 843], [727, 837]],
  [[743, 767], [853, 748], [932, 754], [977, 777], [867, 795], [780, 790]],
] as const;

function paint(scene: Phaser.Scene, index: number, ground: boolean): string {
  const key = `sylve-${ground ? 'ground' : 'slab'}-${index}`;
  if (scene.textures.exists(key)) return key;
  const f = scene.textures.getFrame(ground ? 'adventure-sylve-ground' : 'destination-sylve_prismatique');
  const outline = slabs[index]!;
  const left = Math.min(...outline.map(p => p[0])) - 8, top = Math.min(...outline.map(p => p[1])) - 8;
  const right = Math.max(...outline.map(p => p[0])) + 8, bottom = Math.max(...outline.map(p => p[1])) + 8;
  const canvas = document.createElement('canvas'); canvas.width = right - left; canvas.height = bottom - top;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  const cx = (left + right) / 2, cy = (top + bottom) / 2;
  ctx.beginPath();
  outline.forEach(([x, y], i) => {
    const dx = x - cx, dy = y - cy;
    const px = x - left + (ground ? Math.sign(dx) * 7 : 0);
    const py = y - top + (ground ? Math.sign(dy) * 7 : 0);
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  });
  ctx.closePath();
  if (ground) {
    ctx.fillStyle = 'white'; ctx.shadowColor = 'white'; ctx.shadowBlur = 8; ctx.fill();
    ctx.globalCompositeOperation = 'source-in'; ctx.shadowBlur = 0;
  } else ctx.clip();
  ctx.drawImage(f.source.image as CanvasImageSource, f.cutX, f.cutY, f.cutWidth, f.cutHeight,
    -left, -top, 1448, 1086);
  scene.textures.addCanvas(key, canvas);
  return key;
}

function streamPaint(scene: Phaser.Scene): string {
  const key = 'sylve-stream-paint';
  if (scene.textures.exists(key)) return key;
  const f = scene.textures.getFrame('adventure-sylve-stream');
  const canvas = document.createElement('canvas'); canvas.width = 1448; canvas.height = 1086;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  // A soft bank follows the existing path and joins the original river on the right.
  ctx.beginPath(); ctx.moveTo(1180, 670);
  ctx.bezierCurveTo(1140, 740, 1100, 790, 1070, 860);
  ctx.bezierCurveTo(1060, 940, 1040, 1020, 990, 1086);
  ctx.lineTo(220, 1086);
  ctx.bezierCurveTo(360, 1020, 470, 960, 480, 885);
  ctx.bezierCurveTo(490, 820, 600, 790, 730, 750);
  ctx.bezierCurveTo(830, 700, 1050, 690, 1180, 670); ctx.closePath();
  ctx.fillStyle = 'white'; ctx.shadowColor = 'white'; ctx.shadowBlur = 24; ctx.fill();
  ctx.globalCompositeOperation = 'source-in'; ctx.shadowBlur = 0;
  ctx.drawImage(f.source.image as CanvasImageSource, f.cutX, f.cutY, f.cutWidth, f.cutHeight,
    0, 0, 1448, 1086);
  scene.textures.addCanvas(key, canvas);
  return key;
}

export function addSylvePath(scene: Phaser.Scene, art: WorldFrame, steps: readonly number[],
  controls?: AdventureControls, onSunk?: (index: number, x: number, y: number) => void,
  awakening = false): Array<Phaser.GameObjects.Image | Phaser.GameObjects.Graphics> {
  const objects: Array<Phaser.GameObjects.Image | Phaser.GameObjects.Graphics> = [];
  if (!scene.textures.exists('adventure-sylve-ground') || !scene.textures.exists('adventure-sylve-stream')) return objects;
  const reduced = reducedMotion(), visited = new Set(steps), busy = new Set<number>();
  const px = (x: number) => art.left + x * art.width, py = (y: number) => art.top + y * art.height;
  const stoneImages: Phaser.GameObjects.Image[] = [];
  const grounds: Phaser.GameObjects.Image[] = [];
  slabs.forEach((outline, index) => {
    const left = Math.min(...outline.map(p => p[0])) - 8, top = Math.min(...outline.map(p => p[1])) - 8;
    const right = Math.max(...outline.map(p => p[0])) + 8, bottom = Math.max(...outline.map(p => p[1])) + 8;
    const ground = scene.add.image(px((left + right) / 2 / 1448), py(bottom / 1086), paint(scene, index, true))
      .setOrigin(0.5, 1).setDisplaySize((right - left) / 1448 * art.width, (bottom - top) / 1086 * art.height)
      .setAlpha(visited.has(index) ? 1 : 0).setName(`sylve-ground-${index}`);
    const stone = scene.add.image(ground.x, ground.y, paint(scene, index, false)).setOrigin(0.5, 1)
      .setDisplaySize(ground.displayWidth, ground.displayHeight).setName(`sylve-slab-${index}`);
    if (visited.has(index)) stone.setY(stone.y + art.height * 0.006).setScale(stone.scaleX, stone.scaleY * 0.72);
    grounds.push(ground); stoneImages.push(stone); objects.push(ground, stone);
  });
  if (steps.length === slabs.length) {
    const stream = scene.add.image(art.left, art.top, streamPaint(scene)).setOrigin(0)
      .setDisplaySize(art.width, art.height).setName('sylve-stream');
    objects.push(stream);
    if (awakening && !reduced) {
      scene.tweens.addCounter({ from: 0, to: 1, duration: 1700, ease: 'Sine.InOut', onUpdate: tween => {
        const p = tween.getValue() ?? 0;
        stream.setCrop(0, 0, 1448, 688 + 398 * p).setAlpha(Math.min(1, p * 4));
      } });
    }
    const ripples = scene.add.graphics().setName('sylve-current'); objects.push(ripples);
    const draw = (phase: number) => {
      ripples.clear().lineStyle(Math.max(0.6, art.width * 0.0013), 0xe6fff5, 0.5);
      for (let i = 0; i < 14; i++) {
        const t = (phase + i / 14) % 1;
        const y = 0.71 + t * 0.285, x = 0.64 - t * 0.15 + Math.sin(t * 9) * 0.035;
        ripples.beginPath().moveTo(px(x - 0.009), py(y)).lineTo(px(x), py(y + 0.002))
          .lineTo(px(x + 0.01), py(y)).strokePath();
      }
    };
    draw(0);
    if (!reduced) scene.tweens.addCounter({ from: 0, to: 1, duration: 6000, repeat: -1,
      delay: awakening ? 1700 : 0, onUpdate: tween => draw(tween.getValue() ?? 0) });
  }
  if (!controls || !onSunk) return objects;
  pilotTargets.sylve_prismatique.forEach((target, index) => {
    controls.add(`sylve-stone-${index}`, px(target.x), py(target.y),
      Math.max(36, art.width * (index === 1 ? 0.24 : 0.14)), Math.max(14, art.height * 0.032), () => {
        if (awakening || busy.has(index) || visited.has(index) || scene.children.getByName('tutorial-paper')) return;
        busy.add(index);
        grounds[index]!.setAlpha(1);
        const stone = stoneImages[index]!;
        const finish = () => { busy.delete(index); visited.add(index); onSunk(index, stone.x, stone.y); };
        if (reduced) { stone.setY(stone.y + art.height * 0.006).setScale(stone.scaleX, stone.scaleY * 0.72); finish(); return; }
        scene.tweens.add({ targets: stone, y: stone.y + art.height * 0.006, scaleY: stone.scaleY * 0.72,
          duration: 420, ease: 'Sine.InOut', onComplete: finish });
      }, false);
  });
  return objects;
}
