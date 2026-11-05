import Phaser from 'phaser';
import { AdventureControls, reducedMotion } from './adventureMap';
import { pilotTargets } from '../../domain/pilotExploration';
import type { WorldFrame } from './pilotWorlds';

const layers = ['sky', 'waterfall', 'left', 'right'];
const bridgePlacement = { x: 0.335, y: 0.354, width: 0.43 };
const grassLandings = [
  { key: 'adventure-isles-grass-left', x: 0.35, y: 0.480, width: 0.09 },
  { key: 'adventure-isles-grass-right', x: 0.75, y: 0.480, width: 0.09 },
];
const targets = pilotTargets.iles_suspendues;
const ready = (scene: Phaser.Scene) => [...layers, 'bridge', 'grass-left', 'grass-right']
  .every(id => scene.textures.exists(`adventure-isles-${id}`));

/** Static and interactive views use exactly the same paint and registration. */
export function prepareIslesPostcard(scene: Phaser.Scene): void {
  const key = 'destination-iles_suspendues';
  if (!ready(scene) || !scene.textures.exists(key)) return;
  const old = scene.textures.get(key).getSourceImage();
  if (old instanceof HTMLCanvasElement && old.dataset.sharedIslesBridge) return;
  const frame = scene.textures.getFrame('adventure-isles-sky');
  const canvas = document.createElement('canvas');
  canvas.width = 1024; canvas.height = 1024; canvas.dataset.sharedIslesBridge = 'true';
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return;
  context.imageSmoothingEnabled = true; context.imageSmoothingQuality = 'high';
  for (const id of layers) {
    const f = scene.textures.getFrame(`adventure-isles-${id}`);
    context.drawImage(f.source.image as CanvasImageSource, f.cutX, f.cutY, f.cutWidth, f.cutHeight,
      0, 0, frame.width, frame.height);
  }
  const f = scene.textures.getFrame('adventure-isles-bridge'), width = frame.width * bridgePlacement.width;
  context.drawImage(f.source.image as CanvasImageSource, f.cutX, f.cutY, f.cutWidth, f.cutHeight,
    frame.width * bridgePlacement.x, frame.height * bridgePlacement.y, width, width * f.height / f.width);
  for (const landing of grassLandings) {
    const grass = scene.textures.getFrame(landing.key), w = frame.width * landing.width;
    const h = w * grass.height / grass.width;
    context.drawImage(grass.source.image as CanvasImageSource, grass.cutX, grass.cutY, grass.cutWidth, grass.cutHeight,
      frame.width * landing.x - w / 2, frame.height * landing.y - h, w, h);
  }
  scene.textures.remove(key);
  scene.textures.addCanvas(key, canvas)?.get().setSize(frame.width, frame.height, 0, 0);
}

