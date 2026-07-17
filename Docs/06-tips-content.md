# 06 — Learn Section: Tips, Tricks & Reference Content

This is both the **content** (ship it nearly verbatim) and the **structure** of the Learn section. Techniques have stable IDs (`T1…`) used by the technique↔drill mapping (§ Mapping) and by results-screen "Learn the trick" links.

Page template per technique: hook line → method → worked examples → when to use → pitfall → **Drill this** button.

---

## Category A — Foundations

### T1 · Work left to right
School arithmetic goes right-to-left with carries; mental arithmetic goes **big digits first** — you hold fewer things in your head and you get the magnitude early (which is what checks are built on).
- `487 + 259`: 400+200 = 600 → 80+50 = 130 → 730 → 7+9 = 16 → **746**.
- `634 − 278`: 634−200 = 434 → −70 = 364 → −8 = **356**.
**Use:** every addition/subtraction. **Pitfall:** don't verbalize intermediate numbers fully ("seven hundred thirty") — hold them as digits.

### T2 · Compensation: round, then repair
Replace an ugly number with a round one, fix the error after.
- `+ 99` → `+100 − 1`: 468+99 = **567**. `− 278` → `−300 + 22`: 634−278 = **356**.
- `× 99` → `×100 − ×1`: 68×99 = 6800−68 = **6732**. `× 102` → `×100 + ×2`: 68×102 = 6800+136 = **6936**.
**Use:** any operand within ~5 of a round number. **Pitfall:** repair direction — subtracting a too-big number means adding back.

### T3 · Complements to 100 / 1000
`100 − n`: every digit pairs to 9, the last to 10 → `1000 − 377` = **623** instantly (6=9−3, 2=9−7, 3=10−7). This powers change-making, subtraction, and percentages (`100% − 37.7%`).
**Drill:** complements deck (R5).

## Category B — Multiplication

### T4 · Split & distribute (the workhorse)
One factor splits by place value: `47 × 8` = 40×8 + 7×8 = 320+56 = **376**. Works left-to-right: say "320… 376", never "56 carry".
**Use:** any 1×2 or 1×3. This must become automatic before anything else.

### T5 · 2×2 cross-multiplication
`ab × cd` = (a·c)·100 + (a·d + b·c)·10 + b·d, accumulated left to right.
- `47 × 36`: 12 → 1200; cross 4·6+7·3 = 45 → 1650; 7·6 = 42 → **1692**.
- `23 × 41`: 8 → 800; 2·1+3·4 = 14 → 940; 3 → **943**.
**Use:** general 2×2 when no shortcut (T6–T9) applies. **Pitfall:** the cross term is the error magnet — practice it isolated (drill has a "cross-term only" warm-up tier).

### T6 · Difference of squares
`(m+d)(m−d) = m² − d²`. Spot pairs straddling a round mean.
- `18 × 22` = 20²−2² = **396** · `47 × 53` = 50²−9 = **2491** · `65 × 75` = 70²−25 = **4875**.
**Use:** operands with an even gap and easy mean. Requires squares recall (R2) — learn together.

### T7 · Squares: end-in-5 and near-base
- Ends in 5: `n5²` = n·(n+1), append 25: 85² = 72|25 = **7225**.
- Near 50: `(50±d)²` = (25±d)·100 + d²: 47² = 2200+9 = **2209**; 52² = 2700+4 = **2704**.
- Near 100: `(100±d)²` = (100±2d)·100 + d²: 97² = 9400+9 = **9409**; 104² = 10800+16 = **10816**.

### T8 · Factor games: ×5, ×25, ×50, doubling–halving
×5 = ×10÷2 (86×5 = **430**) · ×25 = ×100÷4 (48×25 = **1200**) · ×50 = ×100÷2 · ×15 = ×10 + half that (62×15 = 620+310 = **930**). Doubling–halving: `45 × 24` = 90×12 = **1080**; `16 × 35` = 8×70 = **560** — halve the even one, double the other, until one factor is trivial.

