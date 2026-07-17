import { intInRange, pick, type Rng } from '@/lib/prng';
import type { GeneratorConfig, Question } from '../types';
import { clampDifficulty } from '../difficulty';
import { decimalCanonical } from './shared';
import { BLANK } from './shared';

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

const REVERSE_PCTS = [5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 80] as const;

/** PCT_REVERSE — "□% of b = c" with an integer answer (the percentage). */
export function generatePctReverse(rng: Rng, _cfg: GeneratorConfig): Question {
  const p = pick(rng, REVERSE_PCTS);
  const b = intInRange(rng, 1, 20) * 20; // multiple of 20 in [20,400]
  const c = (p * b) / 100; // integer since p is a multiple of 5 and b of 20
  return {
    skill: 'PCT_REVERSE',
    prompt: `${BLANK}% of ${b} = ${c}`,
    operands: [b, c],
    answer: { value: p, display: String(p) },
    format: 'integer',
    difficulty: clampDifficulty(4),
    factKey: null,
  };
}

const CHANGE_PCTS = [-50, -40, -30, -25, -20, -15, -10, -5, 5, 10, 15, 20, 25, 30, 40, 50, 75, 100];

/** PCT_CHANGE — "old → new"; answer is the clean percentage change. */
export function generatePctChange(rng: Rng, _cfg: GeneratorConfig): Question {
  for (let i = 0; i < 12; i++) {
    const old = intInRange(rng, 1, 25) * 20; // multiple of 20 in [20,500]
    const pct = pick(rng, CHANGE_PCTS);
    const next = (old * (100 + pct)) / 100;
    if (Number.isInteger(next) && next >= 20 && next <= 500 && next !== old) {
      return {
        skill: 'PCT_CHANGE',
        prompt: `${old} → ${next}  (% change)`,
        operands: [old, next],
        answer: { value: pct, display: String(pct) },
        format: 'decimal',
        difficulty: clampDifficulty(6),
        factKey: null,
      };
    }
  }
  // Deterministic fallback: a guaranteed clean +25%.
  const old = 80;
  return {
    skill: 'PCT_CHANGE',
    prompt: `${old} → ${old * 1.25}  (% change)`,
    operands: [old, old * 1.25],
    answer: { value: 25, display: '25' },
    format: 'decimal',
    difficulty: clampDifficulty(6),
    factKey: null,
  };
}
