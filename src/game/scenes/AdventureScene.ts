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

  create({ session }: { session?: SessionState } = {}): void {
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
    this.render(true);
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
    this.controls.add('map-journal', journal.x, journal.y, Math.max(48, journal.width + 12), journal.height + 14,
      () => approachJournal(this, opening => this.scene.start('journal', { opening, returnTo: 'adventure' })));
    if (width >= 600 && (height >= 450 || this.session.visitedDestinationIds.length + this.session.voidTrips <= 6)) {
      mapText(this, width < 600 ? (width - 110) / 2 + 8 : width / 2, height - (width < 600 ? 100 : 70),
        this.session.charges > 0 ? copy.mapHelp : copy.exhausted, width < 600 ? 10 : 12,
        width < 600 ? width - 145 : width - 430, '#8d785b').setName('map-help');
    }
    this.controls.button('pause-adventure', copy.home, width < 600 ? 62 : 100,
      height - 35, width < 600 ? 94 : 150, () => this.scene.start('home'), true);
    if (this.session.charges === 0) this.controls.button('view-summary', getTexts().journey.finish,
      width / 2, height - 35, width < 600 ? 96 : 180,
      () => this.scene.start('summary', { session: this.session }));
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
