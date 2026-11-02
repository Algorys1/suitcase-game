import Phaser from 'phaser';

/** Lightweight paper and binding, drawn locally at the current canvas size. */
export function drawNotebook(scene: Phaser.Scene, left: number, top: number, width: number, height: number,
  foldX?: number): void {
  const g = scene.add.graphics().setName('notebook-paper');
  g.fillStyle(0x293f43).fillRect(0, 0, scene.scale.width, scene.scale.height);
  // A quiet compass motif on the travel desk, mostly concealed by the book.
  g.lineStyle(1, 0xe4bf79, 0.12);
  g.strokeCircle(scene.scale.width / 2, scene.scale.height / 2, Math.min(scene.scale.width, scene.scale.height) * 0.65);
  g.fillStyle(0x13282e, 0.35).fillRoundedRect(left - 6, top + 3, width + 12, height + 8, 16);
  g.fillStyle(0x875e42).fillRoundedRect(left - 6, top - 5, width + 12, height + 12, 14);
  g.lineStyle(1, 0xd9b77b).strokeRoundedRect(left - 3, top - 2, width + 6, height + 6, 12);
  g.fillStyle(0xd4bf99).fillRoundedRect(left + 1, top + 5, width - 2, height, 10);
  g.fillStyle(0xfff5df).fillRoundedRect(left, top, width, height, 10);
  g.lineStyle(1, 0xc5a478, 0.55).lineBetween(left + 12, top + height + 2, left + width - 12, top + height + 2);
  // Fixed seed avoids flickering grain when keyboard focus or size changes.
  let seed = 71;
  const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  g.fillStyle(0x9a7049, 0.08);
  for (let i = 0; i < Math.min(1800, width * height / 240); i++) {
    g.fillRect(left + 10 + random() * (width - 20), top + 10 + random() * (height - 20), 1 + random() * 2, 1);
  }
  g.lineStyle(1, 0xb99257, 0.28).strokeRoundedRect(left + 9, top + 9, width - 18, height - 18, 5);
  if (foldX !== undefined) {
    g.fillStyle(0x8a603c, 0.05).fillRect(foldX - 7, top + 2, 14, height - 4);
    g.lineStyle(1, 0x9c774f, 0.24).lineBetween(foldX, top + 10, foldX, top + height - 10);
    g.lineStyle(1, 0xffffff, 0.55).lineBetween(foldX + 2, top + 10, foldX + 2, top + height - 10);
    for (let y = top + 36; y < top + height - 20; y += 46) {
      g.lineStyle(2, 0x977c55, 0.45).lineBetween(foldX - 4, y, foldX + 4, y + 3);
    }
  }
}

export function drawDiamond(g: Phaser.GameObjects.Graphics, x: number, y: number, size: number): void {
  g.fillTriangle(x, y - size, x + size * 0.55, y, x, y + size);
  g.fillTriangle(x, y - size, x - size * 0.55, y, x, y + size);
}

type RevealObject = Phaser.GameObjects.Graphics | Phaser.GameObjects.Image | Phaser.GameObjects.Text;

/** Presentation only: never touches session state or delays the Continue action. */
export function revealPostcard(scene: Phaser.Scene, art: RevealObject[], words: RevealObject[],
  bounds: { x: number; y: number; width: number; height: number }, fresh: boolean,
  souvenir: RevealObject[] = []): () => void {
  const tweens: Phaser.Tweens.Tween[] = [];
  const sparks: Phaser.GameObjects.Graphics[] = [];
  art.forEach(object => object.setAlpha(0));
  words.forEach(object => object.setAlpha(0));
  tweens.push(scene.tweens.add({ targets: art, alpha: 1, duration: fresh ? 360 : 220, ease: 'Sine.Out' }));
  tweens.push(scene.tweens.add({ targets: words, alpha: 1, delay: fresh ? 140 : 60,
    duration: fresh ? 280 : 200, ease: 'Sine.Out' }));
  if (souvenir.length) {
    souvenir.forEach(object => object.setAlpha(0));
    tweens.push(scene.tweens.add({ targets: souvenir, alpha: 1, delay: fresh ? 300 : 60,
      duration: fresh ? 260 : 200, ease: 'Sine.Out' }));
  }
  if (fresh) {
    for (let i = 0; i < 6; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const x = bounds.x + side * (bounds.width / 2 - 5);
      const y = bounds.y + bounds.height * (0.2 + Math.floor(i / 2) * 0.3);
      const spark = scene.add.graphics({ x, y }).setName('discovery-spark').setAlpha(0);
      spark.fillStyle(0xffdf91);
      drawDiamond(spark, 0, 0, 5 + i % 3);
      sparks.push(spark);
      tweens.push(scene.tweens.add({ targets: spark, alpha: 1, y: y - 5,
        delay: 80 + i * 35, duration: 180, yoyo: true, onComplete: () => spark.destroy() }));
    }
  }
  return () => {
    tweens.forEach(tween => tween.remove());
    sparks.forEach(spark => { if (spark.scene) spark.destroy(); });
  };
}
