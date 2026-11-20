import Phaser from 'phaser';
import { progressStore } from '../../services/storage';
import type { WorldFrame } from './pilotWorlds';

const restingTexture = 'adventure-griffin-resident';
const wingsTexture = 'adventure-griffin-wings';

const wisteriaClusters = [
  { x: 0.148, y: 0.095, width: 0.096, height: 0.150 },
  { x: 0.195, y: 0.145, width: 0.092, height: 0.183 },
  { x: 0.225, y: 0.222, width: 0.063, height: 0.161 },
];

function wisteriaCluster(scene: Phaser.Scene, art: WorldFrame, index: number): Phaser.GameObjects.Image {
  const { x, y, width, height } = wisteriaClusters[index]!;
  const key = `vestiges-wisteria-${index}`;
  if (!scene.textures.exists(key)) {
    const frame = scene.textures.getFrame('destination-vestiges_celestes');
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(width * frame.width);
    canvas.height = Math.ceil(height * frame.height);
    const context = canvas.getContext('2d')!;
    context.drawImage(frame.source.image as CanvasImageSource,
      frame.cutX + (x - width / 2) * frame.cutWidth, frame.cutY + (y - height / 2) * frame.cutHeight,
      width * frame.cutWidth, height * frame.cutHeight, 0, 0, canvas.width, canvas.height);
    // Feather the edges into the original painting while moving the painted flower cluster.
    context.globalCompositeOperation = 'destination-in';
    context.scale(canvas.width / 2, canvas.height / 2);
    const mask = context.createRadialGradient(1, 1, 0.43, 1, 1, 1);
    mask.addColorStop(0, 'white');
    mask.addColorStop(1, 'transparent');
    context.fillStyle = mask;
    context.fillRect(0, 0, 2, 2);
    scene.textures.addCanvas(key, canvas);
  }
  return scene.add.image(art.left + x * art.width, art.top + y * art.height, key)
    .setDisplaySize(width * art.width, height * art.height).setVisible(false);
}

export function animateGriffin(scene: Phaser.Scene, griffin: Phaser.GameObjects.Image, onLanding?: () => void): void {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scale = griffin.scaleX, size = griffin.displayHeight;
  let greeting: Phaser.Tweens.Tween | undefined;
  let sparks: Phaser.GameObjects.Graphics | undefined;
  const reset = () => {
    greeting?.stop();
    greeting = undefined;
    sparks?.destroy();
    sparks = undefined;
    griffin.setTexture(restingTexture).setScale(scale).setOrigin(0.5, 1);
  };
  griffin.setInteractive().on('pointerdown', () => {
    if (motion.matches || greeting || scene.data.get('book-busy') || griffin.alpha < 0.95) return;
    const glints = scene.add.graphics().setName('griffin-sparks');
    sparks = glints;
    let landed = false;
    greeting = scene.tweens.addCounter({ from: 0, to: 1, duration: 840, onUpdate: tween => {
      const t = tween.getValue() ?? 0;
      if (t >= 0.66 && !landed) {
        landed = true;
        onLanding?.();
      }
      const flap = t < 0.15 ? 0 : Math.max(0, Math.sin((t - 0.15) * Math.PI * 9));
      const lift = Math.sin(Math.PI * Phaser.Math.Clamp((t - 0.15) / 0.51, 0, 1));
      const landing = Math.sin(Math.PI * Phaser.Math.Clamp((t - 0.66) / 0.25, 0, 1));
      griffin.setTexture(t < 0.66 && flap > 0.42 ? wingsTexture : restingTexture)
        .setScale(scale * (1 + landing * 0.09), scale * (1 - landing * 0.13))
        .setOrigin(0.5, 1 + lift * 0.25);
      glints.clear();
      const spark = Phaser.Math.Clamp((t - 0.59) / 0.41, 0, 1);
      const alpha = Math.sin(spark * Math.PI);
      if (alpha <= 0) return;
      const x = griffin.x + size * (0.28 + spark * 0.16);
      const y = griffin.y - size * (0.62 + spark * 0.29);
      const radius = Math.max(1.5, size * (0.045 + spark * 0.025));
      glints.fillStyle(0xeac5ff, alpha * 0.3).fillCircle(x, y, radius * 1.5)
        .lineStyle(1.2, 0xffedd1, alpha)
        .lineBetween(x - radius * 0.7, y, x + radius * 0.7, y)
        .lineBetween(x, y - radius, x, y + radius);
    }, onComplete: reset });
  });
  motion.addEventListener('change', reset);
  griffin.once('destroy', () => {
    greeting?.stop();
    sparks?.destroy();
    motion.removeEventListener('change', reset);
  });
}

