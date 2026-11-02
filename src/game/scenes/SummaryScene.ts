import Phaser from 'phaser';
import { getTexts, getDestinationTexts } from '../../services/i18n';
import type { SessionState } from '../../domain/session';
import { createMenu } from '../ui/menu';
import { progressStore } from '../../services/storage';
import { destinations } from '../../domain/recipes';

export class SummaryScene extends Phaser.Scene {
  constructor() { super('summary'); }

  create({ session }: { session?: SessionState } = {}): void {
    if (!session || session.phase !== 'ended') { this.scene.start('home'); return; }
    const ids = [...new Set(session.visitedDestinationIds)];
    let page = 0;
    const pages = Math.max(1, Math.ceil(ids.length / 2));
    let dispose: (() => void) | undefined;
    const render = (): void => {
      const texts = getTexts();
      dispose?.();
      const places = ids.slice(page * 2, page * 2 + 2).map(id => texts.journey.visits
        .replace('{name}', (session.newlyDiscoveredIds.includes(id) ? texts.notebook.newMarker + ' ' : '')
          + (getDestinationTexts(id)?.title ?? texts.journey.unknown))
        .replace('{count}', String(session.visitedDestinationIds.filter(visited => visited === id).length)));
      dispose = createMenu(this, {
        title: texts.journey.summaryTitle,
        footer: texts.notebook.progress.replace('{count}', String(progressStore.read().discoveredDestinationIds.length))
          .replace('{total}', String(destinations.length)),
        description: texts.journey.summaryStats.replace('{count}', String(ids.length)).replace('{void}', String(session.voidTrips))
          + '\n\n' + (places.length ? places.join('\n') : texts.journey.noVisits),
        buttons: [
          ...(pages > 1 ? [{
            name: 'more-places', fontSize: 16,
            label: texts.journey.nextPlaces.replace('{page}', String(page + 1)).replace('{pages}', String(pages)),
            action: () => { page = (page + 1) % pages; render(); },
          }] : []),
          { name: 'home', label: texts.back, primary: true, action: () => this.scene.start('home') },
        ],
      });
    };
    render();
  }
}
