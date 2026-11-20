import { drawAxolotlVisitor } from './axolotlVisitor';
import { drawDragonVisitor } from './dragonVisitor';
import { drawGriffinVisitor } from './griffinVisitor';
import { drawYetiVisitor } from './yetiVisitor';
import { drawFrogVisitor } from './frogVisitor';
import { drawOctopusVisitor } from './octopusVisitor';
import { drawFennecVisitor } from './fennecVisitor';
import { drawCollectedAtmosphere } from './collectedAtmosphere';
import { drawOwlVisitor } from './owlVisitor';
import { needsTravelTip } from './travelTutorial';
import type { TutorialStep } from '../../services/storage';
import { drawLensTwinkle } from './observatoryLens';
import { drawRiftSteam } from './riftBasalt';
import { drawEmpireSmoke } from './empireLamp';
import { drawGardenLight } from './gemGarden';
import { drawFruitPulse } from './jungleHeat';
import { drawGlobeSnow } from './frozenGlobe';
import Phaser from 'phaser';
import type { SessionState } from '../../domain/session';
import { getDestinationTexts, getTexts } from '../../services/i18n';
import { drawAdventureMap, mapText, reducedMotion } from './adventureMap';
import { drawPreparationDesk } from './preparationArt';
import { arriveObjects } from './travelMotion';
import { drawPostcard } from './postcard';
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
import { drawForestVisitor, drawCityVisitor } from './souvenirVisitors';

