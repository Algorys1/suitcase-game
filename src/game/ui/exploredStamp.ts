import Phaser from 'phaser';

/** Dry sepia ink on a luggage label, rather than a badge over the landscape. */
export function exploredStamp(scene: Phaser.Scene, label: string, compact: boolean): Phaser.GameObjects.Container {
  const text = scene.add.text(0, 0, label, { resolution: 2, fontFamily: '"Travel Serif", Georgia, serif',
    fontSize: compact ? 9 : 11, fontStyle: 'bold', color: '#8c5e3d' }).setOrigin(0.5).setPadding(1);
  const width = text.width + 12, height = compact ? 14 : 17;
  const ink = scene.add.graphics().lineStyle(1.1, 0x8c5e3d, 0.8);
  // Uneven, interrupted impressions suggest a well-used passport stamp.
  ink.lineBetween(-width / 2, -height / 2, -width * 0.16, -height / 2)
    .lineBetween(-width * 0.13, -height / 2, width / 2, -height / 2 + 0.3)
    .lineBetween(width / 2, -height / 2, width / 2, height / 2)
    .lineBetween(width / 2, height / 2, width * 0.24, height / 2)
    .lineBetween(width * 0.2, height / 2, -width / 2, height / 2 - 0.3)
    .lineBetween(-width / 2, height / 2, -width / 2, 1)
    .lineBetween(-width / 2, -1, -width / 2, -height / 2);
  return scene.add.container(0, 0, [ink, text]).setAngle(compact ? -4 : -6).setAlpha(0.88)
    .setData('stamp-width', width).setSize(width, height);
}

export function impressStamp(scene: Phaser.Scene, stamp: Phaser.GameObjects.Container): void {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (query.matches) return;
  const y = stamp.y;
  stamp.setY(y - 7).setScale(1.28).setAlpha(0);
  const tween = scene.tweens.add({ targets: stamp, y, scale: 1, alpha: 0.88,
    duration: 300, ease: 'Back.Out' });
  const finish = () => { tween.stop(); stamp.setY(y).setScale(1).setAlpha(0.88); };
  query.addEventListener('change', finish);
  stamp.once('destroy', () => { tween.stop(); query.removeEventListener('change', finish); });
}
