import Phaser from 'phaser';
import texts from '../../data/fr.json';
import { createMenu } from '../ui/menu';

export type PlaceholderPage = 'journal' | 'settings';

export class PlaceholderScene extends Phaser.Scene {
  constructor() {
    super('placeholder');
  }

  create({ page }: { page: PlaceholderPage }): void {
    const titles: Record<PlaceholderPage, string> = {
      journal: texts.journal,
      settings: texts.settings,
    };

    createMenu(this, {
      title: titles[page],
      description: texts.temporary[page],
      buttons: [
        { label: texts.back, action: () => this.scene.start('home'), primary: true },
      ],
    });
  }
}
