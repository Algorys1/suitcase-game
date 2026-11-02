import Phaser from 'phaser';
import { compassAngle, compassElements } from '../../domain/compassSelection';
import type { ElementId, SlotIndex, Slots } from '../../domain/preparation';

export const NEEDLE_MARKS = ['▲', '◆'] as const;
const needleColors = [0x217b76, 0x8050a8] as const;
const brass = 0xc79442;
const darkBrass = 0x79512e;

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
    dragAngle: number | null;
    grab: (index: SlotIndex, pointer: Phaser.Input.Pointer) => void;
    select: (id: ElementId) => void;
  },
): void {
  const face = scene.add.graphics();
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
  compassElements.forEach(id => {
    const angle = Phaser.Math.DegToRad(compassAngle(id) - 90);
    const sx = x + Math.cos(angle) * radius * 0.73;
    const sy = y + Math.sin(angle) * radius * 0.73;
    face.fillStyle(0xfffaf0, 0.85).fillCircle(sx, sy, 15);
    // Concentric rings preserve both selections when the needles coincide.
    for (const index of [0, 1] as const) {
      if (slots[index] === id) {
        face.lineStyle(2, needleColors[index]);
        face.strokeCircle(sx, sy, 15 + index * 4);
      }
    }
    symbol(scene, sx, sy, id);
    const target = scene.add.zone(sx, sy, 30, 30).setName(`dial-element-${id}`);
    if (!interaction.disabled) {
      // Narrow sectors never overlap; the larger fallback buttons remain available.
      target.setInteractive({ useHandCursor: true });
      let pressed = false;
      target.on('pointerdown', () => { pressed = true; });
      target.on('pointerout', () => { pressed = false; });
      target.on('pointerup', () => { if (pressed) interaction.select(id); pressed = false; });
    }
    // On narrow screens the two full selection names remain below the dial.
    if (radius >= 140) {
      scene.add.text(sx, sy + 17, names[id].name, {
        fontFamily: '"Trebuchet MS", Arial, sans-serif', fontSize: 11,
        color: '#79512e', backgroundColor: '#fff0d2',
      }).setOrigin(0.5, 0).setPadding(1).setName(`compass-symbol-${id}`);
    }
  });

  // The shorter, narrower purple needle sits above the teal one so both colors
  // remain visible when they coincide. Hit priority follows the active needle.
  for (const index of [0, 1] as const) {
    const element = slots[index];
    if (element === null) continue;
    const angle = index === active && interaction.dragAngle !== null ? interaction.dragAngle : compassAngle(element);
    const needle = scene.add.graphics({ x, y }).setAngle(angle).setName(`needle-hand-${index}`);
    const length = radius * (index === 0 ? 0.57 : 0.50);
    const halfWidth = index === 0 ? 11 : 7;
    const tail = radius * 0.27;
    if (index === active) {
      needle.lineStyle(5, 0xf6c96b, 0.35).lineBetween(0, -length, 0, tail);
    }
    needle.fillStyle(needleColors[index]);
    const points = [[0, -length], [halfWidth, -length * 0.25], [0, 12], [-halfWidth, -length * 0.25]]
      .map(([px = 0, py = 0]) => new Phaser.Math.Vector2(px, py));
    needle.fillPoints(points, true);
    needle.fillStyle(index === 0 ? 0x72beb0 : 0xc3a2df)
      .fillTriangle(0, -length, 0, 0, -halfWidth, 0);
    needle.lineStyle(2, darkBrass).strokePoints(points, true);
    if (index === 0) {
      // Openwork spear and a small faceted counterweight.
      needle.fillStyle(0xfff0d2).fillTriangle(0, -length * 0.76, -3, -length * 0.30, 3, -length * 0.30);
      needle.lineStyle(3, brass).lineBetween(0, 8, 0, tail);
      needle.fillStyle(needleColors[index]).fillTriangle(0, tail - 9, -7, tail, 0, tail + 9);
      needle.fillTriangle(0, tail - 9, 7, tail, 0, tail + 9);
    } else {
      // A little glass lens carried by the needle, not a side-mounted winder.
      needle.lineStyle(3, brass).lineBetween(0, 8, 0, tail);
      needle.fillStyle(0xdcd0f4, 0.85).fillCircle(0, tail, 11);
      needle.lineStyle(3, brass).strokeCircle(0, tail, 11);
      needle.lineStyle(2, 0xffffff, 0.9).lineBetween(-5, tail - 4, 1, tail - 7);
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
  scene.add.circle(x, y, 9, brass).setStrokeStyle(2, darkBrass);
  scene.add.circle(x - 2, y - 2, 4, 0xffe2a0);
}
