import Phaser from 'phaser';
import { getTexts } from '../../services/i18n';
import { progressStore } from '../../services/storage';
import type { TutorialStep } from '../../services/storage';
import { AdventureControls, mapText } from './adventureMap';

/** A dismissible paper note, with no indication of the world's hidden targets. */
export function travelTutorial(scene: Phaser.Scene, controls: AdventureControls,
  step: TutorialStep | 'review', dismiss: () => void): boolean {
  if (step !== 'review' && progressStore.read().tutorialSeen?.includes(step)) return false;
  scene.children.list.forEach(child => {
    if (child instanceof Phaser.GameObjects.Zone || 'input' in child) {
      (child as Phaser.GameObjects.GameObject).disableInteractive();
    }
  });
  controls.clear();
  const copy = getTexts().tutorial;
  const { width: w, height: h } = scene.scale;
  const width = Math.min(410, w - 32), height = step === 'review' ? Math.min(386, h - 24) : Math.min(270, h - 24);
  const left = (w - width) / 2, top = (h - height) / 2;
  scene.add.rectangle(w / 2, h / 2, w, h, 0x30251f, 0.46).setInteractive().setName('tutorial-scrim');
  scene.add.graphics().setName('tutorial-paper').fillStyle(0x332619, 0.18)
    .fillRoundedRect(left + 4, top + 6, width, height, 5).fillStyle(0xfff3d9)
    .lineStyle(1, 0xb89964).fillRoundedRect(left, top, width, height, 5)
    .strokeRoundedRect(left, top, width, height, 5)
    .fillStyle(0xd5b477, 0.7).fillRect(w / 2 - 22, top - 4, 44, 15);
  mapText(scene, w / 2, top + 35, copy.title, 21, width - 30).setName('tutorial-title');
  const body = step === 'review' ? [copy.departure, copy.exploration, copy.souvenir].join('\n\n') : copy[step];
  mapText(scene, w / 2, top + (height - 90) / 2 + 28, body, step === 'review' ? 14 : 17, width - 42)
    .setName('tutorial-body');
  const finish = (skip: boolean) => {
    if (step !== 'review') progressStore.acknowledgeTutorial(skip ? undefined : step);
    dismiss();
  };
  controls.button('tutorial-continue', step === 'review' ? copy.close : copy.continue,
    w / 2, top + height - (step === 'review' ? 32 : 70), width - 58, () => finish(false), true);
  if (step !== 'review') controls.button('tutorial-skip', copy.skip,
    w / 2, top + height - 27, width - 50, () => finish(true));
  scene.game.canvas.setAttribute('aria-description', copy.title + '. ' + body);
  return true;
}
