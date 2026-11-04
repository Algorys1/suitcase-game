import Phaser from 'phaser';

/** Soft procedural light, rather than outlined circles around the instrument. */
function prepareEnergy(scene: Phaser.Scene): void {
  if (scene.textures.exists('void-veil')) return;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return;
  const fade = context.createLinearGradient(0, 0, 512, 0);
  fade.addColorStop(0, 'rgba(255,255,255,0)');
  fade.addColorStop(0.35, 'rgba(255,255,255,0.7)');
  fade.addColorStop(0.7, 'rgba(255,255,255,0.45)');
  fade.addColorStop(1, 'rgba(255,255,255,0)');
  context.strokeStyle = fade;
  for (let band = 30; band > 0; band--) {
    context.lineWidth = band * 2;
    context.globalAlpha = 0.04;
    context.beginPath();
    context.moveTo(0, 96);
    context.bezierCurveTo(150, 100, 290, 8, 512, 45);
    context.stroke();
  }
  scene.textures.addCanvas('void-veil', canvas);
  const dust = document.createElement('canvas');
  dust.width = dust.height = 32;
  const brush = dust.getContext('2d', { willReadFrequently: true });
  if (!brush) return;
  const glow = brush.createRadialGradient(16, 16, 0, 16, 16, 16);
  glow.addColorStop(0, 'rgba(255,255,255,1)');
  glow.addColorStop(0.12, 'rgba(255,255,255,0.85)');
  glow.addColorStop(0.35, 'rgba(255,255,255,0.18)');
  glow.addColorStop(1, 'rgba(255,255,255,0)');
  brush.fillStyle = glow;
  brush.fillRect(0, 0, 32, 32);
  scene.textures.addCanvas('void-dust', dust);
}

