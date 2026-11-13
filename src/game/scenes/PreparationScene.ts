import { beginSceneLoading, finishSceneLoading, queueWorldAssets, sceneWorldIds, queuePreparationAssets } from '../ui/assetLoading';
import Phaser from 'phaser';
import { getTexts } from '../../services/i18n';
import { isReady, selectElement } from '../../domain/preparation';
import { compassAngle, elementAtAngle, initialCompassSelection, rotateSelection } from '../../domain/compassSelection';
import type { ElementId, SlotIndex, Slots } from '../../domain/preparation';
import { createButton } from '../ui/menu';
import type { MenuButton } from '../ui/menu';
import { drawCompass } from '../ui/compass';
import { beginTravel, createSession, revealResult } from '../../domain/session';
import type { SessionState } from '../../domain/session';
import { BALANCE } from '../../domain/compass';
import { progressStore } from '../../services/storage';
import { drawManifestation, drawSuitcaseCompass, drawSuitcaseInstruction, drawSuitcaseCharges } from '../ui/suitcaseCompass';
import { drawAdventureMap, mapDeparture, reducedMotion } from '../ui/adventureMap';
import { arriveObjects } from '../ui/travelMotion';
import { drawTravelNote, needsTravelTip } from '../ui/travelTutorial';
import { playSuitcaseDeparture } from '../ui/suitcaseDeparture';
import { playSound } from '../../services/audio';

type Control = { name: string; action: () => void };

export class PreparationScene extends Phaser.Scene {
  private slots: Slots = initialCompassSelection();
  private activeNeedle: SlotIndex = 0;
  private message = '';
  private gestureHelp = false;
  private lastTip = '';
  private focusName: string | null = null;
  private controls: Control[] = [];
  private session: SessionState = createSession();
  private dial = { x: 0, y: 0, radius: 1 };
  private drag: { pointerId: number; needle: SlotIndex; offset: number; angle: number } | null = null;
  private entering = false;
  private returning = false;
  private finishEntrance: (() => void) | null = null;
  private caseParts: Phaser.GameObjects.GameObject[] = [];
  private lidParts: Phaser.GameObjects.GameObject[] = [];
  private casePivot = { x: 0, y: 0, width: 1 };
  private suitcaseLayout: ReturnType<typeof drawSuitcaseCompass> | null = null;
  private mapBackground: Phaser.GameObjects.RenderTexture | null = null;
  private departure: ReturnType<typeof playSuitcaseDeparture> | null = null;

  constructor() { super('preparation'); }

  preload(): void {
    beginSceneLoading(this);
    queueWorldAssets(this, sceneWorldIds(this), true);
    queuePreparationAssets(this);
  }

