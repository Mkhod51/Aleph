/**
 * Spaced-repetition (Leitner) mechanics — doc 05 §5. Pure functions over
 * primitives; the store applies them to SrsCard records. No ease factors / SM-2.
 */

export const SRS_INTERVALS_DAYS = [0, 1, 3, 7, 21] as const;
export const SRS_MAX_BOX = 5;
export const SRS_MIN_BOX = 1;
export const SRS_DEFAULT_TARGET_MS = 3000;
/** Box-1 cards re-queue later the same day (doc 05 §5). */
export const SRS_REQUEUE_MS = 10 * 60 * 1000;

export type Box = 1 | 2 | 3 | 4 | 5;

/** Correct within the target time promotes; anything else demotes to box 1. */
export function promoted(correct: boolean, elapsedMs: number, targetMs: number): boolean {
  return correct && elapsedMs <= targetMs;
}

/** Next box after a review (promote → +1 capped at 5; else back to box 1). */
export function nextBox(box: Box, promote: boolean): Box {
  return (promote ? Math.min(SRS_MAX_BOX, box + 1) : SRS_MIN_BOX) as Box;
}

/** Local midnight (00:00) for the day containing `ms`. */
export function startOfLocalDay(ms: number): number {
  const d = new Date(ms);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** Local midnight `days` after the day containing `ms` (DST-safe via Date math). */
export function addLocalDays(ms: number, days: number): number {
  const d = new Date(ms);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + days).getTime();
}

/**
 * Next due timestamp for a card that just entered `box`. Box 1 (interval 0) is
 * re-queued 10 min later the same day; higher boxes are local-midnight-aligned.
 */
export function nextDueAt(box: Box, nowMs: number): number {
  const days = SRS_INTERVALS_DAYS[box - 1] as number;
  if (days === 0) return nowMs + SRS_REQUEUE_MS;
  return addLocalDays(nowMs, days);
}

/** A card is due when it is not suspended and its due time has passed. */
export function isDue(dueAt: number, suspended: boolean, nowMs: number): boolean {
  return !suspended && dueAt <= nowMs;
}
