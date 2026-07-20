# Style Analysis & Selection — from styles.refero.design

_Goal: move Aleph from "clean but bland" to a **smooth, unique, distinctive**
experience — without turning a keyboard-first speed tool into a toy. Source:
`styles.refero.design` (a curated gallery of real product UIs described
atmospherically, not a taxonomy of named styles). I shortlisted the five
entries whose aesthetic fits a dark, amber-accented, data-dense trading tool,
analyzed each, and selected a direction._

> Note: the message asked to "use the following links" but only
> `styles.refero.design` came through. This analysis is built from that gallery
> plus first-hand knowledge of the referenced products. If there were other
> links intended, drop them in and I'll fold them in.

## The five candidates (all from the refero gallery)

### 1. Linear — _"midnight precision instrument"_
The canonical dark, keyboard-first product UI. **Traits:** near-black base
(#08090A-ish) with **layered surfaces** that feel lit from above (hairline
1px borders + a faint top inner-highlight + a barely-there top-down surface
gradient); ultra-tight type with generous line-height; **contextual focus
glow** rather than heavy outlines; fast, **spring-tuned micro-motion**
(150–250 ms, slight overshoot on menus/checks); dense but calm; color used
only for state. **Fit:** near-perfect — it's the same ethos Aleph already
claims ("calm precision"), executed with the craft Aleph currently lacks.

### 2. Slash — _"midnight vault with gilded ledger"_
Dark fintech with a **gold/amber accent on deep charcoal**, ledger-like
precision, tabular figures as heroes. **Traits:** black-to-charcoal depth,
gold used sparingly for emphasis and money-numbers, monospaced/tabular
numerics, editorial restraint. **Fit:** this is _literally Aleph's palette_
(dark near-black-blue + amber). It validates the amber and points at the
"financial readout" treatment for numbers Aleph's heroes should have.

### 3. Mercury — _"alpine banking at blue hour"_
Airy fintech: neutral/light backgrounds, teal accent, soft gradient
illustrations, generous whitespace, low density, smooth card-rotation motion.
**Fit:** poor. Light + airy + teal is the opposite of a dense dark speed
terminal. **Reject** — but its smooth micro-interaction quality is a bar to
match.

### 4. Max Yinger — _"midnight engineer's terminal"_
A literal terminal/monospace portfolio: mono everything, command-line motifs,
grid/ruler textures, high contrast. **Fit:** thematically on-point (Aleph's own
spec says "trading terminal"), but as a _whole direction_ it tips into
gimmick/brutalism for something used daily under time pressure. **Reject as the
direction; borrow** the terminal-texture and mono-readout ideas.

### 5. Hyperstudio — _"blueprint scratched into obsidian"_
Dark with **technical blueprint/graph-paper textures**, thin precise lines,
schematic feel. **Fit:** the graph-paper texture is a _perfect signature_ for a
mental-**math** trainer (graph paper = math), and reads "engineered" not
"decorated." **Reject as the direction; borrow** the faint grid texture as
Aleph's signature.

_(Also considered: Authkit — "frosted glass cathedral at midnight." Glassmorphism
is trendy but decoration-heavy, hurts legibility on dense data, and costs paint
performance on the play loop. Rejected on principle — against "color = state,
not decoration" and the perf budget.)_

## Selection — "**Precision Instrument**" (Linear-grade, with a Slash gilding and a Hyperstudio signature)

Aleph is already ~70% of the way to a Linear×Slash hybrid: dark near-black-blue
base, amber accent, tabular figures, keyboard-first. It reads bland because it
stops at _flat_ — flat surfaces, uniform borders, no depth, no focus glow, no
signature, motion only in two places. The chosen direction keeps the palette and
IA and adds the **craft layer** that makes Linear/Slash feel premium:

1. **Layered, lit surfaces** — depth via hairline borders + top inner-highlight
   + a whisper of surface gradient (tonal, never colored). Kills the "flat
   card" blandness.
2. **A gilded readout treatment** for the numbers that are the product's
   heroes (score, clock, net, streak) — framed mono "terminal readouts," amber
   on emphasis (from Slash).
3. **One signature texture** — a faint graph-paper grid on hero/empty surfaces
   only (from Hyperstudio). This is the "unique" hook: a math trainer that
   subtly looks like engineering graph paper. Used _sparingly_.
4. **Focus glow + spring micro-motion** — contextual amber focus ring-glow,
   spring-eased hovers/presses/pops (from Linear). Smooth without being busy.
5. **Restraint preserved** — the play screen stays sacred (hard cuts, minimal),
   everything collapses under reduced-motion, no new heavy deps.

### Why not the others, in one line each
Mercury (too light/airy/teal), full Max-Yinger terminal (gimmick under
pressure), full Hyperstudio blueprint (texture-as-whole-UI hurts density),
glass/Authkit (decoration + perf cost).

## Relationship to prior work & the design law

This **evolves** `Docs/07-ui-ux.md` from "zero decoration / flat" toward
"**tonal depth + one signature texture**," with the user's explicit direction to
be less bland. It **supersedes** the conservative `ui-review/` polish where they
differ, but keeps every hard guardrail: play-screen sanctity, `prefers-reduced-
motion`, perf budgets, honest UI (no dead controls), and **no animation/UI
libraries** — all effects are CSS + the browser View Transitions API + the one
existing rAF count-up. Concrete values are in
[01-design-system.md](01-design-system.md); the component kit that carries them
is in [02-component-kit.md](02-component-kit.md).
