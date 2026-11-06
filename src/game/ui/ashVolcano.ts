import Phaser from 'phaser';
import { AdventureControls, reducedMotion } from './adventureMap';
import type { WorldFrame } from './pilotWorlds';

const backgroundKey = 'destination-ile_des_cendres';
const ready = (scene: Phaser.Scene) => ['seed', 'shoot', 'smoke', 'sand-rim']
  .every(id => scene.textures.exists(`adventure-ash-${id}`)) && scene.textures.exists(backgroundKey);
const offsets = [0.16, 0.105, 0.052, 0];
const shootSizes = [0, 0, 0.45, 1];
const rimOpacities = [0, 0.55, 0.8, 1];

/** The front shell and the foreground sand cover the roots, leaving the cavity open. */
function preparePlantLayers(scene: Phaser.Scene): void {
  for (const part of ['seed-lip', 'sand-front']) {
    const key = `ash-${part}`;
    if (scene.textures.exists(key)) continue;
    const frame = scene.textures.getFrame(part === 'seed-lip' ? 'adventure-ash-seed' : 'adventure-ash-sand-rim');
    const canvas = document.createElement('canvas'); canvas.width = 2 ** Math.ceil(Math.log2(frame.width));
    canvas.height = 2 ** Math.ceil(Math.log2(frame.height));
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) continue;
    context.save(); context.scale(frame.width, frame.height); context.beginPath();
    if (part === 'seed-lip') {
      context.moveTo(0, 1); context.lineTo(0, 0.5); context.lineTo(0.45, 0.23);
      context.bezierCurveTo(0.62, 0.20, 0.72, 0.24, 0.70, 0.29);
      context.bezierCurveTo(0.76, 0.34, 0.69, 0.45, 0.72, 0.57);
      context.bezierCurveTo(0.68, 0.72, 0.77, 0.85, 0.52, 1); context.closePath();
    } else context.rect(0, 0.48, 1, 0.52);
    context.restore(); context.clip();
    context.drawImage(frame.source.image as CanvasImageSource, frame.cutX, frame.cutY,
      frame.cutWidth, frame.cutHeight, 0, 0, frame.width, frame.height);
    scene.textures.addCanvas(key, canvas)?.get().setSize(frame.width, frame.height, 0, 0);
  }
}

/** Existing sand in front of the seed hides its buried base during emergence. */
function sandTexture(scene: Phaser.Scene): string {
  const key = 'ash-sand-foreground';
  if (scene.textures.exists(key)) return key;
  const frame = scene.textures.getFrame(backgroundKey);
  const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 1024;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return backgroundKey;
  const edge = [[0.55, 0.871], [0.58, 0.865], [0.61, 0.869], [0.64, 0.866],
    [0.67, 0.863], [0.70, 0.868], [0.74, 0.870], [0.79, 0.875], [0.79, 1], [0.55, 1]];
  context.beginPath();
  edge.forEach(([x = 0, y = 0], i) => {
    if (i) context.lineTo(x * frame.width, y * frame.height);
    else context.moveTo(x * frame.width, y * frame.height);
  });
  context.closePath(); context.clip();
  context.drawImage(frame.source.image as CanvasImageSource, frame.cutX, frame.cutY,
    frame.cutWidth, frame.cutHeight, 0, 0, frame.width, frame.height);
  scene.textures.addCanvas(key, canvas)?.get().setSize(frame.width, frame.height, 0, 0);
  return key;
}

function drawFrame(context: CanvasRenderingContext2D, frame: Phaser.Textures.Frame,
  x: number, y: number, width: number, height: number): void {
  context.drawImage(frame.source.image as CanvasImageSource, frame.cutX, frame.cutY,
    frame.cutWidth, frame.cutHeight, x, y, width, height);
}

