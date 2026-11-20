import Phaser from 'phaser';
import { progressStore } from '../../services/storage';
import type { WorldFrame } from './pilotWorlds';

export function animateFrog(scene: Phaser.Scene, frog: Phaser.GameObjects.Image,
  onGreeting?: (progress: number) => void): void {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scale = frog.scaleX;
  let greeting: Phaser.Tweens.Tween | undefined;
  const reset = () => {
    greeting?.stop();
    greeting = undefined;
    frog.setScale(scale).setOrigin(0.5, 1);
    onGreeting?.(0);
  };
  frog.setInteractive().on('pointerdown', () => {
    if (motion.matches || greeting || scene.data.get('book-busy') || frog.alpha < 0.95) return;
    greeting = scene.tweens.addCounter({ from: 0, to: 1, duration: 770, onUpdate: tween => {
      const t = tween.getValue() ?? 0;
      const squeeze = Math.sin(Math.PI * Math.min(t / 0.2, 1));
      const lift = Math.sin(Math.PI * Phaser.Math.Clamp((t - 0.2) / 0.46, 0, 1));
      frog.setScale(scale * (1 + squeeze * 0.12), scale * (1 - squeeze * 0.17))
        .setOrigin(0.5, 1 + lift * 0.32);
      onGreeting?.(t);
    }, onComplete: reset });
  });
  motion.addEventListener('change', reset);
  frog.once('destroy', () => {
    greeting?.stop();
    motion.removeEventListener('change', reset);
  });
}

export function drawFrogVisitor(scene: Phaser.Scene, { left, top, width, height }: WorldFrame):
  Array<Phaser.GameObjects.Image | Phaser.GameObjects.Graphics> {
  const sprite = 'adventure-frog-resident', flowerKey = 'souvenir-jardins_de_gemmes';
  if (!progressStore.read().welcomedMarshVisitor || !scene.textures.exists(sprite)
    || !scene.textures.exists(flowerKey)) return [];
  const x = left + width * 0.312, y = top + height * 0.827;
  const fireflies = scene.add.graphics().setName('marsh-lantern-fireflies');
  const flower = scene.add.image(x, y, flowerKey).setOrigin(0.5, 1).setAngle(-9).setName('marsh-offered-flower');
  flower.setScale(height * 0.092 / flower.height);
  const frog = scene.add.image(left + width * 0.383, top + height * 0.937, sprite)
    .setOrigin(0.5, 1).setName('marsh-visitor');
  frog.setScale(height * 0.111 / frog.height);
  const lanternX = left + width * 0.307, lanternY = top + height * 0.395;
  let phase = 0.2;
  let greeting = 0;
  const drawLights = () => {
    fireflies.clear();
    const flutter = Phaser.Math.Clamp((greeting - 0.18) / 0.82, 0, 1);
    const agitation = Math.sin(flutter * Math.PI);
    for (let i = 0; i < 5; i++) {
      const angle = (phase + i / 5) * Math.PI * 2;
      const dart = flutter * Math.PI * 6 + i * 2.4;
      const px = lanternX + width * (Math.cos(angle) * (0.009 + i * 0.0012)
        + Math.sin(dart) * agitation * 0.005);
      const py = lanternY + height * (Math.sin(angle * 2 + i) * 0.022
        + Math.cos(dart) * agitation * 0.009);
      const alpha = 0.64 + Math.sin(angle + i) * 0.25;
      const radius = Math.max(0.6, height * 0.0032);
      fireflies.fillStyle(0xd5a240, alpha * 0.3).fillCircle(px, py, radius * 2.4)
        .fillStyle(0xffebac, alpha).fillCircle(px, py, radius);
    }
  };
  animateFrog(scene, frog, progress => {
    greeting = progress;
    drawLights();
  });
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let drift: Phaser.Tweens.Tween | undefined;
  let arrival: Phaser.Tweens.Tween | undefined;
  const refresh = () => {
    drift?.stop();
    arrival?.stop();
    frog.setAlpha(1);
    phase = 0.2;
    drawLights();
    if (!motion.matches) drift = scene.tweens.addCounter({ from: 0.2, to: 1.2, duration: 5600,
      repeat: -1, onUpdate: tween => {
        phase = tween.getValue() ?? 0.2;
        drawLights();
      } });
  };
  refresh();
  if (scene.data.get('frog-arriving') && !motion.matches) {
    frog.setAlpha(0);
    arrival = scene.tweens.add({ targets: frog, alpha: 1, delay: 250, duration: 430, ease: 'Sine.Out' });
  }
  scene.data.set('frog-arriving', false);
  motion.addEventListener('change', refresh);
  frog.once('destroy', () => {
    arrival?.stop();
    drift?.stop();
    motion.removeEventListener('change', refresh);
  });
  return [fireflies, flower, frog];
}
