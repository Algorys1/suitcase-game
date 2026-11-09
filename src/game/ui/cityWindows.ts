import Phaser from 'phaser';
import { AdventureControls, reducedMotion } from './adventureMap';
import { pilotTargets } from '../../domain/pilotExploration';
import type { WorldFrame } from './pilotWorlds';

const windows = [
  [{ x: 0.130, y: 0.291, w: 0.026, h: 0.049 }],
  [{ x: 0.601, y: 0.451, w: 0.011, h: 0.059 },
    { x: 0.679, y: 0.432, w: 0.017, h: 0.064 },
    { x: 0.755, y: 0.452, w: 0.010, h: 0.059 }],
  [{ x: 0.974, y: 0.413, w: 0.023, h: 0.065 }],
] as const;

/** The original painting stays intact: only the existing panes receive warm light. */
function windowPaint(scene: Phaser.Scene, index: number): string {
  const key = `city-window-paint-${index}`;
  if (scene.textures.exists(key)) return key;
  const frame = scene.textures.getFrame('destination-cite_immobile');
  const canvas = document.createElement('canvas');
  canvas.width = frame.width; canvas.height = frame.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  for (const pane of windows[index]!) {
    ctx.rect((pane.x - pane.w / 2) * canvas.width, (pane.y - pane.h / 2) * canvas.height,
      pane.w * canvas.width, pane.h * canvas.height);
  }
  ctx.clip();
  ctx.drawImage(frame.source.image as CanvasImageSource, frame.cutX, frame.cutY,
    frame.cutWidth, frame.cutHeight, 0, 0, canvas.width, canvas.height);
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < pixels.data.length; i += 4) {
    const r = pixels.data[i]!, g = pixels.data[i + 1]!, b = pixels.data[i + 2]!;
    if (r < 205 || g < 130 || b > g * 0.76) pixels.data[i + 3] = 0;
    else { pixels.data[i] = 255; pixels.data[i + 1] = 217; pixels.data[i + 2] = 130; }
  }
  ctx.putImageData(pixels, 0, 0);
  scene.textures.addCanvas(key, canvas)?.get().setSize(frame.width, frame.height, 0, 0);
  return key;
}

export function addCityWindows(scene: Phaser.Scene, art: WorldFrame, steps: readonly number[],
  controls?: AdventureControls, onAwakened?: (index: number, x: number, y: number) => void,
  awakening = false): Array<Phaser.GameObjects.Image | Phaser.GameObjects.Graphics> {
  const objects: Array<Phaser.GameObjects.Image | Phaser.GameObjects.Graphics> = [];
  const reduced = reducedMotion(), visited = new Set(steps), busy = new Set<number>();
  const px = (x: number) => art.left + x * art.width;
  const py = (y: number) => art.top + y * art.height;
  const fountain = { x: px(0.557), y: py(0.535) };
  const illuminate = (index: number) => {
    if (scene.children.getByName(`city-window-lit-${index}`)) return;
    const light = scene.add.image(art.left, art.top, windowPaint(scene, index)).setOrigin(0)
      .setDisplaySize(art.width, art.height).setAlpha(0.42)
      .setBlendMode(Phaser.BlendModes.ADD).setName(`city-window-lit-${index}`);
    objects.push(light);
    if (!reduced) scene.tweens.add({ targets: light, alpha: 0.15, duration: 2300 + index * 430,
      yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    // Narrow folds sit inside the glass, behind the painted stone frame and mullions.
    windows[index]!.forEach((pane, n) => {
      const folds = scene.add.graphics().setName(`city-curtain-${index}-${n}`);
      objects.push(folds);
      const draw = (p: number) => {
        folds.clear().fillStyle(0xb57955, 0.33);
        for (const side of [-1, 1]) {
          const x = px(pane.x + side * pane.w * 0.31);
          const y = py(pane.y - pane.h * 0.14);
          folds.fillTriangle(x, y, x + side * art.width * pane.w * 0.15, y + art.height * pane.h * 0.43,
            x - side * art.width * pane.w * (0.10 + p * 0.06), y + art.height * pane.h * 0.4);
        }
      };
      draw(0);
      if (!reduced) scene.tweens.addCounter({ from: 0, to: 1, duration: 2600 + n * 410,
        yoyo: true, repeat: -1, ease: 'Sine.InOut', onUpdate: tween => draw(tween.getValue() ?? 0) });
    });
  };
  steps.forEach(illuminate);
  if (steps.length === 3) {
    const flakes = scene.add.graphics().setName('city-golden-snow');
    objects.push(flakes);
    const draw = (phase: number) => {
      flakes.clear();
      const points: Array<{ x: number; y: number }> = [];
      for (let i = 0; i < 12; i++) {
        const a = phase + i * Math.PI / 6;
        const x = fountain.x + Math.cos(a) * art.width * (0.036 + i % 3 * 0.01);
        const y = fountain.y + Math.sin(a) * art.height * 0.033 + Math.sin(a * 2) * art.height * 0.012;
        points.push({ x, y });
        const radius = Math.max(1.3, art.width * 0.004);
        flakes.lineStyle(Math.max(0.6, art.width * 0.0012), 0xffdf9d, 0.85);
        for (let arm = 0; arm < 3; arm++) {
          const angle = arm * Math.PI / 3 + a * 0.3;
          flakes.lineBetween(x - Math.cos(angle) * radius, y - Math.sin(angle) * radius,
            x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
        }
      }
      flakes.lineStyle(Math.max(0.5, art.width * 0.0008), 0xffdf9d, 0.20);
      points.forEach((p, i) => { const q = points[(i + 1) % points.length]!; flakes.lineBetween(p.x, p.y, q.x, q.y); });
    };
    draw(0);
    if (!reduced) scene.tweens.addCounter({ from: 0, to: Math.PI * 2, duration: 18000,
      repeat: -1, onUpdate: tween => draw(tween.getValue() ?? 0) });
  }
  if (!controls || !onAwakened) return objects;
  pilotTargets.cite_immobile.forEach((target, index) => {
    controls.add(`city-window-${index}`, px(target.x), py(target.y),
      Math.max(36, art.width * (index === 1 ? 0.18 : 0.06)), Math.max(38, art.height * 0.09), () => {
        if (awakening || busy.has(index) || scene.children.getByName('tutorial-paper')) return;
        busy.add(index); illuminate(index);
        const finish = () => {
          busy.delete(index);
          if (!visited.has(index)) { visited.add(index); onAwakened(index, fountain.x, fountain.y); }
        };
        if (reduced) { finish(); return; }
        const spark = scene.add.graphics().setName(`city-travelling-light-${index}`);
        scene.tweens.addCounter({ from: 0, to: 1, duration: 1200, onUpdate: tween => {
          const t = tween.getValue() ?? 0;
          spark.clear().fillStyle(0xffe4a4, Math.sin(t * Math.PI));
          for (let n = 0; n < 4; n++) spark.fillCircle(
            Phaser.Math.Linear(px(target.x), fountain.x, t) + Math.sin(t * 6 + n) * art.width * 0.007,
            Phaser.Math.Linear(py(target.y), fountain.y, t) - Math.sin(t * Math.PI) * art.height * 0.08 + n * 2,
            Math.max(1, art.width * 0.0025));
        }, onComplete: () => { spark.destroy(); finish(); } });
      }, false);
  });
  return objects;
}