### T9 · Digit tricks: ×11, ×9, units-sum-to-10
- ×11: neighbors sum inward: 43×11 → 4|(4+3)|3 = **473** (carry when the sum ≥ 10: 87×11 → 8|15|7 → **957**).
- ×9 = ×10 − n: 34×9 = 340−34 = **306**.
- Same tens, units summing to 10: `63 × 67`: tens 6×(6+1) = 42, units 3×7 = 21 → **4221**.

## Category C — Division & divisibility

### T10 · Divide by factoring
Break the divisor: `336 ÷ 14` = ÷7 then ÷2 → 48 → **24**. `1800 ÷ 24` = ÷8 ÷3 → 225 → **75**. ÷5 = ×2÷10 (345÷5 = **69**); ÷25 = ×4÷100 (900÷25 = **36**).

### T11 · Divisibility rules (also your error-checkers)
2/5/10: last digit · 4: last two digits · 8: last three · 3/9: digit sum · 6: rules 2∧3 · 11: alternating digit sum · 7: double the last digit, subtract from the rest (315 → 31−10 = 21 ✓). **Use in tests:** eliminate impossible answers and validate exact divisions instantly.

## Category D — Fractions, decimals, percentages

### T12 · The conversion table is not optional
Table R1 below must be *recall*, not calculation — it converts division and percentage questions into lookups: `3 ÷ 8` = **0.375** because 3/8 *is* 0.375; `0.4375` *is* 7/16. SRS deck ships for exactly this.

### T13 · Percentage moves
- **Commute:** a% of b = b% of a → `8% of 25` = 25% of 8 = **2**.
- **Decompose:** 23% of 60 = 20%(12) + 3%(1.8) = **13.8**; 7.5% of 240 = 10%(24) − 2.5%(6) = **18**.
- **Change:** (new−old)/old: 60→75 = 15/60 = **+25%**.
- **Successive:** +20% then −20% = ×1.2×0.8 = ×0.96 = **−4%** (never zero).

## Category E — Test-specific weapons

### T14 · Missing operand: last-digit sniper
`17 × ⬚ = 391`: units digit — 7×? ends in 1 → ? ends in 3. Magnitude — 391÷17 ≈ 400÷17 ≈ 23. Answer **23**, no long division. Works because units digits of ×3,×7,×9 multiplication are unique; ×2,×4,×5,×6,×8 leave two candidates — magnitude picks between them.

### T15 · The three 2-second checks
1. **Last digit** (7×6 must end in 2), 2. **Magnitude** (47×36 ≈ 50×35 = 1750, so 1692 plausible, 16 920 not), 3. **Casting out nines** (digit-sums mod 9 are preserved by +,−,×: 47×36 → 2×0 = 0; 1692 → 18 → 0 ✓). Under +1/−1 scoring, a 2-second check that catches 1-in-10 errors is worth points.

---

## Reference tables (each page: the table + "Turn into flashcards")

### R1 · Fraction ↔ decimal ↔ percent (the memorization core)
Halves–quarters–fifths: ½ .5 · ⅓ .3333 · ⅔ .6667 · ¼ .25 · ¾ .75 · ⅕ .2 (n/5 = 2n/10).
Sixths: 1/6 .1667 · 5/6 .8333. Eighths: 1/8 **.125** · 3/8 **.375** · 5/8 **.625** · 7/8 **.875**.
Sevenths (the rotating cycle 142857): 1/7 .1429 · 2/7 .2857 · 3/7 .4286 · 4/7 .5714 · 5/7 .7143 · 6/7 .8571.
Ninths: n/9 = 0.nnn… Elevenths: n/11 = repeating 09×n (3/11 = .2727). Twelfths: 1/12 .0833 · 5/12 .4167 · 7/12 .5833 · 11/12 .9167.
Sixteenths: 1/16 **.0625** · 3/16 .1875 · 5/16 .3125 · 7/16 .4375 · 9/16 .5625 · 11/16 .6875 · 13/16 .8125 · 15/16 .9375.
Twentieths: n/20 = 5n%.

