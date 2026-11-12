# Weiser — canonical custom reconciliation, Batch 01

**Date:** 20 October 2026  
**Branch / PR:** `research/weiser-chapters-01-05-20261020` / draft #1513  
**Source:** Francis X. Weiser, S.J., *Handbook of Christian Feasts and Customs* (1958), 28 chapters.  
**Scope:** research and editorial drafts only. **Zero** new app publications or Mass-reader changes.

## Why this is a crosswalk, not 568 standalone customs

The source inventory holds **568 observations**, each linked to a chapter and printed page. Individual observations may be (a) an existing rite, (b) part of a domestic custom, (c) a variant of the same practice, (d) evidence limited to one region, (e) historical context or (f) an inadmissible superstition. Writing 568 UI cards or directly ingesting the book's prose would produce duplication and copyright risk.

`data/customs/research/weiser-canonical-crosswalk.v1.json` **maps 568/568** without changing the frozen original inventory. It retains the original six triage statuses, an editorial action, app-owner hints, geographic family, priority, source gate, reversible duplicate-review group (where supported) and related-but-distinct family references.

### Preliminary classification — unchanged from original inventory

| Original classification | Count | Editorial policy |
| --- | ---: | --- |
| COVERED | 85 | Existing owner/parity check only |
| ENRICH | 56 | Add historical nuance within existing owner |
| CANDIDATE | 131 | Independent source required before a new practice |
| REGIONAL | 145 | Exact place, period and practice required; not universal |
| HISTORY_ONLY | 117 | Context/archive, not household how-to |
| EXCLUDE | 34 | Protected negative knowledge; do not publish |

### Prioritised review worklist

| Queue | Observation count |
| --- | ---: |
| P0 — witnessed or directly owned high-priority items | 16 |
| P1 — high-value customary candidates / enrichments | 144 |
| P2 — additional source/locality review | 172 |
| OWNER_PARITY — already covered | 85 |
| ARCHIVE — historical | 117 |
| BLOCKED — excluded | 34 |
| **Total** | **568** |

Priority is a **review order**, not evidence sufficiency or publication authorisation.

### Duplicate review and related practice families

- **14** reversible same-practice candidate groups covering **33** observations; these may reduce future cards but are **not automatically merged**.
- **28** related-variant topic families reference **195** distinct observations. These are intentionally **not deduplicated**; an observation can appear in several related families.
- **16** suggested existing custom-owner links; these are pointers into the active Atlas or still-open PR #1516 and must be rechecked before release.
- **12** source observations independently corroborated by a separate research register.

Representative high-confidence duplicate-review candidates: Christmas window candles across chapters 6/8, Christmas Eve opłatki across chapters 6/9, St Nicholas visits across chapters 8/28, Catholic name days across chapters 23/28, Assumption Marian processions across chapter 24, and domestic use of Candlemas candles across chapters 25/26.

**Non-merge examples:** A priest blessing herbs at the Assumption is distinct from a family preparing the bouquet. A St Christopher medal is distinct from the parish's blessing of vehicles. A Holy Saturday food blessing is distinct from household dyeing eggs. Local saints' feasts do not create automatic Mass-reader rites or universal Calendar rules. Polish Wypominki is source evidence for existing `DEAD-003`, not a second All Souls custom.

## Editorial summary batch — 12 bilingual cards

`data/customs/research/weiser-custom-editorial-briefs-batch01.v1.json` contains twelve **originally worded English and French editorial drafts**. Each has:

- an accessible description of the practice;
- why it matters spiritually;
- suitable *optional* lay observance;
- source geography/period and caution against universality;
- Weiser chapter/printed page plus separately enumerated independent URLs;
- an identified existing surface (Saints, Calendar, Pray or Customs Atlas);
- editorial and ritual gates before publication.

| Weiser ID | Editorial topic | Printed page | Destination / restriction |
| --- | --- | ---: | --- |
| WEI58-23-006 | French village patronal feast | 280 | Local patron and feast owner; no global date |
| WEI58-23-008 | Baptismal name days | 280 | Saints; chosen patron, never name inference |
| WEI58-24-005 | Assumption Marian procession | 289 | Customs Atlas; reconcile #1512 |
| WEI58-24-014 | Assumption maritime blessing | 291 | Local priestly rite not reproducible in app |
| WEI58-26-019 | Polish Wypominki | 312 | Enrich DEAD-003; never collect names |
| WEI58-27-019 | St Joseph charitable table | 324 | SJOS-001; no invented fritelli proof |
| WEI58-27-023 | St Anthony's Bread | 326 | SANT-001; no solicitation or guaranteed favors |
| WEI58-28-011 | St Christopher vehicles blessing | 336 | SCHR-001; no safety guarantees |
| WEI58-28-020 | St Nicholas and children | 340 | SNIC-001; distinguish history from folklore |
| WEI58-27-012 | Irish St Patrick ribbon crosses | 323 | Historical Irish craft, not universal |
| WEI58-27-026 | St Anthony for lost objects | 327 | Reuse Saints/Pray; no new prayer or miracle assertion |
| WEI58-26-022 | Historical Polish soul breads | 313 | All Souls historical charity; not a French claim |

The other **18** selected queue records are held in the same file as explicitly unfinished summary targets, including **two protected do-not-publish-as-instruction records**. Weiser-only source evidence is not enough to promote a current custom.

## Release and source policy

1. The original 568-record inventory is immutable; the crosswalk can be iterated without changing its source.
2. A same-practice group is a **candidate** for canonical merging, never an executed merge. No collapsing of ministerial blessing into household observance.
3. An independent witness supports only its actual claims: region, period, ceremony and physical place may each require a separate verification.
4. Retain Weiser's page locators, but do not reproduce substantial copyrighted text in the UI, database or reports.
5. Check the 1962 liturgical calendar separately from current obligations and current ministerial rituals.
6. Maintain exactly one owner for each published practice, with cross-links from other surfaces.
7. Reconcile final publishing PR #1516 with open blessings PR #1512 and the 12 summaries before merging into app.
8. Use `node tests/weiser-canonical-reconciliation.mjs` for inventory coverage, protected exclusions, traceability and source-locked bilingual editorial-copy checks.

## Next production batch

Prioritise **P1** source closure by multi-observation family: Advent/Christmas household practices; Epiphany blessings; Lenten/Triduum home customs; Easter food blessings; Corpus Christi procession-side observances; Marian/saints' household customs; All Souls remembrance. Reuse existing prayers, rites and Calendar owners rather than adding duplicate cards. Publication happens only after independent corroboration and editorial review.
