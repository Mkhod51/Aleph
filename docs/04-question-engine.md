# 04 — Question Engine Specification

The engine is a **pure TypeScript module** (`src/engine/`) with zero DOM or React dependencies: given a config and a seed, it deterministically produces questions, validates answers, and scores sessions. Everything here is unit-testable and unit-tested (§10).

---

## 1. Core types

```ts
export type SkillTag =
  | 'ADD_2D' | 'ADD_3D' | 'ADD_DEC'
  | 'SUB_2D' | 'SUB_3D' | 'SUB_DEC'
  | 'MUL_1x1' | 'MUL_1x2' | 'MUL_1x3' | 'MUL_2x2' | 'MUL_DEC'
  | 'DIV_EXACT' | 'DIV_TO_DEC' | 'DIV_DEC'
  | 'FRAC_ADD' | 'FRAC_MUL' | 'FRAC_TO_DEC' | 'FRAC_COMPARE'
  | 'PCT_OF' | 'PCT_REVERSE' | 'PCT_CHANGE'
  | 'MISSING_ADD' | 'MISSING_MUL'
  | 'SQUARE' | 'POW2'
  | 'SEQ_ARITH' | 'SEQ_GEO' | 'SEQ_DIFF2' | 'SEQ_INTERLEAVED' | 'SEQ_ALTSIGN';

export type AnswerFormat = 'integer' | 'decimal' | 'fraction' | 'multi'; // 'multi' = fraction OR decimal accepted

export interface Question {
  skill: SkillTag;
  prompt: string;            // display string, e.g. "47 × 36" or "17 × ⬚ = 391"
  operands: number[];        // raw operands for fact-tracking (see §8)
  answer: Canonical;         // see §6
  format: AnswerFormat;
  difficulty: number;        // §7, computed at generation
  factKey: string | null;    // §8; null when not a trackable fact
}

export interface Canonical {
  value: number;             // exact numeric value (fractions stored as value + parts)
  display: string;           // canonical display, e.g. "0.375" or "3/8"
  fraction?: { num: number; den: number };  // lowest terms, when format allows fraction input
}

export interface GeneratorConfig { /* per-tag min/max ranges, decimal places, denominators, tiers */ }

export interface SessionPlan {
  seed: number;
  profile: ProfileId | WeightMap;   // §5
  generatorConfigs: Partial<Record<SkillTag, GeneratorConfig>>;
  count?: number;                   // sims/drills: fixed count; sprints: unlimited stream
}
```

The engine exposes:

```ts
createQuestionStream(plan: SessionPlan): { next(): Question }   // deterministic given seed
validate(q: Question, raw: string): { correct: boolean; normalized: string }
matchesLive(q: Question, raw: string): boolean                  // flow-input per-keystroke check
scoreSession(mode: ScoringRule, attempts: AttemptLite[]): Score
```

## 2. PRNG and seeding

- **mulberry32** (32-bit, tiny, fast, good enough for this domain). Implement once in `lib/prng.ts` with `split(seed, label)` → child seed via string hash (xmur3), so subsystems (question order, operand choice) draw independently.
- Session seeds: random 32-bit by default; **daily challenge** seed = `xmur3("qs-daily-" + YYYY-MM-DD)`.
- Determinism contract: same `SessionPlan` ⇒ identical question sequence, forever. Generator changes that would break this bump a `engineVersion` stored on sessions (protects replay/compare semantics).

## 3. Generators — per-tag specification

Every generator must satisfy: (a) answer computable exactly (no float error — use integer math scaled by powers of 10; fractions via num/den ints); (b) configured ranges respected; (c) degenerate questions excluded (`×1`, `×10`, `+0`, `a−a`, division by 1) unless the config explicitly allows; (d) results within answer-length limits (≤ 7 characters typed) to keep the typing cost fair.

