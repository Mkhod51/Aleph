import { intInRange, type Rng } from '@/lib/prng';
import type { GeneratorConfig, Question } from '../types';
import { mulDifficulty } from '../difficulty';
import { mulFactKey } from '../facts';

/** MUL_1x2 — a ∈ [2,12], b ∈ [2,100] (Zetamac default). Answer: integer product. */
export const mulDefaults: GeneratorConfig = {
  aMin: 2,
  aMax: 12,
  bMin: 2,
  bMax: 100,
};

export function generateMul1x2(rng: Rng, cfg: GeneratorConfig): Question {
  const aMin = cfg.aMin ?? 2;
  const aMax = cfg.aMax ?? 12;
  const bMin = cfg.bMin ?? 2;
  const bMax = cfg.bMax ?? 100;
  const a = intInRange(rng, aMin, aMax);
  const b = intInRange(rng, bMin, bMax);
  const product = a * b;
  return {
    skill: 'MUL_1x2',
    prompt: `${a} × ${b}`,
    operands: [a, b],
    answer: { value: product, display: String(product) },
    format: 'integer',
    difficulty: mulDifficulty(a, b, product),
    factKey: mulFactKey(a, b),
  };
}
