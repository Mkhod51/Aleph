# 10 — Naming & General Context

A catch-all orientation doc: what the name means, why it was chosen, and a few small decisions that fell outside the numbered docs but a builder will still need.

---

## 1. What "Aleph" means

**Aleph (א)** is the first letter of the Hebrew and Phoenician alphabets — the common ancestor of Greek *alpha* and Latin *A*.

In mathematics, the **aleph numbers** (ℵ₀, ℵ₁, ℵ₂, …) denote the cardinalities (sizes) of infinite sets, introduced by Georg Cantor in the 1870s–80s. **Aleph-null (ℵ₀)** is the cardinality of the natural numbers — the "smallest" infinity, and the starting point for the rest of Cantor's hierarchy of infinities.

**Pronunciation:** AH-lef (stress on the first syllable; rhymes roughly with "Ralph" without the R).

## 2. Why this name

Zetamac — this product's direct inspiration and the benchmark it stays score-comparable to (docs 01, 02, 03 §2) — isn't a pun or a compound. "Zeta" references the Riemann zeta function, an obscure real math term almost nobody consciously registers on first use; "mac" is a short, familiar, throwaway-sounding suffix. The combination works *because* it doesn't explain itself: it's ownable and memorable rather than descriptive, and it rewards the rare person who looks it up without requiring anyone else to.

"Aleph" follows the same rule: a real, technical, quietly resonant term that doesn't spell out "math practice site for traders" the way a compound like "TickMath" or the original working title "QuantSprint" did. It also fits the product's tone — terse, factual, unhyped (doc 07 §8) — better than anything overtly gamified or punny.

**Runner-up considered:** *Surd* (an irrational root, e.g. √2) — shorter and blunter, but "Aleph" was preferred for its connotation of boundlessness (there's no ceiling on how fast a person can get) and because it reads more naturally as a proper noun / wordmark.

**Rejected direction:** descriptive or pun-based names generated earlier in the naming process (Tickspeed, Sharpe, Quickdraw, Clockspeed, NetScore, SixSeconds, etc.) — all legible immediately, but for that same reason indistinguishable from any other "speed math app," which is the opposite of what makes Zetamac's name durable.

## 3. Naming caveats

- **"Aleph" is not exclusive.** It's a common word used elsewhere in tech, finance, and publishing (e.g. unrelated products and companies have used "Aleph" or "Aleph-" prefixes in blockchain, 3D printing, and other spaces). Before any public launch, verify trademark status and domain availability (this research did not reserve or confirm any domain). This extends the same caution already flagged in doc 02 §Naming for the original working title.
- Per doc 00's decision log item 1 (unchanged): nothing in code should hard-code the product name outside a single branding constant — this makes any future rename, including away from "Aleph" if a conflict turns up, a one-line change.

## 4. Suggested identifiers (previously left open)

- **Repo name:** `aleph` (fall back to `aleph-quant` or similar if `aleph` is unavailable on GitHub/npm — check first).
- **Brand constant:** `APP_NAME = "Aleph"` — the single source referenced by doc 00's decision log.
- **Wordmark direction (suggestion, not a spec):** the glyph א itself, or an abstracted ℵ₀, is a strong, simple mark and ties naturally to the "no ceiling" idea behind the name. Doc 07's mockups currently use a generic ◆ placeholder in the top bar (07 §4) — a later design pass can replace it. This does not change any token or component spec in doc 07.

## 5. Other missing context

A few small gaps noticed while assembling the doc set, none blocking for M0–M2 but worth deciding before a public launch:

- **License:** not yet chosen for the project's own code (distinct from the Zetamac-inspiration credit already required on the About page per docs 03 §11 and 08 §7). MIT is the sane default for an open personal tool; pick one before making the repo public.
- **Browser support:** no explicit matrix exists elsewhere. Default assumption for an implementing agent: latest two versions of evergreen browsers (Chrome, Firefox, Safari, Edge) with IndexedDB and `requestAnimationFrame` support; no legacy/IE support, consistent with the PWA/offline requirements in doc 08.
- **Tagline:** none specified yet. A candidate consistent with the microcopy tone in doc 07 §8: *"Arithmetic, at trading speed."* Optional — not required for any milestone in doc 09.
- **Repo status:** as of this writing, this design proposal lives at `Career/Projects/Quant/DesignProposal/` outside any git repository. Doc 00's "How to use these docs" §1 already instructs copying it into a fresh repo as `docs/` — no change needed, just noting that step hasn't happened yet.
