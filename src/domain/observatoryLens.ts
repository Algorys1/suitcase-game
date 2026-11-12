export const lensStand = { x: 0.204, y: 0.694, rx: 0.065, ry: 0.085 } as const;
export const lensSky = { x: 0.338, y: 0.141, rx: 0.14, ry: 0.13 } as const;
export function lensProximity(x: number, y: number): number {
  const distance = Math.hypot((x - lensSky.x) / lensSky.rx, (y - lensSky.y) / lensSky.ry);
  if (!Number.isFinite(distance)) return 0;
  const t = Math.max(0, Math.min(1, 1.3 - distance));
  return t * t * (3 - 2 * t);
}
export function canCaptureSky(x: number, y: number): boolean {
  return Math.hypot((x - lensSky.x) / lensSky.rx, (y - lensSky.y) / lensSky.ry) <= 0.5;
}
export function overLensStand(x: number, y: number): boolean {
  return ((x - lensStand.x) / lensStand.rx) ** 2 + ((y - lensStand.y) / lensStand.ry) ** 2 <= 1;
}
