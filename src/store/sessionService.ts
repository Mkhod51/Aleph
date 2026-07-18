import {
  ENGINE_VERSION,
  median,
  scoreSession,
  type ScoringRule,
  type SessionPlan,
  type SkillTag,
} from '@/engine';
import { ulid } from '@/lib/ulid';
import { db } from './db';
import { pbKey } from './presets';
import { sessionRepo } from './repos/sessionRepo';
import { attemptRepo } from './repos/attemptRepo';
import { dailyRepo } from './repos/dailyRepo';
import { enrollWeakFacts } from './srs';
import { todayKey } from './daily';
import { useStreakStore } from './streak';
import type {
  Attempt,
  FactStat,
  PersonalBest,
  Session,
  SessionMode,
  SimId,
  SkillBreakdown,
} from './types';

const FACT_LATENCY_RING = 20; // keep the last N correct latencies per fact (doc 05 §1)

/** Per-tag summary denormalized onto the session (doc 08 §5). */
function computeSkillBreakdown(drafts: AttemptDraft[]): SkillBreakdown {
  const byTag = new Map<SkillTag, { attempts: number; correct: number; ms: number[] }>();
  for (const d of drafts) {
    let e = byTag.get(d.skill);
    if (!e) {
      e = { attempts: 0, correct: 0, ms: [] };
      byTag.set(d.skill, e);
    }
    e.attempts++;
    if (d.correct) {
      e.correct++;
      e.ms.push(d.totalMs);
    }
  }
  const out: SkillBreakdown = {};
  for (const [tag, e] of byTag) {
    out[tag] = { attempts: e.attempts, correct: e.correct, medianMs: median(e.ms) };
  }
  return out;
}

/** Fold this session's fact attempts into the incremental FactStats. */
async function updateFactStats(drafts: AttemptDraft[], at: number): Promise<void> {
  const byFact = new Map<string, { attempts: number; correct: number; ms: number[] }>();
  for (const d of drafts) {
    if (!d.factKey) continue;
    let e = byFact.get(d.factKey);
    if (!e) {
      e = { attempts: 0, correct: 0, ms: [] };
      byFact.set(d.factKey, e);
    }
    e.attempts++;
    if (d.correct) {
      e.correct++;
      e.ms.push(d.totalMs);
    }
  }

  for (const [factKey, e] of byFact) {
    const existing = await db.factStats.get(factKey);
    const attempts = (existing?.attempts ?? 0) + e.attempts;
    const correct = (existing?.correct ?? 0) + e.correct;
    const latencies = [...(existing?.latencies ?? []), ...e.ms].slice(-FACT_LATENCY_RING);
    const medianLatencyMs = median(latencies);
    const stat: FactStat = {
      factKey,
      attempts,
      correct,
      latencies,
      medianLatencyMs,
      // Full weak logic (with a family reference median) is applied at read time;
      // the stored flag uses the accuracy rule (doc 03 §6).
      weak: attempts >= 3 && correct / attempts < 0.7,
      updatedAt: at,
    };
    await db.factStats.put(stat);
  }
}

/** One recorded question, before it gets an id/sessionId at finalize time. */
export interface AttemptDraft {
  index: number;
  skill: SkillTag;
  factKey: string | null;
  prompt: string;
  answerCanonical: string;
  given: string | null;
  correct: boolean;
  difficulty: number;
  firstKeyMs: number;
  totalMs: number;
  at: number;
}

export interface FinalizeInput {
  plan: SessionPlan;
  mode: SessionMode;
  simId?: SimId;
  configHash: string;
  scoring: ScoringRule;
  extended: boolean;
  startedAt: number;
  durationMs: number;
  completed: boolean;
  official: boolean;
  attempts: AttemptDraft[];
}

/**
 * Score and persist a finished (or abandoned) session in a single Dexie
 * transaction — the only DB write of the play loop (doc 08 §3). Updates the
 * personal best only for completed + official sessions (doc 05 §2).
 */
