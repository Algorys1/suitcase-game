export const riftRoute = [
  { source: { x: 0.84, y: 0.56, width: 0.23, height: 0.12 }, target: { x: 0.18, y: 0.54, rx: 0.10, ry: 0.07 } },
  { source: { x: 0.18, y: 0.54, width: 0.18, height: 0.10 }, target: { x: 0.485, y: 0.469, rx: 0.115, ry: 0.08 } },
] as const;
export function overRiftTarget(index: number, x: number, y: number): boolean {
  const target = riftRoute[index as 0 | 1]?.target;
  return !!target && ((x - target.x) / target.rx) ** 2 + ((y - target.y) / target.ry) ** 2 <= 1;
}
