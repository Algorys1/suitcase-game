import Phaser from 'phaser';
import { getTexts, getDestinationTexts } from '../../services/i18n';
import type { SessionState } from '../../domain/session';
import { createButton } from '../ui/menu';
import type { MenuButton } from '../ui/menu';
import { progressStore } from '../../services/storage';
import { destinations } from '../../domain/recipes';
import { drawNotebook, notebookLayout } from '../ui/notebook';
import { drawPostcard } from '../ui/postcard';

export class SummaryScene extends Phaser.Scene {
  private session!: SessionState;
  private offset = 0;
  private focusName: string | null = null;
  private controls: Array<{ name: string; action: () => void }> = [];
  private motion = window.matchMedia('(prefers-reduced-motion: reduce)');

  constructor() { super('summary'); }

  create({ session }: { session?: SessionState } = {}): void {
    if (!session || session.phase !== 'ended') { this.scene.start('home'); return; }
    this.session = session;
    this.offset = 0;
    this.focusName = null;
    progressStore.saveSession(session);
    const canvas = this.game.canvas;
    canvas.tabIndex = 0;
    canvas.setAttribute('aria-label', getTexts().journey.summaryTitle);
    canvas.focus({ preventScroll: true });
    canvas.addEventListener('keydown', this.onKeyDown);
    this.motion.addEventListener('change', this.render);
    this.scale.on(Phaser.Scale.Events.RESIZE, this.render, this);
    this.render(true);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.render, this);
      this.motion.removeEventListener('change', this.render);
      canvas.removeEventListener('keydown', this.onKeyDown);
      canvas.removeAttribute('tabindex');
      canvas.removeAttribute('aria-description');
      this.tweens.killAll();
      this.controls = [];
    });
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const index = this.controls.findIndex(control => control.name === this.focusName);
    if (event.key === 'Tab') {
      const next = index < 0 ? (event.shiftKey ? this.controls.length - 1 : 0) : index + (event.shiftKey ? -1 : 1);
      this.focusName = this.controls[next]?.name ?? null;
      if (this.focusName) event.preventDefault();
      this.render();
    } else if (event.key === 'Enter' || event.key === ' ') {
      if (this.controls[index]) { event.preventDefault(); this.controls[index]?.action(); }
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      const control = this.controls.find(item => item.name === (event.key === 'ArrowLeft' ? 'previous-page' : 'next-page'));
      if (control) { event.preventDefault(); control.action(); }
    }
  };

  private button(x: number, y: number, width: number, options: MenuButton & { name: string }): void {
    const action = () => {
      this.game.canvas.focus({ preventScroll: true });
      this.focusName = options.name;
      options.action();
    };
    if (!options.disabled) this.controls.push({ name: options.name, action });
    createButton(this, x, y, width, 44, { ...options, focused: this.focusName === options.name, action });
  }

  private render = (animate: unknown = false): void => {
    this.tweens.killAll();
    this.children.removeAll(true);
    this.controls = [];
    const texts = getTexts();
    const s = texts.journey;
    const b = notebookLayout(this);
    const short = b.height < 400;
    const ids = [...new Set(this.session.visitedDestinationIds)];
    const center = this.scale.width / 2;
    drawNotebook(this, b.left, b.top, b.width, b.height, b.landscape ? center : undefined);
    const text = (x: number, y: number, value: string, size: number, width: number, name: string, heading = false) => {
      const label = this.add.text(x, y, value, {
        fontFamily: heading ? 'Georgia, "Times New Roman", serif' : '"Trebuchet MS", Arial, sans-serif',
        fontSize: size, color: '#65452e', fontStyle: heading ? 'bold' : 'normal', align: 'center',
        wordWrap: { width, useAdvancedWrap: true },
      }).setOrigin(0.5, 0).setPadding(2).setName(name);
      return label;
    };
    const leftCenter = b.landscape ? b.left + b.width / 4 : center;
    const rightCenter = b.landscape ? b.left + b.width * 0.75 : center;
    const column = b.landscape ? b.width / 2 - 46 : b.width - 40;
    const titleY = b.top + (b.landscape ? 38 : 18);
    const title = text(rightCenter, titleY, s.summaryTitle, short ? 23 : 28, column, 'menu-title', true);
    const subtitle = text(rightCenter, title.y + title.height + 12, s.summaryRest, short ? 14 : 16,
      column - 8, 'summary-rest');
    const statsY = b.landscape ? subtitle.y + subtitle.height + (short ? 16 : 34) : subtitle.y + subtitle.height + 10;
    const stats = text(rightCenter, statsY,
      s.summaryPlaces.replace('{count}', String(ids.length)) + '\n' +
      s.summaryDiscoveries.replace('{count}', String(this.session.newlyDiscoveredIds.length)),
      short ? 15 : 17, column, 'summary-stats');
    const progress = texts.notebook.progress.replace('{count}', String(progressStore.read().discoveredDestinationIds.length))
      .replace('{total}', String(destinations.length));
    const progressLabel = text(rightCenter, stats.y + stats.height + 12, progress, 12, column, 'summary-progress');
    const ruleY = progressLabel.y + progressLabel.height + 9;
    const g = this.add.graphics();
    g.fillStyle(0xdac9a9).fillRoundedRect(rightCenter - column / 2, ruleY, column, 4, 2);
    g.fillStyle(0x946070).fillRoundedRect(rightCenter - column / 2, ruleY,
      Math.max(4, column * progressStore.read().discoveredDestinationIds.length / destinations.length), 4, 2);
    const note = this.session.voidTrips ? s.summaryVoid.replace('{count}', String(this.session.voidTrips)) : '';
    const noteLabel = text(rightCenter, ruleY + 12, note, 12, column, 'summary-void');
    if (!progressStore.persistent) text(rightCenter, noteLabel.y + noteLabel.height + 4,
      texts.notebook.unavailable, 10, column, 'storage-notice');

    const cardsTop = b.landscape ? b.top + 76 : noteLabel.y + noteLabel.height + 20;
    const cardsBottom = b.top + b.height - (b.landscape ? 66 : 100);
    const available = cardsBottom - cardsTop;
    const columns = b.landscape ? 2 : 1;
    const rows = b.landscape && available >= 280 ? 2 : 1;
    const pageSize = columns * rows;
    const page = Math.floor(this.offset / pageSize);
    const pages = Math.max(1, Math.ceil(ids.length / pageSize));
    const start = page * pageSize;
    if (b.landscape) text(leftCenter, b.top + 26, s.summaryMemories, 22, column, 'summary-memories', true);
    if (!ids.length) text(leftCenter, cardsTop + available / 3, s.noVisits, 16, column, 'summary-empty');
    ids.slice(start, start + pageSize).forEach((id, index) => {
      const cellWidth = column / columns;
      const cellHeight = available / rows;
      const x = leftCenter - column / 2 + cellWidth * (index % columns + 0.5);
      const top = cardsTop + Math.floor(index / columns) * cellHeight;
      const cardHeight = Math.min(cellHeight - 88, (cellWidth - 16) * 0.75, 176);
      const cardWidth = cardHeight * 4 / 3;
      const art = drawPostcard(this, x, top, cardWidth, cardHeight,
        destinations.findIndex(destination => destination.id === id), true);
      const count = this.session.visitedDestinationIds.filter(visited => visited === id).length;
      const name = text(x, top + cardHeight + 7, (getDestinationTexts(id)?.title ?? s.unknown) + (count > 1 ? ` ×${count}` : ''),
        14, cellWidth - 8, `summary-place-${id}`, true);
      while (name.height > cellHeight - cardHeight - 34 && parseFloat(String(name.style.fontSize)) > 10) {
        name.setFontSize(parseFloat(String(name.style.fontSize)) - 1);
      }
      if (this.session.newlyDiscoveredIds.includes(id)) text(x, name.y + name.height + 5,
        texts.notebook.newDiscovery, 11, cellWidth - 6, `summary-new-${id}`).setColor('#84516b');
      if (animate === true && !this.motion.matches) {
        // Fade the mounted paper and illustration together; controls remain available.
        art.forEach(object => object.setAlpha(0));
        this.tweens.add({ targets: art, alpha: 1, duration: 380, delay: index * 65, ease: 'Sine.Out' });
      }
    });
    if (pages > 1) {
      const y = b.top + b.height - (b.landscape ? 34 : 77);
      this.button(leftCenter - column / 2 + 24, y, 44, { name: 'previous-page', label: texts.notebook.previous,
        pageCorner: 'previous', disabled: page === 0, action: () => { this.offset = start - pageSize; this.render(true); } });
      this.button(leftCenter + column / 2 - 24, y, 44, { name: 'next-page', label: texts.notebook.next,
        pageCorner: 'next', disabled: page === pages - 1, action: () => { this.offset = start + pageSize; this.render(true); } });
      text(leftCenter, y - 8, texts.notebook.page.replace('{page}', String(page + 1)).replace('{pages}', String(pages)),
        11, column - 100, 'summary-page');
    }
    this.button(rightCenter, b.top + b.height - 35, Math.min(260, column), {
      name: 'home', label: texts.back, stationery: true, fontSize: 16,
      action: () => { progressStore.finishSession(); this.scene.start('home'); },
    });
    this.game.canvas.setAttribute('aria-description', stats.text + '. ' + progress + '. ' + note);
  };
}
