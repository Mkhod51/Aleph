import type {
  GeneratorConfig,
  ScoringRule,
  SessionPlan,
  SkillTag,
  WeightMap,
} from '@/engine';
import { randomSeed } from '@/lib/prng';
import { stableHash } from '@/lib/hash';
import type { SessionMode } from './types';

/**
 * Sprint presets (doc 03 §2). The built-in "Zetamac Default" is immutable and
 * reproduces arithmetic.zetamac.com exactly. Custom presets are user CRUD.
 * Extended content (decimals/fractions/…) is off in M1 and arrives with its
 * generators in M3.
 */

export interface OpToggles {
  add: boolean;
  sub: boolean;
  mul: boolean;
  div: boolean;
}

export interface SprintPreset {
  id: string;
  name: string;
  builtin: boolean;
  durationMs: number;
  ops: OpToggles;
  /** Addition operand range; subtraction is its inverse (Zetamac model). */
  addRange: { min: number; max: number };
  /** Multiplication factor ranges; division is its inverse. */
  mulRange: { aMin: number; aMax: number; bMin: number; bMax: number };
  /** True once non-Zetamac content is enabled (not comparable to benchmarks). */
  extended: boolean;
}

/** Selectable sprint durations, in ms (doc 03 §2). */
export const DURATIONS_MS = [30000, 60000, 120000, 300000];

export const ZETAMAC_DEFAULT_ID = 'zetamac-default';

export const ZETAMAC_DEFAULT: SprintPreset = {
  id: ZETAMAC_DEFAULT_ID,
  name: 'Zetamac Default',
  builtin: true,
  durationMs: 120000,
  ops: { add: true, sub: true, mul: true, div: true },
  addRange: { min: 2, max: 100 },
  mulRange: { aMin: 2, aMax: 12, bMin: 2, bMax: 100 },
  extended: false,
};

export function presetHasAnyOp(p: SprintPreset): boolean {
  return p.ops.add || p.ops.sub || p.ops.mul || p.ops.div;
}

export interface BuiltPlan {
  plan: SessionPlan;
  durationMs: number;
  scoring: ScoringRule;
  configHash: string;
  mode: SessionMode;
  extended: boolean;
}

/**
 * Translate a preset into an engine SessionPlan. Enabled ops each get weight 25
 * (doc 04 §5 zetamac, respecting per-op toggles). configHash excludes the seed
 * so all sessions of one config group together for PBs and rolling averages.
 */
export function buildPlanFromPreset(
  preset: SprintPreset,
  seed: number = randomSeed(),
): BuiltPlan {
  const weights: WeightMap = {};
  const generatorConfigs: Partial<Record<SkillTag, GeneratorConfig>> = {};

  if (preset.ops.add) {
    weights.ADD_2D = 25;
    generatorConfigs.ADD_2D = { addMin: preset.addRange.min, addMax: preset.addRange.max };
  }
  if (preset.ops.sub) {
    weights.SUB_2D = 25;
    generatorConfigs.SUB_2D = { addMin: preset.addRange.min, addMax: preset.addRange.max };
  }
  if (preset.ops.mul) {
    weights.MUL_1x2 = 25;
    generatorConfigs.MUL_1x2 = { ...preset.mulRange };
  }
  if (preset.ops.div) {
    weights.DIV_EXACT = 25;
    generatorConfigs.DIV_EXACT = { ...preset.mulRange };
  }

  const plan: SessionPlan = { seed, profile: weights, generatorConfigs };
  const scoring: ScoringRule = { kind: 'count' };
  const configHash = stableHash({
    profile: weights,
    generatorConfigs,
    durationMs: preset.durationMs,
    scoring,
    extended: preset.extended,
  });

  return {
    plan,
    durationMs: preset.durationMs,
    scoring,
    configHash,
    mode: 'sprint',
    extended: preset.extended,
  };
}

/** PB / rolling-average grouping key (doc 05 §1). */
export function pbKey(mode: SessionMode, configHash: string): string {
  return `${mode}:${configHash}`;
}
