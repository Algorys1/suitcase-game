import Phaser from 'phaser';
import { progressStore } from '../../services/storage';
import type { WorldFrame } from './pilotWorlds';

/** Two painted poses keep the flippers legible even on the small home visitors. */
export function animateSeal(scene: Phaser.Scene, seal: Phaser.GameObjects.Image, ambient = false): void {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let clap: Phaser.Time.TimerEvent | undefined;
  let pause: Phaser.Time.TimerEvent | undefined;
  const rest = () => { seal.setTexture('adventure-sea-resident'); };
  const schedule = () => {
    if (ambient && !preference.matches && seal.active)
      pause = scene.time.delayedCall(Phaser.Math.Between(1800, 3200), greet);
  };
  const greet = () => {
    if (preference.matches || clap || !seal.active) return;
    pause?.remove(); pause = undefined;
    let beat = 0;
    seal.setTexture('adventure-sea-resident-clap');
    clap = scene.time.addEvent({ delay: 180, repeat: 4, callback: () => {
      beat++;
      if (beat === 5) { clap = undefined; rest(); schedule(); return; }
      seal.setTexture(beat % 2 ? 'adventure-sea-resident' : 'adventure-sea-resident-clap');
    } });
  };
  const change = () => {
    clap?.remove(); clap = undefined;
    pause?.remove(); pause = undefined;
    rest(); schedule();
  };
  seal.setInteractive().on('pointerdown', greet);
  preference.addEventListener('change', change);
  seal.once('destroy', () => {
    clap?.remove(); pause?.remove(); preference.removeEventListener('change', change);
  });
  schedule();
}

/** Shell and resident stay on the central ice floe, clear of the globe's three sources. */
export function drawSeaVisitor(scene: Phaser.Scene, frame: WorldFrame): Array<Phaser.GameObjects.Image | Phaser.GameObjects.Graphics> {
  if (!progressStore.read().welcomedSeaVisitor || !scene.textures.exists('adventure-sea-resident')
    || !scene.textures.exists('adventure-sea-resident-clap') || !scene.textures.exists('souvenir-archipel_azur')) return [];
  const { left, top, width, height } = frame;
  const shellX = left + width * 0.43, shellY = top + height * 0.667;
  const sealX = left + width * 0.515, sealY = top + height * 0.676;
  const waves = scene.add.graphics().setName('sea-shell-waves');
  const drawWaves = (phase: number) => {
    waves.clear();
    for (let i = 0; i < 3; i++) {
      const life = (phase + i / 3) % 1;
      waves.lineStyle(Math.max(0.8, width * 0.002), 0x76e0d6, Math.sin(life * Math.PI) * 0.55)
        .strokeEllipse(shellX, shellY, width * (0.025 + life * 0.14), height * (0.006 + life * 0.035));
    }
  };
  const shadow = scene.add.graphics().fillStyle(0x455c77, 0.16)
    .fillEllipse(sealX, sealY - height * 0.005, width * 0.095, height * 0.016);
  const shell = scene.add.image(shellX, shellY, 'souvenir-archipel_azur').setOrigin(0.5, 1)
    .setName('sea-offered-shell');
  shell.setScale(height * 0.065 / shell.height);
  const seal = scene.add.image(sealX, sealY, 'adventure-sea-resident').setOrigin(0.5, 1)
    .setName('sea-visitor');
  seal.setScale(height * 0.17 / seal.height);
  animateSeal(scene, seal);
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let ripple: Phaser.Tweens.Tween | undefined;
  let arrival: Phaser.Tweens.Tween | undefined;
  const change = () => {
    ripple?.stop(); ripple = undefined;
    arrival?.stop(); arrival = undefined; seal.setAlpha(1);
    drawWaves(0.18);
    if (!preference.matches) ripple = scene.tweens.addCounter({ from: 0, to: 1, duration: 2600,
      repeat: -1, onUpdate: tween => drawWaves(tween.getValue() ?? 0) });
  };
  change();
  if (scene.data.get('sea-visitor-arriving')) {
    scene.data.set('sea-visitor-arriving', false);
    if (!preference.matches) {
      seal.setAlpha(0);
      arrival = scene.tweens.add({ targets: seal, alpha: 1, delay: 220, duration: 600, ease: 'Sine.Out' });
    }
  }
  preference.addEventListener('change', change);
  waves.once('destroy', () => {
    ripple?.stop(); arrival?.stop(); preference.removeEventListener('change', change);
  });
  return [waves, shadow, shell, seal];
}
