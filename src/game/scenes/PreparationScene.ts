import Phaser from 'phaser';
import elements from '../../data/elements.json';
import texts from '../../data/fr.json';
import { emptySlots, isElementId, isReady, placeElement, removeElement } from '../../domain/preparation';
import type { ElementId, SlotIndex, Slots } from '../../domain/preparation';
import { createButton } from '../ui/menu';
import { drawSuitcase } from '../ui/suitcase';

const copy = texts.preparation;
const fontFamily = '"Trebuchet MS", Arial, sans-serif';

export class PreparationScene extends Phaser.Scene {
  private slots: Slots = emptySlots();
  private selected: ElementId | null = null;
  private message = '';

  constructor() {
    super('preparation');
  }

  create(): void {
    this.slots = emptySlots();
    this.selected = null;
    this.message = '';
    this.game.canvas.setAttribute('aria-label', copy.title);
    this.render();
    this.scale.on(Phaser.Scale.Events.RESIZE, this.render, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.render, this);
    });
  }

  private place(index: SlotIndex): void {
    if (this.selected === null) {
      this.message = copy.choose;
    } else {
      const result = placeElement(this.slots, index, this.selected);
      this.slots = result.slots;
      this.message = result.ok ? '' : copy[result.reason];
      if (result.ok) this.selected = null;
    }
    this.render();
  }

  private text(x: number, y: number, value: string, size: number, width: number, bold = false) {
    return this.add.text(x, y, value, {
      fontFamily, fontSize: size, fontStyle: bold ? 'bold' : 'normal',
      color: '#302a37', align: 'center',
      wordWrap: { width, useAdvancedWrap: true },
    }).setOrigin(0.5, 0).setPadding(2);
  }

  private render(): void {
    this.children.removeAll(true);
    const { width, height } = this.scale;
    const split = width >= 900 || (width >= 600 && height < 600);
    const short = height < 600;
    const contentWidth = Math.min(width - 24, 1100);
    const left = (width - contentWidth) / 2;
    const footerY = height - 32;
    const paletteWidth = split ? (short ? contentWidth * 0.48 : 350) : contentWidth;
    const paletteX = split ? left + contentWidth - paletteWidth / 2 : width / 2;
    const columns = split && !short ? 2 : width >= 600 && !split ? 5 : 3;
    const tileHeight = split && !short ? 60 : 48;
    const gap = 6;
    const rows = Math.ceil(elements.length / columns);
    const paletteHeight = rows * (tileHeight + gap) - gap;
    const paletteTop = split ? (short ? 74 : Math.max(135, (height - paletteHeight) / 2))
      : footerY - 40 - paletteHeight;
    const caseWidth = split ? contentWidth - paletteWidth - 24 : contentWidth;
    const caseX = split ? left + caseWidth / 2 : width / 2;
    const statusTop = split ? height - 124 : paletteTop - 46;
    const caseTop = short ? 78 : 86;
    const availableCaseHeight = statusTop - caseTop - 52;
    const illustrationWidth = Math.min(caseWidth, 620);
    const illustrationTop = caseTop + Math.max(0, (availableCaseHeight - illustrationWidth * 270 / 520) / 2);
    const ready = isReady(this.slots);

    const background = this.add.graphics();
    background.fillStyle(0xb69ae8, 0.12).fillCircle(width * 0.12, height * 0.25, 160);
    background.fillStyle(0x59c9c2, 0.12).fillCircle(width * 0.95, height * 0.8, 180);
    this.text(width / 2, 10, copy.title, short ? 22 : width < 600 ? 24 : 32, contentWidth, true);
    this.text(width / 2, short ? 39 : width < 600 ? 43 : 51,
      this.selected ? copy.selected.replace('{element}', texts.elements[this.selected].name) : copy.instructions,
      short || width < 600 ? 14 : 17, contentWidth);

    const slotPositions = drawSuitcase(this, caseX, illustrationTop, illustrationWidth, availableCaseHeight);
    for (const index of [0, 1] as const) {
      const position = slotPositions[index];
      const element = this.slots[index];
      const targetWidth = Math.max(44, illustrationWidth * 0.29);
      const targetHeight = Math.max(44, Math.min(illustrationWidth * 0.13, availableCaseHeight * 0.25));
      const label = element ? texts.elements[element].name : copy.empty;
      this.text(position.x, position.y - 12, label, illustrationWidth < 350 ? 13 : 18, targetWidth, true);
      let pressed = false;
      this.add.zone(position.x, position.y, targetWidth, targetHeight)
        .setName(`slot-${index}`).setInteractive({ useHandCursor: true })
        .on('pointerdown', () => { pressed = true; })
        .on('pointerout', () => { pressed = false; })
        .on('pointerup', () => {
          if (pressed) this.place(index);
          pressed = false;
        });
      const removeX = caseX + (index === 0 ? -1 : 1) * caseWidth / 4;
      createButton(this, removeX, statusTop - 30, Math.min(150, caseWidth / 2 - 12), 44, {
        name: `remove-${index}`, label: `${copy.remove} ${index + 1}`, fontSize: 14,
        disabled: element === null,
        action: () => {
          this.slots = removeElement(this.slots, index);
          this.message = '';
          this.render();
        },
      });
    }

    this.text(caseX, statusTop, this.message || (ready ? copy.ready : copy.missing),
      14, caseWidth).setName('preparation-status');
    if (split && !short) {
      this.text(paletteX, paletteTop - 38, copy.palette, 22, paletteWidth, true);
    }
    const tileWidth = (paletteWidth - gap * (columns - 1)) / columns;
    elements.forEach(({ id }, index) => {
      if (!isElementId(id)) return;
      const selected = id === this.selected;
      const packed = this.slots.includes(id);
      const label = `${selected ? '› ' : packed ? '✓ ' : ''}${texts.elements[id].name}`;
      createButton(this,
        paletteX - paletteWidth / 2 + tileWidth / 2 + (index % columns) * (tileWidth + gap),
        paletteTop + tileHeight / 2 + Math.floor(index / columns) * (tileHeight + gap),
        tileWidth, tileHeight, {
          name: `element-${id}`, label, selected, fontSize: tileWidth < 110 ? 12 : 16,
          action: () => {
            this.selected = selected ? null : id;
            this.message = '';
            this.render();
          },
        });
    });

    const footerWidth = Math.min(contentWidth, 620);
    const buttonWidth = Math.min(220, (footerWidth - 16) / 2);
    createButton(this, width / 2 - (buttonWidth + 16) / 2, footerY, buttonWidth, 44, {
      label: copy.home, name: 'home', action: () => this.scene.start('home'),
    });
    createButton(this, width / 2 + (buttonWidth + 16) / 2, footerY, buttonWidth, 44, {
      label: copy.travel, name: 'travel', primary: true, disabled: !ready,
      action: () => {
        if (!isReady(this.slots)) return;
        this.message = copy.confirmed;
        this.render();
      },
    });
    if (split && !short) this.text(width / 2, height - 80, copy.scope, 12, contentWidth);
  }
}
