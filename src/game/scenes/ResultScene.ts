import { beginSceneLoading, finishSceneLoading, queueWorldAssets, sceneWorldIds, queueVoidAssets } from '../ui/assetLoading';
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
import { destinationTravelTip, needsTravelTip } from '../ui/travelTutorial';
import { drawSouvenir } from '../ui/souvenir';
import { drawTravelSpyglass, preloadTravelSpyglass } from '../ui/travelSpyglass';
import type { Slots } from '../../domain/preparation';

export class ResultScene extends Phaser.Scene {
  constructor() { super('result'); }

  preload(): void {
    beginSceneLoading(this);
    queueWorldAssets(this, sceneWorldIds(this), true);
    preloadTravelSpyglass(this);
    const session = (this.sys.settings.data as { session?: SessionState } | undefined)?.session
      ?? progressStore.read().expedition;
    if (session?.lastTrip?.destinationId === null) queueVoidAssets(this);
  }

  create({ session, voidElements }: { session?: SessionState; voidElements?: Slots } = {}): void {
    if (!finishSceneLoading(this)) return;
    const texts = getTexts();
    const trip = session?.lastTrip;
    if (!session || session.phase !== 'result' || !trip) { this.scene.start('home'); return; }
    progressStore.saveSession(session);
    if (trip.destinationId) { this.showDestination(session, trip.destinationId); return; }
    this.data.set('void-elements', voidElements);
    this.data.set('void-charges', session.charges);
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
      const entering = first;
      const stage = drawDestinationStage(this, id, session, first, 'arrival');
      first = false;
      const texts = getTexts();
      const { sideX: x, sideW: w, bodyY, stickerY, portrait, short } = stage;
      const caption = session.lastTrip?.isNewDiscovery ? texts.notebook.newDiscovery : texts.notebook.alreadyVisited;
      mapText(this, x, bodyY, `${caption} · −${session.lastTrip?.cost ?? 1}`, 11, w - 10, '#a17a39').setName('postcard-caption');
      const story = mapText(this, x, bodyY + 20, getDestinationTexts(id)?.story ?? '', portrait || short ? 13 : 15,
        w - 14, '#6d5844').setFontFamily('Georgia, serif').setOrigin(0.5, 0).setName('menu-description');
      if (short) story.setLineSpacing(-1);
      let size = portrait || short ? 13 : 15;
      const tagHeight = portrait ? 92 : short ? 84 : 104;
      const storyBottom = portrait && needsTravelTip('arrival') ? this.scale.height - 195 : stickerY - tagHeight / 2 - 12;
      while (story.height > storyBottom - story.y && size > 10) story.setFontSize(--size);
      const souvenir = souvenirForDestination(id, progressStore.read().discoveredDestinationIds);
      const locked = !progressStore.unlockedSouvenirIds().includes(id);
      if (souvenir) drawSouvenir(this, souvenir, x, stickerY - tagHeight / 2, w, tagHeight,
        session.lastTrip?.isNewDiscovery ?? false, locked).forEach(part => part.setData('souvenir-part', true));
      const toolSize = portrait || short ? 72 : 98;
      const buttonWidth = Math.min(215, w - 18);
      drawTravelSpyglass(this, stage.art.left + stage.art.width - toolSize * 0.35,
        stage.art.top + stage.art.height - toolSize * 0.43, toolSize, () => leave(true), {
          animate: entering,
          register: (tx, ty, tw, th, action) => controls.add('explore', tx, ty, tw, th, action, false),
        });
      controls.button('continue', short ? texts.adventure.mapShort : texts.adventure.continueMap, x,
        stage.secondaryY, buttonWidth, () => leave(false));
      destinationTravelTip(this, controls, 'arrival', stage, render);
      this.game.canvas.setAttribute('aria-label', getDestinationTexts(id)?.title ?? texts.title);
      if (!progressStore.persistent) mapText(this, this.scale.width / 2, this.scale.height - 16,
        texts.notebook.unavailable, 9, this.scale.width - 30);
    };
    render();
    this.scale.on('resize', render);
    this.events.once('shutdown', () => this.scale.off('resize', render));
  }
}
