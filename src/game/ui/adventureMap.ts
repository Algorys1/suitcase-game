import Phaser from 'phaser';
import { sessionRoute } from '../../domain/session';
import type { SessionState } from '../../domain/session';
import { getDestinationTexts, getTexts } from '../../services/i18n';
import { progressStore } from '../../services/storage';
import { drawPreparationDesk, drawElement } from './preparationArt';
import { drawClosedSuitcase } from './suitcase';
import { destinationById } from '../../domain/recipes';
import { createButton } from './menu';
import { drawChargeBadge } from './adventureAssets';
import { placeMapLabel } from './mapLabels';
import type { MapRect } from './mapLabels';
import { worldTexture } from './worldTexture';

export const reducedMotion = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Canvas controls share generous pointer targets and visible keyboard focus. */
export class AdventureControls {
  private items: { name: string; x: number; y: number; w: number; h: number; action: () => void }[] = [];
  private index = -1;
  private ring?: Phaser.GameObjects.Graphics;
  constructor(private scene: Phaser.Scene) {
    const canvas = scene.game.canvas;
    canvas.tabIndex = 0;
    canvas.focus({ preventScroll: true });
    canvas.addEventListener('keydown', this.key);
    scene.events.once('shutdown', () => {
      canvas.removeEventListener('keydown', this.key);
      canvas.removeAttribute('tabindex');
      canvas.removeAttribute('aria-description');
    });
  }
  clear(): void { this.items = []; this.index = -1; this.ring = undefined; }
  add(name: string, x: number, y: number, w: number, h: number, action: () => void, hintCursor = true): void {
    this.items.push({ name, x, y, w, h, action });
    this.scene.add.zone(x, y, w, h).setName(name).setInteractive({ useHandCursor: hintCursor })
      .on('pointerdown', action);
  }
  button(name: string, label: string, x: number, y: number, w: number, action: () => void, primary = false): void {
    createButton(this.scene, x, y, w, 42, { name: `${name}-plate`, label, action,
      textOnly: !primary, stationery: primary, fontSize: w < 150 ? 12 : 14 });
    this.add(name, x, y, w, 42, action);
  }
  private key = (event: KeyboardEvent): void => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'Tab') {
      const next = this.index + (event.shiftKey ? -1 : 1);
      this.ring?.destroy();
      if (next < 0 || next >= this.items.length) { this.index = -1; return; }
      event.preventDefault();
      this.index = next;
      const item = this.items[next]!;
      this.ring = this.scene.add.graphics().lineStyle(3, 0x537f79)
        .strokeRoundedRect(item.x - item.w / 2 - 3, item.y - item.h / 2 - 3, item.w + 6, item.h + 6, 8);
      this.scene.game.canvas.setAttribute('aria-description', item.name);
    } else if (event.key === 'Enter' || event.key === ' ') {
      const item = this.items[this.index];
      if (item) { event.preventDefault(); item.action(); }
    }
  };
}

export function mapText(scene: Phaser.Scene, x: number, y: number, value: string, size: number,
  width: number, color = '#624a37'): Phaser.GameObjects.Text {
  return scene.add.text(x, y, value, { fontFamily: '"Travel Serif", Georgia, serif',
    fontSize: size, color, align: 'center', wordWrap: { width, useAdvancedWrap: true } })
    .setOrigin(0.5).setPadding(3);
}

/** Shared anchors let the instruments travel from their actual resting places. */
export function mapInstruments(w: number, h: number) {
  const portrait = w < 600;
  return {
    journal: { x: w < 600 ? 46 : h < 450 ? 45 : 100, y: h - 122,
      width: w < 600 || h < 450 ? 52 : 72, height: w < 600 || h < 450 ? 70 : 88 },
    compass: { x: portrait ? 60 : 87, y: portrait ? 101 : 84, radius: portrait ? 32 : 45 },
    suitcase: { x: w - (portrait ? 64 : 113), top: h - (portrait ? 101 : 145),
      width: portrait ? 106 : 185, height: portrait ? 72 : 115 },
  };
}

