import { intInRange, type Rng } from '@/lib/prng';
import type { GeneratorConfig, Question } from '../types';
import { clampDifficulty } from '../difficulty';
import { decimalCanonical } from './shared';

/** PCT_OF — p% of b, b ∈ [20,400]; exact answer ≤ 2 dp. Answer: decimal. */
export function generatePctOf(rng: Rng, _cfg: GeneratorConfig): Question {
  // Prefer "clean" percentages (multiples of 5), with some arbitrary ones.
  const p = rng() < 0.7 ? intInRange(rng, 1, 19) * 5 : intInRange(rng, 2, 99);
  const b = intInRange(rng, 20, 400);
  const value = (p * b) / 100;
  return {
    skill: 'PCT_OF',
    prompt: `${p}% of ${b}`,
    operands: [p, b],
    answer: decimalCanonical(value, 2),
    format: 'decimal',
    difficulty: clampDifficulty(p % 5 === 0 ? 4 : 6),
    factKey: null,
  };
}
