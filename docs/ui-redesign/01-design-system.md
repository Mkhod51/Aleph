# Design System — "Precision Instrument" (concrete values)

_Evolves `src/styles/tokens.css`. Keep the existing token **names** (so nothing
breaks) and change values / add tiers. All additions are tonal (no new hues
except one gilded accent step). Dark is primary; light theme mirrors every role._

## 1. Color & depth tiers (dark)

Deepen the base and add elevation tiers so surfaces read as _layered_, not flat.

```css
--bg:         #090B10;  /* deeper near-black blue (was #0B0E14) */
--surface:    #10131B;  /* card / panel base */
--surface-2:  #171B26;  /* hover / raised */
--surface-3:  #1E2432;  /* popover / active / menus (NEW tier) */
--border:     #222836;  /* hairline default */
--border-2:   #303849;  /* emphasized hairline (focus-adjacent, active rows) */
--hairline-top: rgba(255,255,255,0.05); /* top inner-highlight = "lit from above" */

--text:       #E9EDF5;
--text-dim:   #8B95A8;
--text-faint: #59637A;  /* NEW: tertiary / captions / axis ticks */

--accent:      #FFB020;  /* keep amber (Slash-validated) */
--accent-hi:   #FFC24D;  /* hover / highlight step (NEW) */
--accent-dim:  #B67A16;  /* pressed / subtle (NEW) */
--accent-glow: rgba(255,176,32,0.18); /* focus + PB glow (NEW) */

--good: #22C55E; --good-bg: #0E2A1A;
--bad:  #EF4444; --bad-bg:  #2A1214;
/* band + heatmap ramps unchanged */

/* signature texture (used sparingly) */
--grid-line: rgba(255,255,255,0.022);
```

**Light theme** (mirror): `--bg #F6F8FB`, `--surface #FFFFFF`,
`--surface-2 #EEF2F7`, `--surface-3 #E6EBF2`, `--border #E1E6EE`,
`--border-2 #CDD5E1`, `--hairline-top rgba(255,255,255,0.7)`, `--text #141922`,
`--text-dim #5B6472`, `--text-faint #8A93A3`, `--accent #B45309`,
`--accent-hi #C2610A`, `--accent-dim #8A3E07`, `--accent-glow rgba(180,83,9,.18)`,
`--grid-line rgba(20,25,34,0.04)`.

## 2. Elevation model (the anti-blandness core)

Replace flat cards with a reusable **panel recipe** (a Tailwind
`@layer components` class `.panel`):

- 1px `--border`;
- a **top inner-highlight**: `box-shadow: inset 0 1px 0 var(--hairline-top)`;
- a whisper of top-down surface sheen:
  `background-image: linear-gradient(180deg, rgba(255,255,255,0.02), transparent 40%)`
  over `--surface`;
- radius 10px (bump cards 8→10 for a softer, more modern read; buttons stay 6px);
- **no colored shadows.** Overlays/popovers/menus (surface-3) may add a real
  elevation shadow — dark: `0 8px 30px rgba(0,0,0,0.5)`, light:
  `0 8px 30px rgba(20,30,50,0.12)` — this is the _only_ place shadows appear.

Interactive panels (`.panel-hover`): on hover, `border-color: --border-2`,
`transform: translateY(-1px)`, background → `--surface-2`, all via `--dur-fast`.

## 3. Signature texture — graph-paper grid

A math trainer should subtly look like graph paper. `.gridfield`:
```css
background-image:
  linear-gradient(var(--grid-line) 1px, transparent 1px),
  linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
background-size: 24px 24px;
/* optional radial fade so it's densest behind the hero and dissolves outward */
mask-image: radial-gradient(120% 120% at 50% 0%, #000 40%, transparent 100%);
```
**Where allowed:** Home hero band, empty-state cards, the results hero band,
sim-lobby header, the onboarding screen. **Where banned:** anywhere behind live
question text (the play prompt), tables, charts, dense lists. Opacity is already
~2%; never raise it.

## 4. Typography

Keep JetBrains Mono (numerals/prompts/stats) + Inter (UI), now self-hosted.
Tighten the instrument feel:

- **Numeric heroes** use a `.readout` treatment: JetBrains Mono, `tabular-nums`,
  `letter-spacing: -0.02em`, optional thin framing rule (see HeroReadout in the
  kit). Hero score 4rem → allow `clamp(3.25rem, 7vw, 5rem)`.
- **Headers** (h1/eyebrow): Inter, `letter-spacing: -0.01em` on titles;
  eyebrows stay uppercase `0.06em`, `--text-faint`.
- Body 0.9375rem / line-height 1.55. Enforce `font-variant-numeric: tabular-nums`
  on every element showing numbers (already partly done).
- Keep the question scale `clamp(3rem, 9vw, 6rem)`.

## 5. Motion tokens (extend, don't replace)

The polish pass added `--dur-fast/base/moment` + `--ease-out`. Add:

```css
--dur-slow:   260ms;                               /* reveals, view transitions */
--ease-spring: cubic-bezier(0.34, 1.4, 0.5, 1);    /* pops: PB, checks, chips */
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);     /* symmetric fades */
```

Rules (full inventory in [03-screen-treatments §Motion](03-screen-treatments.md)):
- Hovers/press: `--dur-fast` + `--ease-out`; primary press `active:scale-[.98]`.
- Panel hover-lift: `--dur-fast`.
- Reveals (results, section mounts): `--dur-base`/`--dur-slow` + `--ease-out`.
- Pops (PB pulse, correct-check, chip appear): `--ease-spring`, one-shot.
- **View Transitions API** (zero-dep) for the results reveal and dashboard
  section/tab swaps; wrap in `document.startViewTransition?.(...)` with a
  reduced-motion + unsupported-browser fallback to instant.
- **Play screen exempt**: question advance is a hard cut; prompt/input/clock/
  score never animate. Non-negotiable.
- Everything collapses to instant under `prefers-reduced-motion` (global CSS
  override already does this for CSS; JS/rAF/View-Transition paths must check
  `matchMedia` themselves).

## 6. Focus, selection, state

- **Focus:** keep the 2px `--accent` ring, add a soft glow
  `box-shadow: 0 0 0 3px var(--accent-glow)` on inputs/buttons/cards focus.
- **Selected/active** (nav item, segmented option, review row): `--surface-2`
  fill + a 2px left/bottom `--accent` marker, not just a color change.
- **Scrollbars** (webkit): thin, `--border` thumb on transparent track — small,
  high-craft detail Linear-type UIs get right.

## 7. Iconography

Stay with the spec's emoji glyphs (▶ ✓ ✗ 🔥 ⚡ ◆) — the mockups use them and a
library would violate the stack. Add **no** icon set. Where a "chip/tag" is
needed, use the `Chip` component, not raw emoji + text.

## What must NOT change
Color = state (no decorative color, no gradients-as-brand beyond the tonal sheen
and the amber). No glassmorphism, no neon glows on content, no drop shadows on
cards. Bundle: new CSS only; **no runtime dependency** beyond the already-approved
`@fontsource/*`. Engine + data layer untouched.
