import type Phaser from 'phaser';
import { explorationComplete, isPilot } from '../../domain/pilotExploration';
import { progressStore } from '../../services/storage';
import { activityComplete, hasActivity } from '../../domain/worldActivities';

export function worldTexture(scene: Phaser.Scene, id: string): string {
  if (hasActivity(id)) {
    const complete = activityComplete(id, progressStore.activityState(id));
    const key = complete ? `destination-${id}` : id === 'archipel_azur' ? 'adventure-archipel-channels'
      : id === 'faille_des_contraires' ? 'adventure-faille-bare'
      : 'adventure-sylve-unlit';
    if (scene.textures.exists(key)) return key;
  }
  const incomplete = isPilot(id) && !explorationComplete(id, progressStore.explorationSteps(id));
  const candidate = incomplete && id === 'mycelia' ? 'adventure-mycelia-sleeping'
    : incomplete && id === 'cimes_eternelles' ? 'adventure-cimes-predawn' : `destination-${id}`;
  return scene.textures.exists(candidate) ? candidate : `destination-${id}`;
}
