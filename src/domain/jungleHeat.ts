export const lanternFruit = { x: 0.214, y: 0.566, rx: 0.105, ry: 0.13 } as const;
export const heatSources = [
  { x: 0.061, y: 0.488, width: 0.115, height: 0.38, color: 0xffac58 },
  { x: 0.902, y: 0.795, width: 0.17, height: 0.20, color: 0xffcf72 },
] as const;

export function overLanternFruit(x: number, y: number): boolean {
  return ((x - lanternFruit.x) / lanternFruit.rx) ** 2 + ((y - lanternFruit.y) / lanternFruit.ry) ** 2 <= 1;
}
