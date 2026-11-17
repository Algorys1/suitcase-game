import { beginSceneLoading, finishSceneLoading } from '../ui/assetLoading';
import Phaser from 'phaser';
import { getTexts } from '../../services/i18n';
import { createMenu } from '../ui/menu';
import { createSession } from '../../domain/session';
import { progressStore } from '../../services/storage';
import { destinations } from '../../domain/recipes';
import { approachJournal, bookBusy } from '../ui/notebookMotion';
import { departFromHome } from '../ui/homeDeparture';
import { preloadHomeVisitors } from '../ui/souvenirVisitors';

export class HomeScene extends Phaser.Scene {
  constructor() {
    super('home');
  }

  preload(): void {
    beginSceneLoading(this);
    preloadHomeVisitors(this);
    for (const [key, path] of [
      ['preparation-travel_desk', 'preparation/travel_desk.webp'],
      ['preparation-suitcase_closed', 'preparation/suitcase_closed.webp'],
      ['journal-closed', 'journal/closed.webp'], ['home-departure', 'home/departure.webp'],
    ]) {
      if (key && path && !this.textures.exists(key)) this.load.image(key, `${import.meta.env.BASE_URL}assets/${path}`);
    }
  }

  create(): void {
    if (!finishSceneLoading(this)) return;
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
            if (bookBusy(this)) return;
            const session = progressStore.read().expedition ?? createSession();
            progressStore.saveSession(session);
            departFromHome(this, session, fromHome =>
              this.scene.start(session.phase === 'result' ? 'result' : 'adventure', { session, fromHome }));
          }, primary: true },
        { name: 'journal', label: texts.journal,
          action: () => approachJournal(this, opening => this.scene.start('journal', { page: 0, opening })) },
        { name: 'settings', label: texts.settings, action: () => this.scene.start('settings') },
        { name: 'replay-intro', label: texts.intro.replay, action: () => this.scene.start('intro', { replay: true }) },
      ],
    });
  }
}
