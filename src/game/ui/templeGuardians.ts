import Phaser from 'phaser';
import { AdventureControls, reducedMotion } from './adventureMap';
import { pilotTargets } from '../../domain/pilotExploration';
import type { WorldFrame } from './pilotWorlds';
import { addTempleCarvingLight } from './templeCarvingLight';

// Complete figures rest on existing surfaces: two steps and the mossy rock.
const guardians = [
  { key: 'bird', x: 0.70, bottom: 0.813, width: 0.105 },
  { key: 'round', x: 0.185, bottom: 0.770, width: 0.125 },
  { key: 'leaf', x: 0.50, bottom: 0.910, width: 0.115 },
];
const carvings = [
  { x: 0.760, y: 0.522, w: 0.032, h: 0.098 },
  { x: 0.480, y: 0.540, w: 0.033, h: 0.093 },
  { x: 0.604, y: 0.249, w: 0.076, h: 0.073 },
];

export function addTempleGuardians(scene: Phaser.Scene, controls: AdventureControls, art: WorldFrame,
  visited: readonly number[], onAwakened: (index: number, x: number, y: number) => void,
  awakening: boolean): void {
  if (!guardians.every(guardian => scene.textures.exists(`adventure-temple-${guardian.key}`))) return;
  const reduced = reducedMotion(), lit = new Set(visited), busy = new Set<number>();
  const reveal = (index: number, animate: boolean) => {
    addTempleCarvingLight(scene, art, index, animate);
    const placement = guardians[index]!;
    const x = art.left + placement.x * art.width, y = art.top + placement.bottom * art.height;
    const shadow = scene.add.graphics().setName(`temple-contact-shadow-${index}`)
      .fillStyle(0x493723, 0.13).fillEllipse(x, y, art.width * placement.width * 0.82,
        art.width * placement.width * 0.13)
      .fillStyle(0x493723, 0.24).fillEllipse(x, y - art.width * placement.width * 0.015,
        art.width * placement.width * 0.58, art.width * placement.width * 0.045)
      .setAlpha(animate && !reduced ? 0 : 1);
    const guardian = scene.add.image(x, y, `adventure-temple-${placement.key}`).setOrigin(0.5, 1)
      .setName(`temple-guardian-${index}`).setAlpha(animate && !reduced ? 0 : 1);
    guardian.setScale(art.width * placement.width / guardian.width);
    if (animate && !reduced) {
      scene.tweens.add({ targets: [guardian, shadow], alpha: 1, delay: 350, duration: 450, ease: 'Sine.Out' });
    }
  };
  visited.forEach(index => reveal(index, false));
  pilotTargets.temple_oublie.forEach((target, index) => {
    const x = art.left + target.x * art.width, y = art.top + target.y * art.height;
    const rect = carvings[index]!;
    controls.add(`temple-carving-${index}`, x, y, Math.max(38, art.width * (rect.w + 0.018)),
      Math.max(38, art.height * (rect.h + 0.015)), () => {
        if (awakening || busy.has(index) || scene.children.getByName('tutorial-paper')) return;
        if (lit.has(index)) {
          const glow = scene.children.getByName(`temple-carving-halo-${index}`);
          if (glow && !reduced) scene.tweens.add({ targets: glow, alpha: 0.68, duration: 300, yoyo: true });
          return;
        }
        busy.add(index); reveal(index, true);
        const finish = () => { busy.delete(index); lit.add(index); onAwakened(index, x, y); };
        if (reduced) finish();
        else scene.tweens.addCounter({ from: 0, to: 1, duration: 800, onComplete: finish });
      }, false);
  });
}
