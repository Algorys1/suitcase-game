import Phaser from 'phaser';
import { getTexts } from '../../services/i18n';
import { drawPostcard } from './postcard';
import { drawNotebook, drawDiamond, revealPostcard } from './notebook';
import { drawSouvenir } from './souvenir';
import type { Souvenir } from '../../domain/souvenirs';
import { drawPreparationDesk } from './preparationArt';
import { bookBusy, turnJournalPage } from './notebookMotion';
import type { PageDirection } from './notebookMotion';

export type MenuButton = {
  label: string;
  action: () => void;
  primary?: boolean;
  disabled?: boolean;
  selected?: boolean;
  focused?: boolean;
  fontSize?: number;
  name?: string;
  labelOffsetY?: number;
  stationery?: boolean;
  plateColor?: number;
  plateAngle?: number;
  plateHeight?: number;
  textOnly?: boolean;
  pageCorner?: 'previous' | 'next';
};

type MenuContent = {
  title: string;
  description: string;
  caption?: string;
  detail?: string;
  reveal?: 'new' | 'revisit';
  home?: boolean;
  preferences?: { stamp: boolean };
  dark?: boolean;
  footer?: string;
  postcard?: number;
  souvenir?: Souvenir;
  buttons: MenuButton[];
  bookNavigation?: { previous: MenuButton; next: MenuButton; turn?: PageDirection };
};

const fontFamily = '"Trebuchet MS", Arial, sans-serif';
const ink = 0x302a37;

