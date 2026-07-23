# Execution Plan — orchestrator + 2 subagents

_Three stages. Stage A is sequential (orchestrator only). Stage B is the only
parallel part — two subagents with **disjoint file ownership**. Stage C is
integration + verification (orchestrator). Commit at each stage boundary (and
after A's sub-steps); never push._

## Stage A — Foundation (orchestrator, sequential — do NOT delegate)

| Step | Work | Accept |
|---|---|---|
| A1 | Motion/duration tokens in `tokens.css` + Tailwind theme mapping ([02 §Tokens](02-motion-spec.md)) | `npm run check` green |
| A2 | `src/ui/Button.tsx` primitive ([03 §C1](03-consistency-spec.md)) + convert **one** page (Settings) as the reference implementation | Settings renders identically-or-better in both themes |
| A3 | Fonts ([03 §C2](03-consistency-spec.md)) — install `@fontsource/*`, import, verify woff2 in build, no CDN requests | build green; play-screen numerals in JetBrains Mono |
| A4 | Commit: `UI-A: motion tokens, Button primitive, self-hosted fonts` | — |

Stage A exists because both subagents consume these artifacts; building them
in parallel would fork the conventions.

## Stage B — Parallel subagents (Opus 4.8, `subagent_type: general-purpose`)

Both prompts are self-contained (subagents start cold): repo path, "read
`ui-review/02` + `ui-review/03` + `src/ui/Button.tsx` first", the ownership
list, the rules below. **Neither subagent commits, runs the dev server, or
touches files outside its list.** Both run `npx tsc -b --noEmit` + `npx eslint`
on their files before reporting.

### Subagent 1 — "Motion" (play surfaces + results)

**Owns:** `src/pages/ResultsPage.tsx`, `src/pages/PlayPage.tsx`,
`src/pages/DailyPlayPage.tsx`, `src/pages/DrillPlayPage.tsx`,
`src/pages/SimPlayPage.tsx`, `src/pages/SrsReviewPage.tsx`,
`src/ui/play/*` (Countdown, PauseOverlay, PlayField, Clock),
`src/ui/BandGauge.tsx`.

**Delivers:** M1–M6 + M8 from [02-motion-spec](02-motion-spec.md); converts its
surfaces' buttons to `Button` (they own these files, so the sweep here is
theirs); C5 verify-pass. Hard rules: do-not-animate list; countdown cadence
unchanged; pause close instant; reduced-motion collapses everything (JS
count-up checks `matchMedia`); no engine imports.

### Subagent 2 — "Sweep" (shell + content pages)

**Owns:** `src/ui/TopBar.tsx`, `src/ui/primitives.tsx`, `src/ui/PresetPanel.tsx`,
`src/ui/DataSettings.tsx`, `src/pages/HomePage.tsx`, `src/pages/SettingsPage.tsx`
(A2 already converted it — align only), `src/pages/LearnPage.tsx`,
`src/pages/LearnDetailPage.tsx`, `src/pages/DrillsPage.tsx`,
`src/pages/SimsIndexPage.tsx`, `src/pages/SimLobbyPage.tsx`,
`src/pages/DailyPage.tsx`, `src/pages/StatsPage.tsx`, `src/pages/NotFoundPage.tsx`,
`src/ui/stats/*` (touch only for C6 spacing/duration tokens — chart config
untouched).

**Delivers:** C1 sweep across its pages, C3 top-bar chips, C4 conventions,
C6 loading-flash fixes, M7 hover/press via the primitive. Hard rules: no new
motion beyond M7 (motion belongs to Subagent 1), no layout redesign, no
engine/store logic changes except the read-only `dueCount()` wiring for C3.

**Shared-read, never-write (both):** `src/index.css`, `src/styles/tokens.css`,
`src/ui/Button.tsx`, `tailwind.config.ts`, `package.json`, everything under
`src/engine/` and `src/store/` (exception: Subagent 2 may *import* from
`src/store/` for C3). If a subagent believes it needs a change in a
never-write file, it reports the need instead of making it.

## Stage C — Integration & verification (orchestrator)

1. Review both diffs against the specs; resolve any drift (conventions win
   over subagent creativity).
2. Gates: `npm run check` + `npm run e2e`; `git diff --stat src/engine/` must
   be empty; bundle JS delta ≤ +2 KB gz.
3. Browser walkthrough (dev server, both themes): play a full sprint
   (feel-check: hard cuts intact) → results reveal + PB path → countdown →
   pause overlay → Home/top-bar chips → Settings/Drills/Learn button
   consistency → Stats (no loading jump). Screenshots of: results moment,
   countdown tick, Home with chips, Settings dark+light.
4. Reduced-motion check: with DevTools emulation (or a temporary
   `@media`-forcing class), results/countdown render final states instantly.
5. Commits: `UI-B1: meaningful motion (results reveal, PB moment, countdown,
   overlays)`, `UI-B2: consistency sweep (Button everywhere, top-bar chips,
   loading fixes)` — or a single squashed `UI: polish pass` if diffs
   interleave. Then a summary for user review. **No push.**

## Risk table

| Risk | Mitigation |
|---|---|
| Subagents invent styles | Specs are exhaustive; orchestrator reviews diffs against them and reverts drift |
| Play-loop regression | Do-not-animate list + e2e flows + manual sprint feel-check |
| e2e selector breakage from Button sweep | e2e selects by role/name (`getByRole('button', {name})`) — semantics preserved by using a real `<button>`; run e2e in Stage C before summarizing |
| Font bundle bloat | woff2 subsets only, 5 weights total; assets not JS |
| Merge conflicts | Disjoint ownership lists; orchestrator is the only writer to shared files |
