# Ad Orientem customs — unified identity consolidation, cohort 01

**Date:** 24 October 2026. **Research-only.** This is the continuation of the **existing** customs registry and master, not another customs collection, calendar, or automatically generated app card. It is built on the exact research baseline from draft PR #1572 (3,703 overlapping source/detail observations), but belongs to a **separate dependent draft PR** so source mining and identity consolidation can progress independently.

## The actual product

Contextual customs suggestions inside the **existing Ad Orientem liturgical Calendar**. On a day or season, offer regional or universal Catholic practices with their dates and region clearly scoped; opening one shows an authentic historical description, meaning, relevant blessings/prayers where verified, source and current/historical availability. Do not add another Calendar, a Customs Atlas, invented prayers, or universal Roman liturgical requirements inferred from local practices.

## The four denominators — do not confuse them

| Layer | Baseline or output | Interpretation |
|---|---:|---|
| All overlapping research source/detail observations | **3,703** | Book passages, detailed actions, overlapping same-feast accounts; **not** separate customs |
| Provisional working groups | **408** | Already created 308 original Weiser + 39 historical + 24 unindexed + 37 additional-detail leads, not unique approved practices |
| Existing master identities | **56** | 38 `CANONICAL_IN_MAIN`, four provisional P2 and 14 research-only master identities |
| Preexisting publication metadata | **35 PUBLISHED**, **3 CONTEXT_ONLY**, **18 NOT_APPROVED** | Values in `working-master.v1.json`; no runtime screen or current Calendar deployment was verified this pass |

**All 56 existing master records have `do_not_auto_publish:true`.** The historic `PUBLISHED` metadata is not a new deployment authorization, and we do not overwrite existing content or assert that an uninspected live app shows it.

## 150-group consolidation batch

The previous 371-group reconciliation already contains **47 explicit owner identity candidate relationships**. We preserved all 47 and did **not** repeat their prior adjudications. There are 361 owner-unresolved provisional groups in the 408-group population; **150** now have a uniform label-level risk, date-signal, and candidate-overlap workbench, leaving **211** for the next systematic batches.

These 150 were deterministically spread across six prior Weiser-derived strata: **43** chapter 1–14, **59** chapter 15–28, **9** supplement, **14** historical recoveries, **10** unindexed and **15** extra detail group candidates. They are a deliberate screening sample, not a statistically random sample or representative estimate of actual approved customs.

| Provisional routing after existing owner review | Records |
|---|---:|
| Practice-shaped candidate requiring exact source and identity review | **97** |
| Historical context, period/continuity review | **40** |
| Liturgy, priestly rite or parish practice — boundary review first | **8** |
| Folk, superstition or alleged efficacy — hold | **3** |
| Other rite or comparative historical material — hold | **2** |
| **Total** | **150** |

The fields `potential_existing_master_lexical_hints` and `potential_other_provisional_group_lexical_hints` are **retrieval-only suggestions** derived from overlapping distinctive words. They **are not certified relations or merging instructions**. Seven of the 150 have a lexical existing-master hint and 33 have lexical hints to other provisional groups. They must be checked by what the practice actually **does**, its occasion, locality and authentic witnesses.

**73/150** have an explicit season/day cue in the existing short label. This is *not* an approved Calendar date rule: the existing 1962 Calendar resolver remains the sole arbiter of liturgical dates. A title containing **Nativity of Mary** has been explicitly corrected to the September Marian feast rather than Christmas, demonstrating why label-based dates must never be published unreviewed.

## The first 30 source checks to unlock a usable Calendar programme

The separate prioritized research queue contains 30 concrete **existing** groups, with original Weiser observation IDs and printed source page pointers. It spans ordinary Sunday household practices, Advent/Christmas family practices, Epiphany house blessing, Lent/Holy Week, Easter, Pentecost, Corpus Christi, Candlemas, the Assumption, the Nativity of Mary and All Souls.

Examples:
- `CAT-WEISER-A-089` — Epiphany priestly house blessing: distinguish the actual Latin ritual and local house custom before providing prayers or inviting action.
- `CAT-WEISER-B-113` — households bringing candles for Candlemas: compare `DOM-011` (keeping already-blessed candles at home); **different actions**, not a safe blind merge.
- `CAT-WEISER-B-025` — Easter Vigil blessed fire brought home by lantern: distinguish parish liturgical fire from documented optional domestic custom.
- `CAT-WEISER-B-083` — Seville Corpus Christi boys' dance: verify historical/local institution; do not conflate with `CORP-001` flower carpets.
- `CAT-WEISER-B-144` — Polish All Souls empty chair and food charity: check specific regional witness and relation to `DEAD-003` without turning it into universal practice.
- `CAT-WEISER-B-123` — seed blessing at the Nativity of **Mary**, not Christmas: verify date, source passage and blessing authority.

