import Phaser from 'phaser';
import { reducedMotion } from './adventureMap';

type MovingObject = Phaser.GameObjects.Image | Phaser.GameObjects.Graphics | Phaser.GameObjects.Text | Phaser.GameObjects.Shape;

/** Move the illustrated pieces together; keep their final input geometry unchanged. */
export function arriveObjects(scene: Phaser.Scene, objects: Phaser.GameObjects.GameObject[],
  pivot: { x: number; y: number }, from: { x: number; y: number; scale: number; alpha?: number; angle?: number },
  duration: number, complete?: () => void, reverse = false): () => void {
  const originals = objects.filter(object => 'setAlpha' in object).map(object => {
    const o = object as MovingObject;
    return { o, x: o.x, y: o.y, sx: o.scaleX, sy: o.scaleY, angle: o.angle, alpha: o.alpha };
  });
  const state = { p: reverse || reducedMotion() ? 1 : 0 };
  const apply = () => {
    const scale = Phaser.Math.Linear(from.scale, 1, state.p);
    const angle = (from.angle ?? 0) * (1 - state.p), a = angle * Math.PI / 180;
    const cx = Phaser.Math.Linear(from.x, pivot.x, state.p), cy = Phaser.Math.Linear(from.y, pivot.y, state.p);
    for (const item of originals) {
      const dx = (item.x - pivot.x) * scale, dy = (item.y - pivot.y) * scale;
      item.o.setPosition(cx + dx * Math.cos(a) - dy * Math.sin(a), cy + dx * Math.sin(a) + dy * Math.cos(a))
        .setScale(item.sx * scale, item.sy * scale).setAngle(item.angle + angle)
        .setAlpha(item.alpha * Phaser.Math.Linear(from.alpha ?? 1, 1, state.p));
    }
  };
  apply();
  if (reducedMotion()) { complete?.(); return () => {}; }
  const tween = scene.tweens.add({ targets: state, p: reverse ? 0 : 1, duration, ease: reverse ? 'Cubic.InOut' : 'Cubic.Out',
    onUpdate: apply, onComplete: () => { apply(); complete?.(); } });
  return () => { tween.remove(); state.p = 1; apply(); };
}
