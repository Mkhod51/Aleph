import { intInRange, type Rng } from '@/lib/prng';
import type { GeneratorConfig, Question } from '../types';
import { addDifficulty } from '../difficulty';

/** ADD_2D — a,b ∈ [2,100] (Zetamac default). Answer: integer sum. */
export const addDefaults: GeneratorConfig = { addMin: 2, addMax: 100 };

export function generateAdd2D(rng: Rng, cfg: GeneratorConfig): Question {
  const min = cfg.addMin ?? 2;
  const max = cfg.addMax ?? 100;
  const a = intInRange(rng, min, max);
  const b = intInRange(rng, min, max);
  const sum = a + b;
  return {
    skill: 'ADD_2D',
    prompt: `${a} + ${b}`,
    operands: [a, b],
    answer: { value: sum, display: String(sum) },
    format: 'integer',
    difficulty: addDifficulty(a, b, sum),
    // Addition is technique-driven, tracked at tag level only (doc 04 §8).
    factKey: null,
  };
}
