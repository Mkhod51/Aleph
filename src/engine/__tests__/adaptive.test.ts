import { describe, it, expect } from 'vitest';
import {
  ADAPTIVE_START,
  nextAdaptiveRating,
  tierFromRating,
} from '../difficulty';

describe('adaptive rating (doc 04 §7, §10.6)', () => {
  it('starts at 1.5 and rises with fast-correct answers, clamped at 3', () => {
    let r = ADAPTIVE_START;
    expect(r).toBe(1.5);
    // fast-correct → +0.08
    r = nextAdaptiveRating(r, { correct: true, fast: true });
    expect(r).toBeCloseTo(1.58, 10);
    for (let i = 0; i < 40; i++) r = nextAdaptiveRating(r, { correct: true, fast: true });
    expect(r).toBe(3); // clamped
  });

  it('slow-correct nudges up less than fast-correct', () => {
    expect(nextAdaptiveRating(2, { correct: true, fast: false })).toBeCloseTo(2.02, 10);
    expect(nextAdaptiveRating(2, { correct: true, fast: true })).toBeCloseTo(2.08, 10);
  });

  it('wrong answers drop the rating, clamped at 1', () => {
    expect(nextAdaptiveRating(2, { correct: false, fast: false })).toBeCloseTo(1.85, 10);
    let r = 1.2;
    for (let i = 0; i < 5; i++) r = nextAdaptiveRating(r, { correct: false, fast: false });
    expect(r).toBe(1); // clamped
  });

  it('a scripted stream converges as expected', () => {
    // 10 fast-correct then 4 wrong: 1.5 + 10·0.08 − 4·0.15 = 1.7
    let r = ADAPTIVE_START;
    for (let i = 0; i < 10; i++) r = nextAdaptiveRating(r, { correct: true, fast: true });
    for (let i = 0; i < 4; i++) r = nextAdaptiveRating(r, { correct: false, fast: false });
    expect(r).toBeCloseTo(1.7, 10);
    expect(tierFromRating(r)).toBe(2);
  });

  it('tierFromRating rounds and clamps to 1–3', () => {
    expect(tierFromRating(1.2)).toBe(1);
    expect(tierFromRating(1.5)).toBe(2); // round-half-up
    expect(tierFromRating(2.4)).toBe(2);
    expect(tierFromRating(2.6)).toBe(3);
    expect(tierFromRating(5)).toBe(3);
  });
});
