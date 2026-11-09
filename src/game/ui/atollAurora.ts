import Phaser from 'phaser';
import { atollBracelet, atollReflections, overAtollBracelet } from '../../domain/atollReflections';
import { AdventureControls, reducedMotion } from './adventureMap';
import type { WorldFrame } from './pilotWorlds';

const original = 'destination-atoll_boreal';
const colours = [0x8fe9ac, 0xc9a1fa];

function dormant(scene: Phaser.Scene): string {
  const key = 'atoll-dormant-base';
  if (scene.textures.exists(key)) return key;
  if (!scene.textures.exists('adventure-atoll-dormant')) return original;
  const f = scene.textures.getFrame(original), dull = scene.textures.getFrame('adventure-atoll-dormant');
  const canvas = document.createElement('canvas'); canvas.width = f.width; canvas.height = f.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(f.source.image as CanvasImageSource, f.cutX, f.cutY, f.cutWidth, f.cutHeight,
    0, 0, canvas.width, canvas.height);
  const patch = document.createElement('canvas'); patch.width = canvas.width; patch.height = canvas.height;
  const pc = patch.getContext('2d', { willReadFrequently: true })!;
  pc.drawImage(dull.source.image as CanvasImageSource, dull.cutX, dull.cutY, dull.cutWidth, dull.cutHeight,
    0, 0, canvas.width, canvas.height);
  const source = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const edited = pc.getImageData(0, 0, patch.width, patch.height);
  for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
    const d = Math.hypot((x / canvas.width - 0.685) / 0.33, (y / canvas.height - 0.752) / 0.205);
    const t = Math.max(0, Math.min(1, (1 - d) / 0.20)), alpha = t * t * (3 - 2 * t);
    const i = (y * canvas.width + x) * 4;
    for (let c = 0; c < 3; c++) source.data[i + c] = source.data[i + c]! * (1 - alpha) + edited.data[i + c]! * alpha;
  }
  ctx.putImageData(source, 0, 0);
  scene.textures.addCanvas(key, canvas)?.get().setSize(canvas.width, canvas.height, 0, 0);
  return key;
}

function strandPaint(scene: Phaser.Scene, index: number): string {
  const key = `atoll-strands-${index}`;
  if (scene.textures.exists(key)) return key;
  const f = scene.textures.getFrame(original);
  const canvas = document.createElement('canvas'); canvas.width = f.width; canvas.height = f.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(f.source.image as CanvasImageSource, f.cutX, f.cutY, f.cutWidth, f.cutHeight,
    0, 0, canvas.width, canvas.height);
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
    const i = (y * canvas.width + x) * 4, r = pixels.data[i]!, g = pixels.data[i + 1]!, b = pixels.data[i + 2]!;
    const u = x / canvas.width, v = y / canvas.height;
    const ring = Math.hypot((u - 0.635) / 0.158, (v - 0.736) / 0.104) < 1.06
      && Math.hypot((u - 0.627) / 0.123, (v - 0.720) / 0.045) > 1;
    const tassels = u > 0.755 && u < 0.95 && v > 0.648 && v < 0.845;
    const inBracelet = ring || tassels;
    const strength = index === 0 ? Math.min(g - r - 8, b - r + 2) : Math.min(b - g - 18, r - g - 10);
    pixels.data[i + 3] = inBracelet ? Math.max(0, Math.min(1, (strength - 4) / 15)) * 255 : 0;
  }
  ctx.putImageData(pixels, 0, 0);
  scene.textures.addCanvas(key, canvas)?.get().setSize(canvas.width, canvas.height, 0, 0);
  return key;
}

export function atollPostcard(scene: Phaser.Scene, steps: readonly number[]): string {
  if (steps.length === 2) return original;
  const key = `atoll-postcard-${steps.join('-') || 'dormant'}`;
  if (scene.textures.exists(key)) return key;
  const f = scene.textures.getFrame(dormant(scene));
  const canvas = document.createElement('canvas'); canvas.width = f.width; canvas.height = f.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(f.source.image as CanvasImageSource, f.cutX, f.cutY, f.cutWidth, f.cutHeight,
    0, 0, canvas.width, canvas.height);
  for (const index of steps) {
    const c = scene.textures.getFrame(strandPaint(scene, index));
    ctx.drawImage(c.source.image as CanvasImageSource, c.cutX, c.cutY, c.cutWidth, c.cutHeight,
      0, 0, canvas.width, canvas.height);
  }
  scene.textures.addCanvas(key, canvas)?.get().setSize(canvas.width, canvas.height, 0, 0);
  return key;
}

