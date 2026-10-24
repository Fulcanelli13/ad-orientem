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
