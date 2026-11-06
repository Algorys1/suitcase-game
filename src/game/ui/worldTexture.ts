import type Phaser from 'phaser';
import { explorationComplete, isPilot } from '../../domain/pilotExploration';
import { progressStore } from '../../services/storage';
import { ashPostcard } from './ashVolcano';

export function worldTexture(scene: Phaser.Scene, id: string): string {
  if (id === 'ile_des_cendres') return ashPostcard(scene, progressStore.explorationSteps(id).length);
  const incomplete = isPilot(id) && !explorationComplete(id, progressStore.explorationSteps(id));
  const candidate = incomplete && id === 'mycelia' ? 'adventure-mycelia-sleeping'
    : incomplete && id === 'cimes_eternelles' ? 'adventure-cimes-predawn' : `destination-${id}`;
  return scene.textures.exists(candidate) ? candidate : `destination-${id}`;
}
