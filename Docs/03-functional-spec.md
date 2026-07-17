# 03 — Functional Specification

Every feature, its exact behavior, and acceptance criteria. Question generation internals are in doc 04; data/metrics in doc 05; visual treatment in doc 07.

---

## 1. Cross-cutting concepts

### 1.1 Input modes

Two input modes exist; every play mode uses exactly one:

**Flow input (Zetamac behavior)** — used by Sprint, Skill Drills (default), Daily Challenge:
- A text field is always focused. Accepted characters: digits, `-`, `.`, `/` (only when the active question's answer format allows them; all others are swallowed silently).
- After every keystroke, the normalized input is compared to the canonical answer. On match, the question is instantly replaced by the next one and the field clears. **No Enter key needed. There is no "wrong" state** — incorrect text just sits until edited.
- Backspace works. Paste is disabled.

**Test input (real-exam behavior)** — used by Sims, Skill Drills (optional):
- Same field, but the answer is committed **only on Enter**.
- Committed answer is graded right/wrong with no retry. Whether per-question feedback appears is a mode setting (sims: **off**, matching real tests; drills: on — a 300 ms color flash, see doc 07).
- Empty input + Enter: if the mode allows skipping, records a skip; if not (Optiver rules), Enter on empty input does nothing.

### 1.2 Session lifecycle

`configure → countdown (3-2-1, skippable with Enter/click; skips by default after first ever play via setting) → play → end (clock or question count reached, or user quits) → results`

- **Pause:** Esc during play opens pause overlay (clock frozen, question hidden to prevent free thinking time). Resume / Quit. Sims cannot pause (real tests don't) — Esc there prompts Quit-with-confirm; quitting a sim marks the session abandoned.
- **Abandoned sessions** (quit before natural end) are stored, flagged `completed: false`, excluded from records/averages, visible in history.
- Every question shown, answered or not, is logged as an Attempt (doc 05 §1).

### 1.3 Results screen (shared by all modes)

Hierarchy (top → bottom):
1. **Hero number** — the mode's score, huge. Beside it: the band label ("Competitive — community-reported") and delta vs. personal best and vs. last 7-session average.
2. **Vitals row** — attempted, correct, wrong, skipped, accuracy %, median latency, throughput/min.
3. **Question review table** — every question: prompt, your answer, correct answer, latency. Wrong answers first, then slowest-correct. Each row shows its skill tag; rows with a mapped technique show a "Learn the trick" link (→ technique page) and a "Drill 10 like this" button (→ instant drill of that pattern, doc 04 §6).
4. **Actions** — `Enter`/button: play again same config; `N`: new config; `D`: dashboard.

Acceptance: results render < 200 ms after session end; review table sortable by latency/correctness; every wrong answer with a mapped technique shows both links.

### 1.4 Personal bests & records

Tracked per (mode, config-hash). A new PB triggers a single tasteful callout on results (no confetti storms; doc 07).

---

## 2. Sprint mode (P0) — the Zetamac core

**Purpose:** frictionless timed practice with scores comparable to community Zetamac benchmarks.

**Defaults (must match Zetamac exactly):**
- Duration 120 s. Score = count of correct answers. Flow input. No penalty.
- Addition: `a + b`, a,b ∈ [2,100]. Subtraction: generated as inverse of addition (answer ≥ 2, never negative). Multiplication: a ∈ [2,12], b ∈ [2,100]. Division: inverse of multiplication (exact). All four enabled.

**Configuration** (persisted as named presets; "Zetamac Default" preset is built-in and immutable):
- Duration: 30 / 60 / 120 / 300 s.
- Toggle each operation; edit operand ranges per operation.
- **Extended content toggles** (off in the default preset): decimals, fractions, percentages, missing-operand, squares. Turning any on flags the session `extended: true` and the results screen notes scores aren't Zetamac-comparable.

**Play screen:** question centered, input beneath, countdown clock top-center (hideable via settings — some users find the clock anxiogenic; score counter top-right, also hideable).

Acceptance:
- With the default preset, question distribution, ranges, and input behavior are indistinguishable from Zetamac (manual side-by-side test).
- From app load, `Enter` twice starts a default sprint (Home focuses the Start button).
- Clock accuracy within ±50 ms over 120 s (doc 08 timing spec).

---

## 3. Firm simulators (P1)

**Purpose:** rehearse the real test's rules, pressure, and scoring — not just its arithmetic.

Built-in sims (parameters from doc 01 research; each sim's lobby cites its rules and labels them community-reported):

| Sim | Questions | Clock | Scoring | Skip | Content profile (doc 04 §5) |
|-----|-----------|-------|---------|------|------------------------------|
| **Optiver-style 80-in-8** | 80 | 8:00 | +1 / −1 | No | `optiver`: integers, decimals, fractions, missing-operand |
| **Flow-style 60-in-6** | 60 | 6:00 | +1 / −1 | No | `flow`: arithmetic-heavy, some decimals |
| **Akuna-style 80-in-8** | 80 | 8:00 | +1 / −1 | — | `optiver` profile |
| **Sequences test** (P2, with Akuna/Flow variants) | 25 | 26:00 / 12:00 | +1 / 0 | Yes | `sequences` |
| **Custom test builder** | 10–120 | 1–30 min | configurable +a/−b | configurable | any profile |

Behavior:
- Test input mode, **no per-question feedback**, no pause. Progress shown as `Q 34/80` plus clock.
- No-skip sims: the only way forward is committing an answer.
- Results hero = **net score** with the firm-appropriate band ("Net 62 · above the community-reported pass bar of ≈56, below competitive ≈70").
- Sim history chart per sim type (doc 05).
- **Full-test honesty:** if the user finishes all questions early, remaining time displays; if the clock ends mid-question, that question logs as unanswered.

Acceptance: rules per table enforced exactly; a finished Optiver sim with 60 right / 12 wrong / 8 unanswered scores net 48; review table available after (real firms don't give this — we do, it's the point of practicing).

---

## 4. Skill drills (P1)

**Purpose:** volume practice on one question family.

- Catalog page lists every skill tag (doc 04 §2) grouped by category, each showing the user's accuracy & median latency on that tag (pulled live from history) — the catalog doubles as a weakness display.
- Config: length (10/25/50 questions or 1/2/5 min), input mode (flow default / test), difficulty tier 1–3 or **Adaptive**.
- **Adaptive difficulty:** maintain a per-tag rating; after each answer adjust target difficulty to keep the user near 80% fast-correct (details doc 04 §7).
- Drills can be launched pre-configured from: technique pages ("Drill this"), results-review rows ("Drill 10 like this"), heatmap cells, and the weakness engine.

Acceptance: a drill launched from technique X generates only questions matching X's drill spec (doc 06 mapping table); catalog stats match dashboard numbers.

---

## 5. Daily challenge (P1)

**Purpose:** consistency habit + a stable day-over-day metric.

- One per calendar day (local time): 120 s sprint, fixed "Daily" config (Zetamac default + none of the extended content), **seeded by date** — seed = `hash("qs-daily-" + YYYY-MM-DD)` — so every user everywhere gets the identical sequence (leaderboard-comparable among friends without any server).
- Playable once; replays allowed but marked unofficial and excluded from daily history.
- **Streak** = consecutive days played (not score-gated). Streak shown on Home; a missed day resets it (one "streak freeze" earned per 7-day streak, auto-applied — cheap kindness, prevents rage-quit on a missed day).
- Daily history chart = the cleanest longitudinal signal in the app (same distribution every day).

Acceptance: same date ⇒ identical question sequence across browsers/machines; second play same day clearly marked unofficial.

---

## 6. Weakness engine — "Fix My Gaps" (P1)

**Purpose:** the headline differentiator; turns history into a prescription.

- **Weak-fact detection** (runs on session end): a *fact* (canonical operand pair per doc 04 §8) is weak if attempts ≥ 3 and (accuracy < 70% **or** median latency > 1.5× the user's overall median for that skill tag).
- **Weak-tag detection:** skill tag with ≥ 20 attempts and accuracy or latency in the user's bottom quartile of tags.
- Surfaces:
  - **Times-table heatmap** (dashboard): 2–20 × 2–20 grid, cells colored by median latency, weak facts outlined; click a cell → 10-question drill of that fact family. Analogous smaller grids for squares and fraction conversions.
  - **"Fix My Gaps" button** (Home + dashboard): builds a 25-question drill drawn 70% from weak facts/tags, 30% random (retrieval variety). Disabled with explainer until ≥ 100 attempts of history exist.
  - Weak facts are auto-enrolled into SRS deck (doc 05 §5).

Acceptance: detection thresholds exactly as above and unit-tested; drill composition 70/30 ± sampling noise; empty-history state explains what will appear here.

---

## 7. Flashcards / SRS (P1)

**Purpose:** move the recall table (doc 01 §5) into instant memory.

- **Decks:** Fraction↔decimal (denominators ≤12, 16, 20); Squares 1–30; Times tables 13–20; Powers of 2 (2¹–2¹²); Complements to 100/1000; auto-deck "My weak facts".
- Leitner 5-box scheduling, intervals [same-day, 1 d, 3 d, 7 d, 21 d] (mechanics doc 05 §5). A card answered correctly **within its target time** (default 3 s) promotes; wrong or slow demotes to box 1.
- Cards use flow-style typed answers (not self-graded reveal — typing is the interview skill).
- Daily review session = all due cards, capped at 40; Home shows due count.

Acceptance: scheduling follows doc 05 §5 exactly; a card answered correctly but in 5 s demotes; due counts correct across midnight boundaries.

---

## 8. Learn — technique library (P1)

**Purpose:** the tips-and-tricks section, structured as an actionable reference. All content in doc 06.

- Index page: techniques grouped by category with a mastery chip per technique (derived from the linked skill tag's stats: —/learning/solid).
- Technique page template: hook line → the method → 3+ worked examples → when-to-use → pitfalls → **"Drill this"** (launches mapped drill) → related techniques.
- Reference pages (tables): fraction↔decimal table, squares, powers of 2, divisibility rules, complements — each with "Turn into flashcards" (enrolls that deck).
- Strategy articles (no drill mapping): negative-marking calculus, pacing, checking tricks, warm-up routine, 8-week plan.
- Content ships as structured markdown/MDX (doc 08) so pages and drill-mappings stay in sync.

Acceptance: every technique with a `drillSpec` in doc 06's mapping table has a working "Drill this" button; mastery chips update after relevant sessions.

---

## 9. Dashboard (P0 skeleton, P1 full)

Full spec in doc 05 §4. Summary of panels: score-over-time (per mode, band-shaded background), accuracy/latency per skill tag, times-table heatmap, calendar consistency heatmap, fatigue curve, personal bests, sim readiness panel ("distance to pass bar").

## 10. Training plan (P2)

- Setup: interview date (optional) + current baseline (auto from history or a calibration sprint) → generates the 8-week arc (doc 01 §3) compressed/stretched to fit: weekly sprint-score targets + a daily menu (2 sprints, 1 targeted drill, SRS review ≈ 12–15 min).
- Home shows today's menu as checkboxes that auto-tick as the sessions complete. Weekly review card: target vs. actual.
- Purely advisory — never blocks any feature.

## 11. Settings (P0)

- **Gameplay:** countdown on/off, clock visible, score visible, sound (key clicks/end buzzer, default off), font size for question (S/M/L/XL), left-handed keypad layout (mobile).
- **Appearance:** theme dark/light/system.
- **Data:** export JSON, import JSON (merge or replace, with preview count), erase all (double-confirm, type "DELETE").
- **About:** benchmark disclaimer, version, credits (Zetamac inspiration acknowledged).

## 12. Onboarding (P1)

First visit only: a single screen — "This trains you for quant trading math tests" + one button: **"Take the 60-second baseline"** (60 s default-ish sprint) → results screen explains bands and points to the training plan. Skippable ("Skip, just let me play"). Never shown again either way.

---

## Feature priority summary

| P0 (M0–M2) | P1 (M3–M5) | P2 (M5–M6) |
|---|---|---|
| Sprint + presets | Firm sims + custom builder | Sequences sim |
| Results screen | Skill drills + adaptive | Training plan |
| Session/attempt logging | Weakness engine + heatmap | Streak freezes |
| Dashboard skeleton | SRS flashcards | Sounds |
| Settings, export/import | Learn library + drill links | PWA install polish |
| | Daily challenge + streaks | Readiness panel |
| | Onboarding | |
