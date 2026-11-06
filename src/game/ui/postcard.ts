import Phaser from 'phaser';
import { destinations } from '../../domain/recipes';
import { worldTexture } from './worldTexture';

const textureKey = (id: string): string => `destination-${id}`;

/** Load the complete collection from the catalogue's asset paths. */
export function preloadPostcards(scene: Phaser.Scene): void {
  for (const destination of destinations) {
    if (!scene.textures.exists(textureKey(destination.id))) {
      scene.load.image(textureKey(destination.id), import.meta.env.BASE_URL + destination.image);
    }
  }
}

export function hasPostcard(scene: Phaser.Scene, index: number): boolean {
  const destination = destinations[index];
  return destination !== undefined && scene.textures.exists(textureKey(destination.id));
}

/** Contain the complete illustration without distortion; retain a graceful fallback. */
export function drawPostcard(scene: Phaser.Scene, x: number, y: number, width: number, height: number, seed: number,
  mounted = false): Array<Phaser.GameObjects.Graphics | Phaser.GameObjects.Image> {
  const g = scene.add.graphics();
  const objects: Array<Phaser.GameObjects.Graphics | Phaser.GameObjects.Image> = [g];
  const left = x - width / 2;
  const skies = [0xd9eeeb, 0xe7def5, 0xffe4d1];
  g.fillStyle(0x79543f, 0.12).fillRoundedRect(left, y + 4, width, height, 8);
  g.fillStyle(0xfffaf0).fillRoundedRect(left, y, width, height, 8);
  const destination = destinations[seed];
  if (destination && hasPostcard(scene, seed)) {
    const picture = scene.add.image(x, y + height / 2,
      destination.id === 'ile_des_cendres' || destination.id === 'grottes_sporiferes'
        || destination.id === 'canopee_des_brumes'
        ? worldTexture(scene, destination.id) : textureKey(destination.id))
      .setName(`postcard-${destination.id}`);
    const scale = Math.min((width - 8) / picture.width, (height - 8) / picture.height);
    picture.setScale(scale);
    g.lineStyle(1, 0xc78b60).strokeRoundedRect(left, y, width, height, 8);
    objects.push(picture);
    if (mounted) {
      const corners = scene.add.graphics();
      corners.fillStyle(0xb58b4c);
      corners.fillTriangle(left - 3, y - 3, left + 17, y - 3, left - 3, y + 17);
      corners.fillTriangle(left + width + 3, y + height + 3, left + width - 17, y + height + 3,
        left + width + 3, y + height - 17);
      corners.lineStyle(1, 0xf4d494).lineBetween(left - 1, y + 12, left + 12, y - 1);
      corners.lineBetween(left + width - 12, y + height + 1, left + width + 1, y + height - 12);
      objects.push(corners);
    }
    return objects;
  }
  g.fillStyle(skies[seed % skies.length] ?? 0xd9eeeb).fillRoundedRect(left + 4, y + 4, width - 8, height - 8, 6);
  g.fillStyle(0xf6c96b).fillCircle(x + width * 0.22, y + height * 0.3, height * 0.12);
  g.fillStyle(0x77c98a).fillTriangle(left + 5, y + height - 5, left + width * 0.35, y + height * 0.36, left + width * 0.72, y + height - 5);
  g.fillStyle(0x59c9c2).fillTriangle(left + width * 0.36, y + height - 5, left + width * 0.7, y + height * 0.5, left + width - 5, y + height - 5);
  g.lineStyle(1, 0xc78b60).strokeRoundedRect(left, y, width, height, 8);
  return objects;
}
