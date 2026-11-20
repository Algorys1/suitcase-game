import Phaser from 'phaser';
import { progressStore } from '../../services/storage';
import { pilotTargets } from '../../domain/pilotExploration';
import { preloadSouvenirs } from './souvenir';
import type { WorldFrame } from './pilotWorlds';

const visitors = [
  { id: 'hermit', destination: 'archipel_azur', souvenir: 'recif_de_verre', welcomed: 'welcomedIslandVisitor',
    souvenirAt: [0.579, 0.646, 0.094], residentAt: [0.720, 0.652, 0.155] },
  { id: 'salamander', destination: 'ile_des_cendres', souvenir: 'jardins_du_zenith', welcomed: 'welcomedAshVisitor',
    souvenirAt: [0.26, 0.800, 0.109], residentAt: [0.580, 0.922, 0.149] },
  { id: 'snail', destination: 'desert_de_cristal', souvenir: 'sylve_prismatique', welcomed: 'welcomedDesertVisitor',
    souvenirAt: [0.53, 0.51, 0.126], residentAt: [0.455, 0.904, 0.156] },
] as const;

type Visitor = typeof visitors[number];
const restKey = (id: Visitor['id']) => `adventure-${id}-resident`;
const reactionKey = (id: Visitor['id']) => `adventure-${id}-reaction`;

function desertPrismPoint(fallbackX: number, fallbackY: number): { x: number; y: number } {
  const order = progressStore.explorationSteps('desert_de_cristal');
  const crystals = pilotTargets.desert_de_cristal;
  let point = { x: fallbackX, y: fallbackY };
  if (order.length !== crystals.length) return point;
  const rays = order.map((id, index) => [crystals[id]!, crystals[order[(index + 1) % order.length]!]!] as const);
  let distance = Infinity;
  for (let i = 0; i < rays.length; i++) {
    const [a, b] = rays[i]!;
    for (const [c, d] of rays.slice(i + 1)) {
      const intersection = Phaser.Geom.Intersects.GetLineToLine(
        new Phaser.Geom.Line(a.x, a.y, b.x, b.y), new Phaser.Geom.Line(c.x, c.y, d.x, d.y));
      if (!intersection || intersection.x < 0.23 || intersection.x > 0.80
        || Math.min(Phaser.Math.Distance.BetweenPoints(intersection, a), Phaser.Math.Distance.BetweenPoints(intersection, b),
          Phaser.Math.Distance.BetweenPoints(intersection, c), Phaser.Math.Distance.BetweenPoints(intersection, d)) < 0.025) continue;
      const candidate = Phaser.Math.Distance.Between(intersection.x, intersection.y, fallbackX, fallbackY);
      if (candidate < distance) {
        distance = candidate;
        point = { x: intersection.x, y: intersection.y };
      }
    }
  }
  return point;
}

export function preloadShoreVisitors(scene: Phaser.Scene, worlds?: readonly string[]): void {
  const progress = progressStore.read();
  for (const visitor of visitors) {
    if (worlds ? !worlds.includes(visitor.destination) : !progress[visitor.welcomed]) continue;
    for (const key of [restKey(visitor.id), reactionKey(visitor.id)]) {
      if (!scene.textures.exists(key))
        scene.load.image(key, `${import.meta.env.BASE_URL}assets/adventure/${key.slice('adventure-'.length)}.webp`);
    }
    if (worlds && progress[visitor.welcomed]) preloadSouvenirs(scene, [visitor.souvenir]);
  }
}

export function animateShoreVisitor(scene: Phaser.Scene, resident: Phaser.GameObjects.Image,
  residentId: string, paint?: (phase: number) => void): void {
  const visitor = visitors.find(entry => residentId === `${entry.id}-resident`);
  if (!visitor || !scene.textures.exists(reactionKey(visitor.id))) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scale = resident.scaleX;
  let greeting: Phaser.Tweens.Tween | undefined;
  const reset = () => {
    greeting?.stop();
    greeting = undefined;
    resident.setTexture(restKey(visitor.id)).setScale(scale);
    paint?.(0);
  };
  resident.setInteractive().on('pointerdown', () => {
    if (motion.matches || greeting || scene.data.get('book-busy') || resident.alpha < 0.95) return;
    greeting = scene.tweens.addCounter({ from: 0, to: 1, duration: visitor.id === 'snail' ? 2600 : 1550, onUpdate: tween => {
      const t = tween.getValue() ?? 0;
      const posed = visitor.id === 'hermit' ? t > 0.10 && t < 0.52
        : visitor.id === 'snail' ? t > 0.16 && t < 0.88 : t < 0.55 && Math.sin(t * Math.PI * 12) > 0.2;
      const lean = Math.sin(t * Math.PI * 2) * Math.sin(t * Math.PI);
      resident.setTexture(posed ? reactionKey(visitor.id) : restKey(visitor.id))
        .setScale(scale * (1 + lean * 0.025), scale * (1 - lean * 0.035));
      paint?.(t);
    }, onComplete: reset });
  });
  motion.addEventListener('change', reset);
  resident.once('destroy', () => {
    greeting?.stop();
    motion.removeEventListener('change', reset);
  });
}

