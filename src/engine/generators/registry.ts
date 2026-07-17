import type { Rng } from '@/lib/prng';
import type { GeneratorConfig, Question, SkillTag } from '../types';
import { addDefaults, generateAdd2D } from './add';
import { subDefaults, generateSub2D } from './sub';
import { mulDefaults, generateMul1x2 } from './mul';
import { divDefaults, generateDivExact } from './div';

export type GeneratorFn = (rng: Rng, cfg: GeneratorConfig) => Question;

interface GeneratorEntry {
  generate: GeneratorFn;
  defaults: GeneratorConfig;
}

/**
 * Registry of implemented generators. M0 ships the four zetamac-profile families;
 * remaining tags register in later milestones (doc 09). Referencing an
 * unregistered tag throws a clear error rather than producing garbage.
 */
export const GENERATORS: Partial<Record<SkillTag, GeneratorEntry>> = {
  ADD_2D: { generate: generateAdd2D, defaults: addDefaults },
  SUB_2D: { generate: generateSub2D, defaults: subDefaults },
  MUL_1x2: { generate: generateMul1x2, defaults: mulDefaults },
  DIV_EXACT: { generate: generateDivExact, defaults: divDefaults },
};

export function getGenerator(tag: SkillTag): GeneratorEntry {
  const entry = GENERATORS[tag];
  if (!entry) {
    throw new Error(
      `No generator registered for skill tag "${tag}" (not available until a later milestone).`,
    );
  }
  return entry;
}

/** Merge a tag's defaults with an optional per-plan override. */
export function resolveConfig(
  tag: SkillTag,
  override?: GeneratorConfig,
): GeneratorConfig {
  return { ...getGenerator(tag).defaults, ...(override ?? {}) };
}
