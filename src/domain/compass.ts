/** Prototype balance, to be adjusted after playtests. */
export const BALANCE = {
  initialCharges: 10,
  validDestinationCost: 1,
  voidCost: 2,
} as const;

export function spendCharges(charges: number, cost: number): number {
  return Math.max(0, charges - cost);
}
