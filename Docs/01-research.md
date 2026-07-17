# 01 — Research: What Quant Interviews Actually Test

Findings from researching quant trading firm assessments (July 2026). This grounds every product decision in the later docs. Numbers marked *community-reported* come from candidate forums and prep sites, not official firm publications — treat as estimates and label them as such in the UI.

---

## 1. The role of mental math in the pipeline

Nearly every market maker and prop trading firm (Optiver, Akuna, Flow Traders, SIG, IMC, DRW, Citadel Securities, Jane Street to a lesser degree) puts a timed numerical screen at the **front** of the hiring process for trading and quant research roles. It's a filter: fail it and nobody ever reads your CV closely. The common shape:

- **60–80 questions in 6–10 minutes** (~6 seconds per question)
- **No calculator, no scratch paper**
- **Negative marking** at most firms: +1 correct / −1 incorrect, unanswered = 0
- Pass bar is *community-reported* around **65–75% net**; above ~85% the test stops being your bottleneck

Speed matters as much as accuracy. At 6s/question you cannot "work out" answers with school algorithms — you need memorized facts plus technique.

## 2. Firm-by-firm formats

| Firm | Format | Scoring | Skip? | Content | Community-reported bar |
|------|--------|---------|-------|---------|------------------------|
| **Optiver** ("80-in-8") | 80 Q / 8 min | +1 / −1 | No — must answer to advance | Integers, decimals, fractions, missing-operand | Pass ≈ 55–60 net; competitive ≈ 70+ |
| **Akuna Capital** | 80 Q / 8 min math **+** 12 min sequences section | +1 / −1 | — | Same as Optiver + number sequences | Competitive ≈ 70+ |
| **Flow Traders** | Math: 60 Q / 6 min (a 75 Q / 10 min variant is also reported). Sequences: 25 Q / 26 min | Negative marking on math | Sequences: yes; math: no | Arithmetic incl. fill-in-blank and MCQ; sequences incl. letters/logic | Competitive ≈ 60%+ net; practice target 80%+ |
| **SIG** | Mental math screen, then a 9 Q / 60 min quantitative test | — | — | Arithmetic screen + expected value, conditional probability, puzzles | — |
| **IMC** | Saville numerical reasoning + "NeurOlympics" (45 min cognitive games) | — | — | Numerical reasoning, memory, reaction | — |
| **Jane Street** | No dedicated speed-arithmetic screen | — | — | Numeracy and estimation woven through interviews: bounding, sanity checks, EV math aloud | — |

Two implications:

1. **One engine, many skins.** The formats differ in count/clock/penalty, not fundamentally in content. A parameterized test engine (question count, time, penalty, skip rules, feedback rules) covers every firm.
2. **Zetamac is necessary but not sufficient.** Zetamac drills integers only. Optiver/Flow/Akuna add decimals, fractions, and missing-operand questions — a trainer must cover these.

## 3. Zetamac: the community benchmark

Zetamac (arithmetic.zetamac.com) is the de-facto standard because it's free, instant, and forum-comparable. Its default game:

