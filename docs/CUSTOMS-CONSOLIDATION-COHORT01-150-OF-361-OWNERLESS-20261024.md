# Customs consolidation — Cohort 01: 150 of 361 owner-unresolved groups

Date: 24 October 2026. **Research-only; no new Calendar or Customs Atlas.**

## Why this branch exists
Stop unbounded extraction from Pitrè and convert the already assembled source register into a coherent set of practices inside the **existing** Ad Orientem Calendar. This branch is based on the ongoing Pitrè research PR #1572, and deliberately preserves all prior source observations, 408 provisional group IDs, the 56 identity master, and the 47 earlier owner suggestions.

## Baseline and Cohort 01
- 3,703 *overlapping source/detail observations*, not 3,703 customs.
- 408 provisional identity groups: 308 initial Weiser groups, 39 historical recoveries, 24 unindexed action leads and 37 further gap action leads.
- 47 of the 408 already have an **explicit candidate master-owner suggestion**, not a certified merge; **361 remain owner-unresolved**.
- **150 / 361** owner-unresolved groups now have explicit label-level triage. **211** await this first-pass screening.
- Stratified deterministic coverage: 111 initial Weiser groups, 14 historical, 10 unindexed details and 15 gap details. This is a substantial cross-section, not a statistical random sample and not independent source review.

| Preliminary route | Groups | Evidence requirement |
| --- | ---: | --- |
| Potential action identity or regional variant | 97 | Original action passage, geographically scoped attestations, then owner/deduplication |
| Liturgical/parish boundary | 8 | Distinguish authorized liturgy from optional historical custom |
| Historical context or discontinued practice | 40 | Verify period, cessation, Catholic specificity |
| Other rite/comparative hold | 2 | Confirm rite and avoid universal Roman Rite attribution |
| Folk claim/superstition hold | 3 | Original context and no endorsement |
| **Total** | **150** | **0 new certified identities or mergers** |

73 records have *keyword-only* feast/season signals; these are **not** approved calendar dates. Seven records have lexical similarity to a current master label and 33 to another provisional group label. These are retrieval hints, **not assertions of equivalence**.

## Important existing-master finding
The 56-item working master contains:
- **35** with stored `publication_state=PUBLISHED`;
- **3** with stored `publication_state=CONTEXT_ONLY`;
- **18** with stored `publication_state=NOT_APPROVED`.

All 56 already have source links, structured Calendar pointers and `do_not_auto_publish:true`. The presence of `PUBLISHED` in the working master does **not** prove these items are deployed and visible in the current Calendar. This distinction corrects earlier wave reports saying zero **new** approvals, which should not be mistaken for zero existing records. Runtime parity has not been checked in this cohort.

## Data discipline and source of truth
`data/customs/master/customs-unified-identity-consolidation-cohort01-150.v1.json` preserves each original group ID, source observation IDs, printed-page pointer where available, region, prior-owner status, indicative feast signals, tentative lexical relations and explicit remaining evidence gates. The results are provisional label-level screening: no original Weiser passage was re-read here; no new witness, practice identity or liturgical authorization was certified. All prior input records are unchanged.

`data/customs/master/customs-master56-publication-and-calendar-readiness-audit.v1.json` inventories 56 existing identities without changing their stored approval or publication flags. The attached regression test enforces cardinality, identity preservation, 47 pre-existing explicit owner suggestions and zero newly authorized merges/publications.

## Next meaningful decision, not more observations
1. Finish the remaining 211 owner-unresolved groups in a second high-volume cohort.
2. Combine both 150 + 211 with the pre-existing 47 explicitly related groups and the 56 master identities; use action-level source corroboration and regional distinctions, not word similarity alone, to establish a true consolidated **candidate practice count**.
3. Prioritize source-reading and approval gates for a Calendar pilot: distinguish 1962 ritual directions from voluntary local traditions; verify dates through the existing liturgical calendar resolver.
4. Inspect the **existing** Calendar runtime for the 35 stored published identities before proposing any additions or claiming they are live.

**No customs approved in this cohort; no current runtime modifications; no payment or external communication required.**