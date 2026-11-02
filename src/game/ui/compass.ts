import Phaser from 'phaser';
import { compassAngle, compassElements } from '../../domain/compassSelection';
import type { ElementId, SlotIndex, Slots } from '../../domain/preparation';
import { drawElement } from './preparationArt';

const needleColors = [0x217b76, 0x8050a8] as const;
const brass = 0xc79442;
const darkBrass = 0x79512e;

/** Low ivory plinths give the miniatures a shared base on the parchment dial. */
function elementSupport(scene: Phaser.Scene, x: number, y: number, size: number, id: ElementId): void {
  const base = scene.add.graphics().setName(`compass-support-${id}`);
  const width = size * 1.08;
  const height = size * 0.26;
  const depth = size * 0.055;
  base.fillStyle(0x725331, 0.13).fillEllipse(x, y + depth + size * 0.035, width + size * 0.12, height + size * 0.1);
  base.fillStyle(0x9d733c).fillEllipse(x, y + depth, width, height);
  base.fillStyle(0xd3ac67).fillEllipse(x, y, width, height);
  base.fillStyle(0xfff5dc).fillEllipse(x, y - depth * 0.2, width - size * 0.09, height - size * 0.055);
  base.lineStyle(1, 0xfffdf0, 0.7).lineBetween(x - width * 0.23, y - height * 0.24, x + width * 0.14, y - height * 0.24);
}

/** One cached radial gradient, drawn behind icons without a hard selection edge. */
function selectionLight(scene: Phaser.Scene, x: number, y: number, size: number, index: SlotIndex): void {
  const key = 'compass-selection-light';
  if (!scene.textures.exists(key)) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;
    const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255,255,255,0.85)');
    gradient.addColorStop(0.35, 'rgba(255,255,255,0.48)');
    gradient.addColorStop(0.7, 'rgba(255,255,255,0.12)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
    scene.textures.addCanvas(key, canvas);
  }
  scene.add.image(x, y, key).setDisplaySize(size, size * 0.85)
    .setTint(index === 0 ? 0x78d9c7 : 0xc6a2ed).setAlpha(0.75)
    .setName(`selection-light-${index}`);
}

/** Small geometric placeholders, kept separate from catalogue data and final assets. */
function symbol(scene: Phaser.Scene, x: number, y: number, id: ElementId): void {
  const g = scene.add.graphics({ x, y });
  switch (id) {
    case 'tree':
      g.fillStyle(0x79543f).fillRect(-2, 0, 4, 10);
      g.fillStyle(0x62a775).fillCircle(0, -3, 9); break;
    case 'mushroom':
      g.fillStyle(0xc78b60).fillRect(-3, 0, 6, 10);
      g.fillStyle(0xb69ae8).fillEllipse(0, -3, 22, 13);
      g.fillStyle(0xfff4df).fillCircle(-4, -4, 2).fillCircle(4, -3, 2); break;
    case 'water':
      g.fillStyle(0x59c9c2).fillEllipse(0, 2, 24, 15);
      g.lineStyle(2, 0xfffaf0).lineBetween(-6, 0, 3, 0); break;
    case 'fire':
      g.fillStyle(0xff8666).fillTriangle(-10, 9, 0, -13, 10, 9);
      g.fillStyle(0xf6c96b).fillTriangle(-5, 9, 2, -3, 7, 9); break;
    case 'rock':
      g.fillStyle(0x8492a6).fillTriangle(-12, 9, -3, -10, 11, 9);
      g.fillStyle(0xaab4bf).fillTriangle(-3, -10, 8, -6, 11, 9); break;
    case 'palm':
      g.lineStyle(4, 0xc78b60).lineBetween(0, 10, 3, -4);
      g.fillStyle(0x62a775).fillTriangle(-12, 0, 3, -9, 14, 0);
      g.fillTriangle(-7, -10, 3, -5, 10, -12); break;
    case 'snow':
      g.lineStyle(3, 0x6fa6be);
      for (let index = 0; index < 3; index++) {
        const angle = index * Math.PI / 3;
        g.lineBetween(-10 * Math.cos(angle), -10 * Math.sin(angle), 10 * Math.cos(angle), 10 * Math.sin(angle));
      } break;
    case 'cloud':
      g.fillStyle(0xc5b9df).fillCircle(-6, 2, 7).fillCircle(1, -3, 9).fillCircle(8, 3, 6); break;
    case 'ruins':
      g.fillStyle(0xc4a17c).fillRect(-10, -6, 6, 16).fillRect(4, -3, 6, 13);
      g.fillRect(-12, -10, 24, 5); break;
    case 'crystal':
      g.fillStyle(0xb69ae8).fillTriangle(-9, 8, 0, -13, 9, 8);
      g.fillStyle(0x59c9c2).fillTriangle(0, -13, 9, 8, 0, 12); break;
  }
}