- **120 seconds**, score = questions answered correctly (no penalty; you simply can't advance until correct)
- **Addition**: `a + b`, a,b ∈ [2, 100]
- **Subtraction**: inverse of addition problems (so results are always ≥ 2, never negative)
- **Multiplication**: `a × b`, a ∈ [2, 12], b ∈ [2, 100]
- **Division**: inverse of multiplication (always exact)
- **Auto-advance input**: the moment the typed digits equal the correct answer, the next question appears — no Enter key, no wrong-answer state

*Community-reported* score bands at default settings:

| Score | Meaning |
|-------|---------|
| < 30 | Foundation — technique and fact gaps |
| 30–49 | Developing — normal starting range for a STEM student |
| 50–64 | Interview floor — "high 50s would not pose any problem" per forum consensus |
| 65–79 | Competitive for top prop firms |
| 80+ | Elite; the screen is no longer your risk |

Reported training progressions: ~30 → 50 in 3 weeks of daily practice, → 65 by week 6, → 75+ by week 8. This 8-week arc is the skeleton for the app's training-plan feature.

## 4. Question type inventory

Union of types reported across firm tests — this is the target taxonomy for the question engine (formalized in doc 04):

1. **Addition/subtraction** — 2–3 digit, including decimals (`14.7 + 8.86`)
2. **Multiplication** — 1×2, 2×2, 1×3 digit (`47 × 36`), decimal variants (`0.25 × 6.4`)
3. **Division** — exact integer (`391 ÷ 17`), decimal results (`3 ÷ 8`), decimal divisors (`4.2 ÷ 0.7`)
4. **Fractions** — arithmetic (`7/8 − 3/4`), comparison, and **conversion** to decimals/percent (`3/16 = ?`)
5. **Percentages** — `15% of 280`, reverse (`X% of 60 = 21`), percent change
6. **Missing operand** — `17 × ? = 391`, `? − 268 = 173` (a distinct skill: inverse reasoning + last-digit logic)
7. **Squares & powers** — `23²`, powers of 2
8. **Sequences** (Flow/Akuna second section) — arithmetic, geometric, second-difference, interleaved, alternating

## 5. Skills inventory: what must be memorized vs. computed

The 6-second budget divides all knowledge into *recall* (instant) and *technique* (2–5 s):

**Must be pure recall:**
- Times tables to 12×12 absolutely cold; 13–20 strongly beneficial
- Squares 1–25 (through 30 for advanced)
- Fraction ↔ decimal ↔ percent for all fractions with denominator ≤ 12, plus /16 and /20 families (e.g. `7/8 = 0.875`, `1/6 ≈ 0.1667`, `3/16 = 0.1875`)
- Powers of 2 to 2¹²
- Complements to 100 and 1000
- Divisibility rules for 2–11

**Technique-driven (see doc 06 for full content):**
- Left-to-right calculation; compensation (`+ 99` = `+ 100 − 1`)
- 2×2 cross-multiplication; difference of squares (`18 × 22 = 20² − 2²`)
- ×5, ×25, ×50, ×11, ×15, ×9, ×99 shortcuts; doubling–halving
- Percent decomposition (`23% = 20% + 3%`) and commutativity (`8% of 25 = 25% of 8`)
- Division by factoring; converting division to known fractions
- Last-digit and magnitude checks (critical under −1 penalties)
- Missing-operand solving via last-digit modular reasoning

## 6. Strategy findings (feed the Learn section)

- **Negative marking changes optimal play.** At +1/−1, answer only when confidence > 50%. Cheap confidence boosters: last-digit check, order-of-magnitude check, casting out nines.
- **Pacing:** bank easy questions in 2–3 s to buy 10–15 s for hard ones. Never let one question eat 20+ s.
- **No-skip formats (Optiver)** force an answer — estimation + elimination beats blind guessing.
- **Warm-up effect:** candidates report meaningfully higher scores when warmed up ~10 minutes before a real test (one sprint + fact review).
- **Accuracy decays late in a session** — fatigue tracking (first-quartile vs last-quartile accuracy) is a real signal worth surfacing.

## 7. Competitive landscape

| Product | Model | Strengths | Gaps we exploit |
|---------|-------|-----------|-----------------|
| **Zetamac** | Free | Instant, zero friction, the benchmark | Integers only; zero tracking, zero analytics, no learning content |
| **Tradermath.org** | Paid | Firm-specific sims, brainteasers, guides, market-making games | Paywalled; analytics shallow; no technique↔drill loop |
| **RankYourBrain** | Free | Leaderboards | Generic; not interview-shaped |
| **QuantGuide / QuantQuestions / TraderIQ / EverythingQuant tools** | Freemium | Firm sim replicas | Accounts required; light on analytics and learning loop |

**The open niche:** free, local-first, keyboard-fast trainer that (a) keeps Zetamac score comparability, (b) adds firm-accurate sims, (c) closes the loop between *what you got wrong* → *the technique that fixes it* → *a drill of exactly that pattern*, and (d) tracks progress at the per-fact level (nobody surfaces "your 13×17-style facts are 2× slower than your average").

## Sources

- [QuantVault — Optiver 80 in 8](https://quantvault.org/optiver-80-in-8.html) and [Optiver Online Assessment](https://quantvault.org/optiver-online-assessment.html)
- [QuantQuestions — Optiver 80-in-8 Guide](https://www.quantquestions.app/blog/optiver-80-in-8-test-guide) and [Zetamac Speed Training Guide](https://www.quantquestions.app/blog/zetamac-mental-math-guide)
- [WSO — What mental math score is needed for prop trading interviews?](https://www.wallstreetoasis.com/forum/trading/what-mental-math-score-is-needed-for-prop-trading-interviews) and [Optiver 80 in 8 thread](https://www.wallstreetoasis.com/forum/trading/optiver-80-in-8-numerical-test-seems-impossible-is-it-even-possible-to-pass-this-test)
- [TradingInterview — Flow Traders Online Assessment Guide](https://www.tradinginterview.com/flow-traders-online-assessment/)
- [Aptitude Test Prep — Flow Traders Math Test](https://aptitude-test-prep.com/employers/trading-assessments/flow-traders-math-test/)
- [EverythingQuant — Akuna Maths Tool](https://everythingquant.com/online-assessments/akuna-capital-mental-maths-tool/)
- [techinterview.org — Mental Math Drills for Trading Interviews](https://www.techinterview.org/post/3233474557/mental-math-trading-interviews/) and [Jane Street guide](https://www.techinterview.org/companies/jane-street/)
- [SpaceComplexity — Zetamac and Mental Math for Quant Interviews](https://spacecomplexity.ai/blog/zetamac-mental-math-quant-interview)
- [OpenQuant — Mental Math for Quantitative Traders](https://openquant.co/blog/math-for-traders)
- [Tradermath.org](https://www.tradermath.org/) · [RankYourBrain](https://rankyourbrain.net/mental-math) · [QuantGuide Quantify](https://www.quantguide.io/quantify)
