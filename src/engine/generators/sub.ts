import { intInRange, type Rng } from '@/lib/prng';
import type { GeneratorConfig, Question, SkillTag } from '../types';
import { subDifficulty } from '../difficulty';

/**
 * SUB_2D — generated as the inverse of an addition pair and presented as
 * `sum − x = y`, so the answer is always ≥ min (never negative), matching Zetamac.
 */
export const subDefaults: GeneratorConfig = { addMin: 2, addMax: 100 };

export function generateSub2D(rng: Rng, cfg: GeneratorConfig): Question {
  return makeSub(rng, cfg.addMin ?? 2, cfg.addMax ?? 100, 'SUB_2D');
}

/** SUB_3D — inverse of ADD_3D (a,b ∈ [100,999]), never negative. */
export const sub3dDefaults: GeneratorConfig = { addMin: 100, addMax: 999 };

export function generateSub3D(rng: Rng, cfg: GeneratorConfig): Question {
  return makeSub(rng, cfg.addMin ?? 100, cfg.addMax ?? 999, 'SUB_3D');
}

function makeSub(rng: Rng, min: number, max: number, skill: SkillTag): Question {
  const a = intInRange(rng, min, max);
  const b = intInRange(rng, min, max);
  const sum = a + b;
  // Subtract one addend at random; the other is the (non-negative) answer.
  const subtractFirst = rng() < 0.5;
  const x = subtractFirst ? a : b;
  const y = subtractFirst ? b : a;
  return {
    skill,
    prompt: `${sum} − ${x}`,
    operands: [sum, x],
    answer: { value: y, display: String(y) },
    format: 'integer',
    difficulty: subDifficulty(sum, x, y),
    factKey: null,
  };
}
