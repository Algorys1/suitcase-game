import Phaser from 'phaser';
import { AdventureControls, reducedMotion } from './adventureMap';
import { pilotTargets } from '../../domain/pilotExploration';
import type { WorldFrame } from './pilotWorlds';

// Local paint patches include the flame, its bowl and the light cast on nearby stone.
const lamps = [
  { x: 0.414, y: 0.480, rx: 0.055, ry: 0.085 },
  { x: 0.530, y: 0.523, rx: 0.023, ry: 0.033 },
  { x: 0.638, y: 0.523, rx: 0.023, ry: 0.033 },
  { x: 0.854, y: 0.548, rx: 0.052, ry: 0.082 },
] as const;

function localPaint(scene: Phaser.Scene, index: number, unlit: boolean): string {
  const key = `necropole-${unlit ? 'unlit' : 'burning'}-${index}`;
  if (scene.textures.exists(key)) return key;
  const f = scene.textures.getFrame(unlit ? 'adventure-necropole-unlit' : 'destination-necropole_ardente');
  const original = scene.textures.getFrame('destination-necropole_ardente');
  const canvas = document.createElement('canvas'); canvas.width = original.width; canvas.height = original.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  const lamp = lamps[index]!;
  ctx.save(); ctx.translate(lamp.x * canvas.width, lamp.y * canvas.height);
  ctx.scale(lamp.rx * canvas.width, lamp.ry * canvas.height);
  const mask = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  mask.addColorStop(0, '#fff'); mask.addColorStop(0.62, '#fff'); mask.addColorStop(1, '#ffffff00');
  ctx.fillStyle = mask; ctx.fillRect(-1, -1, 2, 2); ctx.restore();
  ctx.globalCompositeOperation = 'source-in';
  ctx.drawImage(f.source.image as CanvasImageSource, f.cutX, f.cutY, f.cutWidth, f.cutHeight,
    0, 0, canvas.width, canvas.height);
  scene.textures.addCanvas(key, canvas)?.get().setSize(canvas.width, canvas.height, 0, 0);
  return key;
}

/** Preserve the original painting everywhere outside the four small lamp halos. */
export function necropoleBase(scene: Phaser.Scene): string {
  const key = 'necropole-base';
  if (scene.textures.exists(key)) return key;
  if (!scene.textures.exists('adventure-necropole-unlit')) return 'destination-necropole_ardente';
  const f = scene.textures.getFrame('destination-necropole_ardente');
  const canvas = document.createElement('canvas'); canvas.width = f.width; canvas.height = f.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(f.source.image as CanvasImageSource, f.cutX, f.cutY, f.cutWidth, f.cutHeight,
    0, 0, canvas.width, canvas.height);
  lamps.forEach((_lamp, index) => {
    const patch = scene.textures.getFrame(localPaint(scene, index, true));
    ctx.drawImage(patch.source.image as CanvasImageSource, 0, 0);
  });
  scene.textures.addCanvas(key, canvas)?.get().setSize(canvas.width, canvas.height, 0, 0);
  return key;
}

/** Four small, purpose-drawn engravings: sprout, sun, crescent and ember. */
function engraving(scene: Phaser.Scene, index: number, x: number, y: number, size: number) {
  const g = scene.add.graphics({ x, y }).setName(`necropole-symbol-${index}`).setScale(size);
  const lines: number[][][] = [
    [[[0, 0.45], [0, -0.4]], [[0, 0.05], [-0.3, -0.13], [-0.31, -0.39], [-0.1, -0.27], [0, 0.05]],
      [[0, 0.23], [0.31, 0.02], [0.32, -0.23], [0.1, -0.10], [0, 0.23]]],
    [[[-0.3, 0], [0, -0.3], [0.3, 0], [0, 0.3], [-0.3, 0]], [[0, -0.53], [0, -0.4]],
      [[0.4, 0], [0.53, 0]], [[0, 0.4], [0, 0.53]], [[-0.53, 0], [-0.4, 0]]],
    [[[0.2, -0.45], [-0.12, -0.35], [-0.32, -0.08], [-0.25, 0.25], [0.05, 0.43], [0.34, 0.32],
      [0.04, 0.21], [-0.03, -0.06], [0.2, -0.45]]],
    [[[0, -0.5], [-0.28, 0.05], [-0.23, 0.31], [0, 0.47], [0.24, 0.30], [0.29, 0.06], [0, -0.5]],
      [[0, -0.03], [-0.09, 0.20], [0, 0.30], [0.10, 0.20], [0, -0.03]]],
  ][index]!;
  for (const [width, color, alpha] of [[0.17, 0x714036, 0.75], [0.07, 0xffcc79, 1], [0.025, 0xfff1c0, 1]]) {
    g.lineStyle(width!, color!, alpha!);
    for (const line of lines) {
      g.beginPath(); line.forEach(([px, py], n) => { if (n === 0) g.moveTo(px!, py!); else g.lineTo(px!, py!); });
      g.strokePath();
    }
  }
  return g;
}