export function drawShoreVisitor(scene: Phaser.Scene, destination: string, art: WorldFrame):
  Array<Phaser.GameObjects.Image | Phaser.GameObjects.Graphics> {
  const visitor = visitors.find(entry => destination === entry.destination);
  if (!visitor || !progressStore.read()[visitor.welcomed]) return [];
  const { id, souvenir, souvenirAt, residentAt } = visitor;
  const souvenirKey = `souvenir-${souvenir}`;
  if (![souvenirKey, restKey(id), reactionKey(id)].every(key => scene.textures.exists(key))) return [];
  const { left, top, width, height } = art;
  const anchor = id === 'snail' ? desertPrismPoint(souvenirAt[0], souvenirAt[1])
    : { x: souvenirAt[0], y: souvenirAt[1] };
  const x = left + width * anchor.x, y = top + height * anchor.y;
  const residentX = left + width * residentAt[0], residentY = top + height * residentAt[1];
  const ground = scene.add.graphics().fillStyle(0x65474f, 0.24)
    .fillEllipse(residentX, residentY, height * 0.147, height * 0.019);
  if (id !== 'snail') ground.fillEllipse(x, y, height * 0.082, height * 0.012);
  const token = scene.add.image(x, y, souvenirKey).setOrigin(0.5, id === 'snail' ? 0.67 : 0.88)
    .setName(`${id}-offering`);
  token.setScale(height * souvenirAt[2] / token.height).setAngle(-8).setFlipX(id === 'salamander');
  const effect = scene.add.graphics().setName(`${id}-landscape-reaction`);
  const resident = scene.add.image(residentX, residentY, restKey(id)).setOrigin(0.5, 1).setName(`${id}-visitor`);
  resident.setScale(height * residentAt[2] / resident.height);
  animateShoreVisitor(scene, resident, `${id}-resident`, phase => {
    effect.clear();
    if (id === 'hermit') {
      for (let i = 0; i < 2; i++) {
        const t = Phaser.Math.Clamp((phase - 0.36 - 0.12 * i) / 0.48, 0, 1);
        const radius = height * (0.023 + t * 0.093);
        effect.lineStyle(Math.max(1, height * 0.004), 0xeafff5, Math.sin(t * Math.PI) * 0.75)
          .strokeEllipse(x, y + height * 0.006, radius * 2, radius * 0.54);
      }
    } else if (id === 'salamander') {
      const nozzleX = x + width * 0.041, nozzleY = y - height * 0.058;
      for (let i = 0; i < 3; i++) {
        const drop = Phaser.Math.Clamp((phase - 0.12 - i * 0.085) / 0.29, 0, 1);
        effect.fillStyle(0xc4edfb, Math.sin(drop * Math.PI) * 0.87)
          .fillEllipse(nozzleX + drop * width * 0.009, nozzleY + height * drop ** 2 * 0.055,
            height * 0.008, height * 0.014);
      }
      for (let i = 0; i < 5; i++) {
        const steam = Phaser.Math.Clamp((phase - 0.38 - i * 0.051) / 0.41, 0, 1);
        const radius = height * (0.008 + steam * 0.016);
        effect.fillStyle(0xffe2d9, Math.sin(steam * Math.PI) * 0.26)
          .fillCircle(nozzleX + steam * (width * 0.014 + Math.sin(steam * 9 + i) * radius),
            nozzleY - steam * height * 0.081, radius);
      }
    } else {
      const t = Phaser.Math.Clamp((phase - 0.12) / 0.88, 0, 1);
      const reveal = Phaser.Math.Easing.Sine.InOut(Phaser.Math.Clamp(t / 0.57, 0, 1));
      const fade = 1 - Phaser.Math.Easing.Sine.InOut(Phaser.Math.Clamp((t - 0.59) / 0.41, 0, 1));
      // The band follows the crown of the painted sandstone arch.
      for (let j = 0; j <= 50; j++) {
        const u = j / 50, v = 1 - u;
        const opacity = Math.sin(Math.PI * u) * fade * Phaser.Math.Clamp((reveal - u) / 0.14, 0, 1);
        if (opacity <= 0) continue;
        const px = left + width * (0.145 * v ** 3 + 3 * 0.228 * v ** 2 * u + 3 * 0.481 * v * u ** 2 + 0.550 * u ** 3);
        const py = top + height * (0.279 * v ** 3 + 3 * 0.066 * v ** 2 * u + 3 * 0.015 * v * u ** 2 + 0.316 * u ** 3);
        for (const [i, color] of [0xffa0a1, 0xffd79b, 0xe5edb6, 0xaee8df, 0xc8baf4].entries()) {
          const bandY = py + height * (i - 2) * 0.006;
          effect.fillStyle(color, opacity * 0.085).fillEllipse(px, bandY, width * 0.018, height * 0.026)
            .fillStyle(color, opacity * 0.15).fillEllipse(px, bandY, width * 0.011, height * 0.011);
        }
      }
    }
  });
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (id === 'snail') {
    let float: Phaser.Tweens.Tween | undefined;
    const refresh = () => {
      float?.stop();
      token.setY(y);
      if (!motion.matches) float = scene.tweens.add({ targets: token, y: y - height * 0.012,
        duration: 1600, ease: 'Sine.InOut', yoyo: true, repeat: -1 });
    };
    refresh();
    motion.addEventListener('change', refresh);
    token.once('destroy', () => { float?.stop(); motion.removeEventListener('change', refresh); });
  }
  if (scene.data.get('shore-visitor-arriving') && !motion.matches) {
    resident.setAlpha(0);
    const arrival = scene.tweens.add({ targets: resident, alpha: 1, delay: 140, duration: 490, ease: 'Sine.Out' });
    const finish = () => { arrival.stop(); resident.setAlpha(1); };
    motion.addEventListener('change', finish);
    resident.once('destroy', () => { arrival.stop(); motion.removeEventListener('change', finish); });
  }
  scene.data.set('shore-visitor-arriving', false);
  return [ground, token, effect, resident];
}
