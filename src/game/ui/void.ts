import Phaser from 'phaser';
import { drawSuitcaseCompass, drawManifestation, drawSuitcaseCharges } from './suitcaseCompass';
import { drawCompass } from './compass';
import { isElementId } from '../../domain/preparation';
import type { ElementId, Slots } from '../../domain/preparation';
import { getTexts } from '../../services/i18n';

/** Soft procedural light, rather than outlined circles around the instrument. */
function prepareEnergy(scene: Phaser.Scene): void {
  if (scene.textures.exists('void-veil')) return;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return;
  const fade = context.createLinearGradient(0, 0, 512, 0);
  fade.addColorStop(0, 'rgba(255,255,255,0)');
  fade.addColorStop(0.35, 'rgba(255,255,255,0.7)');
  fade.addColorStop(0.7, 'rgba(255,255,255,0.45)');
  fade.addColorStop(1, 'rgba(255,255,255,0)');
  context.strokeStyle = fade;
  for (let band = 30; band > 0; band--) {
    context.lineWidth = band * 2;
    context.globalAlpha = 0.04;
    context.beginPath();
    context.moveTo(0, 96);
    context.bezierCurveTo(150, 100, 290, 8, 512, 45);
    context.stroke();
  }
  scene.textures.addCanvas('void-veil', canvas);
  const dust = document.createElement('canvas');
  dust.width = dust.height = 32;
  const brush = dust.getContext('2d', { willReadFrequently: true });
  if (!brush) return;
  const glow = brush.createRadialGradient(16, 16, 0, 16, 16, 16);
  glow.addColorStop(0, 'rgba(255,255,255,1)');
  glow.addColorStop(0.12, 'rgba(255,255,255,0.85)');
  glow.addColorStop(0.35, 'rgba(255,255,255,0.18)');
  glow.addColorStop(1, 'rgba(255,255,255,0)');
  brush.fillStyle = glow;
  brush.fillRect(0, 0, 32, 32);
  scene.textures.addCanvas('void-dust', dust);
}

