import Phaser from 'phaser';
import { AdventureControls, reducedMotion } from './adventureMap';
import { pilotTargets } from '../../domain/pilotExploration';
import type { WorldFrame } from './pilotWorlds';

const dormant = 'adventure-grotto-dormant';
const awake = 'destination-grottes_sporiferes';
const sky = [
  [[0.365, 0.11], [0.405, 0.075], [0.438, 0.12], [0.46, 0.045],
    [0.51, 0.065], [0.54, 0.025], [0.58, 0.07], [0.635, 0.035]],
  [[0.50, 0.20], [0.535, 0.235], [0.56, 0.18], [0.61, 0.19],
    [0.65, 0.13], [0.69, 0.15], [0.74, 0.10], [0.77, 0.14]],
  [[0.81, 0.17], [0.845, 0.135], [0.87, 0.18], [0.90, 0.135],
    [0.91, 0.225], [0.95, 0.21], [0.97, 0.27], [0.975, 0.235]],
];
const sources = [{ x: 0.35, y: 0.29 }, { x: 0.46, y: 0.48 }, { x: 0.94, y: 0.34 }];
const capRadii = [{ x: 0.21, y: 0.14 }, { x: 0.12, y: 0.085 }, { x: 0.055, y: 0.045 }];

/** Native soft gold light; a spore, not an icon or a marker for a hidden target. */
function sporeTexture(scene: Phaser.Scene): string {
  const key = 'grotto-spore-light';
  if (scene.textures.exists(key)) return key;
  const canvas = document.createElement('canvas'); canvas.width = 32; canvas.height = 32;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (context) {
    const glow = context.createRadialGradient(16, 16, 0, 16, 16, 16);
    glow.addColorStop(0, '#fff8d8'); glow.addColorStop(0.14, '#ffe9ac');
    glow.addColorStop(0.35, '#ffcf6970'); glow.addColorStop(1, '#eaa65300');
    context.fillStyle = glow; context.fillRect(0, 0, 32, 32);
  }
  scene.textures.addCanvas(key, canvas);
  return key;
}

/** Only the cyan paint within the existing cap responds to a touch. */
function capTexture(scene: Phaser.Scene, index: number): string {
  const key = `grotto-cap-light-${index}`;
  if (scene.textures.exists(key)) return key;
  const frame = scene.textures.getFrame(dormant), target = pilotTargets.grottes_sporiferes[index]!;
  const radius = capRadii[index]!;
  const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 1024;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return dormant;
  context.beginPath(); context.ellipse(target.x * frame.width, target.y * frame.height,
    radius.x * frame.width, radius.y * frame.height, 0, 0, Math.PI * 2); context.clip();
  context.drawImage(frame.source.image as CanvasImageSource, frame.cutX, frame.cutY,
    frame.cutWidth, frame.cutHeight, 0, 0, frame.width, frame.height);
  const pixels = context.getImageData(0, 0, frame.width, frame.height);
  for (let i = 0; i < pixels.data.length; i += 4) {
    const r = pixels.data[i]!, g = pixels.data[i + 1]!, b = pixels.data[i + 2]!;
    if (!(b > r * 1.2 && g > r * 1.1 && g > 110)) pixels.data[i + 3] = 0;
  }
  context.putImageData(pixels, 0, 0);
  scene.textures.addCanvas(key, canvas)?.get().setSize(frame.width, frame.height, 0, 0);
  return key;
}

export function grottoPostcard(scene: Phaser.Scene, steps: readonly number[]): string {
  if (!scene.textures.exists(dormant) || steps.length === 3) return awake;
  if (!steps.length) return dormant;
  const key = `grotto-postcard-${steps.join('-')}`;
  if (scene.textures.exists(key)) return key;
  const frame = scene.textures.getFrame(dormant);
  const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 1024;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return dormant;
  context.drawImage(frame.source.image as CanvasImageSource, frame.cutX, frame.cutY,
    frame.cutWidth, frame.cutHeight, 0, 0, frame.width, frame.height);
  for (const index of steps) for (const [n, [x = 0, y = 0]] of sky[index]!.entries()) {
    const px = x * frame.width, py = y * frame.height, r = frame.width * (0.006 + n % 3 * 0.002);
    const glow = context.createRadialGradient(px, py, 0, px, py, r);
    glow.addColorStop(0, '#fff8d8'); glow.addColorStop(0.14, '#ffe9ac');
    glow.addColorStop(0.35, '#ffcf6970'); glow.addColorStop(1, '#eaa65300');
    context.fillStyle = glow; context.fillRect(px - r, py - r, r * 2, r * 2);
  }
  scene.textures.addCanvas(key, canvas)?.get().setSize(frame.width, frame.height, 0, 0);
  return key;
}

