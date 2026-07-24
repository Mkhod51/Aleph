# Screen Treatments & Motion Inventory

_Where the direction applies, per screen. Principle: **elevate the framing,
never the play loop.** Restraint is the point — apply the signature texture and
motion only where marked._

## Shell

**AppLayout / TopBar.** Brand ◆ tinted amber; nav active-item gets the selected
marker (2px accent underline, spring-slide between items via a shared underline
element if cheap, else per-item). `🔥`/`⚡` chips → `Chip`. Thin custom
scrollbars globally. Container-width convention (narrow/default/wide) kept.

## Home — _biggest perceived-quality win_

- START button: `Button primary lg mono`, retains its one-off large size.
- **Hero band** behind START + preset panel gets `.gridfield` (radial-faded) —
  the signature texture, seen first. This alone kills the "bland landing" read.
- Daily / Flashcards cards → `Card hover` with `StatTile`-style numbers
  (🔥 streak, ⚡ due) and the today-state line.
- Last-7 sparkline: keep, restyle bars to amber with a subtle top cap; align to
  grid rhythm.
- Shortcut row (Sims/Drills/Learn/Stats): `NavCard` with hover arrow shift.
- Onboarding screen: `.gridfield` background, `HeroReadout`-style title framing,
  spring-in on the two buttons (one-shot).

## Play surfaces (Sprint / Daily / Drill / Sim) — **sacred, minimal**

- **No new decoration, no texture, no motion.** Hard cuts stay hard cuts.
- Only allowed changes: adopt `.readout` type on clock + score (mono, tabular,
  -0.02em, dim), tokenized colors, focus-glow on the input. The prompt/input/
  advance behavior is byte-identical.
- Pause/quit overlays → `Modal` (fade+scale in `--dur-fast`, **instant close**).
- Countdown ticks: incoming digit scales 1.12→1 + fade (`--dur-base`,
  `--ease-spring`), cadence unchanged; reduced-motion → existing static "Ready?".
- Drill test-mode feedback flash: keep 300 ms/1.2 s behavior, consume shared
  easing token only.

## Results — _the designed "moment"_

- Hero: `HeroReadout` (score/net, `-0.02em`, amber `emphasis` on net/PB) +
  `.gridfield` hero band + `BandGauge` on the hero for banded configs.
- **Reveal sequence** (View Transitions API, reduced-motion → instant):
  hero settles → band gauge fills (`--dur-slow`) → vitals + review fade-rise
  once (`--dur-base`, +100 ms delay). One composed moment ≤ ~600 ms total.
- **PB moment**: existing count-up (already built) + a single `--ease-spring`
  pulse on the "New best" `Chip` and gauge. No confetti, nothing loops.
- Vitals row → grid of `StatTile`. Review table: selected/hover row marker;
  "trick T#"/"drill" become `ghost` buttons/links; keep sortable + coach links.

## Dashboard (`/stats`) — _where "data-dense terminal" earns its keep_

- Headline strip → `StatTile` grid on a `.panel`.
- Charts themed per [02 §C](02-component-kit.md): faint grid, faint ticks, amber
  line + glowing PB dots, refined band shading.
- **Heatmap**: rounded cells, glowing weak-outline, cell-hover lift, add the
  fast→slow legend swatch. This is the app's signature analytic — make it look
  engineered (schematic/blueprint energy) without adding chartjunk.
- Cards use `.panel`; empty cards → `EmptyState` (with `.gridfield`).
- Fatigue/sim-readiness/records cards adopt the same panel + `StatTile`/`Chip`
  rhythm.
- Section changes (if any tabs) via View Transitions; **charts never animate on
  mount**.

## Sims (index + lobby)

- Lobby header band → `.gridfield`; rules list tidy; `BandGauge` upgraded;
  "last 3" nets → `Chip`s (or `StatTile`s); Start → `Button primary lg mono`.
- Index cards → `Card hover`.

## Learn (index + detail)

- Index rows: hover arrow shift; mastery → `Chip`.
- Technique page: eyebrow + framed title; worked examples in a `.panel` with a
  subtle left accent rule (like a code block); "Drill this" → `Button primary`;
  related links tidy. Reference tables: zebra-free, hairline rows, tabular
  figures, sticky header if long. Strategy pages: comfortable measure (≤65ch).

## Daily lobby / SRS review / Settings

- Daily lobby: streak `StatTile`, history bars aligned to grid, Play →
  `Button primary lg`.
- SRS review: keep the minimal fullscreen typed-answer surface (it's play-like);
  card front adopts `.readout`; the ✕/Esc exit + hint stay; correct-advance may
  add a subtle spring check-tick (one-shot) since SRS isn't the timed sprint —
  optional, reduced-motion-guarded.
- Settings: `SegmentedControl` + `Toggle` from the kit; `Card` panels; About
  content unchanged (Phase-1 owns the About page).

## Full motion inventory (nothing outside this table gets built)

| ID | Where | Effect | Timing | Guard |
|----|-------|--------|--------|-------|
| R1 | Results hero | count-up (exists) + settle | 400 ms rAF | reduced-motion→instant, `document.hidden`→instant |
| R2 | Results band gauge | fill 0→score | `--dur-slow` | reduced-motion→static |
| R3 | Results body | fade-rise once (no per-row stagger) | `--dur-base` +100ms | reduced-motion→instant |
| R4 | PB chip + gauge | one spring pulse | 200 ms | one-shot |
| C1 | Countdown tick | scale 1.12→1 + fade | `--dur-base`/spring | reduced-motion→static |
| O1 | Pause/quit/`?` modal | fade+scale in; **instant out** | `--dur-fast` | reduced-motion→instant-in |
| H1 | Buttons/cards/nav | hover/press/lift, focus-glow | `--dur-fast` | — |
| N1 | Nav active marker | slide between items | `--dur-fast` | reduced-motion→instant |
| G1 | Band/needle & sparkline caps | mount fill | `--dur-slow` | reduced-motion→static |
| V1 | Results reveal + dashboard section swaps | View Transition cross-fade | `--dur-base` | unsupported/reduced→instant |
| S1 | SRS correct-tick (optional) | spring check | 200 ms | reduced-motion→none |

**Never animated:** question advance, live prompt/input/clock/score, route
changes (except the two V1 surfaces), charts/heatmap/calendar mount, anything
looping, anything on a timed play screen.
