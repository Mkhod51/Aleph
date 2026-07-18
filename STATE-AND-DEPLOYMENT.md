# Aleph — State, Backend & Deployment Analysis

_A snapshot of where the app is, how it stores your data, whether it needs a
server, and what's left before it can ship. Written 2026-07-18, after M5._

---

## 1. Where the app is right now

Milestones **M0 → M5 are built and verified**; **M6 (polish & ship) is the only
milestone left**.

| Area | Status |
|------|--------|
| Sprint mode (Zetamac-parity, presets, results) | ✅ M1 |
| Analytics dashboard (score chart, skill breakdown, heatmap, calendar, records, sim readiness, fatigue) | ✅ M2 / M5 |
| Firm sims (Optiver / Flow / Akuna, net scoring, lobbies) | ✅ M3 |
| Learn library (T1–T15, R1–R5, S1–S5) + skill drills + adaptive | ✅ M4 |
| Daily challenge + streaks, SRS flashcards, weakness engine, onboarding | ✅ M5 |
| PWA / offline, a11y pass, mobile keypad, deploy, About page, sounds, training plan | ⛔ **M6 (not started)** |

**Tech:** Vite + React 18 + TypeScript (strict), Tailwind, Zustand, Dexie
(IndexedDB), react-router, Recharts (lazy). **Runtime dependencies: 6**
(`react`, `react-dom`, `react-router-dom`, `zustand`, `dexie`, `recharts`).

**Quality gates (all green):** typecheck, ESLint, **119 unit tests** (Vitest),
2 Playwright smoke flows, production build. Main JS bundle **~140 KB gzip**
(budget 250 KB); Recharts (~104 KB gz) is code-split and loads only on `/stats`.

**Repo:** `github.com/Mkhod51/Aleph`, branch `main`. CI
(`.github/workflows/ci.yml`) runs the full gate suite on every push — **but does
not deploy** anything yet.

---

## 2. Is there a backend? — No.

**There is no server, no API, no database server, and no accounts.** The app is a
100% client-side static single-page application. A grep of `src/` finds **zero**
`fetch` / `XMLHttpRequest` / `WebSocket` / `sendBeacon` calls. Nothing about your
practice ever leaves your browser.

This is deliberate (design doc 00 decision-log item 1, doc 08 §1): *local-first,
no backend, no accounts in v1.* "Deploying" this app means uploading a folder of
static files (`dist/`) to any static host — there is nothing to run server-side.

### How storage actually works

All persistence sits behind repository modules (`src/store/repos/*`), so a future
sync backend could be swapped in without touching the UI. Two browser stores are
used:

**IndexedDB (via Dexie)** — database name `aleph`, schema version 1
(`src/store/db.ts`). This holds the large, structured history:

| Table | Key | What it holds |
|-------|-----|---------------|
| `sessions` | `id` (ULID) | one row per play session: mode, config hash, full engine plan, score, denormalized `vitals` + `skillBreakdown`, timestamps, `completed`/`official` flags |
| `attempts` | `id` (ULID) | one row per question shown: prompt, your answer, correct answer, correct?, difficulty, `factKey`, think-time + total latency |
| `factStats` | `factKey` | per recallable fact (e.g. `mul:13×17`, `sq:23`): attempts, correct, a 20-item latency ring, median, weak flag |
| `srsCards` | `id` | flashcards: Leitner box (1–5), `dueAt`, target time, deck, source (`builtin`/`weakfact`) |
| `dailyRecords` | `date` | one row per calendar day you played the daily challenge |
| `personalBests` | `key` (`mode:configHash`) | best score per configuration |

**localStorage** — small, non-tabular state (3 keys):

- `aleph-settings` — theme, gameplay toggles, font size, `onboarded` flag
- `aleph-presets` — your custom sprint presets + which one is selected
- `aleph-streak` — daily streak (`current`, `best`, `lastDate`, `freezes`)

**Export / import** (Settings → Data) is the backup and device-migration path: a
single JSON file (`{version, sessions, attempts, factStats, srsCards,
dailyRecords, streak, personalBests, settings}`) plus a CSV of every attempt.
Import supports **merge** (union by ULID) or **replace**.

### Implications of being backend-less

- ✅ Zero hosting cost, no servers to maintain, no privacy surface, works fully
  offline once PWA is added.
