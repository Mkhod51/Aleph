import type {
  AnswerFormat,
  Canonical,
  ScoringRule,
  SessionPlan,
  SkillTag,
  Vitals,
} from '@/engine';

/**
 * Persistence data model — doc 05 §1. These are the shapes stored in IndexedDB
 * (via Dexie) and localStorage. All records use ULIDs so they merge safely for a
 * future sync backend (doc 08 §8).
 */

export type SessionMode = 'sprint' | 'sim' | 'drill' | 'daily' | 'srs' | 'gaps';
export type SimId = 'optiver80' | 'flow60' | 'akuna80' | 'custom' | 'sequences';

/**
 * Per-skill-tag summary denormalized onto each session so the dashboard's skill
 * breakdown aggregates over sessions (small) instead of scanning attempts (doc
 * 08 §5). `medianMs` is the median totalMs of that tag's correct answers in the
 * session (0 when none correct).
 */
export type SkillBreakdown = Partial<
  Record<SkillTag, { attempts: number; correct: number; medianMs: number }>
>;

export interface Session {
  id: string; // ULID (time-sortable)
  mode: SessionMode;
  simId?: SimId;
  configHash: string; // stable hash of plan → groups comparable sessions
  plan: SessionPlan; // full engine plan — sessions are replayable
  engineVersion: number;
  startedAt: number; // epoch ms
  durationMs: number; // actual elapsed
  scoring: ScoringRule;
  score: number;
  vitals: Vitals; // denormalized summary
  completed: boolean; // false = abandoned
  official: boolean; // false for daily-challenge replays
  extended: boolean; // sprint with non-Zetamac content
  skillBreakdown?: SkillBreakdown; // denormalized per-tag summary (doc 08 §5)
}

export interface Attempt {
  id: string; // ULID
  sessionId: string;
  index: number; // 0-based position in session
  skill: SkillTag;
  factKey: string | null;
  prompt: string;
  answerCanonical: string;
  given: string | null; // null = unanswered/skipped/timed-out
  correct: boolean;
  difficulty: number;
  firstKeyMs: number; // question shown → first keystroke ("think time")
  totalMs: number; // question shown → advance/commit
  at: number; // epoch ms
}

export interface FactStat {
  factKey: string;
  attempts: number;
  correct: number;
  latencies: number[]; // ring buffer, last 20 totalMs of correct answers
  medianLatencyMs: number;
  weak: boolean; // doc 03 §6 thresholds
  updatedAt: number;
}

export interface SrsCard {
  id: string; // usually === factKey
  deck: string;
  front: string;
  answer: Canonical;
  format: AnswerFormat;
  box: 1 | 2 | 3 | 4 | 5;
  dueAt: number; // epoch ms, local-midnight-aligned
  lastReviewedAt: number | null;
  targetMs: number; // default 3000
  source: 'builtin' | 'weakfact';
  suspended: boolean;
}

export interface DailyRecord {
  date: string; // YYYY-MM-DD
  sessionId: string;
  score: number;
}

export interface Streak {
  current: number;
  best: number;
  lastDate: string;
  freezes: number;
}

export interface PersonalBest {
  key: string; // mode + configHash
  score: number;
  sessionId: string;
  at: number;
}
