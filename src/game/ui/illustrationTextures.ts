import Phaser from 'phaser';

/** Prepare cached, mipmapped textures for strong downscaling in cards and thumbnails. */
export function prepareIllustrationTextures(scene: Phaser.Scene): void {
  for (const key of scene.textures.getTextureKeys()) {
    if (!key.startsWith('destination-') && !key.startsWith('souvenir-')) continue;
    const texture = scene.textures.get(key);
    const source = texture.getSourceImage();
    // A canvas source has already been prepared during an earlier visit to Home.
    if (!(source instanceof HTMLImageElement)) continue;
    const ratio = Math.min(1, 1024 / Math.max(source.naturalWidth, source.naturalHeight));
    const width = Math.round(source.naturalWidth * ratio);
    const height = Math.round(source.naturalHeight * ratio);
    const canvas = document.createElement('canvas');
    // Phaser 4 only generates mipmaps for power-of-two texture dimensions.
    canvas.width = 2 ** Math.ceil(Math.log2(width));
    canvas.height = 2 ** Math.ceil(Math.log2(height));
    const context = canvas.getContext('2d');
    if (!context) continue;
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(source, 0, 0, width, height);
    scene.textures.remove(key);
    const prepared = scene.textures.addCanvas(key, canvas);
    // Exclude unused padding from the frame; keep the original artwork ratio.
    prepared?.get().setSize(width, height, 0, 0);
  }
}
