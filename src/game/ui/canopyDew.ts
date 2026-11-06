import Phaser from 'phaser';
import { AdventureControls, reducedMotion } from './adventureMap';
import { pilotTargets } from '../../domain/pilotExploration';
import type { WorldFrame } from './pilotWorlds';

const backgroundKey = 'destination-canopee_des_brumes';
const tips = [{ x: 0.158, y: 0.121 }, { x: 0.25, y: 0.178 }, { x: 0.445, y: 0.10 }];
const dewSpots = [{ x: 0.151, y: 0.105 }, { x: 0.243, y: 0.162 }, { x: 0.437, y: 0.084 }];
const landings = [0.315, 0.34, 0.36];
const waterTop = 778, waterBottom = 842;

/** Sample only the water inside the original cup; no bridge pixels enter this layer. */
function waterTexture(scene: Phaser.Scene): string {
  const key = 'canopy-cup-water-rim';
  if (scene.textures.exists(key)) return key;
  const source = scene.textures.getFrame('canopy-water-source');
  const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 1024;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return backgroundKey;
  context.beginPath();
  context.save(); context.scale(1024 / 1448, 768 / 1086);
  context.moveTo(368, 802);
  context.bezierCurveTo(379, 789, 424, 781, 469, 781);
  context.bezierCurveTo(533, 776, 607, 785, 665, 798);
  context.lineTo(636, 811);
  context.bezierCurveTo(581, 821, 512, 833, 451, 841);
  context.bezierCurveTo(410, 833, 379, 819, 368, 802);
  context.restore();
  context.closePath(); context.clip();
  context.drawImage(source.source.image as CanvasImageSource, source.cutX, source.cutY,
    source.cutWidth, source.cutHeight, 0, 0, 1024, 768);
  scene.textures.addCanvas(key, canvas)?.get().setSize(1024, 768, 0, 0);
  return key;
}

/** A soft brush-like steam wisp in the ivory and lavender of the landscape. */
function mistTexture(scene: Phaser.Scene): string {
  const key = 'canopy-cup-mist';
  if (scene.textures.exists(key)) return key;
  const canvas = document.createElement('canvas'); canvas.width = 128; canvas.height = 256;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (context) {
    const path = new Path2D('M64 235 C12 210 113 172 74 145 C28 116 19 98 57 73 C91 50 99 38 77 18');
    context.lineCap = 'round'; context.lineJoin = 'round';
    context.filter = 'blur(9px)'; context.strokeStyle = 'rgba(255,244,228,0.50)'; context.lineWidth = 20;
    context.stroke(path);
    context.filter = 'blur(2px)'; context.strokeStyle = 'rgba(255,250,240,0.20)'; context.lineWidth = 5;
    context.stroke(path);
  }
  scene.textures.addCanvas(key, canvas);
  return key;
}

function dropTexture(scene: Phaser.Scene): string {
  const key = 'canopy-water-drop';
  if (scene.textures.exists(key)) return key;
  const canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 96;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (context) {
    const fill = context.createLinearGradient(10, 20, 50, 88);
    fill.addColorStop(0, '#ffffef'); fill.addColorStop(0.4, '#d8eee5b0'); fill.addColorStop(1, '#96b9b8c0');
    context.beginPath(); context.moveTo(32, 7); context.bezierCurveTo(24, 29, 10, 43, 10, 64);
    context.bezierCurveTo(10, 93, 54, 93, 54, 64); context.bezierCurveTo(54, 43, 40, 29, 32, 7);
    context.fillStyle = fill; context.fill(); context.strokeStyle = '#faffed'; context.lineWidth = 2;
    context.stroke(); context.beginPath(); context.ellipse(23, 57, 4, 9, 0.4, 0, Math.PI * 2);
    context.fillStyle = '#ffffffc0'; context.fill();
  }
  scene.textures.addCanvas(key, canvas);
  return key;
}

