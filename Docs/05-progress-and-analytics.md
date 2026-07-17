# 05 — Progress Tracking & Analytics

Everything about data: what's stored, the exact metric formulas, the dashboard, spaced repetition mechanics, and benchmarks. Storage implementation details (Dexie/IndexedDB) in doc 08.

---

## 1. Data model

```ts
interface Session {
  id: string;                 // ULID (time-sortable)
  mode: 'sprint' | 'sim' | 'drill' | 'daily' | 'srs' | 'gaps';
  simId?: string;             // 'optiver80' | 'flow60' | 'akuna80' | 'custom' | 'sequences'
  configHash: string;         // stable hash of plan → groups comparable sessions
  plan: SessionPlan;          // full engine plan (doc 04) — sessions are replayable
  engineVersion: number;
  startedAt: number;          // epoch ms
  durationMs: number;         // actual elapsed
  scoring: ScoringRule;
  score: number;
  vitals: Vitals;             // denormalized summary (attempted, correct, wrong, skipped, accuracy, medianLatencyMs, p90LatencyMs, perMin)
  completed: boolean;         // false = abandoned
  official: boolean;          // false for daily-challenge replays
  extended: boolean;          // sprint with non-Zetamac content
}

interface Attempt {
  id: string;                 // ULID
  sessionId: string;
  index: number;              // 0-based position in session
  skill: SkillTag;
  factKey: string | null;
  prompt: string;
  answerCanonical: string;
  given: string | null;       // null = unanswered/skipped/timed-out
  correct: boolean;
  difficulty: number;
  firstKeyMs: number;         // question shown → first keystroke ("think time")
  totalMs: number;            // question shown → advance/commit
  at: number;                 // epoch ms
}

interface FactStat {          // maintained incrementally on session end
  factKey: string;
  attempts: number; correct: number;
  latencies: number[];        // ring buffer, last 20 totalMs of correct answers
  medianLatencyMs: number;
  weak: boolean;              // doc 03 §6 thresholds
  updatedAt: number;
}

interface SrsCard {
  id: string;                 // usually === factKey
  deck: string;
  front: string; answer: Canonical; format: AnswerFormat;
  box: 1|2|3|4|5;
  dueAt: number;              // epoch ms, local-midnight-aligned
  lastReviewedAt: number | null;
  targetMs: number;           // default 3000
  source: 'builtin' | 'weakfact';
  suspended: boolean;
}

interface DailyRecord { date: string /* YYYY-MM-DD */; sessionId: string; score: number; }
interface Streak { current: number; best: number; lastDate: string; freezes: number; }
interface PersonalBest { key: string /* mode+configHash */; score: number; sessionId: string; at: number; }
```

Retention: attempts are the big table (~60 rows/session; a heavy user ≈ 100k rows/year — fine for IndexedDB). No pruning in v1; export keeps everything.

## 2. Metric definitions (exact formulas — implement once, in `src/engine/stats.ts`)

- **Accuracy** = correct / attempted (skips count as attempted in sims, since a skip is a decision; flow-input modes have no skips).
- **Throughput** = correct / minutes of active play.
- **Latency stats** use `totalMs` of *correct* answers only (wrong-answer time is a different signal); median and p90. **Think time** = median `firstKeyMs` (separates reading/deciding from typing).
- **Rolling average** = mean score of last 7 *completed, official* sessions of the same configHash.
- **Trend arrow** = sign of (rolling-7 mean) − (previous rolling-7 mean), shown only when ≥ 14 sessions exist.
- **Fatigue delta** = accuracy in last quartile of session minus first quartile (by question index). Surfaced when a user's mean fatigue delta over last 10 sessions < −8 points ("your accuracy drops N% late in sessions — build stamina with longer drills").
- **Skill mastery chip** (Learn pages, drill catalog): given tag stats over last 30 days — `—` (< 10 attempts), `learning` (accuracy < 85% or median latency > tag target), `solid` (≥ 85% and within target).
- **Readiness** (per sim, P2): distance between rolling-3 sim net score and the community-reported pass/competitive bars, rendered as a labeled gauge — never a fake-precise percentage.

