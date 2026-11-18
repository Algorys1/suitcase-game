import Phaser from 'phaser';
import { progressStore } from '../../services/storage';
import type { WorldFrame } from './pilotWorlds';
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
    ...(progress.welcomedSeaVisitor ? ['sea-resident', 'sea-resident-clap'] : [])].filter(Boolean)) {
    if (!scene.textures.exists(`adventure-${id}`)) scene.load.image(`adventure-${id}`,
      `${import.meta.env.BASE_URL}assets/adventure/${id}.webp`);
  }
}

/** Small visitors keep clear of the menu's text column and bottom commands. */
export function drawHomeVisitors(scene: Phaser.Scene): void {
  const progress = progressStore.read(), { width, height } = scene.scale;
  const landscape = width >= 600;
  const ids = [progress.awakenedMycelia ? 'mycelia-resident' : '',
    progress.welcomedForestVisitor ? 'forest-resident' : '',
    progress.welcomedCityVisitor ? 'city-resident' : '',
    progress.welcomedSeaVisitor ? 'sea-resident' : ''].filter(Boolean);
  ids.forEach((id, index) => {
    if (!scene.textures.exists(`adventure-${id}`)) return;
    const x = width * (ids.length === 4
      ? landscape ? 0.56 + index * 0.12 : 0.14 + index * 0.24
      : ids.length === 3
      ? landscape ? [0.58, 0.74, 0.90][index]! : [0.20, 0.50, 0.80][index]!
      : landscape ? 0.62 + index * 0.21 : 0.22 + index * 0.54);
    const y = landscape ? height * 0.77 : height - 230;
    const shadow = scene.add.graphics({ x, y: y - 2 }).fillStyle(0x5b3d2b, 0.16)
      .fillEllipse(0, 0, Math.min(28, height * 0.065), 4).setName(`home-visitor-shadow-${id}`);
    const visitor = scene.add.image(x, y, `adventure-${id}`).setOrigin(0.5, 1).setName(`home-visitor-${id}`);
    visitor.setScale(Math.min(landscape ? 64 : 54, height * 0.16) / visitor.height);
    if (id === 'sea-resident') { animateSeal(scene, visitor, true); return; }
    const baseScale = visitor.scaleX;
    let restingX = x;
    let direction = index ? -1 : 1;
    const stride = Math.min(ids.length >= 3 ? 12 : 16, width * 0.025);
    const roam = Math.min(ids.length === 4 ? 10 : ids.length === 3 ? 18 : 32, width * 0.05);
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let sequence: Phaser.Tweens.TweenChain | undefined;
    let pause: Phaser.Time.TimerEvent | undefined;
    const reset = () => {
      pause?.remove(); pause = undefined;
      sequence?.stop(); sequence = undefined;
      visitor.setPosition(restingX, y).setAngle(0).setScale(baseScale);
      shadow.setX(restingX);
      shadow.setScale(1).setAlpha(1);
    };
    const schedule = () => {
      if (!preference.matches && visitor.active)
        pause = scene.time.delayedCall(Phaser.Math.Between(700, 1500), react);
    };
    const react = () => {
      if (preference.matches || sequence || !visitor.active) return;
      pause?.remove(); pause = undefined;
      const hop = id === 'forest-resident';
      const height = Math.min(12, scene.scale.height * 0.027);
      if (restingX + direction * stride > x + roam || restingX + direction * stride < x - roam)
        direction *= -1;
      const nextX = restingX + direction * stride;
      const middleX = (restingX + nextX) / 2;
      const updateShadow = () => {
        const airborne = Math.max(0, Math.min(1, (y - visitor.y) / height));
        shadow.setX(visitor.x).setScale(1 - airborne * 0.3).setAlpha(1 - airborne * 0.4);
      };
      sequence = scene.tweens.chain({ targets: visitor,
        tweens: hop ? [
          { scaleX: baseScale * 1.07, scaleY: baseScale * 0.92, duration: 75, ease: 'Sine.In' },
          { x: middleX, y: y - height, scaleX: baseScale * 0.97, scaleY: baseScale * 1.03,
            duration: 140, ease: 'Quad.Out', onUpdate: updateShadow },
          { x: nextX, y, scaleX: baseScale * 1.06, scaleY: baseScale * 0.94,
            duration: 145, ease: 'Quad.In', onUpdate: updateShadow },
          { scaleX: baseScale, scaleY: baseScale, duration: 100, ease: 'Sine.Out' },
        ] : [
          { angle: -direction * 5, duration: 90, ease: 'Sine.InOut' },
          { x: middleX, y: y - 3, angle: direction * 5, duration: 140,
            ease: 'Sine.InOut', onUpdate: updateShadow },
          { x: nextX, y, angle: -direction * 3, duration: 140,
            ease: 'Sine.InOut', onUpdate: updateShadow },
          { angle: 0, duration: 90, ease: 'Sine.Out' },
        ],
        onComplete: () => { sequence = undefined; restingX = nextX;
          visitor.setScale(baseScale).setAngle(0).setPosition(restingX, y);
          shadow.setX(restingX).setScale(1).setAlpha(1); schedule(); },
      });
    };
    const change = () => { reset(); schedule(); };
    schedule();
    visitor.setInteractive().on('pointerdown', react);
    preference.addEventListener('change', change);
    visitor.once('destroy', () => {
      pause?.remove(); sequence?.stop(); preference.removeEventListener('change', change);
    });
  });
}
