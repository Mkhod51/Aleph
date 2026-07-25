# Aleph — Design Proposal

**A mental-arithmetic trainer for quant trading interview prep.** Zetamac-style timed drills at the core, wrapped in the things Zetamac lacks: firm-accurate test simulators, deep progress analytics, a technique library wired directly into targeted drills, and spaced repetition for the facts you must know cold.

> "Aleph" is a working title. Rename freely — it appears only in copy and config, never in code identifiers.

---

## Document map

Read in order. Later docs assume earlier ones.

| # | File | What it covers |
|---|------|----------------|
| 00 | `00-README.md` | This file — index, build order, glossary, decision log |
| 01 | `01-research.md` | What quant firms actually test: formats, scoring, benchmarks, skills inventory |
| 02 | `02-product-vision.md` | Problem, users, competitive landscape, differentiators, product principles |
| 03 | `03-functional-spec.md` | Every feature specified with behavior and acceptance criteria |
| 04 | `04-question-engine.md` | Question taxonomy, generators, seeding, validation, scoring, difficulty model |
| 05 | `05-progress-and-analytics.md` | Data model, metrics formulas, dashboard charts, SRS, benchmarks, export |
| 06 | `06-tips-content.md` | The Learn section: full technique content, memorization tables, test strategy |
| 07 | `07-ui-ux.md` | Design system, screen wireframes, keyboard map, accessibility, responsive rules |
| 08 | `08-architecture.md` | Stack, module structure, storage, timing, testing, performance, deployment |
| 09 | `09-roadmap.md` | Milestones M0–M6 with definition-of-done checklists |
| 10 | `10-naming-and-context.md` | What "Aleph" means and why, plus a few small decisions left open elsewhere |
| — | `AGENT-PROMPT.md` | The prompt to hand to a coding agent |

The numbered docs above are the spec. Work done against it is written up in
sibling folders:

| Folder | What it covers |
|--------|----------------|
| `ui-redesign/` | The "Precision Instrument" design system, component kit and screen treatments |
| `ui-review/` | UI audit findings, plus the motion and consistency specs |
| `ui-cleanup/` | The de-slop pass: crafted icons, em-dash purge, springier motion |
| `pm-review/` | Product audit, cut list and roadmap-to-ship |

## How to use these docs with an AI coding agent

1. Create an empty repo (e.g. `quantsprint/`) and copy this `DesignProposal/` folder into it as `docs/`.
2. Paste the contents of `AGENT-PROMPT.md` as the agent's instructions.
3. Have the agent build milestone by milestone per `09-roadmap.md`. Each milestone has a definition-of-done checklist; don't let the agent move on until it's green.
4. Review the running app after each milestone (M1 is the first usable build — a full Zetamac-parity sprint mode).

## Priority language

- **P0** — core; the product is broken without it (M0–M2).
- **P1** — the differentiators; the reason this exists over Zetamac (M3–M5).
- **P2** — polish and nice-to-haves; cut first under time pressure (M5–M6).

## Glossary

| Term | Meaning |
|------|---------|
| **Sprint** | Zetamac-style timed run: fixed clock, answer as many as possible, auto-advance input |
| **Sim** | Firm-accurate test simulator: fixed question count, Enter-to-submit, negative marking, no mid-test feedback |
| **Drill** | Targeted practice on one skill tag (e.g. 2×2 multiplication), configurable length |
| **Skill tag** | Canonical question-type identifier (e.g. `MUL_2x2`, `FRAC_TO_DEC`) — see doc 04 |
| **Flow input** | Auto-advance on correct answer, no wrong state (Zetamac behavior) |
| **Test input** | Type answer + Enter, graded right/wrong, no retry (real-test behavior) |
| **Fact** | An atomic memorization item (e.g. `13×17`, `7/16 = 0.4375`, `23² = 529`) |
| **SRS** | Spaced-repetition system (Leitner boxes) for facts — see doc 05 |
| **Band** | Named score range mapping a result to interview readiness — see docs 01/05 |
| **Seed** | PRNG seed making a question sequence reproducible (daily challenge, replays) |

## Decision log

Defaults an implementing agent should follow when the docs are silent:

1. **Local-first, no backend, no accounts** in v1. All data in the browser (IndexedDB + localStorage) with JSON export/import. Architecture leaves a seam for a future sync backend (doc 08).
2. **Zetamac score comparability is sacred.** Sprint mode's default settings, input behavior, and timing replicate Zetamac exactly (doc 03 §2) so the user's scores map onto community benchmarks.
3. **Desktop keyboard is the primary input.** Mobile is supported with an on-screen keypad but is secondary.
4. **Dark theme is default.** Light theme supported (doc 07).
5. **During play, minimalism wins.** Any feature that adds visual noise to the play screen is wrong by default; put it on the results screen instead.
6. **Benchmarks are community-sourced estimates**, not official firm data. All UI copy referencing pass bars must say "community-reported" or similar.
7. When a spec detail is genuinely missing: pick the simplest behavior consistent with the product principles in doc 02, note it in code review notes, and move on.
