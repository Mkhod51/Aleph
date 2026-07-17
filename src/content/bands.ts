/**
 * Benchmark bands — doc 05 §3. UI must label these "community-reported"; they are
 * estimates from candidate reports, NOT official firm data (decision log item 6).
 */

export interface Band {
  min: number;
  label: string;
  /** CSS variable for the band color (doc 07 §2 band ramp). */
  color: string;
}

/** Sprint @ Zetamac default (score = # correct in 120 s). */
export const SPRINT_BANDS: Band[] = [
  { min: 0, label: 'Foundation', color: 'var(--band-1)' },
  { min: 30, label: 'Developing', color: 'var(--band-2)' },
  { min: 50, label: 'Interview floor', color: 'var(--band-3)' },
  { min: 65, label: 'Competitive', color: 'var(--band-4)' },
  { min: 80, label: 'Elite', color: 'var(--band-5)' },
];

/** Optiver-style net /80. */
export const OPTIVER_BANDS: Band[] = [
  { min: 0, label: 'Below bar', color: 'var(--band-1)' },
  { min: 45, label: 'Borderline', color: 'var(--band-2)' },
  { min: 56, label: 'Passing', color: 'var(--band-3)' },
  { min: 70, label: 'Competitive', color: 'var(--band-5)' },
];

/** Flow-style net /60. */
export const FLOW_BANDS: Band[] = [
  { min: 0, label: 'Below bar', color: 'var(--band-1)' },
  { min: 30, label: 'Borderline', color: 'var(--band-2)' },
  { min: 42, label: 'Passing', color: 'var(--band-3)' },
  { min: 52, label: 'Competitive', color: 'var(--band-5)' },
];

/** The band a score falls into (highest `min` ≤ score). */
export function bandFor(score: number, bands: Band[]): Band {
  let result = bands[0] as Band;
  for (const b of bands) {
    if (score >= b.min) result = b;
  }
  return result;
}

/** Band set for a sim's band kind. */
export function bandsForKind(kind: 'optiver' | 'flow' | null): Band[] | null {
  if (kind === 'optiver') return OPTIVER_BANDS;
  if (kind === 'flow') return FLOW_BANDS;
  return null;
}

/** Honest suffix required wherever a band label is shown (decision log item 6). */
export const BAND_DISCLAIMER = 'community-reported';
