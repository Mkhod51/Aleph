/**
 * Static difficulty model — doc 04 §7.
 *
 * base = digit count of operands + answer; +1 per carry/borrow in the natural
 * execution; +1 if any operand is "unround" (not ending in 0/5); +2 for a 2×2
 * multiplication with both operands unround; +1 per dp of decimals. Range ~1–12.
 *
 * The four zetamac generators (M0) cover +/−/×/÷; decimal and fraction terms are
 * added as those generators arrive (M3). Values are clamped to [1, 12].
 */

const MIN_DIFFICULTY = 1;
const MAX_DIFFICULTY = 12;

function clamp(n: number): number {
  return Math.max(MIN_DIFFICULTY, Math.min(MAX_DIFFICULTY, n));
}

/** Clamp a computed difficulty into the valid range (for extended generators). */
export function clampDifficulty(n: number): number {
  return clamp(n);
}

/**
 * Adaptive drill rating — doc 04 §7. Per-tag rating r ∈ [1,3] (start 1.5). After
 * each answer: fast-correct → +0.08; slow-correct → +0.02; wrong → −0.15.
 */
export const ADAPTIVE_START = 1.5;

export function nextAdaptiveRating(
  rating: number,
  outcome: { correct: boolean; fast: boolean },
): number {
  let r = rating;
  if (!outcome.correct) r -= 0.15;
  else if (outcome.fast) r += 0.08;
  else r += 0.02;
  return Math.max(1, Math.min(3, r));
}

/** The generator tier to use for a rating (round, clamped to 1–3). */
export function tierFromRating(rating: number): 1 | 2 | 3 {
  return Math.max(1, Math.min(3, Math.round(rating))) as 1 | 2 | 3;
}

/** Number of decimal digits in the integer part of |n|. */
export function digitCount(n: number): number {
  return String(Math.abs(Math.trunc(n))).length;
}

/** Ends in neither 0 nor 5. */
export function isUnround(n: number): boolean {
  const last = Math.abs(n) % 10;
  return last !== 0 && last !== 5;
}

/** Carries when adding two non-negative integers (standard right-to-left). */
export function additionCarries(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  let carry = 0;
  let count = 0;
  while (x > 0 || y > 0) {
    const sum = (x % 10) + (y % 10) + carry;
    carry = sum >= 10 ? 1 : 0;
    if (carry) count++;
    x = Math.floor(x / 10);
    y = Math.floor(y / 10);
  }
  return count;
}

/** Borrows when computing minuend − subtrahend (minuend ≥ subtrahend ≥ 0). */
export function subtractionBorrows(minuend: number, subtrahend: number): number {
  let m = Math.abs(minuend);
  let s = Math.abs(subtrahend);
  let borrow = 0;
  let count = 0;
  while (m > 0 || s > 0) {
    const digit = (m % 10) - (s % 10) - borrow;
    if (digit < 0) {
      borrow = 1;
      count++;
    } else {
      borrow = 0;
    }
    m = Math.floor(m / 10);
    s = Math.floor(s / 10);
  }
  return count;
}

export function addDifficulty(a: number, b: number, sum: number): number {
  let d = digitCount(a) + digitCount(b) + digitCount(sum);
  d += additionCarries(a, b);
  if (isUnround(a) || isUnround(b)) d += 1;
  return clamp(d);
}

export function subDifficulty(
  minuend: number,
  subtrahend: number,
  diff: number,
): number {
  let d = digitCount(minuend) + digitCount(subtrahend) + digitCount(diff);
  d += subtractionBorrows(minuend, subtrahend);
  if (isUnround(minuend) || isUnround(subtrahend)) d += 1;
  return clamp(d);
}

export function mulDifficulty(a: number, b: number, product: number): number {
  let d = digitCount(a) + digitCount(b) + digitCount(product);
  const aUnround = isUnround(a);
  const bUnround = isUnround(b);
  if (aUnround || bUnround) d += 1;
  // 2×2 with both operands unround is the classic hard case.
  if (digitCount(a) >= 2 && digitCount(b) >= 2 && aUnround && bUnround) d += 2;
  return clamp(d);
}

export function divDifficulty(
  dividend: number,
  divisor: number,
  quotient: number,
): number {
  let d = digitCount(dividend) + digitCount(divisor) + digitCount(quotient);
  if (isUnround(divisor) || isUnround(quotient)) d += 1;
  return clamp(d);
}
