export type MapRect = { x: number; y: number; width: number; height: number };

export function intersects(a: MapRect, b: MapRect, gap = 1): boolean {
  return a.x < b.x + b.width + gap && a.x + a.width + gap > b.x
    && a.y < b.y + b.height + gap && a.y + a.height + gap > b.y;
}

/** Find nearby blank paper, reserving both the illustrations and earlier captions. */
export function placeMapLabel(preferred: MapRect, bounds: MapRect, occupied: readonly MapRect[]): MapRect | undefined {
  const check = (x: number, y: number): MapRect | undefined => {
    const candidate = { ...preferred, x: preferred.x + x, y: preferred.y + y };
    if (candidate.x < bounds.x || candidate.y < bounds.y
      || candidate.x + candidate.width > bounds.x + bounds.width
      || candidate.y + candidate.height > bounds.y + bounds.height) return undefined;
    if (!occupied.some(rect => intersects(candidate, rect))) return candidate;
    return undefined;
  };
  const original = check(0, 0);
  if (original) return original;
  for (let radius = 4; radius <= Math.max(bounds.width, bounds.height); radius += 4) {
    for (let x = -radius; x <= radius; x += 4) {
      const bottom = check(x, radius), top = check(x, -radius);
      if (bottom || top) return bottom ?? top;
    }
    for (let y = -radius + 4; y < radius; y += 4) {
      const left = check(-radius, y), right = check(radius, y);
      if (left || right) return left ?? right;
    }
  }
  return undefined;
}
