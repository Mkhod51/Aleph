# Motion Spec — exact, exhaustive

_Every animation this pass may add. If a motion is not in this table, it does
not get built. All CSS (transitions/keyframes) — **no animation libraries**.
The global `prefers-reduced-motion` override in `src/index.css` already
collapses all CSS motion to ~0 ms; it must be left intact, and the one JS
count-up must check `matchMedia('(prefers-reduced-motion: reduce)')` itself._

## Tokens (add to `src/styles/tokens.css`, used by everything below)

```css
--dur-fast: 120ms;   /* hovers, presses, overlay fades */
--dur-base: 180ms;   /* reveals, countdown ticks */
--dur-moment: 400ms; /* THE results/PB moment — used once */
--ease-out: cubic-bezier(0.2, 0, 0, 1);
```

Expose via Tailwind theme (`transitionDuration`/`transitionTimingFunction`) so
classes read `duration-fast`, `ease-out-t` etc. Delete per-component ad-hoc
durations in the sweep.

## The motion table

| # | Surface | Trigger | Effect | Duration | Implementation |
|---|---|---|---|---|---|
| M1 | Results — hero score | mount of a **completed** session's results | number counts 0 → score, eased | 400 ms, once | rAF loop, eased progress; skip to final instantly under reduced-motion or if `document.hidden` |
| M2 | Results — band gauge | after M1 starts (same moment) | add `BandGauge` to the hero for banded configs; fill animates 0 → score position (width/left transition) | 400 ms, same clock as M1 | CSS transition on the marker/fill; static-full under reduced-motion |
| M3 | Results — body | mount | vitals row + review table fade in with a 6 px rise, **one** stagger step after the hero (no per-row stagger) | 180 ms, delay 100 ms | one keyframe class on two containers |
| M4 | PB emphasis | `isNewPB` | existing "New best" chip + gauge get a single scale pulse 1 → 1.04 → 1 | 200 ms, once | keyframe; no confetti, nothing looping |
| M5 | Countdown | each tick (3→2→1→GO) | incoming number scales 1.12 → 1 with fade-in | 180 ms per tick | keyframe re-triggered by key change; reduced-motion path already shows static "Ready?" — untouched |
| M6 | Pause overlay / sim quit-confirm / drill pause | open only | fade + scale 0.98 → 1 | 120 ms | keyframe on the overlay container; **close is instant** (resume must feel immediate) |
| M7 | All interactive elements | hover / focus / press | color & border via `--dur-fast`; primary buttons add `active:scale-[0.98]` | 120 ms | via the `Button` primitive + sweep; replaces the 10/3/32 transition mix |
| M8 | Drill test-mode feedback flash | (exists) | keep 300 ms flash + 1.2 s answer reveal exactly as is; just consume the shared easing token | — | retune only, no behavior change |
| M9 | Theme switch | — | **explicitly skipped** — cross-fading every token invites paint jank for zero meaning | — | — |

## Do-not-animate list (hard rules, from doc 07 §1)

- **Question advance** — hard cut < 50 ms, zero layout shift. Untouchable.
- **Prompt, input field, caret, clock, score counter** during play. The score
  ticking up top-right must NOT pulse — everything on the play screen whispers.
- **Route/page changes** — instant.
- **Charts, sparklines, heatmap, calendar** on mount (`isAnimationActive`
  stays `false`).
- **Loading states** — no spinners/skeleton shimmer; fix flashes by reserving
  layout (see [03-consistency-spec](03-consistency-spec.md) C6).
- Nothing loops, ever.

## Acceptance for this file's work

- Playing a full sprint feels byte-identical to before (hard cuts, no shift).
- Results screen has one composed reveal ≤ 500 ms total; replaying it via
  navigation shows it again without glitches; reduced-motion (emulate or
  temporarily set the media in DevTools) renders the final state instantly.
- Countdown ticks feel crisper, not slower — total 3-2-1 wall time unchanged
  (the 700 ms/tick cadence is not extended by the 180 ms animation).
- Esc-pause still appears within one frame's feel (fade ≤ 120 ms, close
  instant).