  create({ session }: { session?: SessionState } = {}): void {
    if (!finishSceneLoading(this)) return;
    this.session = session ?? progressStore.read().expedition ?? createSession();
    if (this.session.phase !== 'preparation' || this.session.charges <= 0) {
      this.scene.start('home');
      return;
    }
    progressStore.saveSession(this.session);
    this.slots = initialCompassSelection();
    this.activeNeedle = 0;
    this.message = '';
    this.gestureHelp = false;
    this.lastTip = '';
    this.mapBackground = null;
    this.departure = null;
    this.focusName = null;
    this.drag = null;
    this.entering = false;
    this.returning = false;
    this.input.enabled = true;
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
    this.animateInstruments(false);
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
      this.departure?.cancel();
      this.departure = null;
      this.mapBackground = null;
      this.finishEntrance?.();
      this.finishEntrance = null;
      this.input.enabled = true;
    });
  }

  private onResize(): void {
    if (this.session.phase === 'travelling') { this.departure?.finish(); return; }
    if (this.returning) { this.scene.start('adventure', { session: this.session }); return; }
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
    if (this.session.phase !== 'preparation') return;
    this.activeNeedle = index;
    this.message = '';
    this.render();
  }

  private rotate(direction: -1 | 1, needle: SlotIndex = this.activeNeedle): void {
    if (this.session.phase !== 'preparation') return;
    this.activeNeedle = needle;
    playSound('tick');
    this.slots = rotateSelection(this.slots, needle, direction);
    this.message = '';
    this.render();
  }

  private chooseElement(element: ElementId): void {
    if (this.drag || this.session.phase !== 'preparation') return;
    playSound('tick');
    this.slots = selectElement(this.slots, this.activeNeedle, element);
    this.message = '';
    this.render();
  }

  private depart(): void {
    if (this.drag || this.entering || !this.suitcaseLayout) return;
    const before = this.session.charges;
    const next = beginTravel(this.session, this.slots, progressStore.read().discoveredDestinationIds);
    if (next === this.session) return;
    playSound('travel');
    progressStore.acknowledgeTutorial('needles');
    progressStore.acknowledgeTutorial('energy');
    this.session = next;
    progressStore.saveSession(next);
    this.input.enabled = false;
    this.controls = [];
    (this.children.getByName('preparation-status') as Phaser.GameObjects.Text | null)
      ?.setText(getTexts().journey.departing);
    for (const name of ['home-label', 'travel-label']) {
      (this.children.getByName(name) as Phaser.GameObjects.Text | null)?.setAlpha(0.45);
    }
    const showResult = () => {
      this.departure = null;
      this.scene.start('result', { session: revealResult(this.session), voidElements: this.slots });
    };
    if (reducedMotion()) { showResult(); return; }
    this.departure = playSuitcaseDeparture(this, this.suitcaseLayout, this.caseParts, this.lidParts,
      this.slots, before, next.charges, showResult);
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    if (this.entering) {
      if (event.key === 'Escape' && !this.returning) { this.finishEntrance?.(); this.finishEntrance = null; }
      event.preventDefault(); return;
    }
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
    return this.add.text(x, y, value, { resolution: 2,
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
    this.finishEntrance?.();
    this.finishEntrance = null;
    this.tweens.killAll();
    this.children.getAll().filter(child => child !== this.mapBackground).forEach(child => child.destroy());
    this.controls = [];
    const texts = getTexts(), copy = texts.preparation, compassCopy = texts.compass;
    const { width, height } = this.scale;
    const landscape = width >= 760 || (width >= 600 && height < 450);
    const short = height < 450;
    const ready = isReady(this.slots);
    if (ready && !this.drag && needsTravelTip('needles')) progressStore.acknowledgeTutorial('needles');
    const status = this.message || (ready ? copy.ready : compassCopy.duplicate);
    if (this.mapBackground && this.mapBackground.getData('viewport') !== `${width}x${height}`) {
      this.mapBackground.destroy();
      this.mapBackground = null;
    }
    if (!this.mapBackground) {
      drawAdventureMap(this, this.session);
      this.children.getAll().filter(child => child.type === 'Text').forEach(child => child.destroy());
      for (const name of ['next-suitcase-art', 'map-journal-art', 'energy-ticket',
        ...Array.from({ length: BALANCE.initialCharges }, (_, i) => `charge-badge-${i}`)]) {
        this.children.getByName(name)?.destroy();
      }
      const mapParts = this.children.getAll();
      const background = this.add.renderTexture(0, 0, width, height).setOrigin(0).setName('preparation-map-blur')
        .setData('viewport', `${width}x${height}`);
      // Phaser 4 buffers draw commands: flush before destroying the source objects.
      background.draw(mapParts).render();
      mapParts.forEach(child => child.destroy());
      if (this.game.renderer.type === Phaser.WEBGL) {
        background.enableFilters();
        background.filters?.external.addBlur(0, 2, 2, 1, 0xffffff, 3);
      }
      this.mapBackground = background;
    }
    this.add.rectangle(width / 2, height / 2, width, height, 0x30281f, 0.14).setName('preparation-scrim');

    const caseTop = 12;
    const maxHeight = height - (landscape ? 76 : 216);
    const suitcaseStart = this.children.length;
    const art = drawSuitcaseCompass(this, width / 2, caseTop, width - 36, maxHeight);
    this.suitcaseLayout = art;
    this.casePivot = { x: width / 2, y: caseTop + art.height / 2, width: art.width };
    this.dial = art.dial;
    const { x: dialX, y: dialY, radius } = art.dial;
    const compassStart = this.children.length;
    drawCompass(this, dialX, dialY, radius, this.slots, this.activeNeedle, texts.elements, {
      embedded: true, disabled: this.drag !== null, charged: this.session.charges > 0,
      dragAngle: this.drag?.angle ?? null,
      grab: (index, pointer) => this.grabNeedle(index, pointer), select: id => this.chooseElement(id),
    });
    this.lidParts = this.children.getAll().slice(compassStart);
    for (const index of [0, 1] as const) {
      const position = art.slots[index]!;
      const id = this.slots[index];
      if (id) drawManifestation(this, id, position.x, position.y, position.size, index);
      this.button(position.x, position.labelY, position.labelWidth, {
        name: `needle-${index}`, label: `${index === 0 ? '▲' : '◆'} ${id ? texts.elements[id].name : copy.empty}`,
        stationery: false, plateColor: index === 0 ? 0x78cdbb : 0xc2a0e4,
        plateHeight: 18, fontSize: position.labelWidth < 100 ? 11 : 14,
        selected: this.activeNeedle === index, action: () => this.chooseNeedle(index),
      });
    }
    drawSuitcaseCharges(this, art, this.session.charges);
    const tip = this.gestureHelp ? 'gestures' : ready ? 'energy' : 'needles';
    const showTip = this.gestureHelp || needsTravelTip(tip as 'energy' | 'needles');
    if (showTip) {
      const noteWidth = landscape ? Math.max(130, Math.min(240, (width - art.width) / 2 - 24)) : Math.min(360, width - 28);
      const noteX = landscape ? (width - art.width) / 4 : width / 2;
      const noteTop = landscape ? Math.max(24, height * 0.34 - 45) : art.top + art.height + 8;
      drawTravelNote(this, tip, () => { this.gestureHelp = false; this.render(); }, {
        x: noteX, top: noteTop, width: noteWidth, height: landscape ? Math.min(222, height - noteTop - 64) : height - noteTop - 94,
        animate: this.lastTip !== tip && !this.drag,
        button: (name, label, x, y, w, action) => this.button(x, y, w, { name, label, action, textOnly: true, fontSize: w < 110 ? 10 : 12 }),
      });
      this.lastTip = tip;
    } else drawSuitcaseInstruction(this, art, compassCopy.instructions);
    this.caseParts = this.children.getAll().slice(suitcaseStart).filter(child => !child.getData('travel-note'));

    const sideWidth = Math.max(110, Math.min(220, (width - art.width) / 2 - 28));
    const statusX = landscape ? width - (width - art.width) / 4 : width / 2;
    const statusY = landscape ? height * 0.43 : height - 88;
    this.text(statusX, statusY, status, short || !landscape ? 12 : 14, landscape ? sideWidth : width - 24)
      .setName('preparation-status');
    const footerWidth = Math.min(width - 24, 510), buttonWidth = (footerWidth - 16) / 2;
    const footerY = height - 28;
    this.button(width / 2 - (buttonWidth + 16) / 2, footerY, buttonWidth, {
      name: 'home', label: texts.adventure.backToMap, fontSize: landscape ? 14 : 12,
      action: () => this.animateInstruments(true),
    });
    this.button(width / 2 + (buttonWidth + 16) / 2, footerY, buttonWidth, {
      name: 'travel', label: copy.travel, fontSize: landscape ? 18 : 16, primary: true, disabled: !ready,
      action: () => this.depart(),
    });
    this.button(landscape ? statusX : width / 2, landscape ? statusY + 74 : height - 65, landscape ? sideWidth : 170, {
      name: 'gesture-help', label: texts.tutorial.commands, textOnly: true, fontSize: 12,
      action: () => { this.gestureHelp = !this.gestureHelp; this.render(); },
    });
    const charges = texts.journey.charges.replace('{charges}', String(this.session.charges))
      .replace('{max}', String(BALANCE.initialCharges));
    this.game.canvas.setAttribute('aria-description', [charges, ...this.slots.map((id, index) =>
      compassCopy.needle.replace('{number}', String(index + 1)) + ': ' + (id ? texts.elements[id].name : copy.empty)),
      status, compassCopy.keyboard, ...(showTip ? [texts.tutorial[tip]] : [])].join('. '));
  }

  private animateInstruments(reverse: boolean): void {
    if (this.entering) return;
    if (reducedMotion()) { if (reverse) this.scene.start('adventure', { session: this.session }); return; }
    const from = mapDeparture(this.scale.width, this.scale.height, this.session);
    this.entering = true;
    this.returning = reverse;
    this.input.enabled = false;
    const done = () => {
      this.entering = false;
      this.input.enabled = true;
      this.returning = false;
      this.finishEntrance = null;
      if (reverse) this.scene.start('adventure', { session: this.session });
    };
    const finish = arriveObjects(this, this.caseParts, this.casePivot,
      { x: from.x, y: from.y, scale: from.width / this.casePivot.width, alpha: 0 },
      reverse ? 260 : 360, done, reverse);
    this.finishEntrance = () => { finish(); this.entering = false; this.input.enabled = true; };
  }
}
