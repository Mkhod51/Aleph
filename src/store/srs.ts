import {
  isDue,
  isWeakFact,
  nextBox,
  nextDueAt,
  promoted,
  startOfLocalDay,
  median,
  SRS_DEFAULT_TARGET_MS,
  type AnswerFormat,
  type Box,
  type Canonical,
} from '@/engine';
import { REFERENCES } from '@/content/references';
import { srsRepo } from './repos/srsRepo';
import { factRepo } from './repos/factRepo';
import type { SrsCard } from './types';

const DAY_MS = 86_400_000;
const INTRO_PER_DAY = 10; // new cards introduced per deck per day (doc 05 §5)
export const REVIEW_CAP = 40;

interface CardShape {
  id: string;
  deck: string;
  front: string;
  answer: Canonical;
  format: AnswerFormat;
}

function intCard(id: string, deck: string, front: string, value: number): CardShape {
  return { id, deck, front, answer: { value, display: String(value) }, format: 'integer' };
}

/** All built-in cards (doc 03 §7), before scheduling. */
function builtinShapes(): CardShape[] {
  const cards: CardShape[] = [];

  // Fraction ↔ decimal (from R1, exact table values).
  const r1 = REFERENCES.find((r) => r.id === 'R1');
  for (const [frac, dec] of r1?.rows ?? []) {
    const [n, d] = (frac as string).split('/').map(Number);
    cards.push({
      id: `frac:${n}/${d}`,
      deck: 'frac-decimal',
      front: frac as string,
      answer: { value: Number(dec), display: dec as string },
      format: 'decimal',
    });
  }

  // Squares 11–30.
  for (let n = 11; n <= 30; n++) cards.push(intCard(`sq:${n}`, 'squares', `${n}²`, n * n));

  // Powers of 2, 2^1..2^12.
  for (let n = 1; n <= 12; n++) cards.push(intCard(`pow2:${n}`, 'pow2', `2^${n}`, 2 ** n));

  // Times tables 13–20 (upper triangle to avoid duplicate facts).
  for (let a = 13; a <= 20; a++) {
    for (let b = a; b <= 20; b++) {
      cards.push(intCard(`mul:${a}×${b}`, 'times-13-20', `${a} × ${b}`, a * b));
    }
  }

  // Complements to 100 / 1000.
  for (let n = 12; n <= 96; n += 7) {
    cards.push(intCard(`comp100:${n}`, 'complements', `100 − ${n}`, 100 - n));
  }
  for (let n = 120; n <= 960; n += 70) {
    cards.push(intCard(`comp1000:${n}`, 'complements', `1000 − ${n}`, 1000 - n));
  }

  return cards;
}

/**
 * Seed any missing built-in cards, staggering due dates so ~10 new cards per deck
 * become due each day (the new-card intro cap, doc 05 §5). Existing cards (and
 * their progress) are never overwritten.
 */
export async function seedBuiltinDecks(nowMs = Date.now()): Promise<void> {
  const existing = new Set((await srsRepo.all()).map((c) => c.id));
  const midnight = startOfLocalDay(nowMs);
  const perDeck: Record<string, number> = {};
  const toAdd: SrsCard[] = [];

  for (const shape of builtinShapes()) {
    if (existing.has(shape.id)) continue;
    const idx = perDeck[shape.deck] ?? 0;
    perDeck[shape.deck] = idx + 1;
    toAdd.push({
      id: shape.id,
      deck: shape.deck,
      front: shape.front,
      answer: shape.answer,
      format: shape.format,
      box: 1,
      dueAt: midnight + Math.floor(idx / INTRO_PER_DAY) * DAY_MS,
      lastReviewedAt: null,
      targetMs: SRS_DEFAULT_TARGET_MS,
      source: 'builtin',
      suspended: false,
    });
  }
  await srsRepo.bulkPut(toAdd);
}

/** Cards due now, oldest-due first, capped at REVIEW_CAP (doc 05 §5). */
export async function loadDueCards(nowMs = Date.now()): Promise<SrsCard[]> {
  const all = await srsRepo.all();
  return all
    .filter((c) => isDue(c.dueAt, c.suspended, nowMs))
    .sort((a, b) => a.dueAt - b.dueAt)
    .slice(0, REVIEW_CAP);
}

