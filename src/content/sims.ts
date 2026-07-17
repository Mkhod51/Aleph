import type { ProfileId } from '@/engine';

/**
 * Firm simulator definitions — doc 03 §3. Parameters reconstructed from candidate
 * reports; every lobby labels its bars "community-reported" (decision log item 6).
 */
export type SimId = 'optiver80' | 'flow60' | 'akuna80' | 'custom' | 'sequences';

export interface SimDef {
  id: SimId;
  name: string;
  blurb: string;
  count: number;
  durationMs: number;
  scoring: { kind: 'net'; plus: number; minus: number };
  /** Whether an empty answer + Enter records a skip and advances (doc 03 §3). */
  skip: boolean;
  profile: ProfileId;
  rules: string[];
  /** Which band set applies to the net score (doc 05 §3). */
  bandKind: 'optiver' | 'flow' | null;
}

export const SIMS: SimDef[] = [
  {
    id: 'optiver80',
    name: 'Optiver-style · 80 in 8',
    blurb: '80 questions, 8 minutes, +1 / −1, no skipping.',
    count: 80,
    durationMs: 8 * 60_000,
    scoring: { kind: 'net', plus: 1, minus: 1 },
    skip: false,
    profile: 'optiver',
    rules: [
      '80 questions in 8:00',
      '+1 correct · −1 wrong · 0 unanswered',
      'No skipping — commit an answer to advance',
      'No pause; hiding the tab does not stop the clock',
    ],
    bandKind: 'optiver',
  },
  {
    id: 'flow60',
    name: 'Flow-style · 60 in 6',
    blurb: '60 questions, 6 minutes, +1 / −1, no skipping.',
    count: 60,
    durationMs: 6 * 60_000,
    scoring: { kind: 'net', plus: 1, minus: 1 },
    skip: false,
    profile: 'flow',
    rules: [
      '60 questions in 6:00',
      '+1 correct · −1 wrong · 0 unanswered',
      'No skipping — commit an answer to advance',
      'No pause; hiding the tab does not stop the clock',
    ],
    bandKind: 'flow',
  },
  {
    id: 'akuna80',
    name: 'Akuna-style · 80 in 8',
    blurb: '80 questions, 8 minutes, +1 / −1.',
    count: 80,
    durationMs: 8 * 60_000,
    scoring: { kind: 'net', plus: 1, minus: 1 },
    skip: false,
    profile: 'optiver',
    rules: [
      '80 questions in 8:00',
      '+1 correct · −1 wrong · 0 unanswered',
      'No skipping — commit an answer to advance',
      'No pause; hiding the tab does not stop the clock',
    ],
    bandKind: 'optiver',
  },
];

export function getSim(id: string | undefined): SimDef | undefined {
  return SIMS.find((s) => s.id === id);
}
