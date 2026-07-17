import { db } from '../db';
import type { FactStat } from '../types';

export const factRepo = {
  async all(): Promise<FactStat[]> {
    return db.factStats.toArray();
  },

  async get(factKey: string): Promise<FactStat | undefined> {
    return db.factStats.get(factKey);
  },
};
