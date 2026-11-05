import Phaser from 'phaser';
import { reducedMotion } from './adventureMap';
import { pilotTargets } from '../../domain/pilotExploration';

export type WorldFrame = { left: number; top: number; width: number; height: number };

/** Keep the bell and its complete suspension painted into both lighting states. */
export function drawCimesSunrise(scene: Phaser.Scene, art: WorldFrame, complete: boolean,
  transition: boolean, touched?: number, visited: readonly number[] = [], newlyTouched = false): void {
  const background = scene.children.getByName('exploration-art') as Phaser.GameObjects.Image | null;
  if (!background) return;
  const night = (!complete || transition) && scene.textures.exists('adventure-cimes-predawn');
  background.setTexture(night ? 'adventure-cimes-predawn' : 'destination-cimes_eternelles')
    .setDisplaySize(art.width, art.height);
  if (complete && transition && !reducedMotion()) {
    const sunrise = scene.add.image(art.left + art.width / 2, art.top + art.height / 2, 'destination-cimes_eternelles')
      .setDisplaySize(art.width, art.height).setAlpha(0).setName('cimes-sunrise');
    scene.tweens.add({ targets: sunrise, alpha: 1, duration: 1400, ease: 'Sine.InOut' });
  } else if (complete) background.setTexture('destination-cimes_eternelles').setDisplaySize(art.width, art.height);
  const mistKeys = ['high', 'left', 'right'];
  pilotTargets.cimes_eternelles.forEach((peak, index) => {
    if (!visited.includes(index)) return;
    const key = `adventure-cimes-mist-${mistKeys[index]}`;
    if (!scene.textures.exists(key)) return;
    const x = art.left + art.width * peak.x, y = art.top + art.height * (peak.y + 0.025);
    const restingX = x + art.width * (index === 2 ? 0.025 : -0.035);
    const cloud = scene.add.image(x, y, key).setAlpha(0.8).setName(`cimes-peak-cloud-${index}`);
    cloud.setScale(art.width * (index === 0 ? 0.20 : 0.17) / cloud.width);
    if (complete && transition && !reducedMotion()) {
      scene.tweens.add({ targets: cloud, x: restingX,
        alpha: 0.72, delay: 120, duration: 1100, ease: 'Sine.InOut' });
    } else if (complete) {
      cloud.setX(restingX).setAlpha(0.72);
    } else if (index === touched && newlyTouched && !reducedMotion()) {
      cloud.setAlpha(0).setY(y + 3);
      scene.tweens.add({ targets: cloud, alpha: 0.8, y, duration: 380, ease: 'Sine.Out' });
    }
  });
}

/** Sleeping paint, sequential warm lights and a small visitor in the doorway. */
export function drawMyceliaLife(scene: Phaser.Scene, art: WorldFrame, awake: boolean,
  waking: boolean, litWindows: readonly number[], newlyLit?: number): () => void {
  const background = scene.children.getByName('exploration-art') as Phaser.GameObjects.Image | null;
  const sleeping = scene.textures.exists('adventure-mycelia-sleeping');
  const allLit = litWindows.length === pilotTargets.mycelia.length;
  if (background && sleeping && (!allLit || newlyLit !== undefined))
    background.setTexture('adventure-mycelia-sleeping').setDisplaySize(art.width, art.height);
  else background?.setTexture('destination-mycelia').setDisplaySize(art.width, art.height);
  const reduced = reducedMotion();
  if (allLit && newlyLit !== undefined && sleeping) {
    const warm = scene.add.image(art.left + art.width / 2, art.top + art.height / 2, 'destination-mycelia')
      .setDisplaySize(art.width, art.height).setName('mycelia-warm-paint').setAlpha(reduced ? 1 : 0);
    if (!reduced) scene.tweens.add({ targets: warm, alpha: 1, duration: 800 });
  }
  pilotTargets.mycelia.forEach((window, index) => {
    if (!litWindows.includes(index)) return;
    const frame = scene.textures.getFrame('destination-mycelia');
    const light = scene.add.image(art.left + art.width / 2, art.top + art.height / 2, 'destination-mycelia')
      .setDisplaySize(art.width, art.height).setName(`mycelia-window-${index}`);
    light.setCrop((window.x - window.width / 2) * frame.width, (window.y - window.height / 2) * frame.height,
      window.width * frame.width, window.height * frame.height);
    if (index === newlyLit && !reduced) {
      light.setAlpha(0); scene.tweens.add({ targets: light, alpha: 1, duration: 300 });
    }
  });
  if (!awake) return () => {};
  const cx = art.left + art.width * 0.603, bottom = art.top + art.height * 0.723;
  const doorW = art.width * 0.092, doorTop = art.top + art.height * 0.58;
  const doorway = scene.add.graphics().setName('mycelia-doorway').fillStyle(0x402738, 0.93);
  doorway.fillEllipse(cx, doorTop + doorW / 2, doorW, doorW)
    .fillRect(cx - doorW / 2, doorTop + doorW / 2, doorW, bottom - doorTop - doorW / 2);
  const resident = scene.textures.exists('adventure-mycelia-resident')
    ? scene.add.image(cx, bottom, 'adventure-mycelia-resident').setOrigin(0.5, 1).setName('mycelia-resident') : null;
  resident?.setScale(art.height * 0.135 / resident.height);
  const hello = () => {
    if (resident && resident.alpha < 0.95) return;
    if (resident && !reducedMotion()) {
      scene.tweens.killTweensOf(resident);
      resident.setY(bottom).setAngle(0);
      scene.tweens.add({ targets: resident, angle: { from: -5, to: 5 }, y: bottom - 3,
        duration: 190, yoyo: true, repeat: 2, onComplete: () => { resident.setAngle(0).setY(bottom); } });
    }
    if (!reducedMotion()) for (let i = 0; i < 16; i++) {
      const spark = scene.add.circle(cx, bottom - art.height * 0.1, 1 + i % 3, 0xffe1a0, 0.8).setName('awakened-spore');
      scene.tweens.add({ targets: spark, x: cx + Math.sin(i * 2.4) * art.width * 0.27,
        y: art.top + art.height * (0.3 + (i % 4) * 0.06), alpha: 0, duration: 900 + i * 35,
        onComplete: () => spark.destroy() });
    }
  };
  if (waking && !reduced) {
    doorway.setAlpha(0); resident?.setAlpha(0).setY(bottom + art.height * 0.025);
    scene.tweens.add({ targets: doorway, alpha: 1, delay: 650, duration: 250 });
    if (resident) scene.tweens.add({ targets: resident, alpha: 1, y: bottom, delay: 850, duration: 350,
      onComplete: hello });
  }
  return hello;
}
