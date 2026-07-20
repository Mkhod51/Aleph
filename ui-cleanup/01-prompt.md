# Cleanup Prompt — paste into a fresh session (single agent, no subagents)

```
You are doing a small, surgical UI cleanup on **Aleph** (dark, keyboard-first
quant math trainer). Repo at the current working directory; remote
github.com/Mkhod51/Aleph, main. The "Precision Instrument" redesign is done and
committed (HEAD ~b870b37). This pass has three goals only — do it as ONE agent,
no subagents (it's a cross-cutting consistency pass).

Read `ui-cleanup/00-plan.md` first; it has the verified file locations. Then:

1. EMOJIS → crafted marks. Create src/ui/kit/icons.tsx (hand-rolled inline SVG,
   currentColor, ~14px, NO icon library). Replace ▶🔥⚡✓✗ across the pages/ui
   files listed in the plan with PlayIcon/FlameIcon/BoltIcon/CheckIcon/CrossIcon
   (good/bad colors on the checks). Change the brand mark ◆ → ℵ in
   src/lib/brand.ts. In src/engine/generators/frac.ts ONLY, change the
   FRAC_COMPARE prompt's ①/② to (1)/(2) — prompt string only, no logic change;
   touch nothing else under src/engine/. Keep the □ missing-operand box as-is.
   Keep every existing aria-label (✓/✗ stay labeled correct/wrong).

2. EM DASHES. Replace the ~48 em dashes in src/pages/** and src/ui/** microcopy
   with the app's `·` separator or clean re-punctuation (comma/colon/period).
   Keep the literal words "START SPRINT". Do NOT touch src/content/** (verbatim
   Learn text), src/engine/**, tests, the `·` separators, the `−` minus, or arrows.

3. COOLER MOTION (small, reduced-motion-guarded, play screen untouched):
   - route existing hover/press/lift/arrow transitions through --ease-spring;
   - one-shot spring "flare" on FlameIcon/BoltIcon only when streak/due INCREASES
     (change-detected, never looping);
   - retune the Results reveal / View-Transition to --ease-spring/--dur-base.

## Rules
- src/engine/ diff = only the frac.ts prompt string. Zetamac parity +
  ENGINE_VERSION untouched. No data-model changes. No new dependencies.
- Play loop stays sacred: no new motion on prompt/input/clock/score/advance.
- Verify by using it: dev server (.claude/launch.json "dev"), check Home,
  results, a lobby, top bar — in BOTH dark and light. Screenshot before/after.
- Gates before finishing: `npm run check` AND `npm run e2e` green (e2e locates
  the START button by /START SPRINT/ and buttons by role+name — keep those).
- Node 25 partial localStorage: keep vitest.setup.ts. In-app browser Enter
  doesn't reach React — dispatch a keydown manually if verifying by hand.
- Commit in a few logical chunks (icons, em-dash copy, motion) with clear
  messages. Do NOT push — I push myself. Stop with a summary + screenshots.

Start now.
```