## 3. Benchmark bands (constants file, UI-labeled "community-reported")

- **Sprint @ Zetamac default:** <30 Foundation · 30–49 Developing · 50–64 Interview floor · 65–79 Competitive · 80+ Elite.
- **Optiver-style net /80:** <45 Below bar · 45–55 Borderline · 56–69 Passing · 70+ Competitive.
- **Flow-style net /60:** <30 Below bar · 30–41 Borderline · 42–51 Passing · 52+ Competitive (scaled from the ~60%/80% reports).
- Custom configs and extended sprints: no bands (show only personal history).

## 4. Dashboard spec

Layout: responsive card grid (doc 07 §5). Cards, in priority order:

1. **Headline strip** — current streak, rolling-7 sprint average with trend arrow + band, total questions answered, SRS cards due.
2. **Score over time** — line chart per mode/config (selector), x = session date, y = score, horizontal band shading behind the line (band colors doc 07); PB markers. Hover: session details, click → its results page.
3. **Skill breakdown** — horizontal bars per skill tag: accuracy (bar) + median latency (right-aligned number vs target); sorted worst-first; each row click-through → pre-configured drill.
4. **Times-table heatmap** — 2–20 grid from FactStats, color = median latency (theme ramp), outlined = weak, blank = <3 attempts; click cell → 10-question fact drill; tabs for Squares and Fractions grids.
5. **Consistency calendar** — GitHub-style 26-week heatmap of questions answered/day; daily-challenge days ringed.
6. **Sim readiness** — per attempted sim: latest & best net score against band bars.
7. **Fatigue panel** — mean accuracy by session-quartile, last 10 sessions.
8. **Records** — PB table per mode/config.

Empty states matter: every card with insufficient data shows what it *will* display and the fastest way to feed it ("Play 3 sprints to unlock trends").

## 5. SRS mechanics (Leitner, deterministic and simple)

- Boxes 1–5 with intervals **[0, 1, 3, 7, 21] days**; `dueAt` set to local midnight + interval (box 1 = later same day, re-queued after 10 min).
- Review session: all due cards shuffled, cap 40/day (overflow stays due tomorrow; oldest-due first).
- Grading is objective: typed answer, correct within `targetMs` → box+1 (max 5); correct-but-slow or wrong → box 1. Show the correct answer for 1.5 s on failure (that *is* the study step).
- New-card introduction: max 10/day per deck, box 1.
- Weak-fact auto-enrollment (doc 03 §6) creates `source:'weakfact'` cards; if already present, demote to box 1 instead of duplicating. A fact that stops being weak and reaches box 5 gets suspended (graduated).
- No ease factors, no SM-2 — Leitner is transparent and the card pool is small (< 400).

## 6. Streaks & daily

- Streak increments on first official daily-challenge completion each local day; missing a day consumes a freeze if available (earned 1 per 7-day streak, cap 3), else resets to 0. All transitions computed on app open and session end — no background timers.
- `DailyRecord` powers the daily-history chart (cleanest longitudinal series — identical config every day).

## 7. Export / import / privacy

- **Export:** one JSON file `{ version, exportedAt, sessions, attempts, factStats, srsCards, dailyRecords, streak, personalBests, settings }`. Also a **CSV of attempts** (analyst-friendly).
- **Import:** validates version + schema; **merge** mode dedupes by ULID (union), **replace** mode wipes first; both show a preview diff (`+412 attempts, +9 sessions`) before committing.
- **Privacy:** no network calls with user data, no analytics beacons, no fonts from CDNs (self-hosted). State this plainly on the About page.
- Schema versioning: integer `dataVersion` with forward migrations on app load (doc 08).
