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

  create({ stamp = false }: { stamp?: boolean } = {}): void {
    prepareIllustrationTextures(this);
    // Scene data survives later visits in Phaser; consume this one-shot effect.
    this.sys.settings.data = { stamp: false };
    const texts = getTexts();
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
      ],
    });
  }
}
