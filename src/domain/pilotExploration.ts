export const pilotTargetCounts = { cimes_eternelles: 3, mycelia: 5, archipel_azur: 6, ruines_englouties: 2, coeur_de_braise: 3, iles_suspendues: 5, marais_des_lucioles: 3, desert_de_cristal: 6, palais_de_givre: 3, temple_oublie: 3, ile_des_cendres: 3 } as const;
export const pilotTargets = {
  ile_des_cendres: [{ x: 0.195, y: 0.34 }],
  temple_oublie: [{ x: 0.779, y: 0.572 }, { x: 0.497, y: 0.584 }, { x: 0.645, y: 0.285 }],
  palais_de_givre: [{ x: 0.075, y: 0.205 }, { x: 0.25, y: 0.12 }, { x: 0.445, y: 0.045 }],
  desert_de_cristal: [{ x: 0.116, y: 0.335 }, { x: 0.336, y: 0.433 },
    { x: 0.931, y: 0.357 }, { x: 0.936, y: 0.565 },
    { x: 0.829, y: 0.859 }, { x: 0.164, y: 0.643 }],
  marais_des_lucioles: [{ x: 0.373, y: 0.626 }, { x: 0.465, y: 0.698 }, { x: 0.525, y: 0.738 }],
  iles_suspendues: [{ x: 0.42, y: 0.465 }, { x: 0.485, y: 0.48 }, { x: 0.555, y: 0.485 },
    { x: 0.625, y: 0.48 }, { x: 0.695, y: 0.465 }],
  coeur_de_braise: [{ x: 0.105, y: 0.575 }, { x: 0.184, y: 0.70 }, { x: 0.27, y: 0.765 }],
  ruines_englouties: [{ x: 0.381, y: 0.274 }, { x: 0.872, y: 0.183 }],
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
  const steps = [...new Set(value.filter((index: unknown): index is number => typeof index === 'number'
    && Number.isInteger(index) && index >= 0 && index < pilotTargetCounts[id]))];
  if (id === 'ile_des_cendres') {
    // These are successive presses on one volcano, rather than independent targets.
    let count = 0;
    while (steps.includes(count)) count++;
    return Array.from({ length: count }, (_, index) => index);
  }
  // The desert beams follow the player's actual order, including after reload.
  return id === 'desert_de_cristal' ? steps : steps.sort((a, b) => a - b);
}

export function explorationComplete(id: PilotId, steps: readonly number[]): boolean {
  return validSteps(id, steps).length === pilotTargetCounts[id];
}

export function activateTarget(id: PilotId, steps: readonly number[], index: number): number[] {
  return validSteps(id, [...steps, index]);
}
