import elements from '../data/elements.json';

export type ElementId =
  | 'tree' | 'mushroom' | 'water' | 'fire' | 'rock'
  | 'palm' | 'snow' | 'cloud' | 'ruins' | 'crystal';
export type SlotIndex = 0 | 1;
export type Slots = readonly [ElementId | null, ElementId | null];

export function isElementId(value: unknown): value is ElementId {
  return typeof value === 'string' && elements.some(({ id }) => id === value);
}

export function emptySlots(): Slots {
  return [null, null];
}

type Placement =
  | { ok: true; slots: Slots }
  | { ok: false; reason: 'duplicate' | 'unknown'; slots: Slots };

export function placeElement(slots: Slots, index: SlotIndex, element: string): Placement {
  if (!isElementId(element)) return { ok: false, reason: 'unknown', slots };
  if (slots[index === 0 ? 1 : 0] === element) {
    return { ok: false, reason: 'duplicate', slots };
  }
  const next: [ElementId | null, ElementId | null] = [...slots];
  next[index] = element;
  return { ok: true, slots: next };
}

export function removeElement(slots: Slots, index: SlotIndex): Slots {
  const next: [ElementId | null, ElementId | null] = [...slots];
  next[index] = null;
  return next;
}

export function isReady(slots: Slots): boolean {
  return isElementId(slots[0]) && isElementId(slots[1]) && slots[0] !== slots[1];
}