/** Water-like strips, native painted light rather than an interface icon. */
function reflectionTexture(scene: Phaser.Scene, index: number): string {
  const key = `atoll-reflection-paint-${index}`;
  if (scene.textures.exists(key)) return key;
  const t = scene.textures.createCanvas(key, 256, 128)!, ctx = t.context;
  const rgb = index === 0 ? '135,239,176' : '201,151,249';
  for (let n = 0; n < 15; n++) {
    const y = 8 + n * 7.4, width = 38 + Math.sin(n * 2.1) * 19 + Math.sin(n / 14 * Math.PI) * 105;
    const x = 128 + Math.sin(n * 1.7) * 16;
    const gradient = ctx.createLinearGradient(x - width / 2, 0, x + width / 2, 0);
    gradient.addColorStop(0, `rgba(${rgb},0)`); gradient.addColorStop(0.45, `rgba(${rgb},0.55)`);
    gradient.addColorStop(0.55, `rgba(${rgb},0.7)`); gradient.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = gradient; ctx.fillRect(x - width / 2, y, width, 2 + n % 3);
  }
  t.refresh(); return key;
}

/** Shared scenery: aurora veils only move after both reflections have been woven. */
export function drawAtollAurora(scene: Phaser.Scene, art: WorldFrame, complete: boolean): Array<Phaser.GameObjects.Image | Phaser.GameObjects.Graphics> {
  const objects: Array<Phaser.GameObjects.Image | Phaser.GameObjects.Graphics> = [];
  atollReflections.forEach((point, index) => {
    const light = scene.add.image(art.left + art.width * point.x, art.top + art.height * point.y,
      reflectionTexture(scene, index)).setDisplaySize(art.width * 0.14, art.height * 0.095)
      .setAlpha(0.85).setName(`atoll-reflection-${index}`);
    objects.push(light);
    if (complete && !reducedMotion()) scene.tweens.add({ targets: light, alpha: 0.48, duration: 2700 + index * 450,
      ease: 'Sine.InOut', yoyo: true, repeat: -1 });
    light.once('destroy', () => scene.tweens.killTweensOf(light));
  });
  if (complete) {
    for (const index of [0, 1]) {
      const shimmer = scene.add.image(art.left, art.top, strandPaint(scene, index)).setOrigin(0)
        .setDisplaySize(art.width, art.height).setBlendMode(Phaser.BlendModes.ADD)
        .setAlpha(0.12).setName(`atoll-bracelet-shimmer-${index}`);
      objects.push(shimmer);
      if (!reducedMotion()) scene.tweens.add({ targets: shimmer, alpha: 0.42,
        duration: 2400 + index * 700, delay: index * 500, ease: 'Sine.InOut', yoyo: true, repeat: -1 });
      shimmer.once('destroy', () => scene.tweens.killTweensOf(shimmer));
    }
    const glints = scene.add.graphics().setName('atoll-bracelet-glints');
    objects.push(glints);
    const drawGlints = (phase: number) => {
      glints.clear();
      for (let n = 0; n < 6; n++) {
        const t = (phase + n / 6) % 1, angle = t * Math.PI * 2;
        const x = art.left + art.width * (0.635 + Math.cos(angle) * 0.14);
        const y = art.top + art.height * (0.736 + Math.sin(angle) * 0.076 - Math.cos(angle) * 0.018);
        const alpha = 0.25 + Math.sin(t * Math.PI) * 0.45;
        glints.fillStyle(colours[n % 2]!, alpha * 0.25).fillCircle(x, y, Math.max(1.5, art.width * 0.007));
        glints.fillStyle(0xf0fff8, alpha).fillCircle(x, y, Math.max(0.65, art.width * 0.0018));
      }
    };
    drawGlints(0.15);
    if (!reducedMotion()) {
      const motion = scene.tweens.addCounter({ from: 0, to: 1, duration: 6500, repeat: -1,
        onUpdate: tween => drawGlints(tween.getValue() ?? 0) });
      glints.once('destroy', () => motion.remove());
    }
    // Reuse the painted sky colours with a faint moving duplicate, clipped to the existing aurora.
    const key = 'atoll-sky-light';
    if (!scene.textures.exists(key)) {
      const f = scene.textures.getFrame(original), c = document.createElement('canvas'); c.width = f.width; c.height = f.height;
      const ctx = c.getContext('2d', { willReadFrequently: true })!;
      ctx.drawImage(f.source.image as CanvasImageSource, f.cutX, f.cutY, f.cutWidth, f.cutHeight, 0, 0, c.width, c.height);
      const p = ctx.getImageData(0, 0, c.width, c.height);
      for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
        const i = (y * c.width + x) * 4, r = p.data[i]!, g = p.data[i + 1]!, b = p.data[i + 2]!;
        const inSky = y / c.height < 0.295 && x / c.width < 0.62;
        p.data[i + 3] = inSky ? Math.max(0, Math.min(1, (Math.max(g - r, b - g) - 35) / 90)) * 85 : 0;
      }
      ctx.putImageData(p, 0, 0); scene.textures.addCanvas(key, c)?.get().setSize(c.width, c.height, 0, 0);
    }
    const sky = scene.add.image(art.left, art.top, key).setOrigin(0).setDisplaySize(art.width, art.height)
      .setBlendMode(Phaser.BlendModes.ADD).setName('atoll-aurora-life').setAlpha(0.55);
    objects.push(sky);
    if (!reducedMotion()) scene.tweens.add({ targets: sky, alpha: 1, scaleX: sky.scaleX * 1.008,
      scaleY: sky.scaleY * 0.992, duration: 3800,
      ease: 'Sine.InOut', yoyo: true, repeat: -1 });
    sky.once('destroy', () => scene.tweens.killTweensOf(sky));
  }
  return objects;
}

