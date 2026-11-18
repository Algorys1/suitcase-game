import { drawCollectedAtmosphere } from './collectedAtmosphere';
import { drawOwlVisitor } from './owlVisitor';
import { drawLensTwinkle } from './observatoryLens';
import { drawRiftSteam } from './riftBasalt';
import { drawEmpireSmoke } from './empireLamp';
import { drawGardenLight } from './gemGarden';
import { drawFruitPulse } from './jungleHeat';
import { drawGlobeSnow } from './frozenGlobe';
import Phaser from 'phaser';
import { drawForestVisitor, drawCityVisitor } from './souvenirVisitors';
import { drawSeaVisitor } from './seaVisitor';
import { destinations } from '../../domain/recipes';
import { drawKingdomWaterfalls } from './kingdomWaterfalls';
import { drawSanctuarySpores } from './sanctuarySpores';
import { drawForestSnow } from './forestSnow';
import { addNecropoleLamps } from './necropoleLamps';
import { addSylvePath } from './sylvePath';
import { addCityWindows } from './cityWindows';
import { worldTexture } from './worldTexture';
import { addZenithWatering } from './zenithWatering';
import { progressStore } from '../../services/storage';
import { drawAtollAurora } from './atollAurora';
import { drawStormBottle } from './stormLightning';
import { drawVestigesMist } from './vestigesMist';

const textureKey = (id: string): string => `destination-${id}`;

/** Load only the requested places from the catalogue's asset paths. */
export function preloadPostcards(scene: Phaser.Scene, ids: readonly string[]): void {
  for (const destination of destinations) {
    if (!ids.includes(destination.id)) continue;
    if (!scene.textures.exists(textureKey(destination.id))) {
      scene.load.image(textureKey(destination.id), import.meta.env.BASE_URL + destination.image);
    }
  }
}

export function hasPostcard(scene: Phaser.Scene, index: number): boolean {
  const destination = destinations[index];
  return destination !== undefined && scene.textures.exists(textureKey(destination.id));
}

