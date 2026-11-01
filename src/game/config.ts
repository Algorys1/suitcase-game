import Phaser from 'phaser';
import { HomeScene } from './scenes/HomeScene';
import { PlaceholderScene } from './scenes/PlaceholderScene';
import { PreparationScene } from './scenes/PreparationScene';
import { ResultScene } from './scenes/ResultScene';
import { SummaryScene } from './scenes/SummaryScene';
import { JournalScene } from './scenes/JournalScene';
import { JournalEntryScene } from './scenes/JournalEntryScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#fff4df',
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: '100%',
    height: '100%',
  },
  audio: { noAudio: true },
  scene: [HomeScene, PreparationScene, ResultScene, SummaryScene, JournalScene, JournalEntryScene, PlaceholderScene],
};
