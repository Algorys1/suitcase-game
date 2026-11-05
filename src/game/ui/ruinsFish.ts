import Phaser from 'phaser';
import { AdventureControls, reducedMotion } from './adventureMap';
import type { WorldFrame } from './pilotWorlds';

const schools = [
  { key: 'near', width: 0.095, distantWidth: 0.060, from: { x: 0.381, y: 0.274 }, to: { x: 0.655, y: 0.399 },
    a: { x: 0.48, y: 0.28 }, b: { x: 0.60, y: 0.37 } },
  { key: 'far', width: 0.135, distantWidth: 0.060, from: { x: 0.872, y: 0.183 }, to: { x: 0.792, y: 0.367 },
    a: { x: 0.76, y: 0.20 }, b: { x: 0.75, y: 0.32 } },
];

/** Static views and exploration share the exact paint, fish frames and placement. */
export function prepareRuinsPostcard(scene: Phaser.Scene): void {
  const key = 'destination-ruines_englouties';
  if (!scene.textures.exists(key) || !scene.textures.exists('adventure-ruins-water')) return;
  const previous = scene.textures.get(key).getSourceImage();
  if (previous instanceof HTMLCanvasElement && previous.dataset.sharedRuinsFish) return;
  if (!schools.every(school => scene.textures.exists(`adventure-ruins-fish-${school.key}`))) return;
  const background = scene.textures.getFrame('adventure-ruins-water');
  const canvas = document.createElement('canvas');
  canvas.width = 2 ** Math.ceil(Math.log2(background.width));
  canvas.height = 2 ** Math.ceil(Math.log2(background.height));
  canvas.dataset.sharedRuinsFish = 'true';
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return;
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(background.source.image as CanvasImageSource,
    background.cutX, background.cutY, background.cutWidth, background.cutHeight,
    0, 0, background.width, background.height);
  for (const school of schools) {
    const fish = scene.textures.getFrame(`adventure-ruins-fish-${school.key}`);
    const width = background.width * school.width, height = width * fish.height / fish.width;
    context.drawImage(fish.source.image as CanvasImageSource,
      fish.cutX, fish.cutY, fish.cutWidth, fish.cutHeight,
      background.width * school.from.x - width / 2, background.height * school.from.y - height / 2, width, height);
  }
  scene.textures.remove(key);
  scene.textures.addCanvas(key, canvas)?.get().setSize(background.width, background.height, 0, 0);
}

// Silhouettes of the existing columns and arch roofs along the two swim routes.
// The foreground is sampled from the same background, so no stone is repainted.
const stoneSilhouettes = [
  [[0.511, 0.235], [0.602, 0.239], [0.624, 0.293], [0.607, 0.325], [0.614, 0.538],
    [0.638, 0.568], [0.532, 0.572], [0.515, 0.525], [0.532, 0.324], [0.518, 0.305]],
  [[0.694, 0.318], [0.741, 0.322], [0.754, 0.369], [0.738, 0.387], [0.738, 0.466],
    [0.697, 0.467], [0.701, 0.383], [0.684, 0.366]],
  [[0.735, 0.315], [0.758, 0.283], [0.806, 0.262], [0.837, 0.270], [0.854, 0.302],
    [0.868, 0.317], [0.855, 0.434], [0.835, 0.434], [0.837, 0.322], [0.818, 0.297],
    [0.792, 0.293], [0.770, 0.309], [0.751, 0.337]],
];

function foregroundTexture(scene: Phaser.Scene): string | undefined {
  const key = 'ruins-fish-stone-foreground';
  if (scene.textures.exists(key)) return key;
  const frame = scene.textures.getFrame('adventure-ruins-water');
  if (!frame) return undefined;
  // Runtime canvas clipping is used here; Phaser 4's WebGL rendering differs
  // from the historical Phaser 3 GeometryMask path.
  const canvas = document.createElement('canvas');
  canvas.width = frame.width; canvas.height = frame.height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return undefined;
  context.beginPath();
  for (const polygon of stoneSilhouettes) {
    polygon.forEach(([x = 0, y = 0], index) => {
      if (index) context.lineTo(x * frame.width, y * frame.height);
      else context.moveTo(x * frame.width, y * frame.height);
    });
    context.closePath();
  }
  context.clip();
  context.drawImage(frame.source.image as CanvasImageSource, frame.cutX, frame.cutY, frame.cutWidth, frame.cutHeight,
    0, 0, frame.width, frame.height);
  scene.textures.addCanvas(key, canvas);
  return key;
}

