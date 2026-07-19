import { describe, it, expect } from 'vitest';
import { buildPlanFromPreset, ZETAMAC_DEFAULT } from '../presets';

/**
 * F2: the onboarding baseline used `?seconds=60` but was stored under the
 * default 120 s config hash, polluting the Zetamac-comparable series. The plan's
 * hash must now be derived from the duration actually played.
 */
describe('buildPlanFromPreset duration override (F2, doc 05 §1)', () => {
  it('a 60 s override hashes differently from the 120 s default', () => {
    const full = buildPlanFromPreset(ZETAMAC_DEFAULT, 1);
    const baseline = buildPlanFromPreset(ZETAMAC_DEFAULT, 1, 60_000);
    expect(full.durationMs).toBe(120_000);
    expect(baseline.durationMs).toBe(60_000);
    expect(full.configHash).not.toBe(baseline.configHash);
  });

  it('is seed-independent and stable with no override', () => {
    const a = buildPlanFromPreset(ZETAMAC_DEFAULT, 1);
    const b = buildPlanFromPreset(ZETAMAC_DEFAULT, 999);
    expect(a.configHash).toBe(b.configHash);
    expect(a.durationMs).toBe(ZETAMAC_DEFAULT.durationMs);
  });

  it('an override equal to the preset duration matches the default hash', () => {
    const a = buildPlanFromPreset(ZETAMAC_DEFAULT, 1);
    const b = buildPlanFromPreset(ZETAMAC_DEFAULT, 1, 120_000);
    expect(b.configHash).toBe(a.configHash);
  });
});
