import { describe, it, expect } from 'vitest';
import { createQuestionStream } from '../stream';
import type { Question } from '../types';

function dedupKey(q: Question): string {
  return q.factKey ?? `p:${q.prompt}`;
}

describe('anti-repeat sliding window (doc 04 §4, §10.7)', () => {
  it('no dedup key repeats within a window of 8 across 1000 questions', () => {
    const stream = createQuestionStream({ seed: 424242, profile: 'zetamac' });
    const keys: string[] = [];
    for (let i = 0; i < 1000; i++) {
      keys.push(dedupKey(stream.next()));
    }
    for (let i = 0; i < keys.length; i++) {
      const windowStart = Math.max(0, i - 8);
      const prior = keys.slice(windowStart, i);
      expect(prior).not.toContain(keys[i]);
    }
  });

  it('remains deterministic despite regeneration draws', () => {
    const a: string[] = [];
    const b: string[] = [];
    const s1 = createQuestionStream({ seed: 55, profile: 'zetamac' });
    const s2 = createQuestionStream({ seed: 55, profile: 'zetamac' });
    for (let i = 0; i < 300; i++) {
      a.push(dedupKey(s1.next()));
      b.push(dedupKey(s2.next()));
    }
    expect(a).toEqual(b);
  });
});
