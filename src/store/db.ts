import Dexie, { type Table } from 'dexie';
import type {
  Attempt,
  DailyRecord,
  FactStat,
  PersonalBest,
  Session,
  SrsCard,
} from './types';

/**
 * Dexie (IndexedDB) schema — doc 08 §1/§4. Sessions/attempts/facts/SRS live here;
 * settings and streak live in localStorage (see useSettingsStore).
 *
 * `dataVersion` bumps with a Dexie `.version(n)` migration (doc 08 §4). Export
 * files carry this version; import refuses newer-versioned files.
 *
 * Note: boolean fields (completed/official/weak/suspended) are intentionally NOT
 * indexed — IndexedDB cannot key on booleans; they are filtered in queries.
 */
export const DATA_VERSION = 1;

export class AlephDB extends Dexie {
  sessions!: Table<Session, string>;
  attempts!: Table<Attempt, string>;
  factStats!: Table<FactStat, string>;
  srsCards!: Table<SrsCard, string>;
  dailyRecords!: Table<DailyRecord, string>;
  personalBests!: Table<PersonalBest, string>;

  constructor() {
    super('aleph');
    this.version(DATA_VERSION).stores({
      sessions: 'id, mode, configHash, startedAt',
      attempts: 'id, sessionId, skill, factKey, at',
      factStats: 'factKey, updatedAt',
      srsCards: 'id, deck, dueAt, box',
      dailyRecords: 'date',
      personalBests: 'key',
    });
  }
}

export const db = new AlephDB();
