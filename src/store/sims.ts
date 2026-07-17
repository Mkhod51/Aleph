import type { SessionPlan } from '@/engine';
import { randomSeed } from '@/lib/prng';
import { stableHash } from '@/lib/hash';
import type { SimDef, SimId } from '@/content/sims';
import type { BuiltPlan } from './presets';
import { sessionRepo } from './repos/sessionRepo';
import type { Session } from './types';

/**
 * Translate a sim definition into an engine SessionPlan (doc 03 §3). The plan
 * carries a fixed question count; net scoring and the configHash group a sim's
 * sessions for history and PBs.
 */
export function buildPlanFromSim(sim: SimDef, seed: number = randomSeed()): BuiltPlan {
  const plan: SessionPlan = { seed, profile: sim.profile, count: sim.count };
  const configHash = stableHash({
    simId: sim.id,
    profile: sim.profile,
    count: sim.count,
    durationMs: sim.durationMs,
    scoring: sim.scoring,
  });
  return {
    plan,
    durationMs: sim.durationMs,
    scoring: sim.scoring,
    configHash,
    mode: 'sim',
    extended: false,
  };
}

export interface SimStats {
  sessions: Session[]; // completed + official, newest first
  best: number | null;
  latest: number | null;
}

/** A sim's completed-session history (for lobby history + dashboard readiness). */
export async function loadSimStats(simId: SimId): Promise<SimStats> {
  const all = await sessionRepo.all();
  const sessions = all
    .filter((s) => s.mode === 'sim' && s.simId === simId && s.completed && s.official)
    .sort((a, b) => b.startedAt - a.startedAt);
  const best = sessions.length ? Math.max(...sessions.map((s) => s.score)) : null;
  return { sessions, best, latest: sessions[0]?.score ?? null };
}
