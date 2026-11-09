import Phaser from 'phaser';
import { nearStormLightning, nearStormMouth, stormMouth, stormRest } from '../../domain/stormLightning';
import { AdventureControls, reducedMotion } from './adventureMap';
import type { WorldFrame } from './pilotWorlds';
import { getTexts } from '../../services/i18n';

const original = 'destination-tempete_ecarlate';

/** Registration matched patch: every pixel outside the bottle remains the original painting. */
function openBottle(scene: Phaser.Scene): string {
  const key = 'storm-open-base';
  if (scene.textures.exists(key)) return key;
  if (!scene.textures.exists('adventure-storm-empty')) return original;
  const f = scene.textures.getFrame(original), empty = scene.textures.getFrame('adventure-storm-empty');
  const canvas = document.createElement('canvas'); canvas.width = f.width; canvas.height = f.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(f.source.image as CanvasImageSource, f.cutX, f.cutY, f.cutWidth, f.cutHeight,
    0, 0, canvas.width, canvas.height);
  const patch = document.createElement('canvas'); patch.width = canvas.width; patch.height = canvas.height;
  const pc = patch.getContext('2d', { willReadFrequently: true })!;
  pc.fillStyle = 'white'; pc.shadowColor = 'white'; pc.shadowBlur = 5;
  pc.fillRect(canvas.width * 0.65, canvas.height * 0.503, canvas.width * 0.154, canvas.height * 0.30);
  pc.globalCompositeOperation = 'source-in'; pc.shadowBlur = 0;
  pc.drawImage(empty.source.image as CanvasImageSource, empty.cutX, empty.cutY, empty.cutWidth, empty.cutHeight,
    0, 0, patch.width, patch.height);
  ctx.drawImage(patch, 0, 0);
  scene.textures.addCanvas(key, canvas)?.get().setSize(canvas.width, canvas.height, 0, 0);
  return key;
}

function boltTexture(scene: Phaser.Scene): string {
  const key = 'storm-little-bolt';
  if (scene.textures.exists(key)) return key;
  const texture = scene.textures.createCanvas(key, 128, 192)!;
  const ctx = texture.context;
  ctx.shadowColor = '#ffc84b'; ctx.shadowBlur = 15; ctx.fillStyle = '#fff2a1';
  ctx.beginPath(); ctx.moveTo(91, 18); ctx.lineTo(30, 105); ctx.lineTo(62, 105);
  ctx.lineTo(32, 174); ctx.lineTo(102, 76); ctx.lineTo(69, 76); ctx.closePath(); ctx.fill();
  texture.refresh(); return key;
}

