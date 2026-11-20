import Phaser from 'phaser';
import { progressStore } from '../../services/storage';
import type { WorldFrame } from './pilotWorlds';

const sprite = 'adventure-dragon-resident';

export function animateDragon(scene: Phaser.Scene, dragon: Phaser.GameObjects.Image, onBreath?: () => void): void {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scale = dragon.scaleX, size = dragon.displayHeight;
  let greeting: Phaser.Tweens.Tween | undefined;
  let steam: Phaser.GameObjects.Graphics | undefined;
  const reset = () => {
    greeting?.stop();
    greeting = undefined;
    steam?.destroy();
    steam = undefined;
    dragon.setScale(scale).setOrigin(0.5, 1);
  };
  dragon.setInteractive().on('pointerdown', () => {
    if (motion.matches || greeting || scene.data.get('book-busy') || dragon.alpha < 0.95) return;
    const puff = scene.add.graphics().setName('dragon-warm-breath');
    steam = puff;
    let breathed = false;
    greeting = scene.tweens.addCounter({ from: 0, to: 1, duration: 1120, onUpdate: tween => {
      const t = tween.getValue() ?? 0;
      const breath = Math.sin(Math.PI * Phaser.Math.Clamp(t / 0.65, 0, 1));
      const release = Phaser.Math.Clamp((t - 0.37) / 0.63, 0, 1);
      dragon.setScale(scale * (1 + breath * 0.1), scale * (1 + breath * 0.10))
        .setOrigin(0.5 - breath * 0.045, 1);
      if (release > 0.24 && !breathed) {
        breathed = true;
        onBreath?.();
      }
      puff.clear();
      for (let i = 0; i < 6; i++) {
        const life = Phaser.Math.Clamp((release - i * 0.057) / 0.68, 0, 1);
        const alpha = Math.sin(life * Math.PI);
        const x = dragon.x + size * (0.25 + life * 0.49);
        const y = dragon.y - size * (0.49 + life * (0.13 + Math.sin(i * 2.3) * 0.14));
        const radius = size * (0.024 + life * 0.073);
        puff.fillStyle(i % 2 ? 0xffe2a3 : 0xffbfb0, alpha * 0.48).fillCircle(x, y, radius);
      }
    }, onComplete: reset });
  });
  motion.addEventListener('change', reset);
  dragon.once('destroy', () => {
    greeting?.stop();
    steam?.destroy();
    motion.removeEventListener('change', reset);
  });
}

export function drawDragonVisitor(scene: Phaser.Scene, { left, top, width, height }: WorldFrame):
  Array<Phaser.GameObjects.Image | Phaser.GameObjects.Graphics> {
  const fruitKey = 'souvenir-jungle_incandescente';
  if (!progressStore.read().welcomedKingdomVisitor || !scene.textures.exists(sprite)
    || !scene.textures.exists(fruitKey)) return [];
  const anchorX = left + width * 0.329, anchorY = top + height * 0.544;
  const dragonX = left + width * 0.245, dragonY = top + height * 0.497;
  const ground = scene.add.graphics().fillStyle(0x765657, 0.21)
    .fillEllipse(dragonX, dragonY, height * 0.12, height * 0.016);
  const glow = scene.add.graphics().setName('kingdom-fruit-glow');
  for (let i = 3; i >= 1; i--) {
    glow.fillStyle(0xffb966, 0.065).fillCircle(0, height * 0.045, height * (0.024 + i * 0.014));
  }
  const stem = scene.add.graphics().setName('kingdom-fruit-stem');
  const fruit = scene.add.image(0, 0, fruitKey).setOrigin(0.5, 0.12).setName('kingdom-offered-fruit');
  fruit.setScale(height * 0.09 / fruit.height);
  const hangFruit = (angle: number) => {
    const length = height * 0.033;
    const x = anchorX + Math.sin(angle) * length;
    const y = anchorY + Math.cos(angle) * length;
    stem.clear().lineStyle(Math.max(1, height * 0.0038), 0x704b35, 0.9)
      .lineBetween(anchorX, anchorY, x, y + height * 0.006)
      .fillStyle(0xc49a58).fillCircle(anchorX, anchorY, Math.max(0.9, height * 0.004));
    fruit.setPosition(x, y).setRotation(-angle + 0.055);
    glow.setPosition(x + Math.sin(angle) * height * 0.04, y);
  };
  const dragon = scene.add.image(dragonX, dragonY, sprite).setOrigin(0.5, 1).setName('kingdom-visitor');
  dragon.setScale(height * 0.153 / dragon.height);
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let swing: Phaser.Tweens.Tween | undefined;
  let glowMotion: Phaser.Tweens.Tween | undefined;
  let arrival: Phaser.Tweens.Tween | undefined;
  animateDragon(scene, dragon, () => {
    swing?.stop();
    swing = scene.tweens.addCounter({ from: 0, to: 1, duration: 2200, onUpdate: tween => {
      const t = tween.getValue() ?? 0;
      hangFruit(Math.sin(t * Math.PI * 5) * (1 - t) ** 2 * 0.68);
    }, onComplete: () => { swing = undefined; hangFruit(0); } });
  });
  const refresh = () => {
    swing?.stop();
    swing = undefined;
    hangFruit(0);
    glowMotion?.stop();
    arrival?.stop();
    dragon.setAlpha(1);
    glow.setAlpha(0.7);
    if (!motion.matches) glowMotion = scene.tweens.add({ targets: glow, alpha: 1,
      duration: 1550, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
  };
  refresh();
  if (scene.data.get('dragon-arriving') && !motion.matches) {
    dragon.setAlpha(0);
    arrival = scene.tweens.add({ targets: dragon, alpha: 1, delay: 180, duration: 500, ease: 'Sine.Out' });
  }
  scene.data.set('dragon-arriving', false);
  motion.addEventListener('change', refresh);
  dragon.once('destroy', () => {
    swing?.stop();
    glowMotion?.stop();
    arrival?.stop();
    motion.removeEventListener('change', refresh);
  });
  return [ground, glow, stem, fruit, dragon];
}