These 30 have source pointers but **zero** newly authenticated exact passages, unique identities or release approvals in this batch. They are the next finite action queue, **not** 30 newly discovered customs.

## Evidence gates for any future publication

1. **Action-level identity:** independently establish whether a described action is new, a variant/component of an existing master identity, a historical narrative or an unrelated secular custom. Keep original regional phrasing and original source ID.
2. **First witness and dependence:** inspect Weiser's original passage and dated page, verify geographic attribution; compare any distinct authors/diocesan/ritual witnesses and their dependence. Repeated writings by the same author do not count as independent attestation.
3. **Catholic and ritual authority:** separate religious customs from folklore and other rites. The fact that a Roman Ritual blessing exists **does not** authorize every regional object-related action or historical folk practice.
4. **Calendar ownership:** propose contextual feast/season and geographical visibility to the **existing** Calendar. No invented liturgical dates, modern-to-1962 rank substitution, assumed local processions, automatic liturgical actions or published card before the Calendar and editorial gates pass.
5. **Live release check:** inspect the actual current Calendar experience and preserve the already-published master cards; do not assume a `PUBLISHED` field proves live visibility.

## Scope frozen and next throughput

Existing numbers **408 provisional groups, 56 master identities, 3,703 source/detail observations** remain unchanged. Cohort 01 introduces **0** verified unique customs, **0** approved master merges and **0** new Calendar publications. That is intentional; its deliverable is a traceable, comparable cross-source identity decision queue instead of more book extraction.

Next pass: read original passages for the **30 priority cases**, make evidence-based owner/variant/context decisions (without broad automatic merges), and continue **100–150 remaining group reviews per batch**. We should report source-confirmed practice families, existing master variants, true new identities approved, and Calendar-ready cards **separately**, not a growing observation count.

### Files

- `data/customs/master/customs-unified-identity-consolidation-cohort01-150.v1.json`
- `data/customs/master/customs-master56-publication-and-calendar-readiness-audit.v1.json`
- `data/customs/master/customs-consolidation-cohort01-calendar-first-30-source-review-queue.v1.json`
- `tests/customs-unified-identity-consolidation-cohort01.mjs`
- `.github/workflows/customs-master-integrity.yml`

Nothing has been inserted into the app or live Calendar.


## 24 October — original-folio action-level pass (supersedes the earlier 0/30 source-check status)

