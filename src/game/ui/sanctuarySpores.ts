import Phaser from 'phaser';
import { AdventureControls, reducedMotion } from './adventureMap';
import { initialSanctuaryPuzzle, sanctuaryMushrooms, sanctuarySolution } from '../../domain/sanctuaryPuzzle';
import type { SanctuaryPuzzle } from '../../domain/sanctuaryPuzzle';
import type { WorldFrame } from './pilotWorlds';

export function sanctuaryBase(scene: Phaser.Scene, earned: boolean): string {
  const original = 'destination-sanctuaire_des_spores', key = 'sanctuary-dormant';
  if (earned) return original;
  if (scene.textures.exists(key)) return key;
  const f = scene.textures.getFrame(original);
  const canvas = document.createElement('canvas'); canvas.width = f.width; canvas.height = f.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(f.source.image as CanvasImageSource, f.cutX, f.cutY, f.cutWidth, f.cutHeight,
    0, 0, canvas.width, canvas.height);
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
    const distance = ((x / canvas.width - 0.519) / 0.092) ** 2 + ((y / canvas.height - 0.599) / 0.029) ** 2;
    if (distance >= 1) continue;
    const blend = Math.min(1, (1 - distance) * 8) * 0.57, i = (y * canvas.width + x) * 4;
    for (let c = 0; c < 3; c++) image.data[i + c] = image.data[i + c]! * (1 - blend) + [95, 64, 112][c]! * blend;
  }
  ctx.putImageData(image, 0, 0);
  scene.textures.addCanvas(key, canvas)?.get().setSize(canvas.width, canvas.height, 0, 0);
  return key;
}

function motif(scene: Phaser.Scene, x: number, y: number, radius: number, channel: number,
  position: number, ghost: boolean, aligned: boolean) {
  const g = scene.add.graphics({ x, y }).setAngle(position * 90)
    .setName(`sanctuary-${ghost ? 'model' : 'piece'}-${channel}`);
  const orbit = radius * [0.28, 0.59, 0.87][channel]!, dot = Math.max(1.5, radius * 0.060);
  const color = ghost ? 0xfff1c4 : aligned ? 0xffd983 : 0xe2b0ff;
  const offsets = channel === 0 ? [[0, 0], [0.10, -0.10]]
    : channel === 1 ? [[-0.11, 0.035], [0, -0.10], [0.11, 0.035]]
      : [[-0.18, 0.05], [-0.10, -0.045], [0, -0.09], [0.10, -0.045], [0.18, 0.05]];
  g.lineStyle(Math.max(0.8, radius * 0.018), color, ghost ? 0.65 : 0.85);
  g.lineBetween(0, -radius * 0.12, 0, -orbit);
  g.beginPath();
  offsets.forEach(([dx, dy], i) => {
    const sx = dx! * radius, sy = -orbit + dy! * radius;
    if (i === 0) g.moveTo(sx, sy); else g.lineTo(sx, sy);
  });
  g.strokePath();
  offsets.forEach(([dx, dy]) => {
    const sx = dx! * radius, sy = -orbit + dy! * radius;
    if (ghost) g.strokeCircle(sx, sy, dot * 1.6);
    else g.fillStyle(color, 0.13).fillCircle(sx, sy, dot * 3)
      .fillStyle(color, 0.95).fillCircle(sx, sy, dot);
  });
  return g;
}

