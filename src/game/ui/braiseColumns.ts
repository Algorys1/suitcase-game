import Phaser from 'phaser';
import { AdventureControls, reducedMotion } from './adventureMap';
import { pilotTargets } from '../../domain/pilotExploration';
import type { WorldFrame } from './pilotWorlds';

const columns = ['tall', 'medium', 'short'].map((key, index) => ({
  key: `adventure-braise-column-${key}`, ...pilotTargets.coeur_de_braise[index]!,
  width: [0.118, 0.10, 0.08][index]!,
}));

/** The existing foreground ridge hides the feet of the sliding columns. */
function prepareLayers(scene: Phaser.Scene): void {
  if (scene.textures.exists('braise-rock-foreground')) return;
  const frame = scene.textures.getFrame('adventure-braise-ground');
  const canvas = document.createElement('canvas');
  canvas.width = 1024; canvas.height = 1024;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return;
  context.beginPath();
  const ridge = [[0, 0.86], [0.07, 0.85], [0.12, 0.845], [0.175, 0.848],
    [0.24, 0.864], [0.30, 0.885], [0.36, 0.94], [0.40, 1], [0, 1]];
  ridge.forEach(([x = 0, y = 0], index) => {
    if (index) context.lineTo(x * frame.width, y * frame.height);
    else context.moveTo(x * frame.width, y * frame.height);
  });
  context.closePath(); context.save(); context.clip();
  context.drawImage(frame.source.image as CanvasImageSource, frame.cutX, frame.cutY, frame.cutWidth, frame.cutHeight,
    0, 0, frame.width, frame.height);
  context.restore();
  scene.textures.addCanvas('braise-rock-foreground', canvas)?.get().setSize(frame.width, frame.height, 0, 0);

  const lava = document.createElement('canvas');
  lava.width = 1024; lava.height = 1024;
  const light = lava.getContext('2d', { willReadFrequently: true });
  if (!light) return;
  light.drawImage(frame.source.image as CanvasImageSource, frame.cutX, frame.cutY, frame.cutWidth, frame.cutHeight,
    0, 0, frame.width, frame.height);
  const pixels = light.getImageData(0, 0, frame.width, frame.height);
  // Select the actual warm lava paint; no oval overlay or invented river path.
  for (let y = 0; y < frame.height; y++) for (let x = 0; x < frame.width; x++) {
    const i = (y * frame.width + x) * 4;
    const r = pixels.data[i]!, g = pixels.data[i + 1]!, b = pixels.data[i + 2]!;
    pixels.data[i + 3] = y < frame.height * 0.40 ? 0
      : Math.round(Phaser.Math.Clamp((g - b * 1.8 - 30) / 70, 0, 1) * Phaser.Math.Clamp((r - 170) / 60, 0, 1) * 255);
  }
  light.putImageData(pixels, 0, 0);
  scene.textures.addCanvas('braise-lava-light', lava)?.get().setSize(frame.width, frame.height, 0, 0);
}

/** Recompose the same painted layers in all static cards, avoiding an Explorer swap. */
export function prepareBraisePostcard(scene: Phaser.Scene): void {
  const key = 'destination-coeur_de_braise';
  if (!scene.textures.exists(key) || !scene.textures.exists('adventure-braise-ground')
    || !columns.every(column => scene.textures.exists(column.key))) return;
  const previous = scene.textures.get(key).getSourceImage();
  if (previous instanceof HTMLCanvasElement && previous.dataset.sharedBraiseColumns) return;
  prepareLayers(scene);
  const frame = scene.textures.getFrame('adventure-braise-ground');
  const canvas = document.createElement('canvas');
  canvas.width = 1024; canvas.height = 1024; canvas.dataset.sharedBraiseColumns = 'true';
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return;
  const draw = (f: Phaser.Textures.Frame, x: number, y: number, width: number, height: number) =>
    context.drawImage(f.source.image as CanvasImageSource, f.cutX, f.cutY, f.cutWidth, f.cutHeight, x, y, width, height);
  draw(frame, 0, 0, frame.width, frame.height);
  for (const column of columns) {
    const f = scene.textures.getFrame(column.key), width = frame.width * column.width;
    draw(f, frame.width * column.x - width / 2, frame.height * column.y, width, width * f.height / f.width);
  }
  draw(scene.textures.getFrame('braise-rock-foreground'), 0, 0, frame.width, frame.height);
  scene.textures.remove(key);
  scene.textures.addCanvas(key, canvas)?.get().setSize(frame.width, frame.height, 0, 0);
}