export function addAtollReflections(scene: Phaser.Scene, controls: AdventureControls, art: WorldFrame,
  steps: readonly number[], onWoven: (index: number) => { activated: boolean; collected: boolean },
  onCollected: () => void, awakening: boolean): () => void {
  const complete = steps.length === 2, reduced = reducedMotion();
  const lights = drawAtollAurora(scene, art, complete).slice(0, 2) as Phaser.GameObjects.Image[];
  const woven = new Set(steps), cancelers: Array<() => void> = [];
  let finishing = awakening;
  lights.forEach((light, index) => {
    const home = { x: light.x, y: light.y }, width = light.displayWidth, height = light.displayHeight;
    let dragging = false, busy = awakening, pointerId = -1;
    let viewport = { width: window.innerWidth, height: window.innerHeight };
    const thread = scene.add.graphics().setName(`atoll-thread-${index}`);
    const move = () => {
      controls.move(`atoll-carry-${index}`, light.x, light.y);
      thread.clear();
      if (dragging) {
        thread.lineStyle(Math.max(1.2, art.width * 0.004), colours[index]!, 0.65)
          .beginPath().moveTo(home.x, home.y);
        for (let i = 1; i <= 22; i++) {
          const t = i / 22;
          thread.lineTo(Phaser.Math.Linear(home.x, light.x, t) + Math.sin(t * Math.PI * 2) * art.width * 0.018,
            Phaser.Math.Linear(home.y, light.y, t) - Math.sin(t * Math.PI) * art.height * 0.055);
        }
        thread.strokePath();
      }
    };
    const reset = () => {
      dragging = false; pointerId = -1; busy = true; thread.clear();
      if (reduced) { light.setPosition(home.x, home.y).setDisplaySize(width, height); busy = false; move(); return; }
      scene.tweens.add({ targets: light, ...home, duration: 350, ease: 'Sine.InOut',
        onUpdate: move, onComplete: () => { busy = false; light.setDisplaySize(width, height); move(); } });
    };
    const deposit = () => {
      dragging = false; busy = true; thread.clear();
      if (woven.has(index)) { reset(); return; }
      const result = onWoven(index);
      if (!result.activated) { reset(); return; }
      woven.add(index);
      finishing ||= result.collected;
      const finish = () => {
        if (result.collected) { onCollected(); return; }
        reset();
      };
      const paint = scene.add.image(art.left, art.top, strandPaint(scene, index)).setOrigin(0)
        .setDisplaySize(art.width, art.height).setName(`atoll-woven-${index}`);
      if (reduced) { finish(); return; }
      const f = paint.frame;
      scene.tweens.addCounter({ from: 0, to: 1, duration: 1050, ease: 'Sine.InOut', onUpdate: tween => {
        paint.setCrop(0, 0, f.width * (0.47 + (tween.getValue() ?? 0) * 0.49), f.height);
      }, onComplete: () => { paint.setCrop(); finish(); } });
      scene.tweens.add({ targets: light, x: art.left + art.width * atollBracelet.x,
        y: art.top + art.height * atollBracelet.y, alpha: 0, duration: 600, onComplete: () => {
          light.setPosition(home.x, home.y).setAlpha(0.85); move();
        } });
    };
    controls.add(`atoll-carry-${index}`, light.x, light.y, Math.max(44, width), Math.max(44, height), () => {
      if (!busy && !finishing && !scene.children.getByName('tutorial-paper')) deposit();
    }, false);
    const handle = scene.children.getByName(`atoll-carry-${index}`) as Phaser.GameObjects.Zone;
    // On phones the generous targets overlap: always pick the nearest visible reflection.
    handle.setInteractive({ hitArea: new Phaser.Geom.Rectangle(0, 0, handle.width, handle.height),
      hitAreaCallback: (area: Phaser.Geom.Rectangle, x: number, y: number) => {
        if (!Phaser.Geom.Rectangle.Contains(area, x, y)) return false;
        const other = scene.children.getByName(`atoll-carry-${1 - index}`) as Phaser.GameObjects.Zone | null;
        if (!other) return true;
        const wx = handle.x + x - handle.width / 2, wy = handle.y + y - handle.height / 2;
        const own = Math.hypot(wx - handle.x, wy - handle.y), theirs = Math.hypot(wx - other.x, wy - other.y);
        return index === 0 ? own <= theirs : own < theirs;
      } });
    handle.removeAllListeners('pointerdown'); scene.input.setDraggable(handle);
    handle.on('dragstart', (pointer: Phaser.Input.Pointer) => {
      if (busy || finishing || scene.children.getByName('tutorial-paper')) return;
      dragging = true; pointerId = pointer.id; viewport = { width: window.innerWidth, height: window.innerHeight };
      scene.tweens.killTweensOf(light); light.setAlpha(0.95).setDepth(3); thread.setDepth(3);
    });
    handle.on('drag', (pointer: Phaser.Input.Pointer, x: number, y: number) => {
      if (!dragging || pointer.id !== pointerId) return;
      light.setPosition(Phaser.Math.Clamp(x, art.left, art.left + art.width),
        Phaser.Math.Clamp(y, art.top, art.top + art.height)); move();
    });
    handle.on('dragend', (pointer: Phaser.Input.Pointer) => {
      if (!dragging || pointer.id !== pointerId) return;
      const cancelled = pointer.event?.type === 'touchcancel' || window.innerWidth !== viewport.width
        || window.innerHeight !== viewport.height || pointer.x < art.left || pointer.x > art.left + art.width
        || pointer.y < art.top || pointer.y > art.top + art.height;
      const valid = !cancelled && overAtollBracelet({ x: (light.x - art.left) / art.width,
        y: (light.y - art.top) / art.height }, Math.max(0.20, 28 / art.width), Math.max(0.14, 24 / art.height));
      if (valid) deposit(); else reset();
    });
    cancelers.push(() => { if (dragging) reset(); });
  });
  const cancel = () => cancelers.forEach(stop => stop());
  const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') cancel(); };
  const canvas = scene.game.canvas;
  scene.input.on('gameout', cancel); scene.game.events.on('blur', cancel);
  canvas.addEventListener('touchcancel', cancel); canvas.addEventListener('keydown', escape); window.addEventListener('resize', cancel);
  return () => {
    scene.input.off('gameout', cancel); scene.game.events.off('blur', cancel);
    canvas.removeEventListener('touchcancel', cancel); canvas.removeEventListener('keydown', escape); window.removeEventListener('resize', cancel);
  };
}
