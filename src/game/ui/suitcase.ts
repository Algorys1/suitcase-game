import Phaser from 'phaser';

export function drawClosedSuitcase(scene: Phaser.Scene, x: number, y: number, width: number, height: number): void {
  if (scene.textures.exists('preparation-suitcase_closed')) {
    const image = scene.add.image(x, y + height, 'preparation-suitcase_closed')
      .setOrigin(0.5, 1).setName('suitcase-closed-art');
    const open = scene.textures.get('preparation-suitcase_open').get();
    const openWidth = Math.min(width, height * open.width / open.height);
    image.setScale(Math.min(openWidth / image.width, height / image.height));
    return;
  }
  const graphics = scene.add.graphics({ x: x - width / 2, y }).setScale(width / 520, Math.min(width / 520, height / 270));
  const points = [[15, 125], [390, 75], [510, 185], [135, 235]]
    .map(([px = 0, py = 0]) => new Phaser.Math.Vector2(px, py));
  graphics.fillStyle(0x79543f).fillRoundedRect(130, 158, 370, 90, 12);
  graphics.fillStyle(0xc78b60).fillPoints(points, true);
  graphics.lineStyle(4, 0x79543f).strokePoints(points, true);
  graphics.lineStyle(10, 0x79543f).strokeRoundedRect(220, 90, 80, 28, 8);
  graphics.fillStyle(0xf6c96b).fillRoundedRect(190, 229, 22, 21, 4).fillRoundedRect(393, 202, 22, 21, 4);
}

/** Two fixed anchors in the illustrated tray; no spatial inventory rules. */
export function drawSuitcase(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
  if (scene.textures.exists('preparation-suitcase_open')) {
    const image = scene.add.image(x, y, 'preparation-suitcase_open').setOrigin(0.5, 0).setName('suitcase-art');
    image.setScale(Math.min(width / image.width, height / image.height));
    const w = image.displayWidth, h = image.displayHeight;
    const left = x - w / 2;
    // Centres and writable areas measured on the illustrated copper inlays.
    const labelWidth = w * 0.33;
    const labelHeight = h * 0.048;
    const labelAngle = -2;
    return [
      { x: left + w * 0.28, y: y + h * 0.72, size: h * 0.26,
        labelX: left + w * 0.355, labelY: y + h * 0.816, labelWidth, labelHeight, labelAngle },
      { x: left + w * 0.72, y: y + h * 0.70, size: h * 0.26,
        labelX: left + w * 0.74, labelY: y + h * 0.802,
        labelWidth, labelHeight, labelAngle },
    ] as const;
  }
  // Keep the original geometry as a readable fallback if an image fails to load.
  const scale = width / 520;
  const verticalScale = Math.min(scale, height / 270);
  const graphics = scene.add.graphics({ x: x - width / 2, y }).setScale(scale, verticalScale);
  const polygon = (points: number[][], color: number): void => {
    const vertices = points.map(([px = 0, py = 0]) => new Phaser.Math.Vector2(px, py));
    graphics.fillStyle(color).fillPoints(vertices, true);
    graphics.lineStyle(3, 0x79543f).strokePoints(vertices, true);
  };

  graphics.fillStyle(0x79543f, 0.12).fillEllipse(265, 244, 470, 45);
  graphics.lineStyle(10, 0x79543f).strokeRoundedRect(150, 0, 96, 38, 12);
  polygon([[15, 125], [390, 75], [375, 10], [0, 60]], 0xc78b60);
  polygon([[35, 108], [370, 64], [362, 30], [25, 74]], 0xe9bd8d);
  polygon([[15, 125], [135, 235], [135, 254], [15, 144]], 0xa26b4a);
  polygon([[135, 235], [510, 185], [510, 204], [135, 254]], 0x79543f);
  polygon([[15, 125], [390, 75], [510, 185], [135, 235]], 0xc78b60);
  polygon([[55, 134], [209, 113], [291, 188], [137, 210]], 0xfff4df);
  polygon([[231, 110], [385, 89], [467, 164], [313, 186]], 0xfff4df);
  graphics.fillStyle(0xf6c96b).fillRoundedRect(190, 229, 22, 21, 4);
  graphics.fillRoundedRect(393, 202, 22, 21, 4);

  return [
    { x: x - width / 2 + 173 * scale, y: y + 162 * verticalScale, size: 65 * verticalScale,
      labelX: x - width / 2 + 173 * scale, labelY: y + 220 * verticalScale, labelWidth: 160 * scale,
      labelHeight: 20, labelAngle: -7 },
    { x: x - width / 2 + 349 * scale, y: y + 138 * verticalScale, size: 65 * verticalScale,
      labelX: x - width / 2 + 349 * scale, labelY: y + 196 * verticalScale, labelWidth: 160 * scale,
      labelHeight: 20, labelAngle: -7 },
  ] as const;
}
