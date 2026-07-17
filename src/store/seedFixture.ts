import { mulberry32, intInRange } from '@/lib/prng';
import { ulid } from '@/lib/ulid';
import { db } from './db';
import { buildPlanFromPreset, ZETAMAC_DEFAULT } from './presets';
import { mulFactKey } from '@/engine';
import type { Attempt, FactStat, Session, SkillBreakdown } from './types';

/**
 * Seed synthetic history for perf/manual testing (doc 09 M2 DoD: dashboard < 400 ms
 * with 100k attempts). Produces sessions + FactStats (the aggregates the dashboard
 * reads) and optionally the raw attempts, to prove the dashboard never scans them.
 */
const TAGS = ['ADD_2D', 'SUB_2D', 'MUL_1x2', 'DIV_EXACT'] as const;

export interface SeedOptions {
  sessions?: number;
  attemptsPerSession?: number;
  includeRawAttempts?: boolean;
}

export async function seedSynthetic(opts: SeedOptions = {}): Promise<{
  sessions: number;
  attempts: number;
  facts: number;
}> {
  const sessionCount = opts.sessions ?? 1700;
  const perSession = opts.attemptsPerSession ?? 60;
  const rng = mulberry32(20260717);
  const built = buildPlanFromPreset(ZETAMAC_DEFAULT, 12345);
  const dayMs = 86_400_000;
  const base = Date.now() - sessionCount * (dayMs / 4);

  const sessions: Session[] = [];
  const attempts: Attempt[] = [];
  const factAgg = new Map<string, { attempts: number; correct: number; ms: number[] }>();

  for (let i = 0; i < sessionCount; i++) {
    const startedAt = base + i * (dayMs / 4);
    const score = intInRange(rng, 38, 74);
    const breakdown: SkillBreakdown = {};
    let attempted = 0;
    let correct = 0;

    for (const tag of TAGS) {
      const a = Math.round(perSession / TAGS.length);
      const c = Math.max(0, a - intInRange(rng, 0, 2));
      const medianMs = intInRange(rng, 1500, 5200);
      breakdown[tag] = { attempts: a, correct: c, medianMs };
      attempted += a;
      correct += c;

      if (opts.includeRawAttempts) {
        for (let k = 0; k < a; k++) {
          const x = intInRange(rng, 2, 12);
          const y = intInRange(rng, 2, 20);
          const fk = tag === 'MUL_1x2' || tag === 'DIV_EXACT' ? mulFactKey(x, y) : null;
          const isCorrect = k < c;
          const totalMs = medianMs + intInRange(rng, -500, 800);
          if (fk && isCorrect) {
            const e = factAgg.get(fk) ?? { attempts: 0, correct: 0, ms: [] };
            e.attempts++;
            e.correct++;
            e.ms.push(totalMs);
            factAgg.set(fk, e);
          } else if (fk) {
            const e = factAgg.get(fk) ?? { attempts: 0, correct: 0, ms: [] };
            e.attempts++;
            factAgg.set(fk, e);
          }
          attempts.push({
            id: ulid(startedAt + k),
            sessionId: `s${i}`,
            index: k,
            skill: tag,
            factKey: fk,
            prompt: `${x} × ${y}`,
            answerCanonical: String(x * y),
            given: isCorrect ? String(x * y) : null,
            correct: isCorrect,
            difficulty: 5,
            firstKeyMs: 400,
            totalMs,
            at: startedAt + k,
          });
        }
      }
    }

    const wrong = attempted - correct;
    sessions.push({
      id: `s${i}`,
      mode: 'sprint',
      configHash: built.configHash,
      plan: built.plan,
      engineVersion: 1,
      startedAt,
      durationMs: 120000,
      scoring: { kind: 'count' },
      score,
      vitals: {
        attempted: correct + wrong,
        correct,
        wrong,
        skipped: 0,
        accuracy: correct / (correct + wrong || 1),
        medianLatencyMs: 3000,
        p90LatencyMs: 5000,
        perMin: correct / 2,
        thinkTimeMs: 500,
      },
      completed: true,
      official: true,
      extended: false,
      skillBreakdown: breakdown,
    });
  }

  const facts: FactStat[] = [];
  if (opts.includeRawAttempts) {
    for (const [factKey, e] of factAgg) {
      const latencies = e.ms.slice(-20);
      const sorted = [...latencies].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      const medianLatencyMs = sorted.length
        ? sorted.length % 2
          ? (sorted[mid] as number)
          : ((sorted[mid - 1] as number) + (sorted[mid] as number)) / 2
        : 0;
      facts.push({
        factKey,
        attempts: e.attempts,
        correct: e.correct,
        latencies,
        medianLatencyMs,
        weak: e.attempts >= 3 && e.correct / e.attempts < 0.7,
        updatedAt: Date.now(),
      });
    }
  }

  await db.sessions.bulkAdd(sessions);
  if (facts.length) await db.factStats.bulkAdd(facts);
  if (attempts.length) {
    for (let i = 0; i < attempts.length; i += 5000) {
      await db.attempts.bulkAdd(attempts.slice(i, i + 5000));
    }
  }

  return { sessions: sessions.length, attempts: attempts.length, facts: facts.length };
}
