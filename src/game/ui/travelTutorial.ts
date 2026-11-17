import Phaser from 'phaser';
import { getTexts } from '../../services/i18n';
import { progressStore } from '../../services/storage';
import type { TutorialStep } from '../../services/storage';
import { AdventureControls, mapText, reducedMotion } from './adventureMap';

export const needsTravelTip = (step: TutorialStep): boolean =>
  !progressStore.read().tutorialSeen?.includes(step);

type NoteOptions = {
  x: number; top: number; width: number; height: number;
  button: (name: string, label: string, x: number, y: number, width: number, action: () => void) => void;
  animate?: boolean;
};

/** A luggage-paper note: no scrim, no disabled world, no hidden-target hints. */
export function drawTravelNote(scene: Phaser.Scene, step: TutorialStep | 'gestures',
  dismiss: () => void, options: NoteOptions): void {
  const copy = getTexts().tutorial;
  const { x, top, width, height, button } = options;
  const start = scene.children.length;
  const left = x - width / 2;
  const paperTop = top - 12;
  const paper = scene.add.graphics().setName('travel-note-paper');
  const path = (dy: number) => {
    paper.beginPath().moveTo(left + 3, paperTop + dy);
    for (let i = 1; i <= 18; i++) paper.lineTo(left + width * i / 18,
      paperTop + dy + Math.sin(i * 4.7) * 1.3);
    paper.lineTo(left + width - 1, top + height + dy - 4);
    for (let i = 18; i >= 0; i--) paper.lineTo(left + width * i / 18,
      top + height + dy + Math.cos(i * 3.1) * 1.4);
    paper.closePath();
  };
  paper.fillStyle(0x38291c, 0.28); path(6); paper.fillPath();
  // A second scrap and a turned corner give the note the thickness of a real leaf.
  paper.fillStyle(0xd7bb89).lineStyle(1, 0xa88653, 0.65).beginPath()
    .moveTo(left + 5, paperTop + 5).lineTo(left + width - 3, paperTop - 3)
    .lineTo(left + width + 2, top + height - 1).lineTo(left + 8, top + height + 5)
    .closePath().fillPath().strokePath();
  paper.fillStyle(0xfff7e4).lineStyle(1, 0xa18459, 0.85); path(0); paper.fillPath().strokePath();
  paper.fillStyle(0xd9bc87, 0.4).fillTriangle(left + width - 19, top + height,
    left + width, top + height - 17, left + width, top + height);
  paper.lineStyle(1, 0xb79a68, 0.6).lineBetween(left + width - 19, top + height,
    left + width, top + height - 17);
  for (let i = 0; i < 50; i++) paper.fillStyle(0x9c744d, 0.1)
    .fillCircle(left + 8 + i * 31 % (width - 16), top + 6 + i * 17 % (height - 12), 0.6);
  // Brass wire catches the corner; the heading is stamped directly onto the paper.
  const tape = scene.add.graphics().setName('travel-note-clip');
  const clipX = left + width - 24;
  tape.lineStyle(4, 0x5c4329, 0.2).strokeRoundedRect(clipX + 1, paperTop - 8, 10, 27, 5)
    .lineStyle(2.2, 0x987240).strokeRoundedRect(clipX, paperTop - 9, 10, 27, 5)
    .lineStyle(0.8, 0xf5d89a).strokeRoundedRect(clipX - 0.5, paperTop - 9.5, 10, 27, 5)
    .lineStyle(1.5, 0xa47e47).strokeRoundedRect(clipX + 3, paperTop - 6, 4, 20, 2);
  mapText(scene, x, top + 5, copy.tipLabel,
    width < 200 ? 9 : 12, width - 48, '#805132').setFontStyle('bold')
    .setLetterSpacing(0.8).setAngle(-1.2).setName('travel-note-heading');
  const body = mapText(scene, x, top + 23, copy[step], 15, width - 26)
    .setOrigin(0.5, 0).setName('travel-note-body');
  const available = height - 69;
  let font = 15;
  while (body.height > available && font > 11) body.setFontSize(--font);
  let sketch: Phaser.GameObjects.Graphics | undefined;
  if (height > 175 && body.height < height - 125) {
    const cy = top + height - 85;
    const ink = scene.add.graphics().lineStyle(1, 0x9b7951, 0.6)
      .strokeCircle(x, cy, 23).strokeCircle(x, cy, 27);
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      ink.lineBetween(x + Math.sin(a) * 19, cy + Math.cos(a) * 19,
        x + Math.sin(a) * 23, cy + Math.cos(a) * 23);
    }
    sketch = scene.add.graphics().setPosition(x, cy).setName('travel-note-compass-sketch');
    sketch.lineStyle(1.5, 0x795b40, 0.75).beginPath().moveTo(0, -18)
      .lineTo(-4, 5).lineTo(0, 2).lineTo(4, 5).closePath().strokePath()
      .lineStyle(1, 0x795b40, 0.5).lineBetween(0, 2, 0, 16).strokeCircle(0, 0, 2);
  }
  const finish = (skip: boolean) => {
    if (step !== 'gestures') progressStore.acknowledgeTutorial(skip ? undefined : step);
    dismiss();
  };
  button('tutorial-continue', copy.continue, x - width * 0.25, top + height - 22,
    width * 0.46, () => finish(false));
  if (step !== 'gestures') button('tutorial-skip', copy.skip, x + width * 0.24, top + height - 22,
    width * 0.50, () => finish(true));
  const objects = scene.children.getAll().slice(start);
  // Only the paper moves; hit areas and text stay still and immediately usable.
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  let entrance: Phaser.Tweens.Tween | undefined;
  let flutter: Phaser.Tweens.Tween | undefined;
  let sketchMotion: Phaser.Tweens.Tween | undefined;
  const stop = () => { entrance?.stop(); flutter?.stop(); sketchMotion?.stop();
    paper.setAlpha(1).setScale(1).setPosition(0, 0); tape.setAlpha(1); sketch?.setAngle(0); };
  if (!query.matches && options.animate !== false) {
    paper.setAlpha(0).setScale(1, 0.92);
    tape.setAlpha(0);
    entrance = scene.tweens.add({ targets: paper, alpha: 1, scaleY: 1, duration: 340, ease: 'Back.Out' });
    scene.tweens.add({ targets: tape, alpha: 1, duration: 220, delay: 130 });
  }
  if (!query.matches) flutter = scene.tweens.add({ targets: paper, y: -1.3, duration: 2400,
    ease: 'Sine.InOut', yoyo: true, repeat: -1 });
  if (!query.matches && sketch) sketchMotion = scene.tweens.add({ targets: sketch,
    angle: { from: -18, to: 24 }, duration: 2800, ease: 'Sine.InOut', yoyo: true, repeat: -1 });
  query.addEventListener('change', stop);
  paper.once('destroy', () => { entrance?.stop(); flutter?.stop(); sketchMotion?.stop(); query.removeEventListener('change', stop); });
  objects.forEach(object => object.setData('travel-note', true));
  const existing = scene.game.canvas.getAttribute('aria-description');
  scene.game.canvas.setAttribute('aria-description', [existing, copy[step]].filter(Boolean).join('. '));
}

