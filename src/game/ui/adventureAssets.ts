import Phaser from 'phaser';

/** Only the requested places receive their activity layers. */
export const activityAssets: Readonly<Record<string, readonly string[]>> = {
  cimes_eternelles: ['cimes-predawn', 'cimes-mist-high', 'cimes-mist-left', 'cimes-mist-right'],
  mycelia: ['mycelia-resident', 'mycelia-sleeping'],
  ruines_englouties: ['ruins-water', 'ruins-fish-near', 'ruins-fish-far'],
  coeur_de_braise: ['braise-ground', 'braise-column-tall', 'braise-column-medium', 'braise-column-short'],
  iles_suspendues: ['isles-sky', 'isles-left', 'isles-right', 'isles-waterfall', 'isles-bridge', 'isles-grass-left', 'isles-grass-right'],
  marais_des_lucioles: ['marsh-water', 'marsh-pad-far', 'marsh-pad-middle', 'marsh-pad-near'],
  temple_oublie: ['temple-bird', 'temple-round', 'temple-leaf'],
  ile_des_cendres: ['ash-seed', 'ash-shoot', 'ash-smoke', 'ash-sand-rim'],
  grottes_sporiferes: ['grotto-dormant'],
  jardins_du_zenith: ['zenith-empty', 'zenith-can'],
  sylve_prismatique: ['sylve-ground', 'sylve-stream'],
  necropole_ardente: ['necropole-unlit'],
  foret_du_silence: ['forest-empty', 'forest-feather', 'forest-resident', 'forest-tracks'],
  cite_immobile: ['city-resident'],
  royaume_des_spores_celestes: ['kingdom-dormant', 'kingdom-cloud', 'kingdom-umbrella'],
  tempete_ecarlate: ['storm-empty', 'storm-cork'],
  atoll_boreal: ['atoll-dormant'],
  vestiges_celestes: ['vestiges-tile', 'vestiges-complete'],
  mer_figee: ['mer-empty', 'sea-resident', 'sea-resident-clap'], jungle_incandescente: ['jungle-dormant'],
  jardins_de_gemmes: ['gem-closed', 'gem-bells-clean'], empire_des_sables: ['empire-closed', 'empire-open', 'fennec-resident'],
  faille_des_contraires: ['rift-broken', 'rift-complete'],
  observatoire_des_etoiles: ['owl-resident', 'owl-resident-wings', 'observatory-empty', 'observatory-lifted', 'observatory-lens-empty', 'observatory-lens-full'],
};

export function preloadAdventureArt(scene: Phaser.Scene, ids: readonly string[], map = false): void {
  const load = (id: string) => {
    if (!scene.textures.exists(`adventure-${id}`))
      scene.load.image(`adventure-${id}`, `${import.meta.env.BASE_URL}assets/adventure/${id}.webp`);
  };
  if (map) {
    load('map-paper');
    for (const id of ['charge-full', 'charge-empty']) {
      if (!scene.textures.exists(`adventure-${id}`))
        scene.load.svg(`adventure-${id}`, `${import.meta.env.BASE_URL}assets/adventure/${id}.svg`, { width: 64, height: 64 });
    }
  }
  for (const id of new Set(ids)) for (const asset of activityAssets[id] ?? []) load(asset);
  if (ids.includes('canopee_des_brumes') && !scene.textures.exists('canopy-water-source'))
    scene.load.image('canopy-water-source', `${import.meta.env.BASE_URL}assets/destinations/canopee_des_brumes.webp`);
  if (ids.includes('temple_oublie')) for (const id of ['right', 'left', 'center']) {
    const key = `temple-carving-mask-${id}`;
    if (!scene.textures.exists(key)) scene.load.svg(key,
      `${import.meta.env.BASE_URL}assets/adventure/temple-carving-${id}.svg`, { scale: 3 });
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
