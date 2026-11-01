import Phaser from 'phaser';
import texts from '../../data/fr.json';
import { createMenu } from '../ui/menu';
import type { PlaceholderPage } from './PlaceholderScene';
import { createSession } from '../../domain/session';
import { progressStore } from '../../services/storage';
import { destinations } from '../../domain/recipes';

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
      footer: texts.notebook.progress.replace('{count}', String(progressStore.read().discoveredDestinationIds.length))
        .replace('{total}', String(destinations.length)),
      buttons: [
        { label: texts.start, action: () => this.scene.start('preparation', { session: createSession() }), primary: true },
        { label: texts.journal, action: () => this.scene.start('journal', { page: 0 }) },
        { label: texts.settings, action: () => open('settings') },
      ],
    });
  }
}
