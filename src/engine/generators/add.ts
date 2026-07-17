import { intInRange, type Rng } from '@/lib/prng';
import type { GeneratorConfig, Question, SkillTag } from '../types';
import { addDifficulty } from '../difficulty';

/** ADD_2D — a,b ∈ [2,100] (Zetamac default). Answer: integer sum. */
export const addDefaults: GeneratorConfig = { addMin: 2, addMax: 100 };

export function generateAdd2D(rng: Rng, cfg: GeneratorConfig): Question {
  return makeAdd(rng, cfg.addMin ?? 2, cfg.addMax ?? 100, 'ADD_2D');
}

/** ADD_3D — a,b ∈ [100,999]. Answer: integer sum. */
export const add3dDefaults: GeneratorConfig = { addMin: 100, addMax: 999 };

export function generateAdd3D(rng: Rng, cfg: GeneratorConfig): Question {
  return makeAdd(rng, cfg.addMin ?? 100, cfg.addMax ?? 999, 'ADD_3D');
}

function makeAdd(rng: Rng, min: number, max: number, skill: SkillTag): Question {
  const a = intInRange(rng, min, max);
  const b = intInRange(rng, min, max);
  const sum = a + b;
  return {
    skill,
    prompt: `${a} + ${b}`,
    operands: [a, b],
    answer: { value: sum, display: String(sum) },
    format: 'integer',
    difficulty: addDifficulty(a, b, sum),
    // Addition is technique-driven, tracked at tag level only (doc 04 §8).
    factKey: null,
  };
}
