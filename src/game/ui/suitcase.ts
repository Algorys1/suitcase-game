import Phaser from 'phaser';

export function drawClosedSuitcase(scene: Phaser.Scene, x: number, y: number, width: number, height: number): void {
  if (scene.textures.exists('preparation-suitcase_closed')) {
    const image = scene.add.image(x, y + height, 'preparation-suitcase_closed')
      .setOrigin(0.5, 1).setName('suitcase-closed-art');
    image.setScale(Math.min(width / image.width, height / image.height));
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
