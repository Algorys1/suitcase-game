import type Phaser from 'phaser';
import { explorationComplete, isPilot } from '../../domain/pilotExploration';
import { progressStore } from '../../services/storage';
import { necropoleBase } from './necropoleLamps';
import { ashPostcard } from './ashVolcano';
import { grottoPostcard } from './grottoSpores';
import { canopyPostcard } from './canopyDew';

export function worldTexture(scene: Phaser.Scene, id: string): string {
  if (id === 'foret_du_silence' && scene.textures.exists('adventure-forest-empty')) return 'adventure-forest-empty';
  if (id === 'necropole_ardente') return necropoleBase(scene);
  if (id === 'jardins_du_zenith' && scene.textures.exists('adventure-zenith-empty')) return 'adventure-zenith-empty';
  if (id === 'ile_des_cendres') return ashPostcard(scene, progressStore.explorationSteps(id).length);
  if (id === 'grottes_sporiferes') return grottoPostcard(scene, progressStore.explorationSteps(id));
  if (id === 'canopee_des_brumes') return canopyPostcard(scene, progressStore.explorationSteps(id));
  const incomplete = isPilot(id) && !explorationComplete(id, progressStore.explorationSteps(id));
  const candidate = incomplete && id === 'mycelia' ? 'adventure-mycelia-sleeping'
    : incomplete && id === 'cimes_eternelles' ? 'adventure-cimes-predawn' : `destination-${id}`;
  return scene.textures.exists(candidate) ? candidate : `destination-${id}`;
}
