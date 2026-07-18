import { ENGINE_VERSION } from '@/engine';
import { DATA_VERSION, db } from './db';
import { applyTheme } from './theme';
import { useSettingsStore, type Settings } from './useSettingsStore';
import { usePresetStore } from './usePresetStore';
import { ZETAMAC_DEFAULT_ID } from './presets';
import type {
  Attempt,
  DailyRecord,
  FactStat,
  PersonalBest,
  Session,
  SrsCard,
  Streak,
} from './types';

/** One portable file with everything (doc 05 §7). */
export interface ExportBundle {
  version: number; // === DATA_VERSION
  engineVersion: number;
  exportedAt: number;
  sessions: Session[];
  attempts: Attempt[];
  factStats: FactStat[];
  srsCards: SrsCard[];
  dailyRecords: DailyRecord[];
  streak: Streak | null;
  personalBests: PersonalBest[];
  settings: Settings;
}

function currentSettings(): Settings {
  const s = useSettingsStore.getState();
  return {
    theme: s.theme,
    countdown: s.countdown,
    countdownSkip: s.countdownSkip,
    clockVisible: s.clockVisible,
    scoreVisible: s.scoreVisible,
    sound: s.sound,
    questionFontSize: s.questionFontSize,
    leftHandedKeypad: s.leftHandedKeypad,
    onboarded: s.onboarded,
  };
}

/** A fully-functional localStorage, or null when unavailable (node/SSR). */
function safeLocalStorage(): Storage | null {
  try {
    if (
      typeof localStorage !== 'undefined' &&
      typeof localStorage.getItem === 'function' &&
      typeof localStorage.setItem === 'function' &&
      typeof localStorage.removeItem === 'function'
    ) {
      return localStorage;
    }
  } catch {
    /* access can throw in sandboxed contexts */
  }
  return null;
}

function readStreak(): Streak | null {
  try {
    const raw = safeLocalStorage()?.getItem('aleph-streak');
    return raw ? (JSON.parse(raw) as Streak) : null;
  } catch {
    return null;
  }
}

export async function buildExportBundle(): Promise<ExportBundle> {
  const [sessions, attempts, factStats, srsCards, dailyRecords, personalBests] =
    await Promise.all([
      db.sessions.toArray(),
      db.attempts.toArray(),
      db.factStats.toArray(),
      db.srsCards.toArray(),
      db.dailyRecords.toArray(),
      db.personalBests.toArray(),
    ]);
  return {
    version: DATA_VERSION,
    engineVersion: ENGINE_VERSION,
    exportedAt: Date.now(),
    sessions,
    attempts,
    factStats,
    srsCards,
    dailyRecords,
    streak: readStreak(),
    personalBests,
    settings: currentSettings(),
  };
}

export async function exportJson(): Promise<string> {
  return JSON.stringify(await buildExportBundle(), null, 2);
}

/** Analyst-friendly CSV of every attempt (doc 05 §7). */
export async function exportAttemptsCsv(): Promise<string> {
  const attempts = await db.attempts.orderBy('at').toArray();
  const cols: (keyof Attempt)[] = [
    'id',
    'sessionId',
    'index',
    'skill',
    'factKey',
    'prompt',
    'answerCanonical',
    'given',
    'correct',
    'difficulty',
    'firstKeyMs',
    'totalMs',
    'at',
  ];
  const esc = (v: unknown): string => {
    const s = v === null || v === undefined ? '' : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  const lines = [cols.join(',')];
  for (const a of attempts) lines.push(cols.map((c) => esc(a[c])).join(','));
  return lines.join('\n');
}

export interface ImportPreview {
  ok: boolean;
  error?: string;
  bundle?: ExportBundle;
  /** Totals contained in the file. */
  totals: { sessions: number; attempts: number; personalBests: number };
  /** How many are new vs the current DB (relevant in merge mode). */
  newCounts: { sessions: number; attempts: number };
}

const EMPTY_COUNTS = {
  totals: { sessions: 0, attempts: 0, personalBests: 0 },
  newCounts: { sessions: 0, attempts: 0 },
};

/** Validate + summarize an import file before committing (doc 05 §7). */
export async function previewImport(json: string): Promise<ImportPreview> {
  let bundle: ExportBundle;
  try {
    bundle = JSON.parse(json) as ExportBundle;
  } catch {
    return { ok: false, error: 'Not valid JSON.', ...EMPTY_COUNTS };
  }
  if (typeof bundle.version !== 'number' || !Array.isArray(bundle.sessions)) {
    return { ok: false, error: 'This is not an Aleph export file.', ...EMPTY_COUNTS };
  }
  if (bundle.version > DATA_VERSION) {
    return {
      ok: false,
      error: `This file is from a newer version (v${bundle.version}). Update Aleph first.`,
      ...EMPTY_COUNTS,
    };
  }

  const sessions = bundle.sessions ?? [];
  const attempts = bundle.attempts ?? [];
  const [existingSessionIds, existingAttemptIds] = await Promise.all([
    db.sessions.toCollection().primaryKeys(),
    db.attempts.toCollection().primaryKeys(),
  ]);
  const sSet = new Set(existingSessionIds as string[]);
  const aSet = new Set(existingAttemptIds as string[]);

  return {
    ok: true,
    bundle,
    totals: {
      sessions: sessions.length,
      attempts: attempts.length,
      personalBests: (bundle.personalBests ?? []).length,
    },
    newCounts: {
      sessions: sessions.filter((s) => !sSet.has(s.id)).length,
      attempts: attempts.filter((a) => !aSet.has(a.id)).length,
    },
  };
}

/** Commit an import. merge = union (incoming wins on id/key); replace = wipe first. */
export async function importBundle(
  bundle: ExportBundle,
  mode: 'merge' | 'replace',
): Promise<void> {
  await db.transaction(
    'rw',
    [
      db.sessions,
      db.attempts,
      db.factStats,
      db.srsCards,
      db.dailyRecords,
      db.personalBests,
    ],
    async () => {
      if (mode === 'replace') {
        await Promise.all([
          db.sessions.clear(),
          db.attempts.clear(),
          db.factStats.clear(),
          db.srsCards.clear(),
          db.dailyRecords.clear(),
          db.personalBests.clear(),
        ]);
      }
      await db.sessions.bulkPut(bundle.sessions ?? []);
      await db.attempts.bulkPut(bundle.attempts ?? []);
      await db.factStats.bulkPut(bundle.factStats ?? []);
      await db.srsCards.bulkPut(bundle.srsCards ?? []);
      await db.dailyRecords.bulkPut(bundle.dailyRecords ?? []);
      await db.personalBests.bulkPut(bundle.personalBests ?? []);
    },
  );

  if (mode === 'replace' && bundle.settings) {
    useSettingsStore.setState(bundle.settings);
    applyTheme(bundle.settings.theme);
  }
}

/** Erase all history and custom presets (doc 03 §11). Appearance is preserved. */
export async function eraseAll(): Promise<void> {
  await db.transaction(
    'rw',
    [
      db.sessions,
      db.attempts,
      db.factStats,
      db.srsCards,
      db.dailyRecords,
      db.personalBests,
    ],
    async () => {
      await Promise.all([
        db.sessions.clear(),
        db.attempts.clear(),
        db.factStats.clear(),
        db.srsCards.clear(),
        db.dailyRecords.clear(),
        db.personalBests.clear(),
      ]);
    },
  );
  safeLocalStorage()?.removeItem('aleph-streak');
  usePresetStore.setState({ custom: [], selectedId: ZETAMAC_DEFAULT_ID });
}