/** A travel form on the same desk, with language labels and a live ink stamp. */
function renderPreferencesMenu(scene: Phaser.Scene, content: MenuContent, focusIndex: number,
  animate: boolean): (() => void) | undefined {
  const { width, height } = scene.scale;
  const portrait = width < 600;
  const short = height < 450;
  const ratio = portrait ? 3 / 4 : 4 / 3;
  const sheetHeight = Math.min(height - 24, (width - 24) / ratio, 640);
  const sheetWidth = sheetHeight * ratio;
  const center = width / 2;
  const top = (height - sheetHeight) / 2;
  const textWidth = sheetWidth * 0.76;
  const texts = getTexts();
  drawPreparationDesk(scene, width, height);
  const key = `settings-${portrait ? 'portrait' : 'landscape'}`;
  if (scene.textures.exists(key)) {
    const sheet = scene.add.image(center, height / 2, key).setName('settings-stationery');
    sheet.setScale(Math.min(sheetWidth / sheet.width, sheetHeight / sheet.height)).setAngle(0.7);
  } else {
    const paper = scene.add.graphics().setPosition(center, height / 2).setAngle(1).setName('settings-paper-fallback');
    paper.fillStyle(0x5e422b, 0.16).fillRoundedRect(-sheetWidth * 0.46, -sheetHeight * 0.45 + 5,
      sheetWidth * 0.92, sheetHeight * 0.9, 5);
    paper.fillStyle(0xfff4df).lineStyle(1, 0xb59a70, 0.5)
      .fillRoundedRect(-sheetWidth * 0.46, -sheetHeight * 0.45, sheetWidth * 0.92, sheetHeight * 0.9, 5)
      .strokeRoundedRect(-sheetWidth * 0.46, -sheetHeight * 0.45, sheetWidth * 0.92, sheetHeight * 0.9, 5);
    paper.fillStyle(0xb58b4c).fillRoundedRect(-16, -sheetHeight * 0.47, 32, 22, 4);
  }
  const words = (y: number, value: string, size: number, name: string, color = '#65452e') =>
    scene.add.text(center, y, value, { fontFamily, fontSize: size, color, align: 'center',
      wordWrap: { width: textWidth, useAdvancedWrap: true } }).setOrigin(0.5, 0).setPadding(2).setName(name);
  // A small compass sketch leaves the painted sheet free of language-specific art.
  const compassY = top + sheetHeight * (portrait ? 0.14 : 0.15);
  const compassX = center - sheetWidth * 0.30;
  const doodle = scene.add.graphics().lineStyle(1, 0xa5814e, 0.8);
  doodle.strokeCircle(compassX, compassY, 10).strokeCircle(compassX, compassY, 13);
  doodle.fillStyle(0x79506b).fillTriangle(compassX, compassY - 8, compassX - 3, compassY + 3, compassX + 3, compassY + 3);
  doodle.lineStyle(1, 0xa5814e).lineBetween(compassX, compassY + 3, compassX, compassY + 9);
  const title = words(top + sheetHeight * (portrait ? 0.18 : 0.21), texts.preferences.title,
    Math.min(short ? 26 : 36, textWidth / 10), 'menu-title', '#513322');
  title.setFontFamily('Georgia, "Times New Roman", serif').setFontStyle('bold');
  const description = words(Math.max(title.y + title.height + (short ? 5 : 10), top + sheetHeight * 0.34),
    content.description, short || portrait ? 14 : 17, 'menu-description');

  const gap = portrait ? 12 : 22;
  const ticketWidth = Math.min(224, (textWidth - gap) / 2);
  const ticketHeight = short ? 72 : portrait ? 82 : 92;
  const ticketY = Math.max(top + sheetHeight * 0.54, description.y + description.height + 14 + ticketHeight / 2);
  let animatedStamp: Phaser.GameObjects.Container | undefined;
  content.buttons.slice(0, 2).forEach((button, index) => {
    const x = center + (index === 0 ? -1 : 1) * (ticketWidth + gap) / 2;
    const left = x - ticketWidth / 2;
    const y = ticketY - ticketHeight / 2;
    const tag = scene.add.graphics().setName(`${button.name}-ticket`);
    tag.fillStyle(0x785339, 0.13).fillRoundedRect(left, y + 3, ticketWidth, ticketHeight, 3);
    tag.fillStyle(button.selected ? 0xf2dfb8 : 0xfaf0dc).lineStyle(1, 0xa98a5f, 0.65)
      .fillRoundedRect(left, y, ticketWidth, ticketHeight, 3).strokeRoundedRect(left, y, ticketWidth, ticketHeight, 3);
    tag.lineStyle(1, 0xbea075, 0.45).lineBetween(left + 9, y + ticketHeight - 7, left + ticketWidth - 9, y + ticketHeight - 7);
    // The punched corners and a faint ruled line evoke a luggage label.
    for (const side of [-1, 1]) {
      tag.fillStyle(0xd6bd91).fillCircle(x + side * (ticketWidth / 2 - 8), y + 8, 2);
    }
    createButton(scene, x, ticketY, ticketWidth, ticketHeight, { ...button, focused: index === focusIndex,
      textOnly: true, labelOffsetY: -ticketHeight * 0.19, fontSize: portrait ? 16 : short ? 17 : 21 });
    if (!button.selected) return;
    const stampWidth = Math.min(ticketWidth - 16, 116);
    const print = scene.add.graphics().lineStyle(2, 0x794663, 0.88);
    print.strokeRoundedRect(-stampWidth / 2, -14, stampWidth, 28, 5);
    print.lineStyle(0.7, 0x794663, 0.65).strokeRoundedRect(-stampWidth / 2 + 3, -11, stampWidth - 6, 22, 3);
    print.lineStyle(2, 0x794663).beginPath().moveTo(-stampWidth / 2 + 10, 0)
      .lineTo(-stampWidth / 2 + 14, 4).lineTo(-stampWidth / 2 + 21, -5).strokePath();
    const label = scene.add.text(9, 0, texts.preferences.selected, {
      fontFamily, fontSize: portrait ? 10 : 12, fontStyle: 'bold', color: '#794663',
    }).setOrigin(0.5).setPadding(2);
    const stamp = scene.add.container(x, ticketY + ticketHeight * 0.21, [print, label])
      .setAngle(-7).setAlpha(0.92).setName('language-stamp');
    if (animate) animatedStamp = stamp;
  });
  const footer = words(Math.max(top + sheetHeight * 0.70, ticketY + ticketHeight / 2 + 14),
    content.footer ?? '', portrait || short ? 11 : 13, 'settings-saved');
  const back = content.buttons[2];
  if (back) createButton(scene, center, Math.max(top + sheetHeight * 0.84, footer.y + footer.height + 34),
    Math.min(textWidth, 270), 44,
    { ...back, focused: focusIndex === 2, stationery: true, fontSize: portrait || short ? 15 : 18 });
  if (!animatedStamp) return undefined;
  const stamp = animatedStamp;
  const y = stamp.y;
  stamp.setScale(1.35).setAlpha(0).setY(y - 7);
  const tween = scene.tweens.add({ targets: stamp, scaleX: 1, scaleY: 1, alpha: 0.92, y, duration: 190, ease: 'Quad.Out' });
  return () => { tween.stop(); stamp.setScale(1).setAlpha(0.92).setY(y); };
}

