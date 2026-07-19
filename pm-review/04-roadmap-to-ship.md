# Roadmap to Ship — Agent-Executable Plan

_Sequenced phases with per-task acceptance criteria. Designed so an AI agent can
execute each phase, verify it, and stop for review. Ground rules for the
executing agent are in [05-continuation-prompt](05-continuation-prompt.md).
Complements the earlier `STATE-AND-DEPLOYMENT.md` (storage/backend analysis)._

**Global working rules (apply to every phase):**
- Specs in `Docs/` remain law; `src/engine/` stays pure (lint-enforced); bump
  `ENGINE_VERSION` only if zetamac-generator output changes (it must not).
- After each phase: `npm run check` (typecheck+lint+unit+build) and
  `npm run e2e` green, verify the affected flows in a real browser, then **stop
  and summarize for review. The user commits — never run `git commit/push`.**
- Playwright fixtures must seed `onboarded: true` (the onboarding gate broke
  e2e once already).

---

## Phase 0 — Trust fixes (do first; ~1 session)

Fixes the four verified bugs from [02-findings](02-findings-usability-design.md)
and clears the cut list. No new features.

### 0.1 Make heatmap/fact drills real (F1, F9)
- Add `pinPair?: [number, number]` to `GeneratorConfig` (`src/engine/types.ts`),
  honored by `MUL_1x2`, `MUL_2x2`, `DIV_EXACT`, `MISSING_MUL` generators: when
  set, draw the question from the pinned fact family — the exact pair most of
  the time, near neighbors (±2 on one operand, deterministic via the rng)
  otherwise, across the tag's question forms.
- Parse `?fact=mul:a×b` properly in `DrillsPage` → build a 10-question drill
  over those tags with `pinPair`. Title it like the doc-07 microcopy
  ("Your 13×17 neighborhood…" is optional; the tag + pair in the header is
  enough).
- Raise the drill-engine anti-repeat window from 6 → 8.
- **Accept:** unit test — 100 draws with `pinPair: [13,17]` all have factKeys
  in the 13/17 neighborhood, ≥60% exactly `mul:13×17`; determinism test still
  green (pinning is opt-in; zetamac output unchanged, `ENGINE_VERSION` stays).
  Browser: click heatmap cell 13×17 → every question involves the pinned
  neighborhood.

### 0.2 Stop the baseline polluting stats (F2)
- In `PlayPage`, when `?seconds=` differs from the preset, recompute the plan's
  `configHash` from the actual parameters (duration included) — e.g. extend
  `buildPlanFromPreset(preset, seed?, durationOverrideMs?)` so the hash is
  always derived from what is actually played.
- **Accept:** unit test — hash(120 s default) ≠ hash(60 s override); browser —
  after a 60 s baseline, `/stats` score-over-time and Home last-7 contain no
  baseline point; the baseline session still appears in its own results page.

### 0.3 Restore streak on import (F3)
- `importBundle`: write `bundle.streak` to `aleph-streak` and
  `useStreakStore.setState(...)`. Merge mode: keep whichever streak has the
  later `lastDate` (ties: higher `current`). Replace mode: take the bundle's.
- **Accept:** extend the persistence round-trip unit test — export with a
  non-zero streak → erase → import(replace) → streak restored in localStorage
  and store; merge keeps the newer streak.

### 0.4 SRS review exit + affordance sweep (F4, F7)
- `SrsReviewPage`: Esc (and a small ✕/quit control) exits to Home — per-card
  progress is already persisted, so no confirm needed; add the standard hint
  line ("Esc to leave · progress saves per card").
- Sweep the five fullscreen surfaces (sprint, daily, drill, sim, srs) so each
  shows a truthful Esc hint.
- **Accept:** browser — mid-review Esc returns Home; due count reflects the
  cards already graded.

