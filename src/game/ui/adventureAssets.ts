import Phaser from 'phaser';

export function preloadAdventureArt(scene: Phaser.Scene): void {
  for (const id of ['map-paper', 'mycelia-resident', 'mycelia-sleeping', 'cimes-predawn']) {
    if (!scene.textures.exists(`adventure-${id}`))
      scene.load.image(`adventure-${id}`, `${import.meta.env.BASE_URL}assets/adventure/${id}.png`);
  }
  for (const id of ['charge-full', 'charge-empty']) {
    if (!scene.textures.exists(`adventure-${id}`))
      scene.load.svg(`adventure-${id}`, `${import.meta.env.BASE_URL}assets/adventure/${id}.svg`, { width: 64, height: 64 });
  }
}

export function drawChargeBadge(scene: Phaser.Scene, x: number, y: number, radius: number,
  filled: boolean, name: string): void {
  const key = `adventure-charge-${filled ? 'full' : 'empty'}`;
  if (scene.textures.exists(key)) scene.add.image(x, y, key).setDisplaySize(radius * 2.3, radius * 2.3).setName(name);
  else {
    const badge = scene.add.graphics().setName(name).lineStyle(1, 0xad8d5c, filled ? 1 : 0.5).strokeCircle(x, y, radius);
    if (filled) badge.fillStyle(0xc59b51).fillCircle(x, y, radius * 0.72);
  }
}
