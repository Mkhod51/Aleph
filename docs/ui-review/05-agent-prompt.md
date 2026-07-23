# Orchestrator Prompt — paste into a fresh agent session

_Copy the block below into a new agentic chat at the repo root. It runs the UI
polish pass (this folder) between Phase 0 and Phase 1 of the main roadmap,
using two Opus 4.8 subagents where parallelism is real._

---

```
You are continuing work on **Aleph**, a mental-arithmetic trainer for quant
trading interview prep. Repo at the current working directory; remote
github.com/Mkhod51/Aleph, branch main. Milestones M0–M5 plus "Phase 0 trust
fixes" are built, verified, and committed (HEAD ≈ 570979d). Deployment
(Phase 1 of pm-review/04-roadmap-to-ship.md) is intentionally NOT next —
first comes a bounded UI polish pass.

## Your task
Execute the UI polish pass specified in `ui-review/`:
- ui-review/00-overview.md   — goals, scope, success criteria
- ui-review/01-findings.md   — the verified problems being fixed
- ui-review/02-motion-spec.md — the EXACT motion table M1–M9 + do-not-animate list
- ui-review/03-consistency-spec.md — Button primitive C1, fonts C2, chips C3, conventions C4–C6
- ui-review/04-execution-plan.md — stages, subagent file ownership, gates
Read all five before writing any code. The specs are exhaustive: if a motion
or style is not in them, do not invent it.

## Execution model (follow ui-review/04 exactly)
1. **Stage A (you, sequentially):** motion/duration tokens → Button primitive
   (+ convert Settings as reference) → @fontsource fonts. Commit.
2. **Stage B (parallel):** spawn exactly TWO subagents via the Agent tool,
   subagent_type "general-purpose", model Opus 4.8 ("opus"):
   - Subagent 1 "Motion": implements M1–M6+M8 on the play/results surfaces it
     owns (ownership list in ui-review/04).
   - Subagent 2 "Sweep": Button sweep, top-bar 🔥/⚡ chips, conventions,
     loading-flash fixes on the shell/content pages it owns.
   Write each subagent a SELF-CONTAINED prompt: repo path; instruction to read
   ui-review/02 + 03 + src/ui/Button.tsx first; its exact file-ownership list;
   the never-write list (index.css, tokens.css, Button.tsx, tailwind.config,
   package.json, src/engine/**, src/store/** — report needed changes instead);
   no commits, no dev servers, no new dependencies; run `npx tsc -b --noEmit`
   and eslint on touched files before reporting a summary of changes + open
   questions. If a subagent goes off-spec or stalls, take over its scope
   yourself rather than spawning replacements.
3. **Stage C (you):** review both diffs against the specs (conventions win),
   integrate, run gates, browser-verify, commit, summarize.

## Hard rules
- Docs/07-ui-ux.md remains law: instant beats animated; play screen is
  untouchable (question advance = hard cut, no prompt/input/clock/score
  animation); nothing loops; all motion ≤200 ms except the single 400 ms
  results/PB moment; everything collapses under prefers-reduced-motion.
- No new runtime dependencies except @fontsource/* (pre-approved). NO
  framer-motion or any animation library — CSS + one rAF count-up only.
- src/engine/ must have a zero diff. Zetamac parity untouched.
- Bundle: JS delta ≤ +2 KB gz (fonts are static assets). Perf budgets hold:
  keystroke→paint <30 ms, question advance <50 ms, no layout shift.
- Gates before your final summary: `npm run check` AND `npm run e2e` green.
- Verify by using it: dev server via .claude/launch.json "dev"; walk results
  reveal, PB path, countdown, pause overlay, top-bar chips, Settings — in BOTH
  themes; screenshot the key moments; feel-check a real sprint for regressions.
- Commit at stage boundaries with clear messages (e.g. "UI-A: tokens, Button,
  fonts"). Do NOT push — I push myself.
- Stop after Stage C with a summary (what changed, how verified, screenshots,
  any spec deviations). Do NOT start Phase 1 (deployment) — that's a separate
  session.

## Known gotchas
- Playwright fixtures seed `onboarded: true` — keep it; e2e runs against the
  production build on port 4173.
- e2e locates buttons by role+name — the Button primitive must render a real
  <button> with unchanged accessible names.
- Node 25's partial localStorage: vitest.setup.ts installs a full in-memory
  Storage — don't remove it.
- The in-app browser's synthetic Enter doesn't reach React onKeyDown; use
  el.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}))
  for manual checks.
- A dev server may already be running on 5173 — reuse it; don't spawn a second.

Start with Stage A now.
```
