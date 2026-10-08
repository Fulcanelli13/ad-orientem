# Formation / Apologetics / Church Crisis — forensic recovery register v1
**Date:** 8 October 2026 · **Base main:** `4d3d0b4a93fe103a7919754652d4fc9b36677df5`  
**Status:** AUDIT ONLY · no published runtime/navigation changes

## Audit result
| Corpus | Expected legacy ID positions | Exact individual original question preserved in this register | Evidence status |
|---|---:|---:|---|
| Apologetics A001–A318 | 318 | **0 demonstrated** | A001–075: 3 × 25 thematic bands; A076–250: 175 IDs missing stable per-question source; A251–318: 68 IDs with contested numbering |
| Church Crisis C001–C233 | 233 | **0 demonstrated** | 26 mapping bands cover 233 IDs, but band coverage is **not** preservation of 233 original question texts |
| TLM001–TLM075 objections | 75 | 25 verbatim English question records (TLM026–050) | 15 normalized English (051–065), 10 bilingual drafts (066–075), 25 exact originals missing (001–025) |
| BAQ supplement | 26 | 26 indexed research questions | 22 substantive answer drafts, all currently unpublished |
| Canonical navigation | 60 APOL + 81 CR | 141 navigation dossiers | Freezes scope; neither complete module is published |

**No defensible total for unique original questions:** multiple legacy banks and the canonical dossiers overlap. Counts above measure evidence and record shape, not independently completed publication-quality questions.

## Recovered research beyond the legacy series
- [Contemporary reconciliation](https://github.com/Fulcanelli13/ad-orientem/blob/main/data/learn/contemporary-controversies-reconciliation.v1.json): 43 reconciled topic/dossier rows, not all drafted as finished debates.
- [Contemporary source pack batch 1](https://github.com/Fulcanelli13/ad-orientem/blob/main/data/learn/contemporary-controversies-source-pack.v1.json) and [batch 2](https://github.com/Fulcanelli13/ad-orientem/blob/main/data/learn/contemporary-controversies-batch2-source-pack.v1.json): 6 + 12 source-linked case records, unpublished.
- [Sedevacantism/preconciliar debates](https://github.com/Fulcanelli13/ad-orientem/blob/main/data/learn/sedevacantism-preconciliar-debates.v1.json): 8 drafted debates, unpublished.
- [Traditionis custodes debates](https://github.com/Fulcanelli13/ad-orientem/blob/main/data/learn/traditionis-custodes-debates.v1.json): 10 bilingual debates, **already counted among TLM066–075**.
- [Biblical/patristic questions](https://github.com/Fulcanelli13/ad-orientem/blob/main/data/learn/biblical-patristic-and-sedevacantist-question-supplement.v1.json): 26 indexed; [answers](https://github.com/Fulcanelli13/ad-orientem/blob/main/data/learn/biblical-patristic-answers.v1.json) contain 22 drafts.
- Sexual Ethics: 150 live questions remain independently under `src/learn/sexual-ethics-data/` with 55 deeper debates. This corpus must not be merged away.

## Risk classification
1. **Critical — source recovery:** A076–318 (175 no stable register plus 68 conflicted numbering), TLM001–025 exact originals. Search earlier conversations, uploaded question banks, previous PR branches and historical files. **Do not regenerate missing words and call that recovery.**
2. **High — historical question text:** A001–075 and C001–233 need verified per-question original text, citation ancestry and individual canonical owner matching. Band-mapping alone is inadequate.
3. **High — unpublished substantial content:** 60 APOL/81 CR navigation dossiers do not constitute released sourced articles; BAQ, sedevacantism, contemporary cases and TLM objections require editorial verification and French/English parity.
4. **Medium — UI/QA:** keep compact dossier navigation but expose all **proven** distinct subsidiary questions below their existing owners, searchable by legacy ID and question wording.
5. **Separate workstream:** examine archive-vs-runtime Customs Atlas and Calendar research before asserting worldwide/map coverage complete; do not blend geographical attestation counts with the Formation totals.

## Separate Customs Atlas archival delta (not counted as Formation questions)
The prior user-file archive includes `Ad_Orientem_SOT-07_Traditional_Catholic_Customary_French_World_v1.xlsx` (**63** research customs/rules) and `Ad_Orientem_SOT-07G_Geographic_Customary_Atlas_v1.6.xlsx` (**62** custom families, **69** named complexes, **216** geographical attestations). The current GitHub `data/customs/customs-atlas-seed.v1.json` has **13** customs and **71** attestations. The user-file Atlas has a worldwide/directory-driven evidence gate, whereas the SOT-07 customary authority layer has a French-world relevance gate; the GitHub production-seed has its own promotion policy. Accordingly **216 minus 71 is not a verified count of missing records**. Perform a distinct row-by-row SOT-07G-v1.6 → GitHub Customs Atlas reconciliation before calling the map/calendar research fully integrated. Do not replace the 13 active seed customs with 62 family labels without classifying the identity differences.

## Acceptance policy
A record can be `RECOVERED_VERBATIM` only with a stable original question text and provenance. `RECOVERED_NORMALIZED` must be explicitly named as such and linked to evidence. A band-level topical summary remains `BAND_ONLY`; no per-ID owner is certified by association alone.

A publishable dossier requires a sourced question/provenance, sourced short answer, properly attributed opposing arguments, sourced rebuttal and substantive traditional Catholic argument, precise primary links in every substantive paragraph, English/French parity, and a usable app route. These conditions apply also to paragraph-level traditional commentary, not merely footnotes in a drawer.

## Publication/recovery order
**Batch R1:** recover A-series and TLM001–025 exact text using historical sources; mark unmatched without fabricating.  
**Batch R2:** recover C-series original question-level wording and match each individually to its existing `CR-*` dossier, retaining nonduplicate variations and attributed views.  
**Batch R3:** audit 18 contemporary cases, 8 sedevacantism debates, BAQ 26/22 and TLM 50 for paragraph citations, attribution, French parity and missing answers.  
**Batch R4:** produce user-facing Apologetics and Church Crisis navigation with subsidiary question search and regression acceptance. No new canonical owners unless the source evidence demonstrates an actual uncovered controversy.

## Evidence locations
- [A-series reconciliation](https://github.com/Fulcanelli13/ad-orientem/blob/main/data/learn/apologetics-reconciliation.v1.json)
- [C-series reconciliation](https://github.com/Fulcanelli13/ad-orientem/blob/main/data/learn/church-crisis-reconciliation.v1.json)
- [TLM register](https://github.com/Fulcanelli13/ad-orientem/blob/main/data/learn/traditional-mass-objections-reconciliation.v1.json)
- [60 APOL dossiers](https://github.com/Fulcanelli13/ad-orientem/blob/main/data/learn/apologetics-canonical.v1.json)
- [81 CR dossiers](https://github.com/Fulcanelli13/ad-orientem/blob/main/data/learn/church-crisis-canonical.v1.json)
- [Content ownership policy](https://github.com/Fulcanelli13/ad-orientem/blob/main/data/learn/content-ownership-registry.v1.json)

**Machine register:** `data/learn/forensic-recovery-register-2026-10-08.v1.json` contains one explicit audit row for every A001–318, C001–233 and TLM001–075 ID, the 26 BAQ research questions, the 141 canonical navigation dossiers and cross-referenced source-bank counts. This register is diagnostic, not a reconstruction of missing originals.
