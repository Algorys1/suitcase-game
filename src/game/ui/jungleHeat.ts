import Phaser from 'phaser';
import { lanternFruit, heatSources, overLanternFruit } from '../../domain/jungleHeat';
import { AdventureControls, reducedMotion } from './adventureMap';
import type { WorldFrame } from './pilotWorlds';

const original = 'destination-jungle_incandescente';
const fruitBounds = { left: 0.099, top: 0.435, width: 0.23, height: 0.261 };

/** Only the painted fruit body: the overhanging leaves and whole landscape stay original. */
function dormantFruit(scene: Phaser.Scene): string {
  const key = 'jungle-fruit-dormant';
  if (scene.textures.exists(key)) return key;
  const f = scene.textures.getFrame(original), dormant = scene.textures.getFrame('adventure-jungle-dormant');
  const width = Math.ceil(fruitBounds.width * f.width), height = Math.ceil(fruitBounds.height * f.height);
  const canvas = document.createElement('canvas');
  canvas.width = 2 ** Math.ceil(Math.log2(width)); canvas.height = 2 ** Math.ceil(Math.log2(height));
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.translate(-fruitBounds.left * f.width, -fruitBounds.top * f.height);
  const outline = [[0.107, 0.517], [0.128, 0.471], [0.166, 0.445], [0.19, 0.448],
    [0.197, 0.482], [0.214, 0.499], [0.235, 0.462], [0.245, 0.445], [0.275, 0.46],
    [0.304, 0.495], [0.321, 0.545], [0.316, 0.60], [0.292, 0.634], [0.25, 0.665],
    [0.217, 0.691], [0.199, 0.669], [0.154, 0.643], [0.12, 0.605], [0.103, 0.558]];
  ctx.beginPath(); outline.forEach(([x, y], i) => {
    if (i === 0) ctx.moveTo(x! * f.width, y! * f.height); else ctx.lineTo(x! * f.width, y! * f.height);
  }); ctx.closePath(); ctx.clip();
  ctx.drawImage(dormant.source.image as CanvasImageSource, dormant.cutX, dormant.cutY,
    dormant.cutWidth, dormant.cutHeight, 0, 0, f.width, f.height);
  scene.textures.addCanvas(key, canvas)?.get().setSize(width, height, 0, 0);
  return key;
}

export function junglePostcard(scene: Phaser.Scene, steps: readonly number[]): string {
  if (!scene.textures.exists('adventure-jungle-dormant')) return original;
  const count = Math.min(2, steps.length), key = `jungle-heat-${count}`;
  if (count === 2) return original;
  if (scene.textures.exists(key)) return key;
  const f = scene.textures.getFrame(original), patch = scene.textures.getFrame(dormantFruit(scene));
  const texture = scene.textures.createCanvas(key, 2 ** Math.ceil(Math.log2(f.width)), 2 ** Math.ceil(Math.log2(f.height)));
  if (!texture) return original;
  texture.get().setSize(f.width, f.height, 0, 0);
  const ctx = texture.getContext();
  ctx.drawImage(f.source.image as CanvasImageSource, f.cutX, f.cutY, f.cutWidth, f.cutHeight, 0, 0, f.width, f.height);
  ctx.globalAlpha = count === 0 ? 1 : 0.58;
  ctx.drawImage(patch.source.image as CanvasImageSource, patch.cutX, patch.cutY, patch.cutWidth, patch.cutHeight,
    fruitBounds.left * f.width, fruitBounds.top * f.height, patch.width, patch.height);
  texture.refresh(); return key;
}

/** Modulate the painted skin itself, without moving the fruit or lighting the surroundings. */
export function drawFruitPulse(scene: Phaser.Scene, art: WorldFrame, complete: boolean): Phaser.GameObjects.Image[] {
  if (!complete || !scene.textures.exists('adventure-jungle-dormant') || reducedMotion()) return [];
  const patch = scene.add.image(art.left + fruitBounds.left * art.width, art.top + fruitBounds.top * art.height,
    dormantFruit(scene)).setOrigin(0).setDisplaySize(fruitBounds.width * art.width, fruitBounds.height * art.height)
    .setAlpha(0).setName('jungle-fruit-pulse');
  const tween = scene.tweens.add({ targets: patch, alpha: 0.58, duration: 3000, ease: 'Sine.InOut', yoyo: true, repeat: -1 });
  patch.once('destroy', () => tween.remove());
  return [patch];
}

