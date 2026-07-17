import {
  ENGINE_VERSION,
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
import type { Attempt, PersonalBest, Session, SessionMode, SimId } from './types';

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
    official: input.official,
    extended: input.extended,
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

  await db.transaction('rw', db.sessions, db.attempts, db.personalBests, async () => {
    await db.sessions.add(session);
    if (attempts.length) await db.attempts.bulkAdd(attempts);
    if (input.completed && input.official) {
      const key = pbKey(input.mode, input.configHash);
      const existing = await db.personalBests.get(key);
      if (!existing || score > existing.score) {
        const pb: PersonalBest = { key, score, sessionId, at: input.startedAt };
        await db.personalBests.put(pb);
      }
    }
  });

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
