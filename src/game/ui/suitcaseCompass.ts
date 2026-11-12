import Phaser from 'phaser';
import type { ElementId, SlotIndex } from '../../domain/preparation';
import { drawElementGlyph } from './preparationArt';

/** Anchors measured on the new painting, after the shared alpha crop. */
export function drawSuitcaseCompass(scene: Phaser.Scene, x: number, top: number, maxWidth: number, maxHeight: number) {
  const art = scene.add.image(x, top, 'preparation-suitcase_compass')
    .setOrigin(0.5, 0).setName('suitcase-compass-art');
  art.setScale(Math.min(maxWidth / art.width, maxHeight / art.height));
  const w = art.displayWidth, h = art.displayHeight;
  return {
    x, top, width: w, height: h,
    dial: { x: x - w * 0.007, y: top + h * 0.302, radius: h * 0.228 },
    slots: [0, 1].map(index => ({
      x: x + (index === 0 ? -0.195 : 0.193) * w,
      y: top + h * 0.757,
      size: h * 0.15,
      labelY: top + h * 0.866,
      labelWidth: w * 0.36,
    })),
  };
}

/** A floating ink apparition above an embroidered constellation, never a plinth. */
export function drawManifestation(scene: Phaser.Scene, id: ElementId, x: number, y: number, size: number, index: SlotIndex): void {
  const glow = scene.add.graphics().setName(`slot-magic-${index}`);
  const color = index === 0 ? 0x75e2d3 : 0xd6b6f2;
  for (let i = 4; i > 0; i--) {
    glow.fillStyle(color, 0.025 * (5 - i)).fillEllipse(x, y + size * 0.03, size * i * 0.33, size * i * 0.10);
  }
  for (let i = 0; i < 7; i++) {
    const angle = i * 2.4 + index;
    glow.fillStyle(i % 2 ? 0xffe2a1 : color, 0.48)
      .fillCircle(x + Math.sin(angle) * size * 0.49, y + Math.cos(angle) * size * 0.35, i % 3 ? 0.8 : 1.3);
  }
  drawElementGlyph(scene, id, x, y - size * 0.4, size)?.setName(`slot-manifestation-${index}`);
}

