import Phaser from 'phaser';
import { progressStore } from '../../services/storage';
import type { WorldFrame } from './pilotWorlds';
import { animateDragon } from './dragonVisitor';
import { animateGriffin } from './griffinVisitor';
import { animateYeti } from './yetiVisitor';
import { animateFrog } from './frogVisitor';
import { animateOctopus } from './octopusVisitor';
import { animateFennec } from './fennecVisitor';
import { animateOwl } from './owlVisitor';
import { animateSeal } from './seaVisitor';

/** All ambient movement belongs to its display object and respects live motion preferences. */
function sway(scene: Phaser.Scene, object: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics,
  config: Partial<Phaser.Types.Tweens.TweenBuilderConfig>): void {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let tween: Phaser.Tweens.Tween | undefined;
  const change = () => {
    tween?.stop(); tween = undefined;
    if (!preference.matches && object.active) tween = scene.tweens.add({ ...config, targets: object });
  };
  change(); preference.addEventListener('change', change);
  object.once('destroy', () => { tween?.stop(); preference.removeEventListener('change', change); });
}

/** The offering adds a resident, independently of the forest's feather activity. */
export function drawForestVisitor(scene: Phaser.Scene, frame: WorldFrame): Array<Phaser.GameObjects.Image | Phaser.GameObjects.Graphics> {
  if (!progressStore.read().welcomedForestVisitor || !scene.textures.exists('adventure-forest-resident')
    || !scene.textures.exists('souvenir-mycelia')) return [];
  const { left, top, width, height } = frame;
  const x = left + width * 0.215, y = top + height * 0.205;
  const branchY = top + height * 0.147;
  const cord = scene.add.graphics().lineStyle(Math.max(1, width * 0.0025), 0x72563e)
    .strokeEllipse(x, branchY - height * 0.006, width * 0.014, height * 0.028)
    .lineBetween(x, branchY + height * 0.008, x, y);
  const glow = scene.add.graphics().fillStyle(0xffd887, 0.14)
    .fillEllipse(x, y + height * 0.075, width * 0.20, height * 0.21);
  const lantern = scene.add.image(x, y, 'souvenir-mycelia').setOrigin(0.5, 0.04).setName('forest-offered-lantern');
  lantern.setScale(height * 0.14 / lantern.height);
  const creature = scene.add.image(left + width * 0.86, top + height * 0.92, 'adventure-forest-resident')
    .setOrigin(0.5, 1).setName('forest-visitor');
  creature.setScale(height * 0.21 / creature.height);
  if (scene.data.get('forest-visitor-arriving')) {
    scene.data.set('forest-visitor-arriving', false);
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!preference.matches) {
      const restingX = creature.x;
      creature.setX(restingX + width * 0.10).setAlpha(0);
      const arrival = scene.tweens.add({ targets: creature, x: restingX, alpha: 1,
        duration: 950, ease: 'Sine.Out' });
      const finish = () => { arrival.stop(); creature.setX(restingX).setAlpha(1); };
      preference.addEventListener('change', finish);
      creature.once('destroy', () => { arrival.stop(); preference.removeEventListener('change', finish); });
    }
  }
  const spores = scene.add.graphics().setName('forest-visitor-spores');
  for (let i = 0; i < 9; i++) spores.fillStyle(0xffe5a2, 0.5 + i % 3 * 0.15)
    .fillCircle(x + width * (0.02 + Math.sin(i * 2.1) * 0.13), y + height * (0.16 + i * 0.038), Math.max(1, width * 0.002));
  sway(scene, glow, { alpha: { from: 0.65, to: 1 }, duration: 2400, ease: 'Sine.InOut', yoyo: true, repeat: -1 });
  sway(scene, spores, { y: -height * 0.018, alpha: { from: 0.55, to: 1 }, duration: 3100,
    ease: 'Sine.InOut', yoyo: true, repeat: -1 });
  const restingY = creature.y;
  let greeting: Phaser.Tweens.Tween | undefined;
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finishGreeting = () => { greeting?.stop(); greeting = undefined; creature.setAngle(0).setY(restingY); };
  creature.setInteractive().on('pointerdown', () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (scene.tweens.isTweening(creature)) return;
    greeting = scene.tweens.add({ targets: creature, angle: { from: -5, to: 5 }, y: restingY - height * 0.009,
      duration: 190, yoyo: true, repeat: 2, onComplete: finishGreeting });
  });
  preference.addEventListener('change', finishGreeting);
  creature.once('destroy', () => { greeting?.stop(); preference.removeEventListener('change', finishGreeting); });
  return [cord, glow, lantern, creature, spores];
}

