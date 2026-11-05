import Phaser from 'phaser';
import { getTexts, getDestinationTexts } from '../../services/i18n';
import { BALANCE } from '../../domain/compass';
import { continueSession } from '../../domain/session';
import type { SessionState } from '../../domain/session';
import { createMenu } from '../ui/menu';
import { progressStore } from '../../services/storage';
import { souvenirForDestination } from '../../domain/souvenirs';
import { AdventureControls, mapText } from '../ui/adventureMap';
import { drawDestinationStage } from '../ui/destinationStage';
import { drawSouvenir } from '../ui/souvenir';

export class ResultScene extends Phaser.Scene {
  constructor() { super('result'); }

  create({ session }: { session?: SessionState } = {}): void {
    const texts = getTexts();
    const trip = session?.lastTrip;
    if (!session || session.phase !== 'result' || !trip) { this.scene.start('home'); return; }
    progressStore.saveSession(session);
    if (trip.destinationId) { this.showDestination(session, trip.destinationId); return; }
    const cost = texts.journey.cost.replace('{cost}', String(trip.cost))
      .replace('{charges}', String(session.charges)).replace('{max}', String(BALANCE.initialCharges));
    this.cameras.main.setBackgroundColor('#24243e');
    createMenu(this, {
      title: texts.journey.voidTitle,
      description: texts.journey.voidStory, void: true,
      detail: cost,
      footer: progressStore.persistent ? undefined : texts.notebook.unavailable,
      buttons: [{
        label: texts.adventure.backToMap,
        name: 'continue', primary: true,
        action: () => {
          const next = continueSession(session);
          progressStore.saveSession(next);
          this.scene.start('adventure', { session: next });
        },
      }],
    });
  }

  private showDestination(session: SessionState, id: string): void {
    const controls = new AdventureControls(this);
    let first = true;
    const leave = (explore: boolean) => {
      const next = continueSession(session);
      progressStore.saveSession(next);
      this.scene.start(explore ? 'exploration' : 'adventure', { session: next, id, fromResult: true });
    };
    const render = () => {
      this.tweens.killAll();
      this.children.getAll().forEach(child => child.destroy());
      controls.clear();
      const stage = drawDestinationStage(this, id, session, first);
      first = false;
      const texts = getTexts();
      const { sideX: x, sideW: w, bodyY, stickerY, portrait, short } = stage;
      const caption = session.lastTrip?.isNewDiscovery ? texts.notebook.newDiscovery : texts.notebook.alreadyVisited;
      mapText(this, x, bodyY, `${caption} · −${session.lastTrip?.cost ?? 1}`, 11, w - 10, '#a17a39').setName('postcard-caption');
      const story = mapText(this, x, bodyY + 20, getDestinationTexts(id)?.story ?? '', portrait || short ? 13 : 15,
        w - 14, '#6d5844').setFontFamily('Georgia, serif').setOrigin(0.5, 0).setName('menu-description');
      let size = portrait || short ? 13 : 15;
      while (story.height > stickerY - (short ? 28 : 47) - story.y && size > 10) story.setFontSize(--size);
      const souvenir = souvenirForDestination(id, progressStore.read().discoveredDestinationIds);
      const locked = !progressStore.unlockedSouvenirIds().includes(id);
      if (souvenir) drawSouvenir(this, souvenir, x, stickerY - 32, w, 64,
        session.lastTrip?.isNewDiscovery ?? false, locked);
      const paired = portrait || short;
      const buttonWidth = paired ? (w - 8) / 2 : Math.min(215, w - 18);
      controls.button('explore', texts.adventure.exploreShort, paired ? x - (buttonWidth + 8) / 2 : x,
        stage.primaryY, buttonWidth, () => leave(true), true);
      controls.button('continue', short ? texts.adventure.mapShort : texts.adventure.continueMap, paired ? x + (buttonWidth + 8) / 2 : x,
        stage.secondaryY, buttonWidth, () => leave(false));
      this.game.canvas.setAttribute('aria-label', getDestinationTexts(id)?.title ?? texts.title);
      if (!progressStore.persistent) mapText(this, this.scale.width / 2, this.scale.height - 16,
        texts.notebook.unavailable, 9, this.scale.width - 30);
    };
    render();
    this.scale.on('resize', render);
    this.events.once('shutdown', () => this.scale.off('resize', render));
  }
}
