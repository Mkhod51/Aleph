# UI Findings — the current slop, quantified

_Measured against the working tree at `570979d` (Phase 0 complete). Everything
below was verified by grep/screenshot, not vibes._

## U1 · The intended typefaces have never shipped — **highest visual impact**

`tokens.css` declares `'JetBrains Mono'` / `'Inter'` but **no font files are
bundled** (`@fontsource` absent from `node_modules`). Every user sees system
fallbacks; the "trading terminal" look the design system is built around
(doc 07 §2 — tabular numerals, mono prompts) only half-exists. This is roadmap
task 1.3 pulled forward — it changes the perceived quality of every screen at
once and must land **before** the polish sweep so spacing is tuned against the
real metrics.

## U2 · 45 ad-hoc buttons, 9 padding dialects — **the core of "less slop"**

Grep of `rounded-btn` across `src/**/*.tsx`:

```
11× px-3 py-1.5   10× px-5 py-2   5× px-4 py-2   5× px-2 py-1
 4× px-6 py-3      3× px-3 py-1   2× px-4 py-1.5  1× px-8 py-4  1× px-2.5 py-1
```

Plus: `transition-colors` on 10 of them, `transition-transform` on 3, nothing
on the rest; `disabled:opacity-40` (5×) vs `disabled:opacity-60` (1×); primary
buttons variously `font-mono font-semibold`, `font-medium`, or plain. The same
semantic button (e.g. "start" actions on Home / sim lobby / daily / technique
pages) renders at four different sizes/weights. No single change would make the
app read as more deliberate than collapsing these into one primitive.

## U3 · The two spec'd animation moments were never built

- **Results reveal** (doc 07 §2 names "band reveal on results" as the canonical
  meaningful animation): the results screen currently pops in fully formed —
  the hero number, band, vitals and table all appear at once with no moment.
- **PB celebration** (doc 07 §4: "the hero number ticks up and the band gauge
  fills — one 400 ms moment"): currently a static "New best" chip. Also the
  results hero shows a band *dot + label* but not the `BandGauge` the mockup
  shows.

These are the places the motion budget is *supposed* to be spent, and they're
empty.

## U4 · Abrupt state swaps on transient surfaces

- Countdown 3-2-1: numbers swap via bare re-render — no tick emphasis.
- Pause overlay / sim quit-confirm: full content region swaps in one frame.
  (During-play entry must stay *fast* — a ≤120 ms fade is the ceiling.)
- These are the only "jarring" swaps worth touching. Question advance is a
  hard cut **by spec** and stays one.

## U5 · Top bar is emptier than its own spec

Doc 07 §3's nav diagram includes `🔥12 · ⚡40 due` chips in the top bar. Not
implemented (grep: zero). Home shows both numbers, but the habit loop loses
visibility the moment you navigate anywhere else. Cheap, spec'd, genuinely
useful — the one *addition* this pass makes.

## U6 · Loading text flashes

`/stats` and `/results` render a centered "Loading…" line for the few ms the
IndexedDB read takes, then the full layout pops in (visible layout jump).
Data is local and fast — the fix is **reserving layout** (min-heights /
returning the shell immediately), not skeleton systems. Fix only where the
flash is actually observable.

## U7 · Minor conventions drift (fix in passing, no dedicated effort)

- Container widths: `max-w-2xl` (settings/daily) vs `max-w-3xl` (home, learn,
  drills, results) vs `max-w-content` (stats). Defensible per content type —
  document as the convention (narrow/default/wide) and stop there.
- Heatmap cell hover uses `hover:scale-110` with default duration; toggle
  switches and segmented controls each carry their own transition values.
  All inherit the shared duration tokens in the sweep.
- Recharts animation is already disabled (`isAnimationActive={false}`) — keep
  it that way; chart mount animation is decoration.

## Explicitly *not* findings (do not "fix")

- The terminal aesthetic, color tokens, or information density — on-spec and
  differentiating.
- Flow-accuracy ~100 % display, FRAC_COMPARE typed 1/2 input, Recharts bundle
  weight — all previously adjudicated in `pm-review/02` §non-fixes.
- Emoji as iconography (🔥 ⚡ ▶ ✓ ✗) — the spec's own mockups use them; adding
  an icon library would violate the dependency rule for zero gain.
