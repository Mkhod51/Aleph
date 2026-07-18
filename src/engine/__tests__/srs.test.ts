import { describe, it, expect } from 'vitest';
import {
  promoted,
  nextBox,
  nextDueAt,
  isDue,
  startOfLocalDay,
  addLocalDays,
  SRS_DEFAULT_TARGET_MS,
  SRS_REQUEUE_MS,
} from '../srs';
import { composeGapWeights } from '../stats';

describe('Leitner transitions (doc 05 §5, DoD)', () => {
  it('promotes only when correct within the target time', () => {
    expect(promoted(true, 2000, SRS_DEFAULT_TARGET_MS)).toBe(true);
    // correct but slow (5 s) demotes — acceptance case
    expect(promoted(true, 5000, SRS_DEFAULT_TARGET_MS)).toBe(false);
    expect(promoted(false, 1000, SRS_DEFAULT_TARGET_MS)).toBe(false);
  });

  it('nextBox: promote climbs to max 5; miss resets to box 1', () => {
    expect(nextBox(1, true)).toBe(2);
    expect(nextBox(4, true)).toBe(5);
    expect(nextBox(5, true)).toBe(5);
    expect(nextBox(3, false)).toBe(1);
    expect(nextBox(5, false)).toBe(1);
  });
});

describe('due scheduling with midnight / timezone (DoD)', () => {
  const noon = new Date(2026, 6, 18, 12, 0, 0, 0).getTime(); // local noon, 18 Jul 2026

  it('box 1 re-queues 10 minutes later the same day', () => {
    expect(nextDueAt(1, noon)).toBe(noon + SRS_REQUEUE_MS);
  });

  it('higher boxes align to local midnight + interval days', () => {
    expect(nextDueAt(2, noon)).toBe(addLocalDays(noon, 1));
    expect(nextDueAt(3, noon)).toBe(addLocalDays(noon, 3));
    expect(nextDueAt(4, noon)).toBe(addLocalDays(noon, 7));
    expect(nextDueAt(5, noon)).toBe(addLocalDays(noon, 21));
    // The due time is exactly local midnight (no time-of-day component).
    expect(nextDueAt(2, noon)).toBe(startOfLocalDay(nextDueAt(2, noon)));
  });

  it('a box-2 card is not due late today but is due at/after next midnight', () => {
    const due = nextDueAt(2, noon); // tomorrow 00:00 local
    const lateToday = new Date(2026, 6, 18, 23, 59, 0, 0).getTime();
    const nextMidnight = new Date(2026, 6, 19, 0, 0, 0, 0).getTime();
    expect(isDue(due, false, lateToday)).toBe(false);
    expect(isDue(due, false, nextMidnight)).toBe(true);
  });

  it('suspended cards are never due', () => {
    expect(isDue(0, true, noon)).toBe(false);
  });
});

describe('Fix-My-Gaps composition (doc 03 §6, DoD)', () => {
  it('draws ~70% from weak tags, ~30% from the random pool', () => {
    const weak = ['MUL_2x2', 'DIV_EXACT'] as const;
    const pool = ['ADD_2D', 'SUB_2D', 'MUL_1x2', 'MUL_2x2', 'DIV_EXACT'] as const;
    const w = composeGapWeights([...weak], [...pool]);
    const weakSum = weak.reduce((s: number, t) => s + (w[t] ?? 0), 0);
    const total = Object.values(w).reduce((s: number, x) => s + (x ?? 0), 0);
    expect(total).toBeCloseTo(100, 6);
    expect(weakSum).toBeCloseTo(70, 6);
  });

  it('with no weak tags, spreads evenly over the pool', () => {
    const pool = ['ADD_2D', 'SUB_2D'] as const;
    const w = composeGapWeights([], [...pool]);
    expect(w.ADD_2D).toBeCloseTo(50, 6);
    expect(w.SUB_2D).toBeCloseTo(50, 6);
  });
});