export function drawCompass(
  scene: Phaser.Scene, x: number, y: number, radius: number,
  slots: Slots, active: SlotIndex, names: Record<ElementId, { name: string }>,
  interaction: {
    disabled: boolean;
    charged: boolean;
    dragAngle: number | null;
    grab: (index: SlotIndex, pointer: Phaser.Input.Pointer) => void;
    select: (id: ElementId) => void;
  },
): void {
  const illustrated = scene.textures.exists('preparation-compass_dial');
  if (illustrated) {
    scene.add.image(x, y, 'preparation-compass_dial')
      .setDisplaySize(radius * 2, radius * 2).setName('compass-art');
  }
  const face = scene.add.graphics();
  if (!illustrated) {
    face.fillStyle(darkBrass, 0.16).fillCircle(x, y + 7, radius + 2);
    face.fillStyle(darkBrass).fillCircle(x, y, radius);
    face.fillStyle(brass).fillCircle(x, y - 2, radius - 3);
    face.lineStyle(2, 0xffe2a0).strokeCircle(x, y - 2, radius - 6);
    face.fillStyle(0xfff0d2).fillCircle(x, y, radius - 12);
    face.lineStyle(2, darkBrass).strokeCircle(x, y, radius - 12);
    face.lineStyle(1, brass, 0.5).strokeCircle(x, y, radius - 17);

    // An engraved compass rose, without clock numerals or a watch crown.
    for (let index = 0; index < 8; index++) {
      const angle = index * Math.PI / 4;
      const length = radius * (index % 2 === 0 ? 0.52 : 0.36);
      const tipX = x + Math.sin(angle) * length;
      const tipY = y - Math.cos(angle) * length;
      const wingX = Math.cos(angle) * radius * 0.075;
      const wingY = Math.sin(angle) * radius * 0.075;
      face.fillStyle(0xe4c597).fillTriangle(x, y, tipX, tipY, x - wingX, y - wingY);
      face.fillStyle(0xf2ddba).fillTriangle(x, y, tipX, tipY, x + wingX, y + wingY);
    }
    for (let index = 0; index < 40; index++) {
      const angle = index * Math.PI / 20;
      const inner = radius - (index % 4 === 0 ? 24 : 20);
      face.lineStyle(index % 4 === 0 ? 2 : 1, brass, 0.65);
      face.lineBetween(x + Math.sin(angle) * inner, y - Math.cos(angle) * inner,
        x + Math.sin(angle) * (radius - 17), y - Math.cos(angle) * (radius - 17));
    }
  }
  // Fine geometric engravings sit inside the rose, away from the ten symbols.
  const engravings = scene.add.graphics().setName('compass-engravings');
  for (let i = 0; i < 5; i++) {
    const angle = (i * 72 + 18) * Math.PI / 180;
    const gx = x + Math.cos(angle) * radius * 0.38;
    const gy = y + Math.sin(angle) * radius * 0.38;
    const size = Math.max(2, radius * 0.022);
    engravings.lineStyle(1, 0x9c743e, 0.42).beginPath()
      .moveTo(gx, gy - size * 2).lineTo(gx + size, gy).lineTo(gx, gy + size * 2)
      .lineTo(gx - size, gy).closePath().strokePath();
    engravings.lineStyle(1, interaction.charged ? 0xfff3bd : 0x9c743e, interaction.charged ? 0.8 : 0.25)
      .lineBetween(gx - size * 2, gy, gx + size * 2, gy);
  }
  if (interaction.charged) {
    for (const [scale, alpha] of [[0.16, 0.05], [0.12, 0.07], [0.08, 0.12]] as const) {
      engravings.fillStyle(0xfff3b5, alpha).fillCircle(x, y, radius * scale);
    }
  }
  const iconSize = Math.max(24, Math.min(48, radius * 0.26));
  compassElements.forEach(id => {
    const angle = Phaser.Math.DegToRad(compassAngle(id) - 90);
    const sx = x + Math.cos(angle) * radius * 0.73;
    const sy = y + Math.sin(angle) * radius * 0.73;
    const baseY = sy + iconSize * 0.4;
    elementSupport(scene, sx, baseY, iconSize, id);
    // Offset the two soft lights slightly when both needles share a symbol.
    const duplicate = slots[0] === id && slots[1] === id;
    for (const index of [0, 1] as const) {
      if (slots[index] === id) {
        selectionLight(scene, sx + (duplicate ? (index === 0 ? -1 : 1) * iconSize * 0.14 : 0),
          sy + iconSize * 0.12, iconSize * 1.9, index);
      }
    }
    const icon = drawElement(scene, id, sx, sy, iconSize);
    if (icon) icon.setOrigin(0.5, 1).setY(baseY).setName(`compass-icon-${id}`);
    else symbol(scene, sx, sy, id);
    const hitSize = Math.max(28, Math.min(44, radius * 0.35));
    const target = scene.add.zone(sx, sy, hitSize, hitSize).setName(`dial-element-${id}`)
      .setData('elementName', names[id].name);
    if (!interaction.disabled) {
      // Narrow sectors never overlap; the larger fallback buttons remain available.
      target.setInteractive({ useHandCursor: true });
      let pressed = false;
      target.on('pointerdown', () => { pressed = true; });
      target.on('pointerout', () => { pressed = false; });
      target.on('pointerup', () => { if (pressed) interaction.select(id); pressed = false; });
    }
  });

  // The shorter, narrower purple needle sits above the teal one so both colors
  // remain visible when they coincide. Hit priority follows the active needle.
  for (const index of [0, 1] as const) {
    const element = slots[index];
    if (element === null) continue;
    const angle = index === active && interaction.dragAngle !== null ? interaction.dragAngle : compassAngle(element);
    const key = `preparation-${index === 0 ? 'needle_teal' : 'needle_violet'}`;
    const painted = scene.textures.exists(key);
    const length = radius * (painted ? (index === 0 ? 0.60 : 0.54) : (index === 0 ? 0.57 : 0.50));
    const tail = radius * (painted ? (index === 0 ? 0.216 : 0.175) : 0.27);
    if (painted) {
      // Pivots and counterweight centres measured within each trimmed sprite.
      // Keep hit targets on those visible parts while rotating around the shared cap.
      const pivot = index === 0 ? 0.68 : 0.69;
      const needle = scene.add.image(x, y, key).setOrigin(0.5, pivot)
        .setAngle(angle).setName(`needle-hand-${index}`);
      needle.setScale(length / (needle.height * pivot));
    } else {
      const needle = scene.add.graphics({ x, y }).setAngle(angle).setName(`needle-hand-${index}`);
      const halfWidth = Math.max(6, Math.min(13, radius * 0.075)) * (index === 0 ? 1 : 0.65);
      if (index === active) {
        needle.lineStyle(5, 0xf6c96b, 0.35).lineBetween(0, -length, 0, tail);
      }
      needle.fillStyle(needleColors[index]);
      const points = [[0, -length], [halfWidth, -length * 0.25], [0, 12], [-halfWidth, -length * 0.25]]
        .map(([px = 0, py = 0]) => new Phaser.Math.Vector2(px, py));
      needle.fillPoints(points, true);
      needle.fillStyle(index === 0 ? 0x72beb0 : 0xc3a2df)
        .fillTriangle(0, -length, 0, 0, -halfWidth, 0);
      needle.lineStyle(3, darkBrass).strokePoints(points, true);
      needle.lineStyle(1, 0xf8d383).strokePoints(points, true);
      if (index === 0) {
        // Openwork spear and a small faceted counterweight.
        const opening = [[0, -length * 0.78], [halfWidth * 0.42, -length * 0.32],
          [0, -length * 0.17], [-halfWidth * 0.42, -length * 0.32]]
          .map(([px = 0, py = 0]) => new Phaser.Math.Vector2(px, py));
        needle.fillStyle(0xf4dfb5).fillPoints(opening, true);
        needle.lineStyle(1, brass).strokePoints(opening, true);
        needle.lineStyle(3, brass).lineBetween(0, 8, 0, tail);
        needle.fillStyle(needleColors[index]).fillTriangle(0, tail - 9, -7, tail, 0, tail + 9);
        needle.fillTriangle(0, tail - 9, 7, tail, 0, tail + 9);
      } else {
        // A little glass lens carried by the needle, not a side-mounted winder.
        needle.lineStyle(3, brass).lineBetween(0, 8, 0, tail);
        needle.fillStyle(0xdcd0f4, 0.85).fillCircle(0, tail, 11);
        needle.fillStyle(0xf6f0ff, 0.45).fillEllipse(-2, tail - 2, 11, 15);
        needle.lineStyle(3, brass).strokeCircle(0, tail, 11);
        needle.lineStyle(2, 0xffffff, 0.9).lineBetween(-5, tail - 4, 1, tail - 7);
      }
    }
    // Both the pointed end and counterweight can be grabbed. The rear grips
    // keep overlapped needles usable; the two labelled buttons also select them.
    for (const [part, localY] of [['tip', -length * 0.65], ['grip', tail]] as const) {
      const radians = Phaser.Math.DegToRad(angle);
      const target = scene.add.zone(x - Math.sin(radians) * localY, y + Math.cos(radians) * localY, 44, 44)
        .setName(`needle-${part}-${index}`).setDepth(index === active ? 2 : 1);
      if (!interaction.disabled) {
        target.setInteractive({ cursor: 'grab' });
        target.on('pointerdown', (pointer: Phaser.Input.Pointer) => interaction.grab(index, pointer));
      }
    }
  }
  const cap = Math.max(6, Math.min(11, radius * 0.065));
  scene.add.circle(x + 1, y + 2, cap + 1, darkBrass, 0.35);
  scene.add.circle(x, y, cap, brass).setStrokeStyle(2, darkBrass);
  scene.add.circle(x, y, cap * 0.73, 0xe7b858).setStrokeStyle(1, 0xffe2a0);
  scene.add.circle(x - cap * 0.27, y - cap * 0.27, cap * 0.36, 0xffe2a0);
}
