export const activityIds = ['archipel_azur', 'sylve_prismatique', 'faille_des_contraires'] as const;
export type ActivityId = typeof activityIds[number];
export type ActivityState = { moved: number[]; orientation: number };
export type ActivityProgress = Partial<Record<ActivityId, ActivityState>>;
export type ActivityAction = { type: 'move' | 'join'; index: number } | { type: 'rotate'; direction: 1 | -1 };

export function hasActivity(id: string): id is ActivityId {
  return activityIds.some(entry => entry === id);
}

export function decodeActivity(id: ActivityId, value: unknown): ActivityState {
  const state = typeof value === 'object' && value !== null ? value as Record<string, unknown> : {};
  const orientation = id === 'sylve_prismatique' && typeof state.orientation === 'number'
    && Number.isInteger(state.orientation) && state.orientation >= 0 && state.orientation < 6 ? state.orientation : 0;
  const moved = id !== 'sylve_prismatique' && Array.isArray(state.moved)
    ? [...new Set(state.moved.filter((n: unknown): n is number => n === 0 || n === 1))].sort() : [];
  return { moved, orientation };
}

export function activityComplete(id: ActivityId, state: ActivityState): boolean {
  const valid = decodeActivity(id, state);
  return id === 'sylve_prismatique' ? valid.orientation === 3 : valid.moved.length === 2;
}

export function completedActivity(id: ActivityId): ActivityState {
  return id === 'sylve_prismatique' ? { moved: [], orientation: 3 } : { moved: [0, 1], orientation: 0 };
}

/** Only fulfilled gestures change progress; rotating has no timer or failed-attempt cost. */
export function actOnWorld(id: ActivityId, state: ActivityState, action: ActivityAction): ActivityState {
  const before = decodeActivity(id, state);
  if (activityComplete(id, before)) return before;
  if (id === 'sylve_prismatique') {
    if (action.type !== 'rotate' || ![1, -1].includes(action.direction)) return before;
    return { moved: [], orientation: (before.orientation + action.direction + 6) % 6 };
  }
  if (action.type !== (id === 'archipel_azur' ? 'move' : 'join') || !('index' in action)
    || (action.index !== 0 && action.index !== 1)) return before;
  return { ...before, moved: [...new Set([...before.moved, action.index])].sort() };
}
