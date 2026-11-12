import Phaser from 'phaser';
import { freshLampRub, inLamp, lampBody, lampRubComplete, rubLamp } from '../../domain/empireLamp';
import type { LampPoint } from '../../domain/empireLamp';
import { AdventureControls, reducedMotion } from './adventureMap';
import type { WorldFrame } from './pilotWorlds';

const original = 'destination-empire_des_sables';
let smokeSerial = 0;

export function empirePostcard(scene: Phaser.Scene, complete: boolean): string {
  const key = complete ? 'empire-gate-open' : 'empire-gate-closed';
  if (scene.textures.exists(key)) return key;
  const source = complete ? 'adventure-empire-open' : 'adventure-empire-closed';
  if (!scene.textures.exists(source)) return original;
  const f = scene.textures.getFrame(original), state = scene.textures.getFrame(source);
  const texture = scene.textures.createCanvas(key, 2 ** Math.ceil(Math.log2(f.width)), 2 ** Math.ceil(Math.log2(f.height)));
  if (!texture) return original;
  texture.get().setSize(f.width, f.height, 0, 0);
  const ctx = texture.getContext();
  ctx.drawImage(f.source.image as CanvasImageSource, f.cutX, f.cutY, f.cutWidth, f.cutHeight, 0, 0, f.width, f.height);
  ctx.save(); ctx.beginPath();
  // Confine both retouches to the gateway and its immediate wooden threshold.
  ctx.moveTo(0.628 * f.width, 0.625 * f.height); ctx.lineTo(0.628 * f.width, 0.509 * f.height);
  ctx.bezierCurveTo(0.628 * f.width, 0.479 * f.height, 0.655 * f.width, 0.455 * f.height, 0.683 * f.width, 0.443 * f.height);
  ctx.bezierCurveTo(0.716 * f.width, 0.457 * f.height, 0.737 * f.width, 0.481 * f.height, 0.737 * f.width, 0.512 * f.height);
  ctx.lineTo(0.737 * f.width, 0.625 * f.height); ctx.closePath(); ctx.clip();
  ctx.drawImage(state.source.image as CanvasImageSource, state.cutX, state.cutY, state.cutWidth, state.cutHeight,
    0, 0, f.width, f.height); ctx.restore(); texture.refresh(); return key;
}

const smooth = (v: number) => { const t = Phaser.Math.Clamp(v, 0, 1); return t * t * (3 - 2 * t); };
const noise = (x: number, y: number) => {
  const ix = Math.floor(x), iy = Math.floor(y), fx = smooth(x - ix), fy = smooth(y - iy);
  const hash = (a: number, b: number) => { const n = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return n - Math.floor(n); };
  return (hash(ix, iy) * (1 - fx) + hash(ix + 1, iy) * fx) * (1 - fy)
    + (hash(ix, iy + 1) * (1 - fx) + hash(ix + 1, iy + 1) * fx) * fy;
};

/** Soft, irregular density, anchored to the left-facing spout rather than a chain of circles. */
function smoke(scene: Phaser.Scene, art: WorldFrame, animate: boolean, strength = 1): Phaser.GameObjects.Image {
  const key = `empire-smoke-${++smokeSerial}`, texture = scene.textures.createCanvas(key, 128, 128)!;
  const ctx = texture.getContext(), pixels = ctx.createImageData(96, 128), state = { phase: 0 };
  texture.get().setSize(96, 128, 0, 0);
  const image = scene.add.image(art.left + art.width * 0.613, art.top + art.height * 0.519, key)
    .setOrigin(0).setDisplaySize(art.width * 0.13, art.height * 0.19).setAlpha(strength).setName('empire-lamp-smoke');
  const paint = () => {
    for (let y = 0; y < 128; y++) for (let x = 0; x < 96; x++) {
      const u = x / 95, rise = 1 - y / 127, phase = state.phase * Math.PI * 2;
      const center = 0.82 - rise * 0.46 + Math.sin(rise * 10 - phase) * rise * 0.10
        + Math.sin(rise * 19 + phase * 2) * rise * 0.035;
      const width = 0.019 + rise * 0.14, d = (u - center) / width;
      const curl = noise(u * 13 + Math.sin(phase), rise * 9 - Math.cos(phase)) * 0.65
        + noise(u * 27 - Math.cos(phase), rise * 20 + Math.sin(phase)) * 0.35;
      const alpha = Math.exp(-d * d * 2) * Math.sin(rise * Math.PI) ** 0.55 * (0.24 + curl * 0.76);
      const i = (y * 96 + x) * 4;
      pixels.data[i] = 147 + curl * 70; pixels.data[i + 1] = 222 + curl * 30;
      pixels.data[i + 2] = 219 + curl * 32; pixels.data[i + 3] = alpha * 200;
    }
    ctx.putImageData(pixels, 0, 0); texture.refresh();
  };
  paint();
  if (animate && !reducedMotion()) scene.tweens.add({ targets: state, phase: 1, duration: 16000, repeat: -1, onUpdate: paint });
  image.once('destroy', () => { scene.tweens.killTweensOf(state); scene.textures.remove(key); });
  return image;
}

export function drawEmpireSmoke(scene: Phaser.Scene, art: WorldFrame, complete: boolean): Phaser.GameObjects.Image[] {
  return complete ? [smoke(scene, art, true)] : [];
}