- ⚠️ Data is **per-browser / per-device**. Clearing site data, using a different
  browser, or a different machine = a fresh start unless you export/import.
- ⚠️ No cross-device sync, no cloud backup, no shared leaderboards **yet**.

---

## 3. Do you actually need a backend?

**Not for v1 — the product is complete and correct without one.** Every feature
works locally. Add a backend only if/when you want one of these:

| You want… | What it takes | Notes |
|-----------|---------------|-------|
| **Cross-device sync / cloud backup** | An API + a per-user store; swap the internals of `src/store/repos/*` for an API+cache | ULIDs are already merge-safe (doc 08 §8) — the seam exists |
| **Friend / global leaderboards** | A tiny score-submission endpoint | The daily challenge is *designed* for this: everyone gets the identical date-seeded question sequence, so a submitted score is directly comparable with no server-side generation |
| **Accounts / login** | Auth + user records | Changes the privacy story; currently a selling point is "nothing leaves your browser" |
| **Analytics on usage** | A beacon endpoint | Explicitly avoided by design (doc 08 §7); a privacy-respecting counter is the ceiling if ever added |

**Recommendation:** ship v1 as a pure static site. Keep the repo seam. Revisit a
minimal sync/leaderboard service later only if real usage asks for it.

---

## 4. How progress is tracked — session to session & day to day

The whole loop is: **play → one write at session end → incremental aggregates →
dashboard reads aggregates.** No database writes happen *during* play (answers
buffer in memory and flush once at the end — a performance requirement).

### Per session (`src/store/sessionService.ts` → `finalizeSession`)

When any run ends (naturally or by quitting), in **one IndexedDB transaction**:

1. The buffered attempts are scored (`scoreSession`) into a `Session` row with a
   denormalized `vitals` summary and a per-skill `skillBreakdown`.
2. Every question becomes an `Attempt` row.
3. **`factStats` are updated incrementally** — each recallable fact's running
   attempts/accuracy/median-latency, so per-fact strength accumulates across all
   your sessions forever.
4. The **personal best** for that (mode, config) is updated if beaten.

After the transaction, two more things fire:

5. **Weak facts are auto-enrolled** into the SRS "weak" deck (or demoted to box 1
   if already present).
6. If it was the day's first **daily challenge**, a `dailyRecord` is written and
   the **streak** advances.

Because facts and per-session breakdowns are aggregated *at write time*, the
dashboard never scans the (potentially 100k-row) attempts table — it reads the
small `sessions` / `factStats` tables. (Measured: aggregating a dashboard over
102k synthetic attempts takes ~20 ms.)

### Session-to-session signals the app derives

- **Rolling-7 sprint average**, trend arrow (needs ≥14 sessions), and score-band.
- **Score-over-time chart** with band shading and personal-best markers.
- **Per-skill breakdown** (accuracy + median latency vs. target, worst-first).
- **Times-table heatmap** coloured by latency, weak facts outlined.
- **Records** table (personal bests per config).
- **Sim readiness** (latest & best net vs. community pass bars).
- **Fatigue** (accuracy by session-quartile over the last 10 sessions).

### Day-to-day signals

- **Daily challenge** — one date-seeded 120 s sprint per calendar day. The seed is
  `hash("qs-daily-" + YYYY-MM-DD)`, so the sequence is identical for everyone on
  a given date (this is what makes leaderboards possible with no server). The
  first completion each day is *official*; replays are marked unofficial. Each
  official day is a `dailyRecord` → the daily-history chart (the cleanest
  longitudinal signal, since the config is identical every day).
- **Streak** — consecutive days with a completed daily. A freeze (earned every
  7-day streak, capped at 3) bridges a single missed day; otherwise the streak
  resets. Transitions are computed on app open and at session end (no background
  timers).
- **Spaced repetition (SRS)** — Leitner boxes 1–5 with intervals
  `[0, 1, 3, 7, 21]` days; due dates are local-midnight-aligned so "due today"
  is stable across the midnight boundary. New built-in cards are introduced ~10
  per deck per day.

All of this is automatic and durable in your browser; there is no "save" button.

---

## 5. What's needed before deployment (the M6 checklist)

The app is *usable and correct* today, but a few things stand between it and a
polished public launch. Ordered roughly by importance.

