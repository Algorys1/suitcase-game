import Phaser from 'phaser';
import { progressStore } from '../../services/storage';
import { getTexts, translate } from '../../services/i18n';
import { souvenirs } from '../../domain/souvenirs';
import { createButton } from './menu';
import { mapText } from './adventureMap';
import { drawMyceliaLife } from './pilotWorlds';
import { bookBusy } from './notebookMotion';

/** Collected stickers travel with the journal; attempts never spend a charge. */
export function journalPouch(scene: Phaser.Scene, destination: string, refresh: () => void): void {
  const picture = scene.children.getByName(`postcard-${destination}`) as Phaser.GameObjects.Image | null;
  if (!picture) return;
  const copy = getTexts().pouch;
  const bounds = picture.getBounds();
  const frame = { left: bounds.x, top: bounds.y, width: bounds.width, height: bounds.height };
  // The spyglass has a generous rectangular target, including empty space above its shaft.
  // Residents painted in that space must receive the click before the instrument does.
  for (const name of ['forest-visitor', 'city-visitor', 'sea-visitor', 'marsh-visitor', 'palace-visitor', 'vestiges-visitor', 'kingdom-visitor', 'ruins-visitor']) {
    const resident = scene.children.getByName(name);
    if (resident) scene.children.bringToTop(resident);
  }
  if (destination === 'foret_du_silence' && progressStore.read().welcomedForestVisitor) return;
  if (destination === 'cite_immobile' && progressStore.read().welcomedCityVisitor) return;
  if (destination === 'recif_de_verre' && progressStore.read().welcomedReefVisitor) return;
  if (destination === 'marais_des_lucioles' && progressStore.read().welcomedMarshVisitor) return;
  if (destination === 'palais_de_givre' && progressStore.read().welcomedPalaceVisitor) return;
  if (destination === 'vestiges_celestes' && progressStore.read().welcomedVestigesVisitor) return;
  if (destination === 'royaume_des_spores_celestes' && progressStore.read().welcomedKingdomVisitor) return;
  if (destination === 'ruines_englouties' && progressStore.read().welcomedRuinsVisitor) return;
  if (destination === 'empire_des_sables' && progressStore.read().welcomedEmpireVisitor) return;
  if (destination === 'observatoire_des_etoiles' && progressStore.read().welcomedObservatoryVisitor) return;
  if (destination === 'mer_figee' && progressStore.read().welcomedSeaVisitor) return;
  if (destination === 'mycelia' && progressStore.read().awakenedMycelia) {
    const greet = drawMyceliaLife(scene, frame, true, false, progressStore.explorationSteps('mycelia'));
    const resident = scene.children.getByName('mycelia-resident') as Phaser.GameObjects.Image | null;
    resident?.setInteractive().on('pointerdown', () => { if (!bookBusy(scene)) greet(); });
    const bx = bounds.x + bounds.width * 0.68, hook = bounds.y + bounds.height * 0.53;
    scene.add.graphics().lineStyle(Math.max(1, bounds.width * 0.0025), 0x735136)
      .beginPath().moveTo(bounds.x + bounds.width * 0.705, bounds.y + bounds.height * 0.505)
      .lineTo(bounds.x + bounds.width * 0.697, bounds.y + bounds.height * 0.518)
      .lineTo(bx, hook).strokePath();
    const bell = scene.add.image(bx, hook, 'souvenir-cimes_eternelles')
      .setOrigin(0.5, 0.07).setName('journal-offered-bell');
    bell.setScale(bounds.height * 0.11 / bell.height);
    return;
  }
  let selected: string | undefined;
  let overlay: Phaser.GameObjects.GameObject[] = [];
  let page = 0;
  let choose: ((index: number) => void) | undefined;
  const close = () => { overlay.forEach(part => part.destroy()); overlay = []; };
  const label = mapText(scene, scene.scale.width / 2, scene.scale.height - 18, '', 13,
    scene.scale.width - 40).setName('pouch-instruction');
  const target = scene.add.zone(bounds.centerX, bounds.centerY, bounds.width, bounds.height)
    .setName('journal-sticker-target');
  target.on('pointerdown', () => {
    if (!selected || bookBusy(scene) || overlay.length) return;
    const accepted = progressStore.offerSouvenir(selected, destination);
    selected = undefined;
    target.disableInteractive();
    if (accepted) refresh();
    else label.setText(copy.returned);
  });
  const open = () => {
    if (bookBusy(scene)) return;
    close(); selected = undefined; target.disableInteractive(); label.setText('');
    const before = new Set(scene.children.getAll());
    const w = Math.min(540, scene.scale.width - 32), h = Math.min(330, scene.scale.height - 40);
    const x = scene.scale.width / 2, y = scene.scale.height / 2, left = x - w / 2, top = y - h / 2;
    scene.add.rectangle(x, y, scene.scale.width, scene.scale.height, 0x30251f, 0.5).setInteractive();
    // Kraft envelope, folded flap and stitched edges, matching the journal's papers.
    const paper = scene.add.graphics();
    paper.fillStyle(0x513725, 0.25).fillRoundedRect(left + 3, top + 5, w, h, 4)
      .fillStyle(0xd9b67f).fillRoundedRect(left, top, w, h, 4)
      .lineStyle(1, 0x957044).strokeRoundedRect(left, top, w, h, 4)
      .fillStyle(0xe9cda0).fillTriangle(left, top, left + w, top, x, top + 50);
    for (let i = 12; i < w - 12; i += 9) paper.lineStyle(1, 0x987347, 0.5)
      .lineBetween(left + i, top + h - 8, left + i + 4, top + h - 8);
    mapText(scene, x, top + 25, copy.title, 22, w - 80).setFontStyle('bold');
    const owned = souvenirs.filter(item => progressStore.unlockedSouvenirIds().includes(item.destinationId));
    const perPage = 6, columns = 3, cellW = (w - 24) / columns, cellH = (h - 110) / 2;
    choose = index => {
      const item = owned[page * perPage + index];
      if (!item) return;
      selected = item.destinationId; close(); label.setText(copy.try); target.setInteractive();
    };
    if (!owned.length) mapText(scene, x, y, copy.empty, 16, w - 40);
    owned.slice(page * perPage, (page + 1) * perPage).forEach((item, index) => {
      const cx = left + 12 + cellW * (index % columns + 0.5);
      const cy = top + 55 + cellH * (Math.floor(index / columns) + 0.5);
      const image = scene.add.image(cx, cy - 10, `souvenir-${item.destinationId}`);
      image.setScale(Math.min((cellW - 24) / image.width, Math.max(24, cellH - 32) / image.height));
      mapText(scene, cx, cy + cellH / 2 - 15, `${index + 1}. ${translate(item.nameKey)}`, 12, cellW - 12);
      scene.add.zone(cx, cy, cellW - 6, cellH).setInteractive().on('pointerdown', () => {
        choose?.(index);
      });
    });
    const button = (cx: number, text: string, action: () => void, disabled = false) =>
      createButton(scene, cx, top + h - 27, w / 3 - 12, 44,
        { label: text, action, disabled, textOnly: true, fontSize: 14 });
    button(left + w / 6, '←', () => { page--; open(); }, page === 0);
    button(x, copy.close, close);
    button(left + w * 5 / 6, '→', () => { page++; open(); }, (page + 1) * perPage >= owned.length);
    overlay = scene.children.getAll().filter(part => !before.has(part));
  };
  createButton(scene, bounds.x + 65, bounds.bottom - 22, 124, 44,
    { name: 'open-pouch', label: copy.title, action: open, stationery: true, fontSize: 14 });
  const key = (event: KeyboardEvent) => {
    if (bookBusy(scene) || event.ctrlKey || event.altKey || event.metaKey) return;
    if (event.key.toLowerCase() !== 'p' && !overlay.length && !selected) return;
    event.preventDefault(); event.stopImmediatePropagation();
    if (event.key === 'Escape') { close(); selected = undefined; target.disableInteractive(); label.setText(''); }
    else if (event.key.toLowerCase() === 'p') open();
    else if (overlay.length && /^[1-6]$/.test(event.key)) choose?.(Number(event.key) - 1);
    else if (overlay.length && event.key === 'ArrowLeft' && page > 0) { page--; open(); }
    else if (overlay.length && event.key === 'ArrowRight'
      && (page + 1) * 6 < progressStore.unlockedSouvenirIds().length) { page++; open(); }
    else if (selected && (event.key === 'Enter' || event.key === ' ')) target.emit('pointerdown');
  };
  scene.game.canvas.addEventListener('keydown', key, true);
  target.once('destroy', () => scene.game.canvas.removeEventListener('keydown', key, true));
}
