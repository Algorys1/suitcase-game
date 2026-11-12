import Phaser from 'phaser';
import type { ElementId, Slots } from '../../domain/preparation';
import type { drawSuitcaseCompass } from './suitcaseCompass';
import { drawClosedSuitcase } from './suitcase';

const colors: Record<ElementId, number> = {
  tree: 0x8fd17b, mushroom: 0xc99bf2, water: 0x68dbdf, fire: 0xffaa58, rock: 0xd4b38b,
  palm: 0xc4da77, snow: 0xc4edff, cloud: 0xded4fa, ruins: 0xe1c28c, crystal: 0xc4a2ff,
};

/** Tiny painted-material echoes of the chosen elements, without introducing new items. */
function mote(scene: Phaser.Scene, id: ElementId): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics().setName(`departure-mote-${id}`);
  const color = colors[id];
  g.fillStyle(color, 0.95).lineStyle(0.8, 0xfff4cf, 0.9);
  if (id === 'tree' || id === 'palm') {
    g.fillEllipse(0, 0, id === 'palm' ? 3 : 5, 10);
    g.lineBetween(0, 4, 0, -4);
  } else if (id === 'snow') {
    for (let i = 0; i < 3; i++) {
      const a = i * Math.PI / 3, x = Math.cos(a) * 5, y = Math.sin(a) * 5;
      g.lineBetween(-x, -y, x, y);
      g.lineBetween(x * 0.6, y * 0.6, x * 0.45 - y * 0.3, y * 0.45 + x * 0.3);
    }
  } else if (id === 'fire') {
    g.fillTriangle(-3, 4, 1, -7, 4, 3).fillEllipse(0, 2, 6, 7);
    g.fillStyle(0xfff0b0).fillEllipse(0, 3, 2, 4);
  } else if (id === 'water') {
    g.fillTriangle(-3, 1, 0, -5, 3, 1).fillCircle(0, 1, 3);
  } else if (id === 'cloud') {
    g.fillCircle(-3, 0, 3).fillCircle(0, -2, 4).fillCircle(4, 0, 3);
  } else if (id === 'mushroom') {
    g.fillRect(-1, 0, 2, 5).fillEllipse(0, -1, 8, 5);
  } else if (id === 'crystal') {
    g.fillTriangle(0, -6, -3, 0, 0, 5).fillTriangle(0, -6, 3, 0, 0, 5);
  } else if (id === 'ruins') {
    g.fillRect(-2, -4, 4, 8).lineBetween(-1, -1, 1, 0);
  } else g.fillTriangle(-4, 3, -1, -4, 4, 2);
  return g;
}

function glow(scene: Phaser.Scene, color: number): Phaser.GameObjects.Image {
  const key = 'departure-energy-glow';
  if (!scene.textures.exists(key)) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    const light = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    light.addColorStop(0, '#fff'); light.addColorStop(0.25, '#ffffffaa'); light.addColorStop(1, '#ffffff00');
    ctx.fillStyle = light; ctx.fillRect(0, 0, 128, 128);
    scene.textures.addCanvas(key, canvas);
  }
  return scene.add.image(0, 0, key).setTint(color).setBlendMode(Phaser.BlendModes.ADD);
}

