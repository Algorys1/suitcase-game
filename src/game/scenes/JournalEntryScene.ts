import Phaser from 'phaser';
import { getTexts, getDestinationTexts } from '../../services/i18n';
import { destinations } from '../../domain/recipes';
import { progressStore } from '../../services/storage';
import { createMenu } from '../ui/menu';
import { hasPostcard } from '../ui/postcard';
import { souvenirForDestination } from '../../domain/souvenirs';
import { bookBusy, captureJournal } from '../ui/notebookMotion';
import type { PageDirection } from '../ui/notebookMotion';

export class JournalEntryScene extends Phaser.Scene {
  constructor() { super('journal-entry'); }

  create({ id, page = 0, turn }: { id?: string; page?: number; turn?: PageDirection } = {}): void {
    const texts = getTexts();
    const entry = id === undefined ? undefined : getDestinationTexts(id);
    if (id === undefined || !entry || !progressStore.read().discoveredDestinationIds.includes(id)) {
      this.scene.start('journal', { page });
      return;
    }
    const postcard = destinations.findIndex(destination => destination.id === id);
    const known = destinations.filter(destination => progressStore.read().discoveredDestinationIds.includes(destination.id));
    const position = known.findIndex(destination => destination.id === id);
    const navigate = (target: string | undefined, direction: PageDirection) => {
      if (bookBusy(this)) return;
      const animate = captureJournal(this);
      this.data.set('book-busy', true);
      this.scene.start(target ? 'journal-entry' : 'journal', { id: target, page, turn: animate ? direction : undefined });
    };
    createMenu(this, {
      title: entry.title,
      description: entry.story + (hasPostcard(this, postcard) ? '' : '\n\n' + texts.notebook.placeholder),
      postcard,
      souvenir: souvenirForDestination(id, progressStore.read().discoveredDestinationIds),
      buttons: [{ name: 'back-to-journal', label: texts.notebook.backToContents, primary: true,
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
