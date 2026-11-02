import Phaser from 'phaser';
import { getTexts, getDestinationTexts } from '../../services/i18n';
import { destinations } from '../../domain/recipes';
import { progressStore } from '../../services/storage';
import { createButton } from '../ui/menu';
import type { MenuButton } from '../ui/menu';
import { drawPostcard } from '../ui/postcard';

type Control = { name: string; action: () => void };

export class JournalScene extends Phaser.Scene {
  private page = 0;
  private focusName: string | null = null;
  private controls: Control[] = [];

  constructor() { super('journal'); }

  create({ page = 0 }: { page?: number } = {}): void {
    this.page = Number.isInteger(page) && page >= 0 ? page : 0;
    this.focusName = null;
    const canvas = this.game.canvas;
    canvas.setAttribute('aria-label', getTexts().journal);
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

  private onKeyDown = (event: KeyboardEvent): void => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const index = this.controls.findIndex(control => control.name === this.focusName);
    if (event.key === 'Tab') {
      const next = index < 0 ? (event.shiftKey ? this.controls.length - 1 : 0) : index + (event.shiftKey ? -1 : 1);
      const control = this.controls[next];
      this.focusName = control?.name ?? null;
      if (control) event.preventDefault();
      this.render();
    } else if (event.key === 'Enter' || event.key === ' ') {
      if (this.controls[index]) { event.preventDefault(); this.controls[index]?.action(); }
    }
  };

  private text(x: number, y: number, value: string, size: number, width: number, bold = false): void {
    this.add.text(x, y, value, {
      fontFamily: '"Trebuchet MS", Arial, sans-serif', fontSize: size, color: '#302a37',
      fontStyle: bold ? 'bold' : 'normal', align: 'center', wordWrap: { width, useAdvancedWrap: true },
    }).setOrigin(0.5, 0).setPadding(2);
  }

  private button(x: number, y: number, width: number, height: number, options: MenuButton & { name: string }): void {
    if (!options.disabled) this.controls.push({ name: options.name, action: options.action });
    createButton(this, x, y, width, height, {
      ...options, focused: this.focusName === options.name,
      action: () => {
        this.game.canvas.focus({ preventScroll: true });
        this.focusName = options.name;
        options.action();
      },
    });
  }

  private render(): void {
    const texts = getTexts();
    this.children.getAll().forEach(child => child.destroy());
    this.controls = [];
    const { width, height } = this.scale;
    const short = height < 500 && width >= 600;
    const columns = short ? 4 : width >= 700 ? 3 : 2;
    const rows = short ? 1 : columns === 3 ? 2 : 3;
    const pageSize = columns * rows;
    const pages = Math.ceil(destinations.length / pageSize);
    this.page = Math.min(this.page, pages - 1);
    const progress = progressStore.read();
    const known = new Set(progress.discoveredDestinationIds);
    const contentWidth = Math.min(width - 24, 960);
    const gap = 10;
    const cardWidth = (contentWidth - (columns - 1) * gap) / columns;
    const gridTop = short ? 110 : 136;
    const cardHeight = Math.min(short ? 110 : 150, (height - 134 - gridTop - (rows - 1) * gap) / rows);
    const left = (width - contentWidth) / 2;
    const notice = progressStore.persistent ? texts.notebook.savedNotice : texts.notebook.unavailable;
    const progressText = texts.notebook.progress.replace('{count}', String(known.size)).replace('{total}', String(destinations.length));
    this.text(width / 2, 10, texts.journal, short ? 26 : 30, contentWidth, true);
    this.text(width / 2, short ? 45 : 51, progressText, 16, contentWidth);
    this.text(width / 2, short ? 72 : 81, notice, short ? 11 : 12, contentWidth);

    destinations.slice(this.page * pageSize, (this.page + 1) * pageSize).forEach((destination, index) => {
      const unlocked = known.has(destination.id);
      const x = left + cardWidth / 2 + (index % columns) * (cardWidth + gap);
      const y = gridTop + cardHeight / 2 + Math.floor(index / columns) * (cardHeight + gap);
      this.button(x, y, cardWidth, cardHeight, {
        name: unlocked ? `entry-${destination.id}` : `locked-${this.page * pageSize + index}`,
        label: unlocked ? getDestinationTexts(destination.id)?.title ?? texts.journey.unknown : '?\n' + texts.notebook.unknown,
        fontSize: cardWidth < 170 ? 13 : 17, labelOffsetY: unlocked ? cardHeight * 0.25 : 0,
        disabled: !unlocked,
        action: () => this.scene.start('journal-entry', { id: destination.id, page: this.page }),
      });
      if (unlocked) {
        drawPostcard(this, x, y - cardHeight / 2 + 8, cardWidth - 20, Math.min(60, cardHeight * 0.36),
          this.page * pageSize + index);
      }
    });
    this.text(width / 2, height - 130, texts.notebook.page.replace('{page}', String(this.page + 1))
      .replace('{pages}', String(pages)), 13, contentWidth);
    const navWidth = Math.min(180, (contentWidth - 12) / 2);
    this.button(width / 2 - (navWidth + 12) / 2, height - 82, navWidth, 44, {
      name: 'previous-page', label: texts.notebook.previous, fontSize: 16, disabled: this.page === 0,
      action: () => { this.page--; this.render(); },
    });
    this.button(width / 2 + (navWidth + 12) / 2, height - 82, navWidth, 44, {
      name: 'next-page', label: texts.notebook.next, fontSize: 16, disabled: this.page === pages - 1,
      action: () => { this.page++; this.render(); },
    });
    this.button(width / 2, height - 28, Math.min(300, contentWidth), 44, {
      name: 'home', label: texts.back, primary: true, fontSize: 17, action: () => this.scene.start('home'),
    });
    this.game.canvas.setAttribute('aria-description', progressText + '. ' + notice);
  }
}
