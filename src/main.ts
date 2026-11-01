import Phaser from 'phaser';
import { gameConfig } from './game/config';
import './style.css';

const game = new Phaser.Game(gameConfig);

// Avoid keeping a second canvas or input listeners after a Vite hot update.
if (import.meta.hot) {
  import.meta.hot.dispose(() => game.destroy(true));
}
