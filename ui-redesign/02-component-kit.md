# Component Kit — what to build and reuse

_The design system is carried by a small in-house kit. **No UI library** (shadcn/
Radix/etc.) — the stack is fixed and the app is already fully hand-rolled;
introducing one is a bigger, dependency-heavy change than warranted. Components
live in `src/ui/` (new ones in `src/ui/kit/`). Existing components are upgraded
in place so no page-level imports break._

## A. Upgrade in place (existing)

| Component | File | Change |
|---|---|---|
| `Card` | `ui/primitives.tsx` | Becomes the **`.panel`** recipe (border + top inner-highlight + surface sheen, radius 10). Add optional `hover` and `grid` props (`hover` → `.panel-hover` lift; `grid` → apply `.gridfield`). |
| `Button` | `ui/Button.tsx` | Keep the 4 variants/3 sizes. Add: focus glow, `active:scale-[.98]` on primary, `--accent-hi` hover on primary, spring on the press. No API change. |
| `Eyebrow` | `ui/primitives.tsx` | `--text-faint`, `0.06em`, ensure consistent. |
| `NavCard` | `ui/primitives.tsx` | Reuse `.panel-hover`; add a hover arrow shift (`→` translate-x on hover). |
| `BandGauge` | `ui/BandGauge.tsx` | Smoother segmented fill; marker becomes a thin amber needle with a soft glow; animate the fill/marker on mount via `--dur-slow` (reduced-motion → static). |
| `TopBar` | `ui/TopBar.tsx` | Active nav item gets the **selected marker** (2px accent underline) not just color; brand ◆ subtle amber; chips use `Chip`. |
| `Clock` / score counter | `ui/play/Clock.tsx`, play pages | Adopt `.readout` type treatment (mono, tabular, -0.02em) — **no motion** (play-screen rule). |

## B. New kit components (`src/ui/kit/`)

### `HeroReadout` — the signature number treatment
The product's heroes (results score/net, daily/results clock end-state) rendered
as a framed "instrument readout": big JetBrains-Mono tabular number, `-0.02em`,
optional thin top+bottom hairline rule, optional unit/label slot, optional
`emphasis` (amber) for PB/net. Props: `value`, `sub?`, `unit?`, `emphasis?`,
`size?`. Used on Results hero and daily-done state. **Not** used live during play.

### `StatTile` — unify every "number + label"
Replaces the scattered vitals/headline/skill number displays. Props: `label`,
`value`, `delta?` (renders a `Chip` ↑/↓ auto-colored), `sub?`, `mono?`,
`align?`. Grid of these = the results vitals row and the dashboard headline
strip. One component, one rhythm.

### `Chip` — pill for tags/deltas/status
Props: `tone: 'neutral'|'accent'|'good'|'bad'|'band'`, `children`, `size?`,
`glow?`. Uses: band label ("Competitive · community-reported"), score deltas
(+7 / −3), streak/due top-bar chips, mastery (—/learning/solid), sim rules.
Appear with a one-shot spring pop when they mount as feedback (e.g., a new
delta), static otherwise.

### `Panel` / `.panel` + `.panel-hover` + `.gridfield` (CSS, `@layer components`)
The elevation + texture recipes from the design system. `Card` wraps `.panel`;
raw `.panel`/`.gridfield` classes available for bespoke layouts (hero bands).

### `SegmentedControl` — codify (currently duplicated 3×)
Theme picker, drill config (length/input/tier), font size all hand-roll the same
radiogroup. Extract one accessible component: `options`, `value`, `onChange`,
`ariaLabel`. Selected option = `--surface-2` + accent text + spring on switch.
`role="radiogroup"`/`radio` preserved (keeps e2e + a11y intact).

### `Toggle` — codify (currently inline in Settings)
Extract the switch into one component (`checked`, `onChange`, `label`). Track
uses accent when on, spring on the knob.

### `Modal` / `Overlay` — for the `?` shortcut overlay (Phase-2 item) + confirms
Themed centered panel on a dim scrim (`surface-3` + elevation shadow), fade+scale
in via `--dur-fast`/`--ease-out`, **instant close**, Esc to dismiss, focus-trap.
Reuse for pause/quit confirms so those stop hand-rolling their overlay markup.

### `EmptyState` — one treatment for all "no data yet" cards
`.gridfield` panel + eyebrow + one line + one CTA button. Dashboard/Home/daily/
sim empty states currently each hand-roll copy; unify the shell, keep the copy.

## C. Data-viz theming (dashboard) — `ui/stats/*`
Not new components; a **theming pass** so charts match the instrument look:
- `ScoreChart` (Recharts): axis ticks → `--text-faint`, grid → `--grid-line`,
  band shading refined, PB dots get the amber glow, line 2px `--accent`. Keep
  `isAnimationActive={false}` (no chart mount animation — decoration).
- `Heatmap`: cells adopt rounded 3px, weak-outline uses `--bad` at 2px with a
  faint glow, hover lifts the cell (existing scale, retuned to `--dur-fast`),
  add a small legend row (fast→slow swatch) — currently only prose.
- `Calendar`: keep, align cell radius/gap to the grid rhythm (24px system).

## Mapping cheat-sheet (for the sweep)
- Any "big number + caption" → `StatTile`.
- Any results/daily hero number → `HeroReadout`.
- Any pill/tag/delta/band/mastery → `Chip`.
- Any radiogroup of options → `SegmentedControl`.
- Any on/off → `Toggle`.
- Any "no data" card → `EmptyState`.
- Any raised container → `Card`/`.panel` (+`hover` when clickable, `grid` on heroes).
- Any confirm/overlay → `Modal`.

Acceptance: after the sweep, `grep -rE "role=\"radiogroup\"" src/pages` finds
only `SegmentedControl` usages; no page hand-rolls a toggle, stat number, or
overlay scrim.