/** A departure table, with a separate portrait composition and localized live text. */
function renderHomeMenu(scene: Phaser.Scene, content: MenuContent, focusIndex: number): void {
  const { width, height } = scene.scale;
  const landscape = width >= 600;
  const short = height < 450;
  const innerWidth = Math.min(width - 40, 1160);
  const left = (width - innerWidth) / 2;
  const columnWidth = landscape ? innerWidth * 0.44 : Math.min(innerWidth, 440);
  const center = landscape ? left + columnWidth / 2 : width / 2;
  drawPreparationDesk(scene, width, height);

  const ornament = scene.add.graphics();
  ornament.lineStyle(1, 0x9a7041, 0.35).strokeRoundedRect(10, 10, width - 20, height - 20, 8);
  const words = (y: number, value: string, size: number, color = '#65452e') => scene.add.text(center, y, value, {
    fontFamily, fontSize: size, color, align: 'center',
    wordWrap: { width: columnWidth - 8, useAdvancedWrap: true },
  }).setOrigin(0.5, 0).setPadding(2);
  words(landscape ? height * 0.10 : 22, getTexts().eyebrow, short || !landscape ? 10 : 11)
    .setName('home-eyebrow');
  const titleY = landscape ? height * 0.19 : 50;
  const title = scene.add.text(center, titleY, getTexts().homeTitle, {
    fontFamily: 'Georgia, "Times New Roman", serif', fontStyle: 'bold',
    fontSize: landscape ? Math.min(short ? 31 : 48, columnWidth / 8.3) : width < 360 ? 29 : 34,
    color: '#513322', align: 'center', lineSpacing: 1,
  }).setOrigin(0.5, 0).setPadding(3).setName('menu-title');
  const ruleY = title.y + title.height + (short ? 8 : 15);
  ornament.lineStyle(1, 0xaa7c43, 0.65)
    .lineBetween(center - 45, ruleY, center - 12, ruleY)
    .lineBetween(center + 12, ruleY, center + 45, ruleY);
  ornament.fillStyle(0xaa7c43);
  drawDiamond(ornament, center, ruleY, 4);
  const description = words(ruleY + (short ? 9 : 14), content.description, short || !landscape ? 14 : 17)
    .setName('menu-description');

  const startY = landscape ? height * 0.69 : height - 166;
  const buttonWidth = Math.min(columnWidth - 12, 282);
  const buttonHeight = short ? 44 : 48;
  const journalY = startY + (short ? 49 : 57);
  const settingsY = height - 33;
  const positions = [startY, journalY, settingsY];

  const artKey = scene.textures.exists('home-departure') ? 'home-departure' : 'preparation-suitcase_closed';
  if (scene.textures.exists(artKey)) {
    const artTop = landscape ? height * 0.14 : description.y + description.height + 10;
    const artBottom = landscape ? height * 0.87 : startY - buttonHeight / 2 - 14;
    const artWidth = landscape ? innerWidth * 0.55 : Math.min(innerWidth, 460);
    const artX = landscape ? left + innerWidth * 0.735 : center;
    const art = scene.add.image(artX, (artTop + artBottom) / 2, artKey).setName('home-departure');
    art.setScale(Math.min(artWidth / art.width, Math.max(0, artBottom - artTop) / art.height));
  }

  content.buttons.forEach((button, index) => createButton(scene,
    landscape && index === 2 ? width - 110 : center, positions[index] ?? settingsY,
    index === 2 ? Math.min(buttonWidth, 170) : buttonWidth, buttonHeight,
    { ...button, focused: index === focusIndex, stationery: index === 0, textOnly: index !== 0,
      fontSize: index === 2 ? 14 : short ? 16 : 18 }));
  if (content.footer) {
    words(journalY + buttonHeight / 2 + 1, content.footer, short || width < 360 ? 11 : 12)
      .setName('home-progress');
  }
}

