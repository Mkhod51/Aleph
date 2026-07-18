import { seedFromString } from '@/lib/prng';
import { localDateKey } from '@/lib/format';
import { buildPlanFromPreset, ZETAMAC_DEFAULT } from './presets';
import type { BuiltPlan } from './presets';

/** YYYY-MM-DD for the local day of `nowMs`. */
export function todayKey(nowMs = Date.now()): string {
  return localDateKey(nowMs);
}

/**
 * Daily-challenge seed — doc 04 §2: hash("qs-daily-" + YYYY-MM-DD). Every user
 * everywhere gets the identical sequence for a given date (leaderboard-comparable
 * without a server).
 */
export function dailySeed(dateKey: string): number {
  return seedFromString(`qs-daily-${dateKey}`);
}

/**
 * The daily challenge is the Zetamac Default config (120 s, no extended content)
 * seeded by date, with mode 'daily'. It shares the zetamac configHash but the
 * 'daily' mode keeps it out of the sprint series and gives it its own PB key.
 */
export function buildDailyPlan(dateKey: string): BuiltPlan {
  const base = buildPlanFromPreset(ZETAMAC_DEFAULT, dailySeed(dateKey));
  return { ...base, mode: 'daily' };
}
