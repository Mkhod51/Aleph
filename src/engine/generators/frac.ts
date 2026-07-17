import { intInRange, pick, type Rng } from '@/lib/prng';
import type { GeneratorConfig, Question } from '../types';
import { clampDifficulty } from '../difficulty';
import { fracFactKey } from '../facts';
import {
  fractionCanonical,
  formatDecimal,
  gcd,
  lcm,
  reduceFraction,
} from './shared';

const FRAC_ADD_DENOMS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 16] as const;

/**
 * FRAC_ADD — two proper fractions with denominators from {2..12,16}, lcm ≤ 48.
 * Answer (multi): the reduced sum, accepted as decimal, fraction, or mixed.
 */
export function generateFracAdd(rng: Rng, _cfg: GeneratorConfig): Question {
  const d1 = pick(rng, FRAC_ADD_DENOMS);
  let d2 = pick(rng, FRAC_ADD_DENOMS);
  for (let i = 0; i < 8 && lcm(d1, d2) > 48; i++) d2 = pick(rng, FRAC_ADD_DENOMS);
  const n1 = intInRange(rng, 1, d1 - 1);
  const n2 = intInRange(rng, 1, d2 - 1);
  const num = n1 * d2 + n2 * d1;
  const den = d1 * d2;
  return {
    skill: 'FRAC_ADD',
    prompt: `${n1}/${d1} + ${n2}/${d2}`,
    operands: [n1, d1, n2, d2],
    answer: fractionCanonical(num, den),
    format: 'multi',
    difficulty: clampDifficulty(4 + Math.round(lcm(d1, d2) / 12)),
    factKey: null,
  };
}

const FRAC_COMPARE_DENOMS = [2, 3, 4, 5, 6, 7, 8, 9, 11, 12] as const;

/**
 * FRAC_COMPARE — "Which is larger?" between two proper fractions whose values
 * differ by ≥ 0.05 (no coin-flips, doc 04 §3). Answer: choice key 1 or 2.
 */
export function generateFracCompare(rng: Rng, _cfg: GeneratorConfig): Question {
  let a = 1;
  let b = 2;
  let c = 1;
  let d = 3;
  for (let i = 0; i < 20; i++) {
    b = pick(rng, FRAC_COMPARE_DENOMS);
    d = pick(rng, FRAC_COMPARE_DENOMS);
    a = intInRange(rng, 1, b - 1);
    c = intInRange(rng, 1, d - 1);
    if (Math.abs(a / b - c / d) >= 0.05) break;
  }
  const firstLarger = a / b > c / d;
  return {
    skill: 'FRAC_COMPARE',
    prompt: `Larger?  ① ${a}/${b}   ② ${c}/${d}`,
    operands: [a, b, c, d],
    answer: { value: firstLarger ? 1 : 2, display: firstLarger ? '1' : '2' },
    format: 'choice',
    difficulty: clampDifficulty(5),
    factKey: null,
  };
}

const FRAC_TO_DEC_DENOMS = [2, 3, 4, 5, 6, 8, 9, 10, 12, 16, 20, 25] as const;

/** Does d/gcd terminate as a decimal (only factors 2 and 5)? */
function terminates(den: number): boolean {
  let d = den;
  while (d % 2 === 0) d /= 2;
  while (d % 5 === 0) d /= 5;
  return d === 1;
}

/**
 * FRAC_TO_DEC — a common fraction converted to its decimal. Terminating decimals
 * are exact; repeating ones are marked `approx` (grading accepts 2-dp or 4-dp).
 */
export function generateFracToDec(rng: Rng, _cfg: GeneratorConfig): Question {
  const d = pick(rng, FRAC_TO_DEC_DENOMS);
  let n = intInRange(rng, 1, d - 1);
  for (let i = 0; i < 6 && gcd(n, d) !== 1; i++) n = intInRange(rng, 1, d - 1);
  const r = reduceFraction(n, d);
  const value = r.num / r.den;
  const isTerminating = terminates(r.den);
  const display = formatDecimal(value, 4);
  return {
    skill: 'FRAC_TO_DEC',
    prompt: isTerminating ? `${r.num}/${r.den}` : `${r.num}/${r.den} ≈`,
    operands: [r.num, r.den],
    answer: isTerminating
      ? { value: Number(display), display }
      : { value, display, approx: true },
    format: 'decimal',
    difficulty: clampDifficulty(isTerminating ? 4 : 6),
    factKey: fracFactKey(r.num, r.den),
  };
}
