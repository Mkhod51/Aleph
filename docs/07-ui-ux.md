# 07 — UI / UX Design

Look, feel, and interaction. The aesthetic target: **a trading terminal's calm precision** — dark, dense with meaning, zero decoration, numbers as the heroes. Think Bloomberg-meets-Linear, not Duolingo.

---

## 1. Design principles

1. **The question is the interface.** During play, ≥ 90% of visual weight is the prompt and input. Everything else whispers.
2. **Instant beats animated.** Question transitions are hard cuts (< 50 ms). Animation only where it carries meaning (band reveal on results), never during play, always ≤ 200 ms, disabled under `prefers-reduced-motion`.
3. **Color = state, never decoration.** Green/red mean correct/wrong only. One accent color for interaction. Everything else is neutral.
4. **Numbers align.** Tabular figures everywhere; latency columns, scores, and grids line up to the pixel.

## 2. Design tokens

```css
/* Dark (default) */
--bg: #0B0E14;            /* near-black blue */
--surface: #131822;       /* cards */
--surface-2: #1A2130;     /* hover/raised */
--border: #232B3A;
--text: #E6EAF2;
--text-dim: #8A94A6;
--accent: #FFB020;        /* amber — interactive, focus, brand */
--good: #22C55E;  --good-bg: #0E2A1A;
--bad:  #EF4444;  --bad-bg:  #2A1214;
--band-1: #3B4252; --band-2: #4C566A; --band-3: #5E81AC; --band-4: #88C0D0; --band-5: #FFB020;
/* heatmap latency ramp: --heat-0 #16324F (fast) → --heat-4 #B4432F (slow), colorblind-checked */

/* Light theme: same roles — bg #F7F8FA, surface #FFFFFF, border #E3E6EB, text #171B26,
   text-dim #5B6472, accent #B45309, good #15803D, bad #B91C1C */
```

- **Type:** `Inter` (UI) + `JetBrains Mono` (all numerals, prompts, stats), self-hosted, `font-feature-settings: "tnum"` on Inter where numbers appear.
- Scale: question `clamp(3rem, 9vw, 6rem)` w/ mono; hero score 4rem; h1 1.5rem; body 0.9375rem; captions 0.8125rem.
- Spacing: 4 px base grid; radius 8 px (cards), 6 px (buttons); borders 1 px, no shadows in dark theme (subtle in light).
- Focus ring: 2 px `--accent`, always visible on keyboard nav.

## 3. Navigation & information architecture

```
Top bar (thin, hidden during play):  ◆ Aleph · Play · Sims · Drills · Learn · Stats  ···  🔥12 · ⚡40 due · ⚙
Routes: / (Home) · /play/:preset · /sims · /sims/:id · /drills · /learn · /learn/:slug
        /stats · /daily · /srs · /settings · /results/:sessionId
```

## 4. Screens

### Home — "two keys to the first question"

```
┌──────────────────────────────────────────────────────────┐
│            [ ▶  START SPRINT — 120s default ]            │  ← autofocused; Enter starts
│         preset selector ▾        [Fix my gaps →]         │
│                                                          │
│  Daily challenge ──────────────  Streak 🔥 12 days       │
│  [ Play today's 120s ]           SRS: 14 cards due →     │
│                                                          │
│  Last 7 sprints: 52 ▂▄▃▆▅▇█ 61   band: Interview floor   │
│  Sims · Drills · Learn · Stats  (cards row)              │
└──────────────────────────────────────────────────────────┘
```

### Play (sprint/drill — flow input)

```
                    1:47                    ← clock, top-center, dim (hideable)
                                       12   ← score, top-right, dim (hideable)

                 47 × 36
                 ┌────────┐
                 │ 16▏    │                 ← mono, huge, centered; caret visible
                 └────────┘
                                            ← nothing else. Esc = pause.
```
Sim variant: `Q 34/80` replaces score; no pause; committed answers give **no** feedback — the input just clears (matching real tests). Drill-with-feedback variant: 300 ms background flash `--good-bg`/`--bad-bg` + correct answer shown 1.2 s on miss.

