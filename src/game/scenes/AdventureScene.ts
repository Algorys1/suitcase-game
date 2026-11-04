import Phaser from 'phaser';
import { createSession } from '../../domain/session';
import type { SessionState } from '../../domain/session';
import { progressStore } from '../../services/storage';
import { getTexts } from '../../services/i18n';
import { AdventureControls, drawAdventureMap, mapText, mapInstruments } from '../ui/adventureMap';
import { approachJournal } from '../ui/notebookMotion';
import { travelTutorial } from '../ui/travelTutorial';

export class AdventureScene extends Phaser.Scene {
  private session: SessionState = createSession();
  private controls!: AdventureControls;
  constructor() { super('adventure'); }

  create({ session }: { session?: SessionState } = {}): void {
    this.session = session ?? progressStore.read().expedition ?? createSession();
    if (this.session.phase === 'result' || this.session.phase === 'travelling') {
      this.scene.start('result', { session: this.session }); return;
    }
    progressStore.saveSession(this.session);
    this.controls = new AdventureControls(this);
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
      if (this.session.charges > 0) this.scene.start('preparation', { session: this.session });
    };
    drawAdventureMap(this, this.session, this.controls,
      id => this.scene.start('exploration', { id, session: this.session }), depart, animate === true);
    const { journal } = mapInstruments(width, height);
    this.controls.add('map-journal', journal.x, journal.y, Math.max(48, journal.width + 12), journal.height + 14,
      () => approachJournal(this, opening => this.scene.start('journal', { opening, returnTo: 'adventure' })));
    if (this.session.charges > 0) {
      const { compass, suitcase } = mapInstruments(width, height);
      this.controls.add('map-compass', compass.x, compass.y, compass.radius * 2, compass.radius * 2, depart);
      this.controls.add('map-suitcase', suitcase.x, suitcase.top + suitcase.height / 2,
        suitcase.width, suitcase.height, depart);
    }
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
    const progress = progressStore.read();
    if (progress.tutorialSeen?.includes('exploration') && progressStore.unlockedSouvenirIds().length)
      travelTutorial(this, this.controls, 'souvenir', () => this.render());
    else if (this.session.charges > 0) travelTutorial(this, this.controls, 'departure', () => this.render());
  }
}
