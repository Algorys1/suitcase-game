import Phaser from 'phaser';
import { progressStore } from '../../services/storage';
import type { WorldFrame } from './pilotWorlds';
import { animateAxolotl } from './axolotlVisitor';
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
    progress.welcomedRuinsVisitor ? 'axolotl-resident' : '',
    progress.welcomedReefVisitor ? 'octopus-resident' : '',
    progress.welcomedEmpireVisitor ? 'fennec-resident' : '',
    ...(progress.welcomedRuinsVisitor ? ['axolotl-gills'] : []),
    ...(progress.welcomedVestigesVisitor ? ['griffin-wings'] : []),
    ...(progress.welcomedObservatoryVisitor ? ['owl-resident', 'owl-resident-wings'] : []),
    ...(progress.welcomedSeaVisitor ? ['sea-resident', 'sea-resident-clap'] : [])].filter(Boolean)) {
    if (!scene.textures.exists(`adventure-${id}`)) scene.load.image(`adventure-${id}`,
      `${import.meta.env.BASE_URL}assets/adventure/${id}.webp`);
  }
}

/** Walks around the luggage and onto the clear areas of the departure table. */
export function drawHomeVisitors(scene: Phaser.Scene, art: Phaser.Geom.Rectangle,
  menu: { menuRight: number; footerBottom: number }): void {
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
    progress.welcomedRuinsVisitor ? 'axolotl-resident' : '',
    progress.welcomedReefVisitor ? 'octopus-resident' : ''].filter(Boolean);
  if (!art.width || !art.height) return;
  type Stop = readonly [x: number, y: number, gesture?: 'slide' | 'pause'];
  const edgeInset = landscape ? 27 : 24;
  const tableLeft = (landscape ? menu.menuRight + edgeInset : edgeInset) - art.left;
  const tableRight = width - edgeInset - art.left;
  const leftEdge = tableLeft / art.width, rightEdge = tableRight / art.width;
  const lowerEdge = Math.min((height - (landscape ? 53 : 197) - art.top) / art.height, 1.22);
  const upperEdge = (Math.max(landscape ? 53 : art.top + 40, art.top - 5) - art.top) / art.height;
  const lowerWalk = landscape && height - 8 - menu.footerBottom >= 53;
  const routes: Record<string, { stops: readonly Stop[]; duration: number; hop: number }> = {
    'mycelia-resident': { stops: [[leftEdge, 0.58], [leftEdge, 0.81], [0.14, lowerEdge, 'pause'],
      [0.14, lowerEdge], [0.35, 0.81], [0.12, 0.67]], duration: 16500, hop: 0.05 },
    'forest-resident': { stops: [[rightEdge, 0.50], [rightEdge, 0.80], [0.80, lowerEdge],
      [0.61, 0.87, 'pause'], [0.61, 0.87], [0.80, 0.61]], duration: 15900, hop: 0.17 },
    'city-resident': { stops: [[0.17, 0.22], [leftEdge, upperEdge], [leftEdge, 0.42],
      [0.31, 0.52], [0.56, 0.34], [0.39, 0.22]], duration: 17400, hop: 0.09 },
    'sea-resident': { stops: [[0.22, lowerEdge], [0.40, lowerEdge, 'pause'], [0.40, lowerEdge],
      [0.51, 0.88], [0.35, 0.80, 'slide']], duration: 14900, hop: 0 },
    'axolotl-resident': { stops: [[0.34, 0.62], [0.22, 0.79], [0.35, lowerEdge, 'pause'],
      [0.35, lowerEdge], [0.47, 0.82], [0.47, 0.65]], duration: 18400, hop: 0 },
    'dragon-resident': { stops: [[0.42, 0.50], [0.57, 0.34], [0.76, upperEdge + 0.10, 'pause'],
      [0.76, upperEdge + 0.10], [0.57, 0.21], [0.35, 0.32]], duration: 15500, hop: 0.07 },
    'griffin-resident': { stops: [[0.57, 0.70], [0.79, 0.66], [rightEdge, 0.30, 'pause'],
      [rightEdge, 0.30], [0.70, 0.42], [0.53, 0.56]], duration: 16300, hop: 0.13 },
    'yeti-resident': { stops: [[0.81, 0.86], [rightEdge, lowerEdge], [rightEdge, 0.65, 'pause'],
      [rightEdge, 0.65], [0.72, 0.59], [0.69, 0.76]], duration: 17100, hop: 0.04 },
    'frog-resident': { stops: [[0.08, 0.79], [leftEdge, 0.66], [leftEdge, 0.36, 'pause'],
      [leftEdge, 0.36], [0.25, 0.44], [0.30, 0.66]], duration: 15100, hop: 0.16 },
    'octopus-resident': { stops: [[0.53, lowerEdge], [0.69, lowerEdge], [rightEdge, 0.95],
      [0.84, 0.83, 'pause'], [0.84, 0.83], [0.62, 0.88]], duration: 14900, hop: 0 },
    'fennec-resident': { stops: lowerWalk
      ? [[0.02, 0.99], [0.04, lowerEdge], [leftEdge, lowerEdge], [(width * 0.16 - art.left) / art.width, (height - 8 - art.top) / art.height, 'pause'],
        [(width * 0.16 - art.left) / art.width, (height - 8 - art.top) / art.height], [leftEdge, (height - 8 - art.top) / art.height]]
      : [[0.19, 0.67], [leftEdge, 0.89], [0.23, lowerEdge, 'pause'],
        [0.23, lowerEdge], [0.47, 0.87], [0.33, 0.72]], duration: 17800, hop: 0.11 },
    'owl-resident': { stops: [[0.55, upperEdge], [0.33, upperEdge + 0.02], [0.13, upperEdge + 0.06, 'pause'],
      [0.13, upperEdge + 0.06], [0.36, 0.25], [0.59, 0.25]], duration: 14800, hop: 0.035 },
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
    const inset = Math.max(edgeInset, visitor.displayWidth * 0.55);
    const keepOnTable = (x: number) => Phaser.Math.Clamp(x, inset, width - inset);
    const [restU, restV] = route[0]!;
    const restX = keepOnTable(art.left + art.width * restU);
    const restY = art.top + art.height * restV;
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
      const x = keepOnTable(art.left + art.width * Phaser.Math.Linear(u, nextU, blend));
      const y = art.top + art.height * Phaser.Math.Linear(v, nextV, blend) - hop;
      visitor.setPosition(x, y);
      if (id !== 'owl-resident') visitor.setAngle(sliding ? -14 * Math.sin(Math.PI * t)
        : paused ? 0 : Math.sin(t * Math.PI * 8) * (id === 'sea-resident' ? 2 : 4));
    };
    const change = () => {
      start?.remove(); roam?.stop();
      visitor.setPosition(restX, restY).setAngle(0);
      if (motion.matches) return;
      const offset = index * 0.61 % route.length;
      place(offset);
      start = scene.time.delayedCall(450 + index * 210, () => {
        roam = scene.tweens.addCounter({ from: 0, to: route.length, duration: path.duration,
          repeat: -1, onUpdate: tween => place(((tween.getValue() ?? 0) + offset) % route.length) });
      });
    };
    change();
    if (id === 'axolotl-resident') animateAxolotl(scene, visitor);
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
