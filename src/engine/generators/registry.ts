import type { Rng } from '@/lib/prng';
import type { GeneratorConfig, Question, SkillTag } from '../types';
import { addDefaults, add3dDefaults, generateAdd2D, generateAdd3D } from './add';
import { subDefaults, sub3dDefaults, generateSub2D, generateSub3D } from './sub';
import {
  mulDefaults,
  mul2x2Defaults,
  mul1x3Defaults,
  generateMul1x2,
  generateMul2x2,
  generateMul1x3,
} from './mul';
import { divDefaults, generateDivExact, generateDivToDec } from './div';
import { generateAddDec, generateMulDec } from './dec';
import { generateFracAdd, generateFracToDec, generateFracCompare } from './frac';
import { generatePctOf, generatePctReverse, generatePctChange } from './pct';
import { generateMissingAdd, generateMissingMul } from './missing';
import {
  squareDefaults,
  pow2Defaults,
  generateSquare,
  generatePow2,
} from './recall';

export type GeneratorFn = (rng: Rng, cfg: GeneratorConfig) => Question;

interface GeneratorEntry {
  generate: GeneratorFn;
  defaults: GeneratorConfig;
}

const NO_DEFAULTS: GeneratorConfig = {};

/**
 * Registry of implemented generators. M0 shipped the four zetamac families; M3
 * added the optiver/flow families + squares/powers; M4 adds the remaining
 * drill-spec tags (MUL_1x3, FRAC_COMPARE, PCT_REVERSE, PCT_CHANGE). Still
 * deferred until needed: MUL_1x1, SUB_DEC, DIV_DEC, FRAC_MUL, and SEQ_* (M6).
 */
export const GENERATORS: Partial<Record<SkillTag, GeneratorEntry>> = {
  ADD_2D: { generate: generateAdd2D, defaults: addDefaults },
  ADD_3D: { generate: generateAdd3D, defaults: add3dDefaults },
  SUB_2D: { generate: generateSub2D, defaults: subDefaults },
  SUB_3D: { generate: generateSub3D, defaults: sub3dDefaults },
  MUL_1x2: { generate: generateMul1x2, defaults: mulDefaults },
  MUL_1x3: { generate: generateMul1x3, defaults: mul1x3Defaults },
  MUL_2x2: { generate: generateMul2x2, defaults: mul2x2Defaults },
  DIV_EXACT: { generate: generateDivExact, defaults: divDefaults },
  DIV_TO_DEC: { generate: generateDivToDec, defaults: NO_DEFAULTS },
  ADD_DEC: { generate: generateAddDec, defaults: NO_DEFAULTS },
  MUL_DEC: { generate: generateMulDec, defaults: NO_DEFAULTS },
  FRAC_ADD: { generate: generateFracAdd, defaults: NO_DEFAULTS },
  FRAC_TO_DEC: { generate: generateFracToDec, defaults: NO_DEFAULTS },
  FRAC_COMPARE: { generate: generateFracCompare, defaults: NO_DEFAULTS },
  PCT_OF: { generate: generatePctOf, defaults: NO_DEFAULTS },
  PCT_REVERSE: { generate: generatePctReverse, defaults: NO_DEFAULTS },
  PCT_CHANGE: { generate: generatePctChange, defaults: NO_DEFAULTS },
  MISSING_ADD: { generate: generateMissingAdd, defaults: addDefaults },
  MISSING_MUL: { generate: generateMissingMul, defaults: mulDefaults },
  SQUARE: { generate: generateSquare, defaults: squareDefaults },
  POW2: { generate: generatePow2, defaults: pow2Defaults },
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
