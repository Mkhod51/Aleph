import { childRng, weightedIndex, type Rng } from '@/lib/prng';
import type { Question, QuestionStream, SessionPlan } from './types';
import { resolveProfile } from './profiles';
import { getGenerator, resolveConfig } from './generators/registry';

/** Sliding anti-repeat window size (doc 04 §4). */
const WINDOW = 8;
const MAX_RETRIES = 5;

/** The de-dupe key: the trackable fact, else a prompt hash (doc 04 §4). */
function dedupKey(q: Question): string {
  return q.factKey ?? `p:${q.prompt}`;
}

/**
 * createQuestionStream — doc 04 §1. Deterministic given a SessionPlan+seed:
 * tag selection and operand choice draw from independent seeded streams
 * (`split(seed, label)`), and anti-repeat retries consume PRNG draws so
 * reproducibility is preserved.
 */
export function createQuestionStream(plan: SessionPlan): QuestionStream {
  const pickRng: Rng = childRng(plan.seed, 'pick');
  const genRng: Rng = childRng(plan.seed, 'operands');
  const { tags, weights } = resolveProfile(plan.profile);
  const recent: string[] = [];

  function draw(): Question {
    const tag = tags[weightedIndex(pickRng, weights)] as (typeof tags)[number];
    const cfg = resolveConfig(tag, plan.generatorConfigs?.[tag]);
    return getGenerator(tag).generate(genRng, cfg);
  }

  return {
    next(): Question {
      let q = draw();
      let key = dedupKey(q);
      let tries = 0;
      while (recent.includes(key) && tries < MAX_RETRIES) {
        q = draw();
        key = dedupKey(q);
        tries++;
      }
      recent.push(key);
      if (recent.length > WINDOW) recent.shift();
      return q;
    },
  };
}