/** A warm meeting on the town's paving; the snow, fountain and clocks stay intact. */
export function drawCityVisitor(scene: Phaser.Scene, frame: WorldFrame): Array<Phaser.GameObjects.Image | Phaser.GameObjects.Graphics> {
  if (!progressStore.read().welcomedCityVisitor || !scene.textures.exists('adventure-city-resident')
    || !scene.textures.exists('souvenir-coeur_de_braise')) return [];
  const { left, top, width, height } = frame;
  const vialX = left + width * 0.679, vialY = top + height * 0.285;
  const warm = scene.add.graphics().fillStyle(0xffba66, 0.13)
    .fillEllipse(vialX, vialY, width * 0.08, height * 0.12)
    .setName('city-ember-warmth');
  const vial = scene.add.image(vialX, vialY, 'souvenir-coeur_de_braise').setOrigin(0.5)
    .setName('city-offered-ember');
  vial.setScale(height * 0.085 / vial.height);
  const sparks = scene.add.graphics().setName('city-clock-embers');
  const drawSparks = (phase: number) => {
    sparks.clear();
    for (let i = 0; i < 9; i++) {
      const life = (phase + i * 0.37) % 1;
      const angle = i * 2.4;
      const radius = width * (0.016 + life * 0.035);
      const sx = vialX + Math.cos(angle) * radius;
      const sy = vialY + Math.sin(angle) * radius * 0.75 - height * life * 0.025;
      const alpha = Math.sin(life * Math.PI) * 0.9;
      const size = Math.max(1.1, width * 0.0035) * (1 - life * 0.3);
      sparks.lineStyle(Math.max(0.9, width * 0.0018), 0xffa34d, alpha)
        .lineBetween(sx, sy, sx - Math.cos(angle) * size * 2, sy + size * 2)
        .fillStyle(0xffedbb, alpha).fillCircle(sx, sy, size);
    }
  };
  const foxX = left + width * 0.70, foxY = top + height * 0.84;
  const shadow = scene.add.graphics().fillStyle(0x60494d, 0.15)
    .fillEllipse(foxX, foxY - height * 0.006, width * 0.11, height * 0.018);
  const fox = scene.add.image(foxX, foxY, 'adventure-city-resident').setOrigin(0.5, 1)
    .setName('city-visitor');
  fox.setScale(height * 0.20 / fox.height);
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let emberMotion: Phaser.Tweens.Tween | undefined;
  const animateEmbers = () => {
    emberMotion?.stop(); emberMotion = undefined;
    drawSparks(0.2);
    if (!preference.matches) emberMotion = scene.tweens.addCounter({ from: 0, to: 1,
      duration: 1800, repeat: -1, onUpdate: tween => drawSparks(tween.getValue() ?? 0) });
  };
  animateEmbers(); preference.addEventListener('change', animateEmbers);
  sparks.once('destroy', () => { emberMotion?.stop(); preference.removeEventListener('change', animateEmbers); });
  let greeting: Phaser.Tweens.Tween | undefined;
  const rest = () => { greeting?.stop(); greeting = undefined; fox.setY(foxY).setAngle(0).setAlpha(1); };
  if (scene.data.get('city-visitor-arriving')) {
    scene.data.set('city-visitor-arriving', false);
    if (!preference.matches) {
      fox.setY(foxY - height * 0.03).setAlpha(0);
      greeting = scene.tweens.add({ targets: fox, y: foxY, alpha: 1, duration: 420,
        ease: 'Bounce.Out', onComplete: () => { greeting = undefined; } });
    }
  }
  fox.setInteractive().on('pointerdown', () => {
    if (preference.matches || greeting) return;
    greeting = scene.tweens.add({ targets: fox, angle: { from: -5, to: 5 }, y: foxY - height * 0.009,
      duration: 190, yoyo: true, repeat: 2, onComplete: rest });
  });
  preference.addEventListener('change', rest);
  fox.once('destroy', () => { greeting?.stop(); preference.removeEventListener('change', rest); });
  sway(scene, warm, { alpha: { from: 0.65, to: 1 }, duration: 2300,
    ease: 'Sine.InOut', yoyo: true, repeat: -1 });
  return [warm, vial, sparks, shadow, fox];
}

