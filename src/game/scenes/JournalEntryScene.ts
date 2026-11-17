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
    this.data.set('forest-visitor-arriving', welcome);
    const texts = getTexts();
    const entry = id === undefined ? undefined : getDestinationTexts(id);
    if (id === undefined || !entry || !progressStore.read().discoveredDestinationIds.includes(id)) {
      this.scene.start('journal', { page, returnTo });
      return;
    }
    const postcard = destinations.findIndex(destination => destination.id === id);
    const invitation = id === 'cimes_eternelles' && progressStore.unlockedSouvenirIds().includes(id)
      && !progressStore.read().awakenedMycelia ? '\n\n' + texts.adventure.bellWish : '';
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
      description: entry.story + invitation + (hasPostcard(this, postcard) ? '' : '\n\n' + texts.notebook.placeholder),
      postcard,
      souvenir: souvenirForDestination(id, progressStore.read().discoveredDestinationIds),
      souvenirLocked: !progressStore.unlockedSouvenirIds().includes(id),
      decoratePostcard: () => journalPouch(this, id, () => this.scene.restart({ id, page, returnTo,
        welcome: id === 'foret_du_silence' })),
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
