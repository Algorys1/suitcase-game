import Phaser from 'phaser';

export function drawClosedSuitcase(scene: Phaser.Scene, x: number, y: number, width: number, height: number): void {
  const graphics = scene.add.graphics({ x: x - width / 2, y }).setScale(width / 520, Math.min(width / 520, height / 270));
  const points = [[15, 125], [390, 75], [510, 185], [135, 235]]
    .map(([px = 0, py = 0]) => new Phaser.Math.Vector2(px, py));
  graphics.fillStyle(0x79543f).fillRoundedRect(130, 158, 370, 90, 12);
  graphics.fillStyle(0xc78b60).fillPoints(points, true);
  graphics.lineStyle(4, 0x79543f).strokePoints(points, true);
  graphics.lineStyle(10, 0x79543f).strokeRoundedRect(220, 90, 80, 28, 8);
  graphics.fillStyle(0xf6c96b).fillRoundedRect(190, 229, 22, 21, 4).fillRoundedRect(393, 202, 22, 21, 4);
}

/** Temporary illustrated perspective: a lid, a tray and exactly two compartments. */
export function drawSuitcase(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
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
    { x: x - width / 2 + 173 * scale, y: y + 162 * verticalScale },
    { x: x - width / 2 + 349 * scale, y: y + 138 * verticalScale },
  ] as const;
}
