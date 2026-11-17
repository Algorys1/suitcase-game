import Phaser from 'phaser';
import { HomeScene } from './scenes/HomeScene';
import { SettingsScene } from './scenes/SettingsScene';
import { PreparationScene } from './scenes/PreparationScene';
import { ResultScene } from './scenes/ResultScene';
import { SummaryScene } from './scenes/SummaryScene';
import { JournalScene } from './scenes/JournalScene';
import { JournalEntryScene } from './scenes/JournalEntryScene';
import { AdventureScene } from './scenes/AdventureScene';
import { ExplorationScene } from './scenes/ExplorationScene';
import { IntroScene } from './scenes/IntroScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#fff4df',
  render: { antialias: true, roundPixels: true, pixelArt: false, mipmapFilter: 'LINEAR_MIPMAP_LINEAR' },
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: '100%',
    height: '100%',
  },
  // One native HTMLAudio/Web Audio coordinator handles music, mute and short effects.
  audio: { noAudio: true },
  scene: [IntroScene, HomeScene, AdventureScene, ExplorationScene, PreparationScene, ResultScene, SummaryScene, JournalScene, JournalEntryScene, SettingsScene],
};
