import Phaser from 'phaser';
import { getTexts, getDestinationTexts } from '../../services/i18n';
import { destinations } from '../../domain/recipes';
import { progressStore } from '../../services/storage';
import { createMenu } from '../ui/menu';

export class JournalEntryScene extends Phaser.Scene {
  constructor() { super('journal-entry'); }

  create({ id, page = 0 }: { id?: string; page?: number } = {}): void {
    const texts = getTexts();
    const entry = id === undefined ? undefined : getDestinationTexts(id);
    if (id === undefined || !entry || !progressStore.read().discoveredDestinationIds.includes(id)) {
      this.scene.start('journal', { page });
      return;
    }
    createMenu(this, {
      title: entry.title,
      description: entry.story + '\n\n' + texts.notebook.placeholder,
      postcard: destinations.findIndex(destination => destination.id === id),
      buttons: [{ name: 'back-to-journal', label: texts.notebook.back, primary: true,
        action: () => this.scene.start('journal', { page }) }],
    });
  }
}
