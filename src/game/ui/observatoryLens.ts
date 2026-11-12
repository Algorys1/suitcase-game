import Phaser from 'phaser';
import { canCaptureSky, lensProximity, lensSky, lensStand, overLensStand } from '../../domain/observatoryLens';
import { AdventureControls, reducedMotion } from './adventureMap';
import type { WorldFrame } from './pilotWorlds';

const original = 'destination-observatoire_des_etoiles';
const lensRegion = { left: 0.139, top: 0.612, width: 0.130, height: 0.164 };
const carriedScale = 0.90;
const patchRegion = { left: 0.125, top: 0.600, width: 0.155, height: 0.185 };

function lensTexture(full: boolean): string {
  return full ? 'adventure-observatory-lens-full' : 'adventure-observatory-lens-empty';
}

/** Paint only the local support area; telescope and all other scenery remain original. */
function baseTexture(scene: Phaser.Scene, lifted: boolean): string {
  const key = lifted ? 'observatory-support-empty' : 'observatory-at-rest-empty';
  if (scene.textures.exists(key)) return key;
  const f = scene.textures.getFrame(original), from = scene.textures.getFrame(
    lifted ? 'adventure-observatory-lifted' : 'adventure-observatory-empty');
  const texture = scene.textures.createCanvas(key, 2 ** Math.ceil(Math.log2(f.width)), 2 ** Math.ceil(Math.log2(f.height)))!;
  texture.get().setSize(f.width, f.height, 0, 0);
  const ctx = texture.getContext();
  ctx.drawImage(f.source.image as CanvasImageSource, f.cutX, f.cutY, f.cutWidth, f.cutHeight, 0, 0, f.width, f.height);
  const r = patchRegion;
  ctx.drawImage(from.source.image as CanvasImageSource, from.cutX + r.left * from.cutWidth, from.cutY + r.top * from.cutHeight,
    r.width * from.cutWidth, r.height * from.cutHeight, r.left * f.width, r.top * f.height, r.width * f.width, r.height * f.height);
  texture.refresh(); return key;
}

export function observatoryPostcard(scene: Phaser.Scene, steps: readonly number[]): string {
  if (!scene.textures.exists('adventure-observatory-empty') || !scene.textures.exists(lensTexture(true))) return original;
  if (steps.length === 2) return original;
  if (!steps.length) return baseTexture(scene, false);
  const key = 'observatory-captured-sky';
  if (scene.textures.exists(key)) return key;
  const f = scene.textures.getFrame(baseTexture(scene, true)), lens = scene.textures.getFrame(lensTexture(true));
  const texture = scene.textures.createCanvas(key, 2 ** Math.ceil(Math.log2(f.width)), 2 ** Math.ceil(Math.log2(f.height)))!;
  texture.get().setSize(f.width, f.height, 0, 0);
  const ctx = texture.getContext();
  ctx.drawImage(f.source.image as CanvasImageSource, f.cutX, f.cutY, f.cutWidth, f.cutHeight, 0, 0, f.width, f.height);
  const w = lensRegion.width * f.width * carriedScale, h = lensRegion.height * f.height * carriedScale;
  ctx.save(); ctx.translate(lensSky.x * f.width, lensSky.y * f.height); ctx.scale(-1, 1);
  ctx.drawImage(lens.source.image as CanvasImageSource, lens.cutX, lens.cutY, lens.cutWidth, lens.cutHeight,
    -w / 2, -h / 2, w, h); ctx.restore();
  texture.refresh(); return key;
}

