import Phaser from 'phaser';
import type { SessionState } from '../../domain/session';
import { destinationById } from '../../domain/recipes';
import { explorationComplete, isPilot, pilotTargets } from '../../domain/pilotExploration';
import type { PilotId } from '../../domain/pilotExploration';
import { progressStore } from '../../services/storage';
import { getTexts } from '../../services/i18n';
import { souvenirs } from '../../domain/souvenirs';
import { AdventureControls, mapText, reducedMotion } from '../ui/adventureMap';
import { drawDestinationStage } from '../ui/destinationStage';
import { drawSouvenir } from '../ui/souvenir';
import { drawCimesSunrise, drawMyceliaLife } from '../ui/pilotWorlds';
import { travelTutorial } from '../ui/travelTutorial';
import { addArchipelagoReflections } from '../ui/archipelagoReflections';

export class ExplorationScene extends Phaser.Scene {
  private id = '';
  private session: SessionState | undefined;
  private fromJournal = false;
  private journalPage = 0;
  private returnTo: 'adventure' | undefined;
  private controls!: AdventureControls;
  private offering = false;
  private justFound = false;
  private enter = true;
  private waking = false;
  private celebrate = false;
  private lastTouched: number | undefined;
  private lastActivated = false;
  private greet = () => {};
  constructor() { super('exploration'); }

  create({ id, session, fromResult = false, journalPage = 0, returnTo }: {
    id?: string; session?: SessionState; fromResult?: boolean; journalPage?: number; returnTo?: 'adventure';
  } = {}): void {
    if (!id || !destinationById(id) || !progressStore.read().discoveredDestinationIds.includes(id)) {
      this.scene.start('home'); return;
    }
    this.id = id;
    this.session = session ?? progressStore.read().expedition;
    this.fromJournal = session === undefined;
    this.journalPage = journalPage;
    this.returnTo = returnTo;
    this.offering = false;
    this.justFound = false;
    this.enter = !fromResult;
    this.waking = false;
    this.celebrate = false;
    this.lastTouched = undefined;
    this.lastActivated = false;
    this.controls = new AdventureControls(this);
    this.render();
    this.scale.on('resize', this.render, this);
    this.events.once('shutdown', () => this.scale.off('resize', this.render, this));
  }

  private back(): void {
    this.scene.start(!this.fromJournal && this.session ? 'adventure' : 'journal-entry',
      !this.fromJournal && this.session ? { session: this.session }
        : { id: this.id, page: this.journalPage, returnTo: this.returnTo });
  }

  private touch(id: PilotId, index: number, x: number, y: number): void {
    const result = progressStore.touchExploration(id, index);
    this.lastTouched = index;
    this.lastActivated = result.activated;
    this.celebrate = result.collected;
    this.justFound ||= result.collected;
    this.render();
    if (result.collected) this.collectSouvenir(x, y);
    if (id === 'mycelia' && !result.activated && !reducedMotion()) {
      const window = this.children.getByName(`mycelia-window-${index}`) as Phaser.GameObjects.Image | null;
      if (window) this.tweens.add({ targets: window, alpha: { from: 0.45, to: 1 }, duration: 240 });
    }
  }

