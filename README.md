# Aleph

A mental-arithmetic trainer for quant trading interview prep — Zetamac-style timed
drills at the core, wrapped in firm-accurate test simulators, deep progress
analytics, a technique library wired into targeted drills, and spaced repetition.

Local-first: no backend, no accounts, no analytics. All data lives in your browser
(IndexedDB + localStorage) with JSON export/import.

## Stack

Vite · React 18 · TypeScript (strict) · Tailwind · Zustand · Dexie · react-router ·
Vitest. The question engine (`src/engine/`) is pure TypeScript with no React/DOM
dependencies and is exhaustively unit-tested — determinism (same seed ⇒ same
questions) is a hard guarantee.

## Develop

```bash
npm install
npm run dev        # start the dev server
npm test           # run the Vitest suite
npm run typecheck  # tsc --noEmit
npm run lint       # eslint (incl. engine-purity boundary rule)
npm run build      # production build
npm run check      # typecheck + lint + test + build
```

## Documentation

Full specifications live in [`Docs/`](./Docs) (00–10). Build order and
definition-of-done checklists are in [`Docs/09-roadmap.md`](./Docs/09-roadmap.md).

## Status

**Milestone M0 — Foundation** complete: scaffold, design tokens/themes, `lib/`
utilities, the zetamac question engine (four generators + validator + scoring)
with its test suite, Dexie schema v1, settings store with theme switch, routing
shell, and CI.
