export const gemRoute = [
  { source: { x: 0.813, y: 0.087, width: 0.13, height: 0.17 }, target: { x: 0.166, y: 0.287, rx: 0.145, ry: 0.105 } },
  { source: { x: 0.166, y: 0.287, width: 0.27, height: 0.20 }, target: { x: 0.925, y: 0.579, rx: 0.077, ry: 0.115 } },
] as const;

export function overGemTarget(index: number, x: number, y: number): boolean {
  const target = gemRoute[index as 0 | 1]?.target;
  return !!target && ((x - target.x) / target.rx) ** 2 + ((y - target.y) / target.ry) ** 2 <= 1;
}
