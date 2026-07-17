import { db } from '../db';
import type { Session } from '../types';

/**
 * Session persistence (doc 08 §8 — all storage behind repos so a future sync
 * backend swaps internals without touching callers).
 */
export const sessionRepo = {
  async add(session: Session): Promise<void> {
    await db.sessions.add(session);
  },

  async get(id: string): Promise<Session | undefined> {
    return db.sessions.get(id);
  },

  async all(): Promise<Session[]> {
    return db.sessions.orderBy('startedAt').toArray();
  },

  /**
   * Completed + official sessions of one config, newest first. Used for PBs and
   * rolling averages; abandoned/unofficial sessions are excluded (doc 05 §2).
   */
  async completedByConfig(configHash: string): Promise<Session[]> {
    const rows = await db.sessions.where('configHash').equals(configHash).toArray();
    return rows
      .filter((s) => s.completed && s.official)
      .sort((a, b) => b.startedAt - a.startedAt);
  },
};
