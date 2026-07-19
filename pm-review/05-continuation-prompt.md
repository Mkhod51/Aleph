# Continuation Prompt — paste into a fresh agent session

_Copy everything inside the block below into a new agentic chat opened at the
repo root._

---

```
You are continuing work on **Aleph**, a mental-arithmetic trainer for quant
trading interview prep (Zetamac-style sprints + firm sim tests + analytics +
technique library + SRS). The repo is at the current working directory;
remote: github.com/Mkhod51/Aleph, branch main.

## State
Milestones M0–M5 of Docs/09-roadmap.md are built, verified, and committed:
engine (pure TS, deterministic, ~119 unit tests), sprint mode with Zetamac
parity, sims (Optiver/Flow/Akuna), dashboard, Learn library + drills with
adaptive difficulty, daily challenge + streaks, SRS flashcards, weakness
engine, onboarding. Two Playwright smoke flows pass. There is NO backend —
everything is IndexedDB (Dexie, db name "aleph") + three localStorage keys
(aleph-settings / aleph-presets / aleph-streak), with JSON export/import.
M6 (ship layer) has NOT started.

A product-manager review was completed and lives in `pm-review/`:
- 00-executive-summary.md — priorities and verdict
- 01-product-audit.md — feature-by-feature status vs spec
- 02-findings-usability-design.md — verified bugs/flaws F1–F9 (file:line cited)
- 03-cut-list.md — dead code/settings to remove or hide
- 04-roadmap-to-ship.md — THE PLAN: sequenced phases with acceptance criteria
Also `STATE-AND-DEPLOYMENT.md` (backend/storage analysis) at the repo root.

## Your task
Execute `pm-review/04-roadmap-to-ship.md` **in order**, starting with
Phase 0 (trust fixes). Complete one phase at a time; after each phase stop and
summarize what you built, how you verified it, and any deviations — then wait
for my review before the next phase. Do not start Phase 4 unprompted.

## Ground rules (unchanged from the original build)
1. The specs in `Docs/00`–`10` are law; where silent, follow the decision log
   in Docs/00-README.md. Read Docs/03, 04, 07, 08 sections relevant to each
   task before coding it.
2. `src/engine/` stays pure TypeScript — no React/DOM/store imports
   (lint-enforced). Zetamac parity is sacred: the default sprint's generator
   output must not change; bump ENGINE_VERSION only if it does (it must not).
3. Stack is fixed (Vite, React 18, TS strict, Tailwind, Zustand, Dexie,
   react-router, Recharts lazy, Vitest, Playwright). vite-plugin-pwa and
   @fontsource/* are pre-approved for Phase 1; add nothing else without asking.
4. All pass bars/bands stay labeled "community-reported". Honest UI only — no
   controls that do nothing.
5. Verify by using it: run the dev server (.claude/launch.json "dev"), play
   the affected flows in the browser, and include what you observed. Then run
   the full gates: `npm run check` and `npm run e2e` — all green before you
   stop.
6. **I commit and push myself — never run git commit or git push.**
7. Performance budgets hold: keystroke→paint <30 ms, main bundle ≤250 KB gz,
   no DB writes during play loops.

## Known gotchas (from the build sessions)
- Playwright fixtures must seed `onboarded: true` in aleph-settings or the
  Home onboarding gate blocks the flows.
- Node 25 ships a partial `localStorage` that shadows jsdom's in Vitest;
  `vitest.setup.ts` installs a full in-memory Storage — don't remove it.
- The in-app browser tool's synthetic Enter keypress doesn't reach React's
  onKeyDown; drive Enter via
  `el.dispatchEvent(new KeyboardEvent('keydown', {key:'Enter', bubbles:true}))`
  when verifying manually (Playwright's press('Enter') works fine).
- e2e runs against the production build via `vite preview` on port 4173.

Start now with Phase 0, task 0.1.
```
