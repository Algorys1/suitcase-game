import Phaser from 'phaser';
import { getTexts } from '../../services/i18n';
import { isReady, selectElement } from '../../domain/preparation';
import { compassElements, initialCompassSelection, rotateSelection } from '../../domain/compassSelection';
import type { ElementId, SlotIndex, Slots } from '../../domain/preparation';
import { createButton } from '../ui/menu';
import type { MenuButton } from '../ui/menu';
import { drawSuitcase } from '../ui/suitcase';
import { drawClosedSuitcase } from '../ui/suitcase';
import { drawCompass, NEEDLE_MARKS } from '../ui/compass';
import { beginTravel, createSession, revealResult } from '../../domain/session';
import type { SessionState } from '../../domain/session';
import { BALANCE } from '../../domain/compass';
import { progressStore } from '../../services/storage';

type Control = { name: string; action: () => void };

export class PreparationScene extends Phaser.Scene {
  private slots: Slots = initialCompassSelection();
  private activeNeedle: SlotIndex = 0;
  private paletteVisible = false;
  private message = '';
  private focusName: string | null = null;
  private controls: Control[] = [];
  private session: SessionState = createSession();

  constructor() { super('preparation'); }

  create({ session }: { session?: SessionState } = {}): void {
    this.session = session ?? createSession();
    if (this.session.phase !== 'preparation' || this.session.charges <= 0) {
      this.scene.start('home');
      return;
    }
    this.slots = initialCompassSelection();
    this.activeNeedle = 0;
    this.paletteVisible = false;
    this.message = '';
    this.focusName = null;
    this.cameras.main.resetFX();
    const canvas = this.game.canvas;
    canvas.setAttribute('aria-label', getTexts().preparation.title);
    canvas.tabIndex = 0;
    canvas.focus({ preventScroll: true });
    canvas.addEventListener('keydown', this.onKeyDown);
    this.render();
    this.scale.on(Phaser.Scale.Events.RESIZE, this.render, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.render, this);
      canvas.removeEventListener('keydown', this.onKeyDown);
      canvas.removeAttribute('tabindex');
      canvas.removeAttribute('aria-description');
      this.controls = [];
    });
  }

  private chooseNeedle(index: SlotIndex): void {
    this.activeNeedle = index;
    this.message = '';
    this.render();
  }

  private rotate(direction: -1 | 1): void {
    this.slots = rotateSelection(this.slots, this.activeNeedle, direction);
    this.message = '';
    this.render();
  }

  private chooseElement(element: ElementId): void {
    this.slots = selectElement(this.slots, this.activeNeedle, element);
    this.message = '';
    this.render();
  }

  private depart(): void {
    const next = beginTravel(this.session, this.slots, progressStore.read().discoveredDestinationIds);
    if (next === this.session) return;
    this.session = next;
    if (next.lastTrip?.destinationId !== null && next.lastTrip?.destinationId !== undefined) {
      progressStore.discover(next.lastTrip.destinationId);
    }
    this.message = getTexts().journey.departing;
    this.render();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reducedMotion) this.cameras.main.fadeOut(350, 182, 154, 232);
    this.time.delayedCall(reducedMotion ? 0 : 350, () => {
      this.scene.start('result', { session: revealResult(this.session) });
    });
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    if (this.session.phase !== 'preparation') { event.preventDefault(); return; }
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const index = this.controls.findIndex(control => control.name === this.focusName);
    if (event.key === 'Tab') {
      const next = index < 0 ? (event.shiftKey ? this.controls.length - 1 : 0) : index + (event.shiftKey ? -1 : 1);
      const control = this.controls[next];
      this.focusName = control?.name ?? null;
      // At either end, allow native Tab to leave the canvas (no keyboard trap).
      if (control) event.preventDefault();
      this.render();
    } else if (event.key === '1' || event.key === '2') {
      event.preventDefault();
      const needle = event.key === '1' ? 0 : 1;
      this.focusName = `needle-${needle}`;
      this.chooseNeedle(needle);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      this.focusName = event.key === 'ArrowLeft' ? 'previous' : 'next';
      this.rotate(event.key === 'ArrowLeft' ? -1 : 1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.controls[index]?.action();
    }
  };

  private text(x: number, y: number, value: string, size: number, width: number, bold = false) {
    return this.add.text(x, y, value, {
      fontFamily: '"Trebuchet MS", Arial, sans-serif', fontSize: size,
      fontStyle: bold ? 'bold' : 'normal', color: '#302a37', align: 'center',
      wordWrap: { width, useAdvancedWrap: true },
    }).setOrigin(0.5, 0).setPadding(2);
  }

  private button(x: number, y: number, width: number, options: MenuButton & { name: string }): void {
    const disabled = options.disabled || this.session.phase !== 'preparation';
    if (!disabled) this.controls.push({ name: options.name, action: options.action });
    createButton(this, x, y, width, 44, {
      ...options, disabled, focused: this.focusName === options.name,
      action: () => {
        this.game.canvas.focus({ preventScroll: true });
        this.focusName = options.name;
        options.action();
      },
    });
  }

  private render(): void {
    const texts = getTexts();
    const copy = texts.preparation;
    const compassCopy = texts.compass;
    this.children.removeAll(true);
    this.controls = [];
    const { width, height } = this.scale;
    const split = width >= 600;
    const short = height < 500;
    const contentWidth = Math.min(width - 24, 1100);
    const left = (width - contentWidth) / 2;
    const dialWidth = split ? contentWidth * 0.48 : contentWidth;
    const dialX = split ? left + dialWidth / 2 : width / 2;
    const controlsWidth = split ? contentWidth - dialWidth - 20 : contentWidth;
    const controlsX = split ? left + contentWidth - controlsWidth / 2 : width / 2;
    const footerY = height - 32;
    const statusY = height - 104;
    const caseHeight = split ? Math.min(short ? 70 : 220, height - 280)
      : Math.min(150, 66 + Math.max(0, height - 568) * 0.35);
    const caseTop = statusY - caseHeight - 8;
    const stepY = split ? (short ? 156 : 184) : caseTop - 30;
    const needleY = stepY - 50;
    const dialBottom = split ? (short ? height - 70 : Math.min(height - 130, 560)) : needleY - 30;
    const dialTop = short ? 74 : 78;
    const dialY = (dialTop + dialBottom - 20) / 2;
    const radius = Math.max(70, Math.min(150, (dialWidth - 86) / 2, (dialBottom - dialTop - 24) / 2));
    const ready = isReady(this.slots);
    const status = this.message || (ready ? copy.ready : compassCopy.duplicate);

    const background = this.add.graphics();
    background.fillStyle(0xb69ae8, 0.12).fillCircle(width * 0.12, height * 0.25, 160);
    background.fillStyle(0x59c9c2, 0.12).fillCircle(width * 0.95, height * 0.8, 180);
    this.text(width / 2, 8, copy.title, short || !split ? 23 : 32, contentWidth, true);
    this.text(width / 2, short || !split ? 39 : 48, compassCopy.instructions, short || !split ? 13 : 17, contentWidth);

    // Register the four main commands first for a consistent keyboard focus order.
    const controlButtonWidth = Math.min(250, (controlsWidth - 12) / 2);
    for (const index of [0, 1] as const) {
      const id = this.slots[index];
      const name = id === null ? copy.empty : texts.elements[id].name;
      this.button(controlsX + (index === 0 ? -1 : 1) * (controlButtonWidth + 12) / 2,
        needleY, controlButtonWidth, {
          name: `needle-${index}`, label: `${NEEDLE_MARKS[index]} ${index + 1} · ${name}`,
          fontSize: controlButtonWidth < 160 ? 13 : 17, selected: this.activeNeedle === index,
          action: () => this.chooseNeedle(index),
        });
    }
    this.button(controlsX - (controlButtonWidth + 12) / 2, stepY, controlButtonWidth, {
      name: 'previous', label: compassCopy.previous, fontSize: 16, action: () => this.rotate(-1),
    });
    this.button(controlsX + (controlButtonWidth + 12) / 2, stepY, controlButtonWidth, {
      name: 'next', label: compassCopy.next, fontSize: 16, action: () => this.rotate(1),
    });

    if (this.paletteVisible) {
      const columns = dialWidth >= 380 ? 2 : 3;
      const rows = Math.ceil(compassElements.length / columns);
      const tileWidth = (dialWidth - (columns - 1) * 8) / columns;
      const paletteTop = dialY - (rows * 50 - 6) / 2;
      compassElements.forEach((id, index) => {
        this.button(dialX - dialWidth / 2 + tileWidth / 2 + (index % columns) * (tileWidth + 8),
          paletteTop + 22 + Math.floor(index / columns) * 50, tileWidth, {
            name: `element-${id}`, label: texts.elements[id].name, fontSize: tileWidth < 110 ? 12 : 16,
            selected: this.slots[this.activeNeedle] === id, action: () => this.chooseElement(id),
          });
      });
    } else {
      drawCompass(this, dialX, dialY, radius, this.slots, this.activeNeedle, texts.elements);
    }

    const suitcaseWidth = Math.min(controlsWidth, 580);
    let positions: ReturnType<typeof drawSuitcase> | null = null;
    if (this.session.phase === 'travelling') {
      drawClosedSuitcase(this, controlsX, caseTop, suitcaseWidth, caseHeight);
    } else {
      positions = drawSuitcase(this, controlsX, caseTop, suitcaseWidth, caseHeight);
    }
    for (const index of [0, 1] as const) {
      if (positions === null) break;
      const id = this.slots[index];
      this.text(positions[index].x, positions[index].y - 10,
        id === null ? copy.empty : texts.elements[id].name,
        suitcaseWidth < 350 ? 12 : 17, suitcaseWidth * 0.29, true).setName(`slot-label-${index}`);
    }
    const charges = texts.journey.charges.replace('{charges}', String(this.session.charges))
      .replace('{max}', String(BALANCE.initialCharges));
    this.text(controlsX, statusY, charges + '\n' + status, 13, controlsWidth).setName('preparation-status');
    if (split && height >= 600) {
      this.text(dialX, dialBottom + 24, compassCopy.keyboard, 14, dialWidth);
    }

    const footerWidth = Math.min(contentWidth, 650);
    const footerButtonWidth = (footerWidth - 16) / 3;
    this.button(width / 2 - footerButtonWidth - 8, footerY, footerButtonWidth, {
      name: 'home', label: copy.home, fontSize: 16, action: () => this.scene.start('home'),
    });
    this.button(width / 2, footerY, footerButtonWidth, {
      name: 'toggle-palette', label: this.paletteVisible ? compassCopy.compass : compassCopy.palette,
      fontSize: 15, action: () => { this.paletteVisible = !this.paletteVisible; this.render(); },
    });
    this.button(width / 2 + footerButtonWidth + 8, footerY, footerButtonWidth, {
      name: 'travel', label: copy.travel, fontSize: 16, primary: true, disabled: !ready,
      action: () => this.depart(),
    });
    this.game.canvas.setAttribute('aria-description', [
      charges, ...this.slots.map((id, index) => compassCopy.needle.replace('{number}', String(index + 1))
        + ': ' + (id === null ? copy.empty : texts.elements[id].name)), status, compassCopy.keyboard,
    ].join('. '));
  }
}