export function drawSanctuarySpores(scene: Phaser.Scene, art: WorldFrame, puzzle: SanctuaryPuzzle,
  earned: boolean, awakening = false, forceVisible = false) {
  const objects: Array<Phaser.GameObjects.Graphics> = [], pieces: Phaser.GameObjects.Graphics[] = [];
  const reduced = reducedMotion(), cx = art.left + art.width * 0.548, cy = art.top + art.height * 0.316;
  const initial = initialSanctuaryPuzzle();
  const visible = forceVisible || puzzle.clueSeen || earned || puzzle.positions.some((p, i) => p !== initial.positions[i]);
  if (visible) {
    const radius = Math.max(34, art.width * 0.12);
    // A translucent cloud of spores lifts the projection off the bright stone.
    // Soft concentric layers have no hard panel edge; the painting remains visible.
    const mist = scene.add.graphics().setName('sanctuary-spore-mist'); objects.push(mist);
    for (let i = 24; i >= 1; i--) mist.fillStyle(0x452350, 0.024)
      .fillCircle(cx, cy, radius * 1.18 * i / 24);
    const dust = scene.add.graphics().setName('sanctuary-orbit-dust'); objects.push(dust);
    for (let i = 0; i < 32; i++) {
      const a = i * Math.PI / 16;
      dust.fillStyle(0xffd68b, 0.20 + i % 3 * 0.08).fillCircle(cx + Math.cos(a) * radius,
        cy + Math.sin(a) * radius, Math.max(0.6, radius * 0.012));
    }
    for (let i = 0; i < 3; i++) {
      if (puzzle.clueSeen) objects.push(motif(scene, cx, cy, radius, i, sanctuarySolution[i]!, true, false));
      const piece = motif(scene, cx, cy, radius, i, puzzle.positions[i]!, false,
        puzzle.positions[i] === sanctuarySolution[i]);
      pieces.push(piece); objects.push(piece);
      if (!reduced) scene.tweens.add({ targets: piece, alpha: 0.65, duration: 2400 + i * 310,
        yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    }
  }
  if (earned) {
    const spheres = [
      { x: 0.095, y: 0.456 }, { x: 0.261, y: 0.493 },
      { x: 0.788, y: 0.493 }, { x: 0.941, y: 0.465 },
    ];
    spheres.forEach((sphere, index) => {
      const spores = scene.add.graphics().setName(`sanctuary-alcove-spores-${index}`);
      objects.push(spores);
      const draw = (phase: number) => {
        spores.clear();
        for (let i = 0; i < 10; i++) {
          const p = (phase + i / 10) % 1, fade = Math.sin(p * Math.PI);
          const x = art.left + art.width * (sphere.x + Math.sin(i * 2.4 + p * 5) * (0.008 + p * 0.012));
          const y = art.top + art.height * (sphere.y - p * (index === 0 || index === 3 ? 0.14 : 0.11));
          const radius = Math.max(0.8, art.width * (0.0013 + i % 3 * 0.00045));
          spores.fillStyle(0xffcc78, fade * 0.12).fillCircle(x, y, radius * 3)
            .fillStyle(0xffe8ad, fade * 0.85).fillCircle(x, y, radius);
        }
      };
      draw(index * 0.17);
      if (!reduced) scene.tweens.add({ targets: spores, alpha: { from: 0.85, to: 1 },
        duration: 6500 + index * 730, repeat: -1,
        // Tween.progress stays at 1 after the first property repeat in Phaser 4.
        // The animated property's current value restarts on every repeat.
        onUpdate: tween => draw(((tween.getValue() ?? 0.85) - 0.85) / 0.15) });
    });
    const light = scene.add.graphics().setName('sanctuary-altar-light'); objects.push(light);
    const x = art.left + art.width * 0.519, y = art.top + art.height * 0.599;
    // Follow the painted flower's foreshortened petals rather than covering the altar.
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      light.fillStyle(0xffefb5, 0.45).fillEllipse(x + Math.cos(a) * art.width * 0.055,
        y + Math.sin(a) * art.height * 0.017, art.width * 0.013, art.height * 0.005);
    }
    if (!reduced) scene.tweens.add({ targets: light, alpha: 0.4, duration: 2900,
      yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    if (awakening && !reduced) {
      const stream = scene.add.graphics().setName('sanctuary-falling-spores'); objects.push(stream);
      scene.tweens.addCounter({ from: 0, to: 1, duration: 1550, onUpdate: tween => {
        const t = tween.getValue() ?? 0;
        stream.clear();
        for (let i = 0; i < 18; i++) {
          const p = Phaser.Math.Clamp(t * 1.6 - i * 0.028, 0, 1);
          stream.fillStyle(0xffe5a6, Math.sin(p * Math.PI)).fillCircle(
            Phaser.Math.Linear(cx, x, p) + Math.sin(i * 2.4 + p * 5) * art.width * 0.018 * (1 - p),
            Phaser.Math.Linear(cy, y, p), Math.max(1, art.width * 0.002));
        }
      }, onComplete: () => stream.destroy() });
    }
  }
  return { objects, pieces };
}

export function addSanctuaryPuzzle(scene: Phaser.Scene, controls: AdventureControls, art: WorldFrame,
  puzzle: SanctuaryPuzzle, earned: boolean,
  onTurn: (index: number) => { puzzle: SanctuaryPuzzle; collected: boolean },
  onClue: () => SanctuaryPuzzle, onSolved: () => void, awakening: boolean): void {
  const reduced = reducedMotion();
  let state = puzzle, drawing = drawSanctuarySpores(scene, art, puzzle, earned, awakening), busy = awakening;
  const refresh = (next: SanctuaryPuzzle, forceVisible = false) => {
    drawing.objects.forEach(object => { scene.tweens.killTweensOf(object); object.destroy(); });
    state = next; drawing = drawSanctuarySpores(scene, art, state, earned, false, forceVisible);
  };
  controls.add('sanctuary-clue', art.left + art.width * 0.515, art.top + art.height * 0.704,
    Math.max(36, art.width * 0.055), Math.max(36, art.height * 0.065), () => {
      if (busy || scene.children.getByName('tutorial-paper')) return;
      refresh(onClue());
    }, false);
  sanctuaryMushrooms.forEach((target, index) => {
    const x = art.left + art.width * target.x, y = art.top + art.height * target.y;
    controls.add(`sanctuary-mushroom-${index}`, x, y, Math.max(40, art.width * (index === 1 ? 0.07 : 0.13)),
      Math.max(36, art.height * 0.07), () => {
        if (busy || scene.children.getByName('tutorial-paper')) return;
        busy = true;
        const before = state, result = onTurn(index);
        // Show the constellation even if the player tries a mushroom before the clue.
        if (!drawing.pieces.length) refresh(before, true);
        const finish = () => {
          busy = false;
          if (result.collected) { onSolved(); return; }
          refresh(result.puzzle);
        };
        if (reduced) { finish(); return; }
        const spores = scene.add.graphics().setName(`sanctuary-mushroom-spores-${index}`);
        scene.tweens.addCounter({ from: 0, to: 1, duration: 650, onUpdate: tween => {
          const t = tween.getValue() ?? 0;
          spores.clear();
          for (let n = 0; n < 7; n++) spores.fillStyle(0xffe2a2, Math.sin(t * Math.PI))
            .fillCircle(Phaser.Math.Linear(x, art.left + art.width * 0.548, t)
              + Math.sin(n * 1.8 + t * 4) * art.width * 0.01,
            Phaser.Math.Linear(y, art.top + art.height * 0.316, t), Math.max(1, art.width * 0.0018));
        }, onComplete: () => { spores.destroy(); finish(); } });
        const piece = drawing.pieces[index]!;
        scene.tweens.killTweensOf(piece);
        scene.tweens.add({ targets: piece, angle: before.positions[index]! * 90 + 90,
          duration: 430, ease: 'Sine.InOut' });
      }, false);
  });
}
