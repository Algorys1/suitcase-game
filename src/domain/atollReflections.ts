export const atollReflections = [{ x: 0.374, y: 0.445 }, { x: 0.491, y: 0.455 }] as const;
export const atollBracelet = { x: 0.658, y: 0.744 };

/** A generous, common target for both colours, without an order or a hidden pairing. */
export function overAtollBracelet(point: { x: number; y: number }, rx = 0.20, ry = 0.14): boolean {
  return [point.x, point.y, rx, ry].every(Number.isFinite) && rx > 0 && ry > 0
    && Math.hypot((point.x - atollBracelet.x) / rx, (point.y - atollBracelet.y) / ry) <= 1;
}
