import { describe, it, expect } from 'vitest';
import { validate } from '@/engine';
import { mulberry32 } from '@/lib/prng';
import { TECHNIQUES } from '@/content/techniques';
import {
  buildDrillFromSpec,
  drawDrillQuestion,
  resolveDrillWeights,
} from '../drills';

describe('technique → drill mapping (doc 06, doc 09 M4 DoD)', () => {
  it('every technique with a drill resolves to registered generators', () => {
    const withDrill = TECHNIQUES.filter((t) => t.drill);
    // All 15 techniques map to a drill.
    expect(withDrill.length).toBe(15);

    for (const t of withDrill) {
      const spec = t.drill!;
      const resolved = resolveDrillWeights(spec.weights);
      expect(resolved.tags.length).toBeGreaterThan(0);

      const rng = mulberry32(7);
      const tier = spec.tier ?? 2;
      for (let i = 0; i < 60; i++) {
        const q = drawDrillQuestion(rng, resolved, tier);
        // Only the mapped tags appear, and each question grades its own answer.
        expect(resolved.tags).toContain(q.skill);
        expect(validate(q, q.answer.display).correct).toBe(true);
      }
    }
  });

  it('buildDrillFromSpec carries input/feedback from the spec', () => {
    const t15 = TECHNIQUES.find((t) => t.id === 'T15')!;
    const meta = buildDrillFromSpec(t15.title, t15.drill!, { count: 10 });
    expect(meta.input).toBe('test');
    expect(meta.feedback).toBe(true);
    expect(meta.count).toBe(10);
    expect(meta.scoring).toEqual({ kind: 'count' });

    const t5 = TECHNIQUES.find((t) => t.id === 'T5')!;
    const m5 = buildDrillFromSpec(t5.title, t5.drill!);
    expect(m5.input).toBe('flow');
    expect(m5.tierMode).toBe(3);
  });
});
