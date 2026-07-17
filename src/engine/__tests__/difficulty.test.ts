import { describe, it, expect } from 'vitest';
import {
  addDifficulty,
  subDifficulty,
  mulDifficulty,
  divDifficulty,
  additionCarries,
  subtractionBorrows,
  isUnround,
  digitCount,
} from '../difficulty';

describe('difficulty primitives', () => {
  it('digitCount', () => {
    expect(digitCount(0)).toBe(1);
    expect(digitCount(7)).toBe(1);
    expect(digitCount(42)).toBe(2);
    expect(digitCount(1000)).toBe(4);
    expect(digitCount(-999)).toBe(3);
  });

  it('isUnround', () => {
    expect(isUnround(10)).toBe(false);
    expect(isUnround(25)).toBe(false);
    expect(isUnround(23)).toBe(true);
  });

  it('carries and borrows', () => {
    expect(additionCarries(2, 3)).toBe(0);
    expect(additionCarries(7, 8)).toBe(1);
    expect(additionCarries(99, 1)).toBe(2);
    expect(subtractionBorrows(50, 30)).toBe(0);
    expect(subtractionBorrows(52, 38)).toBe(1);
  });
});

describe('static difficulty is monotonic on constructed easy < hard pairs (doc 04 §10.6)', () => {
  it('addition: small no-carry < large multi-carry', () => {
    expect(addDifficulty(3, 4, 7)).toBeLessThan(addDifficulty(87, 96, 183));
  });

  it('subtraction: no-borrow < multi-borrow', () => {
    expect(subDifficulty(50, 30, 20)).toBeLessThan(subDifficulty(83, 47, 36));
  });

  it('multiplication: 1×1 round < 2×2 both-unround', () => {
    expect(mulDifficulty(2, 3, 6)).toBeLessThan(mulDifficulty(47, 83, 3901));
  });

  it('multiplication: 2×2 both-unround gets the extra penalty over a round 2×2', () => {
    expect(mulDifficulty(20, 30, 600)).toBeLessThan(mulDifficulty(23, 37, 851));
  });

  it('division: small < large-unround', () => {
    expect(divDifficulty(6, 2, 3)).toBeLessThan(divDifficulty(3901, 47, 83));
  });

  it('all values stay within [1,12]', () => {
    const vals = [
      addDifficulty(3, 4, 7),
      addDifficulty(999, 999, 1998),
      subDifficulty(200, 199, 1),
      mulDifficulty(97, 89, 8633),
      divDifficulty(9999, 99, 101),
    ];
    for (const v of vals) {
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(12);
    }
  });
});
