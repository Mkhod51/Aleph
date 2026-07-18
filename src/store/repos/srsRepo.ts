import { db } from '../db';
import type { SrsCard } from '../types';

export const srsRepo = {
  async all(): Promise<SrsCard[]> {
    return db.srsCards.toArray();
  },
  async get(id: string): Promise<SrsCard | undefined> {
    return db.srsCards.get(id);
  },
  async put(card: SrsCard): Promise<void> {
    await db.srsCards.put(card);
  },
  async bulkPut(cards: SrsCard[]): Promise<void> {
    if (cards.length) await db.srsCards.bulkPut(cards);
  },
  async count(): Promise<number> {
    return db.srsCards.count();
  },
};
