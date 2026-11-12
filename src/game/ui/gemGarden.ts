import Phaser from 'phaser';
import { gemRoute, overGemTarget } from '../../domain/gemGarden';
import { AdventureControls, reducedMotion } from './adventureMap';
import type { WorldFrame } from './pilotWorlds';

const original = 'destination-jardins_de_gemmes';
const flowerRegion = { left: 0.595, top: 0.550, width: 0.355, height: 0.29 };

/** Feather the retouch into the original painting, preserving all surrounding pixels. */
function patch(scene: Phaser.Scene, source: string, key: string,
  region: { left: number; top: number; width: number; height: number }): string {
  if (scene.textures.exists(key)) return key;
  const f = scene.textures.getFrame(original), from = scene.textures.getFrame(source);
  const w = Math.ceil(region.width * f.width), h = Math.ceil(region.height * f.height);
  const canvas = document.createElement('canvas');
  canvas.width = 2 ** Math.ceil(Math.log2(w)); canvas.height = 2 ** Math.ceil(Math.log2(h));
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(from.source.image as CanvasImageSource, from.cutX + region.left * from.cutWidth,
    from.cutY + region.top * from.cutHeight, region.width * from.cutWidth, region.height * from.cutHeight, 0, 0, w, h);
  const pixels = ctx.getImageData(0, 0, w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    pixels.data[(y * w + x) * 4 + 3] = 255 * Math.min(1, x / 5, y / 5, (w - 1 - x) / 5, (h - 1 - y) / 5);
  }
  ctx.putImageData(pixels, 0, 0);
  scene.textures.addCanvas(key, canvas)?.get().setSize(w, h, 0, 0);
  return key;
}

function ribbon(g: Phaser.GameObjects.Graphics, art: WorldFrame,
  from: { x: number; y: number }, to: { x: number; y: number }, pink: boolean, strength = 1): void {
  const points = Array.from({ length: 41 }, (_, i) => {
    const t = i / 40;
    return { x: art.left + (from.x + (to.x - from.x) * t) * art.width,
      y: art.top + (from.y + (to.y - from.y) * t + Math.sin(t * Math.PI) * 0.035) * art.height };
  });
  for (const [width, alpha] of [[0.018, 0.045], [0.008, 0.10], [0.0017, 0.38]]) {
    g.lineStyle(Math.max(0.7, art.width * width!), pink ? 0xf4c4ef : 0xffedbd, alpha! * strength);
    g.beginPath(); points.forEach((p, i) => { if (i === 0) g.moveTo(p.x, p.y); else g.lineTo(p.x, p.y); }); g.strokePath();
  }
}

export function gardenPostcard(scene: Phaser.Scene, steps: readonly number[]): string {
  if (!scene.textures.exists('adventure-gem-closed')) return original;
  const count = steps.length, key = `gem-garden-${count}`;
  if (count === 2) return original;
  if (scene.textures.exists(key)) return key;
  const f = scene.textures.getFrame(original), closed = scene.textures.getFrame(
    patch(scene, 'adventure-gem-closed', 'gem-bud-patch', flowerRegion));
  const texture = scene.textures.createCanvas(key, 2 ** Math.ceil(Math.log2(f.width)), 2 ** Math.ceil(Math.log2(f.height)));
  if (!texture) return original;
  texture.get().setSize(f.width, f.height, 0, 0);
  const ctx = texture.getContext();
  ctx.drawImage(f.source.image as CanvasImageSource, f.cutX, f.cutY, f.cutWidth, f.cutHeight, 0, 0, f.width, f.height);
  ctx.drawImage(closed.source.image as CanvasImageSource, closed.cutX, closed.cutY, closed.cutWidth, closed.cutHeight,
    flowerRegion.left * f.width, flowerRegion.top * f.height, closed.width, closed.height);
  texture.refresh(); return key;
}

