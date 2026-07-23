# Execution Plan — orchestrator + 3 subagents (Opus 4.8)

_Four stages. Stage A (foundation) is orchestrator-only and sequential — it
defines the tokens + kit everything else consumes, so it **cannot** be
parallelized without re-introducing inconsistency. Stages B1–B3 are the parallel
work: three subagents on **disjoint file sets**. Stage C is integration +
verification. Commit at every stage boundary; **never push**._

## Why 3 subagents (and not 2 or 4)
This is a larger surface than the earlier polish pass — it touches every screen,
adds a component kit, and re-themes the charts. The work cleaves into three
genuinely disjoint, roughly equal clusters (Play/Results, Dashboard/data-viz,
Shell/content) with **zero shared writable files** after the foundation lands.
Two subagents would leave one carrying two clusters (slower, bigger diffs); a
fourth has nothing disjoint left to own and would collide. If a subagent stalls
or drifts, the orchestrator absorbs its cluster rather than spawning a
replacement.

## Stage A — Foundation (orchestrator, sequential)

| Step | Work | Source |
|---|---|---|
| A1 | Token overhaul in `tokens.css` + Tailwind theme (colors/depth tiers/motion tokens/grid) | [01](01-design-system.md) |
| A2 | `.panel`/`.panel-hover`/`.gridfield`/`.readout` in `index.css @layer components`; scrollbar + focus-glow globals | [01](01-design-system.md) |
| A3 | Kit build: upgrade `Card`, `Button`, `Eyebrow`, `NavCard`, `BandGauge`; new `HeroReadout`, `StatTile`, `Chip`, `SegmentedControl`, `Toggle`, `Modal`, `EmptyState` in `src/ui/kit/` | [02](02-component-kit.md) |
| A4 | Convert **one** screen end-to-end as the reference (Settings — small, uses Toggle+Segmented+Card) and verify both themes | — |
| A5 | Commit `redesign-A: tokens + component kit + reference screen` | — |

Do not proceed to B until A4 looks right in dark **and** light.

## Stage B — Parallel subagents (`Agent`, `subagent_type: general-purpose`, model `opus`)

Each subagent prompt is self-contained: repo path; "read `ui-redesign/01`,
`02`, `03`, and `src/ui/kit/*` + `src/ui/Button.tsx` first"; its exact ownership
list; the never-write list; the guardrails; "run `npx tsc -b --noEmit` +
`npx eslint <your files>` before reporting; **do not** commit, run a dev server,
push, or touch files outside your list; report a summary + any spec ambiguity."

### B1 — "Play & Results"
**Owns:** `src/pages/ResultsPage.tsx`, `src/pages/PlayPage.tsx`,
`src/pages/DailyPlayPage.tsx`, `src/pages/DrillPlayPage.tsx`,
`src/pages/SimPlayPage.tsx`, `src/pages/SrsReviewPage.tsx`,
`src/ui/play/*` (Clock, Countdown, PauseOverlay, PlayField).
**Delivers:** [03 §Play + §Results](03-screen-treatments.md), motion R1–R4, C1,
O1, S1. **Hardest rule:** the timed play loop stays minimal — no texture, no
motion on prompt/input/advance/clock/score; overlays via kit `Modal`;
reduced-motion + `document.hidden` guards on the count-up.

### B2 — "Dashboard & data-viz"
**Owns:** `src/pages/StatsPage.tsx`, `src/ui/stats/*`
(ScoreChart, Heatmap, Calendar).
**Delivers:** [03 §Dashboard](03-screen-treatments.md) + [02 §C](02-component-kit.md):
`StatTile` headline, chart theming (faint grid/ticks, amber line + glow dots),
heatmap rounded cells + glowing weak-outline + legend, `EmptyState` cards, V1
section swaps. **Rule:** charts keep `isAnimationActive={false}`; aggregate reads
unchanged; no store/engine logic edits.

### B3 — "Shell & content"
**Owns:** `src/ui/TopBar.tsx`, `src/ui/AppLayout.tsx`, `src/ui/primitives.tsx`
(align after A3 upgraded Card/NavCard — import-only if already done),
`src/ui/PresetPanel.tsx`, `src/ui/DataSettings.tsx`, `src/pages/HomePage.tsx`,
`src/pages/DailyPage.tsx`, `src/pages/DrillsPage.tsx`,
`src/pages/SimsIndexPage.tsx`, `src/pages/SimLobbyPage.tsx`,
`src/pages/LearnPage.tsx`, `src/pages/LearnDetailPage.tsx`,
`src/pages/NotFoundPage.tsx` (Settings already done in A4).
**Delivers:** [03 §Home/Shell/Sims/Learn/Daily](03-screen-treatments.md): hero
`.gridfield`, `Card hover` + `StatTile`/`Chip`, top-bar chips + active marker
(N1), `EmptyState`s, `SegmentedControl` adoption. **Rule:** read-only store
imports (e.g. `dueCount`) allowed; no logic changes; no motion beyond H1/N1.

**Shared read-only (all three, never write):** `tokens.css`, `index.css`,
`tailwind.config.ts`, `src/ui/kit/*`, `src/ui/Button.tsx`, `package.json`,
`src/engine/**`, `src/store/**` (B2/B3 may _import_ from store). Need a change in
a never-write file → report it to the orchestrator.

## Stage C — Integration & verification (orchestrator)

1. Review the three diffs against [01](01-design-system.md)/[02](02-component-kit.md)/[03](03-screen-treatments.md);
   conventions win over any subagent creativity; revert drift.
2. Gates: `npm run check` + `npm run e2e` green; `git diff --stat src/engine/`
   **empty**; JS bundle delta ≤ +3 KB gz (fonts already counted; kit is small).
3. Browser walkthrough, **dark and light**, dev server:
   - Home (hero texture, chips, cards), a full **sprint** (feel-check: hard cuts,
     no shift, input responsive), **results reveal + PB path**, countdown,
     pause modal, a **sim lobby**, **Stats** (charts + heatmap + no loading
     jump), **Learn** technique page, **Settings** (segmented/toggle).
   - Screenshot: Home, Results moment, Dashboard, a lobby, Settings — each in
     both themes.
4. Reduced-motion pass (DevTools emulate): results/countdown/gauges render final
   states instantly; play unaffected.
5. Commits: `redesign-B1: play & results treatment`, `redesign-B2: dashboard &
   data-viz`, `redesign-B3: shell & content` (or squash to `redesign: precision-
   instrument UI` if diffs interleave). Summary for user review. **No push.**

## Guardrails (every stage)
- `Docs/07-ui-ux.md` is evolved, not discarded: play sanctity, reduced-motion,
  color=state, no glass/neon, honest UI all hold.
- No runtime deps beyond `@fontsource/*`. No framer-motion / component library.
  (If a subagent argues motion needs a library, the answer is no — use CSS +
  View Transitions; escalate to the user only if truly blocked.)
- Perf: keystroke→paint <30 ms, advance <50 ms, no play-loop DB writes, main
  bundle ≤250 KB gz. Verify the sprint still feels instant.
- Engine + data model: zero diffs.

## Suggested review cadence
Stage A → quick look (tokens/kit/Settings) · Stages B1–B3 land → Stage C review
(this is the "new look is done" checkpoint). Then resume the main roadmap
(`pm-review/04`) Phase 1 deployment.
