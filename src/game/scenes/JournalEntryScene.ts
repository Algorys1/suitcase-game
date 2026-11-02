import Phaser from 'phaser';
import { getTexts, getDestinationTexts } from '../../services/i18n';
import { destinations } from '../../domain/recipes';
import { progressStore } from '../../services/storage';
import { createMenu } from '../ui/menu';
import { hasPostcard } from '../ui/postcard';
import { souvenirForDestination } from '../../domain/souvenirs';

export class JournalEntryScene extends Phaser.Scene {
  constructor() { super('journal-entry'); }

  create({ id, page = 0 }: { id?: string; page?: number } = {}): void {
    const texts = getTexts();
    const entry = id === undefined ? undefined : getDestinationTexts(id);
    if (id === undefined || !entry || !progressStore.read().discoveredDestinationIds.includes(id)) {
      this.scene.start('journal', { page });
      return;
    }
    const postcard = destinations.findIndex(destination => destination.id === id);
    createMenu(this, {
      title: entry.title,
      description: entry.story + (hasPostcard(this, postcard) ? '' : '\n\n' + texts.notebook.placeholder),
      postcard,
      souvenir: souvenirForDestination(id, progressStore.read().discoveredDestinationIds),
      buttons: [{ name: 'back-to-journal', label: texts.notebook.back, primary: true,
        action: () => this.scene.start('journal', { page }) }],
    });
  }
}
