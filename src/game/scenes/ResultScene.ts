import Phaser from 'phaser';
import { getTexts, getDestinationTexts } from '../../services/i18n';
import { BALANCE } from '../../domain/compass';
import { continueSession } from '../../domain/session';
import type { SessionState } from '../../domain/session';
import { createMenu } from '../ui/menu';
import { destinations } from '../../domain/recipes';
import { progressStore } from '../../services/storage';
import { hasPostcard } from '../ui/postcard';
import { souvenirForDestination } from '../../domain/souvenirs';

export class ResultScene extends Phaser.Scene {
  constructor() { super('result'); }

  create({ session }: { session?: SessionState } = {}): void {
    const texts = getTexts();
    const trip = session?.lastTrip;
    if (!session || session.phase !== 'result' || !trip) { this.scene.start('home'); return; }
    const destination = trip.destinationId === null ? null : getDestinationTexts(trip.destinationId);
    const cost = texts.journey.cost.replace('{cost}', String(trip.cost))
      .replace('{charges}', String(session.charges)).replace('{max}', String(BALANCE.initialCharges));
    const postcard = destinations.findIndex(entry => entry.id === trip.destinationId);
    const description = destination
      ? destination.story + (hasPostcard(this, postcard) ? '' : '\n\n' + texts.journey.artwork)
      : texts.journey.voidStory;
    const isVoid = trip.destinationId === null;
    this.cameras.main.setBackgroundColor(isVoid ? '#24243e' : '#fff4df');
    createMenu(this, {
      title: isVoid ? texts.journey.voidTitle : destination?.title ?? texts.journey.unknown,
      description, dark: isVoid, void: isVoid,
      caption: isVoid ? undefined : (trip.isNewDiscovery ? texts.notebook.newDiscovery : texts.notebook.alreadyVisited),
      detail: cost,
      reveal: isVoid ? undefined : trip.isNewDiscovery ? 'new' : 'revisit',
      postcard: isVoid ? undefined : postcard,
      souvenir: souvenirForDestination(trip.destinationId, progressStore.read().discoveredDestinationIds),
      footer: progressStore.persistent ? undefined : texts.notebook.unavailable,
      buttons: [{
        label: session.charges === 0 ? texts.journey.finish : texts.journey.continue,
        name: 'continue', primary: true,
        action: () => {
          const next = continueSession(session);
          this.scene.start(next.phase === 'ended' ? 'summary' : 'preparation', { session: next });
        },
      }],
    });
  }
}
