# ICRSP programme — consolidated source-to-owner audit and processing plan

**26 October 2026 · Issue #1665 · [draft PR #1666](https://github.com/Fulcanelli13/ad-orientem/pull/1666)**

## Executive decision

The ICRSP France corpus has already been **fully indexed** and **fully screened for structured commentary containers**. The next bottleneck is **source paragraph interpretation, identity reconciliation against existing Ad Orientem content, edition/rights adjudication, and controlled release**. Stop serially investigating a handful of Naaman/Susanna typology claims as though they represented the entire programme. Do not manufacture a new calendar or Bible-typology registry.

Two earlier GitHub Actions artifacts, both valid and independently verified, were recovered and **made durable in the existing GitHub research branch**:

- [855 indexed articles, full inspected metadata](https://github.com/Fulcanelli13/ad-orientem/blob/governance/icrsp-source-inventory-1665/data/source-text/icrsp-france-855-verified-metadata.v1.json) from [run 40202997017](https://github.com/Fulcanelli13/ad-orientem/actions/runs/40202997017).
- [783 commentary articles, 2,856 source-only panels and exact per-page author/work labels](https://github.com/Fulcanelli13/ad-orientem/blob/governance/icrsp-source-inventory-1665/data/source-text/icrsp-france-783-verified-commentary-labels.v1.json) from [run 40204497782](https://github.com/Fulcanelli13/ad-orientem/actions/runs/40204497782).

These are **source names, locators, HTML title metadata and source-body character counts**, NOT article text copied for publication. Full individual historical work/translation rights remain unclear. This permanent preservation addresses the previous risk that 855/783 detail was stranded in time-limited Actions artifacts, rather than in the continuing repository.

## What is complete and what is not?

| Unit | Verified source count | Actual work performed |
| --- | ---: | --- |
| Distinct website article IDs | **855/855** | Indexed and metadata inspected; 0 fetch failures |
| Articles with `Commentaires` blocks | **783/783** | Structural author/panel metadata extracted; 2,856 panels |
| Articles with direct topic-excerpt reading in B10+B11 | **51** | B10 **11**, B11 **40**; not complete all-author full-page editing |
| Distinct additional B20 article excerpts directly read | **10** | No overlap with the preceding 51 |
| **Unique pages with at least one directly read source topic** | **61/783** | Approximately **7.8%** of eligible pages; not a measure of completed author-block textual collation |
| B20 metadata intake | **160** | Ten direct topic excerpt reads + **150 metadata-only** |
| Remaining commentary pages outside B20 | **623** | Previously absent from that selection, not absent from structural census |
| Newly staged from those remaining 623 | **250** | Source ID + full H2 title + exact per-article panel locators + candidate existing owner; **none of 250 article paragraphs newly read** |
| Still outside both the B20 selection and new 250 stage | **373** | Metadata already present in permanent 783 archive |
| Claims/editorial text from this corpus licensed and released | **0** | No content promoted into the live app |

**Important overlapping units:** 61 directly excerpt-read *article pages* are not 61 approved articles, and 2,856 panels are not unique authored works or copyright-cleared texts. The source home may label Guéranger's collected series when a continuation is actually by Dom Lucien Fromage. Historic pre-1955 proper names and current 1962 observances are not interchangeable.

## Source owners (no new app destinations)

| ICRSP section | Indexed | With commentaries | Detected panels | Existing target |
| --- | ---: | ---: | ---: | --- |
| Temporal | 193 | 189 | 807 | Calendar + existing Mass Explorer |
| Sanctoral | 450 | 449 | 1,851 | Existing Saints profiles + Calendar |
| Commons | 61 | 58 | 68 | Existing Mass form registry |
| Particular/local propers | 63 | 60 | 70 | Existing particular-calendar review (not universal feasts) |
| Votives and Requiem | 17 | 12 | 36 | Existing Mass form/Requiem owner |
| Ritual | 3 | 3 | 3 | Existing Calendar/customs and Ritual review |
| Office | 16 | 12 | 21 | Office history only, not a new Office module |
| Documentary/reference | 52 | 0 | 0 | Source/reference ownership; not normal day commentary |

The source section sums exactly to **855 indexed, 783 commentary pages, 2,856 commentary panels**. Named panel labels include **542 Parsch**, **492 L'Année liturgique work-family**, **472 Schuster**, **43 Benedict XVI**, **8 Prudentius**, **1,299 other/unattributed**. These are *occurrences of webpage panel labels*, not independent work editions, normalized deduplicated passages, or app-ready theology.

## Next high-volume source-reading stage: 250 unique records

The [non-overlapping, pinned 250-article metadata reading queue](https://github.com/Fulcanelli13/ad-orientem/blob/governance/icrsp-source-inventory-1665/data/source-text/icrsp-france-next250-metadata-reading-queue.v1.json) is deterministic and source-addressable. It deliberately excludes **all 160 B20 article IDs** and includes:
- **60 Temporal**, **140 Sanctoral**, **25 Commons**, **18 Local**, **4 Votive/Requiem**, **3 Office**.

Records are ranked within section by the count of source panels with substantial body length and number of total panels. This is a **work-prioritisation heuristic**, NOT evidence of theological or rubrical quality. Each record has source URL, section, original page title and exact labelled panel locators.

**Next *content* processing:** read the actual source prose for this 250 at an appropriate moderated bulk rate, preserving exact source paragraphs and attribution evidence in the **source research pipeline only**; classify 1–3 evidence-backed subjects per article; measure independent literary meaning and compare with existing owner content before proposing explanatory additions. Use 50–100 item exception queues for historical source attribution/rite conflicts. **Do not label these 250 as completed content reading until real paragraph-level evidence exists.**

## Domain-specific acceptance contracts

1. **Mass Explorer / Calendar:** resolve the actual day or Mass sourcePath against the *existing* 1962 registry. Prevent OCR/website titles or older pre-1955 rites changing reader icons, Schola states, rubric chronology or saint feast assignments. Commentary is an optional sourced explanation; not 1962 rubrical authority.
2. **Saints:** compare the title with the existing canonical saint ID and actual birth/death/feast profile before adding nonredundant historical notes, linked to a source author/work, not a speculative hagiography.
3. **Scripture correspondences:** continue in [existing draft PR #1553](https://github.com/Fulcanelli13/ad-orientem/pull/1553), which has **seven** ICRSP source claims accepted *for editorial examination only* and a source-first Naaman research preview. It is an independent compendium, **not inserted into Historia Salutis narration**. No alternative registry.
4. **Customs:** contextual seasonal/day suggestions belong in the **existing Calendar**, not another customs atlas. A rubrically attested blessing does not automatically establish the identity or regional scope of a household custom.
5. **Reference/rite editions:** classify 1960–1962 material separately from earlier rubrics, modern theological commentary, later ceremonial variations and locally authorized customs. Publication requires attribution, precise edition, licensing and relevant owner acceptance.

## Release gates and progress accounting

**Always report four separate counters:** (A) source identity indexed; (B) actual original webpage *topic* read; (C) exact canonical target and author attribution *confirmed*; (D) written explanatory item human-approved/rights-cleared for publication. Never divide panel counts by article counts or add unrelated research categories.

The most important near-term operational objective is moving from **61 pages with excerpt-level topic evidence to hundreds of such pages**, not producing Batch 19 on the same seven theological claims. Focus human editorial effort on items which are genuinely absent from existing Calendar/Mass/Saints explanations, rather than repeating current content.

**Source-of-truth files:** `icrsp-france-855-verified-metadata.v1.json`, `icrsp-france-783-verified-commentary-labels.v1.json`, `icrsp-france-corpus-coverage-20261026.v1.json`, and `icrsp-france-next250-metadata-reading-queue.v1.json`. Archive workflow [`icrsp-persist-verified-source.yml`](https://github.com/Fulcanelli13/ad-orientem/blob/governance/icrsp-source-inventory-1665/.github/workflows/icrsp-persist-verified-source.yml) passed. Integrity test: `tests/test_icrsp_durable_855_783_250_coverage.py`.

**No app source, production content, Scripture narration, actual calendar, Mass reader or Saints profile was modified.** Research PR #1666 is still a draft and is not a production merge.
