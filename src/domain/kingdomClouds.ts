export const kingdomLedges = [
  { x: 0.448, y: 0.330 }, { x: 0.514, y: 0.523 }, { x: 0.319, y: 0.782 },
] as const;

/** All loose clouds can water any dry ledge; no hidden cloud/colour pairing. */
export function findKingdomLedge(point: { x: number; y: number }, watered: readonly number[],
  toleranceX = 0.09, toleranceY = 0.075): number {
  if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) return -1;
  let best = -1, distance = Infinity;
  kingdomLedges.forEach((ledge, index) => {
    if (watered.includes(index)) return;
    const dx = Math.abs(point.x - ledge.x), dy = Math.abs(point.y - ledge.y);
    if (dx > toleranceX || dy > toleranceY) return;
    const d = (dx / toleranceX) ** 2 + (dy / toleranceY) ** 2;
    if (d < distance) { best = index; distance = d; }
  });
  return best;
}
