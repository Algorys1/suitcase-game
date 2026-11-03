import Phaser from 'phaser';
import { getTexts, getDestinationTexts } from '../../services/i18n';
import { destinations } from '../../domain/recipes';
import { progressStore } from '../../services/storage';
import { createButton } from '../ui/menu';
import type { MenuButton } from '../ui/menu';
import { drawNotebook, notebookLayout } from '../ui/notebook';
import { bookBusy, captureJournal, openJournalCover, turnJournalPage } from '../ui/notebookMotion';
import type { PageDirection } from '../ui/notebookMotion';

type Control = { name: string; action: () => void };

export class JournalScene extends Phaser.Scene {
  // An entry offset, rather than a screen number, keeps the place on resize.
  private page = 0;
  private focusName: string | null = null;
  private controls: Control[] = [];
  private stopMotion: (() => void) | undefined;

  constructor() { super('journal'); }

  create({ page = 0, opening = false, turn }: { page?: number; opening?: boolean; turn?: PageDirection } = {}): void {
    this.page = Number.isInteger(page) && page >= 0 ? Math.min(page, destinations.length - 1) : 0;
    this.focusName = null;
    this.stopMotion = undefined;
    this.data.set('book-busy', false);
    const canvas = this.game.canvas;
    canvas.setAttribute('aria-label', getTexts().journal);
    canvas.tabIndex = 0;
    canvas.focus({ preventScroll: true });
    canvas.addEventListener('keydown', this.onKeyDown);
    this.render();
    if (opening) this.stopMotion = openJournalCover(this);
    else if (turn) this.stopMotion = turnJournalPage(this, turn);
    this.scale.on(Phaser.Scale.Events.RESIZE, this.render, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.stopMotion?.();
      this.scale.off(Phaser.Scale.Events.RESIZE, this.render, this);
      canvas.removeEventListener('keydown', this.onKeyDown);
      canvas.removeAttribute('tabindex');
      canvas.removeAttribute('aria-description');
      this.controls = [];
    });
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    if (bookBusy(this) || event.altKey || event.ctrlKey || event.metaKey) return;
    const index = this.controls.findIndex(control => control.name === this.focusName);
    if (event.key === 'Tab') {
      const next = index < 0 ? (event.shiftKey ? this.controls.length - 1 : 0) : index + (event.shiftKey ? -1 : 1);
      const control = this.controls[next];
      this.focusName = control?.name ?? null;
      if (control) event.preventDefault();
      this.render();
    } else if (event.key === 'Enter' || event.key === ' ') {
      if (this.controls[index]) { event.preventDefault(); this.controls[index]?.action(); }
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      const name = event.key === 'ArrowLeft' ? 'previous-page' : 'next-page';
      const control = this.controls.find(item => item.name === name);
      if (control) { event.preventDefault(); control.action(); }
    }
  };

  private button(x: number, y: number, width: number, height: number, options: MenuButton & { name: string }): void {
    const action = () => {
      if (bookBusy(this)) return;
      this.game.canvas.focus({ preventScroll: true });
      this.focusName = options.name;
      options.action();
    };
    if (!options.disabled) this.controls.push({ name: options.name, action });
    createButton(this, x, y, width, height, { ...options, focused: this.focusName === options.name, action });
  }

  private render(): void {
    this.stopMotion?.();
    this.stopMotion = undefined;
    this.children.getAll().forEach(child => child.destroy());
    this.controls = [];
    const texts = getTexts();
    const b = notebookLayout(this);
    const short = this.scale.height < 450;
    drawNotebook(this, b.left, b.top, b.width, b.height, b.landscape ? this.scale.width / 2 : undefined);
    const text = (x: number, y: number, value: string, size: number, width: number, bold = false) =>
      this.add.text(x, y, value, {
        fontFamily: bold ? 'Georgia, "Times New Roman", serif' : '"Trebuchet MS", Arial, sans-serif',
        fontSize: size, color: '#65452e', fontStyle: bold ? 'bold' : 'normal', align: 'center',
        wordWrap: { width, useAdvancedWrap: true },
      }).setOrigin(0.5, 0).setPadding(2);
    const center = this.scale.width / 2;
    text(center, b.top + 18, texts.journal, Math.min(short || !b.landscape ? 22 : 28, (b.width - 110) / 10),
      b.width - 110, true).setName('menu-title');
    text(center, b.top + 60, texts.notebook.contents, 16, b.width - 40).setName('journal-contents');
    const rowsTop = b.top + 99;
    const rows = Math.max(1, Math.min(8, Math.floor((b.height - 221) / 44)));
    const columns = b.landscape ? 2 : 1;
    const pageSize = rows * columns;
    const pageNumber = Math.floor(this.page / pageSize);
    const start = pageNumber * pageSize;
    const pages = Math.ceil(destinations.length / pageSize);
    const columnWidth = b.width / columns;
    const progress = progressStore.read();
    const known = new Set(progress.discoveredDestinationIds);
    const progressText = texts.notebook.progress.replace('{count}', String(known.size)).replace('{total}', String(destinations.length));
    const notice = progressStore.persistent ? texts.notebook.savedNotice : texts.notebook.unavailable;
    destinations.slice(start, start + pageSize).forEach((destination, index) => {
      const unlocked = known.has(destination.id);
      const col = Math.floor(index / rows);
      const x = b.left + columnWidth * (col + 0.5);
      const y = rowsTop + (index % rows) * 44 + 22;
      const line = this.add.graphics();
      line.lineStyle(1, 0xb49260, 0.22).lineBetween(x - columnWidth / 2 + 26, y + 21, x + columnWidth / 2 - 26, y + 21);
      this.button(x, y, columnWidth - 48, 44, {
        name: unlocked ? `entry-${destination.id}` : `locked-${start + index}`,
        label: unlocked ? getDestinationTexts(destination.id)?.title ?? texts.journey.unknown : '?',
        fontSize: b.landscape ? 17 : 15, textOnly: true, disabled: !unlocked,
        action: () => {
          const animate = captureJournal(this);
          this.data.set('book-busy', true);
          this.scene.start('journal-entry', { id: destination.id, page: start, turn: animate ? 'next' : undefined });
        },
      });
    });
    const turnPage = (offset: number, direction: PageDirection) => {
      const animate = captureJournal(this);
      this.page = offset;
      this.render();
      if (animate) this.stopMotion = turnJournalPage(this, direction);
    };
    this.button(b.left + 24, b.top + 24, 44, 44, {
      name: 'previous-page', label: texts.notebook.previous, pageCorner: 'previous', disabled: pageNumber === 0,
      action: () => turnPage(start - pageSize, 'previous'),
    });
    this.button(b.left + b.width - 24, b.top + 24, 44, 44, {
      name: 'next-page', label: texts.notebook.next, pageCorner: 'next', disabled: pageNumber === pages - 1,
      action: () => turnPage(start + pageSize, 'next'),
    });
    text(center, b.top + b.height - 116, progressText, 12, b.width - 32).setName('journal-progress');
    if (!progressStore.persistent) text(center, b.top + b.height - 96, notice, 10, b.width - 32);
    this.button(center, b.top + b.height - 61, Math.min(260, b.width - 44), 44, {
      name: 'home', label: texts.back, stationery: true, fontSize: 16, action: () => this.scene.start('home'),
    });
    text(center, b.top + b.height - 25, texts.notebook.page.replace('{page}', String(pageNumber + 1))
      .replace('{pages}', String(pages)), 11, b.width - 40).setName('journal-page-number');
    this.game.canvas.setAttribute('aria-description', progressText + '. ' + notice);
  }
}
