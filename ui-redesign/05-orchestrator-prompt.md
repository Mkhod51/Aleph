# Orchestrator Prompt — paste into a fresh Opus 4.8 session

_Copy the block below into a new agentic chat at the repo root. It executes the
"Precision Instrument" redesign in `ui-redesign/`, spawning three Opus 4.8
subagents for the parallel stage._

---

```
You are the ORCHESTRATOR for a UI redesign of **Aleph**, a mental-arithmetic
trainer for quant-trading interview prep (dark, keyboard-first, data-dense).
Repo at the current working directory; remote github.com/Mkhod51/Aleph, main.
Milestones M0–M5, a trust-fix phase, and a conservative UI polish pass are all
built and committed (HEAD ~159604e). The user finds it "slightly bland" and
wants a smoother, more unique experience — WITHOUT losing the terminal ethos or
touching the play loop's speed.

## Your task
Execute the redesign specified in `ui-redesign/` (read ALL of it before coding):
- 00-style-analysis.md — direction: "Precision Instrument" (Linear-grade dark
  precision + Slash gilded amber + a Hyperstudio graph-paper signature)
- 01-design-system.md — exact tokens (color/depth tiers, texture, motion, type)
- 02-component-kit.md — the in-house kit to build/upgrade (NO UI library)
- 03-screen-treatments.md — per-screen application + the full motion inventory
- 04-execution-plan.md — the staged plan + subagent file-ownership (FOLLOW IT)

## Execution (per 04-execution-plan.md)
1. STAGE A (you, sequential): overhaul tokens + Tailwind theme; add
   .panel/.panel-hover/.gridfield/.readout + focus-glow/scrollbar globals;
   build the component kit (upgrade Card/Button/Eyebrow/NavCard/BandGauge; new
   HeroReadout/StatTile/Chip/SegmentedControl/Toggle/Modal/EmptyState in
   src/ui/kit/); convert Settings as the reference screen; verify dark+light;
   commit "redesign-A: tokens + component kit + reference screen".
2. STAGE B (parallel): spawn EXACTLY THREE subagents via the Agent tool,
   subagent_type "general-purpose", model "opus":
   - B1 "Play & Results", B2 "Dashboard & data-viz", B3 "Shell & content".
   Give each a SELF-CONTAINED prompt containing: the repo path; "read
   ui-redesign/01+02+03 and src/ui/kit/* + src/ui/Button.tsx first"; its EXACT
   ownership list from 04-execution-plan.md §B; the never-write list (tokens.css,
   index.css, tailwind.config.ts, src/ui/kit/*, Button.tsx, package.json,
   src/engine/**, src/store/** — report needed changes, don't make them);
   the guardrails below; and "run `npx tsc -b --noEmit` and eslint on your files
   before reporting; DO NOT commit, push, run a dev server, add dependencies, or
   edit files outside your list; report a summary + any ambiguities." If a
   subagent drifts off-spec or stalls, take over its cluster yourself.
3. STAGE C (you): review the three diffs against the specs (conventions beat
   creativity; revert drift); run gates; browser-verify in BOTH themes;
   screenshot Home/Results/Dashboard/a lobby/Settings; commit B1/B2/B3 (or a
   squashed "redesign: precision-instrument UI"); summarize for the user.

## Hard guardrails (all stages)
- Docs/07-ui-ux.md is EVOLVED, not discarded. The play screen is SACRED: question
  advance is a hard cut; prompt/input/clock/score never animate; no texture
  behind live questions. No glassmorphism, no neon on content, color = state.
- NO new runtime dependency beyond @fontsource/* (already installed). NO
  framer-motion / shadcn / Radix / any UI or animation library — all motion is
  CSS transitions/keyframes + the browser View Transitions API + the one
  existing rAF count-up. If tempted otherwise, don't; escalate to the user only
  if truly blocked.
- Everything collapses under prefers-reduced-motion (global CSS override exists;
  JS/rAF/View-Transition paths must check matchMedia themselves) and never loops.
- src/engine/ must have a ZERO diff (`git diff --stat src/engine/` empty).
  Zetamac parity + data model untouched. No play-loop DB writes.
- Perf budgets hold: keystroke→paint <30 ms, advance <50 ms, main JS ≤250 KB gz
  (redesign JS delta ≤ +3 KB gz; fonts are assets). Feel-check a real sprint.
- Gates before your final summary: `npm run check` AND `npm run e2e` green.
- Verify by using it: dev server via .claude/launch.json "dev"; walk the flows
  in dark AND light; include what you observed + screenshots.
- Commit at each stage boundary with clear messages. DO NOT push — the user
  pushes. Stop after Stage C with a summary; do NOT start deployment
  (pm-review/04 Phase 1) — that's a separate session.

## Known gotchas
- Playwright fixtures seed onboarded:true; e2e runs against the prod build on
  :4173 and selects buttons by role+name — the Button primitive must stay a real
  <button> with unchanged accessible names, and SegmentedControl must keep
  role="radiogroup"/"radio".
- Node 25's partial localStorage: vitest.setup.ts installs a full in-memory
  Storage — keep it.
- The in-app browser's synthetic Enter doesn't reach React onKeyDown; drive it
  via el.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}))
  for manual checks (Playwright press('Enter') is fine).
- A dev server may already run on :5173 — reuse it; don't spawn a second.
- The repo path contains a space ("Internship apps") — quote paths in shell.

Start with Stage A now.
```
