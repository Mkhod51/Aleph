import { describe, it, expect } from 'vitest';
import { mulberry32, type Rng } from '@/lib/prng';
import { generateMul1x2, generateMul2x2 } from '../generators/mul';
import { generateDivExact } from '../generators/div';
import { generateMissingMul } from '../generators/missing';
import { mulFactKey } from '../facts';
import type { GeneratorConfig, Question } from '../types';

type Gen = (rng: Rng, cfg: GeneratorConfig) => Question;

const PINNED: Record<string, Gen> = {
  MUL_1x2: generateMul1x2,
  MUL_2x2: generateMul2x2,
  DIV_EXACT: generateDivExact,
  MISSING_MUL: generateMissingMul,
};

/**
 * F1: fact-family pinning. A drill pinned to 13×17 must draw only from that
 * fact's neighborhood, landing on the exact pair most of the time.
 */
describe('pinPair fact-family draws (doc 03 §6, F1)', () => {
  for (const [name, gen] of Object.entries(PINNED)) {
    it(`${name}: 100 draws all in the 13/17 neighborhood, ≥60% exact`, () => {
      const rng = mulberry32(0xa1e0);
      let exact = 0;
      for (let i = 0; i < 100; i++) {
        const q = gen(rng, { pinPair: [13, 17] });
        const [a, b] = q.operands as [number, number];
        // A pinned draw keeps one operand exact and nudges the other by ≤ 2.
        expect(a === 13 || a === 17 || b === 13 || b === 17).toBe(true);
        const lo = Math.min(a, b);
        const hi = Math.max(a, b);
        expect(lo).toBeGreaterThanOrEqual(11);
        expect(hi).toBeLessThanOrEqual(19);
        // Every question is a trackable fact in the neighborhood.
        expect(q.factKey).toBe(mulFactKey(a, b));
        expect(q.factKey).not.toBeNull();
        // The drawn question grades its own displayed answer.
        if (q.factKey === 'mul:13×17') exact++;
      }
      expect(exact).toBeGreaterThanOrEqual(60);
    });
  }

  it('is deterministic for a given seed', () => {
    const seq = (seed: number) => {
      const rng = mulberry32(seed);
      return Array.from({ length: 50 }, () =>
        generateDivExact(rng, { pinPair: [13, 17] }).prompt,
      );
    };
    expect(seq(42)).toEqual(seq(42));
  });
});
