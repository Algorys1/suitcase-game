import Phaser from 'phaser';
import { AdventureControls, reducedMotion } from './adventureMap';
import { pilotTargets } from '../../domain/pilotExploration';
import type { WorldFrame } from './pilotWorlds';

// Three snow-covered boughs, and the painted roses, frozen canal and bridge crystal below.
const landings = [{ x: 0.108, y: 0.866 }, { x: 0.285, y: 0.823 }, { x: 0.449, y: 0.589 }];
const outlines = [
  [[0.026, 0.80], [0.092, 0.775], [0.15, 0.842], [0.23, 0.866],
    [0.27, 0.95], [0.225, 0.973], [0.15, 0.92], [0.04, 0.88]],
  [[0.155, 0.753], [0.245, 0.78], [0.265, 0.818], [0.433, 0.837],
    [0.528, 0.885], [0.65, 0.923], [0.76, 0.956], [0.83, 1],
    [0.35, 1], [0.26, 0.906], [0.15, 0.85], [0.13, 0.79]],
  [[0.449, 0.553], [0.463, 0.581], [0.459, 0.602], [0.445, 0.612], [0.433, 0.588]],
] as const;

/** Sample the existing paint only: no replacement scenery or opaque colour patch. */
function pearlPaint(scene: Phaser.Scene, index: number): string {
  const key = `frost-pearl-paint-${index}`;
  if (scene.textures.exists(key)) return key;
  const frame = scene.textures.getFrame('destination-palais_de_givre');
  const texture = scene.textures.createCanvas(key, frame.width, frame.height);
  if (!texture) return '__WHITE';
  const context = texture.context;
  context.beginPath();
  outlines[index]!.forEach(([x, y], i) => {
    if (i) context.lineTo(x * frame.width, y * frame.height);
    else context.moveTo(x * frame.width, y * frame.height);
  });
  context.closePath(); context.clip();
  context.drawImage(frame.source.image as CanvasImageSource, frame.cutX, frame.cutY,
    frame.cutWidth, frame.cutHeight, 0, 0, frame.width, frame.height);
  const pixels = context.getImageData(0, 0, frame.width, frame.height);
  for (let i = 0; i < pixels.data.length; i += 4) {
    const r = pixels.data[i]!, g = pixels.data[i + 1]!, b = pixels.data[i + 2]!;
    // Keep violet petals/facets; the canal retains its painted pink and blue reflections.
    if (!(b > g + (index === 1 ? 24 : 16) && r > g + (index === 1 ? 14 : 9))) pixels.data[i + 3] = 0;
    else {
      if (index === 1) pixels.data[i + 3] = Math.round(pixels.data[i + 3]! * 0.65);
      pixels.data[i] = Math.min(255, r * 0.8 + 35);
      pixels.data[i + 1] = Math.min(255, g + 45);
      pixels.data[i + 2] = Math.min(255, b + 20);
    }
  }
  context.putImageData(pixels, 0, 0); texture.refresh();
  return key;
}

export function addFrostBranches(scene: Phaser.Scene, controls: AdventureControls, art: WorldFrame,
  steps: readonly number[], onWatered: (index: number, x: number, y: number) => void,
  awakening: boolean): void {
  const reduced = reducedMotion(), lit = new Set(steps), busy = new Set<number>();
  const px = (x: number) => art.left + art.width * x;
  const py = (y: number) => art.top + art.height * y;
  const light = (index: number) => {
    if (scene.children.getByName(`frost-pearl-${index}`)) return;
    const glow = scene.add.image(art.left, art.top, pearlPaint(scene, index)).setOrigin(0)
      .setDisplaySize(art.width, art.height).setBlendMode(Phaser.BlendModes.ADD)
      .setAlpha(0.14).setName(`frost-pearl-${index}`);
    if (!reduced) scene.tweens.add({ targets: glow, alpha: 0.07, duration: 2600 + index * 230,
      yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    // Glints stay on the watered surfaces, never on undiscovered targets.
    const points = index === 0 ? [[0.06, 0.805], [0.11, 0.86], [0.205, 0.889]]
      : index === 1 ? [[0.22, 0.818], [0.34, 0.868], [0.48, 0.911], [0.60, 0.94]]
      : [[0.449, 0.573], [0.447, 0.595]];
    points.forEach(([x = 0, y = 0], n) => {
      const glint = scene.add.graphics().setPosition(px(x), py(y)).setName(`frost-glint-${index}-${n}`)
        .setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.4);
      const r = Math.max(1, art.width * 0.003);
      glint.fillStyle(n % 2 ? 0xd8fffa : 0xffe5f9, 0.8)
        .fillTriangle(0, -r * 1.6, r * 0.4, 0, 0, r * 1.6)
        .fillTriangle(0, -r * 1.6, -r * 0.4, 0, 0, r * 1.6);
      if (!reduced) scene.tweens.add({ targets: glint, alpha: 0.08,
        duration: 1600 + n * 330, delay: n * 210, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    });
  };
  steps.forEach(light);
  pilotTargets.palais_de_givre.forEach((branch, index) => {
    const w = Math.max(38, art.width * 0.13), h = Math.max(32, art.height * 0.095);
    const x = Phaser.Math.Clamp(px(branch.x), art.left + w / 2, art.left + art.width - w / 2);
    const y = Phaser.Math.Clamp(py(branch.y), art.top + h / 2, art.top + art.height - h / 2);
    controls.add(`frost-branch-${index}`, x, y, w, h, () => {
      if (awakening || busy.has(index) || scene.children.getByName('tutorial-paper')) return;
      busy.add(index);
      const landing = landings[index]!;
      const finish = () => {
        busy.delete(index); light(index);
        if (!lit.has(index)) { lit.add(index); onWatered(index, px(landing.x), py(landing.y)); }
      };
      if (reduced) { finish(); return; }
      // Faceted, translucent frozen drops fall with a small lateral drift, no targeting beam.
      for (let n = 0; n < 5; n++) {
        const offset = (n - 2) * 0.008;
        const drop = scene.add.graphics().setPosition(px(branch.x + offset), py(branch.y + 0.015))
          .setName(`frost-drop-${index}-${n}`);
        const r = Math.max(1.5, art.width * 0.004);
        drop.fillStyle(n % 2 ? 0xd9f8ff : 0xf9eaff, 0.8)
          .fillTriangle(0, -r * 2, r * 0.7, 0, 0, r)
          .fillTriangle(0, -r * 2, -r * 0.7, 0, 0, r)
          .lineStyle(0.7, 0xffffff, 0.7).lineBetween(0, -r * 1.4, 0, r * 0.4);
        scene.tweens.add({ targets: drop, x: px(landing.x + offset), y: py(landing.y + offset * 0.4),
          duration: 1100, delay: n * 100, ease: 'Quad.In', onComplete: () => {
            drop.destroy();
            if (n === 4) finish();
          } });
      }
    }, false);
  });
}
