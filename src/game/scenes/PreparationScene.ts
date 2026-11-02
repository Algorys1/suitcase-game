import Phaser from 'phaser';
import { getTexts } from '../../services/i18n';
import { isReady, selectElement } from '../../domain/preparation';
import { compassAngle, compassElements, elementAtAngle, initialCompassSelection, rotateSelection } from '../../domain/compassSelection';
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
  private dial = { x: 0, y: 0, radius: 1 };
  private drag: { pointerId: number; needle: SlotIndex; offset: number; angle: number } | null = null;

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
    this.drag = null;
    this.cameras.main.resetFX();
    const canvas = this.game.canvas;
    canvas.setAttribute('aria-label', getTexts().preparation.title);
    canvas.tabIndex = 0;
    canvas.focus({ preventScroll: true });
    canvas.addEventListener('keydown', this.onKeyDown);
    canvas.addEventListener('touchcancel', this.finishDrag);
    window.addEventListener('blur', this.finishDrag);
    this.input.on('pointermove', this.moveNeedle, this);
    this.input.on('pointerup', this.releaseNeedle, this);
    this.input.on('pointerupoutside', this.releaseNeedle, this);
    this.input.on('gameout', this.finishDrag);
    this.render();
    this.scale.on(Phaser.Scale.Events.RESIZE, this.onResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.onResize, this);
      this.input.off('pointermove', this.moveNeedle, this);
      this.input.off('pointerup', this.releaseNeedle, this);
      this.input.off('pointerupoutside', this.releaseNeedle, this);
      this.input.off('gameout', this.finishDrag);
      canvas.removeEventListener('touchcancel', this.finishDrag);
      window.removeEventListener('blur', this.finishDrag);
      canvas.style.cursor = '';
      this.drag = null;
      canvas.removeEventListener('keydown', this.onKeyDown);
      canvas.removeAttribute('tabindex');
      canvas.removeAttribute('aria-description');
      this.controls = [];
    });
  }

  private onResize(): void {
    this.drag = null;
    this.game.canvas.style.cursor = '';
    this.render();
  }

  private grabNeedle(index: SlotIndex, pointer: Phaser.Input.Pointer): void {
    if (this.drag || this.session.phase !== 'preparation' || !pointer.primaryDown) return;
    const id = this.slots[index];
    if (id === null) return;
    const angle = compassAngle(id);
    const bearing = Math.atan2(pointer.x - this.dial.x, this.dial.y - pointer.y) * 180 / Math.PI;
    this.drag = { pointerId: pointer.id, needle: index, offset: bearing - angle, angle };
    this.activeNeedle = index;
    this.focusName = `needle-${index}`;
    this.game.canvas.focus({ preventScroll: true });
    this.render();
    this.game.canvas.style.cursor = 'grabbing';
  }

  private moveNeedle(pointer: Phaser.Input.Pointer): void {
    if (!this.drag || pointer.id !== this.drag.pointerId) return;
    if (!pointer.isDown) { this.finishDrag(); return; }
    const dx = pointer.x - this.dial.x;
    const dy = pointer.y - this.dial.y;
    // Ignore the pivot's dead zone, where a tiny motion would flip direction.
    if (Math.hypot(dx, dy) < Math.max(16, this.dial.radius * 0.14)) return;
    this.drag.angle = Math.atan2(dx, -dy) * 180 / Math.PI - this.drag.offset;
    const element = elementAtAngle(this.drag.angle);
    if (element === null) return;
    this.slots = selectElement(this.slots, this.drag.needle, element);
    this.message = '';
    this.render();
    this.game.canvas.style.cursor = 'grabbing';
  }

  private releaseNeedle(pointer: Phaser.Input.Pointer): void {
    if (this.drag?.pointerId === pointer.id) this.finishDrag();
  }

  private finishDrag = (): void => {
    if (!this.drag) return;
    this.drag = null;
    this.game.canvas.style.cursor = '';
    this.render();
  };

  private chooseNeedle(index: SlotIndex): void {
    this.activeNeedle = index;
    this.message = '';
    this.render();
  }

  private rotate(direction: -1 | 1, needle: SlotIndex = this.activeNeedle): void {
    if (this.session.phase !== 'preparation') return;
    this.activeNeedle = needle;
    this.slots = rotateSelection(this.slots, needle, direction);
    this.message = '';
    this.render();
  }

  private chooseElement(element: ElementId): void {
    if (this.drag || this.session.phase !== 'preparation') return;
    this.slots = selectElement(this.slots, this.activeNeedle, element);
    this.message = '';
    this.render();
  }

  private depart(): void {
    if (this.drag) return;
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
    if (this.drag) {
      if (event.key === 'Escape') this.finishDrag();
      event.preventDefault();
      return;
    }
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
      this.focusName = `needle-${this.activeNeedle}`;
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
    const disabled = options.disabled || this.session.phase !== 'preparation' || this.drag !== null;
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
    const caseHeight = split ? Math.min(short ? 110 : 220, height - 230)
      : Math.min(150, 100 + Math.max(0, height - 568) * 0.25);
    const caseTop = statusY - caseHeight - 8;
    const dialTop = short ? 86 : 100;
    const dialBottom = split ? Math.min(height - 120, 520) : caseTop - 70;
    const radius = Math.min(190, (dialWidth - 32) / 2, (dialBottom - dialTop) / 2);
    const dialY = (dialTop + dialBottom) / 2;
    this.dial = { x: dialX, y: dialY, radius };
    // Twelve cells: ten elements and the two step controls kept in the fallback.
    const paletteColumns = short ? 4 : 3;
    const paletteHeight = Math.ceil(compassElements.length / paletteColumns) * 50 - 6;
    const needleY = dialY + Math.max(radius, paletteHeight / 2) + 36;
    const ready = isReady(this.slots);
    const status = this.message || (ready ? copy.ready : compassCopy.duplicate);

    const background = this.add.graphics();
    background.fillStyle(0xb69ae8, 0.12).fillCircle(width * 0.12, height * 0.25, 160);
    background.fillStyle(0x59c9c2, 0.12).fillCircle(width * 0.95, height * 0.8, 180);
    this.text(width / 2, 8, copy.title, short || !split ? 23 : 32, contentWidth, true);
    this.text(width / 2, short || !split ? 39 : 48,
      this.paletteVisible ? compassCopy.paletteInstructions : compassCopy.instructions,
      short || !split ? 13 : 17, contentWidth);

    // Selection labels also choose the active needle for keyboard and fallback palette.
    const controlButtonWidth = Math.min(250, (dialWidth - 12) / 2);
    for (const index of [0, 1] as const) {
      const id = this.slots[index];
      const name = id === null ? copy.empty : texts.elements[id].name;
      this.button(dialX + (index === 0 ? -1 : 1) * (controlButtonWidth + 12) / 2,
        needleY, controlButtonWidth, {
          name: `needle-${index}`, label: `${NEEDLE_MARKS[index]} ${index + 1} · ${name}`,
          fontSize: controlButtonWidth < 160 ? 13 : 17, selected: this.activeNeedle === index,
          action: () => this.chooseNeedle(index),
        });
    }
    if (this.paletteVisible) {
      const columns = paletteColumns;
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
      for (const [index, direction] of [[10, -1], [11, 1]] as const) {
        this.button(dialX - dialWidth / 2 + tileWidth / 2 + (index % columns) * (tileWidth + 8),
          paletteTop + 22 + Math.floor(index / columns) * 50, tileWidth, {
            name: direction === -1 ? 'previous' : 'next',
            label: direction === -1 ? compassCopy.turnPrevious : compassCopy.turnNext,
            fontSize: 22, action: () => this.rotate(direction),
          });
      }
    } else {
      drawCompass(this, dialX, dialY, radius, this.slots, this.activeNeedle, texts.elements, {
        disabled: this.session.phase !== 'preparation' || this.drag !== null,
        dragAngle: this.drag?.angle ?? null,
        grab: (index, pointer) => this.grabNeedle(index, pointer),
        select: id => this.chooseElement(id),
      });
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
      const hint = this.text(dialX, needleY + 34, compassCopy.keyboard, 14, dialWidth).setName('keyboard-hint');
      if (hint.y + hint.height > footerY - 30) hint.destroy();
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