export async function finalizeSession(
  input: FinalizeInput,
): Promise<{ sessionId: string }> {
  const lite = input.attempts.map((a) => ({
    correct: a.correct,
    given: a.given,
    totalMs: a.totalMs,
    firstKeyMs: a.firstKeyMs,
  }));
  const { score, vitals } = scoreSession(input.scoring, lite, input.durationMs);

  // A daily is official only on the first completion of the local day; later
  // plays that day are unofficial replays (doc 03 §5).
  const dailyDate = input.mode === 'daily' ? todayKey(input.startedAt) : null;
  const firstDailyToday =
    dailyDate != null && input.completed && !(await dailyRepo.get(dailyDate));
  const official = input.mode === 'daily' ? firstDailyToday : input.official;

  const sessionId = ulid(input.startedAt);
  const session: Session = {
    id: sessionId,
    mode: input.mode,
    ...(input.simId ? { simId: input.simId } : {}),
    configHash: input.configHash,
    plan: input.plan,
    engineVersion: ENGINE_VERSION,
    startedAt: input.startedAt,
    durationMs: input.durationMs,
    scoring: input.scoring,
    score,
    vitals,
    completed: input.completed,
    official,
    extended: input.extended,
    skillBreakdown: computeSkillBreakdown(input.attempts),
  };

  const attempts: Attempt[] = input.attempts.map((a) => ({
    id: ulid(a.at),
    sessionId,
    index: a.index,
    skill: a.skill,
    factKey: a.factKey,
    prompt: a.prompt,
    answerCanonical: a.answerCanonical,
    given: a.given,
    correct: a.correct,
    difficulty: a.difficulty,
    firstKeyMs: a.firstKeyMs,
    totalMs: a.totalMs,
    at: a.at,
  }));

  await db.transaction(
    'rw',
    [db.sessions, db.attempts, db.personalBests, db.factStats],
    async () => {
      await db.sessions.add(session);
      if (attempts.length) await db.attempts.bulkAdd(attempts);
      await updateFactStats(input.attempts, input.startedAt);
      if (input.completed && official) {
        const key = pbKey(input.mode, input.configHash);
        const existing = await db.personalBests.get(key);
        if (!existing || score > existing.score) {
          const pb: PersonalBest = { key, score, sessionId, at: input.startedAt };
          await db.personalBests.put(pb);
        }
      }
    },
  );

  // Record the daily and advance the streak on the first official completion.
  if (dailyDate && official) {
    await dailyRepo.put({ date: dailyDate, sessionId, score });
    useStreakStore.getState().recordDaily(dailyDate);
  }

  // Weak facts are auto-enrolled into the SRS "weak" deck (doc 03 §6 / 05 §5).
  // Non-critical: never block navigation to results on it.
  try {
    await enrollWeakFacts(input.startedAt);
  } catch (err) {
    console.error('weak-fact enrollment failed', err);
  }

  return { sessionId };
}

function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export interface ResultData {
  session: Session;
  attempts: Attempt[];
  /** All-time best score for this config (null if none). */
  best: number | null;
  /** Best score for this config before this session (null if none). */
  prevBest: number | null;
  deltaVsPrevBest: number | null;
  /** Mean of up to 7 completed official same-config sessions before this one. */
  last7Avg: number | null;
  deltaVsLast7: number | null;
  /** True when this completed official session beat a prior best (doc 03 §1.4). */
  isNewPB: boolean;
}

/**
 * Assemble everything the results screen needs — computed deterministically from
 * the DB so a session's results are identical whether shown right after play or
 * revisited from history.
 */
export async function getResultData(sessionId: string): Promise<ResultData | null> {
  const session = await sessionRepo.get(sessionId);
  if (!session) return null;
  const attempts = await attemptRepo.bySession(sessionId);

  // completedByConfig is completed + official, newest first.
  const sameConfig = await sessionRepo.completedByConfig(session.configHash);
  const prior = sameConfig.filter((s) => s.startedAt < session.startedAt);

  const best = sameConfig.length
    ? Math.max(...sameConfig.map((s) => s.score))
    : null;
  const prevBest = prior.length ? Math.max(...prior.map((s) => s.score)) : null;
  const last7 = prior.slice(0, 7);
  const last7Avg = last7.length ? mean(last7.map((s) => s.score)) : null;

  return {
    session,
    attempts,
    best,
    prevBest,
    deltaVsPrevBest: prevBest !== null ? session.score - prevBest : null,
    last7Avg,
    deltaVsLast7: last7Avg !== null ? session.score - last7Avg : null,
    isNewPB:
      session.completed &&
      session.official &&
      prevBest !== null &&
      session.score > prevBest,
  };
}
