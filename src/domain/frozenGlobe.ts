export const globe = { x: 0.242, y: 0.661, rx: 0.092, ry: 0.113 } as const;
export const globeSources = [
  { x: 0.72, y: 0.88, width: 0.27, height: 0.16, color: 0xfff3e5 },
  { x: 0.72, y: 0.34, width: 0.32, height: 0.30, color: 0x9ae4e4 },
  { x: 0.41, y: 0.13, width: 0.25, height: 0.20, color: 0xffdb95 },
] as const;

export function overGlobe(x: number, y: number): boolean {
  return ((x - globe.x) / (globe.rx + 0.015)) ** 2 + ((y - globe.y) / (globe.ry + 0.018)) ** 2 <= 1;
}