/** Soft vignettes use the existing illustration, without altering its source file. */
function vignette(scene: Phaser.Scene, id: string): string | undefined {
  const sourceKey = worldTexture(scene, id);
  const key = `map-vignette-${id}-${sourceKey}`;
  if (scene.textures.exists(key)) return key;
  if (!scene.textures.exists(sourceKey)) return undefined;
  const frame = scene.textures.getFrame(sourceKey);
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 256;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return undefined;
  context.drawImage(frame.source.image as CanvasImageSource, frame.cutX, frame.cutY,
    frame.cutWidth, frame.cutHeight, 0, 22, 256, 206);
  context.globalCompositeOperation = 'destination-in';
  const mist = context.createRadialGradient(128, 128, 65, 128, 128, 127);
  mist.addColorStop(0, '#fff'); mist.addColorStop(0.56, '#fff'); mist.addColorStop(1, '#fff0');
  context.fillStyle = mist; context.fillRect(0, 0, 256, 256);
  scene.textures.addCanvas(key, canvas);
  return key;
}

export function drawAdventureMap(scene: Phaser.Scene, session: SessionState,
  controls?: AdventureControls, onVisit?: (id: string) => void, onDepart?: () => void,
  animate = false): void {
  const { width: w, height: h } = scene.scale;
  const copy = getTexts().adventure;
  const portrait = w < 600, short = h < 450;
  const motion = animate && !reducedMotion();
  const route = sessionRoute(session);
  const count = route.length + (session.charges > 0 ? 1 : 0);
  const unlocked = progressStore.unlockedSouvenirIds();
  const progress = progressStore.read();
  drawPreparationDesk(scene, w, h);
  const margin = portrait || short ? 13 : 28;
  const paper = scene.add.graphics().setName('adventure-parchment');
  const outline = (offset: number) => {
    paper.beginPath().moveTo(margin + 8, margin + offset);
    const edges = [[w - margin - 7, margin], [w - margin, h - margin - 8],
      [margin + 6, h - margin], [margin, margin + 8]];
    let previous = { x: margin + 8, y: margin };
    edges.forEach(([ex = 0, ey = 0], side) => {
      for (let i = 1; i <= 18; i++) {
        const t = i / 18, rough = Math.sin(i * 12.3 + side * 4) * 1.6;
        paper.lineTo(Phaser.Math.Linear(previous.x, ex, t) + rough,
          Phaser.Math.Linear(previous.y, ey, t) + offset + rough * 0.4);
      }
      previous = { x: ex, y: ey };
    });
    paper.closePath();
  };
  paper.fillStyle(0x493122, 0.22); outline(6); paper.fillPath();
  paper.fillStyle(0xf6e9cc).lineStyle(1, 0xb89d72, 0.6); outline(0); paper.fillPath().strokePath();
  const illustratedPaper = scene.textures.exists('adventure-map-paper');
  if (illustratedPaper) {
    paper.setVisible(false);
    scene.add.nineslice(w / 2, h / 2, 'adventure-map-paper', undefined,
      (w - margin * 2) * 2, (h - margin * 2) * 2, 120, 120, 120, 120)
      .setScale(0.5).setName('adventure-paper-art');
  }
  const grain = scene.add.graphics();
  if (illustratedPaper) grain.setAlpha(0.22);
  for (let i = 0; i < 560; i++) grain.fillStyle(i % 3 ? 0x98734f : 0xffffff, 0.065)
    .fillRect(margin + 5 + i * 79 % Math.max(1, w - margin * 2 - 10),
      margin + 5 + i * 47 % Math.max(1, h - margin * 2 - 10), 1 + i % 2, 1);
  // Creases, coastal contours and a few hand-drawn waves suggest uncharted paper.
  grain.lineStyle(1, 0xa78e68, 0.13);
  for (const x of [w * 0.34, w * 0.67]) {
    grain.lineBetween(x, margin + 3, x + 2, h - margin - 3);
    grain.lineStyle(1, 0xffffff, 0.3).lineBetween(x + 2, margin + 3, x + 4, h - margin - 3)
      .lineStyle(1, 0xa78e68, 0.13);
  }
  for (let island = 0; island < 4; island++) {
    const cx = w * (0.19 + island * 0.19), cy = h * (island % 2 ? 0.59 : 0.72);
    for (let ring = 0; ring < 3; ring++) {
      grain.lineStyle(0.8, 0x9b9878, 0.09).beginPath();
      for (let j = 0; j <= 60; j++) {
        const a = j / 60 * Math.PI * 2, r = 32 + ring * 10 + Math.sin(a * 3 + island) * 9;
        const x = cx + Math.cos(a) * r * (portrait ? 0.65 : 1.6), y = cy + Math.sin(a) * r * 0.5;
        if (j === 0) grain.moveTo(x, y); else grain.lineTo(x, y);
      }
      grain.closePath().strokePath();
    }
  }
  for (let i = 0; i < 9; i++) {
    const x = w * (0.18 + (i % 3) * 0.25), y = h * (0.46 + Math.floor(i / 3) * 0.14);
    grain.lineStyle(1, 0x748a80, 0.13).beginPath().moveTo(x - 9, y);
    for (let j = 1; j <= 18; j++) grain.lineTo(x - 9 + j, y + Math.sin(j / 18 * Math.PI * 2) * 1.7);
    grain.strokePath();
  }
  mapText(scene, w / 2, portrait ? 31 : short ? 32 : 48, copy.eyebrow, 9, w - 70, '#a08052').setLetterSpacing(2);
  mapText(scene, w / 2, portrait ? 53 : short ? 59 : 74, copy.title, portrait ? 19 : short ? 21 : 27, portrait ? w - 35 : w - 350)
    .setFontFamily('"Travel Serif", Georgia, serif').setName('adventure-title');
  const { compass, suitcase, journal } = mapInstruments(w, h);
  if (scene.textures.exists('preparation-compass_dial')) scene.add.image(compass.x, compass.y, 'preparation-compass_dial')
    .setDisplaySize(compass.radius * 2, compass.radius * 2).setAngle(-11).setName('map-compass-art');
  for (const index of [0, 1] as const) {
    const key = `preparation-${index === 0 ? 'needle_teal' : 'needle_violet'}`;
    if (!scene.textures.exists(key)) continue;
    const pivot = index === 0 ? 0.68 : 0.69;
    const needle = scene.add.image(compass.x, compass.y, key).setOrigin(0.5, pivot)
      .setAngle(index === 0 ? -11 : 61).setName(`map-needle-${index}`);
    needle.setScale(compass.radius * (index === 0 ? 0.6 : 0.54) / (needle.height * pivot));
  }
  const hands = scene.add.graphics().setPosition(compass.x, compass.y).setName('map-compass-hands');
  hands.fillStyle(0xcda25d).fillCircle(0, 0, 3);
  const badgeX = w - (portrait ? 78 : 113), badgeY = portrait ? 101 : 72;
  const tray = scene.add.graphics().setName('energy-ticket');
  tray.fillStyle(0xb49766, 0.09).fillRoundedRect(badgeX - 64, badgeY - 25, 128, 71, 6);
  mapText(scene, badgeX, badgeY - 14, copy.energy, 10, 135, '#876b46');
  for (let i = 0; i < 10; i++) {
    const x = badgeX + (i % 5 - 2) * 22, y = badgeY + 5 + Math.floor(i / 5) * 21;
    drawChargeBadge(scene, x, y, 8, i < session.charges, `charge-badge-${i}`);
  }
  const hint = progress.awakenedMycelia ? copy.freeWish : unlocked.includes('cimes_eternelles') ? copy.bellWish : copy.snowWish;
  mapText(scene, w / 2, portrait ? 168 : short ? 117 : 124, hint, portrait || short ? 12 : 14,
    portrait ? w - 55 : w - 305, '#7d6c53').setFontFamily('Georgia, serif').setFontStyle('italic').setName('adventure-wish');
  const top = portrait ? 223 : short ? 151 : 195;
  const span = Math.max(portrait ? 150 : 85, h - (portrait ? 130 : short ? 110 : 160) - top);
  const left = portrait ? 50 : 113, areaW = w - left * 2;
  const anchors = portrait
    ? [[0.02, 0.03], [0.50, 0.12], [0.98, 0.02], [0.96, 0.36], [0.48, 0.46], [0.02, 0.36], [0.04, 0.72], [0.50, 0.83], [0.96, 0.72], [0.27, 0.99]]
    : [[0.05, 0.12], [0.34, 0.02], [0.65, 0.13], [0.94, 0.01], [0.96, 0.58], [0.65, 0.68], [0.34, 0.51], [0.02, 0.66], [0.24, 1.11], [0.48, 1.13]];
  const points = anchors.slice(0, count).map(([x = 0, y = 0]) => ({ x: left + x * areaW, y: top + y * span }));
  // Let the map breathe at the first stop, then fit the growing itinerary on small paper.
  const size = portrait
    ? Math.min(79, (w - 64) / 3, count <= 3 ? 79 : span * 0.15)
    : Math.min(short ? 66 : 119, w * 0.13, count <= 4 ? 119 : span * (short ? 0.32 : 0.40));
  // Paths sit behind every world, and bend between steps like a pen-drawn itinerary.
  const captions: { x: number; y: number; text: string; index: number }[] = [];
  const reserved: MapRect[] = points.map((point, index) => route[index] === undefined
    ? { x: point.x - (portrait ? 52 : 77), y: point.y - 32, width: portrait ? 104 : 154, height: 90 }
    : { x: point.x - size / 2, y: point.y - size / 2, width: size, height: size });
  reserved.push({ x: suitcase.x - suitcase.width / 2, y: suitcase.top, width: suitcase.width, height: suitcase.height });
  reserved.push({ x: journal.x - journal.width / 2 - 5, y: journal.y - journal.height / 2 - 5,
    width: journal.width + 10, height: journal.height + 30 });
  points.forEach((point, index) => {
    const from = points[index - 1];
    if (!from) return;
    const line = scene.add.graphics().setName(`route-line-${index}`);
    const dx = point.x - from.x, dy = point.y - from.y;
    const curve = new Phaser.Curves.CubicBezier(new Phaser.Math.Vector2(from.x, from.y),
      new Phaser.Math.Vector2(from.x + dx * 0.48 - dy * 0.18, from.y + dy * 0.12 + dx * 0.12),
      new Phaser.Math.Vector2(from.x + dx * 0.6 + dy * 0.1, from.y + dy * 0.88 - dx * 0.12),
      new Phaser.Math.Vector2(point.x, point.y));
    const length = curve.getLength();
    const trace = (p: number) => {
      line.clear().lineStyle(1.5, 0x8f7054, 0.7);
      for (let t = size * 0.28; t < Math.min(length - size * 0.28, length * p); t += 9) {
        const a = curve.getPoint(t / length), b = curve.getPoint(Math.min(1, (t + 3.5) / length));
        line.lineBetween(a.x, a.y, b.x, b.y);
      }
    };
    if (motion && index === points.length - 1) {
      const pen = { p: 0 };
      scene.tweens.add({ targets: pen, p: 1, duration: 520, ease: 'Sine.InOut', onUpdate: () => trace(pen.p) });
    } else trace(1);
  });
  points.forEach((point, index) => {
    const id = route[index];
    if (id === undefined) {
      const ring = scene.add.graphics().setPosition(point.x, point.y).setName('next-world-ring');
      ring.fillStyle(0xfff8e7).fillCircle(0, 0, 24).lineStyle(1, 0x9c8157, 0.7).strokeCircle(0, 0, 24);
      ring.lineStyle(1, 0xc7a874, 0.4).strokeCircle(0, 0, 29);
      mapText(scene, point.x, point.y - 1, '?', 31, 60, '#8b6943').setFontFamily('Georgia, serif').setName('next-question');
      mapText(scene, point.x, point.y + 41, route.length ? copy.nextStep : copy.firstStep,
        portrait || short ? 10 : 12, portrait ? 100 : 150, '#8a7251').setName('next-step-label');
      if (motion) scene.tweens.add({ targets: ring, alpha: 0.6, scaleX: 1.05, scaleY: 1.05,
        duration: 1300, yoyo: true, repeat: -1 });
      controls?.add('next-world', point.x, point.y, portrait ? 48 : 58, portrait ? 48 : 58, () => onDepart?.());
      return;
    }
    if (id === null) {
      const fog = scene.add.graphics().fillStyle(0x8f859d, 0.09);
      for (let i = 3; i > 0; i--) fog.fillEllipse(point.x, point.y, size * i * 0.32, size * i * 0.16);
      mapText(scene, point.x, point.y, '∅', 26, size, '#918399');
      mapText(scene, point.x, point.y + size * (portrait ? 0.22 : 0.38), portrait ? copy.voidShort : copy.void,
        portrait || short ? 9 : 11, size + 13);
      return;
    }
    const elements = destinationById(id)?.elements;
    if (elements) elements.forEach((element, i) => drawElement(scene, element,
      point.x + (i ? 1 : -1) * size * 0.39, point.y + size * (i ? 0.08 : -0.08), size * 0.43)
      ?.setAlpha(0.55).setAngle(i ? 8 : -7));
    const key = vignette(scene, id);
    if (key) {
      const art = scene.add.image(point.x, point.y, key).setDisplaySize(size, size).setName(`map-art-${index}`);
      if (motion && index === route.length - 1) {
        scene.tweens.add({ targets: art, alpha: { from: 0, to: 1 }, duration: 450 });
      }
    }
    const caption = getDestinationTexts(id)?.title ?? '?';
    captions.push({ x: point.x, y: point.y, text: caption, index });
    const pin = scene.add.graphics().setName(`world-pin-${index}`);
    pin.fillStyle(unlocked.includes(id) ? 0x6e9480 : 0xc29b58).fillCircle(point.x, point.y + size * 0.22, 3);
    if (id === 'mycelia' && progress.awakenedMycelia)
      mapText(scene, point.x + size * 0.29, point.y - size * 0.22, '✦', 20, 30, '#b88b39');
    controls?.add(`visit-${index}-${id}`, point.x, point.y, Math.max(48, size * 0.65), Math.max(48, size * 0.65), () => onVisit?.(id));
  });
  // Captions occupy reserved paper, never a landscape, even in a ten-stop itinerary.
  for (const caption of captions) {
    const label = mapText(scene, 0, 0, caption.text, short || (portrait && count >= 8) ? 10 : portrait ? 11 : 12,
      portrait ? 92 : short ? 82 : 135, '#4e3825').setFontStyle('600').setOrigin(0, 0)
      .setName(`map-label-${caption.index}`);
    const preferred = { x: caption.x - label.width / 2 - 4, y: caption.y + size / 2 + 2,
      width: label.width + 8, height: label.height + 4 };
    const bounds = { x: margin + 7, y: portrait ? 190 : short ? 133 : 153,
      width: w - margin * 2 - 14, height: h - (portrait ? 65 : short ? 70 : 100) - (portrait ? 190 : short ? 133 : 153) };
    const position = placeMapLabel(preferred, bounds, reserved);
    if (!position) { label.destroy(); continue; }
    reserved.push(position);
    const plate = scene.add.graphics().setName(`map-label-paper-${caption.index}`);
    if (Math.abs(position.x - preferred.x) > 10 || Math.abs(position.y - preferred.y) > 10) {
      plate.lineStyle(0.8, 0x8e724e, 0.45).lineBetween(caption.x, caption.y + size * 0.32,
        position.x + position.width / 2, position.y + position.height / 2);
    }
    plate.fillStyle(0xf9edcf, 0.97).lineStyle(0.7, 0xb79b69, 0.4)
      .fillRoundedRect(position.x, position.y, position.width, position.height, 2)
      .strokeRoundedRect(position.x, position.y, position.width, position.height, 2);
    label.setPosition(position.x + 4, position.y + 2);
    scene.children.bringToTop(label);
  }
  drawClosedSuitcase(scene, suitcase.x, suitcase.top, suitcase.width, suitcase.height);
  scene.children.getByName('suitcase-closed-art')?.setName('map-suitcase-art');
  if (scene.textures.exists('journal-closed')) scene.add.image(journal.x, journal.y, 'journal-closed')
    .setDisplaySize(journal.width, journal.height).setAngle(-7).setName('map-journal-art');
  mapText(scene, journal.x, journal.y + journal.height / 2 + 11,
    getTexts().tutorial.mapBook, portrait || short ? 10 : 12, 90).setName('map-journal-label');
}
