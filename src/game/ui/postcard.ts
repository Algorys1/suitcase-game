import Phaser from 'phaser';

/** Generic postcard placeholder; final destination artwork will replace it. */
export function drawPostcard(scene: Phaser.Scene, x: number, y: number, width: number, height: number, seed: number): void {
  const g = scene.add.graphics();
  const left = x - width / 2;
  const skies = [0xd9eeeb, 0xe7def5, 0xffe4d1];
  g.fillStyle(0xfffaf0).fillRoundedRect(left, y, width, height, 8);
  g.fillStyle(skies[seed % skies.length] ?? 0xd9eeeb).fillRoundedRect(left + 4, y + 4, width - 8, height - 8, 6);
  g.fillStyle(0xf6c96b).fillCircle(x + width * 0.22, y + height * 0.3, height * 0.12);
  g.fillStyle(0x77c98a).fillTriangle(left + 5, y + height - 5, left + width * 0.35, y + height * 0.36, left + width * 0.72, y + height - 5);
  g.fillStyle(0x59c9c2).fillTriangle(left + width * 0.36, y + height - 5, left + width * 0.7, y + height * 0.5, left + width - 5, y + height - 5);
  g.lineStyle(1, 0xc78b60).strokeRoundedRect(left, y, width, height, 8);
}
