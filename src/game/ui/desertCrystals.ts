import Phaser from 'phaser';
import { AdventureControls, reducedMotion } from './adventureMap';
import type { WorldFrame } from './pilotWorlds';
import { pilotTargets } from '../../domain/pilotExploration';

// Regions of the six existing painted clusters; no replacement crystal artwork.
const regions = [
  [0.038, 0.272, 0.112, 0.207], [0.314, 0.399, 0.042, 0.061],
  [0.895, 0.307, 0.064, 0.108], [0.868, 0.488, 0.111, 0.191],
  [0.784, 0.795, 0.098, 0.174], [0.057, 0.565, 0.153, 0.318],
] as const;
// Restrict each sample to the painted crystal itself, excluding nearby purple
// sky, shadows and neighbouring crystals inside the generous touch regions.
const silhouettes = [
  [[161, 301], [211, 355], [198, 418], [182, 469], [167, 498], [111, 487], [65, 501], [83, 372]],
  [[478, 437], [494, 456], [510, 482], [508, 495], [481, 496], [461, 477], [467, 452]],
  [[1369, 342], [1385, 376], [1369, 414], [1354, 432], [1300, 441], [1307, 406], [1321, 372]],
  [[1376, 536], [1408, 590], [1393, 637], [1367, 669], [1335, 714], [1294, 736], [1269, 723], [1275, 680], [1287, 623], [1303, 583]],
  [[1208, 869], [1247, 894], [1272, 935], [1266, 971], [1249, 1005], [1221, 1043], [1155, 1043], [1147, 1011], [1148, 939], [1175, 903]],
  [[251, 619], [297, 666], [294, 709], [279, 750], [251, 813], [203, 907], [152, 949], [112, 918], [87, 868], [91, 831], [128, 750], [171, 700]],
] as const;

/** Light only the original purple/green pixels, leaving sand and rocks untouched. */
function crystalLight(scene: Phaser.Scene, index: number): string {
  const key = `desert-crystal-light-${index}`;
  if (scene.textures.exists(key)) return key;
  const frame = scene.textures.getFrame('destination-desert_de_cristal');
  const canvas = document.createElement('canvas');
  canvas.width = frame.width; canvas.height = frame.height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return 'destination-desert_de_cristal';
  context.beginPath();
  silhouettes[index]!.forEach(([x, y], vertex) => {
    const px = x / 1448 * canvas.width, py = y / 1086 * canvas.height;
    if (vertex === 0) context.moveTo(px, py); else context.lineTo(px, py);
  });
  context.closePath(); context.clip();
  context.drawImage(frame.source.image as CanvasImageSource, frame.cutX, frame.cutY,
    frame.cutWidth, frame.cutHeight, 0, 0, canvas.width, canvas.height);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < pixels.data.length; i += 4) {
    const r = pixels.data[i]!, g = pixels.data[i + 1]!, b = pixels.data[i + 2]!;
    const purple = b > g + 8 && r > g + 8;
    const green = g > r * 0.98 && g > b * 1.03;
    if (!(index === 3 ? green : purple)) pixels.data[i + 3] = 0;
  }
  context.putImageData(pixels, 0, 0);
  scene.textures.addCanvas(key, canvas)?.get().setSize(frame.width, frame.height, 0, 0);
  return key;
}

/** A tiny procedural light for Phaser sprites and particles, not new scenery. */
function lightTexture(scene: Phaser.Scene): string {
  const key = 'desert-ray-light';
  if (scene.textures.exists(key)) return key;
  const texture = scene.textures.createCanvas(key, 32, 32);
  if (!texture) return '__WHITE';
  const context = texture.context;
  const glow = context.createRadialGradient(16, 16, 0, 16, 16, 16);
  glow.addColorStop(0, '#fffbea'); glow.addColorStop(0.12, '#fff2c9');
  glow.addColorStop(0.4, '#f6cc8b80'); glow.addColorStop(1, '#e5c0ff00');
  context.fillStyle = glow; context.fillRect(0, 0, 32, 32);
  texture.refresh();
  return key;
}

