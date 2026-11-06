import Phaser from 'phaser';
import { AdventureControls, reducedMotion } from './adventureMap';
import { pilotTargets } from '../../domain/pilotExploration';
import type { WorldFrame } from './pilotWorlds';

const pads = ['far', 'middle', 'near'];
const targets = pilotTargets.marais_des_lucioles;
const ready = (scene: Phaser.Scene) => ['water', ...pads.map(id => `pad-${id}`)]
  .every(id => scene.textures.exists(`adventure-marsh-${id}`));

export function prepareMarshPostcard(scene: Phaser.Scene): void {
  const key = 'destination-marais_des_lucioles';
  if (!ready(scene) || !scene.textures.exists(key)) return;
  const old = scene.textures.get(key).getSourceImage();
  if (old instanceof HTMLCanvasElement && old.dataset.sharedMarshLilies) return;
  const frame = scene.textures.getFrame('adventure-marsh-water');
  const canvas = document.createElement('canvas');
  canvas.width = 1024; canvas.height = 1024; canvas.dataset.sharedMarshLilies = 'true';
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return;
  context.imageSmoothingEnabled = true; context.imageSmoothingQuality = 'high';
  for (const id of ['water', ...pads.map(id => `pad-${id}`)]) {
    const f = scene.textures.getFrame(`adventure-marsh-${id}`);
    context.drawImage(f.source.image as CanvasImageSource, f.cutX, f.cutY, f.cutWidth, f.cutHeight,
      0, 0, frame.width, frame.height);
  }
  scene.textures.remove(key);
  scene.textures.addCanvas(key, canvas)?.get().setSize(frame.width, frame.height, 0, 0);
}

/** Native soft particle, rather than a sparkle marker or a repurposed UI icon. */
function fireflyTexture(scene: Phaser.Scene): string {
  const key = 'marsh-firefly-light';
  if (scene.textures.exists(key)) return key;
  const canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 64;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (context) {
    const glow = context.createRadialGradient(32, 32, 0, 32, 32, 30);
    glow.addColorStop(0, 'rgba(255,250,204,1)');
    glow.addColorStop(0.18, 'rgba(255,240,153,1)');
    glow.addColorStop(0.30, 'rgba(255,218,97,0.60)');
    glow.addColorStop(0.65, 'rgba(255,205,78,0.16)');
    glow.addColorStop(1, 'rgba(255,205,78,0)');
    context.fillStyle = glow; context.fillRect(0, 0, 64, 64);
  }
  scene.textures.addCanvas(key, canvas);
  return key;
}

// Free flight above the existing winding jetty, never into the lantern's glass.
const flightGroups = [
  [[0.61, 0.50], [0.65, 0.48], [0.70, 0.46], [0.74, 0.45], [0.77, 0.44]],
  [[0.79, 0.64], [0.73, 0.60], [0.67, 0.58], [0.61, 0.56], [0.59, 0.53]],
  [[0.60, 0.84], [0.66, 0.80], [0.73, 0.76], [0.79, 0.72], [0.81, 0.67]],
];
const reeds = [{ x: 0.87, y: 0.40 }, { x: 0.40, y: 0.53 }, { x: 0.38, y: 0.81 }];

export function addMarshFireflies(scene: Phaser.Scene, controls: AdventureControls, art: WorldFrame,
  visited: readonly number[], onAwakened: (index: number, x: number, y: number) => void,
  awakening: boolean, newlyAwakened?: number): void {
  if (!ready(scene)) return;
  const reduced = reducedMotion(), awake = new Set(visited), busy = new Set<number>();
  (scene.children.getByName('exploration-art') as Phaser.GameObjects.Image | null)
    ?.setTexture('adventure-marsh-water').setDisplaySize(art.width, art.height);
  const lightKey = fireflyTexture(scene);
  const wake = (index: number, emerging: boolean) => {
    const origin = reeds[index]!;
    flightGroups[index]!.forEach(([px = 0, py = 0], flyIndex) => {
      const x = art.left + art.width * px, y = art.top + art.height * py;
      const fly = scene.add.image(x, y, lightKey).setName(`marsh-firefly-${index}-${flyIndex}`)
        .setDisplaySize(Math.max(7, art.width * 0.026), Math.max(7, art.width * 0.026)).setAlpha(0.95);
      const roam = () => {
        if (reduced) return;
        const state = { phase: flyIndex * 1.3 + index };
        scene.tweens.add({ targets: state, phase: state.phase + Math.PI * 2,
          duration: 5800 + flyIndex * 310 + index * 470, repeat: -1, onUpdate: () => {
            fly.setPosition(x + Math.sin(state.phase) * art.width * 0.006,
              y + Math.sin(state.phase * 2) * art.height * 0.008)
              .setAlpha(0.80 + Math.sin(state.phase + index) * 0.18);
          } });
      };
      if (emerging && !reduced) {
        fly.setPosition(art.left + art.width * origin.x, art.top + art.height * origin.y).setAlpha(0);
        scene.tweens.add({ targets: fly, x, y, alpha: 0.95, delay: flyIndex * 65,
          duration: 1300 + flyIndex * 90, ease: 'Sine.InOut', onComplete: roam });
      } else roam();
    });
  };
  // Keep the lily paint below both the water response and the flying lights.
  pads.forEach((id, index) => {
    const target = targets[index]!;
    const x = art.left + art.width * target.x, y = art.top + art.height * target.y;
    const pad = scene.add.image(x, y, `adventure-marsh-pad-${id}`).setOrigin(target.x, target.y)
      .setDisplaySize(art.width, art.height).setName(`marsh-pad-${index}`).setData('moving', false);
    const respond = () => {
      if (awakening || busy.has(index) || scene.children.getByName('tutorial-paper')) return;
      const finish = () => {
        busy.delete(index); pad.setData('moving', false);
        if (awake.has(index)) return;
        awake.add(index); wake(index, true); onAwakened(index, x, y);
      };
      if (reduced) { finish(); return; }
      busy.add(index); pad.setData('moving', true);
      for (let ring = 0; ring < 2; ring++) {
        const ripple = scene.add.ellipse(x, y + art.height * 0.008, art.width * 0.075, art.height * 0.018)
          .setStrokeStyle(1, 0xc4e1b0, 0.5).setAlpha(0).setName('marsh-water-ripple');
        scene.tweens.add({ targets: ripple, alpha: { from: 0.6, to: 0 },
          scaleX: 1.8, scaleY: 1.8, delay: ring * 130, duration: 850,
          ease: 'Sine.Out', onComplete: () => ripple.destroy() });
      }
      scene.tweens.add({ targets: pad, y: y + art.height * 0.004, angle: index % 2 ? 1.1 : -1.1,
        duration: 550, yoyo: true, ease: 'Sine.InOut', onComplete: finish });
    };
    controls.add(`touch-marsh-pad-${index}`, x, y, Math.max(22, art.width * 0.075), 40, respond, false);
  });
  visited.forEach(index => wake(index, awakening && newlyAwakened === index));
}
