import type { ProfileId, SkillTag, WeightMap } from './types';

/**
 * Distribution profiles — doc 04 §5. A profile is a weight map over skill tags;
 * the stream draws each question's tag by weighted pick. Profiles are DATA, not
 * code (the custom test builder edits a weight map).
 *
 * M0 ships only `zetamac` (its four generators). Firm profiles (`optiver`,
 * `flow`, `sequences`) arrive with their generators in later milestones.
 */
export const PROFILES: Partial<Record<ProfileId, WeightMap>> = {
  zetamac: { ADD_2D: 25, SUB_2D: 25, MUL_1x2: 25, DIV_EXACT: 25 },
};

/**
 * Canonical tag ordering. Weight maps are projected onto this order so the
 * weighted-draw array is identical regardless of a WeightMap's key insertion
 * order — required for cross-machine daily-challenge determinism (doc 04 §2).
 */
const TAG_ORDER: readonly SkillTag[] = [
  'ADD_2D',
  'ADD_3D',
  'ADD_DEC',
  'SUB_2D',
  'SUB_3D',
  'SUB_DEC',
  'MUL_1x1',
  'MUL_1x2',
  'MUL_1x3',
  'MUL_2x2',
  'MUL_DEC',
  'DIV_EXACT',
  'DIV_TO_DEC',
  'DIV_DEC',
  'FRAC_ADD',
  'FRAC_MUL',
  'FRAC_TO_DEC',
  'FRAC_COMPARE',
  'PCT_OF',
  'PCT_REVERSE',
  'PCT_CHANGE',
  'MISSING_ADD',
  'MISSING_MUL',
  'SQUARE',
  'POW2',
  'SEQ_ARITH',
  'SEQ_GEO',
  'SEQ_DIFF2',
  'SEQ_INTERLEAVED',
  'SEQ_ALTSIGN',
];

export interface ResolvedProfile {
  tags: SkillTag[];
  weights: number[];
}

function weightMapToArrays(map: WeightMap): ResolvedProfile {
  const tags: SkillTag[] = [];
  const weights: number[] = [];
  for (const tag of TAG_ORDER) {
    const w = map[tag];
    if (w !== undefined && w > 0) {
      tags.push(tag);
      weights.push(w);
    }
  }
  if (tags.length === 0) {
    throw new Error('Profile has no tags with positive weight.');
  }
  return { tags, weights };
}

/** Resolve a ProfileId or inline WeightMap to ordered tag/weight arrays. */
export function resolveProfile(profile: ProfileId | WeightMap): ResolvedProfile {
  if (typeof profile === 'string') {
    if (profile.startsWith('drill:')) {
      const tag = profile.slice('drill:'.length) as SkillTag;
      return { tags: [tag], weights: [1] };
    }
    const map = PROFILES[profile];
    if (!map) {
      throw new Error(
        `Profile "${profile}" is not available until a later milestone.`,
      );
    }
    return weightMapToArrays(map);
  }
  return weightMapToArrays(profile);
}