### 0.5 Cut list ([03-cut-list](03-cut-list.md))
- Remove `countdownSkip` (type, defaults, partialize, export shape),
  `ComingSoonPage.tsx`, `APP_TAGLINE` (or use it in Phase 1's About page).
- Hide the Sound settings row; keep `leftHandedKeypad` out of the UI until 2.3.
- **Accept:** `npm run check` green; grep shows no references.

### 0.6 Home daily state (F5)
- Home daily card shows "▶ Play today's 120s" or "✓ Done today · <score>"
  (read `dailyRepo.get(todayKey())`).
- **Accept:** browser — state flips after completing a daily; replay day shows ✓.

---

## Phase 1 — Ship layer (M6 core; the launch blockers)

### 1.1 Deploy target + SPA routing
- Vercel (or Netlify — pick one, don't build both): build `npm run build`,
  output `dist/`, SPA fallback rewrite `/* → /index.html`, immutable cache on
  hashed assets, `no-cache` on `index.html` (doc 08 §7). Config file in-repo
  (`vercel.json` / `netlify.toml`).
- **Accept:** live URL; deep link `https://<url>/learn/t5-cross-multiplication`
  loads on hard refresh; assets served with the right cache headers.

### 1.2 PWA / offline
- `vite-plugin-pwa` (this is a sanctioned doc-08 dependency): precache app
  shell + chunks + fonts, `registerType: 'autoUpdate'`, manifest (name from
  `APP_NAME`, theme `#0B0E14`, icons — generate a simple ℵ/◆ mark, 192/512 px,
  maskable).
- **Accept:** `npm run build && npm run preview` → DevTools offline → reload
  works; a full sprint → results works offline; Lighthouse PWA installable.

### 1.3 Self-hosted fonts
- Add `@fontsource/jetbrains-mono` (400/600) + `@fontsource/inter`
  (400/500/600) — imports in `src/index.css`, keep system fallbacks, ensure the
  woff2 files are precached by 1.2. No CDN requests (doc 08 §7).
- **Accept:** network panel shows zero external font requests; play-screen
  numerals render in JetBrains Mono; bundle budget still met (fonts are assets,
  not JS).

### 1.4 About page + license
- `/about` route + footer/Settings link: what Aleph is, "all benchmarks are
  community-reported estimates, not official firm data", the privacy statement
  (no accounts/servers/analytics; data stays in this browser; export = backup),
  Zetamac inspiration credit, version + `ENGINE_VERSION`. Trim the Settings
  About card to link here. Add `LICENSE` (MIT unless the user says otherwise —
  **ask before choosing**).
- **Accept:** page reachable from Settings and 404/NotFound footer; license file
  present.

### 1.5 Playwright flow 3 (export → wipe → import)
- e2e: play a short sprint → Settings → export JSON (capture the download) →
  erase-all (type DELETE) → import the file (replace) → history intact (results
  reachable, Home last-7 non-empty).
- **Accept:** flow 3 green locally and in CI.

### 1.6 CI deploy step
- Extend `.github/workflows/ci.yml`: on `main` push, after all gates, deploy
  (host CLI or the host's Git integration — if the latter, document it in the
  workflow as a comment instead of a step).
- **Accept:** merge to main produces a fresh deployment with no manual step.

---

## Phase 2 — Quality pass (finishes M6's DoD)

### 2.1 Keyboard map + `?` overlay (F6)
- Implement doc 07 §5 exactly: global `g`-then-`h/s/l` chords (ignore while any
  input is focused), `?` opens a shortcut overlay (plain themed modal, Esc
  closes); Home: `d` → daily, `1–9` preset select; Results: `↑↓` traverse
  review rows + `Enter` on a row → that row's drill. No modifier-key clashes.
- **Accept:** browser walkthrough of every binding; overlay lists exactly what
  works; typing in the play input never triggers navigation.

### 2.2 a11y + Lighthouse ≥ 95 / ≥ 95 (Home & Play)
- Run Lighthouse (mobile + desktop) on Home and Play against the production
  build; fix what it flags: contrast (`--text-dim` on `--bg` is the likely
  offender), focus order, aria labels/names, heatmap cell target size/labels,
  reduced-motion. Re-run until ≥95/≥95 on both pages; record scores in the M6
  summary.
- **Accept:** screenshots/JSON of the scores; no regressions in `npm run e2e`.

### 2.3 Mobile keypad + responsive audit
- Play surfaces on <640 px viewports: custom on-screen keypad (4×3: digits, `.`,
  `-`, backspace; `/` appears for fraction/multi formats; ≥48 px targets;
  `inputmode="none"` so the native keyboard never opens; optional left-hand
  mirror — this is when the `leftHandedKeypad` setting returns to the UI).
  Prompt scales to 2.5 rem. Audit Home/dashboard/lobbies at 375 px.
- **Accept:** browser at 375×812 — play a full sprint via the on-screen keypad
  with no layout shift and no native keyboard; dashboard scrolls sanely.

### 2.4 Small results polish (from findings, cheap)
- PB moment per spec: hero count-up + band-gauge fill, one 400 ms moment,
  disabled under reduced-motion. Add the band gauge to the results hero for
  banded configs (component exists — `BandGauge`).
- **Accept:** visual check; reduced-motion shows the static state.

---

## Phase 3 — P1 spec debt (post-launch is acceptable)

| Task | Notes | Accept |
|---|---|---|
| 3.1 Custom test builder UI | A form on `/sims` (count 10–120, minutes 1–30, +a/−b, skip toggle, profile/weight-map editor) that drives the existing URL-override seam; persist last-used config | Build a custom sim, play it, net scored correctly; config recalled next visit |
| 3.2 Extended sprint toggles | Preset editor exposes decimals/fractions/%/missing/squares; sessions flag `extended: true`; results show "not Zetamac-comparable"; no bands | Extended sprint runs mixed content; default preset untouched |
| 3.3 Heatmap Squares & Fractions tabs | Grids over `sq:`/`frac:` FactStats; cell click → pinned drill (0.1 machinery) | Tabs render; clicks drill the right fact |
| 3.4 30-day mastery window (F8) | Filter sessions to last 30 days when building skill rows/chips | Unit test with old+new synthetic sessions shows windowed values |

## Phase 4 — P2, only if explicitly requested

Sounds (then unhide the toggle) · training plan (doc 03 §10) · sequences sim
(`SEQ_*` generators + uniqueness solver tests + profile) · session-history list
page. None block anything; do not start them unprompted.

---

## Suggested review cadence

Phase 0 → review · Phase 1 → review (this is the "we are live" checkpoint) ·
Phase 2 → review (this is the "M6 DoD met" checkpoint) · Phase 3 tasks
individually as wanted.