/** Persistence belongs to the scene; the fish report arrival after their swim. */
export function addRuinsFish(scene: Phaser.Scene, controls: AdventureControls, art: WorldFrame,
  visited: readonly number[], onArrival: (index: number, x: number, y: number) => void,
  gathering = false): void {
  if (!['ruins-water', 'ruins-fish-near', 'ruins-fish-far'].every(id => scene.textures.exists(`adventure-${id}`))) return;
  const background = scene.children.getByName('exploration-art') as Phaser.GameObjects.Image | null;
  background?.setTexture('adventure-ruins-water').setDisplaySize(art.width, art.height);
  const point = (p: { x: number; y: number }) => new Phaser.Math.Vector2(art.left + p.x * art.width, art.top + p.y * art.height);
  schools.forEach((school, index) => {
    const home = point(school.from), other = point(school.to);
    let busy = false, away = visited.includes(index);
    const start = away ? other : home;
    const fish = scene.add.image(start.x, start.y, `adventure-ruins-fish-${school.key}`)
      .setName(`ruins-fish-${school.key}`).setData('swimming', false).setData('resting-place', away ? 1 : 0);
    fish.setScale(art.width * (away ? school.distantWidth : school.width) / fish.width);
    const name = `touch-fish-${school.key}`;
    if (visited.length === schools.length) {
      const phase = index * Math.PI;
      const orbit = (angle: number) => point({ x: 0.42 + Math.cos(angle) * 0.055, y: 0.40 + Math.sin(angle) * 0.027 });
      const rest = orbit(phase);
      fish.setName(`ruins-fish-${school.key}`).setData('circling', true);
      const circle = () => {
        if (reducedMotion()) return;
        const state = { angle: phase };
        scene.tweens.add({ targets: state, angle: phase + Math.PI * 2, duration: 7000,
          repeat: -1, onUpdate: () => {
            const p = orbit(state.angle);
            fish.setPosition(p.x, p.y).setFlipX(Math.sin(state.angle) > 0);
          } });
      };
      const scale = art.width * 0.055 / fish.width;
      if (gathering && !reducedMotion()) scene.tweens.add({ targets: fish,
        x: rest.x, y: rest.y, scaleX: scale, scaleY: scale, duration: 1000, ease: 'Sine.InOut', onComplete: circle });
      else { fish.setPosition(rest.x, rest.y).setScale(scale); circle(); }
      return;
    }
    const swim = () => {
      if (busy) return;
      busy = true;
      fish.setData('swimming', true);
      if (reducedMotion()) {
        scene.tweens.add({ targets: fish, alpha: { from: 0.5, to: 1 }, duration: 220,
          onComplete: () => {
            away = !away; busy = false;
            const destination = away ? other : home;
            fish.setPosition(destination.x, destination.y).setData('swimming', false).setData('resting-place', away ? 1 : 0);
            fish.setScale(art.width * (away ? school.distantWidth : school.width) / fish.width);
            controls.move(name, fish.x, fish.y);
            onArrival(index, fish.x, fish.y);
          } });
        return;
      }
      const destination = away ? home : other;
      fish.setFlipX(away);
      const curve = new Phaser.Curves.CubicBezier(new Phaser.Math.Vector2(fish.x, fish.y),
        point(away ? school.b : school.a), point(away ? school.a : school.b), destination);
      const progress = { p: 0 };
      scene.tweens.add({ targets: progress, p: 1, duration: 1350, ease: 'Sine.InOut', onUpdate: () => {
        const p = curve.getPoint(progress.p);
        // The rear openings are narrower: the whole school recedes into them,
        // rather than leaving fish permanently clipped by the stone columns.
        const depth = away ? 1 - progress.p : progress.p;
        fish.setScale(art.width * Phaser.Math.Linear(school.width, school.distantWidth, depth) / fish.width);
        fish.setPosition(p.x, p.y).setAngle(Math.sin(progress.p * Math.PI * 5) * 3);
        controls.move(name, p.x, p.y);
      }, onComplete: () => {
        away = !away; busy = false;
        fish.setPosition(destination.x, destination.y).setAngle(0)
          .setData('swimming', false).setData('resting-place', away ? 1 : 0);
        fish.setScale(art.width * (away ? school.distantWidth : school.width) / fish.width);
        controls.move(name, fish.x, fish.y);
        onArrival(index, fish.x, fish.y);
      } });
    };
    controls.add(name, start.x, start.y, Math.max(44, art.width * school.width), 44, swim, false);
  });
  const foreground = foregroundTexture(scene);
  if (foreground) scene.add.image(art.left + art.width / 2, art.top + art.height / 2, foreground)
    .setDisplaySize(art.width, art.height).setName('ruins-fish-foreground');
}
