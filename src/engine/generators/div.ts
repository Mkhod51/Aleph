import { intInRange, type Rng } from '@/lib/prng';
import type { GeneratorConfig, Question } from '../types';
import { divDifficulty } from '../difficulty';
import { mulFactKey } from '../facts';

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
  const aMin = cfg.aMin ?? 2;
  const aMax = cfg.aMax ?? 12;
  const bMin = cfg.bMin ?? 2;
  const bMax = cfg.bMax ?? 100;
  const a = intInRange(rng, aMin, aMax); // divisor
  const b = intInRange(rng, bMin, bMax); // quotient (answer)
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