### Results

```
┌ NET 62 ────────────────── Competitive · community-reported ┐
│  ▲ +7 vs last · PB 66            [band gauge ▁▁▃▅█▅▁]      │
│  80 attempted · 71 ✓ · 9 ✗ · 88.7% · med 4.1s · 8.9/min    │
├────────────────────────────────────────────────────────────┤
│  Review (worst first)                                      │
│  ✗ 17×⬚=391   you: 21   ans: 23   9.2s  [trick T14][drill] │
│  ✗ 7/8−3/4    you: 1/4  ans: 1/8  7.7s  [trick T12][drill] │
│  ✓ 47×36      1692                12.1s  [trick T5 ][drill] │  ← slow-correct also coached
├────────────────────────────────────────────────────────────┤
│  [Enter] Again   [N] New config   [D] Dashboard            │
└────────────────────────────────────────────────────────────┘
```
PB celebration: the hero number ticks up and the band gauge fills — one 400 ms moment, no confetti.

### Dashboard, Learn, Sim lobby
Dashboard: card grid per doc 05 §4, 2-col ≥ 1024 px, 1-col below; every empty card states its unlock path. Learn index: category sections, technique rows with mastery chips (— / learning / solid). Technique page: content template per doc 06 with sticky `[Drill this]`. Sim lobby: rules card (count, clock, scoring, no-skip), community-reported bars, your last 3 nets, big Start.

## 5. Keyboard map

| Context | Keys |
|---|---|
| Global (not typing) | `g h` Home · `g s` Stats · `g l` Learn · `?` shortcut overlay |
| Home | `Enter` start sprint · `d` daily · `1–9` preset select |
| Play | digits `.` `-` `/` input · `Enter` commit (test input) · `Esc` pause/quit · `Backspace` edit |
| Results | `Enter` again · `n` new config · `d` dashboard · `↑↓` traverse review rows · `Enter` on row → drill |
| Never | No shortcut uses modifiers that clash with browser (`Ctrl+R` etc. untouched) |

Input field is focused 100% of play time; clicking anywhere refocuses. Numpad and number-row both work; `-`/`/` accepted from both layouts.

## 6. Mobile (secondary but real)

- Play screen shows a **custom on-screen keypad** (bottom half, 4×3: digits, `.`, `-`, backspace; `/` appears only for fraction questions; left-hand mirror option in settings). Native keyboard is never invoked during play (`inputmode="none"`, focus trapping) — layout jank kills timing.
- Key targets ≥ 48 px; haptic tick on keypress (where supported); prompt scales down to 2.5rem.
- Dashboard cards stack; heatmap becomes scrollable with pinned headers.

## 7. Accessibility

- All state color-pairings carry a second signal (✓/✗ icons, outline vs fill, position) — verified against deuteranopia simulation; heatmap ramp is sequential-lightness (readable in grayscale).
- Contrast ≥ 4.5:1 for text, ≥ 3:1 for large numerals; visible focus everywhere; full app keyboard-navigable.
- Screen reader: play screen uses `aria-live="polite"` announcing new prompts; results table proper `<table>` semantics. (Realistically a speed-math app is vision-centric, but structure costs nothing.)
- `prefers-reduced-motion`: all transitions become instant; countdown becomes static "Ready? Enter to start".
- Question font-size setting (S/M/L/XL) independent of browser zoom.

## 8. Microcopy tone

Terse, factual, trader-flavored but not cosplay. Examples — empty dashboard: "No sessions yet. Two minutes gets you a baseline." · post-PB: "New best. Band: Competitive." · weak-fact drill intro: "Your 13×17 neighborhood is 2.1× slower than your average. 10 reps." Never: "Great job!! 🎉", guilt-tripping streak copy, or fake urgency.
