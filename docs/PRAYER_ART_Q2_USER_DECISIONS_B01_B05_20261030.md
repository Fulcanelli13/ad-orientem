# Sacred Art Q2: human Prayer placement decisions (Batches 01–05)

## Ingested and validated

- 250/548 unique physical-artwork records reviewed. 114 accepted for **Prayer placement**; 136 marked **not relevant to Prayer only**. These are not global art-gallery rejections and do not change Calendar/Bible eligibility.
- 310 original checked placement edges preserved: 306 selected active, 2 disabled under explicit Prayer rejection and 2 held under written-scope limits.
- 28 verbatim placement instructions converted into typed semantic requests without guessing module-specific IDs.
- Identical duplicate of Batch 03 ignored; exact source gallery blob SHA and original order checked.
- 14 accepted paintings have no original checked slot, but their written instructions remain actionable and cannot be interpreted as rejection.

## Specific interpretation safeguards

- Rubens's Resurrection #9: user explicitly restricts to **Regina Caeli (not Angelus outside Easter)** and Resurrection mystery in Rosary. Two inconsistent checked slots held, not deleted; only three others active.
- The user says Saint Jerome Writing belongs to Scripture reading rather than Prayer; retain cross-module request without inventing a Prayer slot.
- 'Not relevant' is Prayer-only for #98 and #110 even though they retain checked Litany slot IDs in raw export; inactive for staging.
- Rosary comments for Visitation, Nativity, Coronation, Baptism and Institution of Eucharist are source-owned instructions; resolve actual liturgical/mystery registry identity rather than fabricate 1962 Rosary step IDs.
- Cross-module Holy Saturday and Easter Vigil suggestions are preserved as **Calendar candidate hints**, not changes to already approved calendar heroes.
- A painting can validly appear in multiple slots. Do not auto-collapse distinct physical asset IDs (including the Rubens Resurrection aliases) without independent asset identity evidence.
- Selection is distinct from photo-rights/reuse approval, file resolution, image quality, alt text and publishing.

## Current state

This is an auditable research-stage ledger in `research/prayer-q2-editorial-decisions-b01-b05-20261030`. Do not merge into live app automatically. Batches 06–11 still awaiting user decisions, and semantic notes require exact stable slot mapping before production. User can continue reviewing other batches independently.

## Warning details

- #9: NATURAL_LANGUAGE_SCOPE_OVERRIDE (STG-pray.angelus-09, COV-foundations_apostles_creed)
- #98: REJECTED_ARTWORK_HAS_SELECTED_SLOTS_IGNORED_FOR_ACTIVE_PLACEMENTS (STG-pray.litany_saints-04)
- #110: REJECTED_ARTWORK_HAS_SELECTED_SLOTS_IGNORED_FOR_ACTIVE_PLACEMENTS (STG-pray.litany_saints-05)
