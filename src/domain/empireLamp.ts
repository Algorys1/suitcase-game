export interface LampPoint { x: number; y: number }
export interface LampRub { distance: number; turns: number; leg: number; dx: number; dy: number }
export const lampBody = { x: 0.839, y: 0.756, rx: 0.067, ry: 0.045 } as const;
export const freshLampRub = (): LampRub => ({ distance: 0, turns: 0, leg: 0, dx: 0, dy: 0 });
export function inLamp(point: LampPoint): boolean {
  return ((point.x - lampBody.x) / lampBody.rx) ** 2 + ((point.y - lampBody.y) / lampBody.ry) ** 2 <= 1;
}
export function rubLamp(state: LampRub, from: LampPoint, to: LampPoint): LampRub {
  const dx = to.x - from.x, dy = to.y - from.y, length = Math.hypot(dx, dy);
  if (!inLamp(from) || !inLamp(to) || length < 0.001 || length > 0.065) return state;
  const turn = state.leg >= 0.025 && dx * state.dx + dy * state.dy < 0;
  return { distance: state.distance + length, turns: state.turns + Number(turn),
    leg: turn ? length : state.leg + length, dx, dy };
}
export const lampRubComplete = (state: LampRub): boolean => state.distance >= 0.30 && state.turns >= 2;
