import 'fake-indexeddb/auto';
import { beforeAll, describe, it, expect } from 'vitest';
import { db } from '../db';
import { loadDashboard } from '../dashboard';
import { seedSynthetic } from '../seedFixture';

/**
 * M2 DoD: the dashboard renders < 400 ms with 100k synthetic attempts. It reads
 * only aggregates (sessions + FactStats), never the raw attempts table — this
 * test seeds ~100k attempts and asserts the aggregation stays fast regardless.
 */
describe('dashboard performance with 100k attempts (doc 09 M2 DoD)', () => {
  let seeded: { sessions: number; attempts: number; facts: number };

  beforeAll(async () => {
    await Promise.all([db.sessions.clear(), db.attempts.clear(), db.factStats.clear()]);
    seeded = await seedSynthetic({
      sessions: 1700,
      attemptsPerSession: 60,
      includeRawAttempts: true,
    });
  }, 120_000);

  it('seeded ~100k attempts across aggregates', () => {
    expect(seeded.attempts).toBeGreaterThanOrEqual(100_000);
    expect(seeded.sessions).toBe(1700);
    expect(seeded.facts).toBeGreaterThan(0);
  });

  it('loadDashboard aggregates in < 400 ms', async () => {
    // Warm once, then measure.
    await loadDashboard();
    const t0 = performance.now();
    const data = await loadDashboard();
    const elapsed = performance.now() - t0;

    expect(data.hasData).toBe(true);
    expect(data.sprintSeries.length).toBe(1700);
    expect(data.skills.length).toBe(4);
    expect(data.facts.length).toBeGreaterThan(0);
    console.log(`loadDashboard over ${seeded.attempts} attempts: ${elapsed.toFixed(1)}ms`);
    expect(elapsed).toBeLessThan(400);
  });
});
