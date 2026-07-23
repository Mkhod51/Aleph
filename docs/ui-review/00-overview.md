# UI Polish Pass — Overview

_A bounded UI-quality phase to run **after Phase 0 (trust fixes, done at
`570979d`) and before Phase 1 (deployment)** of `pm-review/04-roadmap-to-ship.md`.
Files: [01-findings](01-findings.md) · [02-motion-spec](02-motion-spec.md) ·
[03-consistency-spec](03-consistency-spec.md) · [04-execution-plan](04-execution-plan.md) ·
[05-agent-prompt](05-agent-prompt.md)._

## Goal

Make the app feel **finished** — smooth, deliberate, consistent — without
violating its own design law. This is a polish pass, not a redesign: the
dark-terminal aesthetic, layout, and information architecture stay exactly as
they are.

## The design law still applies

`Docs/07-ui-ux.md` is explicit and it is *good*:

1. **Instant beats animated.** Question transitions are hard cuts; nothing on
   the play screen animates, ever.
2. **Animation only where it carries meaning** — the spec names the results
   band-reveal and the PB moment. Always ≤ 200 ms (PB moment: one 400 ms),
   disabled under `prefers-reduced-motion`.
3. **Color = state, never decoration.** No gradients, glows, glassmorphism.
4. No component libraries, **no animation libraries** (framer-motion etc. are
   banned — the stack is fixed; everything here is CSS transitions/keyframes +
   one rAF count-up).

So "more animations" here means: implement the **handful of spec'd moments that
were never built**, and make every interactive state change (hover, press,
overlay, toggle) resolve through one consistent timing system instead of the
current mix of instant/ad-hoc. That's it. The plan explicitly lists what must
**not** be animated ([02-motion-spec §Do-not](02-motion-spec.md)).

## Scope (three workstreams)

| # | Workstream | Contents |
|---|---|---|
| A | **Foundation** | Motion/duration/easing tokens; `Button` primitive; self-hosted fonts (pulled forward from roadmap 1.3 — the single largest visual upgrade available) |
| B | **Meaningful motion** | Results reveal + PB moment (spec'd, missing); countdown ticks; overlay fades; standardized micro-transitions |
| C | **De-slop sweep** | Replace 45 ad-hoc buttons (9 padding variants) with the primitive; unify transition/disabled/hover conventions; container-width convention; top-bar 🔥/⚡ chips (spec'd in 07 §3); kill loading flashes |

## Out of scope — do not do

- Visual redesign, new colors, new layouts, new pages.
- Route/page transitions (spec: instant), skeleton systems, spinners.
- Any play-loop change (prompt, input, clock, score counter untouched).
- Any engine (`src/engine/`) or data-layer change.
- New runtime dependencies except `@fontsource/*` (pre-approved in the roadmap).
- Sounds, mobile keypad, Lighthouse work (those are Phase 1/2 of the main
  roadmap).

## Success criteria

- `npm run check` + `npm run e2e` green; **zero diffs under `src/engine/`**.
- JS bundle delta ≈ 0 (fonts are static assets; allow ≤ +2 KB gz JS).
- Keystroke→paint and question-advance feel unchanged on the play screen
  (spot-check while playing).
- Every new motion collapses to instant under `prefers-reduced-motion`
  (the global override in `src/index.css` already enforces this for CSS; the
  one JS count-up must check `matchMedia`).
- Both themes verified (dark + light) on every touched surface; screenshots in
  the final summary.
- One `Button` primitive used everywhere a button renders; grep shows no
  stray `rounded-btn px-` ad-hoc combos left outside it.

## Execution model — recommendation

**One orchestrator + 2 parallel Opus subagents** (not 3–4, not 0):

- The foundation (tokens, `Button`, fonts) must be built **once, by one mind,
  first** — parallelizing it would manufacture the exact inconsistency this
  phase exists to remove.
- After the foundation lands, the remaining work splits into two genuinely
  disjoint file sets: **(1) play surfaces + results motion**, **(2) shell +
  content-page sweep**. Two subagents can run these in parallel with zero
  file overlap (ownership lists in [04-execution-plan](04-execution-plan.md)).
- A third/fourth agent has nothing disjoint to own — they'd share files and
  collide, or sit idle.
- Single-agent fallback is acceptable (≈30–40 % slower, zero coordination
  risk); the orchestrator prompt permits collapsing to it if either subagent
  goes off-spec.

The paste-ready orchestrator prompt is [05-agent-prompt.md](05-agent-prompt.md).
