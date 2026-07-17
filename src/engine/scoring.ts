import type { AttemptLite, Score, ScoringRule, Vitals } from './types';

/** Median of a numeric list (average of the two middles for even counts). */
export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid] as number;
  return ((sorted[mid - 1] as number) + (sorted[mid] as number)) / 2;
}

/** p-th percentile via nearest-rank (p in [0,100]). */
export function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const rank = Math.ceil((p / 100) * sorted.length);
  const idx = Math.min(Math.max(rank - 1, 0), sorted.length - 1);
  return sorted[idx] as number;
}

/**
 * scoreSession — doc 04 §9. Returns the mode's score and the shared vitals
 * bundle (results screens and the dashboard use one implementation).
 *
 * `durationMs` (actual elapsed play time) is needed for throughput; when omitted
 * it falls back to the summed answer times.
 */
export function scoreSession(
  rule: ScoringRule,
  attempts: AttemptLite[],
  durationMs?: number,
): Score {
  let correct = 0;
  let wrong = 0;
  let skipped = 0; // unanswered / skipped / timed-out (given === null)
  const correctLatencies: number[] = [];
  const thinkTimes: number[] = [];

  for (const a of attempts) {
    if (a.given === null) {
      skipped++;
      continue;
    }
    if (typeof a.firstKeyMs === 'number') thinkTimes.push(a.firstKeyMs);
    if (a.correct) {
      correct++;
      correctLatencies.push(a.totalMs);
    } else {
      wrong++;
    }
  }

  // Accuracy denominator: in net (sim) modes a skip is a decision and counts as
  // attempted; in count (flow) modes there are no skips (doc 05 §2).
  const attempted = rule.kind === 'net' ? correct + wrong + skipped : correct + wrong;
  const accuracy = attempted > 0 ? correct / attempted : 0;

  const activeMs =
    durationMs ?? attempts.reduce((sum, a) => sum + Math.max(0, a.totalMs), 0);
  const perMin = activeMs > 0 ? correct / (activeMs / 60000) : 0;

  const vitals: Vitals = {
    attempted,
    correct,
    wrong,
    skipped,
    accuracy,
    medianLatencyMs: median(correctLatencies),
    p90LatencyMs: percentile(correctLatencies, 90),
    perMin,
    thinkTimeMs: median(thinkTimes),
  };

  const score =
    rule.kind === 'count' ? correct : correct * rule.plus - wrong * rule.minus;

  return { score, vitals };
}