export function addJungleHeat(scene: Phaser.Scene, controls: AdventureControls, art: WorldFrame,
  steps: readonly number[], onDeposit: (index: number) => { activated: boolean; collected: boolean },
  onChanged: (collected: boolean) => void, awakening: boolean): () => void {
  const picture = scene.children.getByName('exploration-art') as Phaser.GameObjects.Image;
  picture.setTexture(junglePostcard(scene, steps)).setDisplaySize(art.width, art.height);
  drawFruitPulse(scene, art, steps.length === 2);
  if (steps.length === 2) return () => {};
  let selected: number | null = null, dragging = false, moved = false, disposed = false, busy = awakening, pointerId = -1;
  let start = { x: 0, y: 0 }, viewport = { width: window.innerWidth, height: window.innerHeight };
  const thread = scene.add.graphics().setName('jungle-material-thread');
  const point = (x: number, y: number) => ({ x: art.left + x * art.width, y: art.top + y * art.height });
  let goal: Phaser.GameObjects.Zone;
  const reset = () => { selected = null; dragging = false; pointerId = -1; thread.clear(); if (goal?.input) goal.input.enabled = false; };
  const trace = (x: number, y: number) => {
    thread.clear(); if (selected === null) return;
    const source = heatSources[selected]!, home = point(source.x, source.y);
    // Tiny irregular grains carry the landscape's material, without removing its source.
    for (let i = 0; i < 35; i++) {
      const t = i / 34, bend = Math.sin(t * Math.PI) * art.height * 0.035;
      const px = home.x + (x - home.x) * t + Math.sin(i * 2.7) * 1.1;
      const py = home.y + (y - home.y) * t + bend + Math.cos(i * 3.1) * 1.3;
      thread.fillStyle(source.color, 0.15 + t * 0.68).fillCircle(px, py, Math.max(0.6, art.width * (i % 3 ? 0.0017 : 0.0028)));
    }
  };
  const choose = (index: number) => {
    if (disposed || busy || scene.children.getByName('tutorial-paper')) return;
    reset(); selected = index; goal.input!.enabled = true;
    const p = point(heatSources[index]!.x, heatSources[index]!.y); trace(p.x, p.y);
  };
  const deposit = () => {
    if (selected === null || busy || disposed || dragging || scene.children.getByName('tutorial-paper')) return;
    const index = selected, result = onDeposit(index);
    if (!result.activated) { reset(); return; }
    busy = true; reset();
    const next = scene.add.image(art.left, art.top, junglePostcard(scene, [...steps, index])).setOrigin(0)
      .setDisplaySize(art.width, art.height).setName('jungle-globe-forming');
    if (reducedMotion()) { onChanged(result.collected); return; }
    next.setAlpha(0); scene.tweens.add({ targets: next, alpha: 1, duration: 650, ease: 'Sine.Out',
      onComplete: () => { if (!disposed) onChanged(result.collected); } });
  };
  heatSources.forEach((source, index) => {
    if (steps.includes(index)) return;
    const p = point(source.x, source.y), name = `jungle-source-${index}`;
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
      if (overLanternFruit((pointer.x - art.left) / art.width, (pointer.y - art.top) / art.height)) deposit();
      else reset();
    });
  });
  const center = point(lanternFruit.x, lanternFruit.y);
  controls.add('jungle-fruit', center.x, center.y, Math.max(44, art.width * lanternFruit.rx * 2), Math.max(44, art.height * lanternFruit.ry * 2), deposit, false);
  goal = scene.children.getByName('jungle-fruit') as Phaser.GameObjects.Zone; goal.disableInteractive();
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
