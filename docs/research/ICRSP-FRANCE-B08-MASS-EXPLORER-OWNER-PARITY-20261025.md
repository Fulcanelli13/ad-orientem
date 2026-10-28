# ICRSP France B08 — Actual Mass Explorer content ownership

**Date:** 25 October 2026  
**Issue:** [#1665](https://github.com/Fulcanelli13/ad-orientem/issues/1665) · **Review branch:** `governance/icrsp-source-inventory-1665` · **Draft:** [PR #1666](https://github.com/Fulcanelli13/ad-orientem/pull/1666)

## Objective

Previous batches reached 855/855 inspected source articles, 783/783 commentary-bearing pages, and 2,856 structural commentary panels. The new task is **parity with the actual existing product**, not the invention of another Calendar or a second Mass reader.

This batch directly inspected the following **current code/data owners**, rather than assuming feature absence from an unmatched title:

- `src/learn/mass-explorer.js`, `src/learn/mass-explorer-prayer-readings.js`, `src/learn/mass-explorer-selected-calendar-proper.js`
- `data/presentation/guide-registry.v1.json`
- `data/learn/mass-explorer-prayer-readings.v1.json`
- `data/learn/mass-formation-campion.v1.json`
- `data/learn/mass-explorer-approved-studies.v1.json`
- `data/learn/mass-formation-approved-passages.v1.json`
- `data/learn/research/mass-moment-author-evidence-review-20261016.v1.json`
- The existing 39-source Calendar candidate crosswalk and 55-entry selected feast reading-source supplement.

## Actual existing published capabilities — do not duplicate

| Source owner / content type | Actual manifest observations | Audit interpretation |
| --- | --- | --- |
| Existing Sung Guide | **32** Guide entries, comprising 30 ordinary guide keys and preceding/post-Mass entries | Existing Mass structure/meaning teaching, NOT 39 feast-specific historical commentaries |
| Original bilingual prayer explanations | **84** entries, sourced to 84 specific reader blocks; loaded through `verifiedMassExplorerPrayerReadings` with strict source-text and branch checks | Already in current Mass Explorer; do not import equivalent source-prose in another subsystem |
| Source-backed Mass Formation | **8** stages and **24** claim entries, with Missale Romanum 1962, *Mediator Dei*, O'Connell 1962, and Campion 1954 source references | Existing thematic Ordinary Mass formation; not a source-certified ICRSP historical edition |
| Calendar-selected Proper in Explorer | Implemented via `selectedCalendarProperProjection` (also explicit preflight alternative) | CONDITIONAL: must resolve the selected date, pass the existing printable Proper, agree on exact source path across English and French, and preserve actual liturgical selection. This review does not assert 39 runtime date tests succeeded |
| Deep explanatory study release | **0 approved studies**, manifest `NO_APPROVED_STUDIES` | The checked publication path for original deep studies is empty; this does not establish that all other app explanations are absent |
| Exact historical / theological passage release | **0 approved passages**, manifest `NO_APPROVED_PASSAGES` | No reproduction rights have been supplied via this publication path |
| Earlier Mass-moment research | **139** candidates, **69** workbook-labeled `PASSAGE VERIFIED`, associated with **16** Guide owners; all publication gates zero | RESEARCH ONLY. Workbook grade is **not** approved textual quotation, source collation or rights permission |

The existing Mass Explorer's Guide and ordinary prayer explanations must be **retained intact**. The ICRSP collection could add history, patristic/Scriptural references, Roman stational geography and meaningful day-specific commentary only after exact source-owner parity and attribution checks. Source-holder equality is not original historical text equality.

## 39 major celebrations — direct feature parity

Full per-row output: `data/source-text/icrsp-france-mass-explorer-39-owner-parity.v1.json`.

- 39/39 selected celebrations have an existing Calendar display title.
- 164 source commentary panel instances are associated with these 39 candidate source pages.
- 17/39 align with actual exact source-path pins in the existing selected feast Scripture supplement.
- For the remaining 22, a missing fixture entry in *that particular supplement* is **NOT proof that the Proper or Scripture connection is absent**; the repository has separate Temporal, Lent/Ember, segmented reading and native-rite registries.
- The selected Calendar Proper presentation is implemented and strictly gated, **not yet individually confirmed for all 39 dated observances** by this research pass.
- Deep historical-author study and source excerpt release manifests each contain zero approved entries; this does **not** establish 39 unique missing narrative features.
- **0 canonical feast IDs invented; 0 new liturgical text, rites, gestures or reader cards; 0 source reproduction clearances**.

## Avoid redundant Guéranger research

The existing unpublished 139-source Mass-moment research is attributed as follows: St Alphonsus de Liguori 41, Fr Pierre Le Brun 38, Josef Jungmann 25, **Dom Prosper Guéranger 13**, Fr Nicholas Gihr 12, St Thomas Aquinas 6 and the Roman Catechism 4.

The new ICRSP census contains **492 Guéranger-labelled panels**, **472 Schuster-labelled panels** and **542 Parsch-labelled panels**. The 13 earlier Guéranger research leads are a *same-author review queue*, **NOT** 13 confirmed overlaps with the ICRSP passages. The exact 13 research IDs, Guide owners and locators are staged at `data/source-text/icrsp-france-mass-moment-author-overlap.v1.json`.

Schuster and Parsch have zero namesake records within the **specific** 139-claim Mass-moment research corpus, not proven zero coverage in other research masters. Do not begin a parallel Guéranger edition/content pipeline without reconciling these 13 first.

## Next acceptance gate: substantive parity, not another index

For each candidate commentary passage, complete these steps in order:

1. Resolve the **existing** Calendar/Proper and Mass Explorer owner IDs, without inventing new card IDs, feast IDs, date algorithms, translations or liturgical editions.
2. Compare content against current day-specific Calendar explanation, special day overlays, existing 84 ordinary prayer explanations and eight Formation stages, and any source masters already owning a theme.
3. Classify `ALREADY_PRESENT`, `PARTIAL`, `NEW_EVIDENCE_CANDIDATE`, `HISTORIC_VARIANT_ONLY`, `UNATTRIBUTED` or `SCOPE_UNRESOLVED`, with **exact text evidence**. Merely finding a webpage label is insufficient.
4. Retain exact source-panel URL, source ordinal/heading, work-volume/page and 1962 authority flag. Where original work, French translation or rights cannot be certified, publish **only a bibliographic external reference**, not extracted source prose.
5. Queue editorial changes for existing Calendar or Mass Explorer surfaces only after their domain owners approve. The parallel 1962 Ordo Missae audit exclusively owns the priest gestures and reader rubric changes.

## Tests and publication control

`tests/test_icrsp_mass_explorer_owner_parity.py` validates the 39 source identities, 84 current prayer explanations, eight Formation stages, 13 same-author research leads, zero approved historical studies and zero approved source passages. `.github/workflows/icrsp-gap-integrity.yml` now runs this alongside prior 855/193/39-source register tests. **No content is approved merely because a test passes.**

All changes are research artifacts on a **draft** branch; no production module, current Calendar, the Mass reader or `index.html` was modified.

This ends the **existing-Mass-Explorer ownership discovery** stage. Next high-volume work should match the **166 Temporal article leads not in the first 27 Temporal-major candidate matches** against actual source-path/Proper and explanatory IDs; the 52 historic and special-rite variants need controlled 1962 source adjudication.