export function drawLensTwinkle(scene: Phaser.Scene, art: WorldFrame, complete: boolean): Phaser.GameObjects.Graphics[] {
  if (!complete) return [];
  const light = scene.add.graphics().setName('observatory-lens-twinkle'), state = { phase: 0 };
  const stars = [[0.177, 0.656, 0.0044], [0.206, 0.684, 0.0065], [0.231, 0.713, 0.0043]];
  const paint = () => {
    light.clear();
    stars.forEach(([u, v, size], i) => {
      const glow = (1 + Math.cos((state.phase + i * 0.37) * Math.PI * 2)) / 2;
      const x = art.left + u! * art.width, y = art.top + v! * art.height, r = Math.max(1, size! * art.width);
      for (let j = 3; j >= 1; j--) light.fillStyle(0xffe8a2, glow * 0.055)
        .fillEllipse(x, y, r * j * 2.1, r * j * 2.1);
      light.fillStyle(0xfff3c5, 0.15 + glow * 0.80);
      light.beginPath().moveTo(x, y - r).lineTo(x + r * 0.22, y - r * 0.22)
        .lineTo(x + r, y).lineTo(x + r * 0.22, y + r * 0.22).lineTo(x, y + r)
        .lineTo(x - r * 0.22, y + r * 0.22).lineTo(x - r, y)
        .lineTo(x - r * 0.22, y - r * 0.22).closePath().fillPath();
    });
  };
  paint();
  if (!reducedMotion()) {
    const tween = scene.tweens.add({ targets: state, phase: 1, duration: 7000, repeat: -1, onUpdate: paint });
    light.once('destroy', () => tween.remove());
  }
  return [light];
}

