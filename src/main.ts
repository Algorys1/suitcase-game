import Phaser from 'phaser';
import { gameConfig } from './game/config';
import './style.css';
import { applyLanguageToDocument } from './services/i18n';
import { installAudioControls } from './services/audio';

applyLanguageToDocument();
await document.fonts.load('600 16px "Travel Serif"').catch(() => []);
const game = new Phaser.Game(gameConfig);
const disposeAudio = installAudioControls();

// Avoid keeping a second canvas or input listeners after a Vite hot update.
if (import.meta.hot) {
  import.meta.hot.dispose(() => { disposeAudio(); game.destroy(true); });
}
