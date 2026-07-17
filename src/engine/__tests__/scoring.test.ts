import { describe, it, expect } from 'vitest';
import { scoreSession, median, percentile } from '../scoring';
import type { AttemptLite } from '../types';

function correct(totalMs: number, firstKeyMs = 300): AttemptLite {
  return { correct: true, given: String(totalMs), totalMs, firstKeyMs };
}
function wrong(totalMs: number, firstKeyMs = 300): AttemptLite {
  return { correct: false, given: 'x', totalMs, firstKeyMs };
}
function skip(): AttemptLite {
  return { correct: false, given: null, totalMs: 0 };
}

describe('helpers', () => {
  it('median handles odd and even lengths', () => {
    expect(median([])).toBe(0);
    expect(median([5])).toBe(5);
    expect(median([1, 2, 3])).toBe(2);
    expect(median([1, 2, 3, 4])).toBe(2.5);
  });

  it('p90 uses nearest-rank', () => {
    expect(percentile([1000, 2000, 3000], 90)).toBe(3000);
    expect(percentile(Array.from({ length: 10 }, (_, i) => (i + 1) * 100), 90)).toBe(
      900,
    );
  });
});

describe('count scoring (sprints/drills, doc 04 §9)', () => {
  it('score is the number of correct; vitals match hand-computed values', () => {
    const attempts = [
      correct(1000),
      correct(2000),
      correct(3000),
      wrong(1500),
      skip(),
    ];
    const { score, vitals } = scoreSession({ kind: 'count' }, attempts, 60000);
    expect(score).toBe(3);
    // count mode: skips excluded from accuracy denominator (flow has no skips).
    expect(vitals.attempted).toBe(4);
    expect(vitals.correct).toBe(3);
    expect(vitals.wrong).toBe(1);
    expect(vitals.skipped).toBe(1);
    expect(vitals.accuracy).toBeCloseTo(0.75, 10);
    expect(vitals.medianLatencyMs).toBe(2000); // median of correct latencies only
    expect(vitals.p90LatencyMs).toBe(3000);
    expect(vitals.perMin).toBeCloseTo(3, 10); // 3 correct in 60s
  });
});

describe('net scoring (sims, doc 04 §9)', () => {
  it('Optiver fixture: 60 right / 12 wrong / 8 unanswered → net 48 (doc 03 §3)', () => {
    const attempts: AttemptLite[] = [
      ...Array.from({ length: 60 }, () => correct(4000)),
      ...Array.from({ length: 12 }, () => wrong(4000)),
      ...Array.from({ length: 8 }, () => skip()),
    ];
    const { score, vitals } = scoreSession({ kind: 'net', plus: 1, minus: 1 }, attempts);
    expect(score).toBe(48);
    // net mode: a skip is a decision and counts as attempted.
    expect(vitals.attempted).toBe(80);
    expect(vitals.skipped).toBe(8);
    expect(vitals.accuracy).toBeCloseTo(60 / 80, 10);
  });

  it('all-skip → net 0, accuracy 0', () => {
    const attempts = Array.from({ length: 10 }, () => skip());
    const { score, vitals } = scoreSession({ kind: 'net', plus: 1, minus: 1 }, attempts);
    expect(score).toBe(0);
    expect(vitals.accuracy).toBe(0);
    expect(vitals.attempted).toBe(10);
  });

  it('all-wrong → negative net with the configured penalty', () => {
    const attempts = Array.from({ length: 5 }, () => wrong(3000));
    const { score } = scoreSession({ kind: 'net', plus: 1, minus: 2 }, attempts);
    expect(score).toBe(-10);
  });
});
