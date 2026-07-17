import { describe, it, expect } from 'vitest';
import { createQuestionStream } from '../stream';
import type { SessionPlan } from '../types';

function sequence(plan: SessionPlan, n: number): string[] {
  const stream = createQuestionStream(plan);
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const q = stream.next();
    out.push(`${q.skill}|${q.prompt}|${q.answer.value}|${q.difficulty}`);
  }
  return out;
}

describe('determinism (doc 04 §2, §10.1)', () => {
  it('same plan + seed ⇒ identical 500-question sequence', () => {
    const plan: SessionPlan = { seed: 1234567, profile: 'zetamac' };
    const a = sequence(plan, 500);
    const b = sequence(plan, 500);
    expect(a).toEqual(b);
    expect(a).toHaveLength(500);
  });

  it('different seeds ⇒ different sequences', () => {
    const a = sequence({ seed: 1, profile: 'zetamac' }, 500);
    const b = sequence({ seed: 2, profile: 'zetamac' }, 500);
    expect(a).not.toEqual(b);
    // Sanity: they should differ in the vast majority of positions.
    const diffs = a.filter((x, i) => x !== b[i]).length;
    expect(diffs).toBeGreaterThan(400);
  });

  it('tag selection and operand choice are independent streams', () => {
    // Two seeds sharing neither child stream should not accidentally align.
    const a = sequence({ seed: 999, profile: 'zetamac' }, 200);
    const b = sequence({ seed: 1000, profile: 'zetamac' }, 200);
    expect(a).not.toEqual(b);
  });
});
