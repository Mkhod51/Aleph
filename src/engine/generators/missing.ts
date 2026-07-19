import { intInRange, type Rng } from '@/lib/prng';
import type { GeneratorConfig, Question } from '../types';
import { addDifficulty, mulDifficulty } from '../difficulty';
import { mulFactKey } from '../facts';
import { BLANK, resolvePinnedPair } from './shared';

/** MISSING_ADD — `a + □ = s` or `□ − b = c`, from ADD ranges. Answer: integer. */
export function generateMissingAdd(rng: Rng, cfg: GeneratorConfig): Question {
  const min = cfg.addMin ?? 2;
  const max = cfg.addMax ?? 100;
  const x = intInRange(rng, min, max);
  const answer = intInRange(rng, min, max);
  if (rng() < 0.5) {
    const s = x + answer; // a + □ = s
    return {
      skill: 'MISSING_ADD',
      prompt: `${x} + ${BLANK} = ${s}`,
      operands: [x, s],
      answer: { value: answer, display: String(answer) },
      format: 'integer',
      difficulty: addDifficulty(x, answer, s),
      factKey: null,
    };
  }
  // □ − b = c  →  □ = b + c
  const b = x;
  const c = answer;
  const blank = b + c;
  return {
    skill: 'MISSING_ADD',
    prompt: `${BLANK} − ${b} = ${c}`,
    operands: [b, c],
    answer: { value: blank, display: String(blank) },
    format: 'integer',
    difficulty: addDifficulty(b, c, blank),
    factKey: null,
  };
}

/** MISSING_MUL — `a × □ = p` from MUL ranges (last-digit-solvable). Answer: integer. */
export function generateMissingMul(rng: Rng, cfg: GeneratorConfig): Question {
  // Pinned: order randomization surfaces both `a×□=p` and `b×□=p` forms.
  const [a, b] = cfg.pinPair
    ? resolvePinnedPair(rng, cfg.pinPair)
    : [
        intInRange(rng, cfg.aMin ?? 2, cfg.aMax ?? 12),
        intInRange(rng, cfg.bMin ?? 2, cfg.bMax ?? 100),
      ];
  const p = a * b;
  return {
    skill: 'MISSING_MUL',
    prompt: `${a} × ${BLANK} = ${p}`,
    operands: [a, b],
    answer: { value: b, display: String(b) },
    format: 'integer',
    difficulty: mulDifficulty(a, b, p),
    factKey: mulFactKey(a, b),
  };
}