export function addBraiseColumns(scene: Phaser.Scene, controls: AdventureControls, art: WorldFrame,
  visited: readonly number[], onLowered: (index: number, x: number, y: number) => void,
  awakening: boolean): void {
  if (!scene.textures.exists('adventure-braise-ground') || !columns.every(column => scene.textures.exists(column.key))) return;
  prepareLayers(scene);
  const complete = visited.length === columns.length, reduced = reducedMotion();
  (scene.children.getByName('exploration-art') as Phaser.GameObjects.Image | null)
    ?.setTexture('adventure-braise-ground').setDisplaySize(art.width, art.height);
  const lava = scene.add.image(art.left + art.width / 2, art.top + art.height / 2, 'braise-lava-light')
    .setDisplaySize(art.width, art.height).setBlendMode(Phaser.BlendModes.ADD)
    .setAlpha(complete ? 0.13 : 0).setName('braise-lava-pulse');
  if (complete && !reduced) scene.tweens.add({ targets: lava, alpha: 0.30,
    duration: 1700, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
  columns.forEach((column, index) => {
    const x = art.left + art.width * column.x, top = art.top + art.height * column.y;
    const depth = art.height * 0.05, lowered = visited.includes(index);
    const rock = scene.add.image(x, top + (complete ? awakening && !reduced ? depth : 0 : lowered ? depth : 0), column.key)
      .setOrigin(0.5, 0).setName(`braise-column-${index}`).setData('lowered', lowered).setData('moving', false);
    rock.setScale(art.width * column.width / rock.width);
    const name = `touch-column-${index}`, offset = art.width * column.width * 0.14;
    let down = lowered;
    const moveTarget = () => {
      // The reconstructed feet may extend beyond the postcard while sinking.
      // Crop in source coordinates so no sprite leaks over the paper frame.
      rock.setCrop(0, 0, rock.width, Math.max(0, Math.min(rock.height,
        (art.top + art.height - rock.y) / rock.scaleY)));
      controls.move(name, x, rock.y + offset);
    };
    const breathe = () => {
      rock.setData('moving', false);
      if (reduced) return;
      scene.tweens.add({ targets: rock, y: top + depth * 0.30, delay: index * 420,
        duration: 3300 + index * 320, yoyo: true, repeat: -1, ease: 'Sine.InOut', onUpdate: moveTarget });
    };
    const respond = () => {
      if (rock.getData('moving') || awakening) return;
      if (complete) {
        scene.tweens.killTweensOf(rock);
        if (reduced) return;
        rock.setData('moving', true);
        scene.tweens.add({ targets: rock, y: top + depth * 0.6, duration: 600, yoyo: true,
          ease: 'Sine.InOut', onUpdate: moveTarget, onComplete: breathe });
        return;
      }
      rock.setData('moving', true);
      if (!reduced) scene.tweens.add({ targets: lava, alpha: { from: 0.2, to: 0 }, duration: 850 });
      scene.tweens.add({ targets: rock, y: down ? top : top + depth, duration: reduced ? 0 : 800,
        ease: 'Sine.InOut', onUpdate: moveTarget, onComplete: () => {
          down = !down;
          rock.setData('moving', false).setData('lowered', down);
          if (down) onLowered(index, x, rock.y + offset);
        } });
    };
    controls.add(name, x, rock.y + offset, Math.max(44, art.width * column.width), 44, respond, false);
    moveTarget();
    if (complete && awakening && !reduced) scene.tweens.add({ targets: rock, y: top,
      delay: index * 180, duration: 850, ease: 'Sine.InOut', onUpdate: moveTarget, onComplete: breathe });
    else if (complete) breathe();
  });
  scene.add.image(art.left + art.width / 2, art.top + art.height / 2, 'braise-rock-foreground')
    .setDisplaySize(art.width, art.height).setName('braise-rock-foreground');
}
