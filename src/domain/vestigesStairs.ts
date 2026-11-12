export const stairTiles = [
  { x: 0.115, y: 0.875, width: 0.115, angle: -11 },
  { x: 0.320, y: 0.955, width: 0.120, angle: 8 },
  { x: 0.400, y: 0.860, width: 0.105, angle: -5 },
] as const;

export const stairFrontiers = [
  { x: 0.355, y: 0.704 }, { x: 0.545, y: 0.610 }, { x: 0.660, y: 0.485 },
] as const;

// Each band follows the painted stair risers, not an axis-aligned crop through a tread.
export const stairFlights = [
  // Include the complete foot and its risers so the overlay cannot erase the lower steps.
  { near: 0.900, far: 0.500, bounds: { left: 0.10, top: 0.53, width: 0.61, height: 0.38 } },
  { near: 0.500, far: 0.355, bounds: { left: 0.39, top: 0.39, width: 0.43, height: 0.30 } },
  { near: 0.355, far: 0.215, bounds: { left: 0.54, top: 0.31, width: 0.36, height: 0.29 } },
] as const;

export const stairOutline = [
  [0.10, 0.67], [0.27, 0.64], [0.70, 0.35], [0.89, 0.38], [0.84, 0.52],
  [0.68, 0.70], [0.60, 0.80], [0.54, 0.89], [0.20, 0.90], [0.10, 0.86],
] as const;

export function stairFrontier(placed: number) {
  return stairFrontiers[Math.max(0, Math.min(2, placed))]!;
}

export function overStairFrontier(point: { x: number; y: number }, placed: number,
  rx = 0.075, ry = 0.06): boolean {
  if (!Number.isInteger(placed) || placed < 0 || placed >= stairTiles.length || rx <= 0 || ry <= 0) return false;
  const goal = stairFrontier(placed);
  return ((point.x - goal.x) / rx) ** 2 + ((point.y - goal.y) / ry) ** 2 <= 1;
}
