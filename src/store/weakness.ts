import { composeGapWeights, type SkillTag, type WeightMap } from '@/engine';
import { randomSeed } from '@/lib/prng';
import { stableHash } from '@/lib/hash';
import { loadDashboard } from './dashboard';
import { weakFactCount } from './srs';
import type { DrillMeta } from './drills';

/** Questions of history required before Fix My Gaps unlocks (doc 03 §6). */
export const FIX_GAPS_MIN_ATTEMPTS = 100;
export const FIX_GAPS_COUNT = 25;

/** Random-retrieval pool for the 30% variety component (core arithmetic). */
const POOL_TAGS: SkillTag[] = ['ADD_2D', 'SUB_2D', 'MUL_1x2', 'DIV_EXACT'];

export interface WeaknessSummary {
  totalQuestions: number;
  weakTags: SkillTag[];
  weakFacts: number;
  canFix: boolean;
}

export async function loadWeaknessSummary(): Promise<WeaknessSummary> {
  const [dash, weakFacts] = await Promise.all([loadDashboard(), weakFactCount()]);
  // Weak tags: enough evidence (≥20 attempts) and not yet solid.
  let weakTags = dash.skills
    .filter((s) => s.attempts >= 20 && s.mastery === 'learning')
    .map((s) => s.tag);
  if (weakTags.length === 0) {
    // Fall back to the single worst tag with a reasonable sample.
    const worst = dash.skills.find((s) => s.attempts >= 10);
    if (worst) weakTags = [worst.tag];
  }
  return {
    totalQuestions: dash.totalQuestions,
    weakTags,
    weakFacts,
    canFix: dash.totalQuestions >= FIX_GAPS_MIN_ATTEMPTS,
  };
}

/** Build the 25-question Fix-My-Gaps drill (70% weak / 30% random, doc 03 §6). */
export function composeFixMyGaps(weakTags: SkillTag[]): DrillMeta {
  const weights: WeightMap = composeGapWeights(weakTags, POOL_TAGS);
  const base = {
    title: 'Fix my gaps',
    weights,
    count: FIX_GAPS_COUNT,
    input: 'flow' as const,
    feedback: false,
    tierMode: 'adaptive' as const,
  };
  return {
    ...base,
    seed: randomSeed(),
    scoring: { kind: 'count' },
    configHash: stableHash({ ...base, kind: 'gaps' }),
  };
}