/** Deform narrow strips of the painted bridge; ropes and planks remain connected. */
export function addIslesBridge(scene: Phaser.Scene, controls: AdventureControls, art: WorldFrame,
  visited: readonly number[], onStep: (index: number, x: number, y: number) => void,
  awakening: boolean): () => void {
  if (!ready(scene)) return () => {};
  const reduced = reducedMotion(), complete = visited.length === targets.length;
  (scene.children.getByName('exploration-art') as Phaser.GameObjects.Image | null)
    ?.setTexture('adventure-isles-sky').setDisplaySize(art.width, art.height);
  const centerX = art.left + art.width / 2, centerY = art.top + art.height / 2;
  const islands = ['waterfall', 'left', 'right'].map(id => scene.add.image(centerX, centerY, `adventure-isles-${id}`)
    .setDisplaySize(art.width, art.height).setName(`isles-${id}`));
  const bridge = scene.textures.getFrame('adventure-isles-bridge');
  const bridgeX = art.left + art.width * bridgePlacement.x, bridgeY = art.top + art.height * bridgePlacement.y;
  const scale = art.width * bridgePlacement.width / bridge.width;
  const strips = Array.from({ length: 32 }, (_, index) => {
    const left = Math.floor(index * bridge.width / 32), right = Math.floor((index + 1) * bridge.width / 32);
    const image = scene.add.image(bridgeX, bridgeY, 'adventure-isles-bridge').setOrigin(0, 0).setScale(scale)
      .setCrop(left, 0, right - left, bridge.height).setName(`isles-bridge-strip-${index}`);
    return { image, x: bridgePlacement.x + (left + right) / 2 * scale / art.width };
  });
  // Foreground grass hides the hard join where the bridge meets each bank.
  const grasses = grassLandings.map(landing => {
    const grass = scene.add.image(art.left + art.width * landing.x, art.top + art.height * landing.y, landing.key)
      .setOrigin(0.5, 1).setName(landing.key.replace('adventure-', ''));
    return grass.setScale(art.width * landing.width / grass.width);
  });
  const waves: { x: number; phase: number }[] = [];
  const busy = new Set<number>(), touched = new Set(visited);
  const drift = { phase: 0 };
  const offsets = () => complete && !reduced
    ? [Math.sin(drift.phase) * art.height * 0.003, Math.sin(drift.phase + 0.8) * art.height * 0.003] : [0, 0];
  const update = () => {
    const [left = 0, right = 0] = offsets();
    islands[1]!.setY(centerY + left); islands[2]!.setY(centerY + right);
    grasses[0]!.setY(art.top + art.height * grassLandings[0]!.y + left);
    grasses[1]!.setY(art.top + art.height * grassLandings[1]!.y + right);
    islands[0]!.setY(centerY + (complete && !reduced ? Math.sin(drift.phase + 0.4) * art.height * 0.004 : 0));
    // The left tree touches the photograph edge; keep its moving paint inside it.
    islands.forEach(image => {
      const dy = image.y - centerY, cropTop = Math.max(0, -dy / image.scaleY);
      image.setCrop(0, cropTop, image.width, image.height - Math.abs(dy / image.scaleY));
    });
    for (const strip of strips) {
      const t = Phaser.Math.Clamp((strip.x - 0.35) / 0.40, 0, 1);
      const sag = waves.reduce((sum, wave) => sum + Math.sin(wave.phase * Math.PI)
        * Math.exp(-(((strip.x - wave.x) / 0.085) ** 2)) * art.height * 0.009, 0);
      strip.image.setY(bridgeY + Phaser.Math.Linear(left, right, t) + sag * Math.sin(Math.PI * t));
    }
    targets.forEach((point, index) => controls.move(`bridge-step-${index}`,
      art.left + point.x * art.width, art.top + point.y * art.height + Phaser.Math.Linear(left, right, index / 4)));
  };
  const respond = (index: number) => {
    if (awakening || busy.has(index) || scene.children.getByName('tutorial-paper')) return;
    const point = targets[index]!;
    if (reduced) {
      if (!touched.has(index)) { touched.add(index); onStep(index, art.left + point.x * art.width, art.top + point.y * art.height); }
      return;
    }
    busy.add(index);
    const wave = { x: point.x, phase: 0 }; waves.push(wave);
    scene.tweens.add({ targets: wave, phase: 1, duration: 850, ease: 'Sine.InOut', onUpdate: update,
      onComplete: () => {
        waves.splice(waves.indexOf(wave), 1); busy.delete(index); update();
        if (!touched.has(index)) { touched.add(index); onStep(index, art.left + point.x * art.width, art.top + point.y * art.height); }
      } });
  };
  targets.forEach((point, index) => controls.add(`bridge-step-${index}`,
    art.left + point.x * art.width, art.top + point.y * art.height,
    Math.max(18, art.width * 0.065), 44, () => respond(index), false));
  let lastDragged = -1;
  const drag = (pointer: Phaser.Input.Pointer) => {
    if (!pointer.isDown || awakening || scene.children.getByName('tutorial-paper')) return;
    let nearest = -1, distance = Infinity;
    targets.forEach((point, index) => {
      const d = Phaser.Math.Distance.Between(pointer.x, pointer.y, art.left + point.x * art.width, art.top + point.y * art.height);
      if (d < distance) { nearest = index; distance = d; }
    });
    if (distance > 24 || nearest === lastDragged) return;
    lastDragged = nearest; respond(nearest);
  };
  const release = () => { lastDragged = -1; };
  scene.input.on('pointermove', drag); scene.input.on('pointerup', release);
  if (complete && !reduced) scene.tweens.add({ targets: drift, phase: Math.PI * 2, duration: 14000,
    repeat: -1, onUpdate: update });
  if (awakening && !reduced) {
    const wave = { x: 0.40, phase: 0 }; waves.push(wave);
    scene.tweens.add({ targets: wave, x: 0.72, phase: 1, duration: 1100, onUpdate: update,
      onComplete: () => { waves.splice(waves.indexOf(wave), 1); update(); } });
  }
  update();
  return () => { scene.input.off('pointermove', drag); scene.input.off('pointerup', release); };
}