/** Separate the painted golden lightning from the glass, without moving the bottle. */
export function drawStormBottle(scene: Phaser.Scene, art: WorldFrame): Phaser.GameObjects.Image[] {
  if (!scene.textures.exists('adventure-storm-empty') || !scene.textures.exists(original)) return [];
  const baseKey = 'storm-living-base', lightKey = 'storm-painted-light';
  const region = { x: 0.678, y: 0.635, w: 0.087, h: 0.139 };
  if (!scene.textures.exists(baseKey)) {
    const f = scene.textures.getFrame(original), empty = scene.textures.getFrame('adventure-storm-empty');
    const canvas = document.createElement('canvas'); canvas.width = f.width; canvas.height = f.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.drawImage(f.source.image as CanvasImageSource, f.cutX, f.cutY, f.cutWidth, f.cutHeight,
      0, 0, canvas.width, canvas.height);
    const painted = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const patch = document.createElement('canvas'); patch.width = canvas.width; patch.height = canvas.height;
    const pc = patch.getContext('2d', { willReadFrequently: true })!;
    pc.drawImage(empty.source.image as CanvasImageSource, empty.cutX, empty.cutY, empty.cutWidth, empty.cutHeight,
      0, 0, patch.width, patch.height);
    const clear = pc.getImageData(0, 0, patch.width, patch.height);
    const light = document.createElement('canvas');
    light.width = Math.ceil(canvas.width * region.w); light.height = Math.ceil(canvas.height * region.h);
    const lc = light.getContext('2d')!, pixels = lc.createImageData(light.width, light.height);
    const left = Math.round(canvas.width * region.x), top = Math.round(canvas.height * region.y);
    for (let y = 0; y < light.height; y++) for (let x = 0; x < light.width; x++) {
      const i = ((top + y) * canvas.width + left + x) * 4, j = (y * light.width + x) * 4;
      const edge = Math.max(0, Math.min(1, (1 - Math.hypot((x / light.width - 0.5) / 0.53,
        (y / light.height - 0.5) / 0.54)) * 9));
      const r = painted.data[i]!, g = painted.data[i + 1]!, b = painted.data[i + 2]!;
      const gold = Math.max(0, Math.min(1, (g - 118) / 65)) * Math.max(0, Math.min(1, (r - b - 55) / 45)) * edge;
      for (let c = 0; c < 3; c++) {
        pixels.data[j + c] = painted.data[i + c]!;
        painted.data[i + c] = painted.data[i + c]! * (1 - edge) + clear.data[i + c]! * edge;
      }
      pixels.data[j + 3] = gold * 255;
    }
    ctx.putImageData(painted, 0, 0); lc.putImageData(pixels, 0, 0);
    scene.textures.addCanvas(baseKey, canvas)?.get().setSize(canvas.width, canvas.height, 0, 0);
    scene.textures.addCanvas(lightKey, light);
  }
  const base = scene.add.image(art.left, art.top, baseKey).setOrigin(0)
    .setDisplaySize(art.width, art.height).setName('storm-living-bottle');
  const light = scene.add.image(art.left + art.width * (region.x + region.w / 2),
    art.top + art.height * (region.y + region.h / 2), lightKey)
    .setDisplaySize(art.width * region.w, art.height * region.h).setName('storm-bottled-lightning');
  if (!reducedMotion()) {
    scene.tweens.add({ targets: light, y: light.y - art.height * 0.008, angle: 5,
      duration: 1750, ease: 'Sine.InOut', yoyo: true, repeat: -1 });
    scene.tweens.add({ targets: light, alpha: 0.72, duration: 2300,
      ease: 'Sine.InOut', yoyo: true, repeat: -1 });
  }
  light.once('destroy', () => scene.tweens.killTweensOf(light));
  return [base, light];
}

/** Static postcard uses precisely the same sources and positions as the moving scene. */
export function stormPostcard(scene: Phaser.Scene, steps: readonly number[]): string {
  if (steps.includes(1)) return original;
  const key = `storm-postcard-${steps.includes(0) ? 'caught' : 'empty'}`;
  if (scene.textures.exists(key)) return key;
  if (!scene.textures.exists('adventure-storm-cork')) return original;
  const f = scene.textures.getFrame(openBottle(scene));
  const canvas = document.createElement('canvas'); canvas.width = f.width; canvas.height = f.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(f.source.image as CanvasImageSource, f.cutX, f.cutY, f.cutWidth, f.cutHeight,
    0, 0, canvas.width, canvas.height);
  const p = steps.includes(0) ? stormRest : stormMouth, c = scene.textures.getFrame('adventure-storm-cork');
  const w = canvas.width * 0.071, h = w * c.height / c.width;
  ctx.drawImage(c.source.image as CanvasImageSource, c.cutX, c.cutY, c.cutWidth, c.cutHeight,
    p.x * canvas.width - w / 2, p.y * canvas.height - h / 2, w, h);
  if (steps.includes(0)) {
    const b = scene.textures.getFrame(boltTexture(scene)), bw = canvas.width * 0.033, bh = bw * b.height / b.width;
    ctx.strokeStyle = '#ffe6a1'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(p.x * canvas.width, p.y * canvas.height + h / 2);
    ctx.quadraticCurveTo((p.x - 0.014) * canvas.width, (p.y + 0.04) * canvas.height,
      p.x * canvas.width, (p.y + 0.055) * canvas.height); ctx.stroke();
    ctx.drawImage(b.source.image as CanvasImageSource, b.cutX, b.cutY, b.cutWidth, b.cutHeight,
      p.x * canvas.width - bw / 2, (p.y + 0.06) * canvas.height - bh / 2, bw, bh);
  }
  scene.textures.addCanvas(key, canvas)?.get().setSize(canvas.width, canvas.height, 0, 0);
  return key;
}