export function addNecropoleLamps(scene: Phaser.Scene, art: WorldFrame, steps: readonly number[],
  controls?: AdventureControls, onLit?: (index: number, x: number, y: number) => void,
  awakening = false): Array<Phaser.GameObjects.Image | Phaser.GameObjects.Graphics> {
  const objects: Array<Phaser.GameObjects.Image | Phaser.GameObjects.Graphics> = [];
  const reduced = reducedMotion(), visited = new Set(steps), busy = new Set<number>();
  const px = (x: number) => art.left + x * art.width, py = (y: number) => art.top + y * art.height;
  const symbols = new Set<number>(), burning = new Set<number>();
  const revealSymbol = (index: number) => {
    if (symbols.has(index)) return;
    symbols.add(index);
    const target = pilotTargets.necropole_ardente[index]!;
    const symbol = engraving(scene, index, px(target.x), py(target.y),
      art.width * [0.027, 0.027, 0.028, 0.026][index]!)
      .setAngle([-35, 8, 40, 70][index]!).setAlpha(0.9);
    objects.push(symbol);
    if (!reduced) scene.tweens.add({ targets: symbol, alpha: 0.5, duration: 2300 + index * 310,
      ease: 'Sine.InOut', yoyo: true, repeat: -1 });
  };
  const lightLamp = (index: number) => {
    if (burning.has(index)) return;
    burning.add(index);
    const patch = scene.add.image(art.left, art.top, localPaint(scene, index, false)).setOrigin(0)
      .setDisplaySize(art.width, art.height).setName(`necropole-lamp-${index}`);
    objects.push(patch);
    if (!reduced) scene.tweens.add({ targets: patch, alpha: 0.83, duration: 430 + index * 119,
      yoyo: true, repeat: -1, ease: 'Sine.InOut' });
  };
  steps.forEach(index => { revealSymbol(index); lightLamp(index); });
  if (!controls || !onLit) return objects;
  pilotTargets.necropole_ardente.forEach((target, index) => {
    controls.add(`necropole-stone-${index}`, px(target.x), py(target.y),
      Math.max(36, art.width * 0.065), Math.max(36, art.height * 0.08), () => {
        if (awakening || busy.has(index) || scene.children.getByName('tutorial-paper')) return;
        busy.add(index); revealSymbol(index);
        const finish = () => {
          lightLamp(index); busy.delete(index);
          if (!visited.has(index)) { visited.add(index); onLit(index, px(0.53), py(0.48)); }
        };
        if (reduced) { finish(); return; }
        const lamp = lamps[index]!;
        const ember = scene.add.graphics().setName(`necropole-ember-${index}`);
        scene.tweens.addCounter({ from: 0, to: 1, duration: 1050, onUpdate: tween => {
          const t = tween.getValue() ?? 0;
          const x = Phaser.Math.Linear(px(target.x), px(lamp.x), t);
          const y = Phaser.Math.Linear(py(target.y), py(lamp.y), t) - Math.sin(t * Math.PI) * art.height * 0.055;
          ember.clear().fillStyle(0xffb955, 0.18).fillCircle(x, y, Math.max(3, art.width * 0.012))
            .fillStyle(0xffe4a1, 0.9).fillCircle(x, y, Math.max(1.3, art.width * 0.003));
        }, onComplete: () => { ember.destroy(); finish(); } });
      }, false);
  });
  return objects;
}