/** Cream luggage paper and reinforced eyelet, in the same material as the souvenir tags. */
export function drawSuitcaseInstruction(scene: Phaser.Scene, art: ReturnType<typeof drawSuitcaseCompass>, instruction: string): void {
  const { width, height } = scene.scale;
  const landscape = width >= 760 || (width >= 600 && height < 450);
  const paperWidth = landscape ? Math.min(240, (width - art.width) / 2 - 24) : Math.min(280, width - 28);
  const text = scene.add.text(0, 0, instruction, {
    fontFamily: '"Travel Serif", Georgia, serif', fontSize: landscape ? 16 : 15,
    fontStyle: '600', color: '#493322', align: 'center',
    wordWrap: { width: paperWidth - 42, useAdvancedWrap: true },
  }).setOrigin(0.5).setPadding(2).setName('preparation-instructions');
  const paperHeight = Math.max(62, text.height + 24);
  const left = landscape ? Math.max(12, (width - art.width) / 2 - paperWidth - 18) : (width - paperWidth) / 2;
  const top = landscape ? Math.min(height - 62 - paperHeight, art.top + art.height * 0.78)
    : art.top + art.height + 8;
  const holeX = left + paperWidth - 14, holeY = top + paperHeight / 2;
  // Tie around the left brass handle mount, rather than resting on the leather grip.
  const handleX = art.x - art.width * 0.285, handleY = art.top + art.height * 0.914;
  const cord = scene.add.graphics().setName('preparation-tag-cord');
  const rope = new Phaser.Curves.CubicBezier(
    new Phaser.Math.Vector2(handleX, handleY),
    new Phaser.Math.Vector2(handleX - (landscape ? 24 : -18), handleY + 31),
    new Phaser.Math.Vector2(holeX + 36, holeY + (landscape ? 26 : -21)),
    new Phaser.Math.Vector2(holeX, holeY));
  const points = rope.getPoints(72);
  // A soft shadow, twisted strands and a loose knot replace the straight wire.
  cord.lineStyle(4, 0x493022, 0.16);
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]!, b = points[i]!;
    cord.lineBetween(a.x + 1, a.y + 2, b.x + 1, b.y + 2);
  }
  cord.lineStyle(2.8, 0x8d673e).strokePoints(points, false);
  cord.lineStyle(1.2, 0xe0c18d).strokePoints(points, false);
  for (let i = 2; i < points.length; i += 3) {
    const p = points[i]!, tangent = rope.getTangent(i / 72);
    cord.lineStyle(0.8, 0x765132, 0.9)
      .lineBetween(p.x - tangent.y * 1.4 - tangent.x, p.y + tangent.x * 1.4 - tangent.y,
        p.x + tangent.y * 1.4 + tangent.x, p.y - tangent.x * 1.4 + tangent.y);
  }
  cord.lineStyle(4.5, 0x3b281a, 0.6).strokeEllipse(handleX, handleY, 12, 15);
  cord.lineStyle(2.6, 0xc6a16d).strokeEllipse(handleX, handleY, 12, 15);
  // The short dark upper crossing disappears behind the metal attachment.
  cord.lineStyle(3.2, 0x674322).beginPath().moveTo(handleX - 5, handleY - 4)
    .lineTo(handleX - 1, handleY - 7).lineTo(handleX + 4, handleY - 5).strokePath();
  cord.lineStyle(1, 0xf1d5a0).beginPath().moveTo(handleX - 5, handleY)
    .lineTo(handleX - 3, handleY + 5).lineTo(handleX + 2, handleY + 6).strokePath();
  cord.lineStyle(2.2, 0x8d673e).strokeEllipse(handleX - 5, handleY + 6, 12, 7)
    .lineBetween(handleX - 5, handleY + 9, handleX - 13, handleY + 17);
  cord.lineStyle(1, 0xe8c995).lineBetween(handleX - 6, handleY + 9, handleX - 14, handleY + 16);
  for (let i = 0; i < 3; i++) cord.lineStyle(0.6, 0xd8b783, 0.8)
    .lineBetween(handleX - 13, handleY + 16, handleX - 17 - i, handleY + 18 + i);
  const paper = scene.add.graphics().setName('preparation-instruction-tag');
  const path = (offset: number) => {
    paper.beginPath().moveTo(left, top + offset + 1)
      .lineTo(left + paperWidth - 14, top + offset)
      .lineTo(left + paperWidth, top + offset + 14)
      .lineTo(left + paperWidth, top + offset + paperHeight - 14)
      .lineTo(left + paperWidth - 14, top + offset + paperHeight)
      .lineTo(left + 1, top + offset + paperHeight - 1).closePath();
  };
  paper.fillStyle(0x60452d, 0.18); path(3); paper.fillPath();
  paper.fillStyle(0xfff2d5).lineStyle(1, 0xa18156, 0.8); path(0); paper.fillPath().strokePath();
  paper.fillStyle(0x9a734c, 0.08);
  for (let i = 0; i < 55; i++) paper.fillRect(left + 6 + (i * 47 % 101) / 101 * (paperWidth - 30),
    top + 5 + (i * 29 % 97) / 97 * (paperHeight - 10), 2, 1);
  paper.fillStyle(0xbb955e).fillCircle(holeX, holeY, 6);
  paper.lineStyle(1, 0xe9cf9c).strokeCircle(holeX, holeY, 4.5);
  paper.fillStyle(0x795839).fillCircle(holeX, holeY, 2);
  text.setPosition(left + (paperWidth - 20) / 2, top + paperHeight / 2);
  scene.children.bringToTop(text);
}

/** Ten brass cells remain in the lining; only their luminous cores are emptied. */
export function drawSuitcaseCharges(scene: Phaser.Scene, art: ReturnType<typeof drawSuitcaseCompass>, charges: number): void {
  const spacing = art.width * 0.055, size = art.width * 0.035;
  const sockets = scene.add.graphics().setName('preparation-charge-sockets');
  for (let i = 0; i < 10; i++) {
    const x = art.x + (i - 4.5) * spacing, y = art.top + art.height * 0.602;
    sockets.fillStyle(0x091e1b, 0.8).fillEllipse(x, y - 0.5, size * 1.22, size * 0.92);
    sockets.lineStyle(0.7, 0x72917a, 0.45).beginPath()
      .moveTo(x - size * 0.5, y + size * 0.18).lineTo(x, y + size * 0.44)
      .lineTo(x + size * 0.5, y + size * 0.18).strokePath();
    scene.add.image(x, y, 'preparation-metal-charge-empty').setDisplaySize(size, size * 0.72)
      .setName(`preparation-charge-rim-${i}`);
    scene.add.image(x, y, 'preparation-metal-charge-full').setDisplaySize(size, size * 0.72)
      .setAlpha(i < charges ? 1 : 0).setName(`preparation-charge-${i}`);
  }
}
