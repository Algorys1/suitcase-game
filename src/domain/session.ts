import { BALANCE, spendCharges } from './compass';
import { isElementId, isReady } from './preparation';
import type { Slots } from './preparation';
import { destinationById, resolveRecipe } from './recipes';

export type TripResult = {
  destinationId: string | null;
  cost: number;
  firstVisitInSession: boolean;
  isNewDiscovery: boolean;
};

export type SessionState = {
  charges: number;
  phase: 'preparation' | 'travelling' | 'result' | 'ended';
  visitedDestinationIds: readonly string[];
  newlyDiscoveredIds: readonly string[];
  voidTrips: number;
  lastTrip: TripResult | null;
};

export function createSession(): SessionState {
  return { charges: BALANCE.initialCharges, phase: 'preparation', visitedDestinationIds: [], newlyDiscoveredIds: [], voidTrips: 0, lastTrip: null };
}

/** Commit a trip once, before its visual transition. Further departures are locked. */
export function beginTravel(session: SessionState, slots: Slots, knownDestinationIds: readonly string[] = []): SessionState {
  const [first, second] = slots;
  if (session.phase !== 'preparation' || session.charges <= 0 || !isReady(slots)
    || !isElementId(first) || !isElementId(second)) return session;
  const destination = resolveRecipe(first, second);
  const cost = destination ? BALANCE.validDestinationCost : BALANCE.voidCost;
  const isNewDiscovery = destination !== null && !knownDestinationIds.includes(destination.id)
    && !session.newlyDiscoveredIds.includes(destination.id);
  return {
    charges: spendCharges(session.charges, cost),
    phase: 'travelling',
    visitedDestinationIds: destination ? [...session.visitedDestinationIds, destination.id] : session.visitedDestinationIds,
    newlyDiscoveredIds: isNewDiscovery ? [...session.newlyDiscoveredIds, destination.id] : session.newlyDiscoveredIds,
    voidTrips: session.voidTrips + (destination ? 0 : 1),
    lastTrip: {
      destinationId: destination?.id ?? null,
      cost,
      firstVisitInSession: destination !== null && !session.visitedDestinationIds.includes(destination.id),
      isNewDiscovery,
    },
  };
}

export function revealResult(session: SessionState): SessionState {
  return session.phase === 'travelling' ? { ...session, phase: 'result' } : session;
}

export function continueSession(session: SessionState): SessionState {
  if (session.phase !== 'result') return session;
  return { ...session, phase: session.charges === 0 ? 'ended' : 'preparation', lastTrip: null };
}

/** Recover a committed trip at its result, without resolving or charging it again. */
export function decodeSession(value: unknown): SessionState | null {
  if (typeof value !== 'object' || value === null) return null;
  const v = value as Record<string, unknown>;
  const ids = (input: unknown): input is string[] => Array.isArray(input)
    && input.length <= BALANCE.initialCharges
    && input.every(id => typeof id === 'string' && destinationById(id) !== undefined);
  if (!ids(v.visitedDestinationIds) || !ids(v.newlyDiscoveredIds)
    || new Set(v.newlyDiscoveredIds).size !== v.newlyDiscoveredIds.length
    || typeof v.voidTrips !== 'number' || !Number.isInteger(v.voidTrips) || v.voidTrips < 0
    || typeof v.charges !== 'number' || !Number.isInteger(v.charges)) return null;
  const visited = v.visitedDestinationIds;
  if (!v.newlyDiscoveredIds.every(id => visited.includes(id))) return null;
  const spent = v.visitedDestinationIds.length * BALANCE.validDestinationCost + v.voidTrips * BALANCE.voidCost;
  if (spent > BALANCE.initialCharges + BALANCE.voidCost - 1
    || v.charges !== spendCharges(BALANCE.initialCharges, spent)) return null;
  let lastTrip: TripResult | null = null;
  let phase: SessionState['phase'];
  if (v.phase === 'preparation' || v.phase === 'ended') {
    if (v.lastTrip !== null || (v.phase === 'preparation' ? v.charges <= 0 : v.charges !== 0)) return null;
    phase = v.phase;
  } else if (v.phase === 'result' || v.phase === 'travelling') {
    if (typeof v.lastTrip !== 'object' || v.lastTrip === null) return null;
    const trip = v.lastTrip as Record<string, unknown>;
    const id = trip.destinationId;
    if (id !== null && (typeof id !== 'string' || !destinationById(id))) return null;
    const isVoid = id === null;
    const cost = isVoid ? BALANCE.voidCost : BALANCE.validDestinationCost;
    if (trip.cost !== cost
      || typeof trip.firstVisitInSession !== 'boolean' || typeof trip.isNewDiscovery !== 'boolean'
      || (isVoid ? v.voidTrips === 0 || trip.firstVisitInSession || trip.isNewDiscovery
        : v.visitedDestinationIds.at(-1) !== id
          || trip.firstVisitInSession !== (v.visitedDestinationIds.filter(visited => visited === id).length === 1)
          || trip.isNewDiscovery && (!trip.firstVisitInSession || !v.newlyDiscoveredIds.includes(id)))
      || spent - cost >= BALANCE.initialCharges) return null;
    lastTrip = { destinationId: id, cost, firstVisitInSession: trip.firstVisitInSession,
      isNewDiscovery: trip.isNewDiscovery };
    phase = 'result';
  } else return null;
  return { charges: v.charges, phase, visitedDestinationIds: [...v.visitedDestinationIds],
    newlyDiscoveredIds: [...v.newlyDiscoveredIds], voidTrips: v.voidTrips, lastTrip };
}