/** A fixed painting, six lights and beams following the actual touch order. */
export function addDesertCrystals(scene: Phaser.Scene, controls: AdventureControls, art: WorldFrame,
  touched: readonly number[], onTouch: (index: number, x: number, y: number) => void,
  awakening: boolean): void {
  const reduced = reducedMotion();
  const order = [...touched];
  const points = pilotTargets.desert_de_cristal.map(target => ({
    x: art.left + target.x * art.width, y: art.top + target.y * art.height,
  }));
  const beams = scene.add.graphics().setName('desert-crystal-beams');
  const texture = lightTexture(scene);
  const dust = reduced ? undefined : scene.add.particles(0, 0, texture, {
    emitting: false, lifespan: { min: 400, max: 750 }, speed: { min: 3, max: 9 },
    angle: { min: 210, max: 330 }, scale: { start: Math.max(0.05, art.width * 0.00015), end: 0 },
    alpha: { start: 0.55, end: 0 }, blendMode: Phaser.BlendModes.ADD, maxParticles: 18,
  }).setName('desert-contact-dust');
  const currents = new Set<string>();
  if (!reduced) scene.tweens.add({ targets: beams, alpha: 0.72, duration: 2100,
    yoyo: true, repeat: -1, ease: 'Sine.InOut' });
  let beamMotion: { p: number } | undefined;
  const drawBeams = (progress = 1) => {
    beams.clear();
    const pairs = order.slice(1).map((to, index) => [order[index]!, to] as const);
    if (order.length === points.length) pairs.push([order[order.length - 1]!, order[0]!] as const);
    pairs.forEach(([from, to], index) => {
      const a = points[from]!, b = points[to]!;
      const p = index === pairs.length - 1 ? progress : 1;
      const endX = a.x + (b.x - a.x) * p, endY = a.y + (b.y - a.y) * p;
      beams.lineStyle(Math.max(4, art.width * 0.012), 0xe9c7ff, 0.10).lineBetween(a.x, a.y, endX, endY);
      beams.lineStyle(Math.max(2, art.width * 0.005), 0xffdfaa, 0.32).lineBetween(a.x, a.y, endX, endY);
      beams.lineStyle(Math.max(1, art.width * 0.0018), 0xfff7df, 0.9).lineBetween(a.x, a.y, endX, endY);
      const key = `${from}-${to}`;
      if (!reduced && !currents.has(key)) {
        currents.add(key);
        // One quiet travelling light per connection, recycled by its tween.
        const mote = scene.add.image(a.x, a.y, texture).setBlendMode(Phaser.BlendModes.ADD)
          .setDisplaySize(Math.max(7, art.width * 0.022), Math.max(7, art.width * 0.022))
          .setAlpha(0).setName(`desert-ray-current-${key}`);
        const flow = { p: 0 };
        scene.tweens.add({ targets: flow, p: 1, duration: 2400 + index * 130,
          delay: index * 140, repeat: -1, onUpdate: () => {
            mote.setPosition(a.x + (b.x - a.x) * flow.p, a.y + (b.y - a.y) * flow.p)
              .setAlpha(Math.sin(flow.p * Math.PI) * 0.48);
          } });
      }
    });
    beams.setData('crystal-order', [...order]);
  };
  const light = (index: number, animate: boolean) => {
    const point = points[index]!;
    const size = Math.max(9, art.width * 0.044);
    const contact = scene.add.image(point.x, point.y, texture).setBlendMode(Phaser.BlendModes.ADD)
      .setDisplaySize(size, size).setAlpha(reduced ? 0.26 : 0.38)
      .setName(`desert-crystal-contact-${index}`);
    const facet = scene.add.graphics().setPosition(point.x, point.y)
      .setBlendMode(Phaser.BlendModes.ADD).setName(`desert-crystal-glint-${index}`);
    const r = Math.max(1.8, art.width * 0.005);
    facet.fillStyle(0xfff7da, 0.8).fillPoints([
      { x: 0, y: -r }, { x: r * 0.28, y: -r * 0.2 }, { x: r * 0.7, y: 0 },
      { x: r * 0.22, y: r * 0.2 }, { x: 0, y: r }, { x: -r * 0.22, y: r * 0.2 },
      { x: -r * 0.7, y: 0 }, { x: -r * 0.28, y: -r * 0.2 },
    ].map(point => new Phaser.Math.Vector2(point.x, point.y)), true);
    if (!reduced) {
      scene.tweens.add({ targets: contact, alpha: 0.18, scaleX: contact.scaleX * 1.18,
        scaleY: contact.scaleY * 1.18, duration: 1600 + index * 90,
        yoyo: true, repeat: -1, ease: 'Sine.InOut' });
      scene.tweens.add({ targets: facet, alpha: 0.3, duration: 1300 + index * 110,
        yoyo: true, repeat: -1, ease: 'Sine.InOut' });
      if (animate) {
        dust?.emitParticleAt(point.x, point.y, 3);
        const arrival = scene.add.image(point.x, point.y, texture).setBlendMode(Phaser.BlendModes.ADD)
          .setDisplaySize(size * 0.7, size * 0.7).setAlpha(0.65).setName(`desert-contact-arrival-${index}`);
        scene.tweens.add({ targets: arrival, alpha: 0, scaleX: arrival.scaleX * 1.7,
          scaleY: arrival.scaleY * 1.7, duration: 480, onComplete: () => arrival.destroy() });
      }
    }
    const glow = scene.add.image(art.left, art.top, crystalLight(scene, index)).setOrigin(0)
      .setDisplaySize(art.width, art.height).setBlendMode(Phaser.BlendModes.ADD)
      .setAlpha(animate && !reduced ? 0 : 0.24).setName(`desert-crystal-lit-${index}`);
    if (!reduced) scene.tweens.add({ targets: glow, alpha: 0.32, duration: animate ? 260 : 1800,
      onComplete: () => { scene.tweens.add({ targets: glow, alpha: 0.20,
        duration: 1900, yoyo: true, repeat: -1, ease: 'Sine.InOut' }); } });
  };
  order.forEach(index => light(index, false));
  drawBeams();
  points.forEach((point, index) => {
    const [rx, ry, rw, rh] = regions[index]!;
    const width = Math.min(art.width, Math.max(36, art.width * rw));
    const height = Math.min(art.height, Math.max(36, art.height * rh));
    const x = Phaser.Math.Clamp(art.left + (rx + rw / 2) * art.width,
      art.left + width / 2, art.left + art.width - width / 2);
    const y = Phaser.Math.Clamp(art.top + (ry + rh / 2) * art.height,
      art.top + height / 2, art.top + art.height - height / 2);
    controls.add(`desert-crystal-${index}`, x, y, width, height, () => {
      if (awakening || scene.children.getByName('tutorial-paper') || order.includes(index)) return;
      order.push(index);
      light(index, true);
      if (beamMotion) scene.tweens.killTweensOf(beamMotion);
      const state = { p: reduced ? 1 : 0 };
      beamMotion = state;
      drawBeams(state.p);
      if (!reduced) scene.tweens.add({ targets: state, p: 1, duration: 340,
        onUpdate: () => drawBeams(state.p) });
      onTouch(index, point.x, point.y);
    }, false);
  });
}
