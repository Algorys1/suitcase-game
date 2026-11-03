import Phaser from 'phaser';
import { notebookLayout } from './notebook';
import { drawPreparationDesk } from './preparationArt';

export type PageDirection = 'next' | 'previous';
const oldKey = 'journal-previous-spread';
const newKey = 'journal-current-spread';
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const bookBusy = (scene: Phaser.Scene): boolean => scene.data.get('book-busy') === true;

/** A single presentation lock, released even on resize, shutdown or reduced-motion changes. */
function animation(scene: Phaser.Scene, build: (finish: () => void) => () => void, complete?: () => void): () => void {
  scene.data.set('book-busy', true);
  scene.input.enabled = false;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let disposed = false;
  let cleanup = () => {};
  const dispose = (continueAction: boolean) => {
    if (disposed) return;
    disposed = true;
    cleanup();
    scene.scale.off(Phaser.Scale.Events.RESIZE, finish);
    scene.events.off(Phaser.Scenes.Events.SHUTDOWN, shutdown);
    motion.removeEventListener('change', finish);
    scene.input.enabled = true;
    scene.data.set('book-busy', false);
    if (continueAction) complete?.();
  };
  const finish = () => dispose(true);
  const shutdown = () => dispose(false);
  cleanup = build(finish);
  scene.scale.once(Phaser.Scale.Events.RESIZE, finish);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, shutdown);
  motion.addEventListener('change', finish);
  return finish;
}

/** Lift the journal from its position in the home illustration toward the reader. */
export function approachJournal(scene: Phaser.Scene, complete: (opening: boolean) => void): void {
  if (bookBusy(scene)) return;
  const hero = scene.children.getByName('home-departure');
  if (reducedMotion() || !scene.textures.exists('journal-closed') || !(hero instanceof Phaser.GameObjects.Image)) {
    complete(false); return;
  }
  const b = notebookLayout(scene);
  const bounds = hero.getBounds();
  animation(scene, finish => {
    drawPreparationDesk(scene, scene.scale.width, scene.scale.height);
    const desk = scene.children.list.at(-1) as Phaser.GameObjects.Image | Phaser.GameObjects.Graphics;
    desk.setAlpha(0).setDepth(1000);
    const cover = scene.add.image(bounds.x + bounds.width * 0.13, bounds.y + bounds.height * 0.73, 'journal-closed')
      .setDisplaySize(bounds.width * 0.24, bounds.height * 0.52).setAngle(13).setAlpha(0)
      .setDepth(1001).setName('journal-approach');
    const tweens = [
      scene.tweens.add({ targets: desk, alpha: 1, duration: 420 }),
      scene.tweens.add({ targets: cover, alpha: 1, duration: 150 }),
      scene.tweens.add({ targets: cover, x: b.left + b.width * (b.landscape ? 0.75 : 0.5),
        y: b.top + b.height / 2, displayWidth: b.width / (b.landscape ? 2 : 1),
        displayHeight: b.height, angle: 0, duration: 650, ease: 'Cubic.InOut', onComplete: finish }),
    ];
    return () => { tweens.forEach(tween => tween.remove()); cover.destroy(); desk.destroy(); };
  }, () => complete(!reducedMotion()));
}

