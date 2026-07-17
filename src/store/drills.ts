import { create } from 'zustand';
import {
  getGenerator,
  resolveConfig,
  resolveProfile,
  type GeneratorConfig,
  type Question,
  type ScoringRule,
  type SkillTag,
  type WeightMap,
} from '@/engine';
import { weightedIndex, randomSeed, type Rng } from '@/lib/prng';
import { stableHash } from '@/lib/hash';
import type { DrillSpec, LearnCategory } from '@/content/learn';

export type TierMode = 1 | 2 | 3 | 'adaptive';

export interface DrillMeta {
  title: string;
  weights: WeightMap;
  seed: number;
  count: number;
  input: 'flow' | 'test';
  feedback: boolean;
  tierMode: TierMode;
  configHash: string;
  scoring: ScoringRule;
}

/** Per-tier range configs (doc 04 §7). Tags without meaningful tiers return {}. */
export function tierConfig(tag: SkillTag, tier: 1 | 2 | 3): GeneratorConfig {
  switch (tag) {
    case 'ADD_2D':
    case 'SUB_2D':
    case 'MISSING_ADD':
      return tier === 1
        ? { addMin: 2, addMax: 20 }
        : tier === 3
          ? { addMin: 20, addMax: 100 }
          : { addMin: 2, addMax: 100 };
    case 'ADD_3D':
    case 'SUB_3D':
      return tier === 1
        ? { addMin: 100, addMax: 399 }
        : tier === 3
          ? { addMin: 400, addMax: 999 }
          : { addMin: 100, addMax: 999 };
    case 'MUL_1x2':
    case 'MISSING_MUL':
    case 'DIV_EXACT':
      return tier === 1
        ? { aMin: 2, aMax: 9, bMin: 2, bMax: 20 }
        : tier === 3
          ? { aMin: 2, aMax: 12, bMin: 20, bMax: 100 }
          : { aMin: 2, aMax: 12, bMin: 2, bMax: 100 };
    case 'MUL_2x2':
      return tier === 1
        ? { aMin: 13, aMax: 25, bMin: 13, bMax: 25 }
        : tier === 3
          ? { aMin: 25, aMax: 99, bMin: 25, bMax: 99 }
          : { aMin: 13, aMax: 99, bMin: 13, bMax: 99 };
    case 'MUL_1x3':
      return tier === 1
        ? { aMin: 3, aMax: 6, bMin: 101, bMax: 499 }
        : tier === 3
          ? { aMin: 6, aMax: 9, bMin: 500, bMax: 999 }
          : { aMin: 3, aMax: 9, bMin: 101, bMax: 999 };
    case 'SQUARE':
      return tier === 1
        ? { aMin: 11, aMax: 20 }
        : tier === 3
          ? { aMin: 20, aMax: 30 }
          : { aMin: 11, aMax: 30 };
    default:
      return {};
  }
}

/** Draw one drill question: weighted tag pick, tier config applied, generate. */
export function drawDrillQuestion(
  rng: Rng,
  resolved: { tags: SkillTag[]; weights: number[] },
  tier: 1 | 2 | 3,
): Question {
  const tag = resolved.tags[weightedIndex(rng, resolved.weights)] as SkillTag;
  const cfg = { ...resolveConfig(tag), ...tierConfig(tag, tier) };
  return getGenerator(tag).generate(rng, cfg);
}

/** Resolve a weight map into ordered tag/weight arrays for drawing. */
export function resolveDrillWeights(weights: WeightMap) {
  return resolveProfile(weights);
}

function drillConfigHash(meta: Omit<DrillMeta, 'configHash' | 'seed' | 'scoring' | 'title'>): string {
  return stableHash({
    weights: meta.weights,
    count: meta.count,
    input: meta.input,
    tierMode: meta.tierMode,
  });
}

interface BuildOptions {
  count?: number;
  tierMode?: TierMode;
  seed?: number;
}

/** Build a DrillMeta from a technique's DrillSpec (doc 06 mapping). */
export function buildDrillFromSpec(
  title: string,
  spec: DrillSpec,
  opts: BuildOptions = {},
): DrillMeta {
  const count = opts.count ?? 10;
  const tierMode: TierMode = opts.tierMode ?? spec.tier ?? 'adaptive';
  const input = spec.input ?? 'flow';
  const feedback = spec.feedback ?? false;
  const base = { title, weights: spec.weights, count, input, feedback, tierMode };
  return {
    ...base,
    seed: opts.seed ?? randomSeed(),
    scoring: { kind: 'count' },
    configHash: drillConfigHash(base),
  };
}

/** Build a single-tag DrillMeta (catalog, heatmap cell, "drill 10 like this"). */
export function buildDrillFromTag(
  tag: SkillTag,
  opts: BuildOptions & { input?: 'flow' | 'test' } = {},
): DrillMeta {
  const count = opts.count ?? 10;
  const tierMode: TierMode = opts.tierMode ?? 'adaptive';
  const input = opts.input ?? 'flow';
  const base = {
    title: tag,
    weights: { [tag]: 100 } as WeightMap,
    count,
    input,
    feedback: input === 'test',
    tierMode,
  };
  return {
    ...base,
    seed: opts.seed ?? randomSeed(),
    scoring: { kind: 'count' },
    configHash: drillConfigHash(base),
  };
}

/** Drillable tags grouped by category for the catalog (doc 03 §4). */
export const DRILL_CATALOG: { category: LearnCategory; tags: SkillTag[] }[] = [
  { category: 'Foundations', tags: ['ADD_2D', 'ADD_3D', 'SUB_2D', 'SUB_3D', 'MISSING_ADD'] },
  { category: 'Multiplication', tags: ['MUL_1x2', 'MUL_1x3', 'MUL_2x2', 'SQUARE', 'MISSING_MUL'] },
  { category: 'Division & divisibility', tags: ['DIV_EXACT', 'DIV_TO_DEC'] },
  {
    category: 'Fractions, decimals, percentages',
    tags: ['ADD_DEC', 'MUL_DEC', 'FRAC_ADD', 'FRAC_TO_DEC', 'FRAC_COMPARE', 'PCT_OF', 'PCT_REVERSE', 'PCT_CHANGE'],
  },
];

/** Transient (non-persisted) holder for the drill about to be played. */
interface DrillStore {
  pending: DrillMeta | null;
  setPending: (meta: DrillMeta) => void;
  clear: () => void;
}

export const useDrillStore = create<DrillStore>((set) => ({
  pending: null,
  setPending: (meta) => set({ pending: meta }),
  clear: () => set({ pending: null }),
}));
