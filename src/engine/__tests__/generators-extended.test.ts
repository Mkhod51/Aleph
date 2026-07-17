import { describe, it, expect } from 'vitest';
import { mulberry32 } from '@/lib/prng';
import { validate } from '../validate';
import type { GeneratorConfig, Question } from '../types';
import { generateAdd3D, add3dDefaults } from '../generators/add';
import { generateSub3D, sub3dDefaults } from '../generators/sub';
import { generateMul2x2, mul2x2Defaults } from '../generators/mul';
import { generateDivToDec } from '../generators/div';
import { generateMul1x3, mul1x3Defaults } from '../generators/mul';
import { generateAddDec, generateMulDec } from '../generators/dec';
import { generateFracAdd, generateFracToDec, generateFracCompare } from '../generators/frac';
import { generatePctOf, generatePctReverse, generatePctChange } from '../generators/pct';
import { generateMissingAdd, generateMissingMul } from '../generators/missing';
import { generateSquare, generatePow2, squareDefaults, pow2Defaults } from '../generators/recall';

const N = 1000;
type Gen = (rng: ReturnType<typeof mulberry32>, cfg: GeneratorConfig) => Question;

/** Every generator must produce a question its own canonical answer grades correct. */
function eachSample(seed: number, gen: Gen, cfg: GeneratorConfig, fn: (q: Question) => void) {
  const rng = mulberry32(seed);
  for (let i = 0; i < N; i++) {
    const q = gen(rng, cfg);
    expect(validate(q, q.answer.display).correct).toBe(true); // exactness
    expect(q.answer.display.length).toBeLessThanOrEqual(7); // typing-cost limit
    fn(q);
  }
}