export function openJournalCover(scene: Phaser.Scene): () => void {
  if (reducedMotion() || !scene.textures.exists('journal-closed')) return () => {};
  const b = notebookLayout(scene);
  return animation(scene, finish => {
    const layers: Phaser.GameObjects.Image[] = [];
    if (b.landscape) {
      const { width, height } = scene.scale;
      const fold = Math.floor(width / 2);
      const pages = scene.textures.addDynamicTexture(newKey, width, height);
      pages?.draw(scene.children.getAll());
      pages?.render();
      pages?.add('left', 0, 0, 0, fold, height);
      drawPreparationDesk(scene, width, height);
      const desk = scene.children.list.at(-1)!;
      const background = scene.textures.addDynamicTexture(oldKey, width, height);
      background?.draw(desk);
      background?.render();
      background?.add('left', 0, 0, 0, fold, height);
      desk.destroy();
      layers.push(scene.add.image(fold, 0, oldKey, 'left').setOrigin(1, 0).setDepth(1000));
      layers.push(scene.add.image(fold, 0, newKey, 'left').setOrigin(1, 0).setScale(0, 1).setDepth(1002));
    }
    const cover = scene.add.image(b.left + (b.landscape ? b.width / 2 : 0), b.top, 'journal-closed')
      .setOrigin(0, 0).setDisplaySize(b.width / (b.landscape ? 2 : 1), b.height)
      .setDepth(1001).setName('journal-opening');
    const tweens = [scene.tweens.add({ targets: cover, scaleX: 0, duration: b.landscape ? 260 : 430,
      ease: 'Sine.InOut', onComplete: () => {
        if (!layers.length) { finish(); return; }
        tweens.push(scene.tweens.add({ targets: layers[1], scaleX: 1, duration: 260, ease: 'Sine.Out', onComplete: finish }));
      } })];
    return () => {
      tweens.forEach(tween => tween.remove());
      cover.destroy();
      layers.forEach(layer => layer.destroy());
      if (scene.textures.exists(oldKey)) scene.textures.remove(oldKey);
      if (scene.textures.exists(newKey)) scene.textures.remove(newKey);
    };
  });
}

/** Snapshot before a scene change; no screenshot readbacks or persisted game state. */
export function captureJournal(scene: Phaser.Scene): boolean {
  if (bookBusy(scene)) return false;
  if (scene.textures.exists(oldKey)) scene.textures.remove(oldKey);
  if (reducedMotion()) return false;
  const texture = scene.textures.addDynamicTexture(oldKey, scene.scale.width, scene.scale.height);
  if (!texture) return false;
  texture.draw(scene.children.getAll());
  // Phaser 4 queues draw commands: flush before the outgoing scene destroys its objects.
  texture.render();
  return true;
}

/** Two paper faces pivot around the binding; new content is already rendered underneath. */
export function turnJournalPage(scene: Phaser.Scene, direction: PageDirection): () => void {
  if (!scene.textures.exists(oldKey)) return () => {};
  if (reducedMotion()) { scene.textures.remove(oldKey); return () => {}; }
  return animation(scene, finish => {
    const { width, height } = scene.scale;
    const old = scene.textures.get(oldKey);
    const current = scene.textures.addDynamicTexture(newKey, width, height);
    current?.draw(scene.children.getAll());
    current?.render();
    const forward = direction === 'next';
    const fold = Math.floor(width / 2);
    const b = notebookLayout(scene);
    const pageLeft = Math.round(b.left + 10);
    const pageTop = Math.round(b.top + 10);
    const pageHeight = Math.round(b.height - 20);
    for (const texture of [old, current]) {
      texture?.add('left', 0, pageLeft, pageTop, fold - pageLeft, pageHeight);
      texture?.add('right', 0, fold, pageTop, Math.round(b.left + b.width - 10) - fold, pageHeight);
    }
    const stationary = scene.add.image(fold, pageTop, oldKey, forward ? 'left' : 'right')
      .setOrigin(forward ? 1 : 0, 0).setDepth(1000).setName('journal-old-page');
    const turning = scene.add.image(fold, pageTop, oldKey, forward ? 'right' : 'left')
      .setOrigin(forward ? 0 : 1, 0).setDepth(1002).setName('journal-turning-page');
    const arriving = scene.add.image(fold, pageTop, newKey, forward ? 'left' : 'right')
      .setOrigin(forward ? 1 : 0, 0).setScale(0, 1).setDepth(1003).setName('journal-arriving-page');
    const shade = scene.add.rectangle(fold, height / 2, 20, height - 32, 0x644327, 0.12)
      .setDepth(1001).setName('journal-page-shadow');
    const tweens = [scene.tweens.add({ targets: turning, scaleX: 0, duration: 230, ease: 'Sine.In',
      onComplete: () => {
        tweens.push(scene.tweens.add({ targets: arriving, scaleX: 1, duration: 250, ease: 'Sine.Out', onComplete: finish }));
      } })];
    return () => {
      tweens.forEach(tween => tween.remove());
      [stationary, turning, arriving, shade].forEach(object => object.destroy());
      scene.textures.remove(oldKey);
      if (scene.textures.exists(newKey)) scene.textures.remove(newKey);
    };
  });
}
