# 02 — Product Vision

## Problem statement

Quant trading candidates must pass a brutal timed arithmetic screen before anyone reads their CV. The standard free tool (Zetamac) drills only integer arithmetic, remembers nothing about you, and teaches nothing. Paid alternatives are paywalled and still don't close the loop between *missing a question*, *learning the technique that fixes it*, and *drilling exactly that pattern*. Candidates grind blind: they repeat sprints without knowing which specific facts and question families are costing them points.

## One-line pitch

**Zetamac with a memory and a coach:** the same frictionless timed drills, plus firm-accurate simulators, per-fact weakness analytics, and a technique library where every tip is one keypress away from a drill that trains it.

## Target user

Primary persona (build for this person; everything else is secondary):

**The candidate on the clock.** STEM student or early-career engineer, 4–10 weeks from quant trading/research interviews. Currently scores 25–50 on Zetamac default; needs 65+. Practices in 10–20 minute bursts between other work, mostly on a laptop with a keyboard. Motivated but efficiency-obsessed — will abandon any tool that wastes taps or hides the number that matters.

Secondary personas:
- **The maintainer:** landed at 75+, keeps a 5-min daily streak to stay sharp before final rounds.
- **The starter:** just learned these tests exist; needs orientation ("what's tested? what's a good score?") before drilling.

## Product principles

Ordered — when two conflict, the earlier one wins:

1. **Two keys to the first question.** From page load, starting the default sprint takes at most two keystrokes/clicks. Zetamac's genius is zero friction; never regress from it.
2. **Comparable numbers.** Sprint scores at default settings must mean exactly what a Zetamac score means. Sims must replicate real rules (count, clock, penalty, no-skip). A score users can't compare or trust is worthless.
3. **Silence during, depth after.** The play screen shows the question, the input, the clock — nothing else. All analysis waits for the results screen.
4. **Every miss has a next action.** A wrong or slow answer is never a dead end: the results screen links it to the technique that fixes it and a drill of that exact pattern.
5. **Keyboard is the instrument.** Every core flow is playable without touching the mouse. Input latency is imperceptible (<30 ms).
6. **Own your data.** Local-first, no account, no tracking. One-click JSON export/import. The user's practice history is theirs.
7. **Honest numbers.** Benchmark bands are labeled community-reported. No fake precision, no gamified inflation of progress.

## What this product is NOT (v1 scope fences)

- Not a full interview-prep platform: no brainteasers, no probability puzzles, no market-making games, no OCaml. Arithmetic + sequences only. (The architecture shouldn't preclude these later; the roadmap must not include them.)
- No accounts, no server, no leaderboards in v1. (Daily challenge uses a deterministic shared seed instead — same questions for everyone without a backend.)
- Not a math course for children — no lessons on *what* multiplication is; only speed technique for people who already know arithmetic.
- No native mobile apps. Responsive PWA only.

## Differentiators (ranked)

1. **Weakness engine** — per-fact latency/accuracy tracking, times-table heatmap, auto-generated "Fix My Gaps" drills. *(No competitor does this.)*
2. **Technique ↔ drill closed loop** — every Learn page has "Drill this now"; every missed question links back to its technique.
3. **Firm sims with honest rules** — Optiver/Flow/Akuna presets with real scoring, plus a custom builder; results in the firm's own terms ("net 62 — above the community-reported pass bar").
4. **Zetamac-comparable sprint** — drop-in replacement, scores transfer.
5. **SRS fact trainer** — Leitner-box flashcards for the recall table (fractions, squares, big times tables), seeded automatically from your observed weak facts.
6. **8-week training plan** — the research-backed 30→75 progression turned into a weekly schedule with targets.
7. **Free, local, offline** — PWA that works on a plane.

## Success metrics (personal-tool framing)

- **Primary:** user's rolling-7-session sprint average crosses their target band (e.g. 65) before their interview date.
- Session starts per week ≥ 5 (habit formed); median session length 5–15 min.
- Weakness engine efficacy: facts flagged weak show ≥ 30% latency reduction after 2 weeks of targeted drilling.
- Time-to-first-question from cold load < 3 s including page load.

## Naming

Working title **Aleph**. Alternatives if a rename is wanted: TickMath, SixSeconds, NetScore, MakeMarket Math. Verify domain availability before committing; nothing in the codebase should hard-code the name outside one config constant.