/** Contain the complete illustration without distortion; retain a graceful fallback. */
export function drawPostcard(scene: Phaser.Scene, x: number, y: number, width: number, height: number, seed: number,
  mounted = false): Array<Phaser.GameObjects.Graphics | Phaser.GameObjects.Image> {
  const g = scene.add.graphics();
  const objects: Array<Phaser.GameObjects.Graphics | Phaser.GameObjects.Image> = [g];
  const left = x - width / 2;
  const skies = [0xd9eeeb, 0xe7def5, 0xffe4d1];
  g.fillStyle(0x79543f, 0.12).fillRoundedRect(left, y + 4, width, height, 8);
  g.fillStyle(0xfffaf0).fillRoundedRect(left, y, width, height, 8);
  const destination = destinations[seed];
  if (destination && hasPostcard(scene, seed)) {
    const picture = scene.add.image(x, y + height / 2,
      destination.id === 'ile_des_cendres' || destination.id === 'grottes_sporiferes'
        || destination.id === 'canopee_des_brumes' || destination.id === 'jardins_du_zenith' || destination.id === 'necropole_ardente' || destination.id === 'foret_du_silence' || destination.id === 'sanctuaire_des_spores' || destination.id === 'royaume_des_spores_celestes' || destination.id === 'tempete_ecarlate' || destination.id === 'atoll_boreal'
        || destination.id === 'vestiges_celestes' || destination.id === 'mer_figee' || destination.id === 'jungle_incandescente' || destination.id === 'jardins_de_gemmes' || destination.id === 'empire_des_sables' || destination.id === 'faille_des_contraires' || destination.id === 'observatoire_des_etoiles' ? worldTexture(scene, destination.id) : textureKey(destination.id))
      .setName(`postcard-${destination.id}`);
    const scale = Math.min((width - 8) / picture.width, (height - 8) / picture.height);
    picture.setScale(scale);
    g.lineStyle(1, 0xc78b60).strokeRoundedRect(left, y, width, height, 8);
    objects.push(picture);
    if (destination.id === 'jardins_du_zenith') {
      const before = new Set(scene.children.getAll());
      addZenithWatering(scene, { left: picture.x - picture.displayWidth / 2,
        top: picture.y - picture.displayHeight / 2, width: picture.displayWidth, height: picture.displayHeight },
      progressStore.explorationSteps('jardins_du_zenith'), () => {}, false, false);
      objects.push(...scene.children.getAll().filter((object): object is Phaser.GameObjects.Image =>
        !before.has(object) && object instanceof Phaser.GameObjects.Image));
    }
    if (destination.id === 'cite_immobile') objects.push(...addCityWindows(scene,
      { left: picture.x - picture.displayWidth / 2, top: picture.y - picture.displayHeight / 2,
        width: picture.displayWidth, height: picture.displayHeight }, progressStore.explorationSteps('cite_immobile')));
    if (destination.id === 'sylve_prismatique') objects.push(...addSylvePath(scene,
      { left: picture.x - picture.displayWidth / 2, top: picture.y - picture.displayHeight / 2,
        width: picture.displayWidth, height: picture.displayHeight }, progressStore.explorationSteps('sylve_prismatique')));
    if (destination.id === 'necropole_ardente') objects.push(...addNecropoleLamps(scene,
      { left: picture.x - picture.displayWidth / 2, top: picture.y - picture.displayHeight / 2,
        width: picture.displayWidth, height: picture.displayHeight }, progressStore.explorationSteps('necropole_ardente')));
    if (destination.id === 'foret_du_silence') objects.push(...drawForestSnow(scene,
      { left: picture.x - picture.displayWidth / 2, top: picture.y - picture.displayHeight / 2,
        width: picture.displayWidth, height: picture.displayHeight }, progressStore.explorationSteps('foret_du_silence')).objects);
    if (destination.id === 'sanctuaire_des_spores') objects.push(...drawSanctuarySpores(scene,
      { left: picture.x - picture.displayWidth / 2, top: picture.y - picture.displayHeight / 2,
        width: picture.displayWidth, height: picture.displayHeight }, progressStore.sanctuaryPuzzle(),
      progressStore.unlockedSouvenirIds().includes(destination.id)).objects);
    if (destination.id === 'royaume_des_spores_celestes') objects.push(...drawKingdomWaterfalls(scene,
      { left: picture.x - picture.displayWidth / 2, top: picture.y - picture.displayHeight / 2,
        width: picture.displayWidth, height: picture.displayHeight },
      progressStore.explorationSteps('royaume_des_spores_celestes')).objects);
    if (destination.id === 'tempete_ecarlate' && progressStore.explorationSteps('tempete_ecarlate').includes(1))
      objects.push(...drawStormBottle(scene, { left: picture.x - picture.displayWidth / 2,
        top: picture.y - picture.displayHeight / 2, width: picture.displayWidth, height: picture.displayHeight }));
    if (destination.id === 'atoll_boreal') objects.push(...drawAtollAurora(scene,
      { left: picture.x - picture.displayWidth / 2, top: picture.y - picture.displayHeight / 2,
        width: picture.displayWidth, height: picture.displayHeight }, progressStore.explorationSteps('atoll_boreal').length === 2));
    if (destination.id === 'observatoire_des_etoiles') objects.push(...drawLensTwinkle(scene,
      { left: picture.x - picture.displayWidth / 2, top: picture.y - picture.displayHeight / 2,
        width: picture.displayWidth, height: picture.displayHeight }, progressStore.explorationSteps('observatoire_des_etoiles').length === 2));
    if (destination.id === 'observatoire_des_etoiles') objects.push(...drawOwlVisitor(scene, {
      left: picture.x - picture.displayWidth / 2, top: picture.y - picture.displayHeight / 2,
      width: picture.displayWidth, height: picture.displayHeight,
    }));
    if (destination.id === 'faille_des_contraires') objects.push(...drawRiftSteam(scene,
      { left: picture.x - picture.displayWidth / 2, top: picture.y - picture.displayHeight / 2,
        width: picture.displayWidth, height: picture.displayHeight }, progressStore.explorationSteps('faille_des_contraires').length === 2));
    if (destination.id === 'empire_des_sables') objects.push(...drawEmpireSmoke(scene,
      { left: picture.x - picture.displayWidth / 2, top: picture.y - picture.displayHeight / 2,
        width: picture.displayWidth, height: picture.displayHeight }, progressStore.explorationSteps('empire_des_sables').length === 1));
    if (destination.id === 'jardins_de_gemmes') objects.push(...drawGardenLight(scene,
      { left: picture.x - picture.displayWidth / 2, top: picture.y - picture.displayHeight / 2,
        width: picture.displayWidth, height: picture.displayHeight }, progressStore.explorationSteps('jardins_de_gemmes')));
    if (destination.id === 'jungle_incandescente') objects.push(...drawFruitPulse(scene,
      { left: picture.x - picture.displayWidth / 2, top: picture.y - picture.displayHeight / 2,
        width: picture.displayWidth, height: picture.displayHeight }, progressStore.explorationSteps('jungle_incandescente').length === 2));
    if (destination.id === 'mer_figee') objects.push(...drawGlobeSnow(scene,
      { left: picture.x - picture.displayWidth / 2, top: picture.y - picture.displayHeight / 2,
        width: picture.displayWidth, height: picture.displayHeight }, progressStore.explorationSteps('mer_figee').length === 3));
    if (destination.id === 'vestiges_celestes') objects.push(...drawVestigesMist(scene,
      { left: picture.x - picture.displayWidth / 2, top: picture.y - picture.displayHeight / 2,
        width: picture.displayWidth, height: picture.displayHeight },
      progressStore.explorationSteps('vestiges_celestes').length === 3));
    if (destination.id === 'mer_figee') objects.push(...drawSeaVisitor(scene,
      { left: picture.x - picture.displayWidth / 2, top: picture.y - picture.displayHeight / 2,
        width: picture.displayWidth, height: picture.displayHeight }));
    if (destination.id === 'cite_immobile') objects.push(...drawCityVisitor(scene,
      { left: picture.x - picture.displayWidth / 2, top: picture.y - picture.displayHeight / 2,
        width: picture.displayWidth, height: picture.displayHeight }));
    if (destination.id === 'foret_du_silence') objects.push(...drawForestVisitor(scene,
      { left: picture.x - picture.displayWidth / 2, top: picture.y - picture.displayHeight / 2,
        width: picture.displayWidth, height: picture.displayHeight }));
    objects.push(...drawCollectedAtmosphere(scene, destination.id, {
      left: picture.x - picture.displayWidth / 2, top: picture.y - picture.displayHeight / 2,
      width: picture.displayWidth, height: picture.displayHeight,
    }, progressStore.unlockedSouvenirIds().includes(destination.id)));
    if (mounted) {
      // Frame corners stay in front of the landscape.
      // The photo corners remain above the painted overlays.
      const corners = scene.add.graphics();
      corners.fillStyle(0xb58b4c);
      corners.fillTriangle(left - 3, y - 3, left + 17, y - 3, left - 3, y + 17);
      corners.fillTriangle(left + width + 3, y + height + 3, left + width - 17, y + height + 3,
        left + width + 3, y + height - 17);
      corners.lineStyle(1, 0xf4d494).lineBetween(left - 1, y + 12, left + 12, y - 1);
      corners.lineBetween(left + width - 12, y + height + 1, left + width + 1, y + height - 12);
      objects.push(corners);
    }
    return objects;
  }
  g.fillStyle(skies[seed % skies.length] ?? 0xd9eeeb).fillRoundedRect(left + 4, y + 4, width - 8, height - 8, 6);
  g.fillStyle(0xf6c96b).fillCircle(x + width * 0.22, y + height * 0.3, height * 0.12);
  g.fillStyle(0x77c98a).fillTriangle(left + 5, y + height - 5, left + width * 0.35, y + height * 0.36, left + width * 0.72, y + height - 5);
  g.fillStyle(0x59c9c2).fillTriangle(left + width * 0.36, y + height - 5, left + width * 0.7, y + height * 0.5, left + width - 5, y + height - 5);
  g.lineStyle(1, 0xc78b60).strokeRoundedRect(left, y, width, height, 8);
  return objects;
}
