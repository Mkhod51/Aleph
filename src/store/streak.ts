import { create } from 'zustand';
import { startOfLocalDay } from '@/engine';
import type { Streak } from './types';

/**
 * Streak logic — doc 05 §6. Increments on the first official daily completion
 * each local day; a missed day consumes a freeze (earned 1 per 7-day streak,
 * cap 3) or resets the streak. All transitions run on app open + session end;
 * no background timers.
 */

const STORAGE_KEY = 'aleph-streak';
const MAX_FREEZES = 3;
const DAY_MS = 86_400_000;

export const EMPTY_STREAK: Streak = { current: 0, best: 0, lastDate: '', freezes: 0 };

/** Whole local-day difference between two YYYY-MM-DD keys (b − a). */
export function dayDiff(a: string, b: string): number {
  if (!a || !b) return Infinity;
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  const aMs = startOfLocalDay(new Date(ay!, am! - 1, ad!).getTime());
  const bMs = startOfLocalDay(new Date(by!, bm! - 1, bd!).getTime());
  return Math.round((bMs - aMs) / DAY_MS);
}

/** Record the first official daily completion for `today`. */
export function applyDailyCompletion(s: Streak, today: string): Streak {
  if (s.lastDate === today) return s; // already counted today
  let current: number;
  let freezes = s.freezes;

  if (!s.lastDate) {
    current = 1;
  } else {
    const gap = dayDiff(s.lastDate, today);
    const missed = gap - 1;
    if (missed <= 0) {
      current = s.current + 1; // consecutive day
    } else if (freezes >= missed) {
      freezes -= missed; // freezes bridge the gap
      current = s.current + 1;
    } else {
      current = 1; // streak broke; today starts a fresh one
      freezes = 0;
    }
  }

  if (current % 7 === 0) freezes = Math.min(MAX_FREEZES, freezes + 1);
  return { current, best: Math.max(s.best, current), lastDate: today, freezes };
}

/** On app open: a gap the freezes can't cover shows the streak as broken. */
export function reconcileOnOpen(s: Streak, today: string): Streak {
  if (!s.lastDate || s.current === 0) return s;
  const gap = dayDiff(s.lastDate, today);
  if (gap >= 2 && gap - 1 > s.freezes) return { ...s, current: 0 };
  return s;
}

function readStreak(): Streak {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...EMPTY_STREAK, ...(JSON.parse(raw) as Streak) } : EMPTY_STREAK;
  } catch {
    return EMPTY_STREAK;
  }
}

function writeStreak(s: Streak): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

interface StreakStore extends Streak {
  recordDaily: (today: string) => void;
  reconcile: (today: string) => void;
  playedToday: (today: string) => boolean;
}

export const useStreakStore = create<StreakStore>((set, get) => ({
  ...readStreak(),
  recordDaily: (today) => {
    const next = applyDailyCompletion(get(), today);
    writeStreak(next);
    set(next);
  },
  reconcile: (today) => {
    const next = reconcileOnOpen(get(), today);
    if (next !== get()) {
      writeStreak(next);
      set(next);
    }
  },
  playedToday: (today) => get().lastDate === today,
}));
