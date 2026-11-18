import Phaser from 'phaser';
import { getTexts } from '../../services/i18n';

export function preloadTravelSpyglass(scene: Phaser.Scene): void {
  if (!scene.textures.exists('adventure-travel-spyglass')) scene.load.image('adventure-travel-spyglass',
    `${import.meta.env.BASE_URL}assets/adventure/travel-spyglass.webp`);
}

/** A real travel instrument on the photograph's border, with its own paper label. */
export function drawTravelSpyglass(scene: Phaser.Scene, x: number, y: number, size: number,
  action: () => void, options: { focused?: boolean; animate?: boolean; explored?: boolean;
    register?: (x: number, y: number, width: number, height: number, action: () => void) => void } = {}): void {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  const labelWidth = Math.max(68, size * 0.84);
  const labelY = y + size * 0.37;
  const paper = scene.add.graphics().setName('spyglass-tag');
  const left = x - labelWidth / 2, top = labelY - 11;
  paper.fillStyle(0x4b3422, 0.22).fillRoundedRect(left + 2, top + 3, labelWidth, 24, 2);
  paper.fillStyle(0xf5e3bb).lineStyle(1, 0xa58857).beginPath()
    .moveTo(left + 6, top).lineTo(left + labelWidth, top + 1).lineTo(left + labelWidth - 1, top + 22)
    .lineTo(left + 6, top + 23).lineTo(left, top + 12).closePath().fillPath().strokePath();
  paper.fillStyle(0x82603b).fillCircle(left + 7, labelY, 2);
  scene.add.text(x + 3, labelY, getTexts().adventure.exploreShort, { resolution: 2,
    fontFamily: '"Travel Serif", Georgia, serif', fontSize: 14, color: '#573a24' })
    .setOrigin(0.5).setName('spyglass-label');
  const register = (targetY: number, width: number, height: number, activate: () => void) => {
    if (options.register) options.register(x, targetY, width, height, activate);
    else scene.add.zone(x, targetY, width, height).setName('explore')
      .setInteractive({ useHandCursor: true }).on('pointerdown', activate);
    return scene.children.getByName('explore')!.setData('activate-spyglass', activate);
  };
  if (options.explored) {
    if (options.focused) paper.lineStyle(2, 0x79543f).strokeRoundedRect(left - 2, top - 2, labelWidth + 4, 27, 3);
    register(labelY, labelWidth, 44, () => { if (!scene.data.get('book-busy')) action(); });
    return;
  }
  paper.lineStyle(1, 0xa27b46).beginPath().moveTo(left + 7, labelY)
    .lineTo(x - size * 0.15, y + size * 0.14).lineTo(x + size * 0.02, y + size * 0.08).strokePath();
  const image = scene.add.image(x, y, 'adventure-travel-spyglass').setName('travel-spyglass');
  image.setScale(size / image.width);
  const scale = image.scaleX;
  const focus = scene.add.graphics().setName('spyglass-focus');
  const focusDraw = (visible: boolean) => {
    focus.clear();
    if (visible) focus.lineStyle(2, 0x79543f).strokeRoundedRect(x - size / 2 - 3,
      y - size / 2 - 3, size + 6, size + 23, 8);
  };
  focusDraw(!!options.focused);
  const glint = scene.add.ellipse(x + size * 0.44, y - size * 0.12, size * 0.15, size * 0.045,
    0xfff1c9, 0).setAngle(48).setName('spyglass-glint');
  let busy = false;
  let pending = false;
  let entrance: Phaser.Tweens.Tween | undefined;
  let pulse: Phaser.Tweens.Tween | undefined;
  const startPulse = () => {
    if (!query.matches && !busy) pulse = scene.tweens.add({ targets: image,
      alpha: 0.77, delay: 800, duration: 650, yoyo: true, repeat: -1, repeatDelay: 1600, ease: 'Sine.InOut' });
  };
  const complete = () => { if (!pending) return; pending = false; action(); };
  const activate = () => {
    if (busy || scene.data.get('book-busy')) return;
    busy = true;
    pending = true;
    entrance?.stop();
    pulse?.stop();
    if (query.matches) { complete(); return; }
    glint.setAlpha(0.8);
    scene.tweens.add({ targets: glint, alpha: 0, duration: 180, onComplete: complete });
  };
  const target = register(y + 6, Math.max(48, size), Math.max(48, size + 16), activate);
  const hover = (lift: boolean) => {
    if (busy) return;
    entrance?.stop();
    scene.tweens.killTweensOf(image);
    image.setAlpha(1);
    focusDraw(!!options.focused);
    if (query.matches) return;
    scene.tweens.add({ targets: image, y: lift ? y - 3 : y, scale: lift ? scale * 1.04 : scale,
      duration: 140, ease: 'Sine.Out' });
    if (!lift) startPulse();
  };
  target.on('pointerover', () => hover(true)).on('pointerout', () => hover(false));
  // Keyboard activation uses this same glint/lock path in the journal's existing controls.
  target.setData('activate-spyglass', activate);
  const finish = () => {
    entrance?.stop(); scene.tweens.killTweensOf(image); scene.tweens.killTweensOf(glint);
    image.setPosition(x, y).setScale(scale).setAlpha(1); glint.setAlpha(0); complete(); startPulse();
  };
  if (!query.matches && options.animate) {
    image.setPosition(x + 13, y - 10).setAlpha(0);
    entrance = scene.tweens.add({ targets: image, x, y, alpha: 1, duration: 360, ease: 'Back.Out' });
  }
  startPulse();
  query.addEventListener('change', finish);
  image.once('destroy', () => {
    pending = false; entrance?.stop(); scene.tweens.killTweensOf(image); scene.tweens.killTweensOf(glint);
    query.removeEventListener('change', finish);
  });
}
