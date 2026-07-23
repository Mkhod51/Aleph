# Product Audit — What Exists vs. What the Spec Promises

_Feature-by-feature audit against `Docs/03-functional-spec.md` and
`Docs/09-roadmap.md`. ✅ = shipped & verified · 🟡 = shipped with a documented
deviation · ⛔ = not built._

## Core loop

| Feature | Status | Notes |
|---|---|---|
| Sprint mode, Zetamac parity (ranges, flow input, 120s) | ✅ | Parity verified at engine + behavior level; determinism tested |
| Presets (immutable default + custom CRUD) | 🟡 | Works; **extended-content toggles (decimals/fractions/%/missing/squares) are spec'd (03 §2) but not exposed** — `extended` is hard-coded `false` in the editor |
| Countdown / pause / tab-hidden / abandoned handling | ✅ | Abandoned stored + excluded from PBs/averages |
| Results screen (hero, band, vitals, sortable review, coach links) | 🟡 | Complete; PB moment is a static chip (spec: one 400 ms tick-up + gauge fill); no band gauge on hero |
| Personal bests per (mode, config) | ✅ | |

## Sims

| Feature | Status | Notes |
|---|---|---|
| Optiver/Flow/Akuna sims (net, no-skip, no-pause, no-feedback) | ✅ | Hand-computed net verified in e2e |
| Sim lobbies (rules, community-reported bars, last 3) | ✅ | |
| **Custom test builder** | ⛔ | **P1 in spec (03 §3, M3 scope), not built.** The engine seam exists (`/sims/:id/play?count&seconds&seed&profile`) — only the UI is missing |
| Sequences test | ⛔ | P2; `SEQ_*` generators not implemented |

## Drills & Learn

| Feature | Status | Notes |
|---|---|---|
| Drill catalog with live per-tag stats | ✅ | Doubles as weakness display as spec'd |
| Flow/test input, tiers 1–3, adaptive rating | ✅ | Adaptive trajectory unit-tested |
| Technique library T1–T15 + R1–R5 + S1–S5 (doc 06 verbatim) | ✅ | |
| "Drill this" on all 15 techniques | 🟡 | All launch valid drills; 5 constrained variants (T2/T6/T8/T9 pair-shape constraints) approximate to base tag+tier with an honest on-page note |
| Results "Learn the trick"/"Drill 10 like this" | ✅ | |
| "Turn into flashcards" on reference pages | 🟡 | Button present but disabled; decks exist via SRS built-ins instead |

## Analytics

| Feature | Status | Notes |
|---|---|---|
| Dashboard cards 1–8 | ✅ | All 8 present incl. sim readiness + fatigue |
| Aggregate-only reads (100k attempts < 400 ms) | ✅ | Measured ~20 ms |
| Times-table heatmap w/ weak outlines | 🟡 | Renders correctly; **cell click does NOT drill the clicked fact** (see findings F1); Squares/Fractions tabs absent |
| Mastery chips | 🟡 | Spec says last-30-days window; implementation is all-time |
| Band labels "community-reported" everywhere | ✅ | |

## Habit layer

| Feature | Status | Notes |
|---|---|---|
| Daily challenge (date-seeded, once-official) | ✅ | Cross-machine determinism unit-tested |
| Streaks + freezes | 🟡 | Correct in logic + tests; **lost on export→import** (findings F3) |
| SRS decks, Leitner review, due badges, weak-fact auto-enroll | 🟡 | Works; review screen has **no exit** mid-session (findings F4) |
| Fix My Gaps (70/30, ≥100-attempt gate) | ✅ | Composition unit-tested |
| Onboarding (once, 60s baseline, skippable) | 🟡 | Works; **baseline pollutes sprint stats** (findings F2) |

## Ship layer (M6) — all outstanding

| Item | Status |
|---|---|
| Deploy target + SPA rewrites + CI deploy | ⛔ |
| PWA / offline (vite-plugin-pwa) | ⛔ |
| About page + chosen license | ⛔ (disclaimer text lives only in a Settings card) |
| Self-hosted fonts (JetBrains Mono / Inter) | ⛔ (system fallbacks in use) |
| Keyboard map + `?` overlay (doc 07 §5) | ⛔ (~20% done: results Enter/N/D only; no `g h`/`g s`/`g l`, no Home `d`/`1–9`, no `↑↓` row traversal, no overlay) |
| Mobile on-screen keypad (`inputmode="none"`) | ⛔ (native keyboard used) |
| a11y + Lighthouse ≥95 evidence | ⛔ (foundations good; never measured) |
| Playwright flow 3 (export→wipe→import) | ⛔ (covered by unit test only) |
| Sounds (setting exists) | ⛔ |
| Training plan | ⛔ (P2, cuttable) |

## Engine debt (deliberate, low priority)

Unregistered generators: `MUL_1x1`, `SUB_DEC`, `DIV_DEC`, `FRAC_MUL`, `SEQ_*`.
None are reachable from any current profile or drill; they block only the
sequences sim and two P2 drill variants.