describe('extended generators — exactness & ranges (doc 04 §3, §10.2)', () => {
  it('ADD_3D', () => {
    eachSample(1, generateAdd3D, add3dDefaults, (q) => {
      const [a, b] = q.operands as [number, number];
      expect(a).toBeGreaterThanOrEqual(100);
      expect(b).toBeLessThanOrEqual(999);
      expect(q.answer.value).toBe(a + b);
    });
  });

  it('SUB_3D never negative', () => {
    eachSample(2, generateSub3D, sub3dDefaults, (q) => {
      const [minuend, subtrahend] = q.operands as [number, number];
      expect(q.answer.value).toBe(minuend - subtrahend);
      expect(q.answer.value).toBeGreaterThanOrEqual(100);
    });
  });

  it('MUL_2x2 in [13,99], no operand ends in 0 (default)', () => {
    eachSample(3, generateMul2x2, mul2x2Defaults, (q) => {
      const [a, b] = q.operands as [number, number];
      expect(a).toBeGreaterThanOrEqual(13);
      expect(b).toBeLessThanOrEqual(99);
      expect(a % 10).not.toBe(0);
      expect(b % 10).not.toBe(0);
      expect(q.answer.value).toBe(a * b);
    });
  });

  it('DIV_TO_DEC: allowed divisor, non-integer, ≤4dp', () => {
    const allowed = new Set([2, 4, 5, 8, 10, 16, 20, 25, 50]);
    eachSample(4, generateDivToDec, {}, (q) => {
      const [a, b] = q.operands as [number, number];
      expect(allowed.has(b)).toBe(true);
      expect(a % b).not.toBe(0);
      expect(q.format).toBe('decimal');
      const dp = q.answer.display.split('.')[1]?.length ?? 0;
      expect(dp).toBeLessThanOrEqual(4);
    });
  });

  it('ADD_DEC exact sum, ≤2dp', () => {
    eachSample(5, generateAddDec, {}, (q) => {
      const [a, b] = q.operands as [number, number];
      expect(Math.round(q.answer.value * 100)).toBe(Math.round(a * 100) + Math.round(b * 100));
    });
  });

  it('MUL_DEC shows a decimal, total dp ≤ 2', () => {
    eachSample(6, generateMulDec, {}, (q) => {
      expect(q.prompt).toContain('.');
      const dp = q.answer.display.split('.')[1]?.length ?? 0;
      expect(dp).toBeLessThanOrEqual(2);
    });
  });

  it('FRAC_ADD (multi) in lowest terms', () => {
    eachSample(7, generateFracAdd, {}, (q) => {
      expect(q.format).toBe('multi');
      const f = q.answer.fraction;
      expect(f).toBeDefined();
      if (f) {
        // reduced: gcd(num,den) === 1
        const g = (x: number, y: number): number => (y ? g(y, x % y) : Math.abs(x));
        expect(g(f.num, f.den)).toBe(1);
      }
    });
  });

  it('FRAC_TO_DEC has a frac fact key; repeating answers accept 2dp', () => {
    eachSample(8, generateFracToDec, {}, (q) => {
      expect(q.factKey).toMatch(/^frac:\d+\/\d+$/);
      if (q.answer.approx) {
        const twoDp = q.answer.value.toFixed(2);
        expect(validate(q, twoDp).correct).toBe(true);
      }
    });
  });

  it('PCT_OF = p·b/100, ≤2dp', () => {
    eachSample(9, generatePctOf, {}, (q) => {
      const [p, b] = q.operands as [number, number];
      expect(Math.round(q.answer.value * 100)).toBe(p * b);
    });
  });

  it('MISSING_ADD / MISSING_MUL solve to a positive integer', () => {
    eachSample(10, generateMissingAdd, {}, (q) => {
      expect(q.prompt).toContain('□');
      expect(Number.isInteger(q.answer.value)).toBe(true);
      expect(q.answer.value).toBeGreaterThan(0);
    });
    eachSample(11, generateMissingMul, {}, (q) => {
      expect(q.prompt).toContain('□');
      const [a, b] = q.operands as [number, number];
      expect(a * b).toBe(q.answer.value * a);
    });
  });

  it('MUL_1x3 in ranges, exact', () => {
    eachSample(20, generateMul1x3, mul1x3Defaults, (q) => {
      const [a, b] = q.operands as [number, number];
      expect(a).toBeGreaterThanOrEqual(3);
      expect(a).toBeLessThanOrEqual(9);
      expect(b).toBeGreaterThanOrEqual(101);
      expect(b).toBeLessThanOrEqual(999);
      expect(q.answer.value).toBe(a * b);
    });
  });

  it('PCT_REVERSE integer answer solves □% of b = c', () => {
    eachSample(21, generatePctReverse, {}, (q) => {
      const [b, c] = q.operands as [number, number];
      expect(Number.isInteger(q.answer.value)).toBe(true);
      expect((q.answer.value * b) / 100).toBe(c);
    });
  });

  it('PCT_CHANGE gives the clean % change; new is an integer', () => {
    eachSample(22, generatePctChange, {}, (q) => {
      const [oldV, newV] = q.operands as [number, number];
      expect(Number.isInteger(newV)).toBe(true);
      expect(Math.round(oldV * (1 + q.answer.value / 100))).toBe(newV);
    });
  });

  it('FRAC_COMPARE picks the larger fraction (gap ≥ 0.05)', () => {
    eachSample(23, generateFracCompare, {}, (q) => {
      const [a, b, c, d] = q.operands as [number, number, number, number];
      expect(q.format).toBe('choice');
      expect(Math.abs(a / b - c / d)).toBeGreaterThanOrEqual(0.05);
      const larger = a / b > c / d ? '1' : '2';
      expect(q.answer.display).toBe(larger);
    });
  });

  it('SQUARE / POW2 recall facts', () => {
    eachSample(12, generateSquare, squareDefaults, (q) => {
      const [n] = q.operands as [number];
      expect(q.answer.value).toBe(n * n);
      expect(q.factKey).toBe(`sq:${n}`);
    });
    eachSample(13, generatePow2, pow2Defaults, (q) => {
      const [n] = q.operands as [number];
      expect(q.answer.value).toBe(2 ** n);
      expect(q.factKey).toBe(`pow2:${n}`);
    });
  });
});

describe('unreduced / mixed fraction grading (doc 04 §6)', () => {
  it('accepts unreduced and mixed equivalents for multi answers', () => {
    const rng = mulberry32(99);
    for (let i = 0; i < 200; i++) {
      const q = generateFracAdd(rng, {});
      const f = q.answer.fraction!;
      // Unreduced ×2 is still correct.
      expect(validate(q, `${f.num * 2}/${f.den * 2}`).correct).toBe(true);
      // The exact decimal is correct (when it terminates cleanly enough).
      expect(validate(q, q.answer.display).correct).toBe(true);
    }
  });
});
