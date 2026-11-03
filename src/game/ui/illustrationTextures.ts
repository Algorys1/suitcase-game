import Phaser from 'phaser';

/** Prepare cached, mipmapped textures for strong downscaling in cards and thumbnails. */
export function prepareIllustrationTextures(scene: Phaser.Scene): void {
  for (const key of scene.textures.getTextureKeys()) {
    const preparation = key.startsWith('preparation-');
    const home = key.startsWith('home-');
    const journal = key === 'journal-closed';
    if (!key.startsWith('destination-') && !key.startsWith('souvenir-') && !preparation && !home && !journal) continue;
    const texture = scene.textures.get(key);
    const source = texture.getSourceImage();
    // A canvas source has already been prepared during an earlier visit to Home.
    if (!(source instanceof HTMLImageElement)) continue;
    const backdrop = key === 'preparation-travel_desk';
    const vial = key.startsWith('preparation-vial_');
    const maxEdge = backdrop ? 2048 : vial || key.startsWith('preparation-element-') || key.startsWith('preparation-needle_') ? 512 : 1024;
    const ratio = Math.min(1, maxEdge / Math.max(source.naturalWidth, source.naturalHeight));
    const width = Math.round(source.naturalWidth * ratio);
    const height = Math.round(source.naturalHeight * ratio);
    const canvas = document.createElement('canvas');
    // Phaser 4 only generates mipmaps for power-of-two texture dimensions.
    canvas.width = 2 ** Math.ceil(Math.log2(width));
    canvas.height = 2 ** Math.ceil(Math.log2(height));
    // addCanvas also reads pixels when creating Phaser's CanvasTexture. The hint
    // must be set on this FIRST getContext call; setting it later has no effect.
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) continue;
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(source, 0, 0, width, height);
    scene.textures.remove(key);
    const prepared = scene.textures.addCanvas(key, canvas);
    // Exclude unused padding from the frame; keep the original artwork ratio.
    // The two vial states must retain a shared frame to composite the dust without shifts.
    if ((preparation || home || journal) && !backdrop && !vial) {
      // Generated sprites have different transparent margins. Frame their visible
      // silhouette once so every icon has a consistent size, keeping source files intact.
      const pixels = context.getImageData(0, 0, width, height).data;
      let left = width, top = height, right = -1, bottom = -1;
      for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
        if ((pixels[(y * width + x) * 4 + 3] ?? 0) < 16) continue;
        left = Math.min(left, x); top = Math.min(top, y);
        right = Math.max(right, x); bottom = Math.max(bottom, y);
      }
      if (right >= left && bottom >= top) prepared?.get().setSize(right - left + 1, bottom - top + 1, left, top);
      else prepared?.get().setSize(width, height, 0, 0);
    } else prepared?.get().setSize(width, height, 0, 0);
  }
}
