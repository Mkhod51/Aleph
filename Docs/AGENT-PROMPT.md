# Agent Prompt

Copy everything below the line into the coding agent's instructions, with the `docs/` folder (this DesignProposal) present in the repo root.

---

You are building **Aleph**, a mental-arithmetic training web app for quant trading interview prep — a Zetamac-style timed drill site with firm-accurate test simulators, per-fact weakness analytics, a technique library wired to targeted drills, and spaced-repetition flashcards.

## Ground rules

1. **The spec is law.** Complete specifications live in `docs/00-README.md` through `docs/09-roadmap.md`. Read `00`, `03`, `04`, and `09` fully before writing any code; consult the others as their subject comes up. Do not substitute your own product ideas where the docs have decided; where the docs are silent, follow the decision log in `docs/00-README.md` §Decision log.
2. **Build strictly by milestone** per `docs/09-roadmap.md` (M0 → M6). After each milestone: run the full check suite (typecheck, lint, tests, build), then **stop and summarize** what was built, how you verified it, and any spec deviations — and wait for my review before starting the next milestone.
3. **Verify by using it.** After each UI milestone, run the dev server and actually play through the affected flows (start a sprint, answer questions correctly and incorrectly, finish, check the results and dashboard). Screenshots or a short written walkthrough of what you observed beat assertions that it "should work."
4. **The engine is sacred ground.** `src/engine/` is pure TypeScript with no React/DOM imports, and every behavior specified in `docs/04-question-engine.md` §10 has tests. Determinism (same seed ⇒ same questions) must never break silently — bump `engineVersion` when generator output changes.
5. **Zetamac parity is a hard requirement** (`docs/03-functional-spec.md` §2): default sprint settings, operand ranges, auto-advance input behavior, and 120 s scoring must match arithmetic.zetamac.com exactly, so scores are comparable to community benchmarks.
6. **Performance is a feature:** keystroke-to-paint < 30 ms, question advance < 50 ms with zero layout shift, no DB writes during the play loop (buffer, flush at session end). Budgets in `docs/08-architecture.md` §5.
7. **Stack is fixed** (`docs/08-architecture.md` §1): Vite, React 18, TypeScript strict, Tailwind, Zustand, Dexie, react-router, Recharts (lazy), Vitest, Playwright. Add no other runtime dependency without asking. No backend, no accounts, no analytics — all data local (IndexedDB/localStorage) with JSON export/import.
8. **Content ships from the docs:** the Learn section's techniques, tables, and strategy articles come from `docs/06-tips-content.md` essentially verbatim (typed content modules) — do not write placeholder or regenerated math content; the doc's examples have been checked by hand.
9. **Honest UI copy:** all pass bars and score bands are labeled "community-reported" — never present them as official firm data.
10. **Design tokens and interaction rules** are in `docs/07-ui-ux.md`: dark theme default, amber accent, JetBrains Mono numerals, minimal play screen, full keyboard map, mobile on-screen keypad, reduced-motion support. No component libraries; no decorative animation.

## Definition of done (overall)

All milestone DoD checklists in `docs/09-roadmap.md` pass; CI green (typecheck, lint, Vitest, Playwright smoke flows, build, bundle budget); Lighthouse ≥ 95 performance and accessibility on Home and Play; the app works offline as a PWA; deployed as a static site.

Start with M0 now.
