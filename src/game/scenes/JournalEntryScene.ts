import { beginSceneLoading, finishSceneLoading, queueWorldAssets, sceneWorldIds } from '../ui/assetLoading';
import Phaser from 'phaser';
import { getTexts, getDestinationTexts } from '../../services/i18n';
import { destinations } from '../../domain/recipes';
import { progressStore } from '../../services/storage';
import { createMenu } from '../ui/menu';
import { hasPostcard } from '../ui/postcard';
import { souvenirForDestination } from '../../domain/souvenirs';
import { bookBusy, captureJournal } from '../ui/notebookMotion';
import type { PageDirection } from '../ui/notebookMotion';
import { preloadTravelSpyglass } from '../ui/travelSpyglass';
import { preloadSouvenirs } from '../ui/souvenir';
import { journalPouch } from '../ui/journalPouch';

export class JournalEntryScene extends Phaser.Scene {
  constructor() { super('journal-entry'); }

  preload(): void {
    beginSceneLoading(this);
    queueWorldAssets(this, sceneWorldIds(this), false);
    preloadTravelSpyglass(this);
    preloadSouvenirs(this, progressStore.unlockedSouvenirIds());
  }

  create({ id, page = 0, turn, returnTo, welcome = false }: {
    id?: string; page?: number; turn?: PageDirection; returnTo?: 'adventure'; welcome?: boolean;
  } = {}): void {
    if (!finishSceneLoading(this)) return;
    this.data.set('octopus-arriving', welcome && id === 'recif_de_verre');
    this.data.set('frog-arriving', welcome && id === 'marais_des_lucioles');
    this.data.set('yeti-arriving', welcome && id === 'palais_de_givre');
    this.data.set('griffin-arriving', welcome && id === 'vestiges_celestes');
    this.data.set('dragon-arriving', welcome && id === 'royaume_des_spores_celestes');
    this.data.set('shore-visitor-arriving', welcome);
    this.data.set('axolotl-arriving', welcome && id === 'ruines_englouties');
    this.data.set('fennec-arriving', welcome && id === 'empire_des_sables');
    this.data.set('forest-visitor-arriving', welcome && id === 'foret_du_silence');
    this.data.set('city-visitor-arriving', welcome && id === 'cite_immobile');
    this.data.set('sea-visitor-arriving', welcome && id === 'mer_figee');
    const texts = getTexts();
    const entry = id === undefined ? undefined : getDestinationTexts(id);
    if (id === undefined || !entry || !progressStore.read().discoveredDestinationIds.includes(id)) {
      this.scene.start('journal', { page, returnTo });
      return;
    }
    const postcard = destinations.findIndex(destination => destination.id === id);
    const known = destinations.filter(destination => progressStore.read().discoveredDestinationIds.includes(destination.id));
    const position = known.findIndex(destination => destination.id === id);
    const navigate = (target: string | undefined, direction: PageDirection) => {
      if (bookBusy(this)) return;
      const animate = captureJournal(this);
      this.data.set('book-busy', true);
      this.scene.start(target ? 'journal-entry' : 'journal', { id: target, page, returnTo, turn: animate ? direction : undefined });
    };
    createMenu(this, {
      title: entry.title,
      caption: texts.tutorial.discovered,
      description: entry.story + (hasPostcard(this, postcard) ? '' : '\n\n' + texts.notebook.placeholder),
      postcard,
      souvenir: souvenirForDestination(id, progressStore.read().discoveredDestinationIds),
      souvenirLocked: !progressStore.unlockedSouvenirIds().includes(id),
      decoratePostcard: () => journalPouch(this, id, () => this.scene.restart({ id, page, returnTo,
        welcome: id === 'foret_du_silence' || id === 'cite_immobile' || id === 'mer_figee' || id === 'empire_des_sables' || id === 'recif_de_verre' || id === 'marais_des_lucioles' || id === 'palais_de_givre' || id === 'vestiges_celestes' || id === 'royaume_des_spores_celestes' || id === 'ruines_englouties' || id === 'archipel_azur' || id === 'ile_des_cendres' || id === 'desert_de_cristal' })),
      buttons: [{ name: 'explore', label: texts.adventure.explore, spyglass: true,
        action: () => this.scene.start('exploration', { id, journalPage: page, returnTo }) },
      { name: 'back-to-journal', label: texts.notebook.backToContents, primary: true,
        action: () => navigate(undefined, 'previous') }],
      bookNavigation: {
        turn,
        previous: { name: 'previous-entry', label: texts.notebook.previousEntry, disabled: position === 0,
          action: () => navigate(known[position - 1]?.id, 'previous') },
        next: { name: 'next-entry', label: texts.notebook.nextEntry, disabled: position === known.length - 1,
          action: () => navigate(known[position + 1]?.id, 'next') },
      },
    });
  }
}