/** All postcard views use the same dormant plate, plant geometry and saved stage. */
export function ashPostcard(scene: Phaser.Scene, stage: number): string {
  if (!ready(scene)) return backgroundKey;
  const key = `ash-postcard-planted-stage-${stage}`;
  if (scene.textures.exists(key)) return key;
  const frame = scene.textures.getFrame(backgroundKey);
  const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 1024;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return backgroundKey;
  const w = frame.width, h = frame.height;
  drawFrame(context, frame, 0, 0, w, h);
  if (stage > 0) {
    preparePlantLayers(scene);
    const rim = scene.textures.getFrame('adventure-ash-sand-rim');
    const rw = w * 0.175, rh = rw * rim.height / rim.width;
    context.globalAlpha = rimOpacities[stage]!;
    drawFrame(context, rim, w * 0.645 - rw / 2, h * 0.858 - rh / 2, rw, rh);
    context.globalAlpha = 1;
    const shoot = scene.textures.getFrame('adventure-ash-shoot');
    const size = shootSizes[stage]!, sw = w * 0.17 * size, sh = sw * shoot.height / shoot.width;
    const seed = scene.textures.getFrame('adventure-ash-seed');
    const width = w * 0.135, height = width * seed.height / seed.width;
    context.save(); context.beginPath(); context.rect(0, 0, w, h); context.clip();
    drawFrame(context, seed, w * 0.645 - width / 2, h * (0.895 + offsets[stage]!) - height, width, height);
    if (size) drawFrame(context, shoot, w * 0.667 - sw * 0.30,
      h * (0.833 + offsets[stage]!) - sh, sw, sh);
    drawFrame(context, scene.textures.getFrame('ash-seed-lip'), w * 0.645 - width / 2,
      h * (0.895 + offsets[stage]!) - height, width, height);
    context.restore();
    drawFrame(context, scene.textures.getFrame(sandTexture(scene)), 0, 0, w, h);
    context.globalAlpha = rimOpacities[stage]!;
    drawFrame(context, scene.textures.getFrame('ash-sand-front'), w * 0.645 - rw / 2,
      h * 0.858 - rh / 2, rw, rh); context.globalAlpha = 1;
    context.strokeStyle = stage === 1 ? '#df785a' : '#ffb076';
    context.lineWidth = stage === 1 ? 1.8 : 2.8;
    context.beginPath(); context.moveTo(w * 0.169, h * 0.321);
    context.lineTo(w * 0.1752, h * 0.324); context.lineTo(w * 0.218, h * 0.327); context.stroke();
    if (stage >= 2) {
      const smoke = scene.textures.getFrame('adventure-ash-smoke');
      const width = w * (stage === 3 ? 0.11 : 0.045);
      context.globalAlpha = 0.60;
      drawFrame(context, smoke, w * 0.1755 - width * 0.4, h * 0.317 - width * smoke.height / smoke.width,
        width, width * smoke.height / smoke.width);
      context.globalAlpha = 1;
    }
  }
  scene.textures.addCanvas(key, canvas)?.get().setSize(w, h, 0, 0);
  return key;
}

