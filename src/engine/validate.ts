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
const FRACTION_RE = /^(-?\d+)\/(\d+)$/;
const MIXED_RE = /^(-?\d+)\s+(\d+)\/(\d+)$/;

const EPS = 1e-9;
/** Tolerance for rounded repeating decimals: accepts 2-dp and 4-dp forms. */
const APPROX_TOL = 0.005 + EPS;

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

/** Parse an integer, decimal, `a/b`, or mixed `w n/d` to a number (or null). */
function parseAnswer(raw: string): number | null {
  const trimmed = raw.trim();
  const mixed = trimmed.match(MIXED_RE);
  if (mixed) {
    const w = Number(mixed[1]);
    const n = Number(mixed[2]);
    const d = Number(mixed[3]);
    if (d === 0) return null;
    return w + Math.sign(w || 1) * (n / d);
  }
  const frac = clean(trimmed).match(FRACTION_RE);
  if (frac) {
    const a = Number(frac[1]);
    const b = Number(frac[2]);
    if (b === 0) return null;
    return a / b;
  }
  return parseNumeric(clean(trimmed));
}

/** Canonical string for a numeric value: trims trailing zeros, normalizes -0. */
function canonNum(n: number): string {
  return Object.is(n, -0) ? '0' : String(n);
}

/**
 * Per-keystroke flow-input match (doc 04 §6). Advance only when the input is
 * exactly the canonical value and could not be a prefix of a longer valid answer.
 */
export function matchesLive(q: Question, raw: string): boolean {
  const s = clean(raw);
  if (s === '' || s === '-') return false;
  if (s.endsWith('.') || s.endsWith('/')) return false; // still typing

  switch (q.format) {
    case 'integer': {
      if (!INTEGER_RE.test(s)) return false;
      const n = parseNumeric(s);
      return n !== null && n === q.answer.value;
    }
    case 'decimal': {
      const n = parseNumeric(s);
      if (n === null) return false;
      if (q.answer.approx) return Math.abs(n - q.answer.value) <= APPROX_TOL;
      return canonNum(n) === canonNum(q.answer.value);
    }
    case 'multi':
    case 'fraction': {
      const v = parseAnswer(raw);
      return v !== null && Math.abs(v - q.answer.value) < EPS;
    }
    case 'choice':
      return s === q.answer.display;
    default:
      return false;
  }
}

/**
 * Committed grading (test input, doc 04 §6). A trailing `.` is ignored, trailing
 * zeros are fine, unreduced/mixed fractions are accepted for `multi`, and
 * repeating-decimal answers accept the 2-dp or 4-dp rounded form.
 */
export function validate(q: Question, raw: string): ValidationResult {
  if (q.format === 'choice') {
    const s = clean(raw);
    return { correct: s === q.answer.display, normalized: s };
  }

  if (q.format === 'multi' || q.format === 'fraction') {
    const v = parseAnswer(raw);
    const normalized = raw.trim();
    if (v === null) return { correct: false, normalized };
    return { correct: Math.abs(v - q.answer.value) < EPS, normalized };
  }

  // integer / decimal
  const n = parseNumeric(clean(raw));
  if (n === null) return { correct: false, normalized: clean(raw) };
  const normalized = canonNum(n);
  const tol = q.format === 'decimal' && q.answer.approx ? APPROX_TOL : EPS;
  const correct = Math.abs(n - q.answer.value) <= tol;
  return { correct, normalized };
}

/** Whether a character is acceptable input for a question's answer format. */
export function acceptsChar(q: Question, ch: string): boolean {
  if (q.format === 'choice') return ch === '1' || ch === '2';
  if (ch >= '0' && ch <= '9') return true;
  if (ch === '-') return true;
  if (ch === '.') return q.format !== 'integer';
  if (ch === '/') return q.format === 'fraction' || q.format === 'multi';
  if (ch === ' ') return q.format === 'fraction' || q.format === 'multi'; // mixed numbers
  return false;
}
