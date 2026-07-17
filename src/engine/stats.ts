import type { SkillTag } from './types';
import { median } from './scoring';

/**
 * Metric formulas — doc 05 §2. Pure functions over primitive inputs so the engine
 * stays free of store/UI types; the store layer maps Session/FactStat onto these.
 */

/** Target answer time per tag family, ms (doc 04 §7). */
export function targetMsForTag(tag: SkillTag): number {
  switch (tag) {
    case 'ADD_2D':
    case 'ADD_3D':
    case 'ADD_DEC':
    case 'SUB_2D':
    case 'SUB_3D':
    case 'SUB_DEC':
    case 'MISSING_ADD':
      return 4000;
    case 'MUL_1x2':
    case 'MUL_1x1':
    case 'DIV_EXACT':
    case 'DIV_TO_DEC':
    case 'DIV_DEC':
    case 'MISSING_MUL':
      return 5000;
    case 'MUL_2x2':
    case 'MUL_1x3':
    case 'MUL_DEC':
      return 8000;
    case 'SQUARE':
    case 'POW2':
    case 'FRAC_TO_DEC':
      return 3000;
    default:
      return 6000; // FRAC_*, PCT_*, SEQ_*
  }
}

/** Mean score of the last `window` entries of a chronological list. */
export function rollingAverage(scores: number[], window = 7): number {
  if (scores.length === 0) return 0;
  const slice = scores.slice(-window);
  return slice.reduce((a, b) => a + b, 0) / slice.length;
}

/**
 * Trend direction: sign of (recent rolling-7 mean) − (previous rolling-7 mean).
 * Returns null until ≥ 14 sessions exist (doc 05 §2). `scores` is chronological.
 */
export function trendDirection(scores: number[]): -1 | 0 | 1 | null {
  if (scores.length < 14) return null;
  const recent = rollingAverage(scores.slice(-7), 7);
  const previous = rollingAverage(scores.slice(-14, -7), 7);
  const d = recent - previous;
  return d > 0 ? 1 : d < 0 ? -1 : 0;
}

export type Mastery = '—' | 'learning' | 'solid';

/** Skill mastery chip (doc 05 §2). */
export function masteryLevel(input: {
  attempts: number;
  accuracy: number;
  medianLatencyMs: number;
  targetMs: number;
}): Mastery {
  if (input.attempts < 10) return '—';
  if (input.accuracy < 0.85 || input.medianLatencyMs > input.targetMs) {
    return 'learning';
  }
  return 'solid';
}

/**
 * Weak-fact detection (doc 03 §6): attempts ≥ 3 and (accuracy < 70% OR median
 * latency > 1.5× the reference median for its skill family).
 */
export function isWeakFact(input: {
  attempts: number;
  accuracy: number;
  medianLatencyMs: number;
  referenceMedianMs: number;
}): boolean {
  if (input.attempts < 3) return false;
  if (input.accuracy < 0.7) return true;
  return (
    input.referenceMedianMs > 0 &&
    input.medianLatencyMs > 1.5 * input.referenceMedianMs
  );
}

/** Accuracy within each index-quartile of a session (fatigue signal, doc 05 §2). */
export function quartileAccuracy(correct: boolean[]): number[] {
  const n = correct.length;
  if (n === 0) return [0, 0, 0, 0];
  const out: number[] = [];
  for (let q = 0; q < 4; q++) {
    const start = Math.floor((q * n) / 4);
    const end = Math.floor(((q + 1) * n) / 4);
    const slice = correct.slice(start, end);
    out.push(slice.length ? slice.filter(Boolean).length / slice.length : 0);
  }
  return out;
}

/** Fatigue delta: last-quartile accuracy − first-quartile accuracy. */
export function fatigueDelta(correct: boolean[]): number {
  const q = quartileAccuracy(correct);
  return (q[3] as number) - (q[0] as number);
}

/** Running median of a bounded latency sample (re-exported for convenience). */
export { median };
