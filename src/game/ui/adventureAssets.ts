import Phaser from 'phaser';

export function preloadAdventureArt(scene: Phaser.Scene): void {
  if (!scene.textures.exists('canopy-water-source')) scene.load.image('canopy-water-source',
    `${import.meta.env.BASE_URL}assets/destinations/canopee_des_brumes.webp`);
  for (const id of ['right', 'left', 'center']) {
    const key = `temple-carving-mask-${id}`;
    if (!scene.textures.exists(key)) scene.load.svg(key,
      `${import.meta.env.BASE_URL}assets/adventure/temple-carving-${id}.svg`, { scale: 3 });
  }
  for (const id of ['map-paper', 'mycelia-resident', 'mycelia-sleeping', 'cimes-predawn']) {
    if (!scene.textures.exists(`adventure-${id}`))
      scene.load.image(`adventure-${id}`, `${import.meta.env.BASE_URL}assets/adventure/${id}.png`);
  }
  for (const id of ['charge-full', 'charge-empty']) {
    if (!scene.textures.exists(`adventure-${id}`))
      scene.load.svg(`adventure-${id}`, `${import.meta.env.BASE_URL}assets/adventure/${id}.svg`, { width: 64, height: 64 });
  }
  for (const id of ['ruins-water', 'ruins-fish-near', 'ruins-fish-far',
    'cimes-mist-high', 'cimes-mist-left', 'cimes-mist-right',
    'braise-ground', 'braise-column-tall', 'braise-column-medium', 'braise-column-short',
    'isles-sky', 'isles-left', 'isles-right', 'isles-waterfall', 'isles-bridge',
    'isles-grass-left', 'isles-grass-right', 'marsh-water', 'marsh-pad-far', 'marsh-pad-middle', 'marsh-pad-near',
    'temple-bird', 'temple-round', 'temple-leaf', 'ash-seed', 'ash-shoot', 'ash-smoke', 'ash-sand-rim',
    'grotto-dormant']) {
    if (!scene.textures.exists(`adventure-${id}`))
      scene.load.image(`adventure-${id}`, `${import.meta.env.BASE_URL}assets/adventure/${id}.webp`);
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