/** Rays record gestures; fixed facets catch alternating light after resolution. */
export function drawGardenLight(scene: Phaser.Scene, art: WorldFrame, steps: readonly number[]): Phaser.GameObjects.Graphics[] {
  if (!steps.length) return [];
  const rays = scene.add.graphics().setName('gem-moonlight');
  for (let i = 0; i < steps.length; i++) ribbon(rays, art, gemRoute[i as 0 | 1].source, gemRoute[i as 0 | 1].target, i === 1, 0.65);
  if (steps.length !== 2) return [rays];
  const sheen = scene.add.graphics().setName('gem-petal-reflections'), state = { phase: 0 };
  const facets = [
    [[0.681, 0.624], [0.727, 0.675], [0.727, 0.733], [0.685, 0.704]],
    [[0.791, 0.581], [0.820, 0.638], [0.808, 0.699], [0.772, 0.643]],
    [[0.873, 0.625], [0.867, 0.692], [0.827, 0.744], [0.835, 0.674]],
    [[0.679, 0.770], [0.731, 0.753], [0.788, 0.790], [0.728, 0.811]],
    [[0.895, 0.722], [0.914, 0.719], [0.866, 0.781], [0.815, 0.798]],
  ];
  const paint = () => {
    sheen.clear();
    facets.forEach((facet, i) => {
      const light = (1 + Math.cos((state.phase + i * 0.38) * Math.PI * 2)) / 2;
      sheen.fillStyle(i % 2 ? 0xfff5c9 : 0xfff0ff, 0.03 + light ** 3 * 0.79);
      sheen.beginPath();
      facet.forEach(([x, y], j) => {
        const px = art.left + x! * art.width, py = art.top + y! * art.height;
        if (j === 0) sheen.moveTo(px, py); else sheen.lineTo(px, py);
      });
      sheen.closePath().fillPath();
    });
  };
  paint();
  if (!reducedMotion()) {
    const tween = scene.tweens.add({ targets: state, phase: 1, duration: 7000, repeat: -1, onUpdate: paint });
    sheen.once('destroy', () => tween.remove());
  }
  return [rays, sheen];
}

function chime(scene: Phaser.Scene, art: WorldFrame): void {
  const region = { left: 0.85, top: 0.49, width: 0.15, height: 0.20 };
  scene.add.image(art.left + region.left * art.width, art.top + region.top * art.height,
    patch(scene, 'adventure-gem-bells-clean', 'gem-bell-background', region)).setOrigin(0)
    .setDisplaySize(region.width * art.width, region.height * art.height);
  const heads = [[0.855, 0.511, 0.060, 0.069], [0.926, 0.501, 0.037, 0.041],
    [0.901, 0.561, 0.054, 0.067], [0.939, 0.628, 0.048, 0.055]];
  heads.forEach(([left, top, width, height], i) => {
    const f = scene.textures.getFrame(original), key = `gem-bell-${i}`;
    if (!scene.textures.exists(key)) {
      const w = Math.ceil(width! * f.width), h = Math.ceil(height! * f.height);
      const canvas = document.createElement('canvas'); canvas.width = 128; canvas.height = 128;
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      ctx.beginPath(); ctx.moveTo(w * 0.38, 0); ctx.bezierCurveTo(w * 0.05, h * 0.20, w * 0.15, h * 0.42, 0, h * 0.68);
      ctx.quadraticCurveTo(w * 0.12, h * 0.86, w * 0.30, h * 0.80);
      ctx.quadraticCurveTo(w * 0.5, h * 1.1, w * 0.68, h * 0.85);
      ctx.quadraticCurveTo(w * 1.1, h * 1.0, w, h * 0.48);
      ctx.quadraticCurveTo(w * 0.94, 0, w * 0.38, 0); ctx.clip();
      ctx.drawImage(f.source.image as CanvasImageSource, f.cutX + left! * f.cutWidth, f.cutY + top! * f.cutHeight,
        width! * f.cutWidth, height! * f.cutHeight, 0, 0, w, h);
      scene.textures.addCanvas(key, canvas)?.get().setSize(w, h, 0, 0);
    }
    const bell = scene.add.image(art.left + (left! + width! / 2) * art.width, art.top + top! * art.height, key)
      .setOrigin(0.5, 0).setDisplaySize(width! * art.width, height! * art.height).setName(`gem-chime-${i}`);
    scene.tweens.add({ targets: bell, angle: i % 2 ? -9 : 9, delay: i * 170, duration: 230, yoyo: true, ease: 'Sine.InOut' });
    const glow = scene.add.graphics().fillStyle(0xffecb8, 0.32).fillEllipse(bell.x, bell.y + height! * art.height * 0.55,
      width! * art.width * 0.9, height! * art.height * 0.6).setAlpha(0);
    scene.tweens.add({ targets: glow, alpha: 1, delay: i * 170, duration: 230, yoyo: true });
  });
}

