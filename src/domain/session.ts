import { BALANCE, spendCharges } from './compass';
import { isElementId, isReady } from './preparation';
import type { Slots } from './preparation';
import { resolveRecipe } from './recipes';

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