export function addAshVolcano(scene: Phaser.Scene, controls: AdventureControls, art: WorldFrame,
  steps: readonly number[], onPress: (index: number, x: number, y: number) => void,
  awakening: boolean): void {
  if (!ready(scene)) return;
  preparePlantLayers(scene);
  const reduced = reducedMotion();
  let stage = steps.length, busy = awakening;
  (scene.children.getByName('exploration-art') as Phaser.GameObjects.Image | null)
    ?.setTexture(backgroundKey).setDisplaySize(art.width, art.height);
  const px = (x: number) => art.left + art.width * x, py = (y: number) => art.top + art.height * y;
  const rim = scene.add.image(px(0.645), py(0.858), 'adventure-ash-sand-rim').setName('ash-sand-rim');
  rim.setScale(art.width * 0.175 / rim.width);
  const seed = scene.add.image(px(0.645), py(0.895), 'adventure-ash-seed').setOrigin(0.5, 1)
    .setName('ash-emerging-seed');
  seed.setScale(art.width * 0.135 / seed.width);
  const shoot = scene.add.image(px(0.667), py(0.833), 'adventure-ash-shoot').setOrigin(0.30, 1)
    .setName('ash-growing-shoot');
  const lip = scene.add.image(seed.x, seed.y, 'ash-seed-lip').setOrigin(0.5, 1)
    .setScale(seed.scaleX).setName('ash-seed-front-lip');
  scene.add.image(art.left, art.top, sandTexture(scene)).setOrigin(0)
    .setDisplaySize(art.width, art.height).setName('ash-front-sand');
  const rimFront = scene.add.image(rim.x, rim.y, 'ash-sand-front').setScale(rim.scaleX)
    .setName('ash-sand-rim-front');
  const state = { offset: offsets[stage]!, shoot: shootSizes[stage]!, sand: rimOpacities[stage]! };
  const plant = () => {
    seed.setY(py(0.895 + state.offset)).setVisible(stage > 0 || busy);
    lip.setY(seed.y).setVisible(seed.visible);
    rim.setAlpha(state.sand); rimFront.setAlpha(state.sand);
    // Keep hidden pixels inside the postcard even at the deepest starting position.
    const visible = Phaser.Math.Clamp((py(0.875) - (seed.y - seed.displayHeight)) / seed.scaleY, 0, seed.height);
    seed.setCrop(0, 0, seed.width, visible);
    lip.setCrop(0, 0, lip.width, visible);
    shoot.setPosition(px(0.667), py(0.833 + state.offset))
      .setScale(art.width * 0.17 / shoot.width * state.shoot).setVisible(state.shoot > 0);
  };
  plant();
  const crater = scene.add.graphics().setName('ash-crater-light');
  const drawCrater = (level: number) => {
    crater.clear(); if (!level) return;
    const points = [new Phaser.Math.Vector2(px(0.169), py(0.321)),
      new Phaser.Math.Vector2(px(0.192), py(0.324)), new Phaser.Math.Vector2(px(0.218), py(0.327))];
    crater.lineStyle(Math.max(2, art.width * 0.008), 0xe47f61, 0.12 * level).strokePoints(points);
    crater.lineStyle(Math.max(0.7, art.width * 0.002), level === 1 ? 0xdf785a : 0xffb076, 0.8)
      .strokePoints(points);
  };
  drawCrater(stage);
  const smoke = () => {
    if (stage < 2) return;
    const count = reduced ? 1 : stage === 3 ? 4 : 1;
    for (let i = 0; i < count; i++) {
      const puff = scene.add.image(px(0.195), py(0.315), 'adventure-ash-smoke')
        .setOrigin(0.5, 1).setAlpha(reduced ? 0.60 : 0).setName(`ash-smoke-${i}`);
      const width = art.width * (stage === 3 ? 0.11 : 0.045), scale = width / puff.width;
      puff.setScale(scale);
      if (reduced) continue;
      const flow = { p: 0 };
      scene.tweens.add({ targets: flow, p: 1, duration: 3300, delay: i * 800,
        repeat: stage === 3 ? -1 : 0, onUpdate: () => {
          puff.setPosition(px(0.195 + flow.p * 0.065), py(0.315 - flow.p * 0.09))
            .setScale(scale * (0.55 + flow.p * 0.60)).setAlpha(Math.sin(flow.p * Math.PI) * 0.80);
        }, onComplete: () => puff.destroy() });
    }
  };
  smoke();
  const burst = (level: number) => {
    if (reduced) return;
    if (level === 3) {
      for (let i = 0; i < 4; i++) {
        const plume = scene.add.image(px(0.192), py(0.322), 'adventure-ash-smoke')
          .setOrigin(0.5, 1).setAlpha(0).setName('ash-eruption-plume');
        const scale = art.width * 0.11 / plume.width;
        plume.setScale(scale * 0.25);
        scene.tweens.add({ targets: plume, x: px(0.20 + i * 0.012), y: py(0.25 - i * 0.012),
          scaleX: scale, scaleY: scale, alpha: 0.75, delay: i * 140, duration: 700,
          ease: 'Sine.Out', onComplete: () => {
            scene.tweens.add({ targets: plume, y: plume.y - art.height * 0.025,
              alpha: 0, duration: 850, onComplete: () => plume.destroy() });
          } });
      }
    }
    for (let i = 0; i < (level === 3 ? 13 : 3); i++) {
      const dust = scene.add.ellipse(px(0.192), py(0.322), Math.max(1.2, art.width * 0.003),
        Math.max(1.8, art.width * 0.004), i % 2 ? 0xffb577 : 0xe78972, 0.85)
        .setName('ash-eruption-ember');
      const dx = (i % 7 - 3) * art.width * 0.009;
      const motion = { p: 0 };
      scene.tweens.add({ targets: motion, p: 1, duration: 1000 + i * 30, delay: i * 45,
        onUpdate: () => dust.setPosition(px(0.192) + dx * motion.p,
          py(0.322) - Math.sin(motion.p * Math.PI) * art.height * (level === 3 ? 0.10 : 0.035))
          .setAlpha((1 - motion.p) * 0.85), onComplete: () => dust.destroy() });
    }
    for (let i = 0; i < 8; i++) {
      const grain = scene.add.ellipse(px(0.645 + (i - 4) * 0.009), py(0.867),
        Math.max(1, art.width * 0.003), Math.max(1, art.width * 0.002), i % 2 ? 0x986d6c : 0xba8070, 0.7)
        .setName('ash-sand-grain');
      scene.tweens.add({ targets: grain, x: grain.x + (i - 4) * art.width * 0.004,
        y: grain.y - art.height * (0.01 + i % 3 * 0.006), alpha: 0, duration: 550 + i * 35,
        onComplete: () => grain.destroy() });
    }
  };
  if (awakening) burst(3);
  if (stage === 3 && !reduced) scene.tweens.add({ targets: crater, alpha: 0.65,
    duration: 1900, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
  controls.add('ash-volcano', px(0.195), py(0.365), Math.max(48, art.width * 0.18),
    Math.max(44, art.height * 0.18), () => {
      if (busy || scene.children.getByName('tutorial-paper')) return;
      if (stage === 3) { burst(2); return; }
      busy = true;
      const next = stage + 1;
      drawCrater(next); burst(next);
      const finish = () => {
        stage = next; busy = false; plant(); smoke();
        onPress(next - 1, px(0.195), py(0.322));
      };
      if (reduced) {
        state.offset = offsets[next]!; state.shoot = shootSizes[next]!; state.sand = rimOpacities[next]!; finish();
      }
      else scene.tweens.add({ targets: state, offset: offsets[next]!, shoot: shootSizes[next]!,
        sand: rimOpacities[next]!,
        duration: 900, ease: 'Sine.InOut', onUpdate: plant, onComplete: finish });
    }, false);
}
