import { describe, it, expect } from 'vitest';
import { createQuestionStream } from '../stream';
import { resolveProfile } from '../profiles';
import type { SkillTag } from '../types';

describe('distribution profiles (doc 04 §5, §10.3)', () => {
  it('zetamac draws each tag within ±2 percentage points of 25%', () => {
    const stream = createQuestionStream({ seed: 20240717, profile: 'zetamac' });
    const counts: Record<string, number> = {};
    const N = 10000;
    for (let i = 0; i < N; i++) {
      const q = stream.next();
      counts[q.skill] = (counts[q.skill] ?? 0) + 1;
    }
    const tags: SkillTag[] = ['ADD_2D', 'SUB_2D', 'MUL_1x2', 'DIV_EXACT'];
    for (const tag of tags) {
      const pct = ((counts[tag] ?? 0) / N) * 100;
      expect(pct).toBeGreaterThanOrEqual(23);
      expect(pct).toBeLessThanOrEqual(27);
    }
    // Only the four zetamac tags appear.
    expect(Object.keys(counts).sort()).toEqual([...tags].sort());
  });

  it('drill:<TAG> yields 100% one tag', () => {
    const stream = createQuestionStream({ seed: 1, profile: 'drill:MUL_1x2' });
    for (let i = 0; i < 200; i++) {
      expect(stream.next().skill).toBe('MUL_1x2');
    }
  });

  it('projects weight maps onto a canonical tag order (insertion-order independent)', () => {
    const a = resolveProfile({ MUL_1x2: 25, ADD_2D: 25 });
    const b = resolveProfile({ ADD_2D: 25, MUL_1x2: 25 });
    expect(a.tags).toEqual(b.tags);
    expect(a.tags).toEqual(['ADD_2D', 'MUL_1x2']);
  });

  it('throws for profiles not yet available', () => {
    expect(() => resolveProfile('sequences')).toThrow(/not available/);
  });

  it('optiver / flow draw every tag within ±2 pp of its weight', () => {
    for (const profile of ['optiver', 'flow'] as const) {
      const { tags, weights } = resolveProfile(profile);
      const total = weights.reduce((a, b) => a + b, 0);
      const stream = createQuestionStream({ seed: 4242, profile });
      const counts: Record<string, number> = {};
      const N = 20000;
      for (let i = 0; i < N; i++) {
        const q = stream.next();
        counts[q.skill] = (counts[q.skill] ?? 0) + 1;
      }
      tags.forEach((tag, i) => {
        const expected = ((weights[i] as number) / total) * 100;
        const actual = ((counts[tag] ?? 0) / N) * 100;
        expect(Math.abs(actual - expected)).toBeLessThanOrEqual(2);
      });
    }
  });
});