function smokeJourney(scene: Phaser.Scene, art: WorldFrame, onArrived: () => void): void {
  const trail = scene.add.graphics().setName('empire-travelling-smoke'), state = { reach: 0 };
  const path = new Phaser.Curves.Spline([new Phaser.Math.Vector2(0.720, 0.712), new Phaser.Math.Vector2(0.647, 0.690),
    new Phaser.Math.Vector2(0.578, 0.643), new Phaser.Math.Vector2(0.605, 0.576), new Phaser.Math.Vector2(0.685, 0.532)]);
  scene.tweens.add({ targets: state, reach: 1, duration: 1800, ease: 'Sine.InOut', onUpdate: () => {
    trail.clear();
    for (const [width, alpha] of [[0.024, 0.045], [0.013, 0.10], [0.005, 0.30]]) {
      trail.lineStyle(art.width * width!, 0xa8efdf, alpha!); trail.beginPath();
      for (let i = 0; i <= 70; i++) {
        const t = state.reach * i / 70, p = path.getPoint(t), curl = Math.sin(t * 28) * Math.sin(t * Math.PI) * 0.009;
        const x = art.left + (p.x + curl) * art.width, y = art.top + p.y * art.height;
        if (i === 0) trail.moveTo(x, y); else trail.lineTo(x, y);
      }
      trail.strokePath();
    }
  }, onComplete: () => {
    const opening = scene.add.image(art.left, art.top, empirePostcard(scene, true)).setOrigin(0)
      .setDisplaySize(art.width, art.height).setAlpha(0).setName('empire-gate-opening');
    scene.tweens.add({ targets: trail, alpha: 0, duration: 550 });
    scene.tweens.add({ targets: opening, alpha: 1, duration: 850, ease: 'Sine.InOut', onComplete: onArrived });
  } });
}

export function addEmpireLamp(scene: Phaser.Scene, controls: AdventureControls, art: WorldFrame,
  steps: readonly number[], onRubbed: () => { activated: boolean; collected: boolean },
  onOpened: (collected: boolean) => void, awakening: boolean): () => void {
  const complete = steps.length === 1;
  (scene.children.getByName('exploration-art') as Phaser.GameObjects.Image)
    .setTexture(empirePostcard(scene, complete)).setDisplaySize(art.width, art.height);
  drawEmpireSmoke(scene, art, complete);
  if (complete) return () => {};
  let rubbing = false, disposed = false, busy = awakening, pointerId = -1, keyboardPasses = 0;
  let rub = freshLampRub(), previous: LampPoint | undefined, response: Phaser.GameObjects.Image | undefined;
  let viewport = { width: window.innerWidth, height: window.innerHeight };
  const cancel = () => {
    rubbing = false; pointerId = -1; previous = undefined; rub = freshLampRub(); keyboardPasses = 0;
    response?.destroy(); response = undefined;
  };
  const finish = () => {
    if (busy || disposed || scene.children.getByName('tutorial-paper')) return;
    const result = onRubbed(); if (!result.activated) { cancel(); return; }
    busy = true; cancel();
    if (reducedMotion()) { onOpened(result.collected); return; }
    smoke(scene, art, true);
    smokeJourney(scene, art, () => { if (!disposed) onOpened(result.collected); });
  };
  const feedback = (amount: number) => {
    response ??= smoke(scene, art, false, 0);
    response.setAlpha(Math.min(0.90, amount * 2.4));
  };
  controls.add('empire-lamp', art.left + lampBody.x * art.width, art.top + lampBody.y * art.height,
    Math.max(44, lampBody.rx * 2 * art.width), Math.max(44, lampBody.ry * 2 * art.height), () => {
      if (rubbing || busy || disposed || scene.input.activePointer.isDown || scene.children.getByName('tutorial-paper')) return;
      feedback(++keyboardPasses * 0.10); if (keyboardPasses >= 3) finish();
    }, false);
  const handle = scene.children.getByName('empire-lamp') as Phaser.GameObjects.Zone;
  scene.input.setDraggable(handle);
  const normalized = (p: Phaser.Input.Pointer) => ({ x: (p.x - art.left) / art.width, y: (p.y - art.top) / art.height });
  handle.on('dragstart', (pointer: Phaser.Input.Pointer) => {
    if (busy || disposed || scene.children.getByName('tutorial-paper') || !inLamp(normalized(pointer))) return;
    cancel(); rubbing = true; pointerId = pointer.id; previous = normalized(pointer);
    viewport = { width: window.innerWidth, height: window.innerHeight };
  });
  handle.on('drag', (pointer: Phaser.Input.Pointer) => {
    if (!rubbing || pointer.id !== pointerId) return;
    const next = normalized(pointer);
    if (previous) rub = rubLamp(rub, previous, next);
    previous = inLamp(next) ? next : undefined;
    feedback(rub.distance);
  });
  handle.on('dragend', (pointer: Phaser.Input.Pointer) => {
    if (!rubbing || pointer.id !== pointerId) return;
    rubbing = false;
    const cancelled = pointer.event?.type === 'touchcancel' || window.innerWidth !== viewport.width
      || window.innerHeight !== viewport.height || !inLamp(normalized(pointer));
    if (!cancelled && lampRubComplete(rub)) finish(); else cancel();
  });
  const escape = (event: KeyboardEvent) => { if (event.key === 'Escape' && !busy) cancel(); };
  const abort = () => { if (!busy) cancel(); }, canvas = scene.game.canvas;
  scene.input.on('gameout', abort); scene.game.events.on('blur', abort);
  canvas.addEventListener('touchcancel', abort); canvas.addEventListener('keydown', escape); window.addEventListener('resize', abort);
  return () => {
    disposed = true; cancel(); scene.input.off('gameout', abort); scene.game.events.off('blur', abort);
    canvas.removeEventListener('touchcancel', abort); canvas.removeEventListener('keydown', escape); window.removeEventListener('resize', abort);
  };
}
