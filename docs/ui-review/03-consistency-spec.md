# Consistency Spec — the de-slop sweep

## C1 · `Button` primitive (`src/ui/Button.tsx`)

One component replaces all 45 ad-hoc instances. API kept deliberately small:

```tsx
<Button variant="primary|secondary|danger|ghost" size="sm|md|lg"
        mono?: boolean  // mono+semibold label (start-action style)
        ...native button props (onClick, disabled, autoFocus, title, type)
        className?: string  // escape hatch for layout only (w-full, self-start)
/>
```

| Variant | Style (from existing best examples) |
|---|---|
| `primary` | `bg-accent text-bg font-medium hover:brightness-110 active:scale-[0.98]` |
| `secondary` | `border border-border text-text-dim hover:border-accent hover:text-text` |
| `danger` | `border border-bad text-text hover:bg-bad-bg` |
| `ghost` | `text-text-dim hover:text-text` (no border) |

| Size | Padding / text |
|---|---|
| `sm` | `px-3 py-1.5 text-sm` |
| `md` | `px-5 py-2` |
| `lg` | `px-6 py-3 text-lg` (Home START keeps its one-off `px-8 py-4` via className) |

Universal: `rounded-btn`, `duration-fast` transitions, `disabled:opacity-40
disabled:cursor-not-allowed`, focus ring inherited from the global
`:focus-visible`. **Mapping rule for the sweep:** start-actions → `primary
mono` (lg on lobbies/Home, md elsewhere); Again/Resume/confirm → `primary md`;
New config/Dashboard/Duplicate/Edit/export-import → `secondary`; Quit/Erase →
`danger`; inline text-buttons (sort toggles, "Reveal", "view") → `ghost sm`.
Segmented controls (theme picker, drill config, font size) and toggle switches
are *not* buttons — they keep their components but consume the duration tokens.

Acceptance: `grep -rE 'rounded-btn' src --include='*.tsx'` matches only
`Button.tsx` + the segmented/keypad controls; the 9 padding dialects are gone.

## C2 · Self-hosted fonts (roadmap 1.3, pulled forward)

`@fontsource/jetbrains-mono` (400, 600) + `@fontsource/inter` (400, 500, 600),
imported once in `src/index.css`. Families already named in `tokens.css` —
no token changes. Verify: network panel shows zero font requests to any CDN;
woff2 files in `dist/assets`; numerals on the play screen render JetBrains
Mono with tabular figures; total added assets ≈ 200–300 KB of woff2 (fine —
they're cacheable assets, not JS; note them for Phase 1's PWA precache).

## C3 · Top-bar habit chips (doc 07 §3)

Right side of `TopBar`, before ⚙: `🔥 N` (links `/daily`, hidden when streak
is 0) and `⚡ N due` (links `/srs`, hidden when 0). Data: `useStreakStore` +
`dueCount()` refreshed on route change (`useLocation` effect — the srsCards
table is small; no caching layer). Mono, `text-sm`, `text-text-dim`,
hover→`text-text`. The top bar stays hidden during play, so the play screen is
unaffected.

## C4 · Convention tokens

- Disabled state: `disabled:opacity-40` everywhere (one instance of `-60`
  exists — the Button sweep removes it).
- Hover transitions: all via `--dur-fast`; delete component-local
  `transition-colors`/`transition-transform` in favor of the shared classes.
- Container widths — document in code (comment in `AppLayout`): narrow
  `max-w-2xl` (settings, daily, srs), default `max-w-3xl` (home, learn,
  drills, sims, results), wide `max-w-content` (stats). No page moves; this
  just becomes the written rule.

## C5 · Play-surface header/hint consistency (verify-only)

Phase 0.4 already swept the Esc hints. Confirm all five fullscreen surfaces
share the same header row pattern (context label left / progress right) and
identical hint-line styling; fix stragglers only.

## C6 · Kill loading flashes (no skeletons)

`/stats` and `/results`: render the page shell immediately and reserve
vertical space (`min-h` on the data regions) so the IndexedDB read (~tens of
ms) never causes a visible center-screen "Loading…" flash + layout jump. Keep
the text as a fallback for genuinely slow loads (>150 ms) if trivial —
otherwise just reserve space. Acceptance: navigating Home → Stats and
finishing a sprint → results shows no full-layout jump.
