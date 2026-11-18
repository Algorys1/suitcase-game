import Phaser from 'phaser';
import { progressStore } from '../../services/storage';
import type { WorldFrame } from './pilotWorlds';

const resting = 'adventure-fennec-resident';

export function animateFennec(scene: Phaser.Scene, fennec: Phaser.GameObjects.Image): void {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scale = fennec.scaleY;
  let greeting: Phaser.Tweens.Tween | undefined;
  const reset = () => {
    greeting?.stop(); greeting = undefined;
    fennec.setScale(scale).setOrigin(0.5, 1);
  };
  fennec.setInteractive().on('pointerdown', () => {
    if (motion.matches || greeting || scene.data.get('book-busy')) return;
    greeting = scene.tweens.addCounter({ from: 0, to: 1, duration: 570, onUpdate: tween => {
      const phase = tween.getValue() ?? 0;
      const anticipation = Math.sin(Math.PI * Phaser.Math.Clamp(phase / 0.26, 0, 1));
      const jump = Phaser.Math.Clamp((phase - 0.26) / 0.74, 0, 1);
      fennec.setScale(scale * (1 + anticipation * 0.06), scale * (1 - anticipation * 0.12));
      fennec.setOrigin(0.5, 1 + Math.sin(jump * Math.PI) * 0.13);
    }, onComplete: reset });
  });
  motion.addEventListener('change', reset);
  fennec.once('destroy', () => { greeting?.stop(); motion.removeEventListener('change', reset); });
}

export function drawFennecVisitor(scene: Phaser.Scene, art: WorldFrame):
  Array<Phaser.GameObjects.Image | Phaser.GameObjects.Graphics> {
  const amuletKey = 'souvenir-temple_oublie';
  if (!progressStore.read().welcomedEmpireVisitor
    || ![amuletKey, resting].every(key => scene.textures.exists(key))) return [];
  const { left, top, width, height } = art;
  const x = left + width * 0.37, y = top + height * 0.735;
  const stem = scene.add.graphics().setName('oasis-sprout');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const paint = (growth: number) => {
    const length = height * 0.063 * growth;
    stem.clear().lineStyle(Math.max(1, height * 0.005), 0x556443)
      .lineBetween(x, y, x - length * 0.13, y - length);
    stem.fillStyle(0x8b9c51).fillEllipse(x - length * 0.33, y - length * 0.67, length * 0.49, length * 0.21)
      .fillStyle(0xb2af66).fillEllipse(x + length * 0.14, y - length * 0.87, length * 0.52, length * 0.23);
  };
  const amuletX = left + width * 0.675, amuletY = top + height * 0.883;
  const shadow = scene.add.graphics().fillStyle(0x774826, 0.20)
    .fillEllipse(amuletX + height * 0.006, amuletY + height * 0.010, height * 0.071, height * 0.025);
  const amulet = scene.add.image(amuletX, amuletY, amuletKey)
    .setName('oasis-offered-amulet').setAngle(24);
  amulet.setScale(height * 0.09 / amulet.height);
  const restingX = left + width * 0.455;
  const fennec = scene.add.image(restingX, top + height * 0.774, resting)
    .setOrigin(0.5, 1).setName('empire-visitor');
  fennec.setScale(height * 0.17 / fennec.height);
  animateFennec(scene, fennec);
  let arrival: Phaser.Tweens.Tween | undefined;
  const finish = () => { arrival?.stop(); paint(1); fennec.setX(restingX).setAlpha(1); };
  const arriving = scene.data.get('fennec-arriving');
  scene.data.set('fennec-arriving', false);
  if (arriving && !motion.matches) {
    paint(0); fennec.setX(restingX + width * 0.055).setAlpha(0);
    arrival = scene.tweens.addCounter({ from: 0, to: 1, duration: 950, onUpdate: tween => {
      const phase = tween.getValue() ?? 0;
      paint(Math.min(1, phase * 1.8));
      const emergence = Phaser.Math.Clamp((phase - 0.35) / 0.65, 0, 1);
      fennec.setX(restingX + width * 0.055 * (1 - emergence)).setAlpha(emergence);
    } });
  } else paint(1);
  motion.addEventListener('change', finish);
  stem.once('destroy', () => { arrival?.stop(); motion.removeEventListener('change', finish); });
  return [stem, shadow, amulet, fennec];
}
