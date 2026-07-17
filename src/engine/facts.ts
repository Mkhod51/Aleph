/**
 * Fact canonicalization — doc 04 §8.
 * `factKey` identifies the recallable fact under a question so per-fact stats
 * accumulate across question forms (feeds the weakness engine, doc 03 §6).
 */

/**
 * Multiplication/division/missing-mul share a key `mul:min×max` of the core pair,
 * but only when BOTH operands ≤ 20 (beyond that it is technique, not recall).
 * Otherwise the question is not a trackable fact → null.
 */
export function mulFactKey(a: number, b: number): string | null {
  if (a > 20 || b > 20) return null;
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  return `mul:${lo}×${hi}`;
}

/** Squares: `sq:n`. */
export function squareFactKey(n: number): string {
  return `sq:${n}`;
}

/** Powers of two: `pow2:n`. */
export function pow2FactKey(n: number): string {
  return `pow2:${n}`;
}

/** Fraction conversions: `frac:n/d` (lowest terms). */
export function fracFactKey(num: number, den: number): string {
  return `frac:${num}/${den}`;
}