| Tag | Generation rule (defaults; tiers in §7) | Answer format |
|-----|------------------------------------------|---------------|
| `ADD_2D` | a,b ∈ [2,100] (Zetamac default) | integer |
| `ADD_3D` | a,b ∈ [100,999] | integer |
| `ADD_DEC` | a,b ∈ [1,100] with 1–2 dp, dp-aligned exact sum | decimal |
| `SUB_*` | generate the matching ADD pair, present `sum − a = b` (never negative) | integer/decimal |
| `MUL_1x2` | a ∈ [2,12], b ∈ [2,100] (Zetamac default) | integer |
| `MUL_2x2` | a,b ∈ [13,99], excluding pairs where either ends in 0 (tier-1 allows them) | integer |
| `MUL_1x3` | a ∈ [3,9], b ∈ [101,999] | integer |
| `MUL_DEC` | int×dec or dec×dec, total dp ≤ 2, factors from MUL_1x2 tables scaled by 10⁻¹/10⁻² | decimal |
| `DIV_EXACT` | inverse of an enabled MUL tag: pick product, ask `product ÷ a` | integer |
| `DIV_TO_DEC` | a ÷ b where b ∈ {2,4,5,8,10,16,20,25,50} and result has ≤ 4 dp (e.g. `7 ÷ 8`) | decimal |
| `DIV_DEC` | scaled exact division, e.g. `4.2 ÷ 0.7` | integer/decimal |
| `FRAC_ADD` | denominators from {2..12,16}, lcm ≤ 48, proper or mixed result | multi |
| `FRAC_MUL` | product in lowest terms has den ≤ 20 | multi |
| `FRAC_TO_DEC` | n/d from the memorization table (doc 06 §R1), terminating or 4-dp-rounded (repeating marked "≈, 4 dp") | decimal |
| `FRAC_COMPARE` | "Which is larger?" — two fractions, cross-multiplication gap ≥ 5% (no coin-flips) | choice (1/2 key) |
| `PCT_OF` | p ∈ {5,10,15,…,95} ∪ [2,99] by tier, of b ∈ [20,400]; exact answers ≤ 2 dp | decimal |
| `PCT_REVERSE` | "⬚% of b = c" with integer answer | integer |
| `PCT_CHANGE` | old,new ∈ [20,500], change a "clean" % (±5% steps at tier ≤2) | decimal |
| `MISSING_ADD` | `a + ⬚ = s` / `⬚ − b = c` from ADD ranges | integer |
| `MISSING_MUL` | `a × ⬚ = p` from MUL ranges (last-digit-solvable; the technique doc 06 T14 teaches this) | integer |
| `SQUARE` | n ∈ [11,30] (tier 1: [11,20]) | integer |
| `POW2` | 2^n, n ∈ [4,12] | integer |
| `SEQ_*` | 5–7 shown terms, one blank at end (or middle, tier 3); families: arithmetic (±d), geometric (×r, r ∈ {2,3,½}), second-difference (quadratic), interleaved (two alternating simple sequences), alternating-sign | integer |

Sequence generators must verify uniqueness: the hidden term must be forced by the shown terms under the family's rule and not ambiguous across families at tier ≥2 (test: run all family solvers, exactly one fits).

## 4. Anti-repeat

