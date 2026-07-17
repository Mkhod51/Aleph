import { describe, it, expect } from 'vitest';
import { mulberry32 } from '@/lib/prng';
import { generateAdd2D, addDefaults } from '../generators/add';
import { generateSub2D, subDefaults } from '../generators/sub';
import { generateMul1x2, mulDefaults } from '../generators/mul';
import { generateDivExact, divDefaults } from '../generators/div';

const SAMPLES = 2000;

describe('ADD_2D generator (doc 04 §3, §10.2)', () => {
  it('respects ranges, computes exact sums, no degenerates', () => {
    const rng = mulberry32(42);
    for (let i = 0; i < SAMPLES; i++) {
      const q = generateAdd2D(rng, addDefaults);
      const [a, b] = q.operands as [number, number];
      expect(a).toBeGreaterThanOrEqual(2);
      expect(a).toBeLessThanOrEqual(100);
      expect(b).toBeGreaterThanOrEqual(2);
      expect(b).toBeLessThanOrEqual(100);
      expect(q.answer.value).toBe(a + b);
      expect(q.format).toBe('integer');
      expect(q.factKey).toBeNull();
      // No degenerate +0 (min operand is 2).
      expect(a).not.toBe(0);
      expect(b).not.toBe(0);
    }
  });
});

describe('SUB_2D generator', () => {
  it('is never negative, answer ≥ 2, and exact', () => {
    const rng = mulberry32(7);
    for (let i = 0; i < SAMPLES; i++) {
      const q = generateSub2D(rng, subDefaults);
      const [minuend, subtrahend] = q.operands as [number, number];
      expect(minuend).toBeGreaterThanOrEqual(subtrahend);
      expect(q.answer.value).toBe(minuend - subtrahend);
      expect(q.answer.value).toBeGreaterThanOrEqual(2);
      expect(q.answer.value).toBeLessThanOrEqual(100);
      // No a − a = 0 degenerate.
      expect(minuend).not.toBe(subtrahend);
    }
  });
});

describe('MUL_1x2 generator', () => {
  it('respects Zetamac ranges and computes exact products', () => {
    const rng = mulberry32(101);
    for (let i = 0; i < SAMPLES; i++) {
      const q = generateMul1x2(rng, mulDefaults);
      const [a, b] = q.operands as [number, number];
      expect(a).toBeGreaterThanOrEqual(2);
      expect(a).toBeLessThanOrEqual(12);
      expect(b).toBeGreaterThanOrEqual(2);
      expect(b).toBeLessThanOrEqual(100);
      expect(q.answer.value).toBe(a * b);
      // No ×1 degenerate (ranges start at 2). ×10 is intentionally KEPT for
      // Zetamac parity (doc 03 §2 overrides the generic exclusion in doc 04 §3c).
      expect(a).not.toBe(1);
      expect(b).not.toBe(1);
    }
  });

  it('assigns factKey only when both operands ≤ 20 (doc 04 §8)', () => {
    const rng = mulberry32(202);
    for (let i = 0; i < SAMPLES; i++) {
      const q = generateMul1x2(rng, mulDefaults);
      const [a, b] = q.operands as [number, number];
      if (a <= 20 && b <= 20) {
        expect(q.factKey).toBe(`mul:${Math.min(a, b)}×${Math.max(a, b)}`);
      } else {
        expect(q.factKey).toBeNull();
      }
    }
  });
});

describe('DIV_EXACT generator', () => {
  it('is exact (remainder-free) with divisor ∈ [2,12], quotient ∈ [2,100]', () => {
    const rng = mulberry32(303);
    for (let i = 0; i < SAMPLES; i++) {
      const q = generateDivExact(rng, divDefaults);
      const [divisor, quotient] = q.operands as [number, number];
      expect(divisor).toBeGreaterThanOrEqual(2);
      expect(divisor).toBeLessThanOrEqual(12);
      expect(quotient).toBeGreaterThanOrEqual(2);
      expect(quotient).toBeLessThanOrEqual(100);
      const dividend = divisor * quotient;
      // Remainder-free by construction, and the answer is the quotient.
      expect(dividend % divisor).toBe(0);
      expect(q.answer.value).toBe(quotient);
      expect(dividend / divisor).toBe(q.answer.value);
      // No ÷1 degenerate.
      expect(divisor).not.toBe(1);
    }
  });

  it('prompt states the exact dividend and divisor', () => {
    const rng = mulberry32(404);
    for (let i = 0; i < 500; i++) {
      const q = generateDivExact(rng, divDefaults);
      const [divisor, quotient] = q.operands as [number, number];
      expect(q.prompt).toBe(`${divisor * quotient} ÷ ${divisor}`);
    }
  });
});

describe('answer typing cost (doc 04 §3d)', () => {
  it('all zetamac answers are ≤ 7 characters', () => {
    const rng = mulberry32(505);
    const gens = [
      () => generateAdd2D(rng, addDefaults),
      () => generateSub2D(rng, subDefaults),
      () => generateMul1x2(rng, mulDefaults),
      () => generateDivExact(rng, divDefaults),
    ];
    for (let i = 0; i < SAMPLES; i++) {
      for (const g of gens) {
        expect(g().answer.display.length).toBeLessThanOrEqual(7);
      }
    }
  });
});