export function preloadHomeVisitors(scene: Phaser.Scene): void {
  const progress = progressStore.read();
  for (const id of [progress.awakenedMycelia ? 'mycelia-resident' : '',
    progress.welcomedForestVisitor ? 'forest-resident' : '',
    progress.welcomedCityVisitor ? 'city-resident' : '',
    progress.welcomedMarshVisitor ? 'frog-resident' : '',
    progress.welcomedPalaceVisitor ? 'yeti-resident' : '',
    progress.welcomedVestigesVisitor ? 'griffin-resident' : '',
    progress.welcomedKingdomVisitor ? 'dragon-resident' : '',
    progress.welcomedReefVisitor ? 'octopus-resident' : '',
    progress.welcomedEmpireVisitor ? 'fennec-resident' : '',
    ...(progress.welcomedVestigesVisitor ? ['griffin-wings'] : []),
    ...(progress.welcomedObservatoryVisitor ? ['owl-resident', 'owl-resident-wings'] : []),
    ...(progress.welcomedSeaVisitor ? ['sea-resident', 'sea-resident-clap'] : [])].filter(Boolean)) {
    if (!scene.textures.exists(`adventure-${id}`)) scene.load.image(`adventure-${id}`,
      `${import.meta.env.BASE_URL}assets/adventure/${id}.webp`);
  }
}

