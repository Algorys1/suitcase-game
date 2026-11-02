import Phaser from 'phaser';
import { getTexts } from '../../services/i18n';
import { isReady, selectElement } from '../../domain/preparation';
import { compassAngle, compassElements, elementAtAngle, initialCompassSelection, rotateSelection } from '../../domain/compassSelection';
import type { ElementId, SlotIndex, Slots } from '../../domain/preparation';
import { createButton } from '../ui/menu';
import type { MenuButton } from '../ui/menu';
import { drawSuitcase } from '../ui/suitcase';
import { drawClosedSuitcase } from '../ui/suitcase';
import { drawCompass } from '../ui/compass';
import { beginTravel, createSession, revealResult } from '../../domain/session';
import type { SessionState } from '../../domain/session';
import { BALANCE } from '../../domain/compass';
import { progressStore } from '../../services/storage';
import { drawElement, drawPreparationDesk } from '../ui/preparationArt';
import { drawChargeVial } from '../ui/chargeVial';

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
      fontStyle: bold ? 'bold' : 'normal', color: '#493626', align: 'center',
      wordWrap: { width, useAdvancedWrap: true },
    }).setOrigin(0.5, 0).setPadding(2);
  }

  private button(x: number, y: number, width: number, options: MenuButton & { name: string }): void {
    const disabled = options.disabled || this.session.phase !== 'preparation' || this.drag !== null;
    if (!disabled) this.controls.push({ name: options.name, action: options.action });
    createButton(this, x, y, width, 44, {
      stationery: true, ...options, disabled, focused: this.focusName === options.name,
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
    // DisplayList.removeAll(true) only detaches objects in Phaser 4.
    // Destroy them to release text textures, input targets and event listeners.
    this.children.getAll().forEach(child => child.destroy());
    this.controls = [];
    const { width, height } = this.scale;
    const split = width >= 600;
    const short = height < 500;
    const contentWidth = Math.min(width - 32, 1100);
    const left = (width - contentWidth) / 2;
    const dialWidth = split ? contentWidth * (this.paletteVisible && short ? 0.62 : 0.44) : contentWidth;
    const dialX = split ? left + dialWidth / 2 : width / 2;
    const controlsWidth = split ? contentWidth - dialWidth - 20 : contentWidth;
    const controlsX = split ? left + contentWidth - controlsWidth / 2 : width / 2;
    const footerY = height - 30;
    const statusY = height - (split ? 86 : 104);
    const caseHeight = split ? Math.min(460, statusY - (short ? 76 : 90))
      : Math.min(205, Math.max(156, height * 0.26));
    const caseTop = statusY - caseHeight + (split ? -10 : 8);
    const vialHeight = split ? (short ? 60 : 90) : this.paletteVisible ? 44 : 64;
    const dialTop = short || !split ? 68 : 76;
    const dialBottom = split ? statusY - vialHeight + 6 : caseTop - vialHeight - 4;
    const radius = Math.min(198, (dialWidth - 20) / 2, (dialBottom - dialTop) / 2);
    const dialY = (dialTop + dialBottom) / 2;
    this.dial = { x: dialX, y: dialY, radius };
    // Twelve cells: ten elements and the two step controls kept in the fallback.
    const paletteColumns = short ? 4 : 3;
    const ready = isReady(this.slots);
    const status = this.message || (ready ? copy.ready : compassCopy.duplicate);

    drawPreparationDesk(this, width, height);
    this.text(width / 2, 8, copy.title, short || !split ? 23 : 30, contentWidth, true);
    this.text(width / 2, short || !split ? 39 : 46,
      this.paletteVisible ? compassCopy.paletteInstructions : compassCopy.instructions,
      short || !split ? 13 : 15, contentWidth).setColor('#68523e');

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
        charged: this.session.charges > 0,
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
      const position = positions[index];
      const figurine = id === null ? undefined : drawElement(this, id, position.x, position.y, position.size);
      figurine?.setOrigin(0.5, 1).setName(`slot-figurine-${index}`);
      // Copper inlays follow the front rim above the clasps and select each needle.
      const plateWidth = position.labelWidth;
      this.button(position.labelX, position.labelY, plateWidth, {
        name: `needle-${index}`, label: id === null ? copy.empty : texts.elements[id].name,
        stationery: false, plateColor: index === 0 ? 0x78cdbb : 0xc2a0e4,
        plateAngle: position.labelAngle, plateHeight: position.labelHeight,
        fontSize: plateWidth < 85 ? 10 : plateWidth < 115 ? 12 : 15,
        selected: this.activeNeedle === index, action: () => this.chooseNeedle(index),
      });
    }
    const charges = texts.journey.charges.replace('{charges}', String(this.session.charges))
      .replace('{max}', String(BALANCE.initialCharges));
    const paletteBottom = dialY + (Math.ceil(12 / paletteColumns) * 50 - 6) / 2;
    const vialTop = this.paletteVisible ? Math.max(dialY + radius - 8, paletteBottom + 4) : dialY + radius - 8;
    drawChargeVial(this, dialX, vialTop, vialHeight, this.session.charges, BALANCE.initialCharges,
      !this.paletteVisible);
    const count = compassCopy.chargeCount.replace('{charges}', String(this.session.charges))
      .replace('{max}', String(BALANCE.initialCharges));
    this.text(split ? dialX : dialX + 48, split ? vialTop + vialHeight - 1 : vialTop + 26,
      count, split ? 15 : 13, 72, true)
      .setName('preparation-charges');
    if (split) {
      this.text(controlsX, statusY, status, 13, controlsWidth).setName('preparation-status');
    } else this.text(controlsX, statusY + 12, status, 12, controlsWidth).setName('preparation-status');

    const footerWidth = Math.min(contentWidth, 650);
    const footerButtonWidth = (footerWidth - 16) / 3;
    this.button(width / 2 - footerButtonWidth - 8, footerY, footerButtonWidth, {
      name: 'home', label: copy.home, fontSize: split ? 16 : 13, action: () => this.scene.start('home'),
    });
    this.button(width / 2, footerY, footerButtonWidth, {
      name: 'toggle-palette', label: this.paletteVisible ? compassCopy.compass : compassCopy.palette,
      stationery: false, textOnly: true,
      fontSize: split ? 15 : 12, action: () => { this.paletteVisible = !this.paletteVisible; this.render(); },
    });
    this.button(width / 2 + footerButtonWidth + 8, footerY, footerButtonWidth, {
      name: 'travel', label: copy.travel, fontSize: split ? 18 : 13, primary: true, disabled: !ready,
      action: () => this.depart(),
    });
    this.game.canvas.setAttribute('aria-description', [
      charges, ...this.slots.map((id, index) => compassCopy.needle.replace('{number}', String(index + 1))
        + ': ' + (id === null ? copy.empty : texts.elements[id].name)), status, compassCopy.keyboard,
    ].join('. '));
  }
}
