# Findings — Bugs, Usability & Design Flaws

_Every finding below was verified in code during this review (file:line cited).
Ordered by severity. "Why it matters" is the PM justification — nothing here is
cosmetic nitpicking._

---

## F1 · Heatmap "drill this fact" is fake — **critical, core promise**

**Where:** `src/pages/DrillsPage.tsx:59`
```ts
else if (fact) start(fact.includes('×') ? 'MUL_1x2' : 'MUL_1x2', { count: 10 });
```
Both ternary branches are `'MUL_1x2'`. Clicking a weak cell on the times-table
heatmap (e.g. `13×17`, outlined red as weak) navigates to
`/drills?fact=mul:13×17` — and then starts a **generic 1×2 drill that ignores
the fact entirely**. The same is true of the skill-breakdown's promise.

**Why it matters:** "click your weakness → drill exactly that" is the app's
headline differentiator over Zetamac (doc 02, doc 03 §6). Right now the loop
*looks* closed but isn't — the worst kind of gap, because users can't tell
they're not getting the feature. **Fix:** add operand-pinning to
`GeneratorConfig` (e.g. `pinPair: [a, b]`) honored by MUL_1x2/MUL_2x2/DIV_EXACT/
MISSING_MUL so a fact drill serves that pair across question forms (`a×b`,
`p÷a`, `a×⬚=p`) with light neighbors mixed in; parse the `fact` param properly.

## F2 · Onboarding baseline pollutes Zetamac-comparable stats — **high, trust**

**Where:** `src/pages/PlayPage.tsx:26-30` + `src/store/dashboard.ts`.
The `?seconds=60` override changes `durationMs` **without recomputing
`configHash`**, so the 60-second onboarding baseline is stored under the same
hash as real 120-second Zetamac-default sprints. Consequences: it appears as a
~half-score point in the score-over-time chart, drags the rolling-7 average and
last-7 sparkline, and competes in the same PB bucket.

**Why it matters:** score comparability is the product's sacred constraint
(decision log §2). The very first data point a new user generates corrupts
their baseline series. **Fix:** recompute `configHash` from the *actual* plan
(duration included) so the baseline is its own config group.

## F3 · Streak is exported but never restored on import — **high, data loss**

**Where:** `src/store/exportImport.ts` — `buildExportBundle` writes
`streak` (line 92), but `importBundle` never writes `aleph-streak` back (and
never updates the in-memory `useStreakStore`, which is initialized once at
module load). A user migrating devices silently loses their streak — the one
number the habit layer asks them to care about.

**Fix:** on import (both modes if the incoming streak is "better"; at minimum
on replace), persist `bundle.streak` to localStorage **and**
`useStreakStore.setState(...)`.

## F4 · SRS review is a dead end — **medium-high, usability**

**Where:** `src/pages/SrsReviewPage.tsx` (no Escape handler, no exit control)
plus `src/ui/AppLayout.tsx` hides the top bar on `/srs`. Once a review starts,
the only way out is the browser back button. Every other fullscreen surface
(sprint/drill/sim) has Esc + an explicit Quit.

**Why it matters:** a 40-card session is long; trapping the user breaks the
app's own interaction grammar. **Fix:** Esc → confirm/exit to Home (progress is
already saved per card, so exiting is safe); show the same "Esc to quit" hint
line the other play screens use.

## F5 · Home's daily card doesn't show today's state — **medium**

The Home daily card shows only the streak number. Whether you've *done today's
daily* — the single daily decision the habit loop asks for — requires a click
into `/daily`. **Fix:** one line on the card: "▶ Play today's 120s" vs.
"✓ Done today · 47". (The DailyPage already computes this; lift the check.)

## F6 · Keyboard map is ~20% implemented — **medium, core audience**

Spec'd map (doc 07 §5): global `g h`/`g s`/`g l`, `?` overlay, Home `d` and
`1–9` preset select, results `↑↓` row traversal + Enter→drill. Implemented:
results `Enter`/`N`/`D` only. For a product whose entire pitch is
keyboard-speed, power users will feel this within minutes. Scope it with M6 (it
was always M6 scope) — flagged here so it's treated as product-critical, not
polish.

## F7 · Fullscreen exit affordances are inconsistent — **low-medium**

Sprint/drill: Esc → pause → Quit. Sim: Esc → confirm quit. SRS: nothing (F4).
Daily: same as sprint. After F4 is fixed, do a one-pass sweep so the hint line
("Esc to pause" / "Esc to quit") is present and truthful on all five surfaces.

## F8 · Mastery window deviates from spec — **low, honesty of stats**

Spec: mastery chips derive from the **last 30 days** (doc 05 §2).
Implementation: all-time aggregates (`src/store/dashboard.ts` has no time
window). Effect: a user who was bad in week 1 and solid in week 6 shows
depressed accuracy forever; chips under-report improvement. Fix is cheap
because `skillBreakdown` is per-session: filter sessions to the last 30 days
when building skill rows.

## F9 · Drill anti-repeat window is 6, spec says 8 — **low**

`src/ui/play/useDrillEngine.ts` uses a 6-item window vs. the engine stream's 8
(doc 04 §4). Harmless in mixed drills, noticeable in single-fact drills (more
repeats). Align to 8 when implementing F1 (same file).

---

## Design flaws that are *not* worth fixing now

Listed so a future agent doesn't "improve" them speculatively:

- **Recharts costs 104 KB gz for one line chart.** True, but it's code-split
  and loads only on `/stats`. Replacing it with hand-rolled SVG is real work
  for zero user-visible gain. Revisit only if the bundle budget is ever
  threatened.
- **Flow-sprint accuracy reads ~100% in vitals.** By construction (no wrong
  state in flow input). Mildly redundant but honest; removing it adds a special
  case for no benefit.
- **FRAC_COMPARE answers via typed 1/2** rather than dedicated choice buttons.
  Works, is keyboard-fast, and is used by exactly one drill; a custom MCQ UI is
  not warranted.
- **The dark-terminal aesthetic** is coherent, on-spec, and differentiating. No
  visual redesign is needed; do not spend effort here.
