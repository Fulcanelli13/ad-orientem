# ICRSP — B28 consolidated editorial programme checkpoint

**26 October 2026** · [PR #1666](https://github.com/Fulcanelli13/ad-orientem/pull/1666) · Research-only checkpoint, preserving existing Ad Orientem Calendar, Saints, Mass Explorer, Customs, Scripture correspondences, and Mass reader owners.

## Exact-count programme ledger

| Coverage metric | Number | Permitted meaning |
|---|---:|---|
| ICRSP website articles structurally inventoried | 855 / 855 | Identity census, not explanatory readiness |
| Source articles with commentary structure | 783 | Across 2,856 website-labelled panels |
| Original article bodies automatically topic/hash screened (B21+B23) | 373 / 783 | Screening only; not original-work verification |
| **Distinct articles with at least one direct source-topic excerpt examined** | **363 / 783 (46.4%)** | Exact union of eight research workstreams |
| **Without first direct topic reading** | **420 / 783** | Across whole source index, including areas outside B23 queue |
| B20's separate selected article cohort with a directly inspected excerpt | **160 / 160** | B20 10 + B21 10 + B22 11 + B26 20 + B27 47 + B28 62; not all commentary author panels |
| Original B23 source-body tranche | 233 | 20 B23 + 25 B24 + 75 B25 + 28 B27 article passes, four additional older B22 repeats excluded in latest queue |
| B23 truly unread IDs after fresh B27 review | **81** | Of 109 reconciled sources, 28 newly reviewed |
| Exact distinct research passes versus repeated IDs | **370 passes / 7 repeats** | 363 unique articles |
| Original author printed editions critically collated and rights-cleared explanations promoted | **0** | Not user-visible release material |
| Actual production Calendar/reader/source-text changes in this programme | **0** | Research records, reports, tests only |

For global counting, use the **[B28 363-record reconciliation ledger](../../data/source-text/icrsp-france-b28-eight-stream-363-unique-topic-ledger.v1.json)**. The prior [B27 seven-cohort 301-record ledger](../../data/source-text/icrsp-france-b27-seven-stream-301-unique-direct-topic-ledger.v1.json) remains a historical *snapshot* before the parallel final 62 reviews, not the current programme total. Neither should be summed with its predecessor.

### Important programme boundaries

1. B20's selected 160-page cohort is now wholly represented by *at least one actual source-page excerpt read*. Exact roster: B20 10, B21 10, B22 selected 11, B26 20, B27-other 47, B28-other 62. Check [B20 source selection](../../data/source-text/icrsp-france-b20-sanctoral-temporal-160-content-selection.v1.json), [B21 ten](../../data/source-text/icrsp-france-b21-ten-additional-commentary-claim-leads.v1.json), [B22 selected](../../data/source-text/icrsp-france-b22-relevance-exceptions-and-existing-owner-editorial-drafts.v1.json), [B26 20](../../data/source-text/icrsp-france-b26-twenty-direct-page-content-and-two-source-errors.v1.json), [B27 47](../../data/source-text/icrsp-france-b27-47-source-paragraphs-and-owner-holds.v1.json) and [B28 remaining 62](../../data/source-text/icrsp-france-b28-last62-complete-selected-excerpt-review.v1.json).
2. The separate B23 233-page body scan and first-reading editorial queue has **81** actually unread article IDs following B27. All 81 must again be checked against future B21/B23 parallel edits before another direct pass; do not relaunch the old 100-page queue.
3. The **28 newly read** B27-B23 topics and 12 narrowly scoped owner checks are preserved in [B27 source observations](../../data/source-text/icrsp-france-b27-28-direct-source-topic-readings.v1.json) and [owner comparison + two unpublished bilingual explanatory pilots](../../data/source-text/icrsp-france-b27-12-scoped-owner-parity-and-two-drafts.v1.json). The candidate In Albis and Sacred Heart explanations are not licensed commentary quotations and are not app releases.

### Important quality and relevance findings

**True candidate enrichment:** In Albis white-robed neophytes and St Pancras station (existing Calendar day), and 1856-versus-1929 Sacred Heart formulary history (existing historical Calendar description, not replacement Proper). Keep their original French/English editorial drafts in research pending exact existing canonical day/form ID, 1962 Missal corroboration, theological and translation review.

**No duplicated app features:** Palm Sunday already exists in the Calendar and Guide, including palm-rite exception; Rogation prayer-walk custom already exists, separated from parish processions; Ascension already has a Calendar event and a gated Proper. The ICRSP pages' repeated opening Guéranger material does not require new Masses or a new Calendar module.

**Hold for original print/era/source scope:** Palm pre-1955 ceremony, extinct Baptist and Assumption octaves, Sacred Heart pre-1929 proper, O-antiphon Office passages, the 2022 Irenaeus Doctor designation, the 2007 motu proprio commentaries, local Toul/Nancy St Gérard propers, historical Marian images and legends. Modern press material should not enter the devotional library.

**Parallel B28 release blockers to retain:** a proposed St Yves Mass lacking a located official printed liturgical book; a disputed local martyr designation; an incomplete Basil Gospel citation; and an Immaculate Heart historical dating ambiguity. Those *source findings* do not prove modern source authority or missing app features.

### Next workflow and release criteria

Prioritize the **81 genuinely new B23 queue topics** and compare the strongest claim paragraphs against the actual owned Calendar/Scripture/Saints/Mass Explorer records. Route duplicates to one existing subject and retain all source article aliases. The B20 160 selected source-topic first-pass is *complete*; stop repeating it as new editorial progress.

A source-derived item is publishable only after an actual certified owner record, independent liturgical/historical source check, original-author and edition attribution where quoted, adequate rights/translation status, editorial theological review and publication gate. Exactly **zero** items currently satisfy those gates.

Regression checks: `tests/test_icrsp_b27_reconciled_109_and_28_reviewed.py` and `tests/test_icrsp_b28_eight_stream_363_unique_and_b21_160.py` are wired to the existing ICRSP integrity workflow. They check exact ID sets, all 160 B20 selected article subjects, eight-cohort 363 union, no overlap with B28's final 62 and fail-closed publication status.
