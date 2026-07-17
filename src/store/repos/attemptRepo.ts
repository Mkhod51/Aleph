import { db } from '../db';
import type { Attempt } from '../types';

export const attemptRepo = {
  async bulkAdd(attempts: Attempt[]): Promise<void> {
    if (attempts.length === 0) return;
    await db.attempts.bulkAdd(attempts);
  },

  /** Attempts for one session, in play order. */
  async bySession(sessionId: string): Promise<Attempt[]> {
    const rows = await db.attempts.where('sessionId').equals(sessionId).toArray();
    return rows.sort((a, b) => a.index - b.index);
  },
};
