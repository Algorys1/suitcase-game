export type StormPoint = { x: number; y: number };
export const stormMouth = { x: 0.727, y: 0.551 };
export const stormRest = { x: 0.727, y: 0.455 };
const skyPath = [{ x: 0.39, y: 0.31 }, { x: 0.44, y: 0.273 },
  { x: 0.50, y: 0.287 }, { x: 0.55, y: 0.323 }, { x: 0.58, y: 0.37 }, { x: 0.65, y: 0.402 }];

/** Distance to the painted sky branch, in image coordinates; no timed target. */
export function nearStormLightning(point: StormPoint, rx = 0.075, ry = 0.075): boolean {
  if (![point.x, point.y, rx, ry].every(Number.isFinite) || rx <= 0 || ry <= 0) return false;
  return skyPath.slice(1).some((b, i) => {
    const a = skyPath[i]!;
    const dx = (b.x - a.x) / rx, dy = (b.y - a.y) / ry;
    const px = (point.x - a.x) / rx, py = (point.y - a.y) / ry;
    const t = Math.max(0, Math.min(1, (px * dx + py * dy) / (dx * dx + dy * dy)));
    return Math.hypot(px - t * dx, py - t * dy) <= 1;
  });
}

export function nearStormMouth(point: StormPoint, rx = 0.085, ry = 0.07): boolean {
  return [point.x, point.y, rx, ry].every(Number.isFinite) && rx > 0 && ry > 0
    && Math.hypot((point.x - stormMouth.x) / rx, (point.y - stormMouth.y) / ry) <= 1;
}
