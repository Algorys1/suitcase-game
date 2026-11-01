import Phaser from 'phaser';
import texts from '../../data/fr.json';
import { BALANCE } from '../../domain/compass';
import { continueSession } from '../../domain/session';
import type { SessionState } from '../../domain/session';
import { createMenu } from '../ui/menu';
import { destinations } from '../../domain/recipes';
import { progressStore } from '../../services/storage';

const content: Record<string, { title: string; story: string }> = texts.destinations;

export class ResultScene extends Phaser.Scene {
  constructor() { super('result'); }

  create({ session }: { session?: SessionState } = {}): void {
    const trip = session?.lastTrip;
    if (!session || session.phase !== 'result' || !trip) { this.scene.start('home'); return; }
    const destination = trip.destinationId === null ? null : content[trip.destinationId];
    const cost = texts.journey.cost.replace('{cost}', String(trip.cost))
      .replace('{charges}', String(session.charges)).replace('{max}', String(BALANCE.initialCharges));
    const description = destination
      ? [trip.isNewDiscovery ? texts.notebook.newDiscovery : texts.notebook.alreadyVisited, cost, destination.story, texts.journey.artwork].join('\n\n')
      : [texts.journey.voidStory, cost].join('\n\n');
    const isVoid = trip.destinationId === null;
    this.cameras.main.setBackgroundColor(isVoid ? '#24243e' : '#fff4df');
    createMenu(this, {
      title: isVoid ? texts.journey.voidTitle : destination?.title ?? texts.journey.unknown,
      description, dark: isVoid,
      postcard: isVoid ? undefined : destinations.findIndex(entry => entry.id === trip.destinationId),
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
