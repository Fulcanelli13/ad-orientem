# Comprehensive Customs Registry — relationship graph and non-merge gate
Date: 23 October 2026. Source: draft PR #1572, based on existing research-master PR #1536.

## Research action completed

This batch reconciled **all 340 nested Handbook source-detail rows**, all **371 provisional practice groups**, all **111 indexed source observations** from Weiser's separate 1956 family customs book, and **53 geographically inventoried custom families**. It deliberately performed **zero automatic identity merges** and created **zero app publications**.

The new work was not a source book re-extraction. It is an exhaustive **relationship-routing pass over current research records** using previously recorded explicit parent IDs, manually proposed identity links, and source-to-master crosswalks. The results do not certify either distinctness or modern practice.

## Full coverage

| Population | Indexed | Relationship disposition | Remains unresolved |
|---|---:|---|---|
| Nested 1958 Handbook source details | **340 / 340** | Every detail has an explicit practice, master or contextual research route | Action-level same-practice/variant review, including 53 details without a group or master candidate |
| Provisional Handbook and historical practice groups | **371 / 371** | 47 have at least one explicit proposed existing-master owner; 324 have none | 371 identities still provisional; 324 lacking owner **does not** establish 324 new unique customs |
| Weiser Family book source observations | **111 / 111** | 49 have at least one candidate group or master relation; 62 have neither | Two books by Weiser cannot supply independent corroboration of one another |
| Existing geographic custom families | **53 / 53** | 23 carry a proposed existing-master owner; 30 lack one | 135 raw geographic attestations have not turned into independently mapped and URL-certified events or present-day observations |
| Co-association pairs among proposed groups | **54** | Each is an explicit same-master or shared-Family-book-source relation | **Zero verified identity equivalences or merges** |

Of 340 detailed Handbook records:
- **218** link to a source that is already in a provisional practice group.
- **24** now have their own early-chapter provisional research group, retained separately.
- **45** link only to an existing master identity candidate.
- **43** link to an unpromoted source-context record.
- **10** are unmatched details already classified as context, variant, other-rite or folklore.
These classifications are exclusive. **242** details have at least one provisional group relation; **71** have at least one master candidate, possibly the same detail. **53** have neither. These three figures must not be summed.

## Why shared source or master does NOT prove duplication

Some original working master identities are umbrella concepts. A source description tied to a broad master may be an independent Catholic custom, a local variant, or only thematically associated.

Examples in the 54 pair-review ledger:
- A Saint Blaise blessed bread practice and the Saint Blaise throat-blessing practice are not interchangeable.
- Holly and poinsettia decorations can appear in one family-book paragraph without becoming one custom.
- A family Easter visit is not automatically the same as an Easter walking pilgrimage.
- Dyeing Easter eggs and gifting Easter eggs are distinct actions even if a later decision groups them under one umbrella family.

The co-association ledger therefore uses **SHARED_OWNER_OR_SOURCE_NOT_PROOF_OF_IDENTITY** throughout. It can accelerate source comparison without authorizing identity contraction.

## Research data committed

1. `data/customs/master/all-340-granular-to-practice-reconciliation.v1.json` — one lossless detail relationship record for each of 340 rows, with exact parent refs.
2. `data/customs/master/371-group-family-geographic-reconciliation.v1.json` — 371 + 111 + 53 relationship records; master-candidate distinctions retained.
3. `data/customs/master/54-coassociation-pairs-nonmerger-review.v1.json` — all explicit shared-owner/shared-witness pair candidates with nonmerger cautions.
4. `data/customs/master/comprehensive-customs-working-catalogue.v1.json` — catalogue updated with references and progress statistics.
5. `tests/customs-full-registry-census.mjs` — 40 new assertions, plus checks that no links point to missing IDs or certify identity equivalence.

## Core totals, interpreted correctly

| Metric | Count |
|---|---:|
| First-pass Handbook source observations | 568 |
| New individually numbered Handbook omissions | 6 |
| Family-book first-pass source observations | 111 |
| Narrower Handbook source-detail rows | 340 |
| **Source/detail research rows** | **1,025** |
| Prior working master identities | 56 |
| Provisional practice leads/groups | 371 |
| **Confirmed number of all distinct customs in the source corpus** | **Undetermined** |
| New app publications | 0 |

## Genuine next gates

1. Move beyond relationship routing to **actual source-passage adjudication** of the 53 no-candidate nested records, the 54 co-association pairs, and candidate owners with wide thematic differences.
2. Maintain a chapter/page verification register for the 1958 Handbook (342 main-text pages), advancing full passage audits systematically. Current 120 source-detail page locations do **not** mean those pages are exhaustively verified.
3. Read the other Weiser precursor books' full texts and additional independent Catholic ethnographic sources when accessible. Bibliographic identification alone is not corpus extraction.
4. Define stable **distinct action identity and named regional-variant identifiers** only with explicit evidence that two reports concern the same performed act, object, time, and geographic/ritual scope; preserve source context and author suggestions as separate record types.
5. Before claiming an exhaustive registry, establish known chapter/page completeness, identity resolution coverage, source provenance, and a clearly isolated exception queue for disputed/folkloric claims. The denominator for **all Catholic customs worldwide** is unknown; any percentage of world completeness would be fictitious.

This is an independent research project. No app Calendar, LIVE/Missal reader, liturgical prayer text, icon, UI, source-of-truth module or production source file has been touched.