### R2 · Squares 1–30
1,4,9,…,144 assumed; the paying range: 13²169 · 14²196 · 15²225 · 16²256 · 17²289 · 18²324 · 19²361 · 21²441 · 22²484 · 23²529 · 24²576 · 25²625 · 26²676 · 27²729 · 28²784 · 29²841.

### R3 · Powers of 2 → 2¹²
2,4,8,16,32,64,128,256,512,1024,2048,4096.

### R4 · Times tables 13–20
Full grid page (heatmap-linked). Priority facts: 13×13…17×17 diagonal, ×13 and ×17 rows (least pattern-friendly).

### R5 · Complements to 100 / 1000
Digit-pair rule from T3; drill deck of 40 random targets.

---

## Strategy articles (no drill button; linked from sim lobbies)

### S1 · Negative-marking calculus
At +1/−1, answering with confidence p has EV 2p−1: **answer only above ~50% confidence**; a T15 check that moves you from 50→75% is worth +0.5 per question. On no-skip tests (Optiver-style), you must commit — spend the seconds on elimination, not deliberation. Never "revenge-answer" after a streak of skips.

### S2 · Pacing the 6-second budget
80-in-8 = 6 s average, but the right *distribution* is 2–3 s on the easy 60%, banking time for the hard 40%. Hard cap ~15 s: beyond it, apply T15, commit, move. Train with the clock visible until pace is internalized, then hide it (setting exists).

### S3 · Test-day protocol
10 minutes before: one 2-min sprint (warm), 3 min of R1/R2 flashcards (prime recall), then stop — arrive slightly under-warmed, not fried. Environment: numpad if you're faster on it (practice both), full screen, phone away. During: first 5 questions deliberately careful — early wrongs snowball into panic.

### S4 · The 8-week arc (feeds the training-plan feature)
Wk 1–2: T1–T4 + daily sprints (target 30→40) + start R1/R2 decks. Wk 3–4: T5–T9, 2×2 drills, sprint 50s. Wk 5–6: fractions/percent (T12–T13), first firm sims, sprint 60s. Wk 7–8: sims on alternate days, weakness drills from the heatmap, sprint 70+. Daily dose ≈ 15 min: 2 sprints + 1 targeted drill + SRS review.

### S5 · Reading the dashboard
What to fix first: accuracy < 90% beats latency (wrong answers cost double under −1); then the heatmap's darkest cells; then fatigue delta. One focus per week.

---

## Mapping: technique → drill spec (drives "Drill this" buttons)

| ID | Drill (doc 04 terms) | ID | Drill |
|----|----------------------|----|-------|
| T1 | `ADD_3D`+`SUB_3D`, tier 2 | T9 | `MUL_2x2` constrained: ×11 / ×9 / units-sum-10 variants |
| T2 | `ADD_2D`+`SUB_2D` operands near round numbers | T10 | `DIV_EXACT` composite divisors, tier 2 |
| T3 | complements deck (SRS) + `MISSING_ADD` vs 100/1000 | T11 | `FRAC_COMPARE` + divisibility quiz variant (P2) |
| T4 | `MUL_1x2` tier 2, `MUL_1x3` | T12 | `FRAC_TO_DEC` + `DIV_TO_DEC` |
| T5 | `MUL_2x2` tier 2–3, no shortcut pairs | T13 | `PCT_OF`+`PCT_REVERSE`+`PCT_CHANGE` |
| T6 | `MUL_2x2` constrained to (m+d)(m−d) pairs | T14 | `MISSING_MUL` |
| T7 | `SQUARE` 11–30 | T15 | sim-style mixed, test input, feedback on |
| T8 | `MUL_1x2`/`MUL_2x2` with ×5/×15/×25/×50 & even-halving pairs | | |

Constrained variants (e.g. "difference-of-squares pairs only") are generator options in doc 04's `GeneratorConfig`, set by these drill specs.
