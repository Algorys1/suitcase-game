import { beginSceneLoading, finishSceneLoading, queueWorldAssets, sceneWorldIds } from '../ui/assetLoading';
import Phaser from 'phaser';
import { createSession } from '../../domain/session';
import type { SessionState } from '../../domain/session';
import { progressStore } from '../../services/storage';
import { getTexts } from '../../services/i18n';
import { AdventureControls, drawAdventureMap, mapText, mapInstruments } from '../ui/adventureMap';
import { approachJournal } from '../ui/notebookMotion';
import { drawTravelNote, needsTravelTip } from '../ui/travelTutorial';

export class AdventureScene extends Phaser.Scene {
  private session: SessionState = createSession();
  private controls!: AdventureControls;
  private newStampIds: string[] = [];
  constructor() { super('adventure'); }

  preload(): void {
    beginSceneLoading(this);
    queueWorldAssets(this, sceneWorldIds(this), true);
  }

  create({ session, fromHome = false }: { session?: SessionState; fromHome?: boolean } = {}): void {
    if (!finishSceneLoading(this)) return;
    this.session = session ?? progressStore.read().expedition ?? createSession();
    if (this.session.phase === 'result' || this.session.phase === 'travelling') {
      this.scene.start('result', { session: this.session }); return;
    }
    progressStore.saveSession(this.session);
    this.controls = new AdventureControls(this);
    const collected = progressStore.unlockedSouvenirIds();
    const alreadyShown = this.registry.get('map-stamped-souvenir-ids') as string[] | undefined;
    this.newStampIds = alreadyShown ? collected.filter(id => !alreadyShown.includes(id)) : [];
    this.registry.set('map-stamped-souvenir-ids', collected);
    this.game.canvas.setAttribute('aria-label', getTexts().adventure.title);
    this.render(!fromHome);
    this.scale.on('resize', this.render, this);
    this.events.once('shutdown', () => this.scale.off('resize', this.render, this));
  }

  private render(animate: unknown = false): void {
    this.tweens.killAll();
    this.children.getAll().forEach(child => child.destroy());
    this.controls.clear();
    const copy = getTexts().adventure;
    const { width, height } = this.scale;
    const depart = () => {
      progressStore.acknowledgeTutorial('departure');
      if (this.session.charges > 0) this.scene.start('preparation', { session: this.session });
    };
    drawAdventureMap(this, this.session, this.controls,
      id => this.scene.start('exploration', { id, session: this.session }), depart, animate === true,
      animate === true ? this.newStampIds : []);
    const { journal } = mapInstruments(width, height, this.session);
    if (animate === true) this.newStampIds.forEach((id, index) => {
      const route = this.session.route ?? this.session.visitedDestinationIds;
      const source = this.children.getByName(`map-art-${route.lastIndexOf(id)}`) as Phaser.GameObjects.Image | null;
      if (!source || !this.textures.exists(`souvenir-${id}`)) return;
      const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (preference.matches) return;
      const sticker = this.add.image(source.x, source.y, `souvenir-${id}`).setName(`souvenir-to-journal-${id}`);
      const scale = 58 / Math.max(sticker.width, sticker.height);
      sticker.setScale(scale).setAngle(-8);
      const flight = this.tweens.add({ targets: sticker, x: journal.x, y: journal.y,
        scale: scale * 0.3, angle: 8, alpha: 0, delay: 180 + index * 120,
        duration: 850, ease: 'Sine.InOut', onComplete: () => sticker.destroy() });
      const stop = () => { if (preference.matches) sticker.destroy(); };
      preference.addEventListener('change', stop);
      sticker.once('destroy', () => { flight.stop(); preference.removeEventListener('change', stop); });
    });
    this.controls.add('map-journal', journal.x, journal.y, Math.max(48, journal.width + 12), journal.height + 14,
      () => approachJournal(this, opening => this.scene.start('journal', { opening, returnTo: 'adventure' })));
    if (this.session.charges > 0 && width >= 600
      && (height >= 450 || this.session.visitedDestinationIds.length + this.session.voidTrips <= 6)) {
      mapText(this, width / 2, height - (height < 450 ? 43 : 54),
        copy.mapHelp, height < 450 ? 13 : 15,
        width - 270, '#65452e').setFontStyle('bold').setName('map-help');
    }
    this.controls.button('pause-adventure', copy.home, width < 600 ? 62 : 100,
      height - 35, width < 600 ? 94 : 150, () => this.scene.start('home'), true);
    if (this.session.charges === 0) this.controls.button('view-summary', getTexts().journey.finish,
      width / 2, height - 35, width < 600 ? 96 : 180,
      () => this.scene.start('summary', { session: this.session }), true);
    if (!progressStore.persistent) mapText(this, width / 2, width < 600 ? 194 : height - 58,
      getTexts().notebook.unavailable, 10, width - 36).setName('storage-warning');
    const step = this.session.charges === 0 ? 'exhausted' : 'departure';
    if (needsTravelTip(step)) {
      this.children.getByName('adventure-wish')?.destroy();
      const portrait = width < 600, short = height < 450;
      const compactEndNote = portrait && step === 'exhausted' && this.session.visitedDestinationIds.length + this.session.voidTrips >= 7;
      drawTravelNote(this, step, () => this.render(), {
        x: portrait || step === 'exhausted' ? width / 2 : width * 0.66,
        top: compactEndNote ? 24 : step === 'exhausted' ? (portrait ? 148 : short ? 86 : 102)
          : portrait ? Math.min(300, height - 245) : short ? 158 : 194,
        width: portrait ? width - 36 : Math.min(step === 'exhausted' && short ? 280 : 360, width - 300),
        height: compactEndNote ? 104 : portrait ? 124 : 116,
        button: (...args) => this.controls.button(...args),
      });
      const suitcase = this.children.getByName('next-suitcase-art') as Phaser.GameObjects.Image | null;
      if (suitcase) {
        const query = window.matchMedia('(prefers-reduced-motion: reduce)');
        const y = suitcase.y;
        const motion = query.matches ? undefined : this.tweens.add({ targets: suitcase,
          y: y - 2, angle: { from: -0.8, to: 0.8 }, duration: 1600,
          yoyo: true, repeat: -1, ease: 'Sine.InOut' });
        const stop = () => { motion?.stop(); suitcase.setY(y).setAngle(0); };
        query.addEventListener('change', stop);
        suitcase.once('destroy', () => { motion?.stop(); query.removeEventListener('change', stop); });
      }
    }
  }
}
