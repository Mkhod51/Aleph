# Cut List — Remove or Hide

_The product's brand is honest, terse UI. Dead controls and dead code tax that
brand. Everything here is verified unused in `src/`._

## Remove outright

| Item | Where | Why |
|---|---|---|
| `countdownSkip` setting | `src/store/useSettingsStore.ts` (+ export shape) | Defined, persisted, exported — **never read anywhere**. The doc-03 nuance it was for ("skip countdown after first ever play") was deliberately simplified away in M1; the field is pure cruft. Drop it from the interface, defaults, partialize, and export bundle. |
| `ComingSoonPage` component | `src/pages/ComingSoonPage.tsx` | All routes are real since M5; the component is unimported dead code. Delete. |
| `APP_TAGLINE` constant | `src/lib/brand.ts` | Unused; either use it on the About page (M6) or delete it — don't keep speculative constants. |

## Hide until implemented (don't remove — both are M6 scope)

| Item | Where | Why |
|---|---|---|
| **Sound** toggle | Settings → Gameplay | The toggle renders and persists but no sound exists anywhere. A control that does nothing erodes trust in every other control. Hide the row until M6 wires audio (it's a P2 "if time" item — it may never ship, and that's fine). |
| **Left-handed keypad** toggle | Settings (currently only in the type; exposed via export) | Meaningless until the mobile keypad exists. Surface it *with* the keypad in M6's mobile task, not before. |

## Consciously *not* cut

- **`official` flag on non-daily sessions** — always `true` today, but the
  daily-replay path exercises it and export/analytics filter on it. Keep.
- **URL overrides on `/sims/:id/play` and `/play`** — powerful and currently
  the only "custom test" mechanism; they become the backbone of the custom
  builder UI (roadmap Phase 3). Keep, but fix the `configHash` bug (F2) so
  overrides can't pollute stats.
- **The 8 unregistered generators** (`MUL_1x1`, `SUB_DEC`, `DIV_DEC`,
  `FRAC_MUL`, `SEQ_*`) — not dead code; they're unreachable by design until the
  sequences sim / P2 drill variants land. The registry throws a clear error if
  referenced. Keep the seam.
- **Streak freezes** — P2 in the priority table but already built, tested, and
  invisible until earned. Cutting would be negative work.
