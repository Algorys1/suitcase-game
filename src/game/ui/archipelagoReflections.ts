import Phaser from 'phaser';
import { AdventureControls, reducedMotion } from './adventureMap';
import type { WorldFrame } from './pilotWorlds';
import { pilotTargets } from '../../domain/pilotExploration';

/** Anchors of the six large sun glints already painted in the original illustration. */
const reflections = pilotTargets.archipel_azur;

/** Keep the water response on repeated touches, independently of discovery progress. */
export function addArchipelagoReflections(scene: Phaser.Scene, controls: AdventureControls, art: WorldFrame,
  onTouch: (index: number, x: number, y: number) => void, touched: readonly number[] = []): void {
  reflections.forEach((reflection, index) => {
    const x = art.left + reflection.x * art.width, y = art.top + reflection.y * art.height;
    if (touched.includes(index)) {
      const water = scene.add.container(x, y).setName(`sea-reflection-visited-${index}`);
      const size = Math.max(12, art.width * 0.045);
      const glint = scene.add.graphics().lineStyle(1.5, 0xfff1bb, 0.85)
        .lineBetween(-size * 0.24, 0, size * 0.24, 0)
        .lineBetween(0, -size * 0.36, 0, size * 0.36);
      water.add(glint);
      for (let ring = 0; ring < 2; ring++) {
        const ripple = scene.add.ellipse(0, size * 0.22, size * (1 + ring * 0.65), size * (0.25 + ring * 0.16))
          .setStrokeStyle(1, 0xf2ffe7, ring ? 0.35 : 0.65);
        water.add(ripple);
        if (!reducedMotion()) scene.tweens.add({ targets: ripple,
          scaleX: 1.18, scaleY: 1.18, alpha: 0.45,
          delay: index * 170 + ring * 260, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
      }
      if (!reducedMotion()) scene.tweens.add({ targets: glint, alpha: 0.4,
        delay: index * 210, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    }
    const respond = () => {
      // Progress can redraw the tag; create the water response after that redraw.
      onTouch(index, x, y);
      if (scene.children.getByName('tutorial-paper')) return;
      // Repeated taps remain lightweight, even before earlier ripples have faded.
      const active = scene.children.list.filter((object): object is Phaser.GameObjects.Container =>
        object instanceof Phaser.GameObjects.Container && object.name.startsWith('sea-reflection-response-'));
      if (active.length >= 3) {
        const oldest = active.shift()!;
        scene.tweens.killTweensOf(oldest.list);
        oldest.destroy();
      }
      const reduced = reducedMotion();
      const effect = scene.add.container(x, y).setName(`sea-reflection-response-${index}`);
      const size = Phaser.Math.Clamp(art.width * 0.04, 12, 26);
      const light = scene.add.graphics().lineStyle(1, 0xfff1bb, 0.8)
        .lineBetween(-size * 0.18, 0, size * 0.18, 0)
        .lineBetween(0, -size * 0.3, 0, size * 0.3);
      effect.add(light);
      scene.tweens.add({ targets: light, alpha: 0, duration: reduced ? 220 : 360 });
      for (let ring = 0; ring < (reduced ? 1 : 2); ring++) {
        const ripple = scene.add.ellipse(0, size * 0.15, size, size * 0.28)
          .setStrokeStyle(1, 0xf2ffe7, 0.6).setAlpha(ring ? 0 : 0.8);
        effect.add(ripple);
        scene.tweens.add({ targets: ripple, alpha: { from: ring ? 0.6 : 0.8, to: 0 },
          scaleX: reduced ? 1 : 2.3 + ring * 0.5, scaleY: reduced ? 1 : 2.3 + ring * 0.5,
          delay: ring * 140, duration: reduced ? 240 : 760, ease: 'Sine.Out',
          onComplete: () => {
            if (ring !== (reduced ? 0 : 1)) return;
            effect.destroy();
          },
        });
      }
    };
    controls.add(`sea-reflection-${index}`, x, y, 44, 44, respond, false);
    const target = scene.children.getByName(`sea-reflection-${index}`) as Phaser.GameObjects.Zone;
    target.setInteractive(new Phaser.Geom.Circle(22, 22, 22), Phaser.Geom.Circle.Contains);
  });
}

export function gatherArchipelagoLight(scene: Phaser.Scene, art: WorldFrame,
  complete: (x: number, y: number) => void): void {
  const x = art.left + art.width * 0.48, y = art.top + art.height * 0.77;
  reflections.forEach((reflection, index) => {
    const light = scene.add.circle(art.left + reflection.x * art.width,
      art.top + reflection.y * art.height, Math.max(1.5, art.width * 0.003), 0xffedb2, 0.8)
      .setName(`souvenir-gather-light-${index}`);
    scene.tweens.add({ targets: light, x, y, delay: index * 25, duration: 520, ease: 'Sine.InOut',
      onComplete: () => { light.destroy(); if (index === reflections.length - 1) complete(x, y); } });
  });
}