export function addGrottoSpores(scene: Phaser.Scene, controls: AdventureControls, art: WorldFrame,
  steps: readonly number[], onReleased: (index: number, x: number, y: number) => void,
  awakening: boolean): void {
  if (!scene.textures.exists(dormant)) return;
  const reduced = reducedMotion(), released = new Set(steps), busy = new Set<number>();
  const texture = sporeTexture(scene);
  const px = (x: number) => art.left + art.width * x, py = (y: number) => art.top + art.height * y;
  const full = steps.length === 3;
  const background = scene.children.getByName('exploration-art') as Phaser.GameObjects.Image | null;
  background?.setTexture(full && !awakening ? awake : dormant).setDisplaySize(art.width, art.height);
  if (awakening) {
    const reveal = scene.add.image(art.left, art.top, awake).setOrigin(0)
      .setDisplaySize(art.width, art.height).setAlpha(reduced ? 1 : 0).setName('grotto-geode-awakening');
    if (!reduced) scene.tweens.add({ targets: reveal, alpha: 1, delay: 850, duration: 800, ease: 'Sine.InOut' });
  }
  const release = (index: number, animate: boolean) => {
    const from = sources[index]!;
    sky[index]!.forEach(([x = 0, y = 0], n) => {
      const spore = scene.add.image(px(x), py(y), texture).setBlendMode(Phaser.BlendModes.ADD)
        .setDisplaySize(Math.max(4, art.width * (0.012 + n % 3 * 0.004)),
          Math.max(4, art.width * (0.012 + n % 3 * 0.004)))
        .setAlpha(0.8).setName(`grotto-spore-${index}-${n}`);
      const settle = () => {
        if (reduced) return;
        const phase = { a: n * 1.7 + index };
        scene.tweens.add({ targets: phase, a: phase.a + Math.PI * 2, duration: 5500 + n * 240,
          repeat: -1, onUpdate: () => spore.setPosition(px(x) + Math.sin(phase.a) * art.width * 0.003,
            py(y) + Math.cos(phase.a * 0.7) * art.height * 0.004)
            .setAlpha(0.62 + Math.sin(phase.a) * 0.15) });
      };
      if (awakening && !reduced) {
        const curve = new Phaser.Curves.CubicBezier(new Phaser.Math.Vector2(px(x), py(y)),
          new Phaser.Math.Vector2(px(0.65), py(0.24)), new Phaser.Math.Vector2(px(0.43), py(0.53)),
          new Phaser.Math.Vector2(px(0.24), py(0.76)));
        const state = { p: 0 };
        scene.tweens.add({ targets: state, p: 1, duration: 1100, delay: n * 28, ease: 'Sine.In',
          onUpdate: () => { const point = curve.getPoint(state.p); spore.setPosition(point.x, point.y).setAlpha(0.8 - state.p * 0.6); },
          onComplete: () => spore.destroy() });
      } else if (animate && !reduced) {
        const curve = new Phaser.Curves.CubicBezier(new Phaser.Math.Vector2(px(from.x), py(from.y)),
          new Phaser.Math.Vector2(px(from.x + 0.045), py(from.y - 0.08)),
          new Phaser.Math.Vector2(px(x - 0.02), py(y + 0.05)), new Phaser.Math.Vector2(px(x), py(y)));
        const state = { p: 0 };
        spore.setPosition(px(from.x), py(from.y)).setAlpha(0);
        scene.tweens.add({ targets: state, p: 1, duration: 750, delay: n * 35,
          onUpdate: () => { const point = curve.getPoint(state.p); spore.setPosition(point.x, point.y).setAlpha(Math.min(0.8, state.p * 2)); },
          onComplete: settle });
      } else settle();
    });
  };
  steps.forEach(index => release(index, false));
  pilotTargets.grottes_sporiferes.forEach((target, index) => {
    const radius = capRadii[index]!;
    controls.add(`grotto-mushroom-${index}`, px(target.x), py(target.y),
      Math.max(40, art.width * radius.x * 1.8), Math.max(38, art.height * radius.y * 1.8), () => {
        if (awakening || busy.has(index) || scene.children.getByName('tutorial-paper')) return;
        if (!reduced) {
          const glow = scene.add.image(art.left, art.top, capTexture(scene, index)).setOrigin(0)
            .setDisplaySize(art.width, art.height).setBlendMode(Phaser.BlendModes.ADD)
            .setAlpha(0.20).setName('grotto-mushroom-response');
          scene.tweens.add({ targets: glow, alpha: 0, duration: 550, onComplete: () => glow.destroy() });
        }
        if (released.has(index)) return;
        busy.add(index); release(index, true);
        const finish = () => { busy.delete(index); released.add(index); onReleased(index, px(target.x), py(target.y)); };
        if (reduced) finish();
        else scene.tweens.addCounter({ from: 0, to: 1, duration: 1020, onComplete: finish });
      }, false);
  });
}
