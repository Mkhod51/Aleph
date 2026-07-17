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

/**
 * MUL_2x2 — a,b ∈ [13,99], excluding operands ending in 0 (tier 1 may allow
 * them via allowRoundMultiples). Answer: integer product.
 */
export const mul2x2Defaults: GeneratorConfig = { aMin: 13, aMax: 99, bMin: 13, bMax: 99 };

export function generateMul2x2(rng: Rng, cfg: GeneratorConfig): Question {
  const aMin = cfg.aMin ?? 13;
  const aMax = cfg.aMax ?? 99;
  const bMin = cfg.bMin ?? 13;
  const bMax = cfg.bMax ?? 99;
  const draw = (min: number, max: number): number => {
    let v = intInRange(rng, min, max);
    for (let i = 0; i < 5 && v % 10 === 0; i++) v = intInRange(rng, min, max);
    return v;
  };
  const a = draw(aMin, aMax);
  const b = draw(bMin, bMax);
  const product = a * b;
  return {
    skill: 'MUL_2x2',
    prompt: `${a} × ${b}`,
    operands: [a, b],
    answer: { value: product, display: String(product) },
    format: 'integer',
    difficulty: mulDifficulty(a, b, product),
    factKey: mulFactKey(a, b),
  };
}
