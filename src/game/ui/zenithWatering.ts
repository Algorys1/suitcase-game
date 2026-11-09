import Phaser from 'phaser';
import { reducedMotion } from './adventureMap';
import { pilotTargets } from '../../domain/pilotExploration';
import type { WorldFrame } from './pilotWorlds';

/** One gesture for mouse and touch: carry the painted can, release over flowers. */
export function addZenithWatering(scene: Phaser.Scene, art: WorldFrame, steps: readonly number[],
  onWatered: (index: number, x: number, y: number) => void, awakening: boolean,
  interactive = true): () => void {
  const reduced = reducedMotion(), visited = new Set(steps);
  const px = (x: number) => art.left + x * art.width;
  const py = (y: number) => art.top + y * art.height;
  scene.add.image(art.left, art.top, 'adventure-zenith-empty').setOrigin(0)
    .setDisplaySize(art.width, art.height).setName('zenith-background');
  const home = { x: px(0.258), y: py(0.679) };
  const can = scene.add.image(home.x, home.y, 'adventure-zenith-can').setName('zenith-can');
  can.setScale(art.width * 0.161 / can.width);
  let busy = awakening, dragging = false;
  const lights = new Set<number>();
  const illuminate = (index: number) => {
    if (lights.has(index)) return;
    lights.add(index);
    // Three soft lantern-like lights sit inside the existing pavilion arches.
    const x = px([0.383, 0.417, 0.45][index]!), y = py(0.239);
    const key = 'zenith-soft-light';
    if (!scene.textures.exists(key)) {
      const texture = scene.textures.createCanvas(key, 64, 64)!;
      const ctx = texture.context, gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, '#fff9cf'); gradient.addColorStop(0.25, '#ffdf8dcc');
      gradient.addColorStop(1, '#ffd77b00');
      ctx.fillStyle = gradient; ctx.fillRect(0, 0, 64, 64); texture.refresh();
    }
    const light = scene.add.image(x, y, key).setDisplaySize(art.width * 0.039, art.height * 0.083)
      .setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.65).setName(`zenith-arch-${index}`);
    const flower = pilotTargets.jardins_du_zenith[index]!;
    const petals = scene.add.image(px(flower.x), py(flower.y), key)
      .setDisplaySize(art.width * 0.12, art.height * 0.08).setTint(0xffc5a3)
      .setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.22).setName(`zenith-flowers-${index}`);
    if (!reduced) scene.tweens.add({ targets: petals, alpha: 0.07, duration: 2700 + index * 350,
      yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    if (!reduced) scene.tweens.add({ targets: light, alpha: 0.27, duration: 2100 + index * 460,
      yoyo: true, repeat: -1, ease: 'Sine.InOut' });
  };
  steps.forEach(illuminate);
  if (!interactive) return () => {};
  can.setInteractive();
  scene.input.setDraggable(can);
  const reset = () => { dragging = false; can.setPosition(home.x, home.y).setAngle(0); };
  can.on('dragstart', () => {
    if (busy || scene.children.getByName('tutorial-paper')) return;
    dragging = true; can.setDepth(5);
  });
  can.on('drag', (_pointer: Phaser.Input.Pointer, x: number, y: number) => {
    if (!dragging) return;
    can.setPosition(Phaser.Math.Clamp(x, art.left, art.left + art.width),
      Phaser.Math.Clamp(y, art.top, art.top + art.height));
  });
  can.on('dragend', (pointer: Phaser.Input.Pointer) => {
    if (!dragging) return;
    dragging = false;
    const index = pilotTargets.jardins_du_zenith.findIndex(target =>
      Math.abs(pointer.x - px(target.x)) <= Math.max(24, art.width * 0.11)
      && Math.abs(pointer.y - py(target.y)) <= Math.max(24, art.height * 0.105));
    if (index < 0) {
      if (reduced) reset();
      else { busy = true; scene.tweens.add({ targets: can, ...home, duration: 350,
        ease: 'Sine.InOut', onComplete: () => { busy = false; reset(); } }); }
      return;
    }
    busy = true;
    const target = pilotTargets.jardins_du_zenith[index]!;
    const x = px(target.x), y = py(target.y);
    const finish = () => {
      reset(); busy = false; illuminate(index);
      if (!visited.has(index)) { visited.add(index); onWatered(index, x, y); }
    };
    if (reduced) { finish(); return; }
    can.setPosition(x - art.width * 0.085, y - art.height * 0.12).setAngle(28);
    const water = scene.add.graphics().setDepth(6).setName('zenith-water');
    scene.tweens.addCounter({ from: 0, to: 1, duration: 850, onUpdate: tween => {
      const p = tween.getValue() ?? 0;
      water.clear().fillStyle(0xc4f3ff, 0.85);
      for (let n = 0; n < 9; n++) {
        const t = (p * 2 + n / 9) % 1;
        water.fillEllipse(x + (n % 3 - 1) * art.width * 0.009,
          y - art.height * 0.09 * (1 - t), art.width * 0.003, art.height * 0.009);
      }
    }, onComplete: () => {
      water.destroy();
      scene.tweens.add({ targets: can, ...home, angle: 0, duration: 350, ease: 'Sine.InOut' });
      const spark = scene.add.graphics().setName('zenith-flower-light');
      scene.tweens.addCounter({ from: 0, to: 1, duration: 950, onUpdate: tween => {
        const t = tween.getValue() ?? 0;
        spark.clear().fillStyle(0xffedb0, Math.sin(t * Math.PI));
        for (let n = 0; n < 5; n++) spark.fillCircle(
          Phaser.Math.Linear(x, px([0.383, 0.417, 0.45][index]!), t) + Math.sin(t * 7 + n) * art.width * 0.009,
          Phaser.Math.Linear(y, py(0.239), t) - Math.sin(t * Math.PI) * art.height * 0.08 + n * 3,
          Math.max(1, art.width * 0.003));
      }, onComplete: () => { spark.destroy(); finish(); } });
    } });
  });
  const cancel = () => { if (dragging) reset(); };
  scene.input.on('gameout', cancel);
  scene.game.events.on('blur', cancel);
  return () => {
    scene.input.off('gameout', cancel); scene.game.events.off('blur', cancel);
  };
}
