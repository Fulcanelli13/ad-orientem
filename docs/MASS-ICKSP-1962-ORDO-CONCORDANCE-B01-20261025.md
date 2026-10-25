# ICKSP 1962 Ordo — first source concordance batch (25 October 2026)

**Status: research-only.** This is a reproducible cue-by-cue comparison against the **main** registry as fetched on 25 October; it neither publishes a new rubric nor asserts full 1962 coverage.

## Why it exists

The ICKSP's Latin–French Ordo presents texts and ceremonial actions in context. Use it as a complementary witness to the *Missale Romanum 1962, Ritus servandus* (the actual normative authority), **not** as a new Mass engine or replacement for the existing 65-card curated LIVE reader.

Sources:
- ICKSP Ordo: https://icrspfrance.fr/textes-liturgiques.php?article=a0003_ancien
- Ritus servandus (translated scan): https://archive.ccwatershed.org/pdfs/5276-ritus-servandus-translated-english/download/

The machine-readable register now includes **existing priest gesture-matrix IDs** alongside the narrower published rubric IDs, so a gesture is not falsely counted as missing merely because it is absent from the 57 published overlay. The register is at `data/mass/icksp-1962-ordo-concordance-b01.v1.json`. It records cue IDs, current published rubrics, actions, gestures, positions and voice states for **26** selectively audited directions. This is a targeted first pass, not all instructions on the ICKSP page.

## Main results

| Category | Number |
|---|---:|
| `REVIEW_ACTOR_CLOCK` | 3 |
| `PRESENT_PUBLISHED` | 7 |
| `PRESENT_OTHER_REGISTRY` | 14 |
| `REVIEW_PUBLISHED_GAP` | 1 |
| `CONDITIONAL_EXISTING` | 1 |

Particularly useful candidates:

1. **C0261 · Placeat tibi** — a strictly source-certified, bilingual presentation-only addendum is staged in [PR #1663](https://github.com/Fulcanelli13/ad-orientem/pull/1663), without changing the frozen 57-event master or 414-row icon crosswalk. Complete quiet prayer, priest station and voice are already present. The rubric overlay does **not** separately publish the initial forward bow with joined hands on the altar, required by Ritus XII.1. The subsequent altar kiss/risal at C0262 and blessing preparation at C0263 are **already published**. Do not infer that the priest omits the prayer from an observer's inability to hear it.
2. **C0038 · Oramus te** — **already registered** in priest gesture matrix as `GM.P.C0038.01`, exactly at `Orámus te`; C0039 separately represents the altar kiss. Its absence from the *narrower 57-published-rubric overlay* is not a missing canonical gesture. Do not duplicate.
3. **Gloria/Credo** — Credo priest bow at C0090 is **already** in gesture-matrix source record `GM.P.C0090.01`, separate from the faithful gesture. Other priest/schola clocks still require cross-checking, even where a priest gesture is missing from the narrower 57-event published overlay. Some sung words belong to the **schola**, while the priest has an independent private recitation; resolve actor and cue timing before release. Do not infer mandatory lay gestures from priest directions.
4. **C0001** — pronunciation/voice for the entrance formula merits form-specific review, because the Sung registry labels it quiet while the ICKSP and Ritus mention a clear voice.
5. **Optional Communion Confiteor** — already in canonical source as an explicit local older custom. UI changes are handled separately in [PR #1653](https://github.com/Fulcanelli13/ad-orientem/pull/1653), which must not be duplicated here.

## Gate before any release

Read corresponding detailed existing registries beyond this snapshot; verify each proposed addition against the primary 1962 rubrics, source actor, form, exact cue and existing approved icon bank. Keep historical/optional rites conditional. Add any *approved* publication in a separate regression-gated change that cannot mutate source text, cue identities, 65 cards or independent priest/schola clocks.

Parallel lanes: [PR #1643](https://github.com/Fulcanelli13/ad-orientem/pull/1643) audits the frozen 57 published rubrics; [PR #1653](https://github.com/Fulcanelli13/ad-orientem/pull/1653) addresses the specific Communion and Placeat display feedback. Neither PR is merged by this research submission.
