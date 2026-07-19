# PM Review — Executive Summary

_Product-manager review of Aleph after M5 (2026-07-18). Companion files:
[01-product-audit](01-product-audit.md) · [02-findings](02-findings-usability-design.md) ·
[03-cut-list](03-cut-list.md) · [04-roadmap](04-roadmap-to-ship.md) ·
[05-continuation-prompt](05-continuation-prompt.md)._

## Verdict

The product is **feature-complete against its core promise** (M0–M5 of the spec)
and structurally sound: the engine is pure and heavily tested (119 unit tests,
2 e2e flows), the play loop is fast, the data layer is aggregate-first, and the
whole thing runs backend-free. A motivated user could adopt it for interview
prep **today**.

It is **not ready for a public launch**. Three kinds of gaps stand in the way,
in order of importance:

1. **Four correctness/trust bugs** that undermine the product's own promises
   (found and verified in code during this review — see
   [02-findings](02-findings-usability-design.md) F1–F4). The worst: clicking a
   weak cell on the times-table heatmap — the app's headline differentiator —
   launches a *generic* drill, not a drill of that fact. The feature is
   currently cosmetic.
2. **The M6 ship layer doesn't exist yet**: no deploy config, no PWA/offline,
   no About/license, no self-hosted fonts, no Lighthouse evidence.
3. **A dishonesty tax of dead UI**: three settings toggles that do nothing, and
   stat-polluting edge cases. Small, but this product's brand is *honest copy*.

## What genuinely matters (and what doesn't)

This is a keyboard-first speed tool for a niche, motivated audience. The things
that move the needle are **trust in the numbers** (fix the stat-pollution and
heatmap bugs), **frictionlessness** (finish the spec'd keyboard map; give every
fullscreen surface an exit), and **availability** (deploy + offline). Things
that do *not* move the needle right now: visual redesign (the terminal
aesthetic is coherent and on-spec), more question types, sounds, the training
plan, gamification beyond the existing streak. The recommendations deliberately
exclude anything cosmetic.

## Priorities in one line each

- **P0 — Fix the four trust bugs** (fact-drill, baseline stat pollution, streak
  lost on import, SRS review has no exit). ~1 focused session.
- **P1 — Ship layer**: deploy w/ SPA rewrites, PWA, About+license, fonts,
  Lighthouse ≥95 evidence, export/import e2e. This is M6 as spec'd.
- **P2 — Keyboard completeness + mobile keypad**: the spec'd key map is ~20%
  implemented; this is the power-user product surface.
- **P3 — Round out P1 spec debt post-launch**: custom test builder UI, extended
  sprint toggles, heatmap Squares/Fractions tabs, 30-day mastery window.
- **Cut/hide now**: dead toggles, dead code ([03-cut-list](03-cut-list.md)).

The full sequenced, agent-executable plan with acceptance criteria is in
[04-roadmap-to-ship](04-roadmap-to-ship.md). A ready-to-paste prompt for a fresh
agent session is in [05-continuation-prompt](05-continuation-prompt.md).
