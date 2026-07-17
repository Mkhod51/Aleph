import type { StrategyArticle } from './learn';

/** Strategy articles S1–S5 — doc 06. No drill mapping; linked from sim lobbies. */
export const STRATEGY: StrategyArticle[] = [
  {
    id: 'S1',
    slug: 's1-negative-marking',
    title: 'Negative-marking calculus',
    body: 'At +1/−1, answering with confidence p has expected value 2p−1: answer only above ~50% confidence. A T15 check that moves you from 50→75% is worth +0.5 per question. On no-skip tests (Optiver-style) you must commit — spend the seconds on elimination, not deliberation. Never "revenge-answer" after a streak of skips.',
  },
  {
    id: 'S2',
    slug: 's2-pacing',
    title: 'Pacing the 6-second budget',
    body: '80-in-8 is 6 s average, but the right distribution is 2–3 s on the easy 60%, banking time for the hard 40%. Hard cap ~15 s: beyond it, apply T15, commit, and move on. Train with the clock visible until pace is internalized, then hide it (the setting exists).',
  },
  {
    id: 'S3',
    slug: 's3-test-day',
    title: 'Test-day protocol',
    body: '10 minutes before: one 2-minute sprint (warm), 3 minutes of R1/R2 flashcards (prime recall), then stop — arrive slightly under-warmed, not fried. Environment: numpad if you are faster on it (practice both), full screen, phone away. During: make the first 5 questions deliberately careful — early wrongs snowball into panic.',
  },
  {
    id: 'S4',
    slug: 's4-eight-week-arc',
    title: 'The 8-week arc',
    body: 'Wk 1–2: T1–T4 + daily sprints (target 30→40) + start R1/R2 decks. Wk 3–4: T5–T9, 2×2 drills, sprint 50s. Wk 5–6: fractions/percent (T12–T13), first firm sims, sprint 60s. Wk 7–8: sims on alternate days, weakness drills from the heatmap, sprint 70+. Daily dose ≈ 15 min: 2 sprints + 1 targeted drill + SRS review.',
  },
  {
    id: 'S5',
    slug: 's5-reading-the-dashboard',
    title: 'Reading the dashboard',
    body: 'What to fix first: accuracy < 90% beats latency (wrong answers cost double under −1); then the heatmap’s darkest cells; then fatigue delta. One focus per week.',
  },
];

export function getStrategy(slug: string | undefined): StrategyArticle | undefined {
  return STRATEGY.find((s) => s.slug === slug);
}
