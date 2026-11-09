export type SanctuaryPuzzle = { positions: [number, number, number]; clueSeen: boolean };
export const sanctuarySolution = [0, 2, 1] as const;
export const sanctuaryMushrooms = [
  { x: 0.080, y: 0.752 }, { x: 0.370, y: 0.523 }, { x: 0.950, y: 0.630 },
] as const;

export function initialSanctuaryPuzzle(earned = false): SanctuaryPuzzle {
  return { positions: earned ? [...sanctuarySolution] : [2, 0, 3], clueSeen: earned };
}

export function decodeSanctuaryPuzzle(value: unknown): SanctuaryPuzzle | undefined {
  if (typeof value !== 'object' || value === null || !('positions' in value)) return undefined;
  const positions = value.positions;
  if (!Array.isArray(positions) || positions.length !== 3
    || ![0, 1, 2].every(i => { const p = positions[i];
      return typeof p === 'number' && Number.isInteger(p) && p >= 0 && p < 4; })
    || !('clueSeen' in value) || typeof value.clueSeen !== 'boolean') return undefined;
  return { positions: [positions[0], positions[1], positions[2]], clueSeen: value.clueSeen };
}

export function sanctuaryAligned(puzzle: SanctuaryPuzzle): boolean {
  return puzzle.positions.every((position, index) => position === sanctuarySolution[index]);
}

export function turnSanctuary(puzzle: SanctuaryPuzzle, index: number): SanctuaryPuzzle {
  const next: SanctuaryPuzzle = { positions: [...puzzle.positions], clueSeen: puzzle.clueSeen };
  if (Number.isInteger(index) && index >= 0 && index < 3) next.positions[index] = (next.positions[index]! + 1) % 4;
  return next;
}