/** Presentation only: the caller has already resolved, debited and saved the trip. */
export function playSuitcaseDeparture(scene: Phaser.Scene, art: ReturnType<typeof drawSuitcaseCompass>,
  parts: Phaser.GameObjects.GameObject[], lidParts: Phaser.GameObjects.GameObject[],
  slots: Slots, before: number, after: number, complete: () => void) {
  const image = scene.children.getByName('suitcase-compass-art') as Phaser.GameObjects.Image;
  const hinge = 0.556, hingeY = art.top + art.height * hinge;
  const originalScale = image.scaleX;
  const frame = image.frame, texture = image.texture;
  const cut = Math.round(frame.cutHeight * hinge);
  if (!texture.has('departure-lid')) {
    texture.add('departure-lid', frame.sourceIndex, frame.cutX, frame.cutY, frame.cutWidth, cut);
    texture.add('departure-tray', frame.sourceIndex, frame.cutX, frame.cutY + cut, frame.cutWidth, frame.cutHeight - cut);
  }
  image.setFrame('departure-tray').setPosition(art.x, hingeY).setOrigin(0.5, 0).setScale(originalScale);
  const lid = scene.add.image(art.x, hingeY, texture.key, 'departure-lid').setOrigin(0.5, 1)
    .setScale(originalScale).setName('departure-lid');
  // MoveAbove leaves an already higher object untouched in Phaser 4.
  // Insert explicitly so the painted lid remains below the interactive signs.
  scene.children.moveTo(lid, scene.children.getIndex(image) + 1);
  const lidGroup = scene.add.container(art.x, hingeY).setName('departure-lid-group');
  lid.setPosition(0, 0);
  lidGroup.add(lid);
  for (const part of lidParts) {
    const moving = part as Phaser.GameObjects.Image;
    moving.setPosition(moving.x - art.x, moving.y - hingeY);
    lidGroup.add(part);
  }
  const fading = parts.filter(o => o !== image && 'setAlpha' in o).map(o => ({
    o: o as Phaser.GameObjects.Image, alpha: (o as Phaser.GameObjects.Image).alpha,
  }));
  const manifestations = [0, 1].map(i => scene.children.getByName(`slot-manifestation-${i}`) as Phaser.GameObjects.Image);
  const originalPositions = manifestations.map(o => ({ x: o.x, y: o.y }));
  drawClosedSuitcase(scene, art.x, art.top + art.height * 0.54, art.width, art.height * 0.38);
  const closed = scene.children.getByName('suitcase-closed-art') as Phaser.GameObjects.Image;
  closed.setAlpha(0).setName('departure-closed');
  const closedY = closed.y;
  const lights = slots.map(id => glow(scene, colors[id!]).setAlpha(0));
  const particles = slots.flatMap((id, index) => Array.from({ length: 12 }, (_, j) => ({
    object: mote(scene, id!).setAlpha(0), index, angle: j * Math.PI * 2 / 12 + index * 0.4, seed: j,
  })));
  const release = scene.add.graphics().setName('departure-energy-release');
  const state = { p: 0 };
  let ended = false;
  const clamp = (v: number) => Phaser.Math.Clamp(v, 0, 1);
  const apply = () => {
    const p = state.p, energy = clamp(p / 0.30), closing = clamp((p - 0.30) / 0.20);
    const shaking = clamp((p - 0.50) / 0.22), burst = clamp((p - 0.72) / 0.28);
    scene.data.set('departurePhase', p < 0.30 ? 'charging' : p < 0.50 ? 'closing' : p < 0.72 ? 'shaking' : 'release');
    for (const item of fading) item.o.setAlpha(item.alpha * (1 - closing));
    manifestations.forEach((o, i) => {
      const pos = originalPositions[i]!;
      o.setPosition(pos.x + Math.sin(p * 210 + i) * energy * 2,
        pos.y + Math.cos(p * 170 + i) * energy * 1.5 - energy * art.height * 0.025);
    });
    for (let i = after; i < before; i++) {
      const cell = scene.children.getByName(`preparation-charge-${i}`) as Phaser.GameObjects.Image;
      cell?.setAlpha((1 - clamp((p - 0.12) / 0.16)) * (1 - closing));
    }
    lidGroup.setScale(1, 1 - closing * 0.98).setAlpha(1 - clamp((closing - 0.7) / 0.3));
    image.setAlpha(1 - clamp((closing - 0.65) / 0.35));
    closed.setAlpha(clamp((closing - 0.65) / 0.35) * (1 - clamp((burst - 0.7) / 0.3)));
    const tremble = p >= 0.50 && p < 0.72 ? Math.sin(shaking * 76) * (1 + shaking * 3) : 0;
    closed.setPosition(art.x + tremble, closedY + Math.cos(shaking * 63) * Math.abs(tremble) * 0.35)
      .setAngle(tremble * 0.3);
    lights.forEach((light, i) => {
      const position = art.slots[i]!;
      light.setPosition(p < 0.50 ? position.x : art.x, p < 0.50 ? position.y : closedY - art.height * 0.14)
        .setDisplaySize(art.width * (0.3 + energy * 0.18 + burst * 1.2), art.height * (0.16 + burst * 0.5))
        .setAlpha(p < 0.50 ? energy * (1 - closing) * 0.72 : p < 0.72 ? shaking * 0.35 : Math.sin(burst * Math.PI) * 0.75);
    });
    for (const particle of particles) {
      const start = art.slots[particle.index]!;
      const cycle = (energy * 1.2 + particle.seed / 12) % 1;
      if (p < 0.5) {
        particle.object.setPosition(start.x + Math.sin(particle.angle + cycle * 3) * art.width * 0.065 * cycle,
          start.y - cycle * art.height * 0.22)
          .setAlpha(Math.sin(cycle * Math.PI) * energy * (1 - closing)).setAngle(cycle * 130 + particle.seed * 20);
      } else {
        const distance = burst * art.width * (0.42 + particle.seed % 3 * 0.09);
        particle.object.setPosition(art.x + Math.cos(particle.angle) * distance,
          closedY - art.height * 0.14 + Math.sin(particle.angle) * distance * 0.62 - burst * 24)
          .setAlpha(burst > 0 ? Math.sin(burst * Math.PI) : 0).setAngle(burst * 160 + particle.seed * 20);
      }
      particle.object.setScale(Math.max(0.65, art.width / 400));
    }
    release.clear();
    if (burst > 0) for (const [i, id] of slots.entries()) {
      release.lineStyle(2 - burst, colors[id!], Math.sin(burst * Math.PI) * 0.65)
        .strokeEllipse(art.x, closedY - art.height * 0.14,
          art.width * burst * (1.6 + i * 0.12), art.height * burst * 0.48);
    }
  };
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const cleanup = () => media.removeEventListener('change', changed);
  const finish = () => {
    if (ended) return;
    ended = true; tween.remove(); cleanup(); complete();
  };
  const changed = () => { if (media.matches) finish(); };
  const tween = scene.tweens.add({ targets: state, p: 1, duration: 1900, ease: 'Linear', onUpdate: apply, onComplete: finish });
  media.addEventListener('change', changed);
  apply();
  return { finish, cancel: () => { if (!ended) { ended = true; tween.remove(); cleanup(); } } };
}