export function drawGriffinVisitor(scene: Phaser.Scene, { left, top, width, height }: WorldFrame):
  Array<Phaser.GameObjects.Image | Phaser.GameObjects.Graphics> {
  const bottleKey = 'souvenir-tempete_ecarlate';
  if (!progressStore.read().welcomedVestigesVisitor || !scene.textures.exists(restingTexture)
    || !scene.textures.exists(wingsTexture) || !scene.textures.exists(bottleKey)) return [];
  const bottleX = left + width * 0.208, bottleY = top + height * 0.587;
  const shadow = scene.add.graphics().fillStyle(0x80583d, 0.32)
    .fillEllipse(bottleX, bottleY, width * 0.042, height * 0.009);
  const bottle = scene.add.image(bottleX, bottleY, bottleKey)
    .setOrigin(0.5, 1).setName('vestiges-offered-lightning');
  bottle.setScale(height * 0.098 / bottle.height);
  const glimmer = scene.add.graphics().setName('vestiges-bottle-glimmer');
  glimmer.fillStyle(0xf4ceff, 0.24)
    .fillCircle(bottleX, bottleY - height * 0.047, height * 0.031)
    .fillStyle(0xffefbc, 0.52)
    .fillCircle(bottleX + height * 0.007, bottleY - height * 0.045, Math.max(0.7, height * 0.005));
  const griffinX = left + width * 0.30, griffinY = top + height * 0.878;
  shadow.fillStyle(0x80583d, 0.25).fillEllipse(griffinX, griffinY, height * 0.136, height * 0.015);
  const griffin = scene.add.image(griffinX, griffinY, restingTexture)
    .setOrigin(0.5, 1).setName('vestiges-visitor');
  griffin.setScale(height * 0.15 / griffin.height);
  const clusters = wisteriaClusters.map((_, i) => wisteriaCluster(scene, { left, top, width, height }, i));
  const petals = scene.add.graphics().setName('vestiges-wisteria-petals');
  let rustle: Phaser.Tweens.Tween | undefined;
  const settle = () => {
    rustle?.stop();
    rustle = undefined;
    clusters.forEach(cluster => cluster.setAngle(0).setVisible(false));
    petals.clear();
  };
  animateGriffin(scene, griffin, () => {
    settle();
    rustle = scene.tweens.addCounter({ from: 0, to: 1, duration: 1750, onUpdate: tween => {
      const t = tween.getValue() ?? 0;
      clusters.forEach((cluster, i) => {
        const sway = Phaser.Math.Clamp((t - i * 0.075) / 0.73, 0, 1);
        cluster.setVisible(sway > 0 && sway < 1)
          .setAngle(Math.sin(sway * Math.PI * 3.4) * Math.sin(sway * Math.PI) * (4 + i));
      });
      petals.clear();
      const flash = Math.max(0, 1 - t * 4);
      petals.fillStyle(0xffd9a1, flash * 0.28)
        .fillCircle(bottleX, bottleY - height * 0.043, height * (0.025 + t * 0.09));
      for (let i = 0; i < 2; i++) {
        const fall = Phaser.Math.Clamp((t - 0.13 - i * 0.15) / 0.70, 0, 1);
        const x = left + width * (0.229 - i * 0.035 + fall * 0.056 + Math.sin(fall * 8 + i) * fall * 0.012);
        const y = top + height * (0.255 - i * 0.06 + fall * 0.22);
        const alpha = Math.sin(fall * Math.PI) ** 0.55;
        const size = Math.max(1.3, height * 0.009);
        const turn = Math.sin(fall * 12 + i);
        petals.fillStyle(i ? 0xdd9cf1 : 0xb96ad9, alpha)
          .fillEllipse(x, y, size * (0.58 + Math.abs(turn) * 0.56), size * 1.4)
          .fillStyle(0xffcafe, alpha * 0.58).fillEllipse(x - turn * size * 0.2, y - size * 0.20, size * 0.47, size * 0.50);
      }
    }, onComplete: settle });
  });
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let drift: Phaser.Tweens.Tween | undefined;
  let arrival: Phaser.Tweens.Tween | undefined;
  const refresh = () => {
    settle();
    drift?.stop();
    arrival?.stop();
    griffin.setAlpha(1);
    glimmer.setAlpha(0.7);
    if (!motion.matches) drift = scene.tweens.add({ targets: glimmer, alpha: 1,
      duration: 1570, ease: 'Sine.InOut', yoyo: true, repeat: -1 });
  };
  refresh();
  if (scene.data.get('griffin-arriving') && !motion.matches) {
    griffin.setAlpha(0);
    arrival = scene.tweens.add({ targets: griffin, alpha: 1, delay: 180, duration: 460, ease: 'Sine.Out' });
  }
  scene.data.set('griffin-arriving', false);
  griffin.once('destroy', () => {
    rustle?.stop();
    arrival?.stop();
    drift?.stop();
    motion.removeEventListener('change', refresh);
  });
  motion.addEventListener('change', refresh);
  return [...clusters, shadow, bottle, glimmer, petals, griffin];
}
