import Phaser from 'phaser';
import { getTexts } from '../../services/i18n';
import { createMenu } from '../ui/menu';
import { createSession } from '../../domain/session';
import { progressStore } from '../../services/storage';
import { destinations } from '../../domain/recipes';

export class HomeScene extends Phaser.Scene {
  constructor() {
    super('home');
  }

  create(): void {
    const texts = getTexts();

    createMenu(this, {
      title: texts.title,
      description: texts.invitation,
      home: true,
      footer: texts.notebook.progress.replace('{count}', String(progressStore.read().discoveredDestinationIds.length))
        .replace('{total}', String(destinations.length)),
      buttons: [
        { name: 'start', label: texts.start, action: () => this.scene.start('preparation', { session: createSession() }), primary: true },
        { name: 'journal', label: texts.journal, action: () => this.scene.start('journal', { page: 0 }) },
        { name: 'settings', label: texts.settings, action: () => this.scene.start('settings') },
      ],
    });
  }
}
