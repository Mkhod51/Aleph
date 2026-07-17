import 'fake-indexeddb/auto';
import { beforeEach, describe, it, expect } from 'vitest';
import { db } from '../db';
import {
  buildPlanFromPreset,
  pbKey,
  ZETAMAC_DEFAULT,
} from '../presets';
import {
  finalizeSession,
  getResultData,
  type AttemptDraft,
} from '../sessionService';
import { personalBestRepo } from '../repos/personalBestRepo';
import { buildExportBundle, eraseAll, importBundle } from '../exportImport';

const built = buildPlanFromPreset(ZETAMAC_DEFAULT);

function correctDrafts(n: number): AttemptDraft[] {
  return Array.from({ length: n }, (_, i) => ({
    index: i,
    skill: 'ADD_2D' as const,
    factKey: null,
    prompt: `${i + 2} + ${i + 3}`,
    answerCanonical: String(2 * i + 5),
    given: String(2 * i + 5),
    correct: true,
    difficulty: 3,
    firstKeyMs: 400,
    totalMs: 1500,
    at: Date.now(),
  }));
}

function inputFor(score: number, startedAt: number, completed = true) {
  return {
    plan: built.plan,
    mode: built.mode,
    configHash: built.configHash,
    scoring: built.scoring,
    extended: built.extended,
    startedAt,
    durationMs: built.durationMs,
    completed,
    official: true,
    attempts: correctDrafts(score),
  };
}

async function clearDb() {
  await Promise.all([
    db.sessions.clear(),
    db.attempts.clear(),
    db.factStats.clear(),
    db.srsCards.clear(),
    db.dailyRecords.clear(),
    db.personalBests.clear(),
  ]);
}

describe('session persistence + personal bests (doc 05 §1/§2)', () => {
  beforeEach(clearDb);

  it('scores, stores, and tracks the personal best across sessions', async () => {
    const a = await finalizeSession(inputFor(5, 1_000_000));
    const b = await finalizeSession(inputFor(8, 1_001_000));

    const pb = await personalBestRepo.get(pbKey('sprint', built.configHash));
    expect(pb?.score).toBe(8);
    expect(pb?.sessionId).toBe(b.sessionId);

    const resB = await getResultData(b.sessionId);
    expect(resB?.session.score).toBe(8);
    expect(resB?.prevBest).toBe(5);
    expect(resB?.isNewPB).toBe(true);
    expect(resB?.deltaVsPrevBest).toBe(3);

    const resA = await getResultData(a.sessionId);
    expect(resA?.prevBest).toBeNull();
    expect(resA?.isNewPB).toBe(false);
  });

  it('excludes abandoned sessions from the personal best', async () => {
    await finalizeSession(inputFor(4, 2_000_000));
    await finalizeSession(inputFor(99, 2_001_000, /* completed */ false));

    const pb = await personalBestRepo.get(pbKey('sprint', built.configHash));
    expect(pb?.score).toBe(4); // the abandoned 99 does not count
  });
});

describe('export → wipe → import round-trip (doc 08 §6)', () => {
  beforeEach(clearDb);

  it('restores sessions and attempts identically', async () => {
    await finalizeSession(inputFor(6, 3_000_000));
    const before = await buildExportBundle();
    expect(before.sessions).toHaveLength(1);
    expect(before.attempts).toHaveLength(6);

    await eraseAll();
    expect(await db.sessions.count()).toBe(0);
    expect(await db.attempts.count()).toBe(0);

    await importBundle(before, 'replace');
    const after = await buildExportBundle();
    expect(after.sessions).toEqual(before.sessions);
    expect(after.attempts).toEqual(before.attempts);
    expect(after.personalBests).toEqual(before.personalBests);
  });

  it('merge unions without duplicating existing rows', async () => {
    await finalizeSession(inputFor(6, 4_000_000));
    const bundle = await buildExportBundle();

    // Re-import the same bundle in merge mode: counts must not double.
    await importBundle(bundle, 'merge');
    expect(await db.sessions.count()).toBe(1);
    expect(await db.attempts.count()).toBe(6);
  });
});
