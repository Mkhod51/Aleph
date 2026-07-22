# UI Cleanup — de-slop + cooler motion (small pass)

_A short, surgical pass after the "Precision Instrument" redesign. Three things:
kill the AI tells (emojis, em-dash separators), swap them for crafted marks, and
make a few transitions springier. No structural change, no new screens. **One
agent, no subagents** — this is a cross-cutting consistency pass where a single
author keeps the icon kit and copy uniform; splitting it would fragment
consistency for zero speed gain._

Grounded in the refero pick from `ui-redesign/00`: **Linear** ("midnight
precision instrument") — crisp monochrome marks + spring micro-motion — and
**Slash** ("gilded ledger") — the aleph glyph as a quiet wordmark.

## 1. Emojis → crafted marks (verified locations)

Build one tiny in-house icon set — `src/ui/kit/icons.tsx`, hand-rolled inline
SVG, `currentColor`, ~14px, no dependency, no icon library. Replace:

| Emoji | Where (verified) | Replace with |
|---|---|---|
| `◆` brand | `src/lib/brand.ts` (`APP_MARK`) | **`ℵ`** (the aleph glyph — doc 10 §4 literally suggests א/ℵ₀ as the mark). Ties the wordmark to the name; instantly more distinctive. |
| `▶` | Home, DailyPage, SimLobbyPage, LearnDetailPage | `<PlayIcon/>` (thin triangle) inside the button, or drop it entirely for text-only starts. |
| `🔥` streak | TopBar, HomePage, DailyPage | `<FlameIcon/>` in `--accent`. |
| `⚡` due | TopBar, HomePage | `<BoltIcon/>` in `--accent`. |
| `✓` / `✗` | ResultsPage, HomePage (+ `content/techniques.ts` prose) | `<CheckIcon/>` / `<CrossIcon/>` in `--good`/`--bad`. **Keep the existing `aria-label="correct"/"wrong"`** on the wrapping element. |
| `①` `②` | `src/engine/generators/frac.ts` (FRAC_COMPARE prompt) | `(1)` / `(2)`. Prompt-string only — no logic/answer change; FRAC_COMPARE isn't in the zetamac default so there's no parity/determinism impact. This is the **only** engine edit in the pass; do not touch anything else in `src/engine/`. |

**Keep `□`** (the missing-operand box in MISSING_ADD/MUL, PCT_REVERSE, T14) — it's
standard math notation, not slop.

## 2. Em-dash purge (48 in UI microcopy)

Em dashes read as machine-written. Replace them in **UI chrome/microcopy**
(`src/pages/**`, `src/ui/**`) — not in the engine, not in tests:

- Separators → the app's existing middle-dot `·` or restructure. e.g.
  `START SPRINT — 2m` → `START SPRINT · 2m`; the Home sparkline `40 — 72` → drop
  the dash (the bars already separate the two numbers) or `40 → 72`.
- Connector/parenthetical em dashes in sentences → a comma, colon, or two
  sentences, whichever reads most human. Don't invent new copy; just re-punctuate.
- **Content caveat:** `src/content/*` (techniques/strategy) has ~25 em dashes and
  is doc-06 *verbatim*. Leave it out of this pass by default; if the user wants
  the Learn prose de-dashed too, do a **separate, light** re-punctuation that
  preserves every worked-example value and meaning. Flag, don't force.

**Do NOT touch** the `·` middle-dot separators (a designed convention), the
`−` (U+2212) minus in subtraction prompts (engine/math), or `→`/`←` arrows.

## 3. A bit cooler — 3 small motion refinements

Reuse the existing motion tokens; add nothing heavy. All reduced-motion-guarded;
play screen still sacred (no new motion on prompt/input/clock/score/advance).

1. **Springy micro-interactions.** Route the existing hover/press/lift/arrow-shift
   transitions through `--ease-spring` (already defined) instead of linear/ease-
   out, so buttons, cards, and NavCard arrows feel alive (Linear's snap). Primary
   button keeps `active:scale-[.98]`; the play triangle nudges +2px on hover.
2. **Value-change flare (one-shot).** When the streak or due count *increases*,
   the FlameIcon/BoltIcon does a single spring flare (scale 1→1.15→1, ~220ms).
   Change-detected only — never on every render, never looping.
3. **Crisper reveal.** Retune the Results reveal / any View-Transition cross-fade
   to `--ease-spring`/`--dur-base` so the "moment" lands with a little pop rather
   than a flat fade. One change, don't add new reveals.

## Guardrails
- `src/engine/` diff limited to the single `frac.ts` prompt string (§1); zetamac
  parity + `ENGINE_VERSION` untouched; data model untouched.
- Keep accessible names intact: `✓/✗` keep their aria-labels; the START button
  keeps the literal text `START SPRINT` (the e2e locator matches `/START SPRINT/`
  — changing `—`→`·` is fine, don't remove those words).
- No new runtime dependency (icons are inline SVG). Both themes verified.
- Gates green: `npm run check` + `npm run e2e`. Bundle delta ≈ 0.

The paste-ready prompt is [01-prompt.md](01-prompt.md).
