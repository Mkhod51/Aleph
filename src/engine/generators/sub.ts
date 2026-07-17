import { intInRange, type Rng } from '@/lib/prng';
import type { GeneratorConfig, Question } from '../types';
import { subDifficulty } from '../difficulty';

/**
 * SUB_2D — generated as the inverse of an addition pair and presented as
 * `sum − x = y`, so the answer is always ≥ min (never negative), matching Zetamac.
 */
export const subDefaults: GeneratorConfig = { addMin: 2, addMax: 100 };

export function generateSub2D(rng: Rng, cfg: GeneratorConfig): Question {
  const min = cfg.addMin ?? 2;
  const max = cfg.addMax ?? 100;
  const a = intInRange(rng, min, max);
  const b = intInRange(rng, min, max);
  const sum = a + b;
  // Subtract one addend at random; the other is the (non-negative) answer.
  const subtractFirst = rng() < 0.5;
  const x = subtractFirst ? a : b;
  const y = subtractFirst ? b : a;
  return {
    skill: 'SUB_2D',
    prompt: `${sum} − ${x}`,
    operands: [sum, x],
    answer: { value: y, display: String(y) },
    format: 'integer',
    difficulty: subDifficulty(sum, x, y),
    factKey: null,
  };
}
