import Phaser from 'phaser';
import { overRiftTarget, riftRoute } from '../../domain/riftBasalt';
import { AdventureControls, reducedMotion } from './adventureMap';
import type { WorldFrame } from './pilotWorlds';

const original = 'destination-faille_des_contraires';
const bridge = { left: 0.32, top: 0.396, width: 0.32, height: 0.225 };
let steamSerial = 0;

/** The carried rock is the very same basalt painted in the repaired bridge. */
function basaltTexture(scene: Phaser.Scene): string {
  const key = 'rift-basalt-slab';
  if (scene.textures.exists(key)) return key;
  const f = scene.textures.getFrame('adventure-rift-complete');
  const left = 0.37, top = 0.43, w = Math.ceil(f.width * 0.215), h = Math.ceil(f.height * 0.105);
  const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 128;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.translate(-left * f.width, -top * f.height);
  const outline = [[0.376, 0.466], [0.405, 0.442], [0.46, 0.435], [0.55, 0.433], [0.58, 0.447],
    [0.581, 0.467], [0.572, 0.498], [0.558, 0.523], [0.46, 0.526], [0.42, 0.53], [0.39, 0.523], [0.376, 0.50]];
  ctx.beginPath(); outline.forEach(([x, y], i) => {
    if (i === 0) ctx.moveTo(x! * f.width, y! * f.height); else ctx.lineTo(x! * f.width, y! * f.height);
  }); ctx.closePath(); ctx.clip();
  ctx.drawImage(f.source.image as CanvasImageSource, f.cutX, f.cutY, f.cutWidth, f.cutHeight, 0, 0, f.width, f.height);
  scene.textures.addCanvas(key, canvas)?.get().setSize(w, h, 0, 0); return key;
}

export function riftPostcard(scene: Phaser.Scene, steps: readonly number[]): string {
  if (!scene.textures.exists('adventure-rift-broken') || !scene.textures.exists('adventure-rift-complete')) return original;
  const count = steps.length, key = `rift-basalt-${count}`;
  if (scene.textures.exists(key)) return key;
  const f = scene.textures.getFrame(original), state = scene.textures.getFrame(
    count === 2 ? 'adventure-rift-complete' : 'adventure-rift-broken');
  const texture = scene.textures.createCanvas(key, 2 ** Math.ceil(Math.log2(f.width)), 2 ** Math.ceil(Math.log2(f.height)));
  if (!texture) return original;
  texture.get().setSize(f.width, f.height, 0, 0);
  const ctx = texture.getContext();
  ctx.drawImage(f.source.image as CanvasImageSource, f.cutX, f.cutY, f.cutWidth, f.cutHeight, 0, 0, f.width, f.height);
  ctx.drawImage(state.source.image as CanvasImageSource, state.cutX + bridge.left * state.cutWidth,
    state.cutY + bridge.top * state.cutHeight, bridge.width * state.cutWidth, bridge.height * state.cutHeight,
    bridge.left * f.width, bridge.top * f.height, bridge.width * f.width, bridge.height * f.height);
  if (count === 1) {
    const slab = scene.textures.getFrame(basaltTexture(scene)), source = riftRoute[1].source;
    const width = source.width * f.width, height = width * slab.height / slab.width;
    ctx.drawImage(slab.source.image as CanvasImageSource, slab.cutX, slab.cutY, slab.cutWidth, slab.cutHeight,
      source.x * f.width - width / 2, source.y * f.height - height / 2, width, height);
  }
  texture.refresh(); return key;
}

/** Irregular low steam rises exclusively from the repaired stone, after resolution. */
export function drawRiftSteam(scene: Phaser.Scene, art: WorldFrame, complete: boolean): Phaser.GameObjects.Image[] {
  if (!complete) return [];
  const key = `rift-steam-${++steamSerial}`, texture = scene.textures.createCanvas(key, 128, 128)!;
  texture.get().setSize(128, 96, 0, 0);
  const ctx = texture.getContext(), pixels = ctx.createImageData(128, 96), state = { phase: 0 };
  const image = scene.add.image(art.left + art.width * 0.386, art.top + art.height * 0.337, key)
    .setOrigin(0).setDisplaySize(art.width * 0.20, art.height * 0.112).setName('rift-bridge-steam');
  const paint = () => {
    for (let y = 0; y < 96; y++) for (let x = 0; x < 128; x++) {
      const u = x / 127, rise = 1 - y / 95, p = state.phase * Math.PI * 2;
      let density = 0;
      for (let i = 0; i < 3; i++) {
        const center = 0.20 + i * 0.29 + Math.sin(rise * 8 - p + i * 2) * rise * 0.08;
        const d = (u - center) / (0.023 + rise * 0.085);
        const irregular = 0.65 + Math.sin(u * 39 + rise * 22 + Math.sin(p + i)) * 0.20
          + Math.sin(u * 71 - rise * 31 + Math.cos(p - i)) * 0.15;
        density += Math.exp(-d * d * 1.7) * Math.sin(rise * Math.PI) ** 0.8 * irregular;
      }
      const index = (y * 128 + x) * 4;
      pixels.data[index] = 244; pixels.data[index + 1] = 231; pixels.data[index + 2] = 241;
      pixels.data[index + 3] = Math.min(210, density * 185);
    }
    ctx.putImageData(pixels, 0, 0); texture.refresh();
  };
  paint();
  if (!reducedMotion()) scene.tweens.add({ targets: state, phase: 1, duration: 18000, repeat: -1, onUpdate: paint });
  image.once('destroy', () => { scene.tweens.killTweensOf(state); scene.textures.remove(key); });
  return [image];
}

