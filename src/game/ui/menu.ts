import Phaser from 'phaser';
import { getTexts } from '../../services/i18n';
import { drawPostcard } from './postcard';
import { drawNotebook, drawDiamond, revealPostcard } from './notebook';
import { drawSouvenir } from './souvenir';
import type { Souvenir } from '../../domain/souvenirs';

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
};

type MenuContent = {
  title: string;
  description: string;
  caption?: string;
  detail?: string;
  reveal?: 'new' | 'revisit';
  home?: boolean;
  dark?: boolean;
  footer?: string;
  postcard?: number;
  souvenir?: Souvenir;
  buttons: MenuButton[];
};

const fontFamily = '"Trebuchet MS", Arial, sans-serif';
const ink = 0x302a37;

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
  const title = text(top + padding + (spacious ? 52 : 0), content.title,
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
    wordWrap: { width: width - (button.stationery ? 36 : 12), useAdvancedWrap: true },
  }).setOrigin(0.5).setPadding(2);
  const target = scene.add.zone(x, y, width, height).setName(button.name ?? button.label);
  if (!button.disabled) target.setInteractive({ useHandCursor: true });
  let pressed = false;

  const draw = (hover = false): void => {
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
      if (button.focused) {
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
  const texts = getTexts();
  scene.game.canvas.setAttribute('aria-label', content.title);
  const canvas = scene.game.canvas;
  canvas.tabIndex = 0;
  canvas.focus({ preventScroll: true });
  let focusIndex = -1;
  let firstRender = true;
  let stopReveal: (() => void) | undefined;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const render = (): void => {
    stopReveal?.();
    stopReveal = undefined;
    scene.children.removeAll(true);
    if (content.postcard !== undefined) {
      stopReveal = renderPostcardMenu(scene, content, content.postcard, focusIndex,
        firstRender && content.reveal !== undefined && !motion.matches);
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
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'Tab') {
      let next = focusIndex < 0 ? (event.shiftKey ? content.buttons.length - 1 : 0)
        : focusIndex + (event.shiftKey ? -1 : 1);
      while (content.buttons[next]?.disabled) next += event.shiftKey ? -1 : 1;
      focusIndex = content.buttons[next] ? next : -1;
      if (focusIndex >= 0) event.preventDefault();
      render();
    } else if (event.key === 'Enter' || event.key === ' ') {
      const button = content.buttons[focusIndex];
      if (button && !button.disabled) { event.preventDefault(); button.action(); }
    }
  };
  canvas.addEventListener('keydown', onKeyDown);
  scene.scale.on(Phaser.Scale.Events.RESIZE, render);
  const onMotionChange = (): void => { if (motion.matches) render(); };
  motion.addEventListener('change', onMotionChange);
  const dispose = (): void => {
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
