/**
 * Core engine types — doc 04 §1.
 * Pure data contracts shared by generators, validation, scoring and the stores.
 */

export type SkillTag =
  | 'ADD_2D'
  | 'ADD_3D'
  | 'ADD_DEC'
  | 'SUB_2D'
  | 'SUB_3D'
  | 'SUB_DEC'
  | 'MUL_1x1'
  | 'MUL_1x2'
  | 'MUL_1x3'
  | 'MUL_2x2'
  | 'MUL_DEC'
  | 'DIV_EXACT'
  | 'DIV_TO_DEC'
  | 'DIV_DEC'
  | 'FRAC_ADD'
  | 'FRAC_MUL'
  | 'FRAC_TO_DEC'
  | 'FRAC_COMPARE'
  | 'PCT_OF'
  | 'PCT_REVERSE'
  | 'PCT_CHANGE'
  | 'MISSING_ADD'
  | 'MISSING_MUL'
  | 'SQUARE'
  | 'POW2'
  | 'SEQ_ARITH'
  | 'SEQ_GEO'
  | 'SEQ_DIFF2'
  | 'SEQ_INTERLEAVED'
  | 'SEQ_ALTSIGN';

/** 'multi' = fraction OR decimal accepted; 'choice' = keys 1/2 (FRAC_COMPARE). */
export type AnswerFormat = 'integer' | 'decimal' | 'fraction' | 'multi' | 'choice';

export interface Canonical {
  /** Exact numeric value (fractions stored as value + parts). */
  value: number;
  /** Canonical display string, e.g. "0.375" or "3/8". */
  display: string;
  /** Lowest-terms parts, present when the format allows fraction input. */
  fraction?: { num: number; den: number };
}

export interface Question {
  skill: SkillTag;
  /** Display string, e.g. "47 × 36" or "17 × ⬚ = 391". */
  prompt: string;
  /** Raw operands used for fact-tracking (doc 04 §8). */
  operands: number[];
  answer: Canonical;
  format: AnswerFormat;
  /** Static difficulty, computed at generation (doc 04 §7). */
  difficulty: number;
  /** Canonical recallable fact key, or null when not a trackable fact (doc 04 §8). */
  factKey: string | null;
}

/**
 * Per-tag generator configuration. A loose bag of optional fields; each generator
 * documents which it reads and supplies its own defaults (doc 04 §3/§7).
 */
export interface GeneratorConfig {
  tier?: 1 | 2 | 3;
  /** Addition/subtraction operand range. */
  addMin?: number;
  addMax?: number;
  /** Multiplication/division factor ranges (a = first factor, b = second). */
  aMin?: number;
  aMax?: number;
  bMin?: number;
  bMax?: number;
}

export type ProfileId =
  | 'zetamac'
  | 'optiver'
  | 'flow'
  | 'sequences'
  | `drill:${SkillTag}`;

/** A weight map over skill tags; the stream draws each question's tag by weight. */
export type WeightMap = Partial<Record<SkillTag, number>>;

export interface SessionPlan {
  seed: number;
  profile: ProfileId | WeightMap;
  generatorConfigs?: Partial<Record<SkillTag, GeneratorConfig>>;
  /** Sims/drills: fixed count; sprints: omitted (unlimited stream). */
  count?: number;
}

/** A deterministic, replayable question source. */
export interface QuestionStream {
  next(): Question;
}

/** The minimal per-attempt data scoring needs (a subset of the stored Attempt). */
export interface AttemptLite {
  correct: boolean;
  /** null = unanswered / skipped / timed-out. */
  given: string | null;
  /** Question shown → advance/commit, in ms. */
  totalMs: number;
  /** Question shown → first keystroke ("think time"), in ms. */
  firstKeyMs?: number;
}

export type ScoringRule =
  | { kind: 'count' } // sprints, drills: number correct
  | { kind: 'net'; plus: number; minus: number }; // sims: +plus / −minus / 0 skipped

export interface Vitals {
  attempted: number;
  correct: number;
  wrong: number;
  skipped: number;
  /** correct / attempted, 0..1. */
  accuracy: number;
  /** Median totalMs of correct answers only. */
  medianLatencyMs: number;
  /** p90 totalMs of correct answers only. */
  p90LatencyMs: number;
  /** Throughput: correct answers per minute of active play. */
  perMin: number;
  /** Median firstKeyMs across answered questions ("think time"). */
  thinkTimeMs: number;
}

export interface Score {
  score: number;
  vitals: Vitals;
}
