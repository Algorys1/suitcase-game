import Phaser from 'phaser';
import { progressStore } from '../../services/storage';
import type { WorldFrame } from './pilotWorlds';

export function animateYeti(scene: Phaser.Scene, yeti: Phaser.GameObjects.Image,
  onSneeze?: (strength: number) => void): void {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scale = yeti.scaleX, size = yeti.displayHeight;
  let greeting: Phaser.Tweens.Tween | undefined;
  let snow: Phaser.GameObjects.Graphics | undefined;
  const reset = () => {
    greeting?.stop();
    greeting = undefined;
    snow?.destroy();
    snow = undefined;
    yeti.setScale(scale).setOrigin(0.5, 1);
    onSneeze?.(0);
  };
  yeti.setInteractive().on('pointerdown', () => {
    if (motion.matches || greeting || scene.data.get('book-busy') || yeti.alpha < 0.95) return;
    const cloud = scene.add.graphics().setName('yeti-snow-puff');
    snow = cloud;
    greeting = scene.tweens.addCounter({ from: 0, to: 1, duration: 950, onUpdate: tween => {
      const t = tween.getValue() ?? 0;
      const breath = Math.sin(Math.PI * 0.5 * Math.min(1, t / 0.38)) * (1 - Phaser.Math.Clamp((t - 0.38) / 0.08, 0, 1));
      const sneeze = Phaser.Math.Clamp((t - 0.38) / 0.62, 0, 1);
      const recoil = Math.sin(Math.PI * Phaser.Math.Clamp(sneeze * 3, 0, 1));
      yeti.setScale(scale * (1 + breath * 0.13 + recoil * 0.10), scale * (1 + breath * 0.12 - recoil * 0.25))
        .setOrigin(0.5 + recoil * 0.1, 1);
      onSneeze?.(Math.sin(sneeze * Math.PI));
      cloud.clear();
      if (sneeze <= 0) return;
      const alpha = Math.sin(Math.PI * sneeze ** 0.55);
      for (let i = 0; i < 9; i++) {
        const x = yeti.x + size * (0.12 + sneeze * (0.34 + i * 0.057));
        const y = yeti.y - size * (0.57 + sneeze * (0.12 + Math.sin(i * 2.4) * 0.32));
        const radius = Math.max(0.7, size * (i < 4 ? 0.07 : 0.027)) * (0.8 + sneeze * 0.5);
        cloud.fillStyle(i < 4 ? 0xe0deff : 0xfff3ff, alpha * (i < 4 ? 0.62 : 0.95)).fillCircle(x, y, radius);
      }
    }, onComplete: reset });
  });
  motion.addEventListener('change', reset);
  yeti.once('destroy', () => { greeting?.stop(); snow?.destroy(); motion.removeEventListener('change', reset); });
}

export function drawYetiVisitor(scene: Phaser.Scene, { left, top, width, height }: WorldFrame):
  Array<Phaser.GameObjects.Image | Phaser.GameObjects.Graphics> {
  const sprite = 'adventure-yeti-resident', braceletKey = 'souvenir-atoll_boreal';
  if (!progressStore.read().welcomedPalaceVisitor || !scene.textures.exists(sprite)
    || !scene.textures.exists(braceletKey)) return [];
  const reflection = scene.add.graphics().setName('palace-aurora-reflection');
  const braceletX = left + width * 0.202, braceletY = top + height * 0.817;
  const contact = scene.add.graphics().fillStyle(0x59476e, 0.27)
    .fillEllipse(braceletX, braceletY + height * 0.006, width * 0.051, height * 0.016);
  const bracelet = scene.add.image(braceletX, braceletY, braceletKey)
    .setAngle(-6).setName('palace-offered-bracelet');
  const braceletScale = height * 0.092 / bracelet.height;
  bracelet.setScale(braceletScale, braceletScale * 0.43);
  const yeti = scene.add.image(left + width * 0.54, top + height * 0.736, sprite)
    .setOrigin(0.5, 1).setName('palace-visitor');
  yeti.setScale(height * 0.16 / yeti.height);
  reflection.setBlendMode(Phaser.BlendModes.ADD);
  let phase = 0.15;
  let ripple = 0;
  let auroraPulse: Phaser.Tweens.Tween | undefined;
  const ribbons = [
    { color: 0xa2ffcd, offset: -0.013, amplitude: 0.009 },
    { color: 0x91e4ff, offset: 0, amplitude: 0.012 },
    { color: 0xeac2ff, offset: 0.014, amplitude: 0.009 },
  ];
  const drawReflection = () => {
    reflection.clear();
    const swell = Math.sin(ripple * Math.PI);
    ribbons.forEach(({ color, offset, amplitude }, index) => {
      for (let i = 0; i < 24; i++) {
        const u = i / 24;
        const wave = Math.sin(u * 10 - phase * Math.PI * 2 + index * 0.8);
        const traveling = Math.sin((u - ripple * 1.3) * 9) * swell;
        const x = braceletX + width * 0.546 * u;
        // The painted canal widens and curves down toward the foreground.
        const spread = Math.sin(u * Math.PI * 0.75);
        const y = braceletY + height * (0.027 * u + 0.122 * u * u
          + spread * (offset + wave * amplitude + traveling * 0.009));
        const opacity = Math.sin(u * Math.PI) * (0.10 + wave * 0.025 + swell * 0.05);
        const span = width * (0.026 + u * 0.019);
        reflection.fillStyle(color, opacity * 0.52).fillEllipse(x, y, span * 1.7, height * 0.021)
          .fillStyle(color, opacity).fillEllipse(x, y, span, height * 0.009);
      }
    });
  };
  animateYeti(scene, yeti, strength => {
    if (strength <= 0 || auroraPulse) return;
    auroraPulse = scene.tweens.addCounter({ from: 0, to: 1, duration: 2400, ease: 'Sine.InOut',
      onUpdate: tween => { ripple = tween.getValue() ?? 0; drawReflection(); },
      onComplete: () => { auroraPulse = undefined; ripple = 0; drawReflection(); } });
  });
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let drift: Phaser.Tweens.Tween | undefined;
  let arrival: Phaser.Tweens.Tween | undefined;
  const refresh = () => {
    drift?.stop();
    auroraPulse?.stop();
    auroraPulse = undefined;
    ripple = 0;
    arrival?.stop();
    yeti.setAlpha(1);
    phase = 0.15;
    drawReflection();
    if (!motion.matches) drift = scene.tweens.addCounter({ from: 0.15, to: 1.15, duration: 9000, repeat: -1,
      onUpdate: tween => { phase = tween.getValue() ?? 0.15; drawReflection(); } });
  };
  refresh();
  if (scene.data.get('yeti-arriving') && !motion.matches) {
    yeti.setAlpha(0);
    arrival = scene.tweens.add({ targets: yeti, alpha: 1, delay: 250, duration: 520, ease: 'Sine.Out' });
  }
  scene.data.set('yeti-arriving', false);
  motion.addEventListener('change', refresh);
  yeti.once('destroy', () => {
    arrival?.stop();
    auroraPulse?.stop();
    drift?.stop();
    motion.removeEventListener('change', refresh);
  });
  return [reflection, contact, bracelet, yeti];
}
