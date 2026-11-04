import Phaser from 'phaser';
import { drawPreparationDesk } from './preparationArt';

export function notebookLayout(scene: Phaser.Scene) {
  const { width, height } = scene.scale;
  const landscape = width >= 700 || (width >= 580 && height < 450);
  const bookWidth = Math.min(width - 32, 1040);
  const bookHeight = Math.min(height - 32, 720);
  return { left: (width - bookWidth) / 2, top: (height - bookHeight) / 2,
    width: bookWidth, height: bookHeight, landscape };
}

/** Lightweight paper and binding, drawn locally at the current canvas size. */
export function drawNotebook(scene: Phaser.Scene, left: number, top: number, width: number, height: number,
  foldX?: number): void {
  drawPreparationDesk(scene, scene.scale.width, scene.scale.height);
  const g = scene.add.graphics().setName('notebook-paper');
  g.fillStyle(0x13282e, 0.35).fillRoundedRect(left - 6, top + 3, width + 12, height + 8, 16);
  // The open binding uses the same plum-red leather as the closed journal.
  g.fillStyle(0x74374b).fillRoundedRect(left - 6, top - 5, width + 12, height + 12, 14);
  g.lineStyle(1, 0x452331, 0.85).strokeRoundedRect(left - 6, top - 5, width + 12, height + 12, 14);
  g.lineStyle(2, 0xba7785, 0.8).strokeRoundedRect(left - 3, top - 2, width + 6, height + 6, 12);
  g.fillStyle(0xd4bf99).fillRoundedRect(left + 1, top + 5, width - 2, height, 10);
  g.fillStyle(0xfff5df).fillRoundedRect(left, top, width, height, 10);
  g.lineStyle(1, 0xc5a478, 0.55).lineBetween(left + 12, top + height + 2, left + width - 12, top + height + 2);
  // Fixed seed avoids flickering grain when keyboard focus or size changes.
  let seed = 71;
  const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  g.fillStyle(0x9a7049, 0.08);
  for (let i = 0; i < Math.min(1800, width * height / 240); i++) {
    g.fillRect(left + 10 + random() * (width - 20), top + 10 + random() * (height - 20), 1 + random() * 2, 1);
  }
  g.lineStyle(1, 0x956776, 0.22).strokeRoundedRect(left + 9, top + 9, width - 18, height - 18, 5);
  if (foldX !== undefined) {
    g.fillStyle(0x8a603c, 0.05).fillRect(foldX - 7, top + 2, 14, height - 4);
    g.lineStyle(1, 0x9c774f, 0.24).lineBetween(foldX, top + 10, foldX, top + height - 10);
    g.lineStyle(1, 0xffffff, 0.55).lineBetween(foldX + 2, top + 10, foldX + 2, top + height - 10);
    for (let y = top + 36; y < top + height - 20; y += 46) {
      g.lineStyle(2, 0x977c55, 0.45).lineBetween(foldX - 4, y, foldX + 4, y + 3);
    }
  }
}

export function drawDiamond(g: Phaser.GameObjects.Graphics, x: number, y: number, size: number): void {
  g.fillTriangle(x, y - size, x + size * 0.55, y, x, y + size);
  g.fillTriangle(x, y - size, x - size * 0.55, y, x, y + size);
}

type RevealObject = Phaser.GameObjects.Graphics | Phaser.GameObjects.Image | Phaser.GameObjects.Text;

