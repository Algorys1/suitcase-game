import Phaser from 'phaser';
import texts from '../../data/fr.json';
import { destinations } from '../../domain/recipes';
import { progressStore } from '../../services/storage';
import { createMenu } from '../ui/menu';

const content: Record<string, { title: string; story: string }> = texts.destinations;

export class JournalEntryScene extends Phaser.Scene {
  constructor() { super('journal-entry'); }

  create({ id, page = 0 }: { id?: string; page?: number } = {}): void {
    const entry = id === undefined ? undefined : content[id];
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
