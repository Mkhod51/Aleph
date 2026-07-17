import { db } from '../db';
import type { PersonalBest } from '../types';

export const personalBestRepo = {
  async get(key: string): Promise<PersonalBest | undefined> {
    return db.personalBests.get(key);
  },

  async put(pb: PersonalBest): Promise<void> {
    await db.personalBests.put(pb);
  },

  async all(): Promise<PersonalBest[]> {
    return db.personalBests.toArray();
  },
};
