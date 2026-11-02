import Phaser from 'phaser';

/** Painted glass and brass stay fixed; only the illustrated dust is revealed by charge level. */
export function drawChargeVial(scene: Phaser.Scene, x: number, top: number, height: number,
  charges: number, maximum: number, attached = false): void {
  const level = Math.max(0, Math.min(maximum, charges));
  const ratio = maximum > 0 ? level / maximum : 0;
  const emptyKey = 'preparation-vial_empty';
  const fullKey = 'preparation-vial_full';
  // The adjacent numeric counter remains the readable fallback if either asset is missing.
  if (!scene.textures.exists(emptyKey) || !scene.textures.exists(fullKey)) return;
  const key = `charge-vial-painted-${level}-${maximum}-${attached ? 'mounted' : 'loose'}`;
  if (!scene.textures.exists(key)) {
    const empty = scene.textures.get(emptyKey), full = scene.textures.get(fullKey);
    const emptyImage = empty.getSourceImage(), fullImage = full.getSourceImage();
    if (!(emptyImage instanceof HTMLCanvasElement || emptyImage instanceof HTMLImageElement)
      || !(fullImage instanceof HTMLCanvasElement || fullImage instanceof HTMLImageElement)) return;
    const frame = empty.get(), filledFrame = full.get();
    const width = frame.cutWidth, frameHeight = frame.cutHeight;
    const canvas = document.createElement('canvas');
    canvas.width = 2 ** Math.ceil(Math.log2(width));
    canvas.height = 2 ** Math.ceil(Math.log2(frameHeight));
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(emptyImage, frame.cutX, frame.cutY, width, frameHeight, 0, 0, width, frameHeight);
    if (level > 0) {
      const dust = document.createElement('canvas');
      dust.width = canvas.width; dust.height = canvas.height;
      const dustCtx = dust.getContext('2d', { willReadFrequently: true });
      if (dustCtx) {
        dustCtx.drawImage(fullImage, filledFrame.cutX, filledFrame.cutY, filledFrame.cutWidth,
          filledFrame.cutHeight, 0, 0, width, frameHeight);
        // A soft reveal, anchored at the bottom, keeps the painted grains unscaled.
        const surface = (0.915 - ratio * 0.50) * frameHeight;
        const feather = dustCtx.createLinearGradient(0, surface - frameHeight * 0.018,
          0, surface + frameHeight * 0.018);
        feather.addColorStop(0, 'rgba(255,255,255,0)');
        feather.addColorStop(1, 'rgba(255,255,255,1)');
        dustCtx.globalCompositeOperation = 'destination-in';
        dustCtx.fillStyle = feather; dustCtx.fillRect(0, 0, width, frameHeight);
        // Follow the clear chamber, keeping all metal and the outer glass on the empty base.
        ctx.save(); ctx.scale(width, frameHeight); ctx.beginPath();
        ctx.moveTo(0.39, 0.405);
        ctx.bezierCurveTo(0.35, 0.40, 0.34, 0.43, 0.31, 0.49);
        ctx.bezierCurveTo(0.25, 0.56, 0.18, 0.63, 0.16, 0.72);
        ctx.bezierCurveTo(0.14, 0.82, 0.20, 0.89, 0.31, 0.905);
        ctx.bezierCurveTo(0.42, 0.925, 0.62, 0.925, 0.72, 0.90);
        ctx.bezierCurveTo(0.83, 0.86, 0.86, 0.80, 0.84, 0.72);
        ctx.bezierCurveTo(0.81, 0.61, 0.70, 0.51, 0.66, 0.43);
        ctx.bezierCurveTo(0.65, 0.40, 0.59, 0.39, 0.55, 0.43);
        ctx.lineTo(0.50, 0.46); ctx.lineTo(0.46, 0.425); ctx.closePath(); ctx.clip();
        ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(dust, 0, 0); ctx.restore();
      }
    }
    // Both source images retain their shared original frame. Crop only the finished gauge.
    // In the fallback list, hide the saddle but retain the sealed socket and the glass.
    const cropTop = attached ? 0.13 : 0.25;
    const texture = scene.textures.addCanvas(key, canvas);
    texture?.get().setSize(Math.round(width * 0.80), Math.round(frameHeight * (0.99 - cropTop)),
      Math.round(width * 0.10), Math.round(frameHeight * cropTop));
  }
  const image = scene.add.image(x, top, key).setOrigin(0.5, 0).setName('charge-vial');
  image.setScale(height / image.height).setData({ charges: level, maximum, ratio, attached });
}
