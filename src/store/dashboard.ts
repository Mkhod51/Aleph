import {
  masteryLevel,
  rollingAverage,
  targetMsForTag,
  trendDirection,
  type Mastery,
  type SkillTag,
} from '@/engine';
import { bandFor, SPRINT_BANDS } from '@/content/bands';
import { SIMS } from '@/content/sims';
import { localDateKey } from '@/lib/format';
import { sessionRepo } from './repos/sessionRepo';
import { factRepo } from './repos/factRepo';
import { personalBestRepo } from './repos/personalBestRepo';
import { ZETAMAC_DEFAULT_CONFIG_HASH } from './bands';
import type { FactStat, PersonalBest, Session } from './types';

export interface SkillRow {
  tag: SkillTag;
  attempts: number;
  correct: number;
  accuracy: number;
  medianMs: number;
  targetMs: number;
  mastery: Mastery;
}

export interface ScorePoint {
  at: number;
  date: string;
  score: number;
  sessionId: string;
  isPB: boolean;
}

export interface DashboardData {
  hasData: boolean;
  totalSessions: number;
  totalQuestions: number;
  sprintRolling7: number | null;
  sprintTrend: -1 | 0 | 1 | null;
  sprintBandLabel: string | null;
  sprintSeries: ScorePoint[];
  skills: SkillRow[];
  facts: FactStat[];
  factReferenceMedianMs: number;
  perDay: Record<string, number>;
  records: PersonalBest[];
  simReadiness: SimReadiness[];
}

export interface SimReadiness {
  simId: string;
  name: string;
  bandKind: 'optiver' | 'flow' | null;
  count: number; // question count (gauge max)
  attempts: number;
  best: number;
  latest: number;
}

function questionsIn(s: Session): number {
  return s.vitals.correct + s.vitals.wrong + s.vitals.skipped;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? (sorted[mid] as number)
    : ((sorted[mid - 1] as number) + (sorted[mid] as number)) / 2;
}

function buildSkillRows(sessions: Session[]): SkillRow[] {
  const agg = new Map<
    SkillTag,
    { attempts: number; correct: number; msWeighted: number; correctForMs: number }
  >();
  for (const s of sessions) {
    if (!s.skillBreakdown) continue;
    for (const [tag, b] of Object.entries(s.skillBreakdown) as [
      SkillTag,
      { attempts: number; correct: number; medianMs: number },
    ][]) {
      let e = agg.get(tag);
      if (!e) {
        e = { attempts: 0, correct: 0, msWeighted: 0, correctForMs: 0 };
        agg.set(tag, e);
      }
      e.attempts += b.attempts;
      e.correct += b.correct;
      if (b.medianMs > 0 && b.correct > 0) {
        e.msWeighted += b.medianMs * b.correct;
        e.correctForMs += b.correct;
      }
    }
  }

  const rows: SkillRow[] = [];
  for (const [tag, e] of agg) {
    const accuracy = e.attempts ? e.correct / e.attempts : 0;
    const medianMs = e.correctForMs ? e.msWeighted / e.correctForMs : 0;
    const targetMs = targetMsForTag(tag);
    rows.push({
      tag,
      attempts: e.attempts,
      correct: e.correct,
      accuracy,
      medianMs,
      targetMs,
      mastery: masteryLevel({ attempts: e.attempts, accuracy, medianLatencyMs: medianMs, targetMs }),
    });
  }
  // Worst-first: lowest accuracy, then slowest relative to target.
  rows.sort((a, b) => a.accuracy - b.accuracy || b.medianMs / b.targetMs - a.medianMs / a.targetMs);
  return rows;
}

function buildSprintSeries(sessions: Session[]): ScorePoint[] {
  const sprints = sessions
    .filter(
      (s) =>
        s.mode === 'sprint' &&
        s.completed &&
        s.official &&
        s.configHash === ZETAMAC_DEFAULT_CONFIG_HASH,
    )
    .sort((a, b) => a.startedAt - b.startedAt);

  let runningMax = -Infinity;
  return sprints.map((s) => {
    const isPB = s.score > runningMax;
    if (isPB) runningMax = s.score;
    return {
      at: s.startedAt,
      date: localDateKey(s.startedAt),
      score: s.score,
      sessionId: s.id,
      isPB,
    };
  });
}

/** Assemble the full dashboard from aggregate tables only (doc 08 §5). */
export async function loadDashboard(): Promise<DashboardData> {
  const [sessions, facts, records] = await Promise.all([
    sessionRepo.all(),
    factRepo.all(),
    personalBestRepo.all(),
  ]);

  const completed = sessions.filter((s) => s.completed);
  const sprintSeries = buildSprintSeries(sessions);
  const sprintScores = sprintSeries.map((p) => p.score);
  const rolling7 = sprintScores.length ? rollingAverage(sprintScores) : null;

  const perDay: Record<string, number> = {};
  for (const s of completed) {
    const key = localDateKey(s.startedAt);
    perDay[key] = (perDay[key] ?? 0) + questionsIn(s);
  }

  const factReferenceMedianMs = median(
    facts.filter((f) => f.attempts >= 3).map((f) => f.medianLatencyMs),
  );

  const simReadiness: SimReadiness[] = [];
  for (const sim of SIMS) {
    const runs = completed.filter((s) => s.mode === 'sim' && s.simId === sim.id && s.official);
    if (runs.length === 0) continue;
    const scores = runs.map((s) => s.score);
    const latest = runs.sort((a, b) => b.startedAt - a.startedAt)[0] as Session;
    simReadiness.push({
      simId: sim.id,
      name: sim.name,
      bandKind: sim.bandKind,
      count: sim.count,
      attempts: runs.length,
      best: Math.max(...scores),
      latest: latest.score,
    });
  }

  return {
    hasData: sessions.length > 0,
    totalSessions: completed.length,
    totalQuestions: completed.reduce((sum, s) => sum + questionsIn(s), 0),
    sprintRolling7: rolling7,
    sprintTrend: trendDirection(sprintScores),
    sprintBandLabel:
      rolling7 !== null ? bandFor(rolling7, SPRINT_BANDS).label : null,
    sprintSeries,
    skills: buildSkillRows(completed),
    facts,
    factReferenceMedianMs,
    perDay,
    records,
    simReadiness,
  };
}
