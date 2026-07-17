import { describe, it, expect } from 'vitest';
import {
  mulberry32,
  split,
  childRng,
  intInRange,
  weightedIndex,
  seedFromString,
} from '../prng';

describe('mulberry32 (doc 04 §2)', () => {
  it('is deterministic for a given seed', () => {
    const a = Array.from({ length: 100 }, mulberry32(12345));
    const b = Array.from({ length: 100 }, mulberry32(12345));
    expect(a).toEqual(b);
  });

  it('returns floats in [0,1)', () => {
    const rng = mulberry32(1);
    for (let i = 0; i < 1000; i++) {
      const x = rng();
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });

  it('different seeds diverge', () => {
    const a = Array.from({ length: 50 }, mulberry32(1));
    const b = Array.from({ length: 50 }, mulberry32(2));
    expect(a).not.toEqual(b);
  });
});

describe('split / childRng', () => {
  it('produces independent streams per label', () => {
    const s = 999;
    expect(split(s, 'order')).not.toBe(split(s, 'operands'));
    const order = Array.from({ length: 20 }, childRng(s, 'order'));
    const operands = Array.from({ length: 20 }, childRng(s, 'operands'));
    expect(order).not.toEqual(operands);
  });

  it('seedFromString is stable', () => {
    expect(seedFromString('qs-daily-2026-07-17')).toBe(
      seedFromString('qs-daily-2026-07-17'),
    );
  });
});

describe('helpers', () => {
  it('intInRange stays within inclusive bounds and hits both ends', () => {
    const rng = mulberry32(7);
    let sawMin = false;
    let sawMax = false;
    for (let i = 0; i < 5000; i++) {
      const n = intInRange(rng, 2, 5);
      expect(n).toBeGreaterThanOrEqual(2);
      expect(n).toBeLessThanOrEqual(5);
      if (n === 2) sawMin = true;
      if (n === 5) sawMax = true;
    }
    expect(sawMin && sawMax).toBe(true);
  });

  it('weightedIndex respects weights approximately', () => {
    const rng = mulberry32(3);
    const weights = [10, 90];
    const counts = [0, 0];
    for (let i = 0; i < 10000; i++) counts[weightedIndex(rng, weights)]!++;
    expect(counts[1]! / 10000).toBeGreaterThan(0.85);
    expect(counts[1]! / 10000).toBeLessThan(0.95);
  });
});
