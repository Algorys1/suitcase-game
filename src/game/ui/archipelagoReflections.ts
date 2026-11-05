import Phaser from 'phaser';
import { AdventureControls, reducedMotion } from './adventureMap';
import type { WorldFrame } from './pilotWorlds';

/** Anchors of the six large sun glints already painted in the original illustration. */
const reflections = [
  { x: 0.272, y: 0.433 }, { x: 0.372, y: 0.380 }, { x: 0.288, y: 0.588 },
  { x: 0.718, y: 0.737 }, { x: 0.942, y: 0.423 }, { x: 0.662, y: 0.912 },
];

/** Decorative only: no counter, ordered sequence, reward or saved state. */
export function addArchipelagoReflections(scene: Phaser.Scene, controls: AdventureControls, art: WorldFrame): void {
  const active: Phaser.GameObjects.Container[] = [];
  reflections.forEach((reflection, index) => {
    const x = art.left + reflection.x * art.width, y = art.top + reflection.y * art.height;
    const respond = () => {
      // Repeated taps remain lightweight, even before earlier ripples have faded.
      if (active.length >= 3) {
        const oldest = active.shift()!;
        scene.tweens.killTweensOf(oldest.list);
        oldest.destroy();
      }
      const reduced = reducedMotion();
      const effect = scene.add.container(x, y).setName(`sea-reflection-response-${index}`);
      active.push(effect);
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
            const position = active.indexOf(effect);
            if (position >= 0) active.splice(position, 1);
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
