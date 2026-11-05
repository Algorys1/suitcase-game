export const pilotTargetCounts = { cimes_eternelles: 3, mycelia: 5, archipel_azur: 6 } as const;
export const pilotTargets = {
  archipel_azur: [
    { x: 0.272, y: 0.433 }, { x: 0.372, y: 0.380 }, { x: 0.288, y: 0.588 },
    { x: 0.718, y: 0.737 }, { x: 0.942, y: 0.423 }, { x: 0.662, y: 0.912 },
  ],
  cimes_eternelles: [{ x: 0.575, y: 0.178 }, { x: 0.345, y: 0.35 }, { x: 0.895, y: 0.37 }],
  mycelia: [
    { x: 0.225, y: 0.575, width: 0.058, height: 0.079 },
    { x: 0.457, y: 0.625, width: 0.054, height: 0.10 },
    { x: 0.61, y: 0.445, width: 0.09, height: 0.095 },
    { x: 0.725, y: 0.64, width: 0.057, height: 0.085 },
    { x: 0.865, y: 0.60, width: 0.052, height: 0.071 },
  ],
} as const;
export type PilotId = keyof typeof pilotTargetCounts;
export type PilotSteps = Partial<Record<PilotId, number[]>>;

export function isPilot(id: string): id is PilotId {
  return Object.hasOwn(pilotTargetCounts, id);
}

export function validSteps(id: PilotId, value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((index: unknown): index is number => typeof index === 'number'
    && Number.isInteger(index) && index >= 0 && index < pilotTargetCounts[id]))].sort((a, b) => a - b);
}

export function explorationComplete(id: PilotId, steps: readonly number[]): boolean {
  return validSteps(id, steps).length === pilotTargetCounts[id];
}

export function activateTarget(id: PilotId, steps: readonly number[], index: number): number[] {
  return validSteps(id, [...steps, index]);
}
