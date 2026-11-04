import Phaser from 'phaser';
import type { ActivityAction, ActivityId, ActivityState } from '../../domain/worldActivities';
import { activityComplete } from '../../domain/worldActivities';
import { getTexts } from '../../services/i18n';
import { AdventureControls, reducedMotion } from './adventureMap';
import type { WorldFrame } from './pilotWorlds';

type Point = { x: number; y: number };
type Movable = { home: Point; draw: (point: Point) => void; target: Point; index: number };

/** Each landscape owns its gesture; storage only receives a fulfilled action. */
export function drawWorldActivity(scene: Phaser.Scene, controls: AdventureControls, art: WorldFrame,
  id: ActivityId, state: ActivityState, act: (action: ActivityAction, point: Point) => void,
  celebrate: boolean): () => void {
  const point = (x: number, y: number): Point => ({ x: art.left + art.width * x, y: art.top + art.height * y });
  const complete = activityComplete(id, state);
  const copy = getTexts().activities;
  const background = scene.children.getByName('exploration-art') as Phaser.GameObjects.Image | null;
  const key = id === 'archipel_azur' ? 'adventure-archipel-channels'
    : id === 'sylve_prismatique' ? 'adventure-sylve-unlit' : 'adventure-faille-bare';
  if (scene.textures.exists(key)) background?.setTexture(key).setDisplaySize(art.width, art.height);
  const movables: Movable[] = [];
  let selected: Movable | undefined;
  let dragging: { item: Movable; pointer: number; start: Point; offset: Point } | undefined;
  let prismStart: { pointer: number; x: number } | undefined;
  const selectedInk = scene.add.graphics().setName('activity-selection');
  const instruction = () => scene.children.getByName('exploration-instruction') as Phaser.GameObjects.Text | null;
  const unselect = () => {
    if (dragging) dragging.item.draw(dragging.item.home);
    dragging = undefined; selected = undefined; prismStart = undefined; selectedInk.clear();
    instruction()?.setText(copy[id][complete ? 'done' : 'mood']);
  };
  const select = (item: Movable) => {
    if (dragging) return;
    selected?.draw(selected.home);
    selected = item;
    selectedInk.clear().lineStyle(1.5, 0xffedbb, 0.9).strokeEllipse(item.home.x, item.home.y,
      Math.max(28, art.width * 0.075), Math.max(20, art.height * 0.075));
    instruction()?.setText(id === 'archipel_azur' ? copy.moveStone : copy.joinRibbon);
  };
  const commit = (item: Movable) => act({ type: id === 'archipel_azur' ? 'move' : 'join', index: item.index }, item.target);
  const addMovable = (name: string, item: Movable) => {
    movables.push(item);
    controls.add(name, item.home.x, item.home.y, 48, 48, () => select(item), false);
    const zone = scene.children.getByName(name) as Phaser.GameObjects.Zone;
    zone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (dragging || !pointer.primaryDown) return;
      dragging = { item, pointer: pointer.id, start: { x: pointer.x, y: pointer.y },
        offset: { x: pointer.x - item.home.x, y: pointer.y - item.home.y } };
    });
  };
  const curve = (from: Point, a: Point, b: Point, to: Point) => new Phaser.Curves.CubicBezier(
    new Phaser.Math.Vector2(from.x, from.y), new Phaser.Math.Vector2(a.x, a.y),
    new Phaser.Math.Vector2(b.x, b.y), new Phaser.Math.Vector2(to.x, to.y));
  const trace = (g: Phaser.GameObjects.Graphics, line: Phaser.Curves.CubicBezier, color: number, width: number, alpha: number) => {
    g.lineStyle(width, color, alpha).beginPath();
    line.getPoints(40).forEach((p, i) => { if (i) g.lineTo(p.x, p.y); else g.moveTo(p.x, p.y); });
    g.strokePath();
  };

  if (id === 'archipel_azur') {
    const basin = point(0.5, 0.80);
    for (const index of [0, 1]) {
      const left = index === 0;
      const home = point(left ? 0.275 : 0.725, 0.675), bank = point(left ? 0.38 : 0.62, 0.77);
      if (state.moved.includes(index)) {
        const water = scene.add.graphics().setName(`channel-water-${index}`);
        const path = curve(point(left ? 0.23 : 0.77, 0.64), point(left ? 0.23 : 0.77, 0.72),
          point(left ? 0.40 : 0.60, 0.75), basin);
        trace(water, path, 0x6dcfc5, art.height * 0.038, 0.16);
        trace(water, path, 0x60ccc0, art.height * 0.025, 0.38);
        trace(water, path, 0xa2ead8, art.height * 0.012, 0.48);
        for (let i = 1; i < 7; i++) {
          const p = path.getPoint(i / 8);
          water.lineStyle(Math.max(0.6, art.height * 0.002), 0xf1fff0, 0.5)
            .lineBetween(p.x - art.width * 0.007, p.y + 1, p.x + art.width * 0.007, p.y - 1);
        }
        if (celebrate && !reducedMotion()) {
          water.setAlpha(0); scene.tweens.add({ targets: water, alpha: 1, duration: 650 });
        }
      }
      const stone = scene.add.image(home.x, home.y, 'adventure-shore-pebble').setName(`shore-stone-art-${index}`);
      stone.setScale(art.width * 0.11 / stone.width).setFlipX(index === 1);
      const draw = (p: Point) => {
        stone.setPosition(p.x, p.y);
      };
      draw(state.moved.includes(index) ? bank : home);
      if (!state.moved.includes(index)) {
        addMovable(`shore-stone-${index}`, { home, target: bank, index, draw });
        controls.add(`shore-bank-${index}`, bank.x, bank.y, 44, 44,
          () => { if (selected?.index === index) commit(selected); }, false);
      }
    }
    if (complete) scene.add.ellipse(basin.x, basin.y, art.width * 0.11, art.height * 0.045, 0x73d5c9, 0.7)
      .setName('shell-pool');
    const shell = scene.add.image(basin.x, basin.y - art.height * 0.005,
      complete ? 'souvenir-archipel_azur' : 'adventure-shell-closed').setName('shore-shell');
    shell.setScale(art.width * (complete ? 0.13 : 0.19) / shell.width);
    if (complete) controls.add('replay-tide', basin.x, basin.y, 48, 44, () => {
      const ripple = scene.add.ellipse(basin.x, basin.y, art.width * 0.12, art.height * 0.045)
        .setStrokeStyle(1.5, 0xf0fff7).setName('tide-response');
      if (!reducedMotion()) scene.tweens.add({ targets: ripple, scaleX: 2.2, scaleY: 2.2, alpha: 0,
        duration: 800, onComplete: () => ripple.destroy() });
      else ripple.destroy();
    }, false);
    if (celebrate && !reducedMotion()) scene.tweens.add({ targets: shell, angle: { from: -8, to: 0 },
      y: { from: shell.y + 5, to: shell.y }, duration: 700, ease: 'Sine.Out' });
  } else if (id === 'sylve_prismatique') {
    const anchor = point(0.31, 0.035), hook = point(0.31, 0.24), center = point(0.31, 0.38);
    const target = point(0.59, 0.67);
    if (complete) {
      if (celebrate && !reducedMotion()) {
        const illuminated = scene.add.image(art.left + art.width / 2, art.top + art.height / 2, 'destination-sylve_prismatique')
          .setDisplaySize(art.width, art.height).setAlpha(0).setName('forest-rainbow');
        scene.tweens.add({ targets: illuminated, alpha: 1, duration: 1000 });
      } else background?.setTexture('destination-sylve_prismatique').setDisplaySize(art.width, art.height);
      controls.add('turn-prism', center.x, center.y, Math.max(48, art.width * 0.15), Math.max(48, art.height * 0.26), () => {
        const response = scene.add.ellipse(target.x, target.y, art.width * 0.07, art.height * 0.03, 0xffedb9, 0.25)
          .setName('prism-response');
        if (!reducedMotion()) scene.tweens.add({ targets: response, scaleX: 2, scaleY: 2, alpha: 0,
          duration: 700, onComplete: () => response.destroy() });
        else response.destroy();
      }, false);
      return () => {};
    }
    scene.add.graphics().lineStyle(Math.max(1, art.width * 0.004), 0x76512c)
      .lineBetween(anchor.x, anchor.y, hook.x, hook.y).setName('prism-cord');
    scene.add.ellipse(target.x, target.y, art.width * 0.075, art.height * 0.035, 0xd3c6a8, 0.9)
      .setStrokeStyle(1, 0x9b9d80, 0.5).setName('prism-stone');
    const landings = [[0.22, 0.68], [0.35, 0.78], [0.46, 0.73], [0.59, 0.67], [0.76, 0.73], [0.85, 0.62]];
    const landing = landings[state.orientation]!;
    const end = point(landing[0]!, landing[1]!);
    const beam = scene.add.graphics().setName('prism-ray');
    beam.lineStyle(Math.max(1, art.height * 0.012), 0xffe7ae, 0.38)
      .lineBetween(center.x, center.y, end.x, end.y);
    const prism = scene.add.image(hook.x, hook.y, 'souvenir-sylve_prismatique').setOrigin(0.5, 0.10)
      .setName('forest-prism').setAngle((state.orientation - 3) * 10);
    prism.setScale(art.height * 0.29 / prism.height);
    const rotate = (direction: 1 | -1) => {
      act({ type: 'rotate', direction }, center);
    };
    controls.add('turn-prism', center.x, center.y, Math.max(48, art.width * 0.15), Math.max(48, art.height * 0.26),
      () => rotate(1), false, false);
    const prismZone = scene.children.getByName('turn-prism') as Phaser.GameObjects.Zone;
    prismZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.primaryDown && !prismStart) prismStart = { pointer: pointer.id, x: pointer.x };
    });
    const releasePrism = (pointer: Phaser.Input.Pointer) => {
      if (!prismStart || prismStart.pointer !== pointer.id) return;
      const start = prismStart; prismStart = undefined;
      if (pointer.x < art.left || pointer.x > art.left + art.width || pointer.y < art.top || pointer.y > art.top + art.height) return;
      rotate(pointer.x < start.x - 12 ? -1 : 1);
    };
    const cancelPrism = () => { prismStart = undefined; };
    const escapePrism = (event: KeyboardEvent) => { if (event.key === 'Escape') cancelPrism(); };
    scene.input.on('pointerup', releasePrism);
    scene.input.on('pointerupoutside', cancelPrism); scene.input.on('gameout', cancelPrism);
    scene.game.canvas.addEventListener('touchcancel', cancelPrism); window.addEventListener('blur', cancelPrism);
    scene.game.canvas.addEventListener('keydown', escapePrism);
    return () => {
      cancelPrism(); scene.input.off('pointerup', releasePrism);
      scene.input.off('pointerupoutside', cancelPrism); scene.input.off('gameout', cancelPrism);
      scene.game.canvas.removeEventListener('touchcancel', cancelPrism); window.removeEventListener('blur', cancelPrism);
      scene.game.canvas.removeEventListener('keydown', escapePrism);
    };
  } else {
    const knot = point(0.642, 0.325);
    for (const index of [0, 1]) {
      const anchor = point(0.64, index === 0 ? 0.295 : 0.355);
      const home = point(index === 0 ? 0.45 : 0.85, index === 0 ? 0.30 : 0.40);
      const ribbon = scene.add.graphics().setName(`ribbon-art-${index}`);
      const draw = (p: Point) => {
        ribbon.clear();
        const path = curve(anchor, { x: anchor.x + (p.x - anchor.x) * 0.4, y: anchor.y - art.height * 0.025 },
          { x: p.x - (p.x - anchor.x) * 0.2, y: p.y + art.height * 0.015 }, p);
        trace(ribbon, path, index === 0 ? 0x8a4640 : 0x425f8a, Math.max(4, art.height * 0.027), 1);
        trace(ribbon, path, index === 0 ? 0xe99073 : 0xa9c9e4, Math.max(2, art.height * 0.019), 1);
        trace(ribbon, path, index === 0 ? 0xf2ac83 : 0xc8e1ef, Math.max(0.7, art.height * 0.003), 0.8);
      };
      draw(state.moved.includes(index) ? knot : home);
      if (!state.moved.includes(index)) addMovable(`ribbon-${index}`, { home, target: knot, index, draw });
    }
    controls.add('ribbon-knot', knot.x, knot.y, 48, 48, () => {
      if (selected) commit(selected);
    }, false);
    if (complete) {
      const joined = scene.add.image(knot.x + art.width * 0.025, knot.y, 'souvenir-faille_des_contraires')
        .setName('joined-ribbons').setAngle(8);
      joined.setScale(art.width * 0.105 / joined.width);
      const mist = scene.add.graphics().setName('warm-mist');
      for (let i = 0; i < 5; i++) mist.fillStyle(i % 2 ? 0xffd8b4 : 0xd6e4f0, 0.045)
        .fillEllipse(art.left + art.width * (0.42 + i * 0.055), art.top + art.height * (0.58 + i * 0.055),
          art.width * 0.29, art.height * 0.15);
      if (celebrate && !reducedMotion()) {
        mist.setAlpha(0); scene.tweens.add({ targets: mist, alpha: 1, duration: 1000 });
        scene.tweens.add({ targets: joined, angle: { from: -6, to: 8 }, duration: 650, ease: 'Sine.Out' });
      }
      controls.add('replay-ribbons', knot.x, knot.y, 48, 48, () => {
        if (!reducedMotion()) scene.tweens.add({ targets: joined, angle: { from: -6, to: 8 }, duration: 450 });
      }, false);
    }
  }

  const move = (pointer: Phaser.Input.Pointer) => {
    if (!dragging || dragging.pointer !== pointer.id || !pointer.isDown) return;
    selectedInk.clear();
    dragging.item.draw({ x: Phaser.Math.Clamp(pointer.x - dragging.offset.x, art.left, art.left + art.width),
      y: Phaser.Math.Clamp(pointer.y - dragging.offset.y, art.top, art.top + art.height) });
  };
  const release = (pointer: Phaser.Input.Pointer) => {
    if (!dragging || dragging.pointer !== pointer.id) return;
    const { item, start } = dragging; dragging = undefined;
    if (Math.hypot(pointer.x - start.x, pointer.y - start.y) >= 8
      && Math.abs(pointer.x - item.target.x) <= 28 && Math.abs(pointer.y - item.target.y) <= 26) commit(item);
    else { item.draw(item.home); select(item); }
  };
  const cancel = () => unselect();
  const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') cancel(); };
  scene.input.on('pointermove', move);
  scene.input.on('pointerup', release);
  scene.input.on('pointerupoutside', cancel);
  scene.input.on('gameout', cancel);
  scene.game.canvas.addEventListener('touchcancel', cancel);
  scene.game.canvas.addEventListener('keydown', escape);
  window.addEventListener('blur', cancel);
  return () => {
    dragging = undefined; selected = undefined;
    scene.input.off('pointermove', move); scene.input.off('pointerup', release);
    scene.input.off('pointerupoutside', cancel); scene.input.off('gameout', cancel);
    scene.game.canvas.removeEventListener('touchcancel', cancel); scene.game.canvas.removeEventListener('keydown', escape);
    window.removeEventListener('blur', cancel);
  };
}
