/**
 * Deterministic PRNG — doc 04 §2.
 *
 * mulberry32: 32-bit, tiny, fast, good enough for this domain.
 * xmur3: string hash used to derive seeds.
 * split(seed, label): derive an independent child seed so subsystems (question
 * order, operand choice, …) draw from separate streams while staying reproducible.
 *
 * Determinism contract: identical inputs ⇒ identical output sequence, forever.
 */

/** A pseudo-random number generator yielding floats in [0, 1). */
export type Rng = () => number;

/** xmur3 string hash → a function producing successive 32-bit unsigned hashes. */
export function xmur3(str: string): () => number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

/** mulberry32 PRNG seeded by a 32-bit integer. */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Derive an independent child seed from a parent seed and a label.
 * `split(s, 'order')` and `split(s, 'operands')` produce unrelated streams.
 */
export function split(seed: number, label: string): number {
  return xmur3(`${seed >>> 0}:${label}`)() >>> 0;
}

/** Hash an arbitrary string to a 32-bit unsigned seed (e.g. daily-challenge seed). */
export function seedFromString(str: string): number {
  return xmur3(str)() >>> 0;
}

/** A convenience: an Rng seeded by `split(seed, label)`. */
export function childRng(seed: number, label: string): Rng {
  return mulberry32(split(seed, label));
}

/** Random 32-bit seed for ad-hoc (non-deterministic) sessions. */
export function randomSeed(): number {
  return (Math.random() * 0x100000000) >>> 0;
}

/** Inclusive integer in [min, max]. */
export function intInRange(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

/** Pick a uniformly-random element. */
export function pick<T>(rng: Rng, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)] as T;
}

/**
 * Weighted index draw. `weights` need not be normalized; all must be ≥ 0 and at
 * least one > 0. Returns an index in [0, weights.length).
 */
export function weightedIndex(rng: Rng, weights: readonly number[]): number {
  let total = 0;
  for (const w of weights) total += w;
  let r = rng() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i] as number;
    if (r < 0) return i;
  }
  return weights.length - 1;
}
