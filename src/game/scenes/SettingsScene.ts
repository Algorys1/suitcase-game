import Phaser from 'phaser';
import { getTexts, applyLanguageToDocument } from '../../services/i18n';
import { progressStore } from '../../services/storage';
import type { Language } from '../../services/storage';
import { createMenu } from '../ui/menu';
import { prepareIllustrationTextures } from '../ui/illustrationTextures';

export class SettingsScene extends Phaser.Scene {
  constructor() { super('settings'); }

  preload(): void {
    for (const layout of ['landscape', 'portrait']) {
      const key = `settings-${layout}`;
      if (!this.textures.exists(key)) this.load.image(key, `${import.meta.env.BASE_URL}assets/settings/${layout}.webp`);
    }
  }

  create({ stamp = false, confirmReset = false, resetUnavailable = false }: {
    stamp?: boolean; confirmReset?: boolean; resetUnavailable?: boolean;
  } = {}): void {
    prepareIllustrationTextures(this);
    // Scene data survives later visits in Phaser; consume this one-shot effect.
    this.sys.settings.data = { stamp: false };
    const texts = getTexts();
    if (resetUnavailable) {
      createMenu(this, { title: texts.preferences.resetTitle, description: texts.preferences.resetUnavailable,
        preferences: { stamp: false, confirmReset: true },
        buttons: [{ name: 'home', label: texts.back, primary: true, action: () => this.scene.start('home') }] });
      return;
    }
    if (confirmReset) {
      const cancel = () => this.scene.restart();
      const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') cancel(); };
      this.game.canvas.addEventListener('keydown', escape);
      this.events.once('shutdown', () => this.game.canvas.removeEventListener('keydown', escape));
      createMenu(this, {
        title: texts.preferences.resetTitle, description: texts.preferences.resetDescription,
        preferences: { stamp: false, confirmReset: true },
        buttons: [
          { name: 'reset-confirm', label: texts.preferences.resetConfirm, primary: true, action: () => {
            const persistent = progressStore.reset();
            applyLanguageToDocument();
            if (persistent) this.scene.start('home');
            else this.scene.restart({ resetUnavailable: true });
          } },
          { name: 'reset-cancel', label: texts.preferences.resetCancel, action: cancel },
        ],
      });
      return;
    }
    const current = progressStore.read().language;
    const choose = (language: Language): void => {
      if (language === current) return;
      progressStore.setLanguage(language);
      applyLanguageToDocument();
      this.scene.restart({ stamp: true });
    };
    createMenu(this, {
      title: texts.settings,
      preferences: { stamp },
      description: texts.preferences.description,
      footer: progressStore.persistent ? texts.preferences.saved : texts.notebook.unavailable,
      buttons: [
        { name: 'language-fr', label: texts.preferences.french,
          selected: current === 'fr', action: () => choose('fr') },
        { name: 'language-en', label: texts.preferences.english,
          selected: current === 'en', action: () => choose('en') },
        { name: 'home', label: texts.back, primary: true, action: () => this.scene.start('home') },
        { name: 'reset-progress', label: texts.preferences.reset,
          action: () => this.scene.restart({ confirmReset: true }) },
      ],
    });
  }
}