- The exact **30/30** preselected Weiser priority group actions have now been checked against the scanned pages of the **1958 original edition** ([facsimile](https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf)). Each remains the *same* provisional group with its original source observation and research-only state; **no new canonical ID or approved merge** was created.
- The original page check overturned **three mistaken page-mismatch allegations** introduced in the first action dossier when relying on a transcription. The Easter light / lantern account **is on printed p.217**, so the old p.226 allegation is withdrawn. St Nicholas letters begin p.55 and continue p.56, so the queue's p.56 is a valid continuation and p.45 was incorrect. Epiphany's **Blessing of Homes starts on printed p.149**, next to the queue's p.150, which opens a different folklore section. The original-page facsimile review supersedes the transcription-derived guesses.
- The 30 actions are now provisionally routed to distinct-practice review, an existing master’s contextual extension, related regional variant, historic local event, cultural-only context, ritual authority hold or folklore/superstition exclusion. A single Weiser page is **not** independent corroboration, contemporary continuity or Calendar-release clearance.
- **Two** practices have an additional institutionally scoped contemporary witness: the [Archdiocese of Vienna on Easter light carried home](https://www.erzdioezese-wien.at/pages/inst/21452566/service/kirchenjahr/osterfestkreis/osterlicht) and [Seville Cathedral on its Seises Corpus dance](https://www.catedraldesevilla.es/en/solemnity-of-corpus-christi-at-the-cathedral/). These corroborate *the locality/scoped practice*, not every historical detail in Weiser.
- **Five** further English/French Calendar editorial profiles now exist as **unapproved drafts**: Advent St Joseph image rounds; Seville Seises; decorated Candlemas candles; Candlemas crib removal; and Spanish Immaculate Conception balconies. With the previous two action dossiers, there are **seven** initial bilingual prose drafts—**not** seven canonically approved customs. The decorated candles dossier is explicitly a possible contextual extension to existing `DOM-011`, not a seventh new identity.

### Current measured gate state

| Metric | Count |
| --- | ---: |
| Provisional groups held steady | **408** |
| Master identities held steady | **56** |
| Existing `main` customs (35 published-state + 3 context-only) | **38** |
| First cohort label-screened | **150/361 ownerless** |
| Calendar-priority action passages checked against 1958 facsimile | **30/30** |
| Additional modern locality witnesses for these priority passages | **2** |
| EN/FR unapproved editorial draft dossiers | **7** |
| Newly approved distinct custom identities | **0** |
| Newly approved owner merges | **0** |
| New Calendar publications | **0** |

Next step is **cross-source confirmation and canonical/variant adjudication** on the highest-value Calendar subjects, rather than further Pitrè extraction or another general first-pass registry. No new Calendar UI is authorized.

New files:

- `data/customs/master/customs-consolidation-cohort01-original-facsimile-30-action-decisions.v1.json`
- `data/customs/master/customs-consolidation-cohort01-calendar-pilot-5-bilingual-drafts.v1.json`

The original two-dossier file has been corrected to cite actual 1958 facsimile folios.


## 24 October — cohort 02: all 408 groups now accounted for at screening level

The second consolidation cohort audits the **remaining 211 of 361 owner-unresolved provisional groups**, using their previous original observation IDs and source-page pointers, into a bounded source-label triage register. The earlier **150** rows and **47** prior owner suggestions are unchanged and disjoint: **47 + 150 + 211 = 408/408** provisional groups *covered by screening or previous owner suggestions*.

**This is not 408 verified distinct practices**. It is not an exhaustive first-witness review of all groups, a source-dependence audit, or publication approval. Cohort 02 checked **zero** additional original Weiser page images: the group labels supply retrieval and owner-comparison leads, not verified customs.

### Cohort 02 working decisions

| Review route from existing source labels | Groups |
| --- | ---: |
| Catholic practice or variant identity review | **49** |
| Priesthood, rite or local event boundary | **30** |
| Historic context or continuity uncertainty | **69** |
| Regional cultural/material/food context | **51** |
| Other rites or comparative history | **5** |
| Folk claim/superstition hold | **3** |
| Needs complete passage context before action classification | **4** |
| **Total** | **211** |

**56 specific reversible relationship hypotheses** were recorded, including priestly Rogation field sprinkling versus a family prayer walk, multiple All Souls alms customs, the corpus flower-wreath blessing/use lifecycle, and Spanish Seises on the Immaculate Conception versus Corpus Christi. Similar dates or materials do not by themselves justify a merge.

### Towards the existing Calendar: 9 drafts -> 8 provisional subject units

Nine bilingual draft dossiers now converge into **eight** contextual Calendar release subjects. Five have bounded historical/institutional/cultural evidence sufficient to enter *editorial* review; one has partial geographic corroboration, and two still require variant/owner/component decisions. This accounting does **not** mean eight distinct new customs or any released article.

The highest-value deduplication is Seville's **Seises**: its Corpus Christi (`CAT-WEISER-B-083`) and Immaculate Conception (`CAT-WEISER-B-109`) observations describe **one** named cathedral practice with **multiple liturgical associations**, confirmed by the Cathedral. Likewise, the Epiphany chalk record (`CAT-WEISER-A-090`) belongs in the same thematic Calendar subject as the distinct priestly Epiphany house blessing (`CAT-WEISER-A-089`) but keeps separate instructions and authority. Polish Corpus Christi wreaths (`CAT-WEISER-B-085`, `CAT-WEISER-B-086`) comprise blessing plus domestic after-use stages, with locality-specific external records and an explicit ban on treating reported magical efficacy as doctrine.

Evidence and release gates are encoded in `data/customs/master/customs-consolidation-first-calendar-release-gate-board.v1.json`; individual content and sources are in `customs-consolidation-cohort01-calendar-pilot-5-bilingual-drafts.v1.json` (five prior subjects) and `customs-consolidation-cohort02-calendar-two-source-supported-drafts.v1.json` (two additional, source-backed subjects). Existing source research and published cards were not mutated.

**Counts unchanged:** 3,703 research observations (nonadditive), 408 provisional group IDs, 56 working master identities, 35 published-status main customs plus three context-only. **Newly canonically approved identities, owner merges and Calendar publications: all zero.**

Next release work should be an explicit adjudication of these eight release-unit recommendations against canonical source/variant/ritual/copy gates. Do not launch additional Pitrè-wide mining, add a parallel calendar or automatically publish based on source-label screening.
