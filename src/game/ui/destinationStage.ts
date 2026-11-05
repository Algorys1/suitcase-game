import Phaser from 'phaser';
import type { SessionState } from '../../domain/session';
import { getDestinationTexts, getTexts } from '../../services/i18n';
import { drawAdventureMap, mapText, reducedMotion } from './adventureMap';
import { drawPreparationDesk } from './preparationArt';
import { arriveObjects } from './travelMotion';
import { drawPostcard } from './postcard';
import { destinations } from '../../domain/recipes';
import { worldTexture } from './worldTexture';

/** Shared framing keeps the landscape in place when the player chooses to explore. */
export function drawDestinationStage(scene: Phaser.Scene, id: string, session?: SessionState,
  enter = false) {
  const { width: w, height: h } = scene.scale;
  const portrait = w < 600, short = h < 450;
  if (session) drawAdventureMap(scene, session);
  else drawPreparationDesk(scene, w, h);
  // The map becomes a quiet tabletop beneath the postcard, without duplicate headings.
  scene.children.getAll().filter(child => child.type === 'Text').forEach(child => child.destroy());
  scene.add.rectangle(w / 2, h / 2, w, h, 0x382e28, 0.47).setName('destination-scrim');
  const paper = scene.add.graphics();
  const sideX = portrait ? w / 2 : w * 0.815;
  const sideW = portrait ? w - 38 : w * (short ? 0.335 : 0.31);
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
  const artTop = portrait ? Math.max(104, title.y + title.height / 2 + 15) : short ? 38 : 60;
  const artAreaW = portrait ? w - 44 : w * 0.615 - 28;
  const artAreaH = portrait ? Math.max(80, h - artTop - 264) : h - artTop - (short ? 38 : 53);
  const key = worldTexture(scene, id);
  let artW = artAreaW, artH = Math.min(artAreaH, artW * 0.75);
  if (scene.textures.exists(key)) {
    const frame = scene.textures.getFrame(key);
    const scale = Math.min(artAreaW / frame.width, artAreaH / frame.height);
    artW = frame.width * scale; artH = frame.height * scale;
  }
  const artX = portrait ? w / 2 - 2 : w * 0.315;
  const artY = portrait ? artTop + artH / 2 : h / 2;
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
  const corners = scene.add.graphics().setName('arrival-photo-corners');
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
