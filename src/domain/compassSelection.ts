import catalogue from '../data/elements.json';
import { isElementId, selectElement } from './preparation';
import type { ElementId, SlotIndex, Slots } from './preparation';

// The catalogue order is also the clockwise order, starting at twelve o'clock.
export const compassElements: readonly ElementId[] = catalogue.map(({ id }) => {
  if (!isElementId(id)) throw new Error(`Invalid compass element: ${id}`);
  return id;
});
export const COMPASS_STEP_DEGREES = 360 / compassElements.length;

export function initialCompassSelection(): Slots {
  const first = compassElements[0];
  if (!first) throw new Error('The compass requires elements');
  // Deliberately invalid until the player chooses two different elements.
  return [first, first];
}

export function compassAngle(element: ElementId): number {
  return compassElements.indexOf(element) * COMPASS_STEP_DEGREES;
}

/** Clockwise degrees from north, snapped to the nearest catalogue symbol. */
export function elementAtAngle(degrees: number): ElementId | null {
  if (!Number.isFinite(degrees)) return null;
  const normalized = ((degrees % 360) + 360) % 360;
  return compassElements[Math.round(normalized / COMPASS_STEP_DEGREES) % compassElements.length] ?? null;
}

export function rotateSelection(slots: Slots, needle: SlotIndex, direction: -1 | 1): Slots {
  const current = slots[needle];
  const index = current === null ? -1 : compassElements.indexOf(current);
  const next = index < 0 ? (direction === 1 ? 0 : compassElements.length - 1)
    : (index + direction + compassElements.length) % compassElements.length;
  const element = compassElements[next];
  if (!element) throw new Error('Invalid compass position');
  return selectElement(slots, needle, element);
}
