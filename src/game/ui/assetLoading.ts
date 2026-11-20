import { preloadShoreVisitors } from './shoreVisitors';
import type Phaser from 'phaser';
import { getTexts } from '../../services/i18n';
import { progressStore } from '../../services/storage';
import type { SessionState } from '../../domain/session';
import { destinationById } from '../../domain/recipes';
import { preloadPostcards } from './postcard';
import { preloadSouvenirs } from './souvenir';
import { preloadAdventureArt } from './adventureAssets';
import { preloadElementArt, preloadPreparationArt } from './preparationArt';
import { prepareIllustrationTextures } from './illustrationTextures';

const overlay = () => document.getElementById('loading-screen');

/** Shared illustrated loading paper, visible before Phaser and between uncached places. */
export function beginSceneLoading(scene: Phaser.Scene): void {
  scene.data.set('asset-load-failed', false);
  const ui = overlay();
  const text = document.getElementById('loading-copy');
  const detail = document.getElementById('loading-detail');
  const bar = document.getElementById('loading-progress');
  const retry = document.getElementById('loading-retry') as HTMLButtonElement | null;
  if (text) text.textContent = getTexts().loading.title;
  bar?.setAttribute('aria-label', getTexts().loading.title);
  if (detail) detail.textContent = getTexts().loading.detail;
  if (retry) { retry.hidden = true; retry.textContent = getTexts().loading.retry; retry.onclick = () => location.reload(); }
  if (ui) ui.hidden = false;
  const progress = (value: number) => {
    bar?.setAttribute('aria-valuenow', String(Math.round(value * 100)));
    (bar?.firstElementChild as HTMLElement | null)?.style.setProperty('width', `${Math.round(value * 100)}%`);
  };
  const failed = () => {
    scene.data.set('asset-load-failed', true);
    if (text) text.textContent = getTexts().loading.error;
    if (detail) detail.textContent = getTexts().loading.errorDetail;
    if (retry) retry.hidden = false;
  };
  progress(0);
  scene.load.on('progress', progress);
  scene.load.on('loaderror', failed);
  scene.events.once('shutdown', () => {
    scene.load.off('progress', progress);
    scene.load.off('loaderror', failed);
  });
}

export function finishSceneLoading(scene: Phaser.Scene): boolean {
  if (scene.data.get('asset-load-failed')) return false;
  prepareIllustrationTextures(scene);
  const ui = overlay();
  if (ui) ui.hidden = true;
  return true;
}

export function queueWorldAssets(scene: Phaser.Scene, ids: readonly string[], map = false): void {
  preloadPostcards(scene, ids);
  preloadSouvenirs(scene, ids);
  if (ids.includes('foret_du_silence') && progressStore.read().welcomedForestVisitor)
    preloadSouvenirs(scene, ['mycelia']);
  if (ids.includes('cite_immobile') && progressStore.read().welcomedCityVisitor)
    preloadSouvenirs(scene, ['coeur_de_braise']);
  if (ids.includes('mer_figee') && progressStore.read().welcomedSeaVisitor)
    preloadSouvenirs(scene, ['archipel_azur']);
  if (ids.includes('observatoire_des_etoiles') && progressStore.read().welcomedObservatoryVisitor)
    preloadSouvenirs(scene, ['iles_suspendues']);
  if (ids.includes('empire_des_sables') && progressStore.read().welcomedEmpireVisitor)
    preloadSouvenirs(scene, ['temple_oublie']);
  if (ids.includes('recif_de_verre')) {
    if (!scene.textures.exists('adventure-octopus-resident'))
      scene.load.image('adventure-octopus-resident', import.meta.env.BASE_URL + 'assets/adventure/octopus-resident.webp');
    if (progressStore.read().welcomedReefVisitor) preloadSouvenirs(scene, ['grottes_sporiferes']);
  }
  if (ids.includes('marais_des_lucioles')) {
    if (!scene.textures.exists('adventure-frog-resident'))
      scene.load.image('adventure-frog-resident', import.meta.env.BASE_URL + 'assets/adventure/frog-resident.webp');
    if (progressStore.read().welcomedMarshVisitor) preloadSouvenirs(scene, ['jardins_de_gemmes']);
  }
  if (ids.includes('palais_de_givre')) {
    if (!scene.textures.exists('adventure-yeti-resident'))
      scene.load.image('adventure-yeti-resident', import.meta.env.BASE_URL + 'assets/adventure/yeti-resident.webp');
    if (progressStore.read().welcomedPalaceVisitor) preloadSouvenirs(scene, ['atoll_boreal']);
  }
  if (ids.includes('vestiges_celestes')) {
    if (!scene.textures.exists('adventure-griffin-resident'))
      scene.load.image('adventure-griffin-resident', import.meta.env.BASE_URL + 'assets/adventure/griffin-resident.webp');
    if (!scene.textures.exists('adventure-griffin-wings'))
      scene.load.image('adventure-griffin-wings', import.meta.env.BASE_URL + 'assets/adventure/griffin-wings.webp');
    if (progressStore.read().welcomedVestigesVisitor) preloadSouvenirs(scene, ['tempete_ecarlate']);
  }
  if (ids.includes('royaume_des_spores_celestes')) {
    if (!scene.textures.exists('adventure-dragon-resident'))
      scene.load.image('adventure-dragon-resident', import.meta.env.BASE_URL + 'assets/adventure/dragon-resident.webp');
    if (progressStore.read().welcomedKingdomVisitor) preloadSouvenirs(scene, ['jungle_incandescente']);
  }
  if (ids.includes('ruines_englouties')) {
    if (!scene.textures.exists('adventure-axolotl-resident'))
      scene.load.image('adventure-axolotl-resident', import.meta.env.BASE_URL + 'assets/adventure/axolotl-resident.webp');
    if (!scene.textures.exists('adventure-axolotl-gills'))
      scene.load.image('adventure-axolotl-gills', import.meta.env.BASE_URL + 'assets/adventure/axolotl-gills.webp');
    if (progressStore.read().welcomedRuinsVisitor) preloadSouvenirs(scene, ['vestiges_celestes']);
  }
  preloadShoreVisitors(scene, ids);
  preloadAdventureArt(scene, ids, map);
  if (map) {
    const session = (scene.sys.settings.data as { session?: SessionState } | undefined)?.session
      ?? progressStore.read().expedition;
    if (session?.voidTrips && !scene.textures.exists('void-space')) scene.load.image('void-space',
      `${import.meta.env.BASE_URL}assets/void/space.webp`);
    if (session?.voidTrips && !scene.textures.exists('preparation-suitcase_compass')) scene.load.image('preparation-suitcase_compass',
      `${import.meta.env.BASE_URL}assets/preparation/suitcase_compass.webp`);
  }
  if (map && ids.length) preloadElementArt(scene,
    [...new Set(ids.flatMap(id => destinationById(id)?.elements ?? []))]);
}

export function queuePreparationAssets(scene: Phaser.Scene): void { preloadPreparationArt(scene); }

export function sceneWorldIds(scene: Phaser.Scene, includeRoute = false): readonly string[] {
  const data = (scene.sys.settings.data ?? {}) as { id?: string; session?: SessionState };
  const visited = (data.session ?? progressStore.read().expedition)?.visitedDestinationIds ?? [];
  return data.id ? includeRoute ? [...new Set([data.id, ...visited])] : [data.id] : visited;
}

export function queueVoidAssets(scene: Phaser.Scene): void {
  if (!scene.textures.exists('void-space')) scene.load.image('void-space', `${import.meta.env.BASE_URL}assets/void/space.webp`);
  preloadPreparationArt(scene);
}