/** Art-led layout shared by a travel result and its permanent journal entry. */
function renderPostcardMenu(scene: Phaser.Scene, content: MenuContent, postcard: number, focusIndex: number,
  animate: boolean): (() => void) | undefined {
  const { width, height } = scene.scale;
  const landscape = width >= 700 || (width >= 580 && height < 450);
  const short = height < 450;
  const panelWidth = Math.min(width - 32, 1040);
  const panelHeight = Math.min(height - 32, 720);
  const left = (width - panelWidth) / 2;
  const top = (height - panelHeight) / 2;
  const padding = short ? 16 : 20;
  const gap = short ? 10 : 14;
  const innerWidth = panelWidth - padding * 2;
  const artWidth = landscape ? panelWidth / 2 - padding * 2 : innerWidth;
  const textWidth = artWidth;
  const textX = landscape ? left + panelWidth * 0.75 : width / 2;
  drawNotebook(scene, left, top, panelWidth, panelHeight,
    landscape ? left + panelWidth / 2 : undefined);
  const words: Array<Phaser.GameObjects.Text | Phaser.GameObjects.Graphics> = [];
  const text = (y: number, value: string, size: number, bold = false) => scene.add.text(textX, y, value, {
    fontFamily, fontSize: size, fontStyle: bold ? 'bold' : 'normal', color: '#302a37',
    align: 'center', wordWrap: { width: textWidth - 4, useAdvancedWrap: true },
  }).setOrigin(0.5, 0).setPadding(2);
  const spacious = landscape && !short;
  if (spacious) {
    text(top + padding + 6, getTexts().journal, 12).setColor('#806748').setName('postcard-eyebrow');
  }
  const title = text(top + padding + (spacious ? 52 : content.bookNavigation ? 32 : 0), content.title,
    short ? 22 : landscape ? 30 : 24, true).setName('menu-title');
  words.push(title);
  let contentTop = title.y + title.height + gap;
  if (content.caption) {
    const badge = scene.add.graphics();
    const caption = text(contentTop + 3, content.caption, short ? 13 : 14, true).setName('postcard-caption');
    const badgeWidth = Math.min(textWidth, caption.width + 24);
    badge.fillStyle(content.reveal === 'new' ? 0xf1d79a : 0xe7deca)
      .fillRoundedRect(textX - badgeWidth / 2, contentTop, badgeWidth, caption.height + 6, 5);
    words.push(badge, caption);
    contentTop = caption.y + caption.height + 8;
  }
  if (content.detail) {
    const detail = text(contentTop, content.detail, short ? 12 : 13).setColor('#705b45').setName('postcard-detail');
    words.push(detail);
    contentTop = detail.y + detail.height + gap;
  }
  const buttonHeight = 44;
  const buttonGap = 10;
  const footerSpace = content.footer ? 28 : 0;
  const buttonsTop = top + panelHeight - padding - footerSpace
    - content.buttons.length * (buttonHeight + buttonGap) + buttonGap;
  const description = text(0, content.description, short ? 14 : 16).setName('menu-description');
  words.push(description);
  const souvenirHeight = content.souvenir
    ? landscape ? Math.min(spacious ? 136 : 64, Math.max(0, buttonsTop - contentTop - description.height - gap * 2)) : 70
    : 0;
  const souvenirSpace = content.souvenir ? souvenirHeight + gap : 0;
  let artX: number;
  let artY: number;
  let fittedWidth: number;
  let artHeight: number;
  if (landscape) {
    const extraGap = Math.max(0, Math.min(spacious ? 32 : 12,
      buttonsTop - contentTop - description.height - gap - souvenirSpace));
    description.setY(contentTop + extraGap);
    if (extraGap >= 20) {
      const ornament = scene.add.graphics().fillStyle(0xb58b4c);
      drawDiamond(ornament, textX, contentTop + 6, 4);
      ornament.lineStyle(1, 0xb58b4c, 0.55).lineBetween(textX - 46, contentTop + 6, textX - 12, contentTop + 6);
      ornament.lineBetween(textX + 12, contentTop + 6, textX + 46, contentTop + 6);
      words.push(ornament);
    }
    artHeight = Math.min(panelHeight - padding * 2 - 8, (artWidth - 8) * 0.75 + 8);
    fittedWidth = (artHeight - 8) * 4 / 3 + 8;
    artX = left + panelWidth / 4;
    artY = top + (panelHeight - artHeight) / 2;
  } else {
    const availableHeight = Math.max(0, buttonsTop - contentTop - description.height - gap * 2 - souvenirSpace);
    artHeight = Math.min(availableHeight, (artWidth - 8) * 0.75 + 8);
    fittedWidth = Math.min(artWidth, Math.max(0, artHeight - 8) * 4 / 3 + 8);
    artX = width / 2;
    artY = contentTop;
    description.setY(contentTop + artHeight + gap);
  }
  const art = drawPostcard(scene, artX, artY, fittedWidth, artHeight, postcard, true);
  const souvenir = content.souvenir ? drawSouvenir(scene, content.souvenir, textX,
    description.y + description.height + gap, textWidth, souvenirHeight, content.reveal === 'new') : [];
  content.buttons.forEach((button, index) => createButton(scene, textX,
    buttonsTop + buttonHeight / 2 + index * (buttonHeight + buttonGap), Math.min(textWidth, 240), buttonHeight,
    { ...button, focused: index === focusIndex, fontSize: short ? 16 : 18, stationery: true }));
  if (content.footer) {
    text(top + panelHeight - padding - 18, content.footer, 11).setName('postcard-footer');
  }
  if (content.bookNavigation) {
    [content.bookNavigation.previous, content.bookNavigation.next].forEach((button, index) =>
      createButton(scene, index ? left + panelWidth - 24 : left + 24, top + 24, 44, 44,
        { ...button, pageCorner: index ? 'next' : 'previous', focused: focusIndex === content.buttons.length + index }));
  }
  if (animate) return revealPostcard(scene, art, words,
    { x: artX, y: artY, width: fittedWidth, height: artHeight }, content.reveal === 'new', souvenir);
  return undefined;
}

