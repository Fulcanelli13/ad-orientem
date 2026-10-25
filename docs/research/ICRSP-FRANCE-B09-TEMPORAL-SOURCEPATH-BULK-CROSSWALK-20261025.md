# ICRSP France — Batch 09: 193 Temporal sources against existing 1962 Scripture source-path owners

**Date:** 25 October 2026. **Issue:** [#1665](https://github.com/Fulcanelli13/ad-orientem/issues/1665). **Draft:** [PR #1666](https://github.com/Fulcanelli13/ad-orientem/pull/1666). **Branch:** `governance/icrsp-source-inventory-1665`.

## Result: high-volume crosswalk, not a second Mass Proper system

All **193 indexed ICRSP Temporal articles** have been compared non-destructively with the article's existing French label, its position in the source index, and **exact `sourcePath` values actually recorded** in seven current Ad Orientem evidence registries:

1. `data/mass/scripture-temporal-sunday-source-audit.v1.json`
2. `data/mass/scripture-reading-witness-register.v1.json`
3. `data/mass/scripture-lent-weekday-source-audit.v1.json`
4. `data/mass/scripture-seasonal-ember-source-matrix.v1.json`
5. `data/mass/scripture-feast-reading-supplement.v1.json`
6. `data/mass/scripture-segmented-proper.v1.json`
7. `data/mass/scripture-extended-lesson.v1.json`

Source index titles in abbreviated French like `Lun.`, `Mar.` and `Mer. Q.-T.` were interpreted *only within their exact indexed seasonal/weekly sequence*, not by free-text similarity. Invented `sourcePath` strings are not treated as evidence; only literal membership in an inspected owner registry establishes a match.

| Research result | Articles |
| --- | ---: |
| All Temporal article source records examined | **193** |
| Explicit sourcePath candidate could be proposed | **133** |
| Candidate matches an existing source-path reading witness | **99** |
| Including previously linked major-calendar source candidates | **22** |
| **New matches among the 166 not in the major shortlist** | **77** |
| Candidate path not found in these selected registries | **34** |
| No sufficiently safe one-to-one source-path candidate | **60** |
| Source text historically and copyright certified | **0** |
| Canonical app content changed | **0** |

**Scope:** the 27 Temporal source pages in the earlier 39-major-feast candidate group are not all confirmed reading-path links: 22 of those 27 have exact existing reading-path witnesses here; the other 5 require separate handling. No publication grade, 1962 historical equivalence or original print manuscript authority is conferred by these matches.

The **77 additional existing path witnesses** break down into particularly useful groups: **29 Lenten weekday/feria items; 21 Sundays after Pentecost; four Sundays after Easter; three Advent Ember days; three September Ember days; three Pentecost octave feria/Ember references; three conditionally resumed Sundays after Epiphany;** and several Christmas, Holy Name, Holy Family, Septuagesima and Ascension sources. This materially reduces redundant source finding: their Scripture reading contexts already have owners elsewhere in the repository. None means that the complete historical commentary is already present in Mass Explorer.

The full 193-record dataset is `data/source-text/icrsp-france-temporal-193-sourcepath-crosswalk.v1.json`, with article URL, source index label, candidate path (or null), identity mapping method, exact matched source files, historical guards and explicit `publicationStatus: BLOCKED` for each row.

## All 94 unmatched records classified instead of labelled missing

`data/source-text/icrsp-france-temporal-94-sourcepath-exceptions.v1.json` records and categorizes the 94 articles with no exact source-path match in these seven selected registries:

| Category | Sources |
| --- | ---: |
| Explicit historical or octave-period edition material | **36** |
| Advent weekdays with speculative independent proper paths | **21** |
| Other observances requiring a different source owner or exact evidence | **17** |
| Seven Great O Antiphons (Office, not distinct Mass Propers) | **7** |
| Easter-octave ferias without matched reading owner | **6** |
| Pentecost non-Ember octave weekdays without matched reading owner | **3** |
| Existing explicitly blocked/held owner records | **3** |
| Ascension Vigil: edition/source witness needed | **1** |
| **Total** | **94** |

Three important **pre-existing holds were rediscovered, not newly diagnosed deficiencies**:
- `Tempora/Quad5-5`, Friday in Passion Week: current `scripture-lent-weekday-source-audit.v1.json` explicitly says `HOLD_NOT_A_GENERIC_1962_FRIDAY_PROPER`. The Divinum source file represents the Seven Sorrows of the Blessed Virgin Mary, not automatically the universal 1962 ferial formulary; actual celebration and jurisdiction control.
- `Tempora/Quad6-5`, Good Friday: existing `scripture-feast-reading-supplement.v1.json` labels `DISTINCT_GOOD_FRIDAY` and excludes it from ordinary Mass Proper assumptions.
- `Tempora/Quad6-6`, Easter Vigil: existing hold `DISTINCT_EASTER_VIGIL`; its own original prophecy order and liturgical graph are required. This source article also retains the earlier internal ICRSP *after-1955 index versus after-1951 H2* contradiction.

The index contains **21 expressly historical/pre-1955 article identities** excluded from any forced path assignment, including distinct pre-1955 Palm Sunday and Holy Week Holy Thursday/Friday/Saturday forms, restored/suppressed vigils and old octaves. Exact matching of commentary text across variants does not create rubrical equivalence.

## Conditional identity is not automatic liturgical selection

The source-path audit identifies **three resumed post-Epiphany Sunday source files** and a separate 1st-Sunday-after-Pentecost label sharing the already owned Trinity Sunday `Tempora/Pent01-0` witness. The Calendar's 1962 rubric resolver, not the ICRSP index, decides whether these readings are applicable on a particular date. No duplicate Proper is created.

For Advent weekdays with index titles such as `Lun.` and `Mar.`, the existence of a website commentary page does **not** prove there is an independent 1962 weekday Proper instead of a resumed Sunday Mass. The 21 hypothesized separate paths therefore remain **unmatched speculation**.

## Quality / next actual editorial work

- `tests/test_icrsp_temporal_sourcepath_witnesses.py` independently loads the seven **current** owner registries and requires every reported existing source-path link to be present exactly in at least one owner's eligible reading array (never by name/title or hold-only entries).
- The test checks all 193 source article IDs, 99 reading-path witnesses, 77 previously unmatched sources now linked to existing owner paths, 94 unresolved, three preserved holds, seven Office antiphons, zero ownership promotion, and suppression of pre-1955 Mass identities.
- `.github/workflows/icrsp-gap-integrity.yml` runs this test with the earlier Calendar and Mass Explorer owner parity checks.

**Next phase** must not reindex the 99 source paths or claim 94 missing features. Investigate substantive new evidence in original author works, with a controlled sample of the 29 Lenten weekdays and 21 Pentecost Sundays as a high-value domain-owner gap set; verify exact 1962 day/formulary pairing before any user-visible education. Handle unmatched **Easter / Pentecost octave**, **Ascension Vigil** and other historical variants in a small, separate rubrical source queue, coordinated with the independent reader audit.

The 855-source census, 783 source commentary pages and 2,856 panels remain research-only; texts and translations have not been licensed or critically collated. This branch does not modify the LIVE/Simple/Missal reader, Calendar calculation, Mass Explorer runtime, or user data.