  private render(): void {
    this.tweens.killAll();
    this.children.getAll().forEach(child => child.destroy());
    this.controls.clear();
    const copy = getTexts().adventure;
    const progress = progressStore.read();
    const found = progressStore.unlockedSouvenirIds().includes(this.id);
    const awake = this.id === 'mycelia' && !!progress.awakenedMycelia;
    const steps = isPilot(this.id) ? progressStore.explorationSteps(this.id) : [];
    const complete = isPilot(this.id) ? explorationComplete(this.id, steps) : found;
    const souvenir = souvenirs.find(entry => entry.destinationId === this.id);
    const stage = drawDestinationStage(this, this.id, this.session,
      this.enter && !isPilot(this.id) && this.id !== 'archipel_azur');
    this.enter = false;
    const { left, top, width: artW, height: artH } = stage.art;
    const { sideX, sideW, stickerY: tagY, portrait, short } = stage;
    if (this.id === 'cimes_eternelles') drawCimesSunrise(this, stage.art, complete, this.celebrate, this.lastTouched);
    this.greet = this.id === 'mycelia' ? drawMyceliaLife(this, stage.art, awake, this.waking, steps,
      this.lastActivated ? this.lastTouched : undefined) : () => {};
    this.waking = false;
    this.celebrate = false;
    this.lastTouched = undefined;
    this.lastActivated = false;
    const instruction = this.offering ? copy.placeBell : !complete
      ? this.id === 'cimes_eternelles' ? copy.peaksMood : this.id === 'mycelia' ? copy.windowsMood : copy.search
      : awake ? copy.awakened : this.id === 'cimes_eternelles' ? copy.sunrise : copy.explored;
    mapText(this, sideX, stage.bodyY + 12, instruction, portrait || short ? 12 : 15, sideW - 15)
      .setFontFamily('Georgia, serif').setName('exploration-instruction');

    if (isPilot(this.id)) {
      const pilot = this.id;
      pilotTargets[pilot].forEach((target, index) => {
        const x = left + artW * target.x, y = top + artH * target.y;
        this.controls.add(`${pilot === 'mycelia' ? 'window' : 'peak'}-${index}`, x, y, 44, 44,
          () => this.touch(pilot, index, x, y), false);
      });
    } else if (!found) {
      // Other destinations retain their provisional interaction without sparkle markers.
      const seed = [...this.id].reduce((n, char) => n + char.charCodeAt(0), 0);
      const x = left + artW * (0.32 + seed % 4 * 0.1), y = top + artH * 0.58;
      this.controls.add('find-souvenir', x, y, 58, 58, () => {
        if (progressStore.explore(this.id)) { this.justFound = true; this.render(); this.collectSouvenir(x, y); }
      }, false);
    }

    if (this.id === 'archipel_azur') addArchipelagoReflections(this, this.controls, stage.art);

    const canOffer = this.id === 'mycelia' && progressStore.unlockedSouvenirIds().includes('cimes_eternelles')
      && !awake && this.session?.visitedDestinationIds.includes('mycelia');
    if ((canOffer && this.offering) || awake) {
      const bx = left + artW * 0.68, hook = top + artH * 0.53;
      const cord = this.add.graphics().setName('bell-cord').lineStyle(Math.max(1, artW * 0.0025), 0x735136);
      cord.beginPath().moveTo(left + artW * 0.705, top + artH * 0.505)
        .lineTo(left + artW * 0.697, top + artH * 0.518).lineTo(bx, hook).strokePath();
      cord.fillStyle(0xb9955f).fillCircle(bx, hook, Math.max(1, artW * 0.003));
      const bell = this.add.image(bx, hook, 'souvenir-cimes_eternelles').setOrigin(0.5, 0.07).setName('bell-in-world');
      bell.setScale(artH * 0.11 / bell.height).setAlpha(awake ? 1 : 0.45);
      if (this.offering || complete) this.controls.add('place-bell', bx, hook + artH * 0.05, 48, 44, () => {
        if (!awake && !progressStore.offerBell()) return;
        this.offering = false;
        this.waking = !awake;
        this.render();
        if (awake) this.greet();
      });
    }
    if (awake) this.controls.add('greet-mycelia', left + artW * 0.603, top + artH * 0.68, 48, 44, () => this.greet());

    if (souvenir) {
      const parts = drawSouvenir(this, souvenir, sideX, tagY - 32, sideW, 64, this.justFound, !found);
      parts.find(object => object.name === `souvenir-${this.id}`)?.setName('exploration-sticker');
      parts.find(object => object.name === 'souvenir-name')?.setName('exploration-souvenir-name');
    }
    if (canOffer) {
      const panelW = Math.min(220, artW - 24), panelX = left + 12, panelY = top + artH - 50;
      this.add.graphics().setName('offering-panel').fillStyle(0x4d3828, 0.15)
        .fillRoundedRect(panelX + 2, panelY + 3, panelW, 46, 4)
        .fillStyle(0xf6e4bf, 0.97).lineStyle(1, 0xad8e5b)
        .fillRoundedRect(panelX, panelY, panelW, 46, 4).strokeRoundedRect(panelX, panelY, panelW, 46, 4);
      const token = this.add.image(panelX + 24, panelY + 24, 'souvenir-cimes_eternelles');
      token.setScale(Math.min(33 / token.width, 33 / token.height));
      mapText(this, panelX + panelW / 2 + 14, panelY + 11, copy.travellingSouvenir, 9, panelW - 55, '#9b7948');
      mapText(this, panelX + panelW / 2 + 14, panelY + 30,
        this.offering ? copy.cancelOffer : copy.offerBell, 12, panelW - 55).setFontStyle('bold');
      this.controls.add('offer-bell', panelX + panelW / 2, panelY + 23, panelW, 46,
        () => { this.offering = !this.offering; this.render(); });
    }
    if (!canOffer) {
      const hint = found && this.id === 'cimes_eternelles' && !progress.awakenedMycelia ? copy.bellWish
        : this.justFound ? copy.found : copy.takeTime;
      mapText(this, sideX, tagY - (portrait ? 58 : 66), hint, portrait || short ? 11 : 12, sideW - 12, '#a07f4b')
        .setFontFamily('Georgia, serif').setFontStyle('italic').setName('exploration-hint');
    }
    this.controls.button('back-to-map', !this.fromJournal ? (short ? copy.mapShort : copy.backToMap) : getTexts().notebook.back,
      sideX, stage.secondaryY, Math.min(220, sideW - 15), () => this.back());
    if (!found) travelTutorial(this, this.controls, 'exploration', () => this.render());
    else if (this.justFound) travelTutorial(this, this.controls, 'souvenir', () => this.render());
  }

  private collectSouvenir(x: number, y: number): void {
    if (reducedMotion() || this.children.getByName('tutorial-paper')) return;
    const target = this.children.getByName('exploration-sticker') as Phaser.GameObjects.Image | null;
    if (!target) return;
    const flying = this.add.image(x, y, `souvenir-${this.id}`).setName('souvenir-flying');
    const scale = target.scaleX;
    const curve = new Phaser.Curves.CubicBezier(new Phaser.Math.Vector2(x, y),
      new Phaser.Math.Vector2(x + 35, y - 65), new Phaser.Math.Vector2(target.x - 55, target.y - 95),
      new Phaser.Math.Vector2(target.x, target.y));
    target.setAlpha(0);
    const state = { p: 0 };
    this.tweens.add({ targets: state, p: 1, duration: 800, ease: 'Sine.InOut', onUpdate: () => {
      const point = curve.getPoint(state.p);
      flying.setPosition(point.x, point.y).setScale(scale * (0.55 + Math.sin(state.p * Math.PI) * 0.8 + state.p * 0.45))
        .setAngle(-14 + Math.sin(state.p * Math.PI) * 20);
    }, onComplete: () => { flying.destroy(); target.setAlpha(1); } });
  }
}