/** Separate travel aid: the world's description always keeps its own place. */
export function destinationTravelTip(scene: Phaser.Scene, controls: AdventureControls,
  step: TutorialStep, stage: { sideX: number; sideW: number; bodyY: number; stickerY: number; portrait: boolean; short: boolean;
    art: { left: number; width: number } },
  dismiss: () => void): void {
  if (!needsTravelTip(step)) return;
  const h = scene.scale.height;
  const keepSouvenir = step === 'souvenir';
  if (stage.portrait && !keepSouvenir) scene.children.getAll().forEach(child => {
    if (child.getData('souvenir-part')) (child as Phaser.GameObjects.Graphics).setVisible(false);
  });
  const top = stage.portrait ? (keepSouvenir ? stage.bodyY + 43 : h - 174) : h - 146;
  const height = stage.portrait ? (keepSouvenir ? stage.stickerY - 52 - top : 110) : 128;
  drawTravelNote(scene, step, dismiss, { x: stage.portrait ? stage.sideX : stage.art.left + stage.art.width / 2,
    top, width: stage.portrait ? stage.sideW - 4 : Math.min(420, scene.scale.width * 0.615 - 34), height,
    button: (...args) => controls.button(...args) });
  // Leaving the scene without folding the note should not repeat an introduction.
  // Keep the current note visible until dismissal or the next scene render.
  progressStore.acknowledgeTutorial(step);
}

/** The journal guide is the only modal: four short, keyboard-accessible chapters. */
export function travelTutorial(scene: Phaser.Scene, controls: AdventureControls,
  _step: TutorialStep | 'review', dismiss: () => void): boolean {
  const copy = getTexts().tutorial;
  let chapter = 0;
  const chapters = [
    [copy.prepareTab, copy.prepareGuide + '\n\n' + copy.keyboard],
    [copy.travelTab, copy.travelGuide], [copy.exploreTab, copy.exploreGuide], [copy.keepTab, copy.keepGuide],
  ];
  const original = scene.children.getAll();
  original.forEach(child => child.disableInteractive());
  let parts: Phaser.GameObjects.GameObject[] = [];
  const render = () => {
    parts.forEach(child => child.destroy()); controls.clear();
    const start = scene.children.length;
    const { width: w, height: h } = scene.scale;
    const width = Math.min(530, w - 28), height = Math.min(410, h - 24);
    const left = (w - width) / 2, top = (h - height) / 2;
    scene.add.rectangle(w / 2, h / 2, w, h, 0x30251f, 0.5).setInteractive().setName('tutorial-scrim');
    const paper = scene.add.graphics().setName('tutorial-paper');
    if (scene.textures.exists('adventure-map-paper')) scene.add.nineslice(w / 2, h / 2,
      'adventure-map-paper', undefined, width * 2, height * 2, 120, 120, 120, 120).setScale(0.5);
    else paper.fillStyle(0xfff3d9).fillRoundedRect(left, top, width, height, 3);
    mapText(scene, w / 2, top + 29, copy.title, 23, width - 30);
    chapters.forEach(([title], i) => controls.button(`guide-tab-${i}`, (chapter === i ? '• ' : '') + title,
      left + width * (i + 0.5) / 4, top + 65, width / 4 - 4, () => { chapter = i; render(); }));
    const body = mapText(scene, w / 2, top + 103, chapters[chapter]![1]!, 17, width - 42)
      .setOrigin(0.5, 0).setName('tutorial-body');
    let size = 17;
    while (body.height > height - 163 && size > 12) body.setFontSize(--size);
    controls.button('tutorial-continue', copy.close, w / 2, top + height - 31, width - 52, dismiss, true);
    parts = scene.children.getAll().slice(start);
    scene.game.canvas.setAttribute('aria-description', copy.title + '. ' + chapters[chapter]!.join('. '));
    if (!reducedMotion()) scene.tweens.add({ targets: body, alpha: { from: 0, to: 1 }, duration: 200 });
  };
  render();
  return true;
}
