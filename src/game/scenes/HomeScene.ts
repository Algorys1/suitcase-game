import Phaser from 'phaser';
import { getTexts } from '../../services/i18n';
import { createMenu } from '../ui/menu';
import { createSession } from '../../domain/session';
import { progressStore } from '../../services/storage';
import { destinations } from '../../domain/recipes';
import { preloadPostcards } from '../ui/postcard';
import { preloadSouvenirs } from '../ui/souvenir';
import { prepareIllustrationTextures } from '../ui/illustrationTextures';
import { preloadPreparationArt } from '../ui/preparationArt';
import { approachJournal } from '../ui/notebookMotion';
import { preloadAdventureArt } from '../ui/adventureAssets';

export class HomeScene extends Phaser.Scene {
  constructor() {
    super('home');
  }

  preload(): void {
    if (!this.textures.exists('void-space')) {
      this.load.image('void-space', `${import.meta.env.BASE_URL}assets/void/space.webp`);
    }
    if (!this.textures.exists('journal-closed')) {
      this.load.image('journal-closed', `${import.meta.env.BASE_URL}assets/journal/closed.webp`);
    }
    if (!this.textures.exists('home-departure')) {
      this.load.image('home-departure', `${import.meta.env.BASE_URL}assets/home/departure.webp`);
    }
    preloadPostcards(this);
    preloadSouvenirs(this);
    preloadPreparationArt(this);
    preloadAdventureArt(this);
  }

  create(): void {
    prepareIllustrationTextures(this);
    const texts = getTexts();
    const expedition = progressStore.read().expedition;

    createMenu(this, {
      title: texts.title,
      description: texts.invitation,
      home: true,
      footer: texts.notebook.progress.replace('{count}', String(progressStore.read().discoveredDestinationIds.length))
        .replace('{total}', String(destinations.length)),
      buttons: [
        { name: 'start', label: expedition ? texts.resume : texts.start,
          action: () => {
            const session = progressStore.read().expedition ?? createSession();
            this.scene.start(session.phase === 'result' ? 'result' : 'adventure', { session });
          }, primary: true },
        { name: 'journal', label: texts.journal,
          action: () => approachJournal(this, opening => this.scene.start('journal', { page: 0, opening })) },
        { name: 'settings', label: texts.settings, action: () => this.scene.start('settings') },
      ],
    });
  }
}