export function createButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  button: MenuButton,
): void {
  const background = scene.add.graphics();
  const label = scene.add.text(x, y + (button.labelOffsetY ?? 0), button.label, {
    fontFamily,
    fontSize: button.fontSize ?? (width < 300 ? 18 : 21),
    fontStyle: 'bold',
    color: button.disabled ? '#776e70' : button.stationery ? '#533d2b' : '#302a37',
    align: 'center',
    wordWrap: { width: width - (button.stationery && width >= 100 ? 36 : button.plateColor !== undefined ? 10 : 12), useAdvancedWrap: true },
  }).setOrigin(0.5).setPadding(2).setName(button.name ? `${button.name}-label` : '');
  const target = scene.add.zone(x, y, width, height).setName(button.name ?? button.label);
  if (!button.disabled) target.setInteractive({ useHandCursor: true });
  let pressed = false;

  const draw = (hover = false): void => {
    if (button.pageCorner) {
      const side = button.pageCorner === 'next' ? 1 : -1;
      label.setText(side === 1 ? '›' : '‹').setFontSize(27).setColor(button.disabled ? '#b9a88b' : '#79543f');
      background.clear().fillStyle(0x785339, 0.10)
        .fillTriangle(x + side * 20, y - 20, x + side * 20, y + 10, x - side * 10, y - 20);
      background.fillStyle(hover && !button.disabled ? 0xe2c18b : 0xeddbb8, button.disabled ? 0.4 : 1)
        .fillTriangle(x + side * 18, y - 19, x + side * 18, y + 8, x - side * 9, y - 19);
      if (button.focused) background.lineStyle(2, 0x79543f).strokeRoundedRect(x - 21, y - 21, 42, 42, 5);
      return;
    }
    if (button.plateColor !== undefined || button.textOnly) {
      background.clear();
      const plateHeight = button.plateHeight ?? 22;
      label.setColor(button.disabled ? '#857460' : button.textOnly ? '#533d2b' : '#573520');
      if (button.plateColor !== undefined) {
        // Copper and its recess are painted into the suitcase asset.
        // Only the localized engraving and interaction feedback are rendered here.
        background.setPosition(x, y).setAngle(button.plateAngle ?? 0);
        label.setWordWrapWidth(0).setAngle(button.plateAngle ?? 0);
        label.setScale(Math.min(1, (width - 6) / label.width), 0.9);
        label.setShadow(0, 1, '#edbb87', 0, false, true);
        if (button.selected || button.focused || hover) {
          const half = Math.min(16, width * 0.18);
          background.lineStyle(button.focused ? 2 : 1, button.plateColor, button.disabled ? 0.3 : 0.85)
            .lineBetween(-half, plateHeight * 0.4, half, plateHeight * 0.4);
        }
        label.setY(y);
        return;
      } else if (hover && !button.disabled) {
        background.lineStyle(1, 0x533d2b, 0.8)
          .lineBetween(x - label.width / 2, y + (button.labelOffsetY ?? 0) + label.height / 2 + 2,
            x + label.width / 2, y + (button.labelOffsetY ?? 0) + label.height / 2 + 2);
      }
      if (button.focused) {
        background.lineStyle(2, button.textOnly ? 0x79543f : 0xf1d496).strokeRoundedRect(x - width / 2 - 2, y - height / 2, width + 4, height, 9);
      }
      label.setY(y + (button.labelOffsetY ?? 0) + (pressed ? 1 : 0));
      return;
    }
    if (button.stationery) {
      background.clear();
      const left = x - width / 2;
      const top = y - height / 2 + (pressed ? 1 : 0);
      // Fixed irregular edges keep the torn silhouette stable during interaction.
      const paperPath = (offsetY: number): void => {
        const steps = Math.ceil(width / 7);
        background.beginPath().moveTo(left + 1, top + offsetY + 2);
        for (let i = 1; i <= steps; i++) {
          background.lineTo(left + width * i / steps, top + offsetY + ((i * 17 + i * i) % 13) * 0.25);
        }
        for (let i = 1; i <= 6; i++) {
          background.lineTo(left + width - (i * 7 % 5) * 0.65, top + offsetY + height * i / 6);
        }
        for (let i = steps - 1; i >= 0; i--) {
          background.lineTo(left + width * i / steps, top + offsetY + height - ((i * 11 + i * i) % 13) * 0.25);
        }
        for (let i = 5; i > 0; i--) {
          background.lineTo(left + (i * 11 % 5) * 0.65, top + offsetY + height * i / 6);
        }
        background.closePath();
      };
      background.fillStyle(0x654729, 0.14);
      paperPath(3);
      background.fillPath();
      background.fillStyle(button.disabled ? 0xe2d8c4 : pressed ? 0xdcc197 : hover ? 0xf5dfb5 : 0xead2aa);
      background.lineStyle(1, 0x99754c, hover || pressed ? 0.85 : 0.4);
      paperPath(0);
      background.fillPath().strokePath();
      // Tape only at the upper-right and lower-left corners.
      for (const side of [-1, 1]) {
        const edge = -side;
        const cx = x + side * (width / 2 - 6);
        const cy = top + height / 2 + edge * (height / 2 - 5);
        const angle = -side * edge * Math.PI / 4;
        const points = [[-13, -4], [-10, -5], [12, -4], [11, -1], [13, 4], [-12, 5], [-11, 1]];
        background.fillStyle(0xd0b77f, 0.52).lineStyle(1, 0xfff4d1, 0.65).beginPath();
        points.forEach(([px = 0, py = 0], index) => {
          const tx = cx + px * Math.cos(angle) - py * Math.sin(angle);
          const ty = cy + px * Math.sin(angle) + py * Math.cos(angle);
          if (index === 0) background.moveTo(tx, ty); else background.lineTo(tx, ty);
        });
        background.closePath().fillPath().strokePath();
      }
      if (hover && !button.disabled) {
        background.lineStyle(1, 0x79543f, 0.7).lineBetween(x - label.width / 2, top + height - 8, x + label.width / 2, top + height - 8);
      }
      if (button.focused || button.selected) {
        background.lineStyle(2, 0x634827).strokeRoundedRect(x - width / 2 - 3, y - height / 2 - 3, width + 6, height + 6, 10);
      }
      label.setY(y + (pressed ? 1 : 0));
      return;
    }
    const fill = button.primary
      ? (hover ? 0x7bd9d2 : 0x59c9c2)
      : (hover ? 0xeee3fa : 0xfffaf0);
    background.clear();
    background.fillStyle(0x79543f, 0.12);
    background.fillRoundedRect(x - width / 2, y - height / 2 + 4, width, height, 14);
    background.fillStyle(button.disabled ? 0xe5dfd6 : pressed || button.selected ? 0xb69ae8 : fill);
    background.fillRoundedRect(x - width / 2, y - height / 2, width, height, 14);
    background.lineStyle(hover || pressed || button.selected ? 3 : 1.5, ink,
      hover || pressed || button.selected ? 0.85 : 0.3);
    background.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 14);
    if (button.focused) {
      background.lineStyle(3, ink);
      background.strokeRoundedRect(x - width / 2 - 4, y - height / 2 - 4, width + 8, height + 8, 17);
    }
    label.setY(y + (button.labelOffsetY ?? 0) + (pressed ? 2 : 0));
  };

  target.on('pointerover', () => draw(true));
  target.on('pointerout', () => { pressed = false; draw(); });
  target.on('pointerdown', () => { pressed = true; draw(true); });
  target.on('pointerup', () => {
    const activate = pressed;
    pressed = false;
    draw();
    if (activate) button.action();
  });
  draw();
}