/** Presentation only: the trip and its energy cost have already been resolved. */
export function drawVoid(scene: Phaser.Scene, animate: boolean, reveal = true): (() => void) | undefined {
  const { width, height } = scene.scale;
  const portrait = width < 600 && height > width;
  if (scene.textures.exists('void-space')) {
    const sky = scene.add.image(0, height / 2, 'void-space').setOrigin(0, 0.5).setName('void-space');
    sky.setScale(Math.max(width / sky.width, height / sky.height));
  }
  const shade = scene.add.graphics();
  shade.fillStyle(0x10132c, 0.24).fillRect(0, 0, width, height);
  if (portrait) shade.fillStyle(0x10132c, 0.86).fillRoundedRect(12, height * 0.49, width - 24, height * 0.49, 20);
  else shade.fillStyle(0x10132c, 0.86).fillRoundedRect(width * 0.57, height * 0.1, width * 0.4, height * 0.8, 22);

  const x = width * (portrait ? 0.62 : 0.37);
  const y = height * (portrait ? 0.26 : 0.37);
  const size = Math.min(width * (portrait ? 0.53 : 0.32), height * (portrait ? 0.31 : 0.58), 320);
  prepareEnergy(scene);
  const arrival: Phaser.GameObjects.Image[] = [];
  if (scene.textures.exists('void-dust')) {
    // Broad, diffuse light behind the instrument, swallowed by a dark core.
    arrival.push(scene.add.image(x, y, 'void-dust').setName('void-arrival-glow')
      .setTint(0x9456ff).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0));
    arrival.push(scene.add.image(x, y, 'void-dust').setName('void-arrival-shadow')
      .setTint(0x090717).setAlpha(0));
  }
  const veils: Phaser.GameObjects.Image[] = [];
  if (scene.textures.exists('void-veil')) {
    for (let i = 0; i < 4; i++) {
      veils.push(scene.add.image(x, y, 'void-veil').setName(`void-veil-${i}`)
        .setDisplaySize(size * 1.8, size * 0.65).setTint(i % 2 ? 0xbda0ff : 0x80e8e4)
        .setBlendMode(Phaser.BlendModes.ADD));
    }
  }
  const compass = scene.add.container(x, y).setAngle(-12).setName('void-compass');
  if (scene.textures.exists('preparation-compass_dial')) {
    compass.add(scene.add.image(0, 0, 'preparation-compass_dial').setDisplaySize(size, size));
  } else {
    compass.add(scene.add.graphics().fillStyle(0xba995d).fillCircle(0, 0, size / 2)
      .fillStyle(0xf8e6c6).fillCircle(0, 0, size * 0.43));
  }
  const needles: Phaser.GameObjects.Image[] = [];
  for (const [index, id] of ['teal', 'violet'].entries()) {
    const key = `preparation-needle_${id}`;
    if (!scene.textures.exists(key)) continue;
    const pivot = index === 0 ? 0.68 : 0.69;
    const needle = scene.add.image(0, 0, key).setOrigin(0.5, pivot).setAngle(index === 0 ? -35 : 85);
    needle.setScale(size * (index === 0 ? 0.30 : 0.27) / (needle.height * pivot));
    compass.add(needle);
    needles.push(needle);
  }
  compass.add(scene.add.graphics().fillStyle(0xf6d69c).fillCircle(0, 0, size * 0.026));
  const wisps: Phaser.GameObjects.Image[] = [];
  if (scene.textures.exists('void-veil')) {
    for (let i = 0; i < 2; i++) {
      wisps.push(scene.add.image(x, y, 'void-veil').setName(`void-wisp-${i}`)
        .setDisplaySize(size * 1.65, size * 0.34).setTint(i ? 0xc8a5ff : 0x88fff1)
        .setBlendMode(Phaser.BlendModes.ADD));
    }
  }
  // Small drifting lights also pass in front of the brass, like energy brushing it.
  const dust: Phaser.GameObjects.Image[] = [];
  if (scene.textures.exists('void-dust')) {
    for (let i = 0; i < 36; i++) {
      dust.push(scene.add.image(x, y, 'void-dust').setName(`void-dust-${i}`)
        .setTint(i % 3 === 0 ? 0xf6d9a0 : i % 2 ? 0xbda0ff : 0x9bf7ed)
        .setDisplaySize(i % 5 === 0 ? 11 : 5, i % 5 === 0 ? 11 : 5)
        .setBlendMode(Phaser.BlendModes.ADD));
    }
  }
  const reflection = scene.add.graphics().setName('void-reflection');
  const drawReflection = (t: number): void => {
    reflection.clear();
    // Open, soft highlights follow short portions of the rim; never a full ring.
    for (let layer = 6; layer > 0; layer--) {
      reflection.lineStyle(layer * 1.3, 0x98eee9, 0.025);
      reflection.beginPath();
      reflection.arc(compass.x, compass.y, size * 0.475,
        -1.25 + Math.sin(t * 0.4) * 0.15, -0.72 + Math.sin(t * 0.4) * 0.15);
      reflection.strokePath();
    }
  };
  // A newly started scene's clock is populated on its first update, after create().
  let start: number | undefined;
  const paint = (t: number): void => {
    const progress = animate && reveal ? Phaser.Math.Clamp(t / 1.6, 0, 1) : 1;
    const surge = progress < 1 ? Math.sin(progress * Math.PI) ** 2 : 0;
    const pull = (1 - progress) ** 3;
    arrival[0]?.setDisplaySize(size * (3.8 - progress * 1.6), size * (2.8 - progress))
      .setAlpha(surge * 0.85);
    arrival[1]?.setDisplaySize(size * (0.4 + progress * 2.5), size * (0.4 + progress * 2.2))
      .setAlpha(surge * 0.82);
    const breath = 0.5 + 0.5 * Math.sin(t * 0.8);
    compass.setPosition(x, y + Math.sin(t * 0.9) * 3);
    compass.setAngle(-12);
    needles.forEach((needle, index) => needle.setAngle((index === 0 ? -35 : 85)
      + Math.sin(t * (index === 0 ? 1.7 : -1.3)) * 5 + Math.sin(t * 19 + index) * 0.6
      + pull * (index === 0 ? 320 : -260)));
    veils.forEach((veil, i) => {
      veil.setPosition(x + Math.sin(t * 0.23 + i * 1.8) * size * 0.18,
        y + (i - 1.5) * size * 0.36 + Math.sin(t * 0.38 + i) * size * 0.10)
        .setAngle(-28 + i * 17 + Math.sin(t * 0.25 + i) * 8 + pull * (i % 2 ? -55 : 55))
        .setDisplaySize(size * (1.8 + surge * 0.8), size * (0.65 + surge * 0.24))
        .setAlpha(0.48 + 0.20 * Math.sin(t * 0.65 + i * 1.7) + surge * 0.3);
    });
    wisps.forEach((wisp, i) => wisp.setPosition(x + Math.sin(t * 0.3 + i * 2) * size * 0.16,
      y + (i ? -0.32 : 0.32) * size + Math.sin(t * 0.5 + i) * size * 0.12)
      .setAngle(i ? 23 + Math.sin(t * 0.35) * 9 : -19 + Math.cos(t * 0.3) * 8)
      .setAlpha(0.26 + Math.sin(t * 0.7 + i * 2) * 0.12 + surge * 0.48));
    dust.forEach((mote, i) => {
      const phase = (i * 0.6180339 + t * (0.028 + (i % 4) * 0.006)) % 1;
      const lane = Math.sin(i * 7.13);
      mote.setPosition(x + (phase - 0.5) * size * 1.5,
        y + lane * size * 0.62 - Math.sin(phase * Math.PI) * size * 0.22)
        .setAlpha(Math.sin(phase * Math.PI) ** 2 * (0.35 + 0.35 * Math.sin(t * 1.2 + i) ** 2));
      if (progress < 1) {
        const angle = i * 2.39996 + progress * 4.5;
        const radius = size * (0.12 + (i % 7) * 0.12) * (1 - progress * 0.85);
        const orbitX = x + Math.cos(angle) * radius;
        const orbitY = y + Math.sin(angle) * radius * 0.7;
        mote.setPosition(Phaser.Math.Linear(mote.x, orbitX, surge), Phaser.Math.Linear(mote.y, orbitY, surge))
          .setAlpha(Math.max(mote.alpha, surge * (i % 4 === 0 ? 1 : 0.75)))
          .setDisplaySize((i % 5 === 0 ? 11 : 5) * (1 + surge), (i % 5 === 0 ? 11 : 5) * (1 + surge));
      } else mote.setDisplaySize(i % 5 === 0 ? 11 : 5, i % 5 === 0 ? 11 : 5);
    });
    drawReflection(t);
    reflection.setAlpha(0.5 + breath * 0.5);
  };
  paint(0);
  if (!animate) {
    compass.setPosition(x, y).setAngle(-12);
    needles.forEach((needle, index) => needle.setAngle(index === 0 ? -35 : 85));
    return undefined;
  }
  const update = (): void => {
    start ??= scene.time.now;
    paint((scene.time.now - start) / 1000);
  };
  scene.events.on(Phaser.Scenes.Events.UPDATE, update);
  return () => {
    scene.events.off(Phaser.Scenes.Events.UPDATE, update);
    compass.setPosition(x, y).setAngle(-12);
    needles.forEach((needle, index) => needle.setAngle(index === 0 ? -35 : 85));
  };
}
