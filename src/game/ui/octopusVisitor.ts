import Phaser from 'phaser';
import { progressStore } from '../../services/storage';
import type { WorldFrame } from './pilotWorlds';

const sprite = 'adventure-octopus-resident';

export function animateOctopus(scene: Phaser.Scene, octopus: Phaser.GameObjects.Image): void {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const bubbles = scene.add.graphics().setName('octopus-bubbles');
  const scale = octopus.scaleX;
  let greeting: Phaser.Tweens.Tween | undefined;
  const reset = () => {
    greeting?.stop(); greeting = undefined;
    octopus.setScale(scale).setOrigin(0.5, 1);
    bubbles.clear();
  };
  octopus.setInteractive().on('pointerdown', () => {
    if (greeting || motion.matches || scene.data.get('book-busy') || octopus.alpha < 0.9) return;
    greeting = scene.tweens.addCounter({ from: 0, to: 1, duration: 850, onUpdate: tween => {
      const t = tween.getValue() ?? 0;
      const squeeze = Math.sin(Math.PI * Math.min(1, t / 0.22));
      const lift = Math.sin(Math.PI * Phaser.Math.Clamp((t - 0.22) / 0.53, 0, 1));
      octopus.setScale(scale * (1 + squeeze * 0.13), scale * (1 - squeeze * 0.18))
        .setOrigin(0.5, 1 + lift * 0.22);
      bubbles.clear();
      for (let i = 0; i < 3; i++) {
        const life = Phaser.Math.Clamp((t - 0.26 - i * 0.1) / 0.55, 0, 1);
        if (life <= 0 || life >= 1) continue;
        const size = octopus.displayHeight;
        const x = octopus.x + size * ((i - 1) * 0.23 + Math.sin(life * 3 + i) * 0.1);
        const y = octopus.y - size * (0.78 + life * 0.62);
        const radius = Math.max(1.5, size * (0.052 + i * 0.011));
        bubbles.lineStyle(1, 0xe5ffff, 1 - life).strokeCircle(x, y, radius)
          .fillStyle(0xffffff, 0.85 * (1 - life)).fillCircle(x - radius * 0.3, y - radius * 0.36, 0.8);
      }
    }, onComplete: reset });
  });
  motion.addEventListener('change', reset);
  octopus.once('destroy', () => { greeting?.stop(); bubbles.destroy(); motion.removeEventListener('change', reset); });
}

export function drawOctopusVisitor(scene: Phaser.Scene, art: WorldFrame):
  Array<Phaser.GameObjects.Image | Phaser.GameObjects.Graphics> {
  const geodeKey = 'souvenir-grottes_sporiferes';
  if (!progressStore.read().welcomedReefVisitor || !scene.textures.exists(sprite)
    || !scene.textures.exists(geodeKey)) return [];
  const { left, top, width, height } = art;
  const x = left + width * 0.571, y = top + height * 0.927;
  const glints = scene.add.graphics().setName('offered-geode-glints');
  const paint = (phase: number) => {
    glints.clear().fillStyle(0x675395, 0.16).fillEllipse(x, y, height * 0.085, height * 0.021);
    for (let i = 0; i < 6; i++) {
      const life = (phase + i * 0.27) % 1;
      const opacity = Math.sin(life * Math.PI) ** 2;
      const px = left + width * (0.635 + i * 0.035), py = top + height * (0.92 - i * 0.024 + Math.sin(i * 2) * 0.025);
      const color = i % 2 ? 0xffe19b : 0xc99df7;
      glints.fillStyle(color, opacity * 0.3).fillCircle(px, py, height * 0.013)
        .fillStyle(color, opacity * 0.9).fillCircle(px, py, Math.max(1, height * 0.005));
    }
  };
  const geode = scene.add.image(x, y, geodeKey).setOrigin(0.5, 1).setAngle(12).setName('reef-offered-geode');
  geode.setScale(height * 0.084 / geode.height);
  const restX = left + width * 0.659, restY = top + height * 0.831;
  const octopus = scene.add.image(restX, restY, sprite).setOrigin(0.5, 1).setName('reef-visitor');
  octopus.setScale(height * 0.146 / octopus.height);
  animateOctopus(scene, octopus);
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let ambient: Phaser.Tweens.Tween | undefined;
  let arrival: Phaser.Tweens.Tween | undefined;
  const refresh = () => {
    ambient?.stop(); arrival?.stop();
    octopus.setPosition(restX, restY).setAlpha(1);
    paint(0.18);
    if (!motion.matches) ambient = scene.tweens.addCounter({ from: 0.18, to: 1.18,
      duration: 3400, repeat: -1, onUpdate: tween => paint(tween.getValue() ?? 0.18) });
  };
  refresh();
  if (scene.data.get('octopus-arriving') && !motion.matches) {
    octopus.setPosition(restX + width * 0.07, restY + height * 0.025).setAlpha(0);
    arrival = scene.tweens.add({ targets: octopus, x: restX, y: restY, alpha: 1,
      delay: 240, duration: 660, ease: 'Sine.Out' });
  }
  scene.data.set('octopus-arriving', false);
  motion.addEventListener('change', refresh);
  glints.once('destroy', () => { ambient?.stop(); arrival?.stop(); motion.removeEventListener('change', refresh); });
  return [glints, geode, octopus];
}
