import { intInRange, pick, type Rng } from '@/lib/prng';
import type { GeneratorConfig, Question } from '../types';
import { clampDifficulty, digitCount } from '../difficulty';
import { decimalCanonical, formatDecimal } from './shared';

/** A value in [1,100] with 1–2 dp, as integer cents (scale 100). */
function pickCents(rng: Rng): number {
  const oneDp = rng() < 0.5;
  const cents = intInRange(rng, 100, 10000);
  return oneDp ? cents - (cents % 10) : cents;
}

/** ADD_DEC — a,b ∈ [1,100] with 1–2 dp; dp-aligned exact sum. Answer: decimal. */
export function generateAddDec(rng: Rng, _cfg: GeneratorConfig): Question {
  const aC = pickCents(rng);
  const bC = pickCents(rng);
  const a = aC / 100;
  const b = bC / 100;
  const answer = decimalCanonical((aC + bC) / 100, 2);
  return {
    skill: 'ADD_DEC',
    prompt: `${formatDecimal(a, 2)} + ${formatDecimal(b, 2)}`,
    operands: [a, b],
    answer,
    format: 'decimal',
    difficulty: clampDifficulty(digitCount(a) + digitCount(b) + 3),
    factKey: null,
  };
}

const DP_PAIRS: [number, number][] = [
  [0, 1],
  [1, 0],
  [0, 2],
  [2, 0],
  [1, 1],
];

/**
 * MUL_DEC — a MUL_1x2 pair scaled so the total decimal places ≤ 2 (int×dec or
 * dec×dec). Product is exact via integer math. Answer: decimal.
 */
export function generateMulDec(rng: Rng, _cfg: GeneratorConfig): Question {
  let a = intInRange(rng, 2, 12);
  let b = intInRange(rng, 2, 100);
  const [dpA, dpB] = pick(rng, DP_PAIRS);
  // Ensure the scaled factor actually shows a decimal (not a whole number).
  if (dpA === 1 && a % 10 === 0) a = 11;
  if (dpB === 1 && b % 10 === 0) b = b < 100 ? b + 1 : 99;
  if (dpB === 2 && b % 100 === 0) b = 99;
  const fa = a / 10 ** dpA;
  const fb = b / 10 ** dpB;
  const value = (a * b) / 10 ** (dpA + dpB);
  return {
    skill: 'MUL_DEC',
    prompt: `${formatDecimal(fa, 2)} × ${formatDecimal(fb, 2)}`,
    operands: [fa, fb],
    answer: decimalCanonical(value, 2),
    format: 'decimal',
    difficulty: clampDifficulty(digitCount(a) + digitCount(b) + dpA + dpB + 2),
    factKey: null,
  };
}
