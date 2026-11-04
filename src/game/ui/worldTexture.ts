import type Phaser from 'phaser';
import { explorationComplete, isPilot } from '../../domain/pilotExploration';
import { progressStore } from '../../services/storage';

export function worldTexture(scene: Phaser.Scene, id: string): string {
  const incomplete = isPilot(id) && !explorationComplete(id, progressStore.explorationSteps(id));
  const candidate = incomplete && id === 'mycelia' ? 'adventure-mycelia-sleeping'
    : incomplete && id === 'cimes_eternelles' ? 'adventure-cimes-predawn' : `destination-${id}`;
  return scene.textures.exists(candidate) ? candidate : `destination-${id}`;
}