/** The suitcase is the only stable object in the space between worlds. */
export function drawVoid(scene: Phaser.Scene, animate: boolean, reveal = true): () => void {
  const { width: w, height: h } = scene.scale;
  const portrait = w < 600 && h > w;
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sky = scene.add.image(w / 2, h / 2, 'void-space').setName('void-space');
  sky.setScale(Math.max(w / sky.width, h / sky.height));
  scene.add.rectangle(w / 2, h / 2, w, h, 0x10132c, 0.12);
  prepareEnergy(scene);
  const stageX = w * (portrait ? 0.5 : 0.30);
  const caseTop = portrait ? 20 : Math.max(16, h * 0.10);
  const caseHeight = portrait ? Math.min(h * 0.43, 310) : h * 0.76;
  const start = scene.children.length;
  const art = drawSuitcaseCompass(scene, stageX, caseTop, w * (portrait ? 0.82 : 0.53), caseHeight);
  const raw: unknown = scene.data.get('void-elements');
  const elements: Slots | undefined = Array.isArray(raw) && raw.length === 2 && raw.every(isElementId)
    ? [raw[0] as ElementId, raw[1] as ElementId] : undefined;
  const slots: Slots = elements ?? ['tree', 'mushroom'];
  drawCompass(scene, art.dial.x, art.dial.y, art.dial.radius, slots, 0, getTexts().elements,
    { embedded: true, decorative: true, disabled: true, charged: false, dragAngle: null, grab: () => {}, select: () => {} });
  drawSuitcaseCharges(scene, art, (scene.data.get('void-charges') as number | undefined) ?? 0);
  const needles = [0, 1].map(i => scene.children.getByName(`needle-hand-${i}`) as Phaser.GameObjects.Image);
  const selections = scene.children.getAll().filter(o => o.name.startsWith('selection-light-')) as Phaser.GameObjects.Image[];
  const manifestations: Phaser.GameObjects.Container[] = [];
  if (elements && reveal) for (const i of [0, 1] as const) {
    const before = scene.children.length;
    const slot = art.slots[i]!;
    drawManifestation(scene, elements[i]!, slot.x, slot.y, slot.size, i);
    const parts = scene.children.getAll().slice(before) as (Phaser.GameObjects.Image | Phaser.GameObjects.Graphics)[];
    parts.forEach(part => part.setPosition(part.x - slot.x, part.y - slot.y));
    manifestations.push(scene.add.container(slot.x, slot.y, parts).setName(`void-element-${i}`).setData('origin-y', slot.y));
  }
  const caseParts = scene.children.getAll().slice(start);
  const suitcase = scene.add.container(0, 0, caseParts).setName('void-suitcase');
  const viewWidth = portrait ? w : w * 0.58;
  const viewHeight = portrait ? h * 0.49 : h;
  const mist = Array.from({ length: 7 }, (_, i) => scene.add.image(0, 0, 'void-veil')
    .setTint(i % 2 ? 0xbda0ff : 0x80e8e4).setBlendMode(Phaser.BlendModes.ADD)
    .setDisplaySize(viewWidth * (0.65 + i % 3 * 0.16), Math.max(48, viewHeight * 0.20))
    .setName(`void-mist-${i}`));
  const dust = Array.from({ length: 38 }, (_, i) => scene.add.image(0, 0, 'void-dust')
    .setTint(i % 3 ? 0xa7e8e2 : 0xffdf9a).setBlendMode(Phaser.BlendModes.ADD)
    .setDisplaySize(i % 7 ? 4 : 7, i % 7 ? 4 : 7).setName(`void-dust-${i}`));
  const trail = Array.from({ length: 10 }, (_, i) => scene.add.image(0, 0, 'void-dust')
    .setDisplaySize(i % 3 ? 5 : 8, i % 3 ? 5 : 8).setTint(i % 2 ? 0xc7b8f7 : 0xf6dba4)
    .setBlendMode(Phaser.BlendModes.ADD).setAlpha(0).setName(`void-trail-${i}`));
  // Small paper fragments drift as though gravity has forgotten its direction.
  const scraps = Array.from({ length: 3 }, (_, i) => {
    const g = scene.add.graphics().fillStyle(0xe8d2ab, 0.7).beginPath()
      .moveTo(-5, -7).lineTo(6, -6).lineTo(4, 8).lineTo(-6, 6).closePath().fillPath();
    g.lineStyle(0.7, 0x9e835f, 0.6).lineBetween(-3, -2, 3, -2).lineBetween(-3, 1, 1, 1);
    return g.setName(`void-paper-${i}`);
  });
  const pointer = { x: 0, y: 0, at: -10000 };
  const respond = (p: Phaser.Input.Pointer) => {
    if (query.matches || p.x >= viewWidth || p.y >= viewHeight) return;
    pointer.x = p.x; pointer.y = p.y; pointer.at = scene.time.now;
  };
  scene.input.on('pointermove', respond);
  scene.input.on('pointerdown', respond);
  const forget = () => { pointer.at = -10000; };
  scene.input.on('gameout', forget);
  let elapsed = 0;
  let stopped = false;
  const paint = (now: number) => {
    const moving = animate && !query.matches;
    const t = moving ? elapsed : 0;
    const arrival = moving && reveal ? Phaser.Math.Clamp(t / 1.25, 0, 1) : 1;
    suitcase.setY(moving ? Math.sin(t * 0.75) * 3 : 0).setAlpha(0.7 + arrival * 0.3);
    needles.forEach((needle, i) => needle.setAngle((i ? 72 : -28)
      + (moving ? Math.sin(t * (i ? -1.1 : 1.4)) * 26 + Math.sin(t * 0.37) * 48 : 0)));
    manifestations.forEach((object, i) => object.setY((object.getData('origin-y') as number) - arrival * 22 - i * arrival * 4)
      .setAlpha((1 - arrival) ** 1.1).setScale(1 - arrival * 0.35));
    selections.forEach(o => o.setAlpha(0.4 * (1 - arrival)));
    const response = moving ? Math.max(0, 1 - (now - pointer.at) / 1500) : 0;
    mist.forEach((veil, i) => {
      const bx = viewWidth * (0.10 + i % 3 * 0.35) + Math.sin(t * 0.14 + i) * viewWidth * 0.07;
      const by = viewHeight * (0.10 + i * 0.13) + Math.sin(t * 0.24 + i * 1.7) * 13;
      const dx = bx - pointer.x, dy = by - pointer.y;
      const near = Math.max(0, 1 - Math.hypot(dx, dy) / (viewWidth * 0.42)) * response;
      const distance = Math.max(1, Math.hypot(dx, dy));
      veil.setPosition(bx + dx / distance * near * 58, by + dy / distance * near * 42)
        .setAngle(-28 + i * 13 + Math.sin(t * 0.19 + i) * 8)
        .setAlpha((0.12 + Math.sin(t * 0.5 + i) * 0.035) * (1 - near * 0.65));
    });
    dust.forEach((mote, i) => {
      const phase = (i * 0.618 + t * (0.014 + i % 3 * 0.004)) % 1;
      const x = viewWidth * (0.07 + (i * 0.37) % 0.84);
      const y = viewHeight * (1.05 - phase * 1.1);
      const dissolving = i < 16 && elements && arrival < 1;
      const slot = art.slots[i % 2]!;
      mote.setPosition(dissolving ? slot.x + Math.sin(i * 2.4) * arrival * 60 : x + Math.sin(t * 0.6 + i) * 8,
        dissolving ? slot.y - arrival * 85 + Math.cos(i * 2.4) * arrival * 22 : y)
        .setAlpha(dissolving ? Math.sin(arrival * Math.PI) * 0.8 : Math.sin(phase * Math.PI) ** 2 * 0.55);
    });
    trail.forEach((mote, i) => mote.setPosition(pointer.x + Math.sin(t * 1.6 + i * 1.8) * (12 + i * 3),
      pointer.y - i * 4 - (1 - response) * 18).setAlpha(response * (0.5 - i * 0.035)));
    scraps.forEach((g, i) => {
      const phase = (i * 0.31 + t * 0.022) % 1;
      g.setPosition(viewWidth * (0.14 + i * 0.31) + Math.sin(t * 0.21 + i) * 17,
        viewHeight * (1.12 - phase * 1.3)).setAngle(-18 + Math.sin(t * 0.34 + i) * 24)
        .setAlpha(Math.sin(phase * Math.PI) ** 2 * 0.55);
    });
  };
  const update = (_time: number, delta: number) => { elapsed += Math.min(delta, 100) / 1000; paint(scene.time.now); };
  const onPreference = () => { forget(); paint(scene.time.now); };
  if (animate) scene.events.on(Phaser.Scenes.Events.UPDATE, update);
  query.addEventListener('change', onPreference);
  paint(scene.time.now);
  const dispose = () => {
    if (stopped) return; stopped = true;
    scene.events.off(Phaser.Scenes.Events.UPDATE, update);
    scene.input.off('pointermove', respond); scene.input.off('pointerdown', respond); scene.input.off('gameout', forget);
    query.removeEventListener('change', onPreference); scene.events.off('shutdown', dispose);
  };
  scene.events.once('shutdown', dispose);
  return dispose;
}
