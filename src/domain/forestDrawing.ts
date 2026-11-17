export type SnowPoint = { x: number; y: number };

// A generous boundary around the snowy path, excluding stump, rocks and trees.
const path: readonly SnowPoint[] = [
  { x: 0.74, y: 0.56 }, { x: 0.77, y: 0.59 }, { x: 0.73, y: 0.64 },
  { x: 0.65, y: 0.69 }, { x: 0.60, y: 0.72 }, { x: 0.65, y: 0.76 },
  { x: 0.77, y: 0.82 }, { x: 0.82, y: 0.87 }, { x: 0.79, y: 0.92 },
  { x: 0.73, y: 1 }, { x: 0.60, y: 1 }, { x: 0.66, y: 0.91 },
  { x: 0.67, y: 0.87 }, { x: 0.61, y: 0.83 }, { x: 0.52, y: 0.78 },
  { x: 0.48, y: 0.72 }, { x: 0.52, y: 0.68 }, { x: 0.63, y: 0.63 },
  { x: 0.69, y: 0.59 },
];

// Provisional: three short free strokes; no shape, order or timing requirement.
export const FOREST_STROKE_LENGTH = 0.06;

export function inForestSnow(point: SnowPoint): boolean {
  if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) return false;
  let inside = false;
  for (let i = 0, j = path.length - 1; i < path.length; j = i++) {
    const a = path[i]!, b = path[j]!;
    if ((a.y > point.y) !== (b.y > point.y)
      && point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}

/** Never bridge a tree or bank when a fast gesture crosses outside the snow. */
export function snowSegmentLength(from: SnowPoint, to: SnowPoint): number {
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    if (!inForestSnow({ x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t })) return 0;
  }
  return Math.hypot(to.x - from.x, to.y - from.y);
}
