import Phaser from 'phaser';
import type { WorldFrame } from './pilotWorlds';

export function drawCollectedAtmosphere(scene: Phaser.Scene, id: string, art: WorldFrame,
  collected: boolean): Phaser.GameObjects.Graphics[] {
  if (!collected || (id !== 'mycelia' && id !== 'foret_du_silence')) return [];
  const fireflies = id === 'mycelia';
  const layer = scene.add.graphics().setName(fireflies ? 'mycelia-fireflies' : 'forest-snowfall');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const paint = (phase: number) => {
    layer.clear();
    for (let i = 0; i < (fireflies ? 8 : 13); i++) {
      const life = (phase * (2 + i % 4) + (i * i * 0.137 + i * 0.217)) % 1;
      const spread = (i * i * 0.173 + i * 0.281) % 1;
      const angle = life * Math.PI * 2;
      const drift = Math.sin(angle + i * 2.4);
      const u = fireflies ? 0.30 + spread * 0.58 + drift * (0.008 + i % 3 * 0.007)
        : 0.06 + spread * 0.86 + drift * (0.005 + i % 4 * 0.003);
      const v = fireflies ? 0.49 + (i * 0.377 % 1) * 0.24 + Math.sin(angle * 2 + i) * 0.014
        : 0.08 + life * (0.65 + i % 3 * 0.05);
      const x = art.left + u * art.width, y = art.top + v * art.height;
      const alpha = Math.sin(life * Math.PI) * (fireflies ? 0.92 : 0.8);
      const radius = Math.max(0.8, art.height * (fireflies ? 0.005 : 0.0035) * (1 + i % 3 * 0.23));
      if (fireflies) layer.fillStyle(0xffcb69, alpha * 0.20).fillCircle(x, y, radius * 2.8);
      layer.fillStyle(fireflies ? 0xffe6a0 : 0xfff7ec, alpha).fillCircle(x, y, radius);
    }
  };
  let animation: Phaser.Tweens.Tween | undefined;
  const refresh = () => {
    animation?.stop();
    paint(0.12);
    if (!motion.matches) animation = scene.tweens.addCounter({ from: 0.12, to: 1.12,
      duration: fireflies ? 30000 : 40000, repeat: -1, onUpdate: tween => paint(tween.getValue() ?? 0.12) });
  };
  refresh();
  motion.addEventListener('change', refresh);
  layer.once('destroy', () => { animation?.stop(); motion.removeEventListener('change', refresh); });
  return [layer];
}