/** Reuse the cup's painted glass highlights, making its old backdrop transparent. */
function beadTexture(scene: Phaser.Scene): string {
  const key = 'canopy-leaf-painted-dew';
  if (scene.textures.exists(key)) return key;
  const source = scene.textures.getFrame('canopy-water-source');
  const canvas = document.createElement('canvas'); canvas.width = 128; canvas.height = 128;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (context) {
    context.imageSmoothingEnabled = true; context.imageSmoothingQuality = 'high';
    context.beginPath(); context.ellipse(37, 32, 32, 28, 0, 0, Math.PI * 2); context.clip();
    context.drawImage(source.source.image as CanvasImageSource,
      source.cutX + 429 / 1448 * source.cutWidth, source.cutY + 720 / 1086 * source.cutHeight,
      37 / 1448 * source.cutWidth, 32 / 1086 * source.cutHeight, 0, 0, 74, 64);
    const pixels = context.getImageData(0, 0, 74, 64);
    for (let i = 0; i < pixels.data.length; i += 4) {
      // Keep the painted pale reflections. The old green leaf, golden cup rim
      // and coloured sky are keyed out so the current leaf shows through.
      const pale = Math.min(pixels.data[i]!, pixels.data[i + 1]!, pixels.data[i + 2]!);
      const x = i / 4 % 74, y = Math.floor(i / 4 / 74);
      const radius = Math.hypot((x - 37) / 32, (y - 32) / 28);
      const rim = Math.exp(-(((radius - 0.94) / 0.09) ** 2)) * 0.48
        * Phaser.Math.Clamp((pale - 90) / 100, 0, 1);
      pixels.data[i + 3] = Math.round(pixels.data[i + 3]!
        * Math.max(rim, Phaser.Math.Clamp((pale - 150) / 85, 0, 1)));
    }
    context.putImageData(pixels, 0, 0);
  }
  scene.textures.addCanvas(key, canvas)?.get().setSize(74, 64, 0, 0);
  return key;
}

/** Static views share the exact filling level and steam geometry used in exploration. */
export function canopyPostcard(scene: Phaser.Scene, steps: readonly number[]): string {
  const level = steps.length;
  if (!level || !scene.textures.exists('canopy-water-source')) return backgroundKey;
  const key = `canopy-cup-painted-dew-stage-${steps.join('-')}`;
  if (scene.textures.exists(key)) return key;
  const frame = scene.textures.getFrame(backgroundKey);
  const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 1024;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return backgroundKey;
  const draw = (f: Phaser.Textures.Frame, x: number, y: number, w: number, h: number) =>
    context.drawImage(f.source.image as CanvasImageSource, f.cutX, f.cutY, f.cutWidth, f.cutHeight, x, y, w, h);
  draw(frame, 0, 0, frame.width, frame.height);
  const row = (waterBottom - (waterBottom - waterTop) * level / 3) / 1086 * frame.height;
  context.save(); context.beginPath(); context.rect(0, row, frame.width, frame.height - row); context.clip();
  draw(scene.textures.getFrame(waterTexture(scene)), 0, 0, frame.width, frame.height); context.restore();
  const mist = scene.textures.getFrame(mistTexture(scene));
  for (let i = 0; i < level; i++) {
    const width = frame.width * (0.055 + level * 0.018), height = width * mist.height / mist.width;
    context.globalAlpha = 0.60;
    draw(mist, frame.width * (0.362 + i * 0.007) - width / 2,
      frame.height * 0.747 - height * 235 / 256, width, height);
  }
  context.globalAlpha = 1;
  const bead = scene.textures.getFrame(beadTexture(scene)), size = frame.width * 0.022;
  for (const index of steps) {
    const spot = dewSpots[index]!;
    draw(bead, frame.width * spot.x - size / 2, frame.height * spot.y - size * 64 / 74 / 2,
      size, size * 64 / 74);
  }
  scene.textures.addCanvas(key, canvas)?.get().setSize(frame.width, frame.height, 0, 0);
  return key;
}

