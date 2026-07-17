import type { Question } from './types';

/**
 * Answer validation & normalization — doc 04 §6.
 * Live matching (flow input, per keystroke) and committed grading (test input)
 * share one normalizer.
 */

export interface ValidationResult {
  correct: boolean;
  /** Canonicalized form of the input (for storage/display). */
  normalized: string;
}

/** Accepts `-?digits`, `-?digits.digits`, `-?digits.`, `-?.digits`. */
const NUMERIC_RE = /^-?(\d+\.?\d*|\.\d+)$/;
const INTEGER_RE = /^-?\d+$/;

function clean(raw: string): string {
  return raw.replace(/\s+/g, '');
}

/** Parse a numeric string to a number, or null if not a valid numeric form. */
function parseNumeric(s: string): number | null {
  if (s === '' || s === '-' || s === '.' || s === '-.') return null;
  if (!NUMERIC_RE.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** Canonical string for a numeric value: trims trailing zeros, normalizes -0. */
function canonNum(n: number): string {
  return Object.is(n, -0) ? '0' : String(n);
}

/**
 * Per-keystroke flow-input match (doc 04 §6). Advance only when the input is
 * exactly the canonical value and could not be a prefix of a longer valid answer.
 * - Integer answers: numeric equality (Zetamac behavior — `39` ≠ `391`).
 * - Decimal answers: full canonical-value match; a trailing `.` is treated as an
 *   incomplete prefix (`12.` is not yet `12`), never as a completed number.
 */
export function matchesLive(q: Question, raw: string): boolean {
  const s = clean(raw);
  if (s === '' || s === '-') return false;
  // A trailing dot means the user may still be typing a decimal → not complete.
  if (s.endsWith('.')) return false;

  switch (q.format) {
    case 'integer': {
      if (!INTEGER_RE.test(s)) return false;
      const n = parseNumeric(s);
      return n !== null && n === q.answer.value;
    }
    case 'decimal':
    case 'multi': {
      const n = parseNumeric(s);
      return n !== null && canonNum(n) === canonNum(q.answer.value);
    }
    case 'fraction': {
      // Fraction live-matching arrives with the fraction generators (M3+).
      const n = parseNumeric(s);
      return n !== null && canonNum(n) === canonNum(q.answer.value);
    }
    case 'choice':
      return s === q.answer.display;
    default:
      return false;
  }
}

/**
 * Committed grading (test input, doc 04 §6). Same normalizer; a trailing `.` is
 * ignored (`12.` grades as `12`); trailing zeros are fine (`0.50` ✓).
 */
export function validate(q: Question, raw: string): ValidationResult {
  const s = clean(raw);

  if (q.format === 'choice') {
    return { correct: s === q.answer.display, normalized: s };
  }

  const n = parseNumeric(s);
  if (n === null) {
    return { correct: false, normalized: s };
  }
  const normalized = canonNum(n);
  const correct = normalized === canonNum(q.answer.value);
  return { correct, normalized };
}

/** Whether a character is acceptable input for a question's answer format. */
export function acceptsChar(q: Question, ch: string): boolean {
  if (q.format === 'choice') return ch === '1' || ch === '2';
  if (ch >= '0' && ch <= '9') return true;
  if (ch === '-') return true;
  if (ch === '.') return q.format !== 'integer';
  if (ch === '/') return q.format === 'fraction' || q.format === 'multi';
  return false;
}
