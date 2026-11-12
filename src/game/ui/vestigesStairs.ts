import Phaser from 'phaser';
import { overStairFrontier, stairFlights, stairFrontier, stairOutline, stairTiles } from '../../domain/vestigesStairs';
import { AdventureControls, reducedMotion } from './adventureMap';
import type { WorldFrame } from './pilotWorlds';
import { drawVestigesMist } from './vestigesMist';

const original = 'destination-vestiges_celestes', tileKey = 'adventure-vestiges-tile';

/** Extract the painted staircase in three diagonal bands, plus the opened door.
 * Small, tightly framed textures keep the real masonry and its perspective. */
function paintedPart(scene: Phaser.Scene, index: number) {
  const frame = scene.textures.getFrame(original), complete = scene.textures.getFrame('adventure-vestiges-complete');
  const flight = stairFlights[index];
  const bounds = flight?.bounds ?? { left: 0.70, top: 0.13, width: 0.15, height: 0.26 };
  const left = Math.floor(bounds.left * frame.width), top = Math.floor(bounds.top * frame.height);
  const width = Math.ceil(bounds.width * frame.width), height = Math.ceil(bounds.height * frame.height);
  const key = index === 3 ? 'vestiges-door-open' : `vestiges-flight-${index}`;
  if (!scene.textures.exists(key)) {
    const canvas = document.createElement('canvas');
    canvas.width = 2 ** Math.ceil(Math.log2(width)); canvas.height = 2 ** Math.ceil(Math.log2(height));
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.translate(-left, -top);
    const clip = (points: readonly (readonly [number, number])[]) => {
      ctx.beginPath(); points.forEach(([x, y], i) => {
        if (i === 0) ctx.moveTo(x * frame.width, y * frame.height);
        else ctx.lineTo(x * frame.width, y * frame.height);
      }); ctx.closePath(); ctx.clip();
    };
    if (flight) {
      clip(stairOutline);
      clip([[0, flight.far], [1, flight.far + 0.2], [1, flight.near + 0.2], [0, flight.near]]);
    } else clip([[0.716, 0.195], [0.740, 0.165], [0.790, 0.151], [0.825, 0.170],
      [0.841, 0.195], [0.841, 0.376], [0.716, 0.376]]);
    ctx.drawImage(complete.source.image as CanvasImageSource, complete.cutX, complete.cutY,
      complete.cutWidth, complete.cutHeight, 0, 0, frame.width, frame.height);
    scene.textures.addCanvas(key, canvas)?.get().setSize(width, height, 0, 0);
  }
  return { key, left: left / frame.width, top: top / frame.height, width: width / frame.width, height: height / frame.height };
}

function partImage(scene: Phaser.Scene, art: WorldFrame, index: number) {
  const p = paintedPart(scene, index);
  return scene.add.image(art.left + p.left * art.width, art.top + p.top * art.height, p.key).setOrigin(0)
    .setDisplaySize(p.width * art.width, p.height * art.height)
    .setName(index === 3 ? 'vestiges-door' : `vestiges-flight-${index}`);
}

/** One composed texture is shared by postcards and map thumbnails. Exploration uses
 * the same painted pieces as individual sprites so the player can actually carry them. */
export function stairsPostcard(scene: Phaser.Scene, steps: readonly number[]): string {
  if (!scene.textures.exists(original) || !scene.textures.exists(tileKey)
    || !scene.textures.exists('adventure-vestiges-complete')) return original;
  const key = 'vestiges-stairs-current', signature = [...steps].sort().join(',');
  const existing = scene.textures.exists(key) ? scene.textures.get(key) as Phaser.Textures.CanvasTexture : null;
  if (existing?.canvas.dataset.steps === signature) return key;
  const frame = scene.textures.getFrame(original), tile = scene.textures.getFrame(tileKey);
  // Match the illustration cache: power-of-two backing allows mipmaps on the
  // small journal cards, while the frame excludes the transparent padding.
  const texture = existing ?? scene.textures.createCanvas(key,
    2 ** Math.ceil(Math.log2(frame.width)), 2 ** Math.ceil(Math.log2(frame.height)));
  if (!texture) return original;
  if (!existing) texture.get().setSize(frame.width, frame.height, 0, 0);
  const ctx = texture.getContext();
  ctx.clearRect(0, 0, frame.width, frame.height);
  ctx.drawImage(frame.source.image as CanvasImageSource, frame.cutX, frame.cutY, frame.cutWidth, frame.cutHeight,
    0, 0, frame.width, frame.height);
  const paint = (x: number, y: number, width: number, angle = 0) => {
    const w = width * frame.width, h = w * tile.height / tile.width;
    ctx.save(); ctx.translate(x * frame.width, y * frame.height); ctx.rotate(angle * Math.PI / 180);
    ctx.drawImage(tile.source.image as CanvasImageSource, tile.cutX, tile.cutY, tile.cutWidth, tile.cutHeight,
      -w / 2, -h / 2, w, h); ctx.restore();
  };
  const paintPart = (index: number) => {
    const p = paintedPart(scene, index), f = scene.textures.getFrame(p.key);
    ctx.drawImage(f.source.image as CanvasImageSource, f.cutX, f.cutY, f.cutWidth, f.cutHeight,
      p.left * frame.width, p.top * frame.height, p.width * frame.width, p.height * frame.height);
  };
  for (let i = 0; i < steps.length; i++) paintPart(i);
  if (steps.length === 3) paintPart(3);
  stairTiles.forEach((tile, index) => { if (!steps.includes(index)) paint(tile.x, tile.y, tile.width, tile.angle); });
  texture.canvas.dataset.steps = signature; texture.refresh();
  return key;
}