/** Visitors follow the painted luggage, above the portrait menu and beside the landscape menu. */
export function drawHomeVisitors(scene: Phaser.Scene, art: Phaser.Geom.Rectangle): void {
  const progress = progressStore.read(), { width, height } = scene.scale;
  const landscape = width >= 600;
  const ids = [progress.awakenedMycelia ? 'mycelia-resident' : '',
    progress.welcomedForestVisitor ? 'forest-resident' : '',
    progress.welcomedCityVisitor ? 'city-resident' : '',
    progress.welcomedSeaVisitor ? 'sea-resident' : '',
    progress.welcomedObservatoryVisitor ? 'owl-resident' : '',
    progress.welcomedEmpireVisitor ? 'fennec-resident' : '',
    progress.welcomedMarshVisitor ? 'frog-resident' : '',
    progress.welcomedPalaceVisitor ? 'yeti-resident' : '',
    progress.welcomedVestigesVisitor ? 'griffin-resident' : '',
    progress.welcomedKingdomVisitor ? 'dragon-resident' : '',
    progress.welcomedReefVisitor ? 'octopus-resident' : ''].filter(Boolean);
  if (!art.width || !art.height) return;
  type Stop = readonly [x: number, y: number, gesture?: 'slide' | 'pause'];
  const routes: Record<string, { stops: readonly Stop[]; duration: number; hop: number }> = {
    'mycelia-resident': { stops: [[0.15, 0.91], [0.50, 0.91], [0.82, 0.86, 'pause'],
      [0.82, 0.86], [0.51, 0.87], [0.18, 0.82]], duration: 16000, hop: 0.05 },
    'forest-resident': { stops: [[0.78, 0.87], [0.92, 0.67], [0.80, 0.38],
      [0.65, 0.32], [0.80, 0.60], [0.89, 0.86]], duration: 12700, hop: 0.17 },
    'city-resident': { stops: [[0.52, 0.20], [0.26, 0.24], [landscape ? -0.17 : 0.19, 0.22],
      [0.18, 0.45], [0.39, 0.51], [0.62, 0.42], [0.70, 0.26]], duration: 17400, hop: 0.09 },
    'sea-resident': { stops: [[0.11, 0.91], [0.33, 0.87, 'pause'], [0.33, 0.87],
      [0.25, 0.70], [0.18, 0.62, 'slide']], duration: 14500, hop: 0 },
    'dragon-resident': { stops: [[0.30, 0.52], [0.42, 0.57], [0.54, 0.52, 'pause'],
      [0.54, 0.52], [0.45, 0.48]], duration: 13300, hop: 0.07 },
    'griffin-resident': { stops: [[0.54, 0.44], [0.72, 0.48], [0.88, 0.58, 'pause'],
      [0.88, 0.58], [0.71, 0.52]], duration: 14800, hop: 0.13 },
    'yeti-resident': { stops: [[0.64, 0.61], [0.74, 0.64], [0.82, 0.60, 'pause'],
      [0.82, 0.60], [0.72, 0.63]], duration: 13900, hop: 0.04 },
    'frog-resident': { stops: [[0.29, 0.69], [0.42, 0.72], [0.52, 0.70, 'pause'],
      [0.52, 0.70], [0.33, 0.72]], duration: 11900, hop: 0.16 },
    'octopus-resident': { stops: [[0.41, 0.91], [0.55, 0.87], [0.71, 0.88], [0.76, 0.95, 'pause'],
      [0.76, 0.95], [0.56, 0.97]], duration: 11300, hop: 0 },
    'fennec-resident': { stops: [[0.62, 0.94], [0.81, 0.95], [0.92, 0.78, 'pause'],
      [0.92, 0.78], [0.76, 0.73], [0.52, 0.82]], duration: 10200, hop: 0.11 },
    'owl-resident': { stops: [[0.86, 0.20], [0.67, 0.08], [0.43, 0.16, 'pause'],
      [0.43, 0.16], [0.63, 0.29]], duration: 13300, hop: 0.035 },
  };
  ids.forEach((id, index) => {
    const key = `adventure-${id}`;
    const path = routes[id];
    if (!path || !scene.textures.exists(key)) return;
    const route = path.stops;
    const visitor = scene.add.image(0, 0, key).setOrigin(0.5, 1).setName(`home-visitor-${id}`);
    const sizeFactor = id === 'frog-resident' ? 0.80 : id === 'sea-resident' || id === 'owl-resident' ? 0.92 : 1;
    visitor.setScale(sizeFactor * Math.min(landscape ? 58 : 48, height * 0.15, art.height * 0.29) / visitor.height);
    const size = visitor.displayHeight;
    const restX = art.left + art.width * (0.15 + (ids.length === 1 ? 0.48 : index * 0.73 / (ids.length - 1)));
    const restY = art.top + art.height * 0.91;
    visitor.setPosition(restX, restY);
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let roam: Phaser.Tweens.Tween | undefined;
    let start: Phaser.Time.TimerEvent | undefined;
    const place = (phase: number) => {
      const segment = Math.min(route.length - 1, Math.floor(phase));
      const t = phase - segment;
      const [u, v, gesture] = route[segment]!;
      const [nextU, nextV] = route[(segment + 1) % route.length]!;
      const sliding = gesture === 'slide';
      const paused = gesture === 'pause';
      const blend = sliding ? t * t : (1 - Math.cos(t * Math.PI)) / 2;
      const hop = sliding || paused ? 0 : Math.abs(Math.sin(t * Math.PI * 4)) * size * path.hop;
      const x = art.left + art.width * Phaser.Math.Linear(u, nextU, blend);
      const y = art.top + art.height * Phaser.Math.Linear(v, nextV, blend) - hop;
      visitor.setPosition(x, y);
      if (id !== 'owl-resident') visitor.setAngle(sliding ? -14 * Math.sin(Math.PI * t)
        : paused ? 0 : Math.sin(t * Math.PI * 8) * (id === 'sea-resident' ? 2 : 4));
    };
    const change = () => {
      start?.remove(); roam?.stop();
      visitor.setPosition(restX, restY).setAngle(0);
      if (motion.matches) return;
      const offset = index * route.length / ids.length;
      place(offset);
      start = scene.time.delayedCall(450 + index * 650, () => {
        roam = scene.tweens.addCounter({ from: 0, to: route.length, duration: path.duration,
          repeat: -1, onUpdate: tween => place(((tween.getValue() ?? 0) + offset) % route.length) });
      });
    };
    change();
    if (id === 'dragon-resident') animateDragon(scene, visitor);
    if (id === 'griffin-resident') animateGriffin(scene, visitor);
    if (id === 'yeti-resident') animateYeti(scene, visitor);
    if (id === 'frog-resident') animateFrog(scene, visitor);
    if (id === 'octopus-resident') animateOctopus(scene, visitor);
    if (id === 'fennec-resident') animateFennec(scene, visitor);
    if (id === 'owl-resident') animateOwl(scene, visitor);
    if (id === 'sea-resident') animateSeal(scene, visitor, true);
    motion.addEventListener('change', change);
    visitor.once('destroy', () => { start?.remove(); roam?.stop(); motion.removeEventListener('change', change); });
  });
}