export async function dueCount(nowMs = Date.now()): Promise<number> {
  const all = await srsRepo.all();
  return all.filter((c) => isDue(c.dueAt, c.suspended, nowMs)).length;
}

/** Apply a Leitner review to a card and persist it (doc 05 §5). */
export async function gradeCard(
  card: SrsCard,
  correct: boolean,
  elapsedMs: number,
  nowMs = Date.now(),
): Promise<SrsCard> {
  const promote = promoted(correct, elapsedMs, card.targetMs);
  const box = nextBox(card.box, promote);
  const graduated = card.source === 'weakfact' && box === 5;
  const updated: SrsCard = {
    ...card,
    box,
    dueAt: nextDueAt(box, nowMs),
    lastReviewedAt: nowMs,
    suspended: graduated,
  };
  await srsRepo.put(updated);
  return updated;
}

/** Front/answer for a fact key (mul/sq/pow2/frac). */
function cardFromFactKey(factKey: string): CardShape | null {
  let m = factKey.match(/^mul:(\d+)×(\d+)$/);
  if (m) {
    const a = Number(m[1]);
    const b = Number(m[2]);
    return intCard(factKey, 'weak', `${a} × ${b}`, a * b);
  }
  m = factKey.match(/^sq:(\d+)$/);
  if (m) return intCard(factKey, 'weak', `${m[1]}²`, Number(m[1]) ** 2);
  m = factKey.match(/^pow2:(\d+)$/);
  if (m) return intCard(factKey, 'weak', `2^${m[1]}`, 2 ** Number(m[1]));
  m = factKey.match(/^frac:(\d+)\/(\d+)$/);
  if (m) {
    const n = Number(m[1]);
    const d = Number(m[2]);
    const value = Number((n / d).toFixed(4));
    return { id: factKey, deck: 'weak', front: `${n}/${d}`, answer: { value, display: String(value) }, format: 'decimal' };
  }
  return null;
}

/**
 * Auto-enroll currently-weak facts into the SRS "weak" deck (doc 03 §6 / 05 §5).
 * Present cards are demoted to box 1 rather than duplicated.
 */
export async function enrollWeakFacts(nowMs = Date.now()): Promise<number> {
  const facts = await factRepo.all();
  const reference = median(facts.filter((f) => f.attempts >= 3).map((f) => f.medianLatencyMs));
  const existing = new Map((await srsRepo.all()).map((c) => [c.id, c]));
  const updates: SrsCard[] = [];

  for (const f of facts) {
    const weak = isWeakFact({
      attempts: f.attempts,
      accuracy: f.attempts ? f.correct / f.attempts : 0,
      medianLatencyMs: f.medianLatencyMs,
      referenceMedianMs: reference,
    });
    if (!weak) continue;
    const shape = cardFromFactKey(f.factKey);
    if (!shape) continue;

    const present = existing.get(f.factKey);
    if (present) {
      // Demote to box 1, due now (unless graduated & already box 5 non-weak — but it's weak).
      updates.push({ ...present, box: 1 as Box, dueAt: nowMs, suspended: false });
    } else {
      updates.push({
        id: shape.id,
        deck: 'weak',
        front: shape.front,
        answer: shape.answer,
        format: shape.format,
        box: 1,
        dueAt: nowMs,
        lastReviewedAt: null,
        targetMs: SRS_DEFAULT_TARGET_MS,
        source: 'weakfact',
        suspended: false,
      });
    }
  }
  await srsRepo.bulkPut(updates);
  return updates.length;
}

/** Weak facts as a count (for the Fix-My-Gaps explainer). */
export async function weakFactCount(): Promise<number> {
  const facts = await factRepo.all();
  const reference = median(facts.filter((f) => f.attempts >= 3).map((f) => f.medianLatencyMs));
  return facts.filter((f) =>
    isWeakFact({
      attempts: f.attempts,
      accuracy: f.attempts ? f.correct / f.attempts : 0,
      medianLatencyMs: f.medianLatencyMs,
      referenceMedianMs: reference,
    }),
  ).length;
}
