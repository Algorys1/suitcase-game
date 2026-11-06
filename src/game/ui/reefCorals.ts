import Phaser from 'phaser';
import { AdventureControls, reducedMotion } from './adventureMap';
import { pilotTargets } from '../../domain/pilotExploration';
import type { WorldFrame } from './pilotWorlds';

// Bounds in the original painting; colour filtering below follows each glass branch.
const regions = [[0, 0.075, 0.255, 0.345], [0.325, 0.332, 0.126, 0.129],
  [0.708, 0.565, 0.292, 0.435]] as const;
const tips = [[[0.079, 0.12], [0.122, 0.184], [0.229, 0.294]],
  [[0.354, 0.365], [0.397, 0.359], [0.435, 0.40]],
  [[0.81, 0.657], [0.929, 0.604], [0.977, 0.689]]] as const;
const roots = [{ x: 0.035, y: 0.413 }, { x: 0.387, y: 0.455 }, { x: 0.895, y: 0.949 }];

/** Re-light the coral paint itself, keeping the rocks, sea and sky transparent. */
function coralPaint(scene: Phaser.Scene, index: number): string {
  const key = `reef-coral-paint-${index}`;
  if (scene.textures.exists(key)) return key;
  const frame = scene.textures.getFrame('destination-recif_de_verre');
  const canvas = document.createElement('canvas');
  canvas.width = frame.width; canvas.height = frame.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return '__WHITE';
  const [x, y, w, h] = regions[index]!;
  ctx.beginPath(); ctx.rect(x * canvas.width, y * canvas.height, w * canvas.width, h * canvas.height); ctx.clip();
  ctx.drawImage(frame.source.image as CanvasImageSource, frame.cutX, frame.cutY,
    frame.cutWidth, frame.cutHeight, 0, 0, canvas.width, canvas.height);
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < pixels.data.length; i += 4) {
    const r = pixels.data[i]!, g = pixels.data[i + 1]!, b = pixels.data[i + 2]!;
    const glass = index === 1 ? g > r + 8 && g > b + 5 : r > g + 22 && b > g + 7;
    if (!glass) pixels.data[i + 3] = 0;
    else {
      pixels.data[i] = Math.min(255, r * 0.6 + 100);
      pixels.data[i + 1] = Math.min(255, g * 0.6 + 100);
      pixels.data[i + 2] = Math.min(255, b * 0.6 + 110);
    }
  }
  ctx.putImageData(pixels, 0, 0);
  scene.textures.addCanvas(key, canvas)?.get().setSize(frame.width, frame.height, 0, 0);
  return key;
}

function glowTexture(scene: Phaser.Scene): string {
  const key = 'reef-soft-reflection';
  if (scene.textures.exists(key)) return key;
  const texture = scene.textures.createCanvas(key, 64, 64);
  if (!texture) return '__WHITE';
  const ctx = texture.context, gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, '#fffdf3'); gradient.addColorStop(0.10, '#fff6e6dd');
  gradient.addColorStop(0.32, '#ffe0f866'); gradient.addColorStop(1, '#ccefff00');
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 64, 64); texture.refresh();
  return key;
}

