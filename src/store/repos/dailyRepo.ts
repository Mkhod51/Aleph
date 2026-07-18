import { db } from '../db';
import type { DailyRecord } from '../types';

export const dailyRepo = {
  async get(date: string): Promise<DailyRecord | undefined> {
    return db.dailyRecords.get(date);
  },
  async put(record: DailyRecord): Promise<void> {
    await db.dailyRecords.put(record);
  },
  async all(): Promise<DailyRecord[]> {
    const rows = await db.dailyRecords.toArray();
    return rows.sort((a, b) => a.date.localeCompare(b.date));
  },
};
