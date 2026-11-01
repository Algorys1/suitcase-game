import Phaser from 'phaser';
import texts from '../../data/fr.json';
import { drawPostcard } from './postcard';

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
};

type MenuContent = {
  title: string;
  description: string;
  home?: boolean;
  dark?: boolean;
  footer?: string;
  postcard?: number;
  buttons: MenuButton[];
};

const fontFamily = '"Trebuchet MS", Arial, sans-serif';
const ink = 0x302a37;

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
    color: button.disabled ? '#776e70' : '#302a37',
    align: 'center',
    wordWrap: { width: width - 12, useAdvancedWrap: true },
  }).setOrigin(0.5).setPadding(2);
  const target = scene.add.zone(x, y, width, height).setName(button.name ?? button.label);
  if (!button.disabled) target.setInteractive({ useHandCursor: true });
  let pressed = false;

  const draw = (hover = false): void => {
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
  scene.game.canvas.setAttribute('aria-label', content.title);
  const canvas = scene.game.canvas;
  canvas.tabIndex = 0;
  canvas.focus({ preventScroll: true });
  let focusIndex = -1;

  const render = (): void => {
    scene.children.removeAll(true);
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

    let descriptionBottom = title.y + title.height;
    if (!compact || !content.home) {
      const description = scene.add.text(center, title.y + title.height + 18, content.description, {
        fontFamily,
        fontSize: compact ? 17 : 20,
        color: content.dark ? '#eee3fa' : '#79543f',
        align: 'center',
        wordWrap: { width: Math.min(availableTextWidth, 490), useAdvancedWrap: true },
      }).setOrigin(0.5, 0).setPadding(2).setName('menu-description');
      descriptionBottom = description.y + description.height;
    }

    const buttonHeight = compact ? 48 : 58;
    const gap = compact ? 12 : 16;
    const buttonWidth = Math.min(panelWidth - 32, 360);
    const buttonsHeight = content.buttons.length * (buttonHeight + gap) - gap;
    const buttonsTop = top + panelHeight - (compact ? 26 : 68) - buttonsHeight;
    const postcardHeight = Math.min(110, buttonsTop - descriptionBottom - 40);
    if (content.postcard !== undefined && postcardHeight >= 48) {
      drawPostcard(scene, center, descriptionBottom + 16, Math.min(availableTextWidth, 300), postcardHeight, content.postcard);
    }
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
  const dispose = (): void => {
    scene.scale.off(Phaser.Scale.Events.RESIZE, render);
    scene.events.off(Phaser.Scenes.Events.SHUTDOWN, dispose);
    canvas.removeEventListener('keydown', onKeyDown);
    canvas.removeAttribute('tabindex');
  };
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, dispose);
  return dispose;
}
