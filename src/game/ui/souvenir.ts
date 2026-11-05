import Phaser from 'phaser';
import { souvenirs } from '../../domain/souvenirs';
import type { Souvenir } from '../../domain/souvenirs';
import { getTexts, translate } from '../../services/i18n';

const textureKey = (id: string): string => `souvenir-${id}`;

export function preloadSouvenirs(scene: Phaser.Scene): void {
  for (const souvenir of souvenirs) {
    if (!scene.textures.exists(textureKey(souvenir.destinationId))) {
      scene.load.image(textureKey(souvenir.destinationId), import.meta.env.BASE_URL + souvenir.image);
    }
  }
}

/** The name remains readable even if its optional artwork cannot be loaded. */
export function drawSouvenir(scene: Phaser.Scene, souvenir: Souvenir, x: number, y: number,
  width: number, height: number, fresh: boolean, locked = false): Array<Phaser.GameObjects.Graphics | Phaser.GameObjects.Image | Phaser.GameObjects.Text> {
  const objects: Array<Phaser.GameObjects.Graphics | Phaser.GameObjects.Image | Phaser.GameObjects.Text> = [];
  const compact = height < 90;
  const tagWidth = Math.min(width - 18, 290);
  const tagHeight = Math.min(136, Math.max(32, height - 6));
  const left = x - tagWidth / 2;
  const top = y + (height - tagHeight) / 2;
  const angle = -5;
  const radians = Math.abs(angle) * Math.PI / 180;
  const footprint = Math.cos(radians) + Math.sin(radians);
  // Fit the rotated image and leave room for its white edge and soft shadow.
  const size = Math.max(0, Math.min(112, (tagHeight - 12) / footprint));
  const halfExtent = size * footprint / 2;
  const imageX = left + 7 + halfExtent;
  const g = scene.add.graphics().setName('souvenir-tag');
  g.setData('souvenir-slot', { x: imageX, y: y + height / 2, size });
  g.setData('paper-bounds', { left, top, right: left + tagWidth, bottom: top + tagHeight });
  const tagPath = (offset: number): void => {
    const cut = Math.min(18, tagHeight / 3);
    g.beginPath().moveTo(left, top + offset + 1);
    g.lineTo(left + tagWidth - cut, top + offset);
    g.lineTo(left + tagWidth, top + offset + cut);
    g.lineTo(left + tagWidth, top + offset + tagHeight - cut);
    g.lineTo(left + tagWidth - cut, top + offset + tagHeight);
    g.lineTo(left + 1, top + offset + tagHeight - 1);
    g.closePath();
  };
  g.fillStyle(0x60452d, 0.17);
  tagPath(2);
  g.fillPath();
  g.fillStyle(0xcba777).lineStyle(1, 0x947049, 0.65);
  tagPath(0);
  g.fillPath().strokePath();
  // Paper grain and a pin through the reinforced luggage-tag eyelet.
  g.fillStyle(0x79543f, 0.12);
  for (let i = 0; i < 55; i++) {
    g.fillRect(left + 6 + (i * 47 % 101) / 101 * (tagWidth - 28),
      top + 4 + (i * 29 % 97) / 97 * (tagHeight - 8), 2, 1);
  }
  const holeX = left + tagWidth - 13;
  const holeY = top + tagHeight / 2;
  g.fillStyle(0x98744b).fillCircle(holeX, holeY, 6);
  g.lineStyle(1, 0xe8ce9f).strokeCircle(holeX, holeY, 5);
  g.fillStyle(0xfff5df).fillCircle(holeX, holeY, 2.5);
  objects.push(g);
  const pin = scene.add.graphics().setName('souvenir-pin');
  pin.fillStyle(0x60452d, 0.24).fillEllipse(holeX + 2, holeY + 3, 13, 7);
  pin.lineStyle(2, 0xb19469).lineBetween(holeX, holeY, holeX - 2, holeY - 4);
  pin.fillStyle(0x783e36).fillCircle(holeX - 2, holeY - 4, 5.5);
  pin.fillStyle(0xb66b54).fillEllipse(holeX - 2.5, holeY - 5.5, 9, 6);
  pin.fillStyle(0xf1c19b, 0.85).fillEllipse(holeX - 4, holeY - 7, 3, 1.5);
  objects.push(pin);
  const key = textureKey(souvenir.destinationId);
  if (locked) {
    const cy = y + height / 2;
    const cover = scene.add.graphics().setName('souvenir-unknown');
    cover.fillStyle(0x84623f, 0.15).fillRoundedRect(imageX - size * 0.36 + 1, cy - size * 0.38 + 2, size * 0.72, size * 0.76, 3);
    cover.fillStyle(0xe5cda2).lineStyle(1, 0xa3855c).fillRoundedRect(imageX - size * 0.36, cy - size * 0.38, size * 0.72, size * 0.76, 3)
      .strokeRoundedRect(imageX - size * 0.36, cy - size * 0.38, size * 0.72, size * 0.76, 3);
    cover.lineStyle(1, 0xb69769).lineBetween(imageX - size * 0.34, cy - size * 0.34, imageX, cy - size * 0.03)
      .lineBetween(imageX, cy - size * 0.03, imageX + size * 0.34, cy - size * 0.34);
    const seal = scene.add.text(imageX, cy + size * 0.12, '?', { fontFamily: 'Georgia, serif', fontSize: Math.max(13, size * 0.43), color: '#866642' })
      .setOrigin(0.5).setName('souvenir-unknown-seal');
    objects.push(cover, seal);
  } else if (scene.textures.exists(key)) {
    const image = scene.add.image(imageX, y + height / 2, key).setName(`souvenir-${souvenir.destinationId}`);
    image.setScale(Math.min(size / image.width, size / image.height)).setAngle(angle);
    // The artwork already contains its paper edge. Extra screen-space glow
    // overwhelms the details at UI scale; use the mipmapped paint directly.
    objects.push(image);
  }
  const textLeft = imageX + halfExtent + 8;
  const textWidth = left + tagWidth - 28 - textLeft;
  const textX = textLeft + textWidth / 2;
  const text = (value: string, fontSize: number, color: string) => scene.add.text(textX, 0, value, {
    fontFamily: 'Alegreya, Georgia, serif', fontSize, color, align: 'center',
    wordWrap: { width: textWidth - 4, useAdvancedWrap: true },
  }).setOrigin(0.5, 0).setPadding(2);
  const status = text(locked ? getTexts().adventure.hidden : fresh ? getTexts().stickers.new : getTexts().stickers.kept,
    compact ? 10 : 11, '#6e5135').setName('souvenir-status');
  let nameSize = compact ? 14 : 16;
  const name = text(locked ? '???' : translate(souvenir.nameKey), nameSize, '#3e2d21').setName('souvenir-name');
  while (status.height + name.height + 2 > tagHeight - 12 && nameSize > 11) name.setFontSize(--nameSize);
  const textTop = y + (height - status.height - name.height - 2) / 2;
  status.setY(textTop);
  name.setY(textTop + status.height + 2);
  objects.push(status, name);
  return objects;
}