/** Keep the postcard intact and give it more room during landscape exploration. */
export function drawDestinationStage(scene: Phaser.Scene, id: string, session?: SessionState,
  enter = false, tip?: TutorialStep) {
  const { width: w, height: h } = scene.scale;
  const portrait = w < 600, short = h < 450;
  const wideExploration = !portrait && scene.sys.settings.key === 'exploration';
  if (session) drawAdventureMap(scene, session);
  else drawPreparationDesk(scene, w, h);
  // The map becomes a quiet tabletop beneath the postcard, without duplicate headings.
  scene.children.getAll().filter(child => child.type === 'Text').forEach(child => child.destroy());
  scene.add.rectangle(w / 2, h / 2, w, h, 0x382e28, 0.47).setName('destination-scrim');
  const paper = scene.add.graphics();
  const sideX = portrait ? w / 2 : w * (wideExploration ? 0.84 : 0.815);
  const sideW = portrait ? w - 38 : w * (wideExploration ? 0.28 : short ? 0.335 : 0.31);
  if (portrait) paper.fillStyle(0x57412b, 0.2).fillRoundedRect(15, 20, w - 24, h - 30, 6)
    .fillStyle(0xfcf3df).fillRoundedRect(10, 15, w - 24, h - 30, 6);
  else {
    paper.fillStyle(0x57412b, 0.2).fillRoundedRect(sideX - sideW / 2 + 3, 46, sideW, h - 60, 4);
    paper.fillStyle(0xfcf3df).fillRoundedRect(sideX - sideW / 2, 42, sideW, h - 60, 4);
    paper.lineStyle(1, 0xb69a70, 0.3).lineBetween(sideX - sideW / 2 + 15, h - 124, sideX + sideW / 2 - 15, h - 124);
    paper.fillStyle(0xddc58e, 0.65).fillRect(sideX - 21, 33, 42, 18);
  }
  mapText(scene, sideX, portrait ? 33 : short ? 56 : 70, getTexts().adventure.arrival, 9, sideW - 20, '#a08052').setLetterSpacing(2);
  const title = mapText(scene, sideX, portrait ? 61 : short ? 90 : 116,
    getDestinationTexts(id)?.title ?? '', portrait ? 23 : short ? 21 : 29, sideW - 18, '#5b4030')
    .setFontFamily('Georgia, serif').setName('menu-title');
  const artTop = portrait ? Math.max(104, title.y + title.height / 2 + 15) : wideExploration ? 14 : short ? 38 : 60;
  const artAreaW = portrait ? w - 44 : wideExploration ? w * 0.70 - 30 : w * 0.615 - 28;
  const hasNote = tip !== undefined && needsTravelTip(tip);
  const noteSpace = hasNote ? (portrait ? 65 : 150) : 0;
  const artAreaH = portrait ? Math.max(55, h - artTop - 264 - noteSpace)
    : h - artTop - (wideExploration ? 20 : short ? 38 : 53) - noteSpace;
  const key = worldTexture(scene, id);
  let artW = artAreaW, artH = Math.min(artAreaH, artW * 0.75);
  if (scene.textures.exists(key)) {
    const frame = scene.textures.getFrame(key);
    const scale = Math.min(artAreaW / frame.width, artAreaH / frame.height);
    artW = frame.width * scale; artH = frame.height * scale;
  }
  const artX = portrait ? w / 2 - 2 : w * (wideExploration ? 0.35 : 0.315);
  const artY = portrait ? artTop + artH / 2 : (h - noteSpace) / 2;
  const artLeft = artX - artW / 2, artUpper = artY - artH / 2;
  const frame = scene.add.graphics().setName('arrival-photo-paper');
  frame.fillStyle(0x382e28, 0.17).fillRoundedRect(artLeft - 8, artUpper - 3, artW + 20, artH + 22, 4);
  frame.fillStyle(0xfffaf0).lineStyle(1, 0xd1b98c)
    .fillRoundedRect(artLeft - 9, artUpper - 9, artW + 18, artH + 24, 3)
    .strokeRoundedRect(artLeft - 9, artUpper - 9, artW + 18, artH + 24, 3);
  const objects: Phaser.GameObjects.GameObject[] = [frame];
  if (scene.textures.exists(key)) objects.push(scene.add.image(artX, artY, key)
    .setDisplaySize(artW, artH).setName('exploration-art'));
  else objects.push(...drawPostcard(scene, artX, artUpper, artW, artH,
    destinations.findIndex(destination => destination.id === id)));
  if (id === 'jardins_du_zenith' && scene.sys.settings.key !== 'exploration') {
    const before = new Set(scene.children.getAll());
    addZenithWatering(scene, { left: artLeft, top: artUpper, width: artW, height: artH },
      progressStore.explorationSteps('jardins_du_zenith'), () => {}, false, false);
    objects.push(...scene.children.getAll().filter(child => !before.has(child)));
  }
  if (id === 'cite_immobile' && scene.sys.settings.key !== 'exploration')
    objects.push(...addCityWindows(scene, { left: artLeft, top: artUpper, width: artW, height: artH },
      progressStore.explorationSteps('cite_immobile')));
  if (id === 'sylve_prismatique' && scene.sys.settings.key !== 'exploration')
    objects.push(...addSylvePath(scene, { left: artLeft, top: artUpper, width: artW, height: artH },
      progressStore.explorationSteps('sylve_prismatique')));
  if (id === 'necropole_ardente' && scene.sys.settings.key !== 'exploration')
    objects.push(...addNecropoleLamps(scene, { left: artLeft, top: artUpper, width: artW, height: artH },
      progressStore.explorationSteps('necropole_ardente')));
  if (id === 'cite_immobile' && scene.sys.settings.key !== 'exploration')
    objects.push(...drawCityVisitor(scene, { left: artLeft, top: artUpper, width: artW, height: artH }));
  if (id === 'foret_du_silence' && scene.sys.settings.key !== 'exploration')
    objects.push(...drawForestSnow(scene, { left: artLeft, top: artUpper, width: artW, height: artH },
      progressStore.explorationSteps('foret_du_silence')).objects);
  if (id === 'sanctuaire_des_spores' && scene.sys.settings.key !== 'exploration')
    objects.push(...drawSanctuarySpores(scene, { left: artLeft, top: artUpper, width: artW, height: artH },
      progressStore.sanctuaryPuzzle(), progressStore.unlockedSouvenirIds().includes(id)).objects);
  if (id === 'royaume_des_spores_celestes' && scene.sys.settings.key !== 'exploration')
    objects.push(...drawKingdomWaterfalls(scene, { left: artLeft, top: artUpper, width: artW, height: artH },
      progressStore.explorationSteps('royaume_des_spores_celestes')).objects);
  if (id === 'tempete_ecarlate' && scene.sys.settings.key !== 'exploration'
    && progressStore.explorationSteps('tempete_ecarlate').includes(1))
    objects.push(...drawStormBottle(scene, { left: artLeft, top: artUpper, width: artW, height: artH }));
  if (id === 'atoll_boreal' && scene.sys.settings.key !== 'exploration')
    objects.push(...drawAtollAurora(scene, { left: artLeft, top: artUpper, width: artW, height: artH },
      progressStore.explorationSteps('atoll_boreal').length === 2));
  if (id === 'observatoire_des_etoiles' && scene.sys.settings.key !== 'exploration')
    objects.push(...drawLensTwinkle(scene, { left: artLeft, top: artUpper, width: artW, height: artH },
      progressStore.explorationSteps('observatoire_des_etoiles').length === 2));
  if (id === 'observatoire_des_etoiles' && scene.sys.settings.key !== 'exploration')
    objects.push(...drawOwlVisitor(scene, { left: artLeft, top: artUpper, width: artW, height: artH }));
  if (id === 'recif_de_verre' && scene.sys.settings.key !== 'exploration')
    objects.push(...drawOctopusVisitor(scene, { left: artLeft, top: artUpper, width: artW, height: artH }));
  if (id === 'marais_des_lucioles' && scene.sys.settings.key !== 'exploration')
    objects.push(...drawFrogVisitor(scene, { left: artLeft, top: artUpper, width: artW, height: artH }));
  if (id === 'palais_de_givre' && scene.sys.settings.key !== 'exploration')
    objects.push(...drawYetiVisitor(scene, { left: artLeft, top: artUpper, width: artW, height: artH }));
  if (id === 'vestiges_celestes' && scene.sys.settings.key !== 'exploration')
    objects.push(...drawGriffinVisitor(scene, { left: artLeft, top: artUpper, width: artW, height: artH }));
  if (id === 'royaume_des_spores_celestes' && scene.sys.settings.key !== 'exploration')
    objects.push(...drawDragonVisitor(scene, { left: artLeft, top: artUpper, width: artW, height: artH }));
  if (id === 'ruines_englouties' && scene.sys.settings.key !== 'exploration')
    objects.push(...drawAxolotlVisitor(scene, { left: artLeft, top: artUpper, width: artW, height: artH }));
  if (id === 'empire_des_sables' && scene.sys.settings.key !== 'exploration')
    objects.push(...drawFennecVisitor(scene, { left: artLeft, top: artUpper, width: artW, height: artH }));
  if (id === 'faille_des_contraires' && scene.sys.settings.key !== 'exploration')
    objects.push(...drawRiftSteam(scene, { left: artLeft, top: artUpper, width: artW, height: artH },
      progressStore.explorationSteps('faille_des_contraires').length === 2));
  if (id === 'empire_des_sables' && scene.sys.settings.key !== 'exploration')
    objects.push(...drawEmpireSmoke(scene, { left: artLeft, top: artUpper, width: artW, height: artH },
      progressStore.explorationSteps('empire_des_sables').length === 1));
  if (id === 'jardins_de_gemmes' && scene.sys.settings.key !== 'exploration')
    objects.push(...drawGardenLight(scene, { left: artLeft, top: artUpper, width: artW, height: artH },
      progressStore.explorationSteps('jardins_de_gemmes')));
  if (id === 'jungle_incandescente' && scene.sys.settings.key !== 'exploration')
    objects.push(...drawFruitPulse(scene, { left: artLeft, top: artUpper, width: artW, height: artH },
      progressStore.explorationSteps('jungle_incandescente').length === 2));
  if (id === 'mer_figee' && scene.sys.settings.key !== 'exploration')
    objects.push(...drawGlobeSnow(scene, { left: artLeft, top: artUpper, width: artW, height: artH },
      progressStore.explorationSteps('mer_figee').length === 3));
  if (id === 'foret_du_silence' && scene.sys.settings.key !== 'exploration')
    objects.push(...drawForestVisitor(scene, { left: artLeft, top: artUpper, width: artW, height: artH }));
  if (scene.sys.settings.key !== 'exploration')
    objects.push(...drawCollectedAtmosphere(scene, id, {
      left: artLeft, top: artUpper, width: artW, height: artH,
    }, progressStore.unlockedSouvenirIds().includes(id)));
  const corners = scene.add.graphics().setName('arrival-photo-corners');
  if (id === 'vestiges_celestes' && scene.sys.settings.key !== 'exploration')
    objects.push(...drawVestigesMist(scene, { left: artLeft, top: artUpper, width: artW, height: artH },
      progressStore.explorationSteps('vestiges_celestes').length === 3));
  corners.fillStyle(0xc7aa72, 0.65).fillTriangle(artLeft - 12, artUpper - 12, artLeft + 15, artUpper - 12, artLeft - 12, artUpper + 15);
  corners.fillTriangle(artLeft + artW + 12, artUpper + artH + 16,
    artLeft + artW - 15, artUpper + artH + 16, artLeft + artW + 12, artUpper + artH - 11);
  objects.push(corners);
  if (enter && !reducedMotion()) {
    const finish = arriveObjects(scene, objects, { x: artX, y: artY },
      { x: artX - 12, y: artY + 25, scale: 0.94, alpha: 0, angle: -2 }, 520);
    scene.events.once('shutdown', finish);
  }
  return { portrait, short, sideX, sideW,
    art: { left: artLeft, top: artUpper, width: artW, height: artH },
    bodyY: portrait ? artUpper + artH + 31 : title.y + title.height / 2 + (short ? 8 : 28),
    stickerY: portrait ? h - 112 : short ? h - 107 : h - 159,
    primaryY: portrait || short ? h - 45 : h - 89,
    secondaryY: portrait || short ? h - 45 : h - 46 };
}