Within a session, maintain a sliding window of the last 8 `factKey`s (or prompt hashes when factKey is null); a generated question colliding with the window is regenerated (max 5 retries, then accept — tiny ranges shouldn't deadlock). Deterministic: retries consume PRNG draws, preserving reproducibility.

## 5. Distribution profiles

A profile is a weight map over skill tags; the stream picks each question's tag by weighted draw (seeded). Built-ins:

| Profile | Weights |
|---------|---------|
| `zetamac` | ADD_2D 25, SUB_2D 25, MUL_1x2 25, DIV_EXACT 25 (respecting per-op toggles) |
| `optiver` | ADD_2D 10, ADD_3D 8, SUB_2D 8, SUB_3D 6, MUL_1x2 12, MUL_2x2 8, DIV_EXACT 10, ADD_DEC 8, MUL_DEC 6, DIV_TO_DEC 6, FRAC_ADD 5, FRAC_TO_DEC 5, PCT_OF 4, MISSING_ADD 2, MISSING_MUL 2 |
| `flow` | ADD_2D 15, ADD_3D 10, SUB_2D 12, SUB_3D 8, MUL_1x2 15, MUL_2x2 10, DIV_EXACT 12, ADD_DEC 8, MUL_DEC 5, PCT_OF 5 |
| `sequences` | SEQ_ARITH 25, SEQ_GEO 20, SEQ_DIFF2 25, SEQ_INTERLEAVED 20, SEQ_ALTSIGN 10 |
| `drill:<TAG>` | 100% one tag |

Profiles are data, not code — custom test builder edits a weight map. (Exact firm mixes are unknown; these are our best reconstruction from candidate reports. Keep them in one editable constants file, commented as estimates.)

## 6. Answer validation & normalization

Live matching (flow input) and committed grading (test input) share one normalizer:

- Strip whitespace. Accept leading `-`. Accept `.5` ≡ `0.5`. Ignore trailing `.` while typing (live mode treats `12.` as prefix of `12.5`, not as `12`).
- **Decimal answers:** numeric equality against canonical value; trailing zeros OK (`0.50` ✓). For "≈ 4 dp" questions (repeating decimals), accept the canonically rounded 4-dp string and 2-dp string (`0.1667` or `0.17` for 1/6); the prompt states "2+ dp".
- **`multi` format (fractions):** accept the exact decimal, any unreduced equivalent fraction (`6/8` for `3/4` — correct is correct; results screen nudges "reduce for speed"), or mixed-number `1 3/4` syntax.
- **Live-match subtlety (flow input):** advance only when input is *exactly* the canonical value and **could not be a prefix of a longer valid different answer the user may intend**. Rule: for integer answers, advance on numeric match (Zetamac behavior — worked because answers are unambiguous when complete; `39` for answer `391` doesn't match). For decimal/fraction answers in flow mode, require the full canonical string match. Unit-test the prefix edge cases (`0.5` vs `0.55`).
- `FRAC_COMPARE` and future MCQ: keys `1`/`2` answer directly.

## 7. Difficulty model

Two uses: tiering generator configs, and adaptive drills.

**Static difficulty score** per question, computed at generation: base = digit count of operands + answer; +1 per carry/borrow in the natural left-to-right execution; +1 if any operand is "unround" (not ending in 0/5); +2 for 2×2 mult with both operands unround; +1 per dp of decimals; fractions: +lcm-complexity. Range roughly 1–12. Store on the question; log with the attempt (enables "your accuracy vs difficulty" analytics).

**Tiers:** each generator maps tier 1/2/3 to range configs (tier 1 ≈ difficulty 1–4, tier 2 ≈ 4–7, tier 3 ≈ 7+). Documented per generator in code.

**Adaptive drills:** per-tag rating r ∈ [1,3] (float, start 1.5). After each answer: fast-correct (< tag target time) → r += 0.08; slow-correct → r += 0.02; wrong → r −= 0.15. Clamp [1,3]. Generate at tier round(r). Target times per tag family: ADD/SUB 4 s, MUL_1x2/DIV 5 s, MUL_2x2 8 s, FRAC/PCT 6 s, recall tags (SQUARE, FRAC_TO_DEC, POW2) 3 s.

## 8. Fact canonicalization (feeds the weakness engine)

`factKey` identifies the *recallable fact* under a question, so stats accumulate across question forms:

- Multiplication/division/missing-mul: `mul:min×max` of the core pair (`48 ÷ 6` and `6 × 48` and `6 × ⬚ = 288` all → `mul:6×48`). Only when both operands ≤ 20 (beyond that it's technique, not recall) — else null.
- Squares: `sq:n`. Powers: `pow2:n`. Fraction conversions: `frac:n/d` (lowest terms). Complements: `comp100:n` / `comp1000:n`.
- Addition/subtraction and multi-step questions: null (technique-driven; tracked at tag level only).

## 9. Scoring rules

```ts
type ScoringRule =
  | { kind: 'count' }                          // sprints, drills: # correct
  | { kind: 'net'; plus: number; minus: number }  // sims: +plus per correct, −minus per wrong, 0 skipped
```
`scoreSession` also returns the vitals bundle (attempted/correct/wrong/skipped, accuracy, median & p90 latency, throughput) so results screens and the dashboard share one implementation.

## 10. Test requirements (Vitest)

1. **Determinism:** same plan+seed twice ⇒ identical 500-question sequences; different seeds ⇒ different.
2. **Property tests per generator** (≥ 500 samples each): ranges respected; answers exact; no degenerates; SUB never negative; DIV_EXACT remainder-free; FRAC answers in lowest terms; sequence uniqueness check passes.
3. **Distribution:** 10 000 draws from each profile ⇒ per-tag frequencies within ±2 percentage points of weights.
4. **Validation table tests:** the full normalizer edge-case list in §6 (each bullet becomes cases), incl. flow-input prefix rules.
5. **Scoring:** net-score cases including all-skip, all-wrong; vitals formulas vs hand-computed fixtures.
6. **Difficulty:** monotonic on constructed easy<hard pairs; adaptive rating trajectory on scripted answer streams.
7. **Anti-repeat:** no factKey within window of 8 across 1 000 generated questions on a wide config.