function slab(scene: Phaser.Scene, art: WorldFrame, point: { x: number; y: number; width: number }, name: string) {
  const image = scene.add.image(art.left + point.x * art.width, art.top + point.y * art.height, tileKey).setName(name);
  return image.setScale(art.width * point.width / image.width);
}

export function addVestigesStairs(scene: Phaser.Scene, controls: AdventureControls, art: WorldFrame,
  steps: readonly number[], onBuild: (index: number) => { activated: boolean; collected: boolean },
  onBuilt: (collected: boolean) => void, awakening: boolean): () => void {
  if (!scene.textures.exists(tileKey) || !scene.textures.exists('adventure-vestiges-complete')) return () => {};
  const picture = scene.children.getByName('exploration-art') as Phaser.GameObjects.Image;
  picture.setTexture(original).setDisplaySize(art.width, art.height);
  for (let i = 0; i < steps.length; i++) partImage(scene, art, i);
  if (steps.length === 3) {
    const door = partImage(scene, art, 3);
    if (awakening && !reducedMotion()) {
      door.setAlpha(0); scene.tweens.add({ targets: door, alpha: 1, duration: 650 });
    }
  }
  drawVestigesMist(scene, art, steps.length === 3);
  const used = new Set(steps), pieces = new Map<number, Phaser.GameObjects.Image>();
  if (used.size === stairTiles.length) return () => {};
  let selected: number | null = null, dragging = false, moved = false, busy = awakening, disposed = false, pointerId = -1;
  let start = { x: 0, y: 0 }, viewport = { width: window.innerWidth, height: window.innerHeight };
  const reduced = reducedMotion(), frontier = stairFrontier(used.size);
  let goal: Phaser.GameObjects.Zone;
  const home = (index: number) => ({ x: art.left + stairTiles[index]!.x * art.width,
    y: art.top + stairTiles[index]!.y * art.height });
  const reset = () => {
    dragging = false; pointerId = -1;
    if (selected !== null) {
      const index = selected, image = pieces.get(index)!;
      scene.tweens.killTweensOf(image);
      if (reduced || disposed) image.setPosition(home(index).x, home(index).y);
      else scene.tweens.add({ targets: image, ...home(index), duration: 260, ease: 'Sine.Out' });
      controls.move(`vestiges-tile-${index}`, home(index).x, home(index).y);
      image.setDepth(0);
    }
    selected = null;
    if (goal?.input) goal.input.enabled = false;
  };
  const choose = (index: number) => {
    if (disposed || busy || used.has(index) || scene.children.getByName('tutorial-paper')) return;
    reset(); selected = index;
    const image = pieces.get(index)!;
    scene.tweens.killTweensOf(image);
    image.setPosition(home(index).x, home(index).y - 3).setDepth(2);
    controls.move(`vestiges-tile-${index}`, image.x, image.y);
    if (goal.input) goal.input.enabled = true;
  };
  const place = () => {
    if (disposed || busy || dragging || selected === null || scene.children.getByName('tutorial-paper')) return;
    const index = selected, image = pieces.get(index)!, result = onBuild(index);
    if (!result.activated) { reset(); return; }
    busy = true; dragging = false; selected = null; goal.disableInteractive();
    const finish = () => { if (!disposed) onBuilt(result.collected); };
    const flight = partImage(scene, art, steps.length);
    if (reduced) { image.setVisible(false); finish(); return; }
    flight.setAlpha(0);
    scene.tweens.add({ targets: flight, alpha: 1, delay: 100, duration: 600, ease: 'Sine.Out' });
    scene.tweens.add({ targets: image, x: art.left + frontier.x * art.width,
      y: art.top + frontier.y * art.height, alpha: 0, duration: 280 });
    scene.tweens.addCounter({ from: 0, to: 1, duration: 740, onComplete: finish });
  };
  stairTiles.forEach((tile, index) => {
    if (used.has(index)) return;
    const image = slab(scene, art, tile, `vestiges-loose-${index}`).setAngle(tile.angle); pieces.set(index, image);
    controls.add(`vestiges-tile-${index}`, image.x, image.y, Math.max(44, image.displayWidth), 44,
      // Phaser 4 emits dragstart before pointerdown when its threshold is zero.
      // Do not reset the drag already started by that same press.
      () => { if (!dragging) choose(index); }, false);
    const handle = scene.children.getByName(`vestiges-tile-${index}`) as Phaser.GameObjects.Zone;
    scene.input.setDraggable(handle);
    handle.on('dragstart', (pointer: Phaser.Input.Pointer) => {
      if (busy || disposed || scene.children.getByName('tutorial-paper')) return;
      choose(index); dragging = true; moved = false; pointerId = pointer.id;
      start = { x: pointer.x, y: pointer.y }; viewport = { width: window.innerWidth, height: window.innerHeight };
    });
    handle.on('drag', (pointer: Phaser.Input.Pointer, x: number, y: number) => {
      if (!dragging || selected !== index || pointer.id !== pointerId) return;
      moved ||= Math.hypot(pointer.x - start.x, pointer.y - start.y) >= 6;
      image.setPosition(Phaser.Math.Clamp(x, art.left, art.left + art.width),
        Phaser.Math.Clamp(y, art.top, art.top + art.height));
      controls.move(`vestiges-tile-${index}`, image.x, image.y);
    });
    handle.on('dragend', (pointer: Phaser.Input.Pointer) => {
      if (!dragging || selected !== index || pointer.id !== pointerId) return;
      dragging = false;
      const cancelled = pointer.event?.type === 'touchcancel' || window.innerWidth !== viewport.width
        || window.innerHeight !== viewport.height || pointer.x < art.left || pointer.x > art.left + art.width
        || pointer.y < art.top || pointer.y > art.top + art.height;
      if (cancelled) { reset(); return; }
      if (!moved) { image.setPosition(home(index).x, home(index).y - 3); return; }
      if (overStairFrontier({ x: (pointer.x - art.left) / art.width, y: (pointer.y - art.top) / art.height }, used.size,
        Math.max(0.075, 22 / art.width), Math.max(0.06, 22 / art.height))) place();
      else reset();
    });
  });
  pieces.forEach((_, index) => {
    const handle = scene.children.getByName(`vestiges-tile-${index}`) as Phaser.GameObjects.Zone;
    handle.input!.hitAreaCallback = (area: Phaser.Geom.Rectangle, x: number, y: number) => {
      if (!Phaser.Geom.Rectangle.Contains(area, x, y)) return false;
      const wx = handle.x + x - handle.width / 2, wy = handle.y + y - handle.height / 2;
      const distance = Math.hypot(wx - handle.x, wy - handle.y);
      return [...pieces.keys()].every(other => {
        if (other === index) return true;
        const peer = scene.children.getByName(`vestiges-tile-${other}`) as Phaser.GameObjects.Zone;
        const peerDistance = Math.hypot(wx - peer.x, wy - peer.y);
        return index < other ? distance <= peerDistance : distance < peerDistance;
      });
    };
  });
  const goalW = Math.max(44, art.width * 0.15), goalH = Math.max(44, art.height * 0.12);
  controls.add('vestiges-frontier', art.left + frontier.x * art.width, art.top + frontier.y * art.height,
    goalW, goalH, place, false);
  goal = scene.children.getByName('vestiges-frontier') as Phaser.GameObjects.Zone;
  // setInteractive() on an already-enabled Zone keeps its original rectangle in
  // Phaser 4. Replace the hit area explicitly; on phones it neighbours tile 0.
  goal.input!.hitArea = new Phaser.Geom.Ellipse(goalW / 2, goalH / 2, goalW, goalH);
  goal.input!.customHitArea = true;
  goal.input!.hitAreaCallback = (area: Phaser.Geom.Ellipse, x: number, y: number) => {
    if (!Phaser.Geom.Ellipse.Contains(area, x, y)) return false;
    const wx = goal.x + x - goalW / 2, wy = goal.y + y - goalH / 2;
    const distance = Math.hypot(wx - goal.x, wy - goal.y);
    return [...pieces.keys()].every(index => {
      const handle = scene.children.getByName(`vestiges-tile-${index}`) as Phaser.GameObjects.Zone;
      return Math.hypot(wx - handle.x, wy - handle.y) > distance;
    });
  };
  goal.disableInteractive();
  const cancel = () => { if (!busy) reset(); };
  const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') cancel(); };
  const canvas = scene.game.canvas;
  scene.input.on('gameout', cancel); scene.game.events.on('blur', cancel);
  canvas.addEventListener('touchcancel', cancel); canvas.addEventListener('keydown', escape); window.addEventListener('resize', cancel);
  return () => {
    disposed = true;
    scene.input.off('gameout', cancel); scene.game.events.off('blur', cancel);
    canvas.removeEventListener('touchcancel', cancel); canvas.removeEventListener('keydown', escape); window.removeEventListener('resize', cancel);
  };
}
