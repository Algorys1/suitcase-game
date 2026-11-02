import Phaser from 'phaser';
import { getTexts, applyLanguageToDocument } from '../../services/i18n';
import { progressStore } from '../../services/storage';
import type { Language } from '../../services/storage';
import { createMenu } from '../ui/menu';

export class SettingsScene extends Phaser.Scene {
  constructor() { super('settings'); }

  create(): void {
    const texts = getTexts();
    const current = progressStore.read().language;
    const choose = (language: Language): void => {
      if (language === current) return;
      progressStore.setLanguage(language);
      applyLanguageToDocument();
      this.scene.restart();
    };
    createMenu(this, {
      title: texts.settings,
      description: texts.preferences.description,
      footer: progressStore.persistent ? texts.preferences.saved : texts.notebook.unavailable,
      buttons: [
        { name: 'language-fr', label: (current === 'fr' ? '✓ ' : '') + texts.preferences.french,
          selected: current === 'fr', action: () => choose('fr') },
        { name: 'language-en', label: (current === 'en' ? '✓ ' : '') + texts.preferences.english,
          selected: current === 'en', action: () => choose('en') },
        { name: 'home', label: texts.back, primary: true, action: () => this.scene.start('home') },
      ],
    });
  }
}
