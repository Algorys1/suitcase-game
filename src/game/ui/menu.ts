import Phaser from 'phaser';
import texts from '../../data/fr.json';

export type MenuButton = {
  label: string;
  action: () => void;
  primary?: boolean;
  disabled?: boolean;
  selected?: boolean;
  focused?: boolean;
  fontSize?: number;
  name?: string;
};

type MenuContent = {
  title: string;
  description: string;
  home?: boolean;
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
  const label = scene.add.text(x, y, button.label, {
    fontFamily,
    fontSize: button.fontSize ?? (width < 300 ? 18 : 21),
    fontStyle: 'bold',
    color: button.disabled ? '#776e70' : '#302a37',
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
    label.setY(y + (pressed ? 2 : 0));
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
export function createMenu(scene: Phaser.Scene, content: MenuContent): void {
  scene.game.canvas.setAttribute('aria-label', content.title);

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
    backdrop.fillStyle(0xfffaf0);
    backdrop.fillRoundedRect(left, top, panelWidth, panelHeight, 24);
    backdrop.lineStyle(1.5, 0xc78b60, 0.45);
    backdrop.strokeRoundedRect(left, top, panelWidth, panelHeight, 24);

    if (!compact) {
      scene.add.text(center, top + 32, texts.eyebrow, {
        fontFamily, fontSize: width < 520 ? 11 : 14, color: '#79543f',
      }).setOrigin(0.5, 0);
    }

    const title = scene.add.text(center, top + (compact ? 22 : 84), content.title, {
      fontFamily,
      fontSize: compact ? 26 : width < 520 ? 32 : 46,
      fontStyle: 'bold',
      color: '#302a37',
      align: 'center',
      wordWrap: { width: Math.min(availableTextWidth, 640), useAdvancedWrap: true },
    }).setOrigin(0.5, 0).setPadding(2);

    if (!compact || !content.home) {
      scene.add.text(center, title.y + title.height + 18, content.description, {
        fontFamily,
        fontSize: compact ? 17 : 20,
        color: '#79543f',
        align: 'center',
        wordWrap: { width: Math.min(availableTextWidth, 490), useAdvancedWrap: true },
      }).setOrigin(0.5, 0).setPadding(2);
    }

    const buttonHeight = compact ? 48 : 58;
    const gap = compact ? 12 : 16;
    const buttonWidth = Math.min(panelWidth - 32, 360);
    const buttonsHeight = content.buttons.length * (buttonHeight + gap) - gap;
    const buttonsTop = top + panelHeight - (compact ? 26 : 68) - buttonsHeight;
    content.buttons.forEach((button, index) => {
      createButton(scene, center, buttonsTop + buttonHeight / 2 + index * (buttonHeight + gap),
        buttonWidth, buttonHeight, button);
    });

    if (!compact) {
      scene.add.text(center, top + panelHeight - 26, texts.prototype, {
        fontFamily, fontSize: width < 520 ? 12 : 14, color: '#79543f',
      }).setOrigin(0.5);
    }
  };

  render();
  scene.scale.on(Phaser.Scale.Events.RESIZE, render);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    scene.scale.off(Phaser.Scale.Events.RESIZE, render);
  });
}