/** The cork attracts a spark by proximity; the player may keep carrying it in one gesture. */
export function addStormLightning(scene: Phaser.Scene, controls: AdventureControls, art: WorldFrame,
  steps: readonly number[], onStep: (index: number) => { activated: boolean; collected: boolean },
  onCollected: () => void, awakening: boolean): () => void {
  const reduced = reducedMotion(), copy = getTexts().adventure;
  const px = (x: number) => art.left + art.width * x, py = (y: number) => art.top + art.height * y;
  const instruction = () => scene.children.getByName('exploration-instruction') as Phaser.GameObjects.Text | null;
  const pulse = () => {
    if (reduced || scene.children.getByName('storm-bottle-glow')) return;
    const glow = scene.add.image(px(0.721), py(0.708), boltTexture(scene)).setName('storm-bottle-glow')
      .setDisplaySize(art.width * 0.036, art.height * 0.10).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0);
    scene.tweens.add({ targets: glow, alpha: 0.6, y: glow.y - art.height * 0.012,
      duration: 650, yoyo: true, ease: 'Sine.InOut', onComplete: () => glow.destroy() });
  };
  if (steps.includes(1)) {
    drawStormBottle(scene, art);
    if (awakening && !reduced) {
      const veil = scene.add.image(art.left, art.top, openBottle(scene)).setOrigin(0)
        .setDisplaySize(art.width, art.height).setName('storm-closing-landscape');
      const lid = scene.add.image(px(stormMouth.x), py(stormMouth.y - 0.09), 'adventure-storm-cork')
        .setName('storm-closing-cork');
      lid.setScale(art.width * 0.071 / lid.width);
      const light = scene.add.image(px(stormMouth.x), py(stormMouth.y - 0.025), boltTexture(scene))
        .setName('storm-entering-spark').setDisplaySize(art.width * 0.033, art.height * 0.066);
      scene.tweens.add({ targets: light, x: px(0.721), y: py(0.705), angle: 12,
        duration: 850, ease: 'Sine.InOut' });
      scene.tweens.add({ targets: lid, y: py(stormMouth.y), delay: 500, duration: 500, ease: 'Sine.InOut' });
      scene.tweens.add({ targets: [veil, lid, light], alpha: 0, delay: 1000, duration: 350,
        onComplete: () => { veil.destroy(); lid.destroy(); light.destroy(); pulse(); } });
    }
    controls.add('storm-bottle', px(0.724), py(0.683), Math.max(44, art.width * 0.13),
      Math.max(44, art.height * 0.23), () => {
        if (!awakening && !scene.children.getByName('tutorial-paper')) pulse();
      }, false);
    return () => {};
  }
  if (!scene.textures.exists('adventure-storm-cork') || !scene.textures.exists('adventure-storm-empty')) return () => {};
  scene.add.image(art.left, art.top, openBottle(scene)).setOrigin(0).setDisplaySize(art.width, art.height)
    .setName('storm-open-landscape');
  let caught = steps.includes(0), carrying = caught, dragging = false, busy = awakening, pointerId = -1;
  let dragViewport = { width: window.innerWidth, height: window.innerHeight };
  let lifted = caught;
  const start = caught ? stormRest : stormMouth;
  const cork = scene.add.image(px(start.x), py(start.y), 'adventure-storm-cork').setName('storm-cork-paint');
  cork.setScale(art.width * 0.071 / cork.width);
  const cord = scene.add.graphics().setName('storm-electric-thread');
  const spark = scene.add.image(cork.x, cork.y, boltTexture(scene)).setName('storm-spark')
    .setDisplaySize(art.width * 0.033, art.height * 0.066).setVisible(caught);
  const sync = () => {
    controls.move('storm-cork', cork.x, cork.y);
    spark.setPosition(cork.x, cork.y + art.height * 0.06).setVisible(carrying);
    cord.clear();
    if (carrying) {
      cord.lineStyle(Math.max(0.8, art.width * 0.0018), 0xffe4a1, 0.85)
        .beginPath().moveTo(cork.x, cork.y + cork.displayHeight * 0.38);
      for (let i = 1; i <= 12; i++) cord.lineTo(cork.x + Math.sin(i / 12 * Math.PI * 2) * art.width * 0.007,
        cork.y + cork.displayHeight * 0.38 + art.height * 0.042 * i / 12);
      cord.strokePath();
    }
    cork.setData('carrying', carrying).setData('caught', caught);
  };
  const returnHome = () => {
    dragging = false; pointerId = -1; carrying = caught; busy = true;
    const home = caught ? stormRest : stormMouth;
    if (reduced) { cork.setPosition(px(home.x), py(home.y)).setAngle(0); busy = false; sync(); return; }
    scene.tweens.add({ targets: cork, x: px(home.x), y: py(home.y), angle: 0, duration: 330,
      ease: 'Sine.InOut', onUpdate: sync, onComplete: () => { busy = false; sync(); } });
  };
  const capture = () => {
    if (caught) return;
    if (!onStep(0).activated) return;
    caught = true; carrying = true; lifted = true;
    instruction()?.setText(copy.stormReturn);
  };
  const close = () => {
    if (!caught || busy) return;
    busy = true; dragging = false;
    const result = onStep(1); // Save before any closing or souvenir animation.
    if (result.collected) onCollected();
  };
  // Keyboard follows the same three actions; pointerdown keeps the actual drag gesture.
  controls.add('storm-cork', cork.x, cork.y, Math.max(44, cork.displayWidth + 12), Math.max(44, cork.displayHeight + 12), () => {
    if (busy || dragging || scene.children.getByName('tutorial-paper')) return;
    if (!lifted) {
      lifted = true; cork.setPosition(px(stormRest.x), py(stormRest.y)); instruction()?.setText(copy.stormSeek); sync();
    } else if (!caught) {
      cork.setPosition(px(0.50), py(0.287)); capture(); returnHome();
    } else close();
  }, false);
  const handle = scene.children.getByName('storm-cork') as Phaser.GameObjects.Zone;
  handle.removeAllListeners('pointerdown');
  scene.input.setDraggable(handle);
  handle.on('dragstart', (pointer: Phaser.Input.Pointer) => {
    if (busy || scene.children.getByName('tutorial-paper')) return;
    dragging = true; pointerId = pointer.id; carrying = caught;
    dragViewport = { width: window.innerWidth, height: window.innerHeight };
    cork.setDepth(3); spark.setDepth(3); cord.setDepth(3);
  });
  handle.on('drag', (pointer: Phaser.Input.Pointer, x: number, y: number) => {
    if (!dragging || pointer.id !== pointerId) return;
    cork.setPosition(Phaser.Math.Clamp(x, art.left + cork.displayWidth / 2, art.left + art.width - cork.displayWidth / 2),
      Phaser.Math.Clamp(y, art.top + cork.displayHeight / 2, art.top + art.height - art.height * 0.10));
    const point = { x: (cork.x - art.left) / art.width, y: (cork.y - art.top) / art.height };
    if (!carrying && nearStormLightning(point, Math.max(0.075, 24 / art.width), Math.max(0.075, 22 / art.height))) {
      carrying = true; instruction()?.setText(copy.stormReturn);
    } else if (!carrying && Math.abs(point.y - stormMouth.y) > 0.04) instruction()?.setText(copy.stormSeek);
    cork.setAngle(carrying && !reduced ? -5 : 0); sync();
  });
  handle.on('dragend', (pointer: Phaser.Input.Pointer) => {
    if (!dragging || pointer.id !== pointerId) return;
    dragging = false; pointerId = -1;
    if (pointer.event?.type === 'touchcancel' || window.innerWidth !== dragViewport.width
      || window.innerHeight !== dragViewport.height || pointer.x < art.left || pointer.x > art.left + art.width
      || pointer.y < art.top || pointer.y > art.top + art.height) {
      returnHome(); return;
    }
    if (carrying) capture();
    if (caught && nearStormMouth({ x: (cork.x - art.left) / art.width, y: (cork.y - art.top) / art.height },
      Math.max(0.085, 24 / art.width), Math.max(0.07, 22 / art.height))) close();
    else returnHome();
  });
  sync();
  const cancel = () => {
    if (!dragging) return;
    instruction()?.setText(caught ? copy.stormReturn : copy.stormMood); returnHome();
  };
  const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') cancel(); };
  scene.input.on('gameout', cancel); scene.game.events.on('blur', cancel);
  const canvas = scene.game.canvas;
  canvas.addEventListener('touchcancel', cancel); canvas.addEventListener('keydown', escape);
  window.addEventListener('resize', cancel);
  return () => {
    scene.input.off('gameout', cancel); scene.game.events.off('blur', cancel);
    canvas.removeEventListener('touchcancel', cancel); canvas.removeEventListener('keydown', escape);
    window.removeEventListener('resize', cancel);
  };
}
