import Phaser from 'phaser';
import { compassAngle, compassElements } from '../../domain/compassSelection';
import type { ElementId, SlotIndex, Slots } from '../../domain/preparation';

export const NEEDLE_MARKS = ['▲', '◆'] as const;
const needleColors = [0x217b76, 0x8050a8] as const;

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
): void {
  const face = scene.add.graphics();
  face.fillStyle(0x79543f, 0.12).fillCircle(x, y + 4, radius - 16);
  face.fillStyle(0xfffaf0).fillCircle(x, y, radius - 16);
  face.lineStyle(3, 0xc78b60).strokeCircle(x, y, radius - 16);
  face.lineStyle(1, 0xc78b60, 0.4).strokeCircle(x, y, radius - 24);
  compassElements.forEach(id => {
    const angle = Phaser.Math.DegToRad(compassAngle(id) - 90);
    const sx = x + Math.cos(angle) * radius;
    const sy = y + Math.sin(angle) * radius;
    if (slots.includes(id)) {
      face.lineStyle(2.5, needleColors[slots[active] === id ? active : active === 0 ? 1 : 0]);
      face.strokeCircle(sx, sy, 16);
    }
    symbol(scene, sx, sy, id);
    scene.add.text(sx, sy + 16, names[id].name, {
      fontFamily: '"Trebuchet MS", Arial, sans-serif', fontSize: radius < 110 ? 11 : 13,
      color: '#302a37', backgroundColor: '#fff4df',
    }).setOrigin(0.5, 0).setPadding(1).setName(`compass-symbol-${id}`);
  });

  for (const index of [0, 1] as const) {
    const element = slots[index];
    if (element === null) continue;
    const needle = scene.add.graphics({ x, y }).setAngle(compassAngle(element)).setName(`needle-hand-${index}`);
    const length = (radius - 30) * (index === 0 ? 1 : 0.77);
    needle.fillStyle(needleColors[index]);
    needle.lineStyle(index === active ? 3 : 1, 0x302a37);
    if (index === 0) {
      needle.fillTriangle(-7, 10, 0, -length, 7, 10);
      needle.strokeTriangle(-7, 10, 0, -length, 7, 10);
    } else {
      needle.lineStyle(4, needleColors[index]).lineBetween(0, 8, 0, -length);
      const points = [[0, -length - 8], [8, -length], [0, -length + 8], [-8, -length]]
        .map(([px = 0, py = 0]) => new Phaser.Math.Vector2(px, py));
      needle.fillPoints(points, true);
      needle.lineStyle(2, 0x302a37).strokePoints(points, true);
    }
  }
  scene.add.circle(x, y, 7, 0xf6c96b).setStrokeStyle(2, 0x79543f);
}