export function addObservatoryLens(scene: Phaser.Scene, controls: AdventureControls, art: WorldFrame,
  steps: readonly number[], onStep: (index: number) => { activated: boolean; collected: boolean },
  onReturned: (collected: boolean) => void, awakening: boolean): () => void {
  const picture = scene.children.getByName('exploration-art') as Phaser.GameObjects.Image;
  if (steps.length === 2) {
    picture.setTexture(original).setDisplaySize(art.width, art.height); drawLensTwinkle(scene, art, true); return () => {};
  }
  picture.setTexture(baseTexture(scene, true)).setDisplaySize(art.width, art.height);
  let captured = steps.includes(0), selected = false, dragging = false, moved = false, busy = awakening, disposed = false, pointerId = -1;
  let start = { x: 0, y: 0 }, viewport = { width: window.innerWidth, height: window.innerHeight };
  let position: { x: number; y: number } = captured ? { ...lensSky } : { ...lensStand };
  const point = (p: { x: number; y: number }) => ({ x: art.left + p.x * art.width, y: art.top + p.y * art.height });
  const empty = scene.add.image(0, 0, lensTexture(false)).setFlipX(true).setName('observatory-moving-lens');
  const full = scene.add.image(0, 0, lensTexture(true)).setFlipX(true).setName('observatory-captured-stars');
  let sky: Phaser.GameObjects.Zone, stand: Phaser.GameObjects.Zone;
  const paint = () => {
    const lifted = selected || captured;
    picture.setTexture(baseTexture(scene, lifted)).setDisplaySize(art.width, art.height);
    const p = point(position), scale = lifted ? carriedScale : 1;
    for (const image of [empty, full]) image.setVisible(lifted).setPosition(p.x, p.y)
      .setDisplaySize(lensRegion.width * art.width * scale, lensRegion.height * art.height * scale);
    full.setAlpha(captured ? 1 : selected ? lensProximity(position.x, position.y) : 0);
    controls.move('observatory-lens', p.x, p.y);
  };
  const reset = () => {
    selected = false; dragging = false; pointerId = -1;
    position = captured ? { ...lensSky } : { ...lensStand }; paint();
    if (sky?.input) sky.input.enabled = false;
    if (stand?.input) stand.input.enabled = false;
  };
  const choose = () => {
    if (busy || disposed || scene.children.getByName('tutorial-paper')) return;
    selected = true; paint(); sky.input!.enabled = !captured; stand.input!.enabled = captured;
  };
  const move = (x: number, y: number) => {
    position = { x: Phaser.Math.Clamp(x, 0.065, 0.935), y: Phaser.Math.Clamp(y, 0.085, 0.915) };
    if (!captured && canCaptureSky(position.x, position.y)) {
      const result = onStep(0);
      if (result.activated) { captured = true; sky.input!.enabled = false; stand.input!.enabled = true; }
    }
    paint();
  };
  const putBack = () => {
    if (!selected || !captured || busy || dragging || disposed || scene.children.getByName('tutorial-paper')) return;
    const result = onStep(1); if (!result.activated) { reset(); return; }
    busy = true; selected = false; sky.disableInteractive(); stand.disableInteractive();
    if (reducedMotion()) { onReturned(result.collected); return; }
    const home = point(lensStand);
    for (const image of [empty, full]) scene.tweens.add({ targets: image, ...home,
      displayWidth: lensRegion.width * art.width, displayHeight: lensRegion.height * art.height,
      duration: 450, ease: 'Sine.Out' });
    const seated = scene.add.image(art.left, art.top, original).setOrigin(0)
      .setDisplaySize(art.width, art.height).setAlpha(0).setName('observatory-lens-seating');
    scene.tweens.add({ targets: seated, alpha: 1, delay: 300, duration: 180 });
    scene.tweens.add({ targets: [empty, full], alpha: 0, delay: 300, duration: 180 });
    scene.tweens.addCounter({ from: 0, to: 1, duration: 490, onComplete: () => { if (!disposed) onReturned(result.collected); } });
  };
  const home = point(position);
  controls.add('observatory-lens', home.x, home.y, Math.max(44, art.width * 0.123), Math.max(44, art.height * 0.151),
    () => { if (!dragging) choose(); }, false);
  const handle = scene.children.getByName('observatory-lens') as Phaser.GameObjects.Zone;
  scene.input.setDraggable(handle);
  handle.on('dragstart', (pointer: Phaser.Input.Pointer) => {
    if (busy || disposed || scene.children.getByName('tutorial-paper')) return;
    choose(); dragging = true; moved = false; pointerId = pointer.id; start = { x: pointer.x, y: pointer.y };
    viewport = { width: window.innerWidth, height: window.innerHeight };
  });
  handle.on('drag', (pointer: Phaser.Input.Pointer) => {
    if (!dragging || pointer.id !== pointerId) return;
    moved ||= Math.hypot(pointer.x - start.x, pointer.y - start.y) >= 6;
    move((pointer.x - art.left) / art.width, (pointer.y - art.top) / art.height);
  });
  handle.on('dragend', (pointer: Phaser.Input.Pointer) => {
    if (!dragging || pointer.id !== pointerId) return;
    dragging = false;
    if (pointer.event?.type === 'touchcancel' || window.innerWidth !== viewport.width || window.innerHeight !== viewport.height
      || pointer.x < art.left || pointer.x > art.left + art.width || pointer.y < art.top || pointer.y > art.top + art.height) { reset(); return; }
    if (!moved) return;
    if (captured && overLensStand((pointer.x - art.left) / art.width, (pointer.y - art.top) / art.height)) putBack();
    else reset();
  });
  const skyPoint = point(lensSky), standPoint = point(lensStand);
  controls.add('observatory-sky', skyPoint.x, skyPoint.y, Math.max(44, art.width * 0.20), Math.max(44, art.height * 0.18), () => {
    if (selected && !captured && !dragging && !busy) move(lensSky.x, lensSky.y);
  }, false);
  sky = scene.children.getByName('observatory-sky') as Phaser.GameObjects.Zone; sky.disableInteractive();
  controls.add('observatory-stand', standPoint.x, standPoint.y, Math.max(44, art.width * 0.13), Math.max(44, art.height * 0.17), putBack, false);
  stand = scene.children.getByName('observatory-stand') as Phaser.GameObjects.Zone; stand.disableInteractive();
  paint();
  const cancel = () => { if (!busy) reset(); };
  const keyboard = (event: KeyboardEvent) => {
    if (event.key === 'Escape') { cancel(); return; }
    if (!selected || dragging || busy || event.altKey || event.ctrlKey || event.metaKey) return;
    const delta: Record<string, readonly [number, number]> = { ArrowLeft: [-0.025, 0], ArrowRight: [0.025, 0], ArrowUp: [0, -0.025], ArrowDown: [0, 0.025] };
    const d = delta[event.key]; if (!d) return;
    event.preventDefault(); move(position.x + d[0], position.y + d[1]);
  };
  const canvas = scene.game.canvas;
  scene.input.on('gameout', cancel); scene.game.events.on('blur', cancel);
  canvas.addEventListener('touchcancel', cancel); canvas.addEventListener('keydown', keyboard); window.addEventListener('resize', cancel);
  return () => {
    disposed = true; scene.input.off('gameout', cancel); scene.game.events.off('blur', cancel);
    canvas.removeEventListener('touchcancel', cancel); canvas.removeEventListener('keydown', keyboard); window.removeEventListener('resize', cancel);
  };
}
