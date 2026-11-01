import Phaser from 'phaser';
import texts from '../../data/fr.json';
import { createMenu } from '../ui/menu';
import type { PlaceholderPage } from './PlaceholderScene';

export class HomeScene extends Phaser.Scene {
  constructor() {
    super('home');
  }

  create(): void {
    const open = (page: PlaceholderPage): void => {
      this.scene.start('placeholder', { page });
    };

    createMenu(this, {
      title: texts.title,
      description: texts.invitation,
      home: true,
      buttons: [
        { label: texts.start, action: () => this.scene.start('preparation'), primary: true },
        { label: texts.journal, action: () => open('journal') },
        { label: texts.settings, action: () => open('settings') },
      ],
    });
  }
}
