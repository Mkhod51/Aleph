import { intInRange, type Rng } from '@/lib/prng';
import type { GeneratorConfig, Question } from '../types';
import { clampDifficulty, digitCount } from '../difficulty';
import { pow2FactKey, squareFactKey } from '../facts';

/** SQUARE — n² for n ∈ [11,30] (tier 1: [11,20]). Answer: integer. */
export const squareDefaults: GeneratorConfig = { aMin: 11, aMax: 30 };

export function generateSquare(rng: Rng, cfg: GeneratorConfig): Question {
  const n = intInRange(rng, cfg.aMin ?? 11, cfg.aMax ?? 30);
  const value = n * n;
  return {
    skill: 'SQUARE',
    prompt: `${n}²`,
    operands: [n],
    answer: { value, display: String(value) },
    format: 'integer',
    difficulty: clampDifficulty(2 + digitCount(value)),
    factKey: squareFactKey(n),
  };
}

/** POW2 — 2^n for n ∈ [4,12]. Answer: integer. */
export const pow2Defaults: GeneratorConfig = { aMin: 4, aMax: 12 };

export function generatePow2(rng: Rng, cfg: GeneratorConfig): Question {
  const n = intInRange(rng, cfg.aMin ?? 4, cfg.aMax ?? 12);
  const value = 2 ** n;
  return {
    skill: 'POW2',
    prompt: `2^${n}`,
    operands: [n],
    answer: { value, display: String(value) },
    format: 'integer',
    difficulty: clampDifficulty(2 + digitCount(value)),
    factKey: pow2FactKey(n),
  };
}
