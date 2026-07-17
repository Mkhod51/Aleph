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
} from './difficulty';
