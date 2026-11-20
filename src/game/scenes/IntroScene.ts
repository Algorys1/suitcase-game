import Phaser from 'phaser';
import { progressStore } from '../../services/storage';
import { getTexts } from '../../services/i18n';
import { beginSceneLoading, finishSceneLoading } from '../ui/assetLoading';
import { drawPreparationDesk } from '../ui/preparationArt';
import { AdventureControls, mapText, reducedMotion } from '../ui/adventureMap';
import { playSound } from '../../services/audio';

export class IntroScene extends Phaser.Scene {
  private controls!: AdventureControls;
  private active = false;
  private visiblePanels = 1;
  constructor() { super('intro'); }

  preload(): void {
    const { replay = false } = (this.sys.settings.data ?? {}) as { replay?: boolean };
    const progress = progressStore.read();
    this.active = replay || (!progress.introSeen && !progress.expedition);
    if (!this.active) return;
    beginSceneLoading(this);
    for (let i = 1; i <= 3; i++) if (!this.textures.exists(`intro-panel-${i}`))
      this.load.image(`intro-panel-${i}`, `${import.meta.env.BASE_URL}assets/intro/panel-${i}.webp`);
    if (!this.textures.exists('preparation-travel_desk')) this.load.image('preparation-travel_desk',
      `${import.meta.env.BASE_URL}assets/preparation/travel_desk.webp`);
  }

  create(): void {
    if (!this.active) { this.scene.start('home'); return; }
    if (this.data.get('asset-load-failed')) { this.finish(); return; }
    if (!finishSceneLoading(this)) return;
    this.visiblePanels = 1;
    this.controls = new AdventureControls(this);
    this.render(true);
    this.scale.on('resize', this.resize, this);
    this.game.canvas.addEventListener('keydown', this.key);
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    query.addEventListener('change', this.resize);
    this.events.once('shutdown', () => {
      this.scale.off('resize', this.resize, this);
      this.game.canvas.removeEventListener('keydown', this.key);
      query.removeEventListener('change', this.resize);
    });
  }

  private finish = (): void => { progressStore.acknowledgeIntro(); this.scene.start('home'); };
  private advance = (): void => {
    playSound('paper');
    if (this.visiblePanels >= getTexts().intro.panels.length) { this.finish(); return; }
    this.visiblePanels++;
    this.render(true);
  };
  private resize = (): void => this.render(false);
  private key = (event: KeyboardEvent): void => {
    if (event.defaultPrevented || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'Escape') { event.preventDefault(); this.finish(); }
    else if (event.key === 'Enter' || event.key === ' ' || (event.key === 'ArrowRight' && this.visiblePanels < 3)) {
      event.preventDefault();
      this.advance();
    }
  };

  private render(animate: boolean): void {
    this.tweens.killAll(); this.children.getAll().forEach(o => o.destroy()); this.controls.clear();
    const { width: w, height: h } = this.scale;
    const copy = getTexts().intro;
    const portrait = w < 600, short = h < 450;
    drawPreparationDesk(this, w, h);
    const sheet = this.add.graphics().setName('intro-paper');
    sheet.fillStyle(0x513922, 0.18).fillRoundedRect(19, 20, w - 34, h - 34, 3)
      .fillStyle(0xfcf0d7).lineStyle(1, 0xb39669).fillRoundedRect(14, 14, w - 28, h - 28, 3)
      .strokeRoundedRect(14, 14, w - 28, h - 28, 3);
    for (let i = 0; i < 180; i++) sheet.fillStyle(0x9e7b51, 0.07)
      .fillCircle(22 + i * 47 % (w - 44), 23 + i * 31 % (h - 46), 0.6);
    mapText(this, w / 2, short ? 33 : 42, copy.title, portrait || short ? 20 : 28, w - 94)
      .setFontStyle('bold').setName('intro-title');
    const gutter = portrait ? 9 : 12;
    const boardTop = short ? 53 : 67;
    const boardHeight = h - boardTop - 70;
    const cellW = portrait ? w - 50 : Math.min(680, w - 70);
    const cellH = (boardHeight - gutter * (copy.panels.length - 1)) / copy.panels.length;
    const textW = portrait ? cellW - 12 : cellW * 0.43;
    const captions = copy.panels.map((line, index) => {
      return mapText(this, w / 2, 0, line, portrait ? 15 : short ? 16 : 19, textW, '#513a29')
        .setOrigin(0.5, 0).setName(`intro-caption-${index + 1}`);
    });
    const captionHeight = Math.max(...captions.map(caption => caption.height));
    const captionGap = 6;
    captions.forEach((caption, index) => {
      if (index >= this.visiblePanels) { caption.destroy(); return; }
      const cy = boardTop + cellH / 2 + index * (cellH + gutter);
      const key = `intro-panel-${index + 1}`;
      const frame = this.textures.getFrame(key);
      const artLimit = portrait ? cellW - 8 : cellW * 0.45;
      const artSpace = cellH - (portrait ? captionHeight + captionGap + 10 : 5);
      const artH = Math.max(1, Math.min(artLimit * frame.height / frame.width, artSpace));
      const artW = artH * frame.width / frame.height;
      const side = index % 2 === 0 ? 1 : -1;
      const cx = portrait ? w / 2 : w / 2 - side * (artW / 2 + 16);
      const top = portrait ? cy - (artH + captionGap + captionHeight) / 2 : cy - artH / 2;
      const left = cx - artW / 2;
      const border = this.add.graphics().setName(`intro-comic-frame-${index + 1}`);
      border.fillStyle(0x63452d, 0.19).fillRect(left - 2, top - 1, artW + 8, artH + 8)
        .fillStyle(0xfffaf0).fillRect(left - 4, top - 4, artW + 8, artH + 8)
        .lineStyle(2, 0x513a29).strokeRect(left - 1, top - 1, artW + 2, artH + 2);
      const image = this.add.image(cx, top + artH / 2, key).setDisplaySize(artW, artH)
        .setName(key);
      if (portrait) caption.setY(top + artH + captionGap);
      else caption.setOrigin(side === 1 ? 0 : 1, 0.5).setAlign(side === 1 ? 'left' : 'right')
        .setPosition(w / 2 + side * 12, cy);
      if (animate && index === this.visiblePanels - 1 && !reducedMotion()) this.tweens.add({
        targets: [border, image, caption], alpha: { from: 0, to: 1 }, duration: 300, ease: 'Sine.Out',
      });
    });
    const complete = this.visiblePanels === copy.panels.length;
    if (!complete) this.add.zone(w / 2, boardTop + boardHeight / 2, cellW, boardHeight)
      .setInteractive({ useHandCursor: true }).on('pointerup', this.advance);
    this.controls.button('intro-advance', complete ? copy.finish : copy.next, w / 2, h - 43,
      Math.min(180, w * 0.48), this.advance, true);
    this.game.canvas.setAttribute('aria-label', [copy.title, ...copy.panels.slice(0, this.visiblePanels)].join(' '));
  }
}