/** Presentation only: never touches session state or delays the Continue action. */
export function revealPostcard(scene: Phaser.Scene, art: RevealObject[], words: RevealObject[],
  bounds: { x: number; y: number; width: number; height: number }, fresh: boolean,
  souvenir: RevealObject[] = []): () => void {
  const tweens: Phaser.Tweens.Tween[] = [];
  const sparks: Phaser.GameObjects.Graphics[] = [];
  const magic = scene.add.graphics().setName('postcard-magic').setBlendMode(Phaser.BlendModes.ADD);
  const light = { progress: 0 };
  const paintMagic = () => {
    magic.clear();
    if (bounds.width < 16 || bounds.height < 16) return;
    const p = light.progress;
    const strength = Math.sin(p * Math.PI) * (fresh ? 1 : 0.45);
    const left = bounds.x - bounds.width / 2 + 5;
    const top = bounds.y + 5;
    const width = bounds.width - 10, height = bounds.height - 10;
    // Layered translucent strokes make a soft aureole without a full-screen flash.
    for (let layer = 5; layer > 0; layer--) {
      magic.lineStyle(layer * 3, layer > 2 ? 0x83e8e4 : 0xffdc8b, strength * 0.065)
        .strokeRoundedRect(left, top, width, height, 5);
    }
    // A diagonal ribbon of light, clipped arithmetically to the illustration.
    // Phaser 4 WebGL does not use Phaser 3's GeometryMask API.
    const ribbon = Math.max(24, width * 0.19);
    const sweep = -ribbon * 2 + p * (width + height * 0.4 + ribbon * 4);
    for (let band = -16; band <= 16; band++) {
      const x = left + sweep + band * ribbon / 16;
      const bandWidth = ribbon / 16;
      let polygon = [new Phaser.Math.Vector2(x, top), new Phaser.Math.Vector2(x + bandWidth, top),
        new Phaser.Math.Vector2(x + bandWidth - height * 0.4, top + height),
        new Phaser.Math.Vector2(x - height * 0.4, top + height)];
      // Clip whole polygons, avoiding seams from overlapping rows in additive blending.
      for (const edge of [left, left + width]) {
        const clipped: Phaser.Math.Vector2[] = [];
        const inside = (point: Phaser.Math.Vector2) => edge === left ? point.x >= edge : point.x <= edge;
        polygon.forEach((point, index) => {
          const previous = polygon[(index + polygon.length - 1) % polygon.length]!;
          if (inside(point) !== inside(previous)) {
            const t = (edge - previous.x) / (point.x - previous.x);
            clipped.push(new Phaser.Math.Vector2(edge, previous.y + t * (point.y - previous.y)));
          }
          if (inside(point)) clipped.push(point);
        });
        polygon = clipped;
      }
      if (polygon.length < 3) continue;
      magic.fillStyle(band < -6 ? 0x9ff5eb : 0xffefbd,
        Math.exp(-band * band / 60) * strength * 0.4).fillPoints(polygon, true);
    }
    // Fixed seeds keep each mote on a smooth path instead of flickering randomly.
    for (let i = 0; i < (fresh ? 20 : 6); i++) {
      const age = Phaser.Math.Clamp((p - (i % 5) * 0.055) / 0.72, 0, 1);
      const alpha = Math.sin(age * Math.PI) ** 2;
      const x = left + (0.08 + (i * 0.618034 % 0.84)) * width + Math.sin(age * 4 + i) * 7;
      const y = top + (0.18 + (i * 0.381966 % 0.74)) * height - age * Math.min(48, height * 0.25);
      const radius = i % 4 === 0 ? 3 : 1.7;
      magic.fillStyle(i % 3 === 0 ? 0x90fff0 : 0xffdf91, alpha * 0.07)
        .fillCircle(x, y, radius * 4);
      magic.fillStyle(0xffedbe, alpha * 0.24).fillCircle(x, y, radius * 2);
      magic.fillStyle(0xffffff, alpha * 0.9);
      drawDiamond(magic, x, y, radius);
    }
  };
  tweens.push(scene.tweens.add({ targets: light, progress: 1, delay: fresh ? 100 : 20,
    duration: fresh ? 1100 : 380, onUpdate: paintMagic, onComplete: () => magic.clear() }));
  // Keep the original objects in the scene display list (names, filters and focus).
  // A shared transform makes the paper, illustration and photo corners move together.
  const pose = (objects: RevealObject[], x: number, y: number, name: string) => {
    const originals = objects.map(object => ({ object, x: object.x, y: object.y,
      scaleX: object.scaleX, scaleY: object.scaleY, angle: object.angle, alpha: object.alpha }));
    const state = { x: 0, y: 0, scale: 1, angle: 0, alpha: 1 };
    const apply = () => {
      const radians = Phaser.Math.DegToRad(state.angle);
      const cos = Math.cos(radians), sin = Math.sin(radians);
      for (const original of originals) {
        const dx = (original.x - x) * state.scale, dy = (original.y - y) * state.scale;
        original.object.setPosition(x + state.x + dx * cos - dy * sin, y + state.y + dx * sin + dy * cos)
          .setScale(original.scaleX * state.scale, original.scaleY * state.scale)
          .setAngle(original.angle + state.angle).setAlpha(original.alpha * state.alpha);
      }
    };
    const animate = (from: Partial<typeof state>, delay: number, duration: number) => {
      Object.assign(state, from);
      apply();
      tweens.push(scene.tweens.add({ targets: state, x: 0, y: 0, scale: 1, angle: 0, alpha: 1,
        delay, duration, ease: 'Cubic.Out', onUpdate: apply,
        onComplete: () => { apply(); scene.data.set(name, false); } }));
      scene.data.set(name, true);
    };
    return { animate, finish: () => {
      Object.assign(state, { x: 0, y: 0, scale: 1, angle: 0, alpha: 1 });
      apply(); scene.data.set(name, false);
    } };
  };
  const card = pose([...art, magic], bounds.x, bounds.y + bounds.height / 2, 'postcard-arriving');
  card.animate({ x: -Math.min(44, bounds.width * 0.12), y: 24, angle: -6, scale: 0.9, alpha: 0 },
    0, fresh ? 520 : 280);
  words.forEach(object => object.setAlpha(0));
  tweens.push(scene.tweens.add({ targets: words, alpha: 1, delay: fresh ? 220 : 60,
    duration: fresh ? 280 : 180, ease: 'Sine.Out' }));

  const sticker = souvenir.filter(object => object instanceof Phaser.GameObjects.Image);
  const label = souvenir.filter(object => !(object instanceof Phaser.GameObjects.Image));
  const tagText = label.find(object => object instanceof Phaser.GameObjects.Text);
  const tag = pose(label, tagText?.x ?? 0, sticker[0]?.y ?? tagText?.y ?? 0, 'souvenir-arriving');
  tag.animate({ x: 16, y: -18, angle: 5, scale: 1.04, alpha: 0 }, fresh ? 420 : 90, fresh ? 300 : 200);
  const stickerImage = sticker[0];
  const stamp = pose(sticker, stickerImage?.x ?? 0, stickerImage?.y ?? 0, 'sticker-arriving');
  // The sticker arrives separately, then compresses briefly as it adheres to the kraft.
  stamp.animate({ x: -12, y: -24, angle: 17, scale: 1.32, alpha: 0 }, fresh ? 690 : 150, fresh ? 280 : 200);
  if (fresh && stickerImage) {
    tweens.push(scene.tweens.add({ targets: stickerImage, delay: 970,
      scaleX: stickerImage.scaleX / 1.32 * 1.04, scaleY: stickerImage.scaleY / 1.32 * 0.94,
      duration: 85, yoyo: true, ease: 'Sine.InOut', onComplete: stamp.finish }));
  }
  if (fresh) {
    for (let i = 0; i < 6; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const x = bounds.x + side * (bounds.width / 2 - 5);
      const y = bounds.y + bounds.height * (0.2 + Math.floor(i / 2) * 0.3);
      const spark = scene.add.graphics({ x, y }).setName('discovery-spark').setAlpha(0);
      spark.fillStyle(0xffdf91);
      drawDiamond(spark, 0, 0, 5 + i % 3);
      sparks.push(spark);
      tweens.push(scene.tweens.add({ targets: spark, alpha: 1, y: y - 9,
        delay: 320 + i * 35, duration: 180, yoyo: true, onComplete: () => spark.destroy() }));
    }
  }
  return () => {
    tweens.forEach(tween => tween.remove());
    card.finish(); tag.finish(); stamp.finish();
    words.forEach(object => object.setAlpha(1));
    sparks.forEach(spark => { if (spark.scene) spark.destroy(); });
    magic.destroy();
  };
}