export function addRiftBasalt(scene: Phaser.Scene, controls: AdventureControls, art: WorldFrame,
  steps: readonly number[], onDeposit: (index: number) => { activated: boolean; collected: boolean },
  onChanged: (collected: boolean) => void, awakening: boolean): () => void {
  const picture = scene.children.getByName('exploration-art') as Phaser.GameObjects.Image;
  picture.setTexture(riftPostcard(scene, steps.length === 1 ? [] : steps)).setDisplaySize(art.width, art.height);
  drawRiftSteam(scene, art, steps.length === 2);
  if (steps.length === 2) return () => {};
  let selected: number | null = null, dragging = false, moved = false, disposed = false, busy = awakening, pointerId = -1;
  let start = { x: 0, y: 0 }, viewport = { width: window.innerWidth, height: window.innerHeight };
  const thread = scene.add.graphics().setName('rift-material-thread');
  const point = (x: number, y: number) => ({ x: art.left + x * art.width, y: art.top + y * art.height });
  const stoneSource = riftRoute[1].source;
  const stoneHome = point(stoneSource.x, stoneSource.y);
  const stone = steps.length === 1 ? scene.add.image(stoneHome.x, stoneHome.y, basaltTexture(scene)).setName('rift-carried-stone') : undefined;
  if (stone) stone.setScale(art.width * stoneSource.width / stone.width);
  let goal: Phaser.GameObjects.Zone;
  const reset = () => { selected = null; dragging = false; pointerId = -1; thread.clear(); stone?.setPosition(stoneHome.x, stoneHome.y).setDepth(0); if (goal?.input) goal.input.enabled = false; };
  const trace = (x: number, y: number) => {
    thread.clear(); if (selected === null) return;
    const source = riftRoute[selected]!.source;
    if (selected === 1) { stone!.setPosition(x, y).setDepth(2); return; }
    for (let i = 0; i < 32; i++) {
      const t = i / 31, bend = Math.sin(t * Math.PI) * art.height * 0.025;
      thread.fillStyle(0xe5f5ff, 0.15 + t * 0.6).fillCircle(art.left + source.x * art.width + (x - art.left - source.x * art.width) * t,
        art.top + source.y * art.height + (y - art.top - source.y * art.height) * t + bend, Math.max(0.6, art.width * (i % 3 ? 0.0015 : 0.0025)));
    }
  };
  const choose = (index: number) => {
    if (disposed || busy || scene.children.getByName('tutorial-paper')) return;
    reset(); selected = index; goal.input!.enabled = true;
    const p = point(riftRoute[index]!.source.x, riftRoute[index]!.source.y); trace(p.x, p.y);
  };
  const deposit = () => {
    if (selected === null || busy || disposed || dragging || scene.children.getByName('tutorial-paper')) return;
    const index = selected, result = onDeposit(index);
    if (!result.activated) { reset(); return; }
    const carried = stone ? { x: stone.x, y: stone.y } : undefined;
    busy = true; reset();
    const next = scene.add.image(art.left, art.top, riftPostcard(scene, [...steps, index])).setOrigin(0)
      .setDisplaySize(art.width, art.height).setName('rift-stone-forming');
    if (reducedMotion()) { onChanged(result.collected); return; }
    if (stone && carried) {
      stone.setPosition(carried.x, carried.y).setDepth(2);
      const target = riftRoute[1].target;
      scene.tweens.add({ targets: stone, x: art.left + target.x * art.width, y: art.top + target.y * art.height,
        scaleX: art.width * 0.215 / stone.width, scaleY: art.width * 0.215 / stone.width,
        alpha: 0, duration: 550, ease: 'Sine.InOut' });
    }
    next.setAlpha(0); scene.tweens.add({ targets: next, alpha: 1, delay: index === 1 ? 250 : 0,
      duration: 650, ease: 'Sine.Out', onComplete: () => { if (!disposed) onChanged(result.collected); } });
  };
  riftRoute.forEach((route, index) => {
    if (index !== steps.length) return;
    const source = route.source;
    const p = point(source.x, source.y), name = `rift-source-${index}`;
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
      if (overRiftTarget(index, (pointer.x - art.left) / art.width, (pointer.y - art.top) / art.height)) deposit();
      else reset();
    });
  });
  const target = riftRoute[steps.length as 0 | 1].target;
  const center = point(target.x, target.y);
  controls.add('rift-target', center.x, center.y, Math.max(44, art.width * target.rx * 2), Math.max(44, art.height * target.ry * 2), deposit, false);
  goal = scene.children.getByName('rift-target') as Phaser.GameObjects.Zone; goal.disableInteractive();
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
