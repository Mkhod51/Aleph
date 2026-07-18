/**
 * Public engine API (doc 04 §1). The engine is pure TypeScript with no React/DOM
 * imports — the store and UI layers import from here; the engine imports only
 * pure `lib/` utilities.
 */
export type {
  SkillTag,
  AnswerFormat,
  Canonical,
  Question,
  GeneratorConfig,
  ProfileId,
  WeightMap,
  SessionPlan,
  QuestionStream,
  AttemptLite,
  ScoringRule,
  Vitals,
  Score,
} from './types';

export { ENGINE_VERSION } from './version';
export { createQuestionStream } from './stream';
export { validate, matchesLive, acceptsChar, type ValidationResult } from './validate';
export { scoreSession, median, percentile } from './scoring';
export {
  targetMsForTag,
  rollingAverage,
  trendDirection,
  masteryLevel,
  isWeakFact,
  quartileAccuracy,
  fatigueDelta,
  composeGapWeights,
  type Mastery,
} from './stats';
export {
  SRS_INTERVALS_DAYS,
  SRS_MAX_BOX,
  SRS_DEFAULT_TARGET_MS,
  SRS_REQUEUE_MS,
  promoted,
  nextBox,
  nextDueAt,
  isDue,
  startOfLocalDay,
  addLocalDays,
  type Box,
} from './srs';
export { PROFILES, resolveProfile, type ResolvedProfile } from './profiles';
export { GENERATORS, getGenerator, resolveConfig } from './generators/registry';
export { mulFactKey } from './facts';
export {
  addDifficulty,
  subDifficulty,
  mulDifficulty,
  divDifficulty,
  digitCount,
  isUnround,
  nextAdaptiveRating,
  tierFromRating,
  ADAPTIVE_START,
} from './difficulty';