/** Reflow at native canvas size to keep text and touch targets readable. */
export function createMenu(scene: Phaser.Scene, content: MenuContent): () => void {
  scene.data.set('book-busy', false);
  const texts = getTexts();
  scene.game.canvas.setAttribute('aria-label', content.title);
  const canvas = scene.game.canvas;
  canvas.tabIndex = 0;
  canvas.focus({ preventScroll: true });
  let focusIndex = -1;
  let firstRender = true;
  let stopReveal: (() => void) | undefined;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const controls = content.bookNavigation
    ? [...content.buttons, content.bookNavigation.previous, content.bookNavigation.next] : content.buttons;
  let stopTurn: (() => void) | undefined;

  const render = (): void => {
    stopTurn?.();
    stopTurn = undefined;
    stopReveal?.();
    stopReveal = undefined;
    scene.children.getAll().forEach(child => child.destroy());
    if (content.home) {
      renderHomeMenu(scene, content, focusIndex);
      firstRender = false;
      return;
    }
    if (content.preferences) {
      stopReveal = renderPreferencesMenu(scene, content, focusIndex,
        firstRender && content.preferences.stamp && !motion.matches);
      firstRender = false;
      return;
    }
    if (content.postcard !== undefined) {
      stopReveal = renderPostcardMenu(scene, content, content.postcard, focusIndex,
        firstRender && content.reveal !== undefined && !motion.matches);
      if (firstRender && content.bookNavigation?.turn) stopTurn = turnJournalPage(scene, content.bookNavigation.turn);
      firstRender = false;
      return;
    }
    const { width, height } = scene.scale;
    const compact = height < 600;
    const panelWidth = Math.min(width - 32, 760);
    const panelHeight = Math.min(height - 32, 620);
    const left = (width - panelWidth) / 2;
    const top = (height - panelHeight) / 2;
    const center = width / 2;
    const availableTextWidth = panelWidth - 32;

    const backdrop = scene.add.graphics();
    backdrop.fillStyle(0xb69ae8, 0.16);
    backdrop.fillCircle(width * 0.12, height * 0.2, Math.min(width * 0.18, 160));
    backdrop.fillStyle(0x59c9c2, 0.16);
    backdrop.fillCircle(width * 0.9, height * 0.8, Math.min(width * 0.22, 200));
    backdrop.fillStyle(0x79543f, 0.08);
    backdrop.fillRoundedRect(left, top + 6, panelWidth, panelHeight, 24);
    backdrop.fillStyle(content.dark ? 0x2f2f4e : 0xfffaf0);
    backdrop.fillRoundedRect(left, top, panelWidth, panelHeight, 24);
    backdrop.lineStyle(1.5, 0xc78b60, 0.45);
    backdrop.strokeRoundedRect(left, top, panelWidth, panelHeight, 24);

    if (!compact) {
      scene.add.text(center, top + 32, texts.eyebrow, {
        fontFamily, fontSize: width < 520 ? 11 : 14, color: content.dark ? '#eee3fa' : '#79543f',
      }).setOrigin(0.5, 0);
    }

    const title = scene.add.text(center, top + (compact ? 22 : 84), content.title, {
      fontFamily,
      fontSize: compact ? 26 : width < 520 ? 32 : 46,
      fontStyle: 'bold',
      color: content.dark ? '#fff4df' : '#302a37',
      align: 'center',
      wordWrap: { width: Math.min(availableTextWidth, 640), useAdvancedWrap: true },
    }).setOrigin(0.5, 0).setPadding(2).setName('menu-title');

    if (!compact || !content.home) {
      scene.add.text(center, title.y + title.height + 18, content.description, {
        fontFamily,
        fontSize: compact ? 17 : 20,
        color: content.dark ? '#eee3fa' : '#79543f',
        align: 'center',
        wordWrap: { width: Math.min(availableTextWidth, 490), useAdvancedWrap: true },
      }).setOrigin(0.5, 0).setPadding(2).setName('menu-description');
    }

    const buttonHeight = compact ? 48 : 58;
    const gap = compact ? 12 : 16;
    const buttonWidth = Math.min(panelWidth - 32, 360);
    const buttonsHeight = content.buttons.length * (buttonHeight + gap) - gap;
    const buttonsTop = top + panelHeight - (compact ? 26 : 68) - buttonsHeight;
    content.buttons.forEach((button, index) => {
      createButton(scene, center, buttonsTop + buttonHeight / 2 + index * (buttonHeight + gap),
        buttonWidth, buttonHeight, { ...button, focused: index === focusIndex });
    });

    if (!compact || content.footer) {
      scene.add.text(center, top + panelHeight - (compact ? 12 : 26), content.footer ?? texts.prototype, {
        fontFamily, fontSize: width < 520 ? 12 : 14, color: content.dark ? '#eee3fa' : '#79543f',
      }).setOrigin(0.5);
    }
  };

  render();
  const onKeyDown = (event: KeyboardEvent): void => {
    if (bookBusy(scene)) return;
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'Tab') {
      let next = focusIndex < 0 ? (event.shiftKey ? controls.length - 1 : 0)
        : focusIndex + (event.shiftKey ? -1 : 1);
      while (controls[next]?.disabled) next += event.shiftKey ? -1 : 1;
      focusIndex = controls[next] ? next : -1;
      if (focusIndex >= 0) event.preventDefault();
      render();
    } else if (event.key === 'Enter' || event.key === ' ') {
      const button = controls[focusIndex];
      if (button && !button.disabled) { event.preventDefault(); button.action(); }
    } else if (content.bookNavigation && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
      const button = event.key === 'ArrowLeft' ? content.bookNavigation.previous : content.bookNavigation.next;
      if (!button.disabled) { event.preventDefault(); button.action(); }
    }
  };
  canvas.addEventListener('keydown', onKeyDown);
  scene.scale.on(Phaser.Scale.Events.RESIZE, render);
  const onMotionChange = (): void => { if (motion.matches) render(); };
  motion.addEventListener('change', onMotionChange);
  const dispose = (): void => {
    stopTurn?.();
    stopReveal?.();
    motion.removeEventListener('change', onMotionChange);
    scene.scale.off(Phaser.Scale.Events.RESIZE, render);
    scene.events.off(Phaser.Scenes.Events.SHUTDOWN, dispose);
    canvas.removeEventListener('keydown', onKeyDown);
    canvas.removeAttribute('tabindex');
  };
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, dispose);
  return dispose;
}