### Must-have to ship

1. **Deploy target + SPA config.** Pick a static host (Vercel / Netlify / GitHub
   Pages / Cloudflare Pages). Add:
   - an SPA fallback rewrite (all routes → `/index.html`) so deep links like
     `/learn/t5-cross-multiplication` work on refresh;
   - immutable caching on hashed assets, `Cache-Control: no-cache` on
     `index.html` (doc 08 §7).
   - a CI deploy step (or the host's Git integration) after the gate suite.
2. **PWA / offline** (`vite-plugin-pwa`). Currently **not installed** — the app
   won't work offline yet. Needed for the "works offline as a PWA" definition of
   done: a service worker precaching the core bundle + an install prompt. This is
   the single biggest missing piece for the stated product goal.
3. **About page / legal footing.** The benchmark disclaimer, privacy statement,
   and Zetamac-inspiration credit currently live only in a card inside Settings.
   Promote them to a visible About page. Also: **choose a license** for the code
   (none picked yet) before making the repo public.
4. **Self-hosted fonts.** The design calls for JetBrains Mono (numerals) + Inter
   (UI), self-hosted, no CDN. Right now **no font files are bundled** — the app
   falls back to system mono/sans. Bundle the fonts (e.g. `@fontsource`) so the
   intended aesthetic and cross-device consistency land, while staying CDN-free.

### Should-have for quality

5. **Accessibility pass.** Foundations are in place (visible focus rings,
   `aria-live` on the play prompt, `prefers-reduced-motion` handling, table
   semantics). Still needed: full keyboard-nav audit, contrast verification, and
   a real screen-reader pass to hit **Lighthouse a11y ≥ 95** on Home & Play.
6. **Performance / Lighthouse.** Budget is met on paper (140 KB gz main). Run
   Lighthouse on Home & Play, confirm **≥ 95 performance**, verify keystroke and
   question-advance latency budgets on a throttled profile.
7. **Mobile keypad + responsive audit.** Desktop is primary and solid. Mobile
   currently uses the native keyboard; the spec wants a custom on-screen keypad
   (`inputmode="none"`) so the native keyboard never jostles the play layout.
8. **Playwright flow 3** (export → wipe → import round-trip) as an end-to-end
   smoke. The logic is already covered by a fake-indexeddb unit test; the browser
   flow is the remaining DoD item.
9. **Keyboard-shortcut overlay** (`?`) documenting the key map.

### Nice-to-have / explicitly cuttable (P2)

- **Sounds** (key clicks / end buzzer) — setting exists, wiring doesn't.
- **Training plan** (8-week arc with a daily menu on Home).
- **Sequences sim** — needs the `SEQ_*` generators (not yet implemented).
- **Custom test builder UI** — the engine seam exists (the sim play route already
  accepts `?count&seconds&seed&profile`); only the builder screen is missing.
- **Extended sprint content toggles** (decimals / fractions / % inside sprint
  presets) — the generators exist; the preset editor only exposes the four core
  ops.
- A handful of unused generators (`MUL_1x1`, `SUB_DEC`, `DIV_DEC`, `FRAC_MUL`).

### Definition of done for launch (from the roadmap)

- CI green: typecheck, lint, Vitest, Playwright smoke, build, bundle budget ✅
  (add deploy).
- **Lighthouse ≥ 95** performance and accessibility on Home & Play ⛔ (measure).
- Works **offline as a PWA** ⛔ (add service worker).
- Playwright flow 3 (export/import) ⛔.
- Deployed as a **static site**, URL live ⛔.

---

## 6. Fastest path to a live URL

1. `npm run build` → static assets in `dist/`.
2. Connect the GitHub repo to **Vercel** (or Netlify): framework "Vite", build
   `npm run build`, output `dist`. Add the SPA rewrite (`/* → /index.html`).
3. That alone gives a working, shareable, backend-free URL **today** — everything
   in §4 keeps working because it's all client-side.
4. Then layer in M6 (PWA, About, fonts, a11y/Lighthouse) for the polished launch.

**Bottom line:** the app is a self-contained static site that already tracks
everything locally and needs no server. The gap to a *good* launch is the M6
polish layer — most critically a PWA/offline service worker, a deploy target with
SPA routing, an About/license page, and self-hosted fonts.
