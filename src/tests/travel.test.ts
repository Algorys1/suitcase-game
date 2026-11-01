import { describe, expect, it } from 'vitest';
import catalogue from '../data/destinations.json';
import elements from '../data/elements.json';
import fr from '../data/fr.json';
import en from '../data/en.json';
import { destinations, resolveRecipe } from '../domain/recipes';
import { BALANCE } from '../domain/compass';
import { beginTravel, continueSession, createSession, revealResult } from '../domain/session';
import type { SessionState } from '../domain/session';

const finishTrip = (session: SessionState): SessionState => continueSession(revealResult(session));

describe('résolution des recettes', () => {
  it('résout les 30 recettes fournies de façon identique dans les deux ordres', () => {
    for (const { id, elements: pair } of catalogue) {
      const [first, second] = pair;
      if (!first || !second) throw new Error('Incomplete catalogue pair');
      expect(resolveRecipe(first, second)?.id).toBe(id);
      expect(resolveRecipe(second, first)?.id).toBe(id);
      expect(resolveRecipe(first, second)).toBe(resolveRecipe(second, first));
    }
  });

  it('trouve exactement 30 destinations et 15 Néants parmi les 45 paires', () => {
    let valid = 0;
    let voids = 0;
    for (const [index, first] of elements.entries()) {
      for (const second of elements.slice(index + 1)) {
        const result = resolveRecipe(first.id, second.id);
        expect(result).toBe(resolveRecipe(second.id, first.id));
        if (result) valid++; else voids++;
      }
    }
    expect(valid).toBe(30);
    expect(voids).toBe(15);
    expect(resolveRecipe('tree', 'water')).toBeNull();
  });

  it('fournit les titres et textes provisoires aux clés du catalogue en FR et EN', () => {
    const french: Record<string, { title: string; story: string }> = fr.destinations;
    const english: typeof french = en.destinations;
    expect(Object.keys(french).sort()).toEqual(destinations.map(({ id }) => id).sort());
    expect(Object.keys(english).sort()).toEqual(Object.keys(french).sort());
    for (const destination of destinations) {
      expect(destination.titleKey).toBe(`destinations.${destination.id}.title`);
      expect(destination.storyKey).toBe(`destinations.${destination.id}.story`);
      expect(french[destination.id]?.title).toBeTruthy();
      expect(french[destination.id]?.story).toContain('provisoire');
      expect(english[destination.id]?.title).toContain('pending translation');
    }
    expect(french.archipel_azur?.title).toBe("L'Archipel d'Azur");
    expect(french.coeur_de_braise?.title).toBe('Le Cœur de braise');
  });
});

describe('charges et session', () => {
  it('commence avec 10 charges et aucun lieu visité', () => {
    expect(createSession()).toEqual({ charges: 10, phase: 'preparation', visitedDestinationIds: [], newlyDiscoveredIds: [], voidTrips: 0, lastTrip: null });
    expect(BALANCE).toEqual({ initialCharges: 10, validDestinationCost: 1, voidCost: 2 });
  });

  it('débit de 1 pour une destination, sans mutation, verrouillage des doubles départs', () => {
    const initial = Object.freeze(createSession());
    const travelling = beginTravel(initial, ['water', 'palm']);
    expect(travelling.charges).toBe(9);
    expect(travelling.lastTrip).toEqual({ destinationId: 'archipel_azur', cost: 1, firstVisitInSession: true, isNewDiscovery: true });
    expect(travelling.phase).toBe('travelling');
    expect(initial.charges).toBe(10);
    expect(initial.visitedDestinationIds).toEqual([]);
    expect(beginTravel(travelling, ['water', 'palm'])).toBe(travelling);
    const result = revealResult(travelling);
    expect(revealResult(result)).toBe(result);
    expect(beginTravel(result, ['water', 'palm'])).toBe(result);
    expect(continueSession(travelling)).toBe(travelling);
  });

  it('débit de 2 pour le Néant, qui ne devient jamais une destination visitée', () => {
    const travelling = beginTravel(createSession(), ['tree', 'water']);
    expect(travelling.charges).toBe(8);
    expect(travelling.voidTrips).toBe(1);
    expect(travelling.visitedDestinationIds).toEqual([]);
    expect(travelling.lastTrip).toEqual({ destinationId: null, cost: 2, firstVisitInSession: false, isNewDiscovery: false });
  });

  it('une revisite valide coûte toujours 1 et garde un seul ID unique dans le bilan', () => {
    const first = finishTrip(beginTravel(createSession(), ['water', 'palm']));
    const second = beginTravel(first, ['palm', 'water']);
    expect(second.charges).toBe(8);
    expect(second.lastTrip?.firstVisitInSession).toBe(false);
    expect(second.visitedDestinationIds).toEqual(['archipel_azur', 'archipel_azur']);
    expect(new Set(second.visitedDestinationIds).size).toBe(1);
    expect(second.newlyDiscoveredIds).toEqual(['archipel_azur']);
    expect(second.lastTrip?.isNewDiscovery).toBe(false);
  });

  it('un lieu connu reste valide dans une nouvelle session sans nouvelle découverte', () => {
    const travelling = beginTravel(createSession(), ['water', 'palm'], ['archipel_azur']);
    expect(travelling.charges).toBe(9);
    expect(travelling.lastTrip?.firstVisitInSession).toBe(true);
    expect(travelling.lastTrip?.isNewDiscovery).toBe(false);
    expect(travelling.newlyDiscoveredIds).toEqual([]);
    expect(travelling.visitedDestinationIds).toEqual(['archipel_azur']);
  });

  it('bloque les sélections incomplètes, les doublons et les départs à zéro', () => {
    const session = createSession();
    expect(beginTravel(session, [null, null])).toBe(session);
    expect(beginTravel(session, ['water', null])).toBe(session);
    expect(beginTravel(session, ['water', 'water'])).toBe(session);
    const exhausted: SessionState = { ...session, charges: 0 };
    expect(beginTravel(exhausted, ['water', 'palm'])).toBe(exhausted);
  });

  it('borne à zéro lorsqu’il reste une charge avant le Néant puis termine après le résultat', () => {
    const nearEnd: SessionState = { ...createSession(), charges: 1 };
    const travelling = beginTravel(nearEnd, ['tree', 'water']);
    expect(travelling.charges).toBe(0);
    expect(travelling.phase).toBe('travelling');
    expect(revealResult(travelling).phase).toBe('result');
    const ended = finishTrip(travelling);
    expect(ended.phase).toBe('ended');
    expect(beginTravel(ended, ['water', 'palm'])).toBe(ended);
    expect(continueSession(ended)).toBe(ended);
  });

  it('termine à zéro après dix destinations ou cinq Néants et permet une nouvelle session indépendante', () => {
    for (const pair of [['water', 'palm'], ['tree', 'water']] as const) {
      let session = createSession();
      let trips = 0;
      while (session.phase !== 'ended') {
        session = finishTrip(beginTravel(session, pair));
        expect(session.charges).toBeGreaterThanOrEqual(0);
        trips++;
        expect(trips).toBeLessThanOrEqual(10);
      }
      expect(trips).toBe(pair[0] === 'water' ? 10 : 5);
      expect(session.charges).toBe(0);
      expect(createSession().charges).toBe(10);
      expect(createSession().visitedDestinationIds).toEqual([]);
    }
  });
});
