import Phaser from 'phaser';
import { progressStore } from '../../services/storage';
import { getTexts } from '../../services/i18n';
import { beginSceneLoading, finishSceneLoading } from '../ui/assetLoading';
import { drawPreparationDesk } from '../ui/preparationArt';
import { AdventureControls, mapText, reducedMotion } from '../ui/adventureMap';
import { playSound } from '../../services/audio';

export class IntroScene extends Phaser.Scene {
  private page = 0;
  private controls!: AdventureControls;
  private active = false;
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
    this.page = 0;
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
  private next = (): void => {
    playSound('paper');
    if (this.page === 2) { this.finish(); return; }
    this.page++; this.render(true);
  };
  private previous = (): void => { if (this.page > 0) { this.page--; playSound('paper'); this.render(true); } };
  private resize = (): void => this.render(false);
  private key = (event: KeyboardEvent): void => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'Escape') { event.preventDefault(); this.finish(); }
    else if (event.key === 'ArrowRight' || event.key === 'Enter' || event.key === ' ') { event.preventDefault(); this.next(); }
    else if (event.key === 'ArrowLeft') { event.preventDefault(); this.previous(); }
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
    const frame = this.textures.getFrame(`intro-panel-${this.page + 1}`);
    const artW = Math.min(w - (portrait ? 52 : 86), (h - (short ? 222 : portrait ? 250 : 262)) * frame.width / frame.height);
    const artH = artW * frame.height / frame.width;
    const artY = portrait ? Math.max(100 + artH / 2, h * 0.40) : short ? 64 + artH / 2 : 78 + artH / 2;
    const left = (w - artW) / 2, top = artY - artH / 2;
    const border = this.add.graphics().setName('intro-comic-frame');
    border.fillStyle(0x63452d, 0.20).fillRect(left - 4, top - 2, artW + 14, artH + 14)
      .fillStyle(0xfffaf0).fillRect(left - 7, top - 7, artW + 14, artH + 14)
      .lineStyle(3, 0x513a29).strokeRect(left - 3, top - 3, artW + 6, artH + 6);
    const image = this.add.image(w / 2, artY, `intro-panel-${this.page + 1}`).setDisplaySize(artW, artH).setName('intro-panel');
    const captionY = artY + artH / 2 + (short ? 16 : 24);
    const caption = mapText(this, w / 2, captionY, copy.panels[this.page]!, portrait || short ? 16 : 20,
      Math.min(w - 64, 760)).setOrigin(0.5, 0).setName('intro-caption');
    let size = portrait || short ? 16 : 20;
    while (caption.y + caption.height > h - 101 && size > 12) caption.setFontSize(--size);
    mapText(this, w / 2, h - 83, copy.page.replace('{page}', String(this.page + 1)), 12, w - 60, '#8c704d');
    this.controls.button('intro-next', this.page === 2 ? copy.finish : copy.next, w / 2, h - 44,
      Math.min(180, w * 0.34), this.next, true);
    this.controls.button('intro-skip', copy.skip, w - (portrait ? 54 : 100), h - 44,
      portrait ? 88 : 160, this.finish);
    if (this.page > 0) this.controls.button('intro-previous', '←', portrait ? 42 : 90, h - 44, 48, this.previous);
    this.game.canvas.setAttribute('aria-label', `${copy.title}. ${copy.page.replace('{page}', String(this.page + 1))}. ${copy.panels[this.page]}`);
    if (animate && !reducedMotion()) this.tweens.add({ targets: [image, caption],
      alpha: { from: 0, to: 1 }, duration: 280, ease: 'Sine.Out' });
  }
}
