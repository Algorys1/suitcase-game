import Phaser from 'phaser';
import { globe, globeSources, overGlobe } from '../../domain/frozenGlobe';
import { AdventureControls, reducedMotion } from './adventureMap';
import type { WorldFrame } from './pilotWorlds';

const original = 'destination-mer_figee';

/** Only the inside of the glass changes. The surrounding original painting is untouched. */
export function globePostcard(scene: Phaser.Scene, steps: readonly number[]): string {
  if (!scene.textures.exists('adventure-mer-empty')) return original;
  const count = Math.min(3, steps.length), key = `mer-globe-${count}`;
  if (scene.textures.exists(key)) return key;
  const f = scene.textures.getFrame(original), empty = scene.textures.getFrame('adventure-mer-empty');
  const texture = scene.textures.createCanvas(key, 2 ** Math.ceil(Math.log2(f.width)), 2 ** Math.ceil(Math.log2(f.height)));
  if (!texture) return original;
  texture.get().setSize(f.width, f.height, 0, 0);
  const ctx = texture.getContext();
  const paint = (frame: Phaser.Textures.Frame) => ctx.drawImage(frame.source.image as CanvasImageSource,
    frame.cutX, frame.cutY, frame.cutWidth, frame.cutHeight, 0, 0, f.width, f.height);
  paint(f);
  if (count < 3) {
    ctx.save(); ctx.beginPath(); ctx.ellipse(globe.x * f.width, globe.y * f.height,
      globe.rx * f.width, globe.ry * f.height, 0, 0, Math.PI * 2); ctx.clip();
    paint(empty);
    if (count > 0) {
      ctx.save(); ctx.beginPath();
      // Snowy miniature floor, followed by the painted wave silhouette; sky stars arrive last.
      const points = count === 1 ? [[0.14, 0.732], [0.34, 0.732], [0.34, 0.79], [0.14, 0.79]]
        : [[0.15, 0.745], [0.16, 0.675], [0.18, 0.675], [0.187, 0.633], [0.21, 0.61],
          [0.24, 0.591], [0.265, 0.593], [0.29, 0.616], [0.302, 0.654], [0.298, 0.675],
          [0.285, 0.665], [0.27, 0.646], [0.258, 0.654], [0.26, 0.69], [0.282, 0.724],
          [0.32, 0.72], [0.34, 0.79], [0.14, 0.79]];
      points.forEach(([x, y], i) => { if (i === 0) ctx.moveTo(x! * f.width, y! * f.height);
        else ctx.lineTo(x! * f.width, y! * f.height); }); ctx.closePath(); ctx.clip(); paint(f); ctx.restore();
    }
    ctx.restore();
  }
  texture.refresh(); return key;
}

/** A slow, looping snowfall clipped to the glass, shared by every view. */
export function drawGlobeSnow(scene: Phaser.Scene, art: WorldFrame, complete: boolean): Phaser.GameObjects.Graphics[] {
  if (!complete) return [];
  const flakes = scene.add.graphics().setName('mer-globe-snow'), state = { phase: 0 };
  const paint = () => {
    flakes.clear();
    for (let i = 0; i < 27; i++) {
      const v = (i * 0.381966 + state.phase) % 1;
      const u = Math.sin(i * 17.37) * 0.78 + Math.sin(state.phase * Math.PI * 2 + i) * 0.07;
      const y = -0.92 + v * 1.72;
      if (u * u + y * y > 0.87) continue;
      const fade = Math.min(1, v * 7, (1 - v) * 7);
      flakes.fillStyle(i % 3 ? 0xfff5e4 : 0xe1fbff, fade * 0.82)
        .fillCircle(art.left + (globe.x + u * globe.rx) * art.width,
          art.top + (globe.y + y * globe.ry) * art.height, Math.max(0.45, art.width * (i % 4 ? 0.0013 : 0.0019)));
    }
  };
  paint();
  if (!reducedMotion()) {
    const tween = scene.tweens.add({ targets: state, phase: 1, duration: 14000, repeat: -1, onUpdate: paint });
    flakes.once('destroy', () => tween.remove());
  }
  return [flakes];
}

export function addFrozenGlobe(scene: Phaser.Scene, controls: AdventureControls, art: WorldFrame,
  steps: readonly number[], onDeposit: (index: number) => { activated: boolean; collected: boolean },
  onChanged: (collected: boolean) => void, awakening: boolean): () => void {
  const picture = scene.children.getByName('exploration-art') as Phaser.GameObjects.Image;
  picture.setTexture(globePostcard(scene, steps)).setDisplaySize(art.width, art.height);
  drawGlobeSnow(scene, art, steps.length === 3);
  if (steps.length === 3) return () => {};
  let selected: number | null = null, dragging = false, moved = false, disposed = false, busy = awakening, pointerId = -1;
  let start = { x: 0, y: 0 }, viewport = { width: window.innerWidth, height: window.innerHeight };
  const thread = scene.add.graphics().setName('mer-material-thread');
  const point = (x: number, y: number) => ({ x: art.left + x * art.width, y: art.top + y * art.height });
  let goal: Phaser.GameObjects.Zone;
  const reset = () => { selected = null; dragging = false; pointerId = -1; thread.clear(); if (goal?.input) goal.input.enabled = false; };
  const trace = (x: number, y: number) => {
    thread.clear(); if (selected === null) return;
    const source = globeSources[selected]!, home = point(source.x, source.y);
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
    const p = point(globeSources[index]!.x, globeSources[index]!.y); trace(p.x, p.y);
  };
  const deposit = () => {
    if (selected === null || busy || disposed || dragging || scene.children.getByName('tutorial-paper')) return;
    const index = selected, result = onDeposit(index);
    if (!result.activated) { reset(); return; }
    busy = true; reset();
    const next = scene.add.image(art.left, art.top, globePostcard(scene, [...steps, index])).setOrigin(0)
      .setDisplaySize(art.width, art.height).setName('mer-globe-forming');
    if (reducedMotion()) { onChanged(result.collected); return; }
    next.setAlpha(0); scene.tweens.add({ targets: next, alpha: 1, duration: 650, ease: 'Sine.Out',
      onComplete: () => { if (!disposed) onChanged(result.collected); } });
  };
  globeSources.forEach((source, index) => {
    if (index < steps.length) return;
    const p = point(source.x, source.y), name = `mer-source-${index}`;
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
      if (overGlobe((pointer.x - art.left) / art.width, (pointer.y - art.top) / art.height)) deposit();
      else reset();
    });
  });
  const center = point(globe.x, globe.y);
  controls.add('mer-globe', center.x, center.y, Math.max(44, art.width * globe.rx * 2), Math.max(44, art.height * globe.ry * 2), deposit, false);
  goal = scene.children.getByName('mer-globe') as Phaser.GameObjects.Zone; goal.disableInteractive();
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
