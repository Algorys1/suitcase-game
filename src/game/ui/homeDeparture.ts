import Phaser from 'phaser';
import type { SessionState } from '../../domain/session';
import { drawPreparationDesk } from './preparationArt';
import { mapDeparture, reducedMotion } from './adventureMap';
import { bookBusy } from './notebookMotion';
import { queueWorldAssets, queueVoidAssets } from './assetLoading';
import { prepareIllustrationTextures } from './illustrationTextures';
import { preloadTravelSpyglass } from './travelSpyglass';
import { playSound } from '../../services/audio';

/** Lift the suitcase while loading only the screen the player has just requested. */
export function departFromHome(scene: Phaser.Scene, session: SessionState, complete: (animated: boolean) => void): void {
  if (bookBusy(scene)) return;
  const hero = scene.children.getByName('home-departure');
  if (reducedMotion() || !(hero instanceof Phaser.GameObjects.Image)
    || !scene.textures.exists('preparation-suitcase_closed')) { complete(false); return; }

  scene.data.set('book-busy', true);
  scene.input.enabled = false;
  const { width: w, height: h } = scene.scale;
  const bounds = hero.getBounds();
  const startX = hero.x + bounds.width * 0.035, startY = hero.y - bounds.height * 0.015;
  const frame = scene.textures.getFrame('preparation-suitcase_closed');
  const initialScale = bounds.width * 0.83 / frame.width;
  const to = mapDeparture(w, h, session);
  const finalScale = Math.min(to.width / frame.width, to.height / frame.height);
  const finalY = to.y + to.height / 2 - frame.height * finalScale / 2;
  const parts: Phaser.GameObjects.GameObject[] = [];
  const before = scene.children.length;
  drawPreparationDesk(scene, w, h);
  const desk = scene.children.getAll().slice(before)[0] as Phaser.GameObjects.Image | Phaser.GameObjects.Graphics;
  desk.setAlpha(0).setDepth(1000); parts.push(desk);
  const suitcase = scene.add.image(startX, startY, 'preparation-suitcase_closed')
    .setScale(initialScale).setAlpha(0).setDepth(1002).setName('home-travelling-suitcase');
  parts.push(suitcase);
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  const tweens: Phaser.Tweens.Tween[] = [];
  let finished = false, unfolding = false, lifted = false, loaded = false;

  const removeListeners = () => {
    scene.load.off('complete', ready); scene.load.off('loaderror', finish);
    scene.scale.off('resize', finish); query.removeEventListener('change', finish);
    scene.game.canvas.removeEventListener('keydown', key);
  };
  const finish = () => {
    if (finished) return;
    finished = true; removeListeners(); tweens.forEach(t => t.stop());
    // Keep the covering paper until scene shutdown, avoiding a flash of the home UI.
    complete(true);
  };
  const shutdown = () => {
    finished = true; removeListeners(); tweens.forEach(t => t.stop());
    parts.forEach(p => p.destroy()); scene.input.enabled = true; scene.data.set('book-busy', false);
  };
  const key = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); finish(); } };
  const unfold = () => {
    if (finished || unfolding || !lifted || !loaded) return;
    unfolding = true;
    prepareIllustrationTextures(scene);
    if (!scene.textures.exists('adventure-map-paper')) { finish(); return; }
    const margin = w < 600 || h < 450 ? 13 : 28;
    const paper = scene.add.nineslice(startX, startY + bounds.height * 0.18, 'adventure-map-paper', undefined,
      (w - margin * 2) * 2, (h - margin * 2) * 2, 120, 120, 120, 120)
      .setScale(0.07, 0.025).setAngle(-8).setAlpha(0).setDepth(1001).setName('home-unfolding-map');
    parts.push(paper);
    playSound('paper');
    tweens.push(scene.tweens.add({ targets: paper, x: w / 2, y: h / 2, scaleX: 0.5, scaleY: 0.5,
      angle: 0, alpha: 1, duration: 430, ease: 'Cubic.Out' }));
    tweens.push(scene.tweens.add({ targets: suitcase, x: to.x, y: finalY, scale: finalScale,
      angle: 0, alpha: session.phase === 'preparation' && session.charges > 0 ? 1 : 0,
      duration: 520, ease: 'Cubic.InOut', onComplete: finish }));
  };
  const ready = () => { loaded = true; unfold(); };
  scene.events.once('shutdown', shutdown);
  scene.scale.once('resize', finish); query.addEventListener('change', finish);
  scene.game.canvas.addEventListener('keydown', key);
  scene.load.once('complete', ready); scene.load.once('loaderror', finish);
  queueWorldAssets(scene, session.visitedDestinationIds, true);
  if (session.lastTrip?.destinationId === null) queueVoidAssets(scene);
  if (session.lastTrip?.destinationId) preloadTravelSpyglass(scene);
  // Cached screens do not need to start an empty loader.
  if (scene.load.list.size === 0) loaded = true;
  else scene.load.start();
  tweens.push(scene.tweens.add({ targets: desk, alpha: 1, duration: 200 }));
  tweens.push(scene.tweens.add({ targets: suitcase, alpha: 1, y: startY - 17,
    angle: -3, duration: 160, ease: 'Sine.Out', onComplete: () => { lifted = true; unfold(); } }));
}
