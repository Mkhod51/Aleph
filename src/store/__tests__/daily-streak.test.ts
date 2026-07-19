import { describe, it, expect } from 'vitest';
import { createQuestionStream } from '@/engine';
import { buildDailyPlan, dailySeed } from '../daily';
import {
  applyDailyCompletion,
  reconcileOnOpen,
  dayDiff,
  mergeStreak,
  EMPTY_STREAK,
} from '../streak';
import type { Streak } from '../types';

function seq(dateKey: string, n: number): string[] {
  const stream = createQuestionStream(buildDailyPlan(dateKey).plan);
  return Array.from({ length: n }, () => {
    const q = stream.next();
    return `${q.skill}|${q.prompt}|${q.answer.value}`;
  });
}

describe('daily-challenge determinism (doc 03 §5, doc 04 §2, DoD)', () => {
  it('same date ⇒ identical question sequence (cross-browser)', () => {
    expect(seq('2026-07-18', 200)).toEqual(seq('2026-07-18', 200));
  });

  it('different dates ⇒ different sequences', () => {
    expect(seq('2026-07-18', 100)).not.toEqual(seq('2026-07-19', 100));
    expect(dailySeed('2026-07-18')).not.toBe(dailySeed('2026-07-19'));
  });
});

describe('streak transitions (doc 05 §6)', () => {
  it('first completion starts a streak of 1', () => {
    expect(applyDailyCompletion(EMPTY_STREAK, '2026-07-18').current).toBe(1);
  });

  it('consecutive days increment; replay same day is a no-op', () => {
    let s = applyDailyCompletion(EMPTY_STREAK, '2026-07-18');
    s = applyDailyCompletion(s, '2026-07-19');
    expect(s.current).toBe(2);
    const same = applyDailyCompletion(s, '2026-07-19');
    expect(same).toBe(s); // unchanged
  });

  it('a freeze bridges a single missed day', () => {
    const s: typeof EMPTY_STREAK = { current: 3, best: 3, lastDate: '2026-07-16', freezes: 1 };
    const next = applyDailyCompletion(s, '2026-07-18'); // missed the 17th
    expect(next.current).toBe(4);
    expect(next.freezes).toBe(0);
  });

  it('a gap with no freeze resets to a fresh streak of 1', () => {
    const s: typeof EMPTY_STREAK = { current: 5, best: 5, lastDate: '2026-07-15', freezes: 0 };
    const next = applyDailyCompletion(s, '2026-07-18');
    expect(next.current).toBe(1);
  });

  it('earns a freeze every 7-day streak, capped at 3', () => {
    let s = EMPTY_STREAK;
    for (let d = 1; d <= 7; d++) {
      s = applyDailyCompletion(s, `2026-07-${String(d).padStart(2, '0')}`);
    }
    expect(s.current).toBe(7);
    expect(s.freezes).toBe(1);
  });

  it('reconcileOnOpen breaks the streak when a gap outstrips freezes', () => {
    const alive: typeof EMPTY_STREAK = { current: 4, best: 4, lastDate: '2026-07-17', freezes: 0 };
    // Opening on the 18th (yesterday was the 17th → gap 1) keeps it alive.
    expect(reconcileOnOpen(alive, '2026-07-18').current).toBe(4);
    // Opening on the 20th (missed 18th & 19th, no freezes) breaks it.
    expect(reconcileOnOpen(alive, '2026-07-20').current).toBe(0);
  });

  it('dayDiff counts whole local days', () => {
    expect(dayDiff('2026-07-18', '2026-07-19')).toBe(1);
    expect(dayDiff('2026-07-01', '2026-07-08')).toBe(7);
    expect(dayDiff('2026-02-28', '2026-03-01')).toBe(1); // 2026 not a leap year
  });
});

describe('mergeStreak — import reconciliation (F3, doc 05 §7)', () => {
  const older: Streak = { current: 3, best: 5, lastDate: '2026-07-10', freezes: 2 };
  const newer: Streak = { current: 7, best: 7, lastDate: '2026-07-19', freezes: 0 };

  it('replace always takes the bundle (even null → empty)', () => {
    expect(mergeStreak(newer, older, 'replace')).toEqual(older);
    expect(mergeStreak(newer, null, 'replace')).toEqual(EMPTY_STREAK);
  });

  it('merge keeps the later lastDate regardless of direction', () => {
    expect(mergeStreak(older, newer, 'merge')).toEqual(newer);
    expect(mergeStreak(newer, older, 'merge')).toEqual(newer);
  });

  it('merge breaks a same-day tie by higher current, keeping local on a dead tie', () => {
    const a: Streak = { current: 4, best: 6, lastDate: '2026-07-19', freezes: 1 };
    const b: Streak = { current: 9, best: 9, lastDate: '2026-07-19', freezes: 0 };
    expect(mergeStreak(a, b, 'merge')).toEqual(b); // incoming higher current
    expect(mergeStreak(b, a, 'merge')).toEqual(b); // local higher current kept
    expect(mergeStreak(a, a, 'merge')).toEqual(a); // dead tie → local
  });

  it('merge treats a dated streak as newer than an undated one, and ignores null', () => {
    expect(mergeStreak(EMPTY_STREAK, newer, 'merge')).toEqual(newer);
    expect(mergeStreak(newer, EMPTY_STREAK, 'merge')).toEqual(newer);
    expect(mergeStreak(newer, null, 'merge')).toEqual(newer);
  });
});