export function addReefCorals(scene: Phaser.Scene, controls: AdventureControls, art: WorldFrame,
  steps: readonly number[], onReflected: (index: number, x: number, y: number) => void,
  awakening: boolean): void {
  const reduced = reducedMotion(), visited = new Set(steps), busy = new Set<number>();
  const px = (x: number) => art.left + x * art.width;
  const py = (y: number) => art.top + y * art.height;
  const pearl = { x: px(0.282), y: py(0.704) }, texture = glowTexture(scene);
  const illuminate = (index: number) => {
    if (scene.children.getByName(`reef-coral-lit-${index}`)) return;
    const key = coralPaint(scene, index);
    const light = scene.add.image(art.left, art.top, key).setOrigin(0)
      .setDisplaySize(art.width, art.height).setBlendMode(Phaser.BlendModes.ADD)
      .setAlpha(0.12).setName(`reef-coral-lit-${index}`);
    if (reduced) return;
    scene.tweens.add({ targets: light, alpha: 0.055, duration: 2900 + index * 410,
      yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    tips[index]!.forEach(([x, y], n) => {
      // Each reflection follows a curved fork of the painting independently.
      // Soft round falloff replaces the straight edge of the old cropped sweep.
      const root = roots[index]!;
      const junction = [{ x: 0.066, y: 0.288 }, { x: 0.386, y: 0.415 },
        { x: 0.898, y: 0.796 }][index]!;
      const curve = new Phaser.Curves.CubicBezier(
        new Phaser.Math.Vector2(px(root.x), py(root.y)),
        new Phaser.Math.Vector2(px(junction.x), py(junction.y)),
        new Phaser.Math.Vector2(px(x + (junction.x - x) * 0.18), py(y + 0.055)),
        new Phaser.Math.Vector2(px(x), py(y)));
      const current = scene.add.image(px(root.x), py(root.y), texture)
        .setDisplaySize(art.width * 0.035, art.width * 0.028).setAlpha(0)
        .setTint(index === 1 ? 0xd9ffed : 0xffe1ef)
        .setBlendMode(Phaser.BlendModes.ADD).setName(`reef-branch-reflection-${index}-${n}`);
      scene.tweens.addCounter({ from: 0, to: 1, duration: 3500 + n * 650 + index * 310,
        delay: n * 1100 + index * 730, repeat: -1, repeatDelay: 1700 + n * 430,
        ease: 'Sine.InOut', onUpdate: tween => {
          const p = tween.getValue() ?? 0, point = curve.getPoint(p);
          current.setPosition(point.x, point.y).setAlpha(Math.sin(p * Math.PI) ** 2 * 0.45);
        } });
      const glint = scene.add.image(px(x), py(y), texture).setBlendMode(Phaser.BlendModes.ADD)
        .setDisplaySize(art.width * 0.023, art.width * 0.023).setAlpha(0.2)
        .setName(`reef-tip-${index}-${n}`);
      scene.tweens.add({ targets: glint, alpha: 0.6, scaleX: glint.scaleX * 1.25, scaleY: glint.scaleY * 1.25,
        duration: 1800 + n * 370, delay: n * 700 + index * 240, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    });
  };
  steps.forEach(illuminate);
  if (steps.length === 3) {
    // Iridescent caustics stay close to the shell, following the painted surface of the water.
    for (let i = 0; i < 7; i++) {
      const x = 0.50 + i * 0.055, y = 0.84 - i * 0.047;
      const shimmer = scene.add.image(px(x), py(y), texture).setBlendMode(Phaser.BlendModes.ADD)
        .setDisplaySize(art.width * 0.055, art.width * 0.012).setAlpha(0.25)
        .setTint(i % 2 ? 0xd8ffef : 0xffe0ef).setName(`reef-water-shimmer-${i}`);
      if (!reduced) scene.tweens.add({ targets: shimmer, x: px(x + 0.009), alpha: 0.65,
        duration: 2500 + i * 270, delay: i * 380, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    }
    const sheen = scene.add.image(pearl.x - art.width * 0.018, pearl.y - art.height * 0.03, texture)
      .setDisplaySize(art.width * 0.07, art.width * 0.045).setAlpha(0.22)
      .setBlendMode(Phaser.BlendModes.ADD).setName('reef-pearl-sheen');
    if (!reduced) scene.tweens.add({ targets: sheen, x: sheen.x + art.width * 0.018, alpha: 0.48,
      duration: 3400, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
  }
  pilotTargets.recif_de_verre.forEach((target, index) => {
    controls.add(`reef-coral-${index}`, px(target.x), py(target.y),
      Math.max(38, art.width * (index === 1 ? 0.10 : 0.17)), Math.max(38, art.height * (index === 1 ? 0.11 : 0.27)), () => {
        if (awakening || busy.has(index) || scene.children.getByName('tutorial-paper')) return;
        busy.add(index); illuminate(index);
        const finish = () => {
          busy.delete(index);
          if (!visited.has(index)) { visited.add(index); onReflected(index, pearl.x, pearl.y); }
        };
        if (reduced) { finish(); return; }
        const root = roots[index]!;
        const curve = new Phaser.Curves.CubicBezier(new Phaser.Math.Vector2(px(root.x), py(root.y)),
          new Phaser.Math.Vector2(px(root.x + 0.05), py(root.y + 0.04)),
          new Phaser.Math.Vector2(pearl.x + art.width * 0.07, pearl.y - art.height * 0.04),
          new Phaser.Math.Vector2(pearl.x, pearl.y));
        // Separate soft reflections glide over the sea; no permanent connecting ray.
        for (let n = 0; n < 4; n++) {
          const spark = scene.add.image(px(root.x), py(root.y), texture).setAlpha(0)
            .setDisplaySize(art.width * 0.026, art.width * 0.014)
            .setBlendMode(Phaser.BlendModes.ADD).setName(`reef-reflection-${index}-${n}`);
          scene.tweens.addCounter({ from: 0, to: 1, duration: 1350, delay: 400 + n * 110,
            ease: 'Sine.InOut', onUpdate: tween => {
              const p = tween.getValue() ?? 0, point = curve.getPoint(p);
              spark.setPosition(point.x, point.y).setAlpha(Math.sin(p * Math.PI) * 0.85);
            }, onComplete: () => { spark.destroy(); if (n === 3) finish(); } });
        }
      }, false);
  });
}