export function addCanopyDew(scene: Phaser.Scene, controls: AdventureControls, art: WorldFrame,
  steps: readonly number[], onFilled: (index: number, x: number, y: number) => void,
  awakening: boolean): void {
  if (!scene.textures.exists('canopy-water-source')) return;
  const reduced = reducedMotion(), visited = new Set(steps), busy = new Set<number>();
  (scene.children.getByName('exploration-art') as Phaser.GameObjects.Image | null)
    ?.setTexture(backgroundKey).setDisplaySize(art.width, art.height);
  const px = (x: number) => art.left + art.width * x, py = (y: number) => art.top + art.height * y;
  const water = scene.add.image(art.left, art.top, waterTexture(scene)).setOrigin(0)
    .setDisplaySize(art.width, art.height).setName('canopy-cup-water');
  const fill = { level: steps.length };
  const updateWater = () => {
    const frame = water.frame;
    const row = (waterBottom - (waterBottom - waterTop) * fill.level / 3) / 1086 * frame.height;
    water.setCrop(0, row, frame.width, frame.height - row).setVisible(fill.level > 0);
    water.setData('level', fill.level);
  };
  updateWater();
  const marked = new Set<number>();
  const markLeaf = (index: number) => {
    if (marked.has(index)) return;
    marked.add(index);
    const spot = dewSpots[index]!;
    const bead = scene.add.image(px(spot.x), py(spot.y), beadTexture(scene)).setOrigin(0.5)
      .setDisplaySize(Math.max(8, art.width * 0.022), Math.max(8, art.width * 0.022) * 64 / 74)
      .setAlpha(1).setName(`canopy-dew-bead-${index}`);
    if (!reduced) scene.tweens.add({ targets: bead, alpha: 0.85,
      duration: 2300 + index * 280, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
  };
  steps.forEach(markLeaf);
  const mists = new Set<number>();
  let mistLevel = steps.length;
  const addMist = (level: number) => {
    mistLevel = level;
    for (let i = 0; i < level; i++) {
      if (mists.has(i)) {
        const existing = scene.children.getByName(`canopy-mist-${i}`) as Phaser.GameObjects.Image | null;
        if (existing) existing.setScale(art.width * (0.055 + level * 0.018) / existing.width);
        continue;
      }
      mists.add(i);
      const mist = scene.add.image(px(0.362 + i * 0.007), py(0.747), mistTexture(scene))
        .setOrigin(0.5, 235 / 256).setAlpha(0.60).setName(`canopy-mist-${i}`);
      mist.setScale(art.width * (0.055 + level * 0.018) / mist.width);
      if (!reduced) {
        const state = { p: i / 3 };
        scene.tweens.add({ targets: state, p: state.p + 1, duration: awakening ? 2600 : 4200,
          repeat: -1, onUpdate: () => {
            const phase = state.p * Math.PI * 2;
            mist.setPosition(px(0.362 + i * 0.007) + Math.sin(phase) * art.width * 0.004,
              py(0.747))
              .setScale(art.width * (0.055 + mistLevel * 0.018) / mist.width * (1 + Math.sin(phase) * 0.04))
              .setAlpha(0.55 + Math.sin(phase) * 0.12);
          } });
      }
    }
  };
  addMist(steps.length);
  const ripple = (x: number, y: number) => {
    const wave = scene.add.ellipse(x, y, Math.max(5, art.width * 0.014), Math.max(2, art.height * 0.005))
      .setStrokeStyle(1, 0xfffae9, 0.75).setName('canopy-cup-ripple');
    if (reduced) { wave.destroy(); return; }
    scene.tweens.add({ targets: wave, scaleX: 3, scaleY: 2, alpha: 0, duration: 460,
      onComplete: () => wave.destroy() });
  };
  pilotTargets.canopee_des_brumes.forEach((leaf, index) => {
    const width = Math.max(36, art.width * 0.085), height = Math.max(38, art.height * 0.10);
    const x = Phaser.Math.Clamp(px(leaf.x), art.left + width / 2, art.left + art.width - width / 2);
    const y = Phaser.Math.Clamp(py(leaf.y), art.top + height / 2, art.top + art.height - height / 2);
    controls.add(`canopy-leaf-${index}`, x, y, width, height, () => {
      if (awakening || busy.has(index) || scene.children.getByName('tutorial-paper')) return;
      busy.add(index);
      const next = visited.has(index) ? visited.size : visited.size + 1;
      const landing = { x: px(landings[index]!), y: py(0.765 - next * 0.007) };
      const finish = () => {
        busy.delete(index);
        const fresh = !visited.has(index);
        visited.add(index);
        markLeaf(index);
        scene.tweens.killTweensOf(fill);
        if (reduced) { fill.level = visited.size; updateWater(); }
        else scene.tweens.add({ targets: fill, level: visited.size, duration: 300, onUpdate: updateWater });
        addMist(visited.size); ripple(landing.x, landing.y);
        if (fresh) onFilled(index, landing.x, landing.y);
      };
      if (reduced) { finish(); return; }
      const tip = tips[index]!;
      const drop = scene.add.image(px(leaf.x), py(leaf.y), dropTexture(scene))
        .setDisplaySize(Math.max(5, art.width * 0.014), Math.max(7.5, art.width * 0.021))
        .setAlpha(0).setName(`canopy-drop-${index}`);
      scene.tweens.add({ targets: drop, x: px(tip.x), y: py(tip.y), alpha: 1, duration: 360,
        ease: 'Sine.InOut', onComplete: () => {
          const curve = new Phaser.Curves.CubicBezier(new Phaser.Math.Vector2(drop.x, drop.y),
            new Phaser.Math.Vector2(drop.x, py(0.33)),
            new Phaser.Math.Vector2(landing.x, py(0.62)), new Phaser.Math.Vector2(landing.x, landing.y));
          const state = { p: 0 };
          scene.tweens.add({ targets: state, p: 1, delay: 100, duration: 1400, ease: 'Sine.InOut', onUpdate: () => {
            const point = curve.getPoint(state.p); drop.setPosition(point.x, point.y);
          }, onComplete: () => { drop.destroy(); finish(); } });
        } });
    }, false);
  });
}
