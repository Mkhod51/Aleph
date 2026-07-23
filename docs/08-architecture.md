# 08 — Technical Architecture

## 1. Stack (chosen for a solo/agent-built, zero-backend, performance-critical SPA)

| Layer | Choice | Rationale |
|---|---|---|
| Build | **Vite + React 18 + TypeScript (strict)** | Fast iteration; agent-familiar; strict TS catches engine math bugs |
| Styling | **Tailwind CSS** + CSS variables for tokens (doc 07 §2) | Tokens stay themeable; utilities keep components terse |
| State | **Zustand** (UI/session state) | Tiny, no boilerplate; play-loop state must be cheap |
| Persistence | **Dexie (IndexedDB)** for sessions/attempts/facts/SRS; `localStorage` for settings/streak | Attempts reach 10⁵ rows; IndexedDB is the only sane store |
| Routing | **react-router v6** | Standard |
| Charts | **Recharts**, lazy-loaded on /stats only | Good enough; keeps play bundle clean. Heatmaps/sparklines: hand-rolled SVG (trivial, lighter) |
| Content | Technique/reference content as **typed TS modules** (`content/techniques/*.ts` exporting structured objects incl. markdown strings) | Keeps drill-mappings type-checked against SkillTags — MDX pipeline not worth it for ~25 pages |
| PWA | vite-plugin-pwa (M6) | Offline practice |
| Tests | **Vitest** (engine, stats, stores) + **Playwright** (3 smoke flows) | Engine correctness is the product |

No other runtime dependencies without explicit justification. Explicitly avoided: Redux (overkill), Next.js (no server, SSG needless), component libraries (design is bespoke and minimal).

## 2. Module structure

```
src/
  engine/          # PURE TS — no React/DOM imports (lint-enforced)
    generators/    # one file per skill-tag family + registry
    profiles.ts    # distribution profiles (doc 04 §5)
    validate.ts    # normalizer + live matcher (doc 04 §6)
    difficulty.ts  # static score + adaptive rating (doc 04 §7)
    scoring.ts     # ScoringRule + vitals (doc 04 §9)
    stats.ts       # metric formulas (doc 05 §2)
    srs.ts         # Leitner transitions (doc 05 §5)
    prng.ts        # mulberry32 + xmur3 split
  store/
    db.ts          # Dexie schema + dataVersion migrations
    repos/         # sessionRepo, attemptRepo, factRepo, srsRepo, settingsRepo
    exportImport.ts
    useSessionStore.ts / useSettingsStore.ts   # zustand
  content/         # techniques, reference tables, sim definitions, band constants
  ui/              # components (PlayField, Keypad, BandGauge, Heatmap, Sparkline, …)
  pages/           # route components
  lib/             # timing.ts, ulid.ts, format.ts, hash.ts
```

**Dependency rule (enforce via eslint-plugin-boundaries):** `engine` imports nothing from other layers; `store` imports `engine`; `ui/pages` import both. Content imports engine types only.

## 3. The play loop (correctness-critical)

- **Clock:** `performance.now()` deltas, rendered via `requestAnimationFrame`; never accumulate `setInterval` ticks (drift). Session end = first rAF where elapsed ≥ duration; the in-flight question is finalized as unanswered.
- **Tab-hidden policy:** `visibilitychange` pauses sprints/drills automatically (elapsed excludes hidden time); sims do NOT pause — hiding the tab lets the clock run, matching real-test stakes, and the lobby says so.
- **Latency capture:** timestamps at question-render commit (`performance.now()` in effect after paint), first keystroke, and advance/commit — giving `firstKeyMs`/`totalMs` (doc 05 §1).
- **Input handling:** single controlled input; keystroke → normalize → live-match (flow) in the keydown handler, no debounce (budget: handler < 1 ms; no re-render of anything but the field and, on advance, the prompt).
- **Write path:** attempts buffer in memory during play; one bulk Dexie transaction on session end (plus `beforeunload` flush of partials as abandoned). Zero DB writes during the loop.

## 4. Determinism & versioning

- `engineVersion` constant; stored on every session (doc 04 §2). Bump on any generator change that alters sequences.
- `dataVersion` for the Dexie schema with sequential migration functions run at startup; export files carry both versions; import refuses newer-versioned files with a clear message.

## 5. Performance budgets (CI-checked where feasible)

- Initial JS ≤ 250 KB gz (charts/Learn content lazy-split); TTI < 1.5 s on Fast-3G throttle.
- Keystroke → paint < 30 ms; question advance < 50 ms (no layout shift — prompt area has fixed dimensions).
- Dashboard with 100k attempts: all aggregates < 400 ms (aggregate incrementally into FactStats/session vitals at write time — never scan raw attempts for the dashboard's default view).

## 6. Testing strategy

- **Engine:** the full suite in doc 04 §10 — this is the highest-value test surface (property tests over generators, validation tables, determinism).
- **Stats/SRS:** fixture-based unit tests for every formula in doc 05 §2/§5 (including midnight/timezone edges for streaks and due dates).
- **Stores:** Dexie against `fake-indexeddb`; export→wipe→import round-trip equality.
- **Playwright smoke (3):** (1) load → Enter → complete a 30 s sprint → results shows score & review; (2) run a 10-question sim with known seed → net score matches hand-computed fixture; (3) export → clear → import → history intact.
- CI: typecheck + lint + vitest + build + bundlesize on every push (GitHub Actions).

## 7. Deployment

Static hosting — Vercel (or GitHub Pages/Netlify, nothing server-side). SPA fallback rewrite; immutable asset caching (hashed filenames); `Cache-Control: no-cache` on `index.html`. Self-host fonts. No analytics scripts (product principle 6); if curiosity demands, a privacy-respecting counter (Plausible/GoatCounter) is the ceiling — decide later, default none.

## 8. Future seams (build nothing, break nothing)

- **Sync/accounts later:** all persistence behind `repos/*`; a future backend swaps repo internals for an API + local cache. ULIDs already merge-safe.
- **Leaderboards later:** daily-challenge determinism (shared seed) means a tiny score-submission endpoint suffices someday.
- **New question domains** (sequences already; estimation questions, Fermi drills): a new generator file + profile entry — no engine surgery.
