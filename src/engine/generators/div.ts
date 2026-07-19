import { intInRange, pick, type Rng } from '@/lib/prng';
import type { GeneratorConfig, Question } from '../types';
import { clampDifficulty, digitCount, divDifficulty } from '../difficulty';
import { mulFactKey } from '../facts';
import { decimalCanonical, resolvePinnedPair } from './shared';

/**
 * DIV_EXACT — inverse of MUL_1x2: pick factors a ∈ [2,12], b ∈ [2,100], present
 * `(a·b) ÷ a = b`. Divisor is the small factor; the quotient is the answer.
 * Always exact (remainder-free), matching Zetamac's reverse-multiplication rule.
 */
export const divDefaults: GeneratorConfig = {
  aMin: 2,
  aMax: 12,
  bMin: 2,
  bMax: 100,
};

export function generateDivExact(rng: Rng, cfg: GeneratorConfig): Question {
  // Pinned: resolvePinnedPair already randomizes order, so either operand plays
  // divisor — presenting both p÷a and p÷b forms of the fact.
  const [a, b] = cfg.pinPair // a = divisor, b = quotient (answer)
    ? resolvePinnedPair(rng, cfg.pinPair)
    : [
        intInRange(rng, cfg.aMin ?? 2, cfg.aMax ?? 12),
        intInRange(rng, cfg.bMin ?? 2, cfg.bMax ?? 100),
      ];
  const product = a * b;
  return {
    skill: 'DIV_EXACT',
    prompt: `${product} ÷ ${a}`,
    // Core multiplicative pair drives fact tracking (doc 04 §8).
    operands: [a, b],
    answer: { value: b, display: String(b) },
    format: 'integer',
    difficulty: divDifficulty(product, a, b),
    factKey: mulFactKey(a, b),
  };
}

/**
 * DIV_TO_DEC — a ÷ b with b ∈ {2,4,5,8,10,16,20,25,50}; result terminates in
 * ≤ 4 dp and is non-integer (e.g. 7 ÷ 8 = 0.875). Answer: decimal.
 */
const DIV_TO_DEC_DENOMS = [2, 4, 5, 8, 10, 16, 20, 25, 50] as const;

export function generateDivToDec(rng: Rng, _cfg: GeneratorConfig): Question {
  const b = pick(rng, DIV_TO_DEC_DENOMS);
  let a = intInRange(rng, 1, 199);
  for (let i = 0; i < 6 && a % b === 0; i++) a = intInRange(rng, 1, 199);
  if (a % b === 0) a += 1; // guarantee non-integer result
  const answer = decimalCanonical(a / b, 4);
  const dp = answer.display.includes('.') ? answer.display.split('.')[1]!.length : 0;
  return {
    skill: 'DIV_TO_DEC',
    prompt: `${a} ÷ ${b}`,
    operands: [a, b],
    answer,
    format: 'decimal',
    difficulty: clampDifficulty(digitCount(a) + digitCount(b) + dp + 2),
    factKey: null,
  };
}
