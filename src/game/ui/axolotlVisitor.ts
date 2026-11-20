import Phaser from 'phaser';
import { progressStore } from '../../services/storage';
import type { WorldFrame } from './pilotWorlds';

const restTexture = 'adventure-axolotl-resident';
const gillsTexture = 'adventure-axolotl-gills';

export function animateAxolotl(scene: Phaser.Scene, axolotl: Phaser.GameObjects.Image, onRipple?: () => void): void {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scale = axolotl.scaleX;
  let greeting: Phaser.Tweens.Tween | undefined;
  const reset = () => {
    greeting?.stop();
    greeting = undefined;
    axolotl.setTexture(restTexture).setScale(scale);
  };
  axolotl.setInteractive().on('pointerdown', () => {
    if (motion.matches || greeting || scene.data.get('book-busy') || axolotl.alpha < 0.95) return;
    onRipple?.();
    greeting = scene.tweens.addCounter({ from: 0, to: 1, duration: 960, onUpdate: tween => {
      const t = tween.getValue() ?? 0;
      const flick = Math.max(0, Math.sin(Math.PI * t * 6));
      axolotl.setTexture(flick > 0.38 ? gillsTexture : restTexture)
        .setScale(scale * (1 + flick * 0.025), scale * (1 - flick * 0.035));
    }, onComplete: reset });
  });
  motion.addEventListener('change', reset);
  axolotl.once('destroy', () => { greeting?.stop(); motion.removeEventListener('change', reset); });
}

export function drawAxolotlVisitor(scene: Phaser.Scene, { left, top, width, height }: WorldFrame):
  Array<Phaser.GameObjects.Image | Phaser.GameObjects.Graphics> {
  const shardKey = 'souvenir-vestiges_celestes';
  if (!progressStore.read().welcomedRuinsVisitor || !scene.textures.exists(shardKey)
    || !scene.textures.exists(restTexture) || !scene.textures.exists(gillsTexture)) return [];
  const shardX = left + width * 0.652, shardY = top + height * 0.667;
  const axolotlX = left + width * 0.762, axolotlY = top + height * 0.656;
  const accents = scene.add.graphics()
    .fillStyle(0x466760, 0.24).fillEllipse(axolotlX, axolotlY, height * 0.177, height * 0.019)
    .fillStyle(0x706149, 0.28).fillEllipse(shardX, shardY + height * 0.012, height * 0.114, height * 0.037);
  const reflections = scene.add.graphics().setBlendMode(Phaser.BlendModes.ADD).setName('ruins-mosaic-reflections');
  const shard = scene.add.image(shardX, shardY, shardKey).setAngle(-8).setName('ruins-offered-mosaic');
  const tileScale = height * 0.115 / shard.height;
  shard.setScale(tileScale, tileScale * 0.61);
  const axolotl = scene.add.image(axolotlX, axolotlY, restTexture).setOrigin(0.5, 1).setName('ruins-visitor');
  axolotl.setScale(height * 0.153 / axolotl.height);
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let pulse: Phaser.Tweens.Tween | undefined;
  let arrival: Phaser.Tweens.Tween | undefined;
  const paint = (phase = 0) => {
    reflections.clear().fillStyle(0xa2e5f4, 0.12)
      .fillEllipse(shardX, shardY, width * 0.043, height * 0.024);
    for (let i = 0; i < 6; i++) {
      const t = Phaser.Math.Clamp((phase - i * 0.045) / 0.73, 0, 1);
      const strength = Math.sin(Math.PI * t);
      const angle = -Math.PI * (0.15 + i * 0.27);
      const x = shardX + width * (Math.cos(angle) * t * 0.122 + Math.sin(t * 6 + i) * strength * 0.013);
      const y = shardY + height * Math.sin(angle) * t * 0.051;
      const color = [0x88e7ee, 0xf3adf0, 0xffe1a5][i % 3]!;
      const span = width * (0.022 + t * 0.025);
      reflections.fillStyle(color, strength * 0.15).fillEllipse(x, y, span * 1.45, height * 0.023)
        .fillStyle(color, strength * 0.40).fillEllipse(x, y, span, height * 0.009);
    }
  };
  paint();
  animateAxolotl(scene, axolotl, () => {
    pulse?.stop();
    pulse = scene.tweens.addCounter({ from: 0, to: 1, duration: 1800, onUpdate: tween => paint(tween.getValue() ?? 0),
      onComplete: () => { pulse = undefined; paint(); } });
  });
  if (scene.data.get('axolotl-arriving') && !motion.matches) {
    axolotl.setAlpha(0);
    arrival = scene.tweens.add({ targets: axolotl, alpha: 1, delay: 160, duration: 480, ease: 'Sine.Out' });
  }
  scene.data.set('axolotl-arriving', false);
  const reset = () => {
    pulse?.stop();
    arrival?.stop();
    pulse = undefined;
    axolotl.setAlpha(1);
    paint();
  };
  motion.addEventListener('change', reset);
  axolotl.once('destroy', () => { pulse?.stop(); arrival?.stop(); motion.removeEventListener('change', reset); });
  return [accents, reflections, shard, axolotl];
}