export function addGemGarden(scene: Phaser.Scene, controls: AdventureControls, art: WorldFrame,
  steps: readonly number[], onDeposit: (index: number) => { activated: boolean; collected: boolean },
  onChanged: (collected: boolean) => void, awakening: boolean): () => void {
  const picture = scene.children.getByName('exploration-art') as Phaser.GameObjects.Image;
  picture.setTexture(gardenPostcard(scene, steps)).setDisplaySize(art.width, art.height);
  drawGardenLight(scene, art, steps);
  if (steps.length === 2) return () => {};
  let selected: number | null = null, dragging = false, moved = false, disposed = false, busy = awakening, pointerId = -1;
  let start = { x: 0, y: 0 }, viewport = { width: window.innerWidth, height: window.innerHeight };
  const thread = scene.add.graphics().setName('gem-material-thread');
  const point = (x: number, y: number) => ({ x: art.left + x * art.width, y: art.top + y * art.height });
  let goal: Phaser.GameObjects.Zone;
  const reset = () => { selected = null; dragging = false; pointerId = -1; thread.clear(); if (goal?.input) goal.input.enabled = false; };
  const trace = (x: number, y: number) => {
    thread.clear(); if (selected === null) return;
    const source = gemRoute[selected]!.source;
    ribbon(thread, art, source, { x: (x - art.left) / art.width, y: (y - art.top) / art.height }, selected === 1);
  };
  const choose = (index: number) => {
    if (disposed || busy || scene.children.getByName('tutorial-paper')) return;
    reset(); selected = index; goal.input!.enabled = true;
    const p = point(gemRoute[index]!.source.x, gemRoute[index]!.source.y); trace(p.x, p.y);
  };
  const deposit = () => {
    if (selected === null || busy || disposed || dragging || scene.children.getByName('tutorial-paper')) return;
    const index = selected, result = onDeposit(index);
    if (!result.activated) { reset(); return; }
    busy = true; reset();
    const next = scene.add.image(art.left, art.top, gardenPostcard(scene, [...steps, index])).setOrigin(0)
      .setDisplaySize(art.width, art.height).setName('gem-globe-forming');
    if (reducedMotion()) { onChanged(result.collected); return; }
    if (index === 1) {
      chime(scene, art);
      const light = scene.add.graphics().setName('gem-light-to-bud'), state = { reach: 0 };
      const from = { x: 0.965, y: 0.65 }, to = { x: 0.79, y: 0.725 };
      scene.tweens.add({ targets: state, reach: 1, delay: 650, duration: 550, onUpdate: () => {
        light.clear(); ribbon(light, art, from, { x: from.x + (to.x - from.x) * state.reach,
          y: from.y + (to.y - from.y) * state.reach }, true);
      } });
    }
    else drawGardenLight(scene, art, [0]);
    next.setAlpha(0); scene.tweens.add({ targets: next, alpha: 1, delay: index === 1 ? 1100 : 0, duration: index === 1 ? 900 : 650, ease: 'Sine.Out',
      onStart: () => { if (index === 1) scene.children.bringToTop(next); },
      onComplete: () => { if (!disposed) onChanged(result.collected); } });
  };
  gemRoute.forEach((route, index) => {
    if (index !== steps.length) return;
    const source = route.source;
    const p = point(source.x, source.y), name = `gem-source-${index}`;
    controls.add(name, p.x, p.y, Math.max(44, source.width * art.width), Math.max(44, source.height * art.height),
      () => { if (!dragging) choose(index); }, false);
    const handle = scene.children.getByName(name) as Phaser.GameObjects.Zone;
    scene.input.setDraggable(handle);
    handle.on('dragstart', (pointer: Phaser.Input.Pointer) => {
      choose(index); if (selected !== index) return;
      dragging = true; moved = false; pointerId = pointer.id; start = { x: pointer.x, y: pointer.y };
      viewport = { width: window.innerWidth, height: window.innerHeight };
    });
    handle.on('drag', (pointer: Phaser.Input.Pointer) => {
      if (!dragging || selected !== index || pointer.id !== pointerId) return;
      moved ||= Math.hypot(pointer.x - start.x, pointer.y - start.y) >= 6;
      trace(pointer.x, pointer.y);
    });
    handle.on('dragend', (pointer: Phaser.Input.Pointer) => {
      if (!dragging || selected !== index || pointer.id !== pointerId) return;
      dragging = false;
      if (pointer.event?.type === 'touchcancel' || window.innerWidth !== viewport.width || window.innerHeight !== viewport.height) { reset(); return; }
      if (!moved) return;
      if (overGemTarget(index, (pointer.x - art.left) / art.width, (pointer.y - art.top) / art.height)) deposit();
      else reset();
    });
  });
  const target = gemRoute[steps.length as 0 | 1].target;
  const center = point(target.x, target.y);
  controls.add('gem-target', center.x, center.y, Math.max(44, art.width * target.rx * 2), Math.max(44, art.height * target.ry * 2), deposit, false);
  goal = scene.children.getByName('gem-target') as Phaser.GameObjects.Zone; goal.disableInteractive();
  const cancel = () => { if (!busy) reset(); };
  const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') cancel(); };
  const canvas = scene.game.canvas;
  scene.input.on('gameout', cancel); scene.game.events.on('blur', cancel);
  canvas.addEventListener('touchcancel', cancel); canvas.addEventListener('keydown', escape); window.addEventListener('resize', cancel);
  return () => {
    disposed = true; scene.input.off('gameout', cancel); scene.game.events.off('blur', cancel);
    canvas.removeEventListener('touchcancel', cancel); canvas.removeEventListener('keydown', escape); window.removeEventListener('resize', cancel);
  };
}
