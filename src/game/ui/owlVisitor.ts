import Phaser from 'phaser';
import { progressStore } from '../../services/storage';
import type { WorldFrame } from './pilotWorlds';

const resting = 'adventure-owl-resident';
const wings = 'adventure-owl-resident-wings';

export function animateOwl(scene: Phaser.Scene, owl: Phaser.GameObjects.Image): void {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sparks = scene.add.graphics().setName('owl-sparks');
  let greeting: Phaser.Tweens.Tween | undefined;
  const reset = () => {
    greeting?.stop();
    greeting = undefined;
    owl.setTexture(resting).setAngle(0);
    sparks.clear();
  };
  owl.setInteractive().on('pointerdown', () => {
    if (motion.matches || greeting || scene.data.get('book-busy')) return;
    greeting = scene.tweens.addCounter({ from: 0, to: 1, duration: 740,
      onUpdate: tween => {
        const t = tween.getValue() ?? 0;
        owl.setAngle(-9 * Math.sin(Math.PI * t));
        owl.setTexture(t >= 0.28 && t < 0.72 ? wings : resting);
        sparks.clear();
        if (t < 0.28) return;
        const fall = (t - 0.28) / 0.72;
        const size = owl.displayHeight;
        for (let i = -1; i <= 1; i++) {
          const x = owl.x + i * size * (0.28 + 0.2 * fall);
          const y = owl.y + size * (-0.64 + 0.58 * fall + Math.abs(i) * 0.11);
          sparks.fillStyle(0xffdd95, 1 - fall).fillCircle(x, y, Math.max(1, size * 0.037));
        }
      }, onComplete: reset });
  });
  motion.addEventListener('change', reset);
  owl.once('destroy', () => {
    greeting?.stop();
    motion.removeEventListener('change', reset);
    sparks.destroy();
  });
}

export function drawOwlVisitor(scene: Phaser.Scene, art: WorldFrame): Phaser.GameObjects.Image[] {
  const pebbleKey = 'souvenir-iles_suspendues';
  if (!progressStore.read().welcomedObservatoryVisitor
    || ![pebbleKey, resting, wings].every(key => scene.textures.exists(key))) return [];
  const { left, top, width, height } = art;
  const pebbleY = top + height * 0.565;
  const pebble = scene.add.image(left + width * 0.70, pebbleY, pebbleKey).setName('observatory-offered-pebble');
  pebble.setScale(height * 0.073 / pebble.height);
  const owl = scene.add.image(left + width * 0.79, top + height * 0.697, resting)
    .setOrigin(0.5, 1).setName('observatory-visitor');
  owl.setScale(height * 0.177 / owl.height);
  animateOwl(scene, owl);
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let floating: Phaser.Tweens.Tween | undefined;
  const float = () => {
    floating?.stop(); floating = undefined;
    pebble.setY(pebbleY);
    if (!motion.matches) floating = scene.tweens.add({ targets: pebble, y: pebbleY - height * 0.018,
      duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
  };
  float();
  motion.addEventListener('change', float);
  pebble.once('destroy', () => { floating?.stop(); motion.removeEventListener('change', float); });
  return [pebble, owl];
}
