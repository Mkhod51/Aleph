import type { Technique } from './learn';

/**
 * Techniques T1–T15 — doc 06, shipped essentially verbatim. Each `drill` is the
 * technique→drill mapping from doc 06 §Mapping. Where a mapped constraint isn't
 * yet a generator option, `note` records the approximation.
 */
export const TECHNIQUES: Technique[] = [
  {
    id: 'T1',
    slug: 't1-work-left-to-right',
    title: 'Work left to right',
    category: 'Foundations',
    hook: 'Mental arithmetic goes big digits first — you hold fewer things in your head and you get the magnitude early (which is what checks are built on).',
    method:
      'School arithmetic goes right-to-left with carries; mental arithmetic goes big digits first. You carry fewer things in working memory and you know the answer’s magnitude before you finish.',
    examples: [
      '487 + 259: 400+200 = 600 → 80+50 = 130 → 730 → 7+9 = 16 → 746.',
      '634 − 278: 634−200 = 434 → −70 = 364 → −8 = 356.',
    ],
    whenToUse: 'Every addition/subtraction.',
    pitfall:
      'Don’t verbalize intermediate numbers fully ("seven hundred thirty") — hold them as digits.',
    drill: { weights: { ADD_3D: 50, SUB_3D: 50 }, tier: 2 },
    related: ['T2'],
    masteryTag: 'ADD_3D',
  },
  {
    id: 'T2',
    slug: 't2-compensation',
    title: 'Compensation: round, then repair',
    category: 'Foundations',
    hook: 'Replace an ugly number with a round one, fix the error after.',
    method:
      'Round an awkward operand to a friendly number, do the easy operation, then repair the difference.',
    examples: [
      '+ 99 → +100 − 1: 468+99 = 567.',
      '− 278 → −300 + 22: 634−278 = 356.',
      '× 99 → ×100 − ×1: 68×99 = 6800−68 = 6732.',
      '× 102 → ×100 + ×2: 68×102 = 6800+136 = 6936.',
    ],
    whenToUse: 'Any operand within ~5 of a round number.',
    pitfall:
      'Repair direction — subtracting a too-big number means adding back.',
    drill: {
      weights: { ADD_2D: 50, SUB_2D: 50 },
      tier: 2,
      note: 'Approximated as tier-2 add/sub; "operands near round numbers" is not yet a generator constraint.',
    },
    related: ['T1'],
    masteryTag: 'ADD_2D',
  },
  {
    id: 'T3',
    slug: 't3-complements',
    title: 'Complements to 100 / 1000',
    category: 'Foundations',
    hook: 'Every digit pairs to 9, the last to 10 — so 1000 − 377 = 623 instantly.',
    method:
      '100 − n: every digit pairs to 9, the last to 10 → 1000 − 377 = 623 (6=9−3, 2=9−7, 3=10−7). This powers change-making, subtraction, and percentages (100% − 37.7%).',
    examples: ['1000 − 377 = 623', '100 − 42 = 58'],
    whenToUse: 'Change-making, subtraction from round numbers, percentages.',
    drill: {
      weights: { MISSING_ADD: 100 },
      tier: 2,
      note: 'Complements SRS deck (R5) ships with flashcards in M5.',
    },
    related: ['T2', 'T13'],
    masteryTag: 'MISSING_ADD',
  },
  {
    id: 'T4',
    slug: 't4-split-distribute',
    title: 'Split & distribute (the workhorse)',
    category: 'Multiplication',
    hook: 'One factor splits by place value — this must become automatic before anything else.',
    method:
      'Split one factor by place value and distribute, accumulating left to right: 47 × 8 = 40×8 + 7×8 = 320+56 = 376. Say "320… 376", never "56 carry".',
    examples: ['47 × 8 = 320 + 56 = 376', '6 × 234 = 1200 + 180 + 24 = 1404'],
    whenToUse: 'Any 1×2 or 1×3. This is the foundation of everything else.',
    drill: { weights: { MUL_1x2: 60, MUL_1x3: 40 }, tier: 2 },
    related: ['T5'],
    masteryTag: 'MUL_1x2',
  },
  {
    id: 'T5',
    slug: 't5-cross-multiplication',
    title: '2×2 cross-multiplication',
    category: 'Multiplication',
    hook: 'ab × cd = (a·c)·100 + (a·d + b·c)·10 + b·d, accumulated left to right.',
    method:
      'Multiply tens×tens for the hundreds, the cross terms for the tens, units×units for the ones, accumulating left to right.',
    examples: [
      '47 × 36: 12 → 1200; cross 4·6+7·3 = 45 → 1650; 7·6 = 42 → 1692.',
      '23 × 41: 8 → 800; 2·1+3·4 = 14 → 940; 3 → 943.',
    ],
    whenToUse: 'General 2×2 when no shortcut (T6–T9) applies.',
    pitfall:
      'The cross term is the error magnet — practice it isolated (start with the cross-term-only warm-up).',
    drill: { weights: { MUL_2x2: 100 }, tier: 3 },
    related: ['T6', 'T7', 'T8', 'T9'],
    masteryTag: 'MUL_2x2',
  },
  {
    id: 'T6',
    slug: 't6-difference-of-squares',
    title: 'Difference of squares',
    category: 'Multiplication',
    hook: '(m+d)(m−d) = m² − d². Spot pairs straddling a round mean.',
    method:
      'When two factors are equidistant from an easy mean m, their product is m² − d².',
    examples: [
      '18 × 22 = 20² − 2² = 396',
      '47 × 53 = 50² − 9 = 2491',
      '65 × 75 = 70² − 25 = 4875',
    ],
    whenToUse: 'Operands with an even gap and an easy mean. Learn with squares (R2).',
    drill: {
      weights: { MUL_2x2: 100 },
      tier: 2,
      note: '"(m+d)(m−d) pairs only" is not yet a generator constraint — this drills general 2×2.',
    },
    related: ['T7'],
    masteryTag: 'MUL_2x2',
  },
  {
    id: 'T7',
    slug: 't7-squares',
    title: 'Squares: end-in-5 and near-base',
    category: 'Multiplication',
    hook: 'End in 5 → n·(n+1) then append 25; near 50 or 100 → adjust and add d².',
    method:
      'Ends in 5: n5² = n·(n+1), append 25. Near 50: (50±d)² = (25±d)·100 + d². Near 100: (100±d)² = (100±2d)·100 + d².',
    examples: [
      '85² = 72|25 = 7225',
      '47² = 2200 + 9 = 2209 · 52² = 2700 + 4 = 2704',
      '97² = 9400 + 9 = 9409 · 104² = 10800 + 16 = 10816',
    ],
    whenToUse: 'Squaring two-digit numbers; underpins difference-of-squares (T6).',
    drill: { weights: { SQUARE: 100 }, tier: 2 },
    related: ['T6'],
    masteryTag: 'SQUARE',
  },
  {
    id: 'T8',
    slug: 't8-factor-games',
    title: 'Factor games: ×5, ×25, ×50, doubling–halving',
    category: 'Multiplication',
    hook: '×5 = ×10÷2, ×25 = ×100÷4, ×50 = ×100÷2 — and halve one factor while doubling the other until one is trivial.',
    method:
      '×5 = ×10÷2 (86×5 = 430) · ×25 = ×100÷4 (48×25 = 1200) · ×50 = ×100÷2 · ×15 = ×10 + half that (62×15 = 620+310 = 930). Doubling–halving: 45 × 24 = 90×12 = 1080; 16 × 35 = 8×70 = 560.',
    examples: ['86 × 5 = 430', '48 × 25 = 1200', '45 × 24 = 90 × 12 = 1080'],
    whenToUse: 'When a factor is 5/15/25/50 or one factor is even.',
    drill: {
      weights: { MUL_1x2: 50, MUL_2x2: 50 },
      tier: 2,
      note: 'Factor-friendly pairs are not yet a generator constraint — this drills mixed 1×2/2×2.',
    },
    related: ['T4', 'T5'],
    masteryTag: 'MUL_2x2',
  },
  {
    id: 'T9',
    slug: 't9-digit-tricks',
    title: 'Digit tricks: ×11, ×9, units-sum-to-10',
    category: 'Multiplication',
    hook: '×11 sums neighbours inward, ×9 = ×10 − n, and same-tens/units-sum-10 has a clean shape.',
    method:
      '×11: neighbours sum inward — 43×11 → 4|(4+3)|3 = 473 (carry when ≥10: 87×11 → 8|15|7 → 957). ×9 = ×10 − n: 34×9 = 340−34 = 306. Same tens, units summing to 10: 63 × 67 → tens 6×(6+1) = 42, units 3×7 = 21 → 4221.',
    examples: ['43 × 11 = 473', '87 × 11 = 957', '34 × 9 = 306', '63 × 67 = 4221'],
    whenToUse: '×11, ×9, or two-digit pairs with the same tens digit and units summing to 10.',
    drill: {
      weights: { MUL_2x2: 100 },
      tier: 2,
      note: '×11 / ×9 / units-sum-10 variants are not yet generator constraints — this drills general 2×2.',
    },
    related: ['T5'],
    masteryTag: 'MUL_2x2',
  },
  {
    id: 'T10',
    slug: 't10-divide-by-factoring',
    title: 'Divide by factoring',
    category: 'Division & divisibility',
    hook: 'Break the divisor into easy factors and divide in steps.',
    method:
      'Factor the divisor and divide sequentially. 336 ÷ 14 = ÷7 then ÷2 → 48 → 24. 1800 ÷ 24 = ÷8 ÷3 → 225 → 75. ÷5 = ×2÷10 (345÷5 = 69); ÷25 = ×4÷100 (900÷25 = 36).',
    examples: ['336 ÷ 14 = 24', '1800 ÷ 24 = 75', '345 ÷ 5 = 69'],
    whenToUse: 'Composite divisors and ÷5/÷25.',
    drill: { weights: { DIV_EXACT: 100 }, tier: 2 },
    related: ['T8'],
    masteryTag: 'DIV_EXACT',
  },
  {
    id: 'T11',
    slug: 't11-divisibility-rules',
    title: 'Divisibility rules (also your error-checkers)',
    category: 'Division & divisibility',
    hook: 'The rules eliminate impossible answers and validate exact divisions instantly.',
    method:
      '2/5/10: last digit · 4: last two digits · 8: last three · 3/9: digit sum · 6: rules 2∧3 · 11: alternating digit sum · 7: double the last digit, subtract from the rest (315 → 31−10 = 21 ✓).',
    examples: ['315 divisible by 7? 31 − 2·5 = 21 ✓', '4,928 by 4? "28" ÷ 4 ✓'],
    whenToUse: 'Eliminating impossible multiple-choice answers; checking exact divisions.',
    drill: {
      weights: { FRAC_COMPARE: 100 },
      note: 'The divisibility quiz variant is P2; this drill uses fraction comparison for now.',
    },
    related: ['T15'],
    masteryTag: 'FRAC_COMPARE',
  },
  {
    id: 'T12',
    slug: 't12-conversion-table',
    title: 'The conversion table is not optional',
    category: 'Fractions, decimals, percentages',
    hook: 'Table R1 must be recall, not calculation — it converts division and percentage questions into lookups.',
    method:
      '3 ÷ 8 = 0.375 because 3/8 is 0.375; 0.4375 is 7/16. Memorize R1 (an SRS deck ships for exactly this) so conversions become instant.',
    examples: ['3 ÷ 8 = 0.375', '7/16 = 0.4375', '5/6 ≈ 0.8333'],
    whenToUse: 'Any fraction↔decimal conversion, and percentages built on them.',
    drill: { weights: { FRAC_TO_DEC: 50, DIV_TO_DEC: 50 } },
    related: ['T13'],
    masteryTag: 'FRAC_TO_DEC',
  },
  {
    id: 'T13',
    slug: 't13-percentage-moves',
    title: 'Percentage moves',
    category: 'Fractions, decimals, percentages',
    hook: 'Commute, decompose, and chain percentages instead of computing them head-on.',
    method:
      'Commute: a% of b = b% of a (8% of 25 = 25% of 8 = 2). Decompose: 23% of 60 = 20%(12) + 3%(1.8) = 13.8; 7.5% of 240 = 10%(24) − 2.5%(6) = 18. Change: (new−old)/old (60→75 = 15/60 = +25%). Successive: +20% then −20% = ×1.2×0.8 = −4% (never zero).',
    examples: ['8% of 25 = 25% of 8 = 2', '23% of 60 = 13.8', '60 → 75 = +25%'],
    whenToUse: 'Any percentage-of, reverse-percentage, or percentage-change question.',
    drill: { weights: { PCT_OF: 40, PCT_REVERSE: 30, PCT_CHANGE: 30 } },
    related: ['T12'],
    masteryTag: 'PCT_OF',
  },
  {
    id: 'T14',
    slug: 't14-missing-operand',
    title: 'Missing operand: last-digit sniper',
    category: 'Test-specific weapons',
    hook: 'Solve 17 × ⬚ = 391 from the units digit and magnitude — no long division.',
    method:
      '17 × ⬚ = 391: units digit — 7×? ends in 1 → ? ends in 3. Magnitude — 391÷17 ≈ 400÷17 ≈ 23. Answer 23. Units digits of ×3,×7,×9 are unique; ×2,×4,×5,×6,×8 leave two candidates — magnitude picks between them.',
    examples: ['17 × ⬚ = 391 → 23', '13 × ⬚ = 208 → 16'],
    whenToUse: 'Missing-operand multiplication.',
    drill: { weights: { MISSING_MUL: 100 } },
    related: ['T15'],
    masteryTag: 'MISSING_MUL',
  },
  {
    id: 'T15',
    slug: 't15-two-second-checks',
    title: 'The three 2-second checks',
    category: 'Test-specific weapons',
    hook: 'Under +1/−1 scoring, a 2-second check that catches a 1-in-10 error is worth points.',
    method:
      '1. Last digit (7×6 must end in 2). 2. Magnitude (47×36 ≈ 50×35 = 1750, so 1692 plausible, 16 920 not). 3. Casting out nines (digit-sums mod 9 are preserved by +,−,×: 47×36 → 2×0 = 0; 1692 → 18 → 0 ✓).',
    examples: [
      'Last digit: 7 × 6 ends in 2',
      'Magnitude: 47 × 36 ≈ 1750',
      'Casting out nines: 47×36 → 0; 1692 → 0 ✓',
    ],
    whenToUse: 'Before committing any answer on a negatively-marked test.',
    drill: {
      weights: {
        ADD_2D: 15,
        SUB_2D: 12,
        MUL_1x2: 15,
        MUL_2x2: 10,
        DIV_EXACT: 12,
        MISSING_MUL: 8,
        PCT_OF: 8,
        FRAC_TO_DEC: 8,
        SQUARE: 6,
        ADD_DEC: 6,
      },
      input: 'test',
      feedback: true,
    },
    related: ['T14', 'T11'],
    masteryTag: 'MUL_2x2',
  },
];

export function getTechnique(slug: string | undefined): Technique | undefined {
  return TECHNIQUES.find((t) => t.slug === slug);
}

export function getTechniqueById(id: string): Technique | undefined {
  return TECHNIQUES.find((t) => t.id === id);
}

/** The technique that teaches a skill tag (for review-row "Learn the trick"). */
export function techniqueForTag(tag: string): Technique | undefined {
  return TECHNIQUES.find((t) => t.masteryTag === tag);
}
