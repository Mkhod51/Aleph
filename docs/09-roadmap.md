# 09 — Roadmap & Milestones

Seven milestones, each shippable and verified before the next begins. "DoD" = definition of done. An agent should complete milestones **in order** and stop for review after each.

---

## M0 — Foundation (scaffold, tokens, engine core)

Scope: Vite+React+TS+Tailwind scaffold; design tokens & themes; routing shell + top bar; `lib/` (prng, ulid, timing, hash); engine core — types, PRNG, `zetamac` profile's four generators (`ADD_2D`, `SUB_2D`, `MUL_1x2`, `DIV_EXACT`), validator, `count` scoring; Dexie schema v1; settings store with theme switch; CI (typecheck, lint, test, build).

**DoD:** `npm test` green incl. determinism + property tests for the four generators; app loads with themed empty Home; lint boundary rule active (engine imports nothing).

## M1 — Sprint mode end-to-end (the Zetamac replacement)

Scope: Home with autofocused Start; countdown; play screen (flow input, clock, score, hide-toggles); pause; results screen v1 (hero, vitals, review table sans technique links); session+attempt persistence; presets incl. immutable Zetamac Default + custom preset CRUD; personal bests; settings page v1; export/import.

**DoD:** Playwright flow 1 passes; side-by-side manual check against arithmetic.zetamac.com confirms identical ranges/behavior at default settings; clock accuracy ±50 ms over 120 s verified; abandoned sessions stored and excluded from PBs/averages.

## M2 — Analytics dashboard

Scope: `stats.ts` metrics + FactStat incremental aggregation; dashboard cards 1–5 & 8 (headline, score-over-time with band shading, skill breakdown, times-table heatmap, calendar, records); band constants + results-screen band labels; empty states.

**DoD:** metric unit tests green; dashboard renders < 400 ms with 100k synthetic attempts (seeded fixture script provided); heatmap cell click → drill stub route; band labels carry "community-reported".

## M3 — Firm sims

Scope: test input mode; sim engine rules (net scoring, no-skip, no-pause, no-feedback, tab-hidden policy); Optiver-style, Flow-style, Akuna-style presets + custom builder; `optiver`/`flow` profiles with their extended generators (decimals, fractions, percentages, missing-operand, squares — all remaining non-sequence tags); sim lobbies; results with net-score bands; sim history & readiness card.

**DoD:** all new generators pass property tests; fixture sim (known seed, scripted answers) produces hand-computed net score in Playwright flow 2; no-skip enforced; Esc-quit marks abandoned.

## M4 — Learn & drills (the closed loop)

Scope: content modules for all T1–T15, R1–R5, S1–S5 (doc 06 verbatim); Learn index + technique/reference/strategy pages; mastery chips; skill-drill catalog with live stats; drill config incl. tiers + adaptive; constrained generator variants for the mapping table; results-review "Learn the trick" / "Drill 10 like this" links; technique→drill and miss→technique wiring.

**DoD:** every T-page's Drill button launches its mapped spec (spot-check all 15); every wrong review row with a mapped tag links to the right technique; adaptive rating behaves per doc 04 §7 scripted test.

## M5 — Habit layer

Scope: daily challenge (date-seeded, once-official, replay-unofficial) + streaks/freezes + daily history chart; SRS decks (built-ins + weak-fact auto-enrollment) + review session + due badges; weakness engine (detection job, Fix-My-Gaps composer, heatmap weak outlines); onboarding baseline flow; fatigue card.

**DoD:** same-date determinism verified across two browsers; Leitner transitions + midnight/timezone unit tests green; Fix-My-Gaps composition test (70/30) green; onboarding shows exactly once.

## M6 — Polish & ship

Scope: PWA (offline core, install prompt); keyboard shortcut overlay (`?`); mobile keypad + responsive audit; a11y pass (focus order, aria-live, contrast, reduced-motion); performance pass vs budgets; sounds (off by default); training plan (P2, if time); sequences sim (P2, if time); About page (disclaimers, privacy, Zetamac credit); deploy.

**DoD:** Lighthouse ≥ 95 perf / ≥ 95 a11y on Home & Play; bundle budget met; offline reload works; Playwright flow 3 (export/import) green; deployed URL live.

---

## Suggested sequencing note

M1 is the moment the app becomes daily-usable — start real practice on it immediately; your own sessions become M2's test data. P2 items (training plan, sequences, sounds) are explicitly cuttable without harming the core loop: **sprint → results → learn → drill → dashboard**.
