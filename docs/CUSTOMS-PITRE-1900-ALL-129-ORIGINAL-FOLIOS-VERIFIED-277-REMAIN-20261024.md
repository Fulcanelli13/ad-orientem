# Pitrè original 1900 — older 129/129 observations fully page-checked

**Date:** 24 October 2026. **Research-only branch:** `research/customs-full-registry-census-20261023` / draft PR #1572. Not an app release.

## Completed original-edition verification

The original Giuseppe Pitrè, *Feste patronali in Sicilia*, Carlo Clausen (1900), vol. XXI of *Biblioteca delle tradizioni popolari siciliane*, was examined through the user's uploaded original-edition scan of the University of Michigan/Internet Archive witness `afm3499.0021.001.umich.edu`.

SHA-256 of the compressed uploaded PDF: `100e2b3164bd7a342c5c0c5d01df2a60b4635d5695dea456e9b93769866ee5ee`; original volume was not committed as binary to Git. Public witness: https://archive.org/details/afm3499.0021.001.umich.edu

**All 87 remaining older P2 observations now have a located printed original folio**, the one-based PDF page, and an attesting original-language Italian phrase. The 87 textual anchors were separately checked against the original PDF embedded Italian text layer (87/87 exact normalized substring matches); page-image contact sheets representing all **37 distinct printed pages** were rendered and reviewed before the source flags were changed. No page number was promoted on the basis of OCR-line interpolation or an unrelated generic keyword alone.

Authoritative 87-row source:
`data/customs/master/pitre-1900-uploaded-facsimile-87-p2-original-page-verifications.v1.json`.

The P2 source IDs remain `PIT1900-IT-` (not new custom identities). All exact IDs came from the existing immutable 129-record verification queue and preserve original OCR line, action description, author/edition and locality.

### Page-level sample findings

| Historical subject | Record sample | Original printed page / PDF page | Original-language evidence |
| --- | --- | --- | --- |
| St Joseph's Entry of Laurel, Ribera | PIT1900-IT-001 | p.441 / PDF 499 | `È la Domenica precedente al 19 Marzo` |
| Laurel-covered *stràgula* construction | PIT1900-IT-003 | p.442 / PDF 500 | `La stràgula è una torre alta una decina di metri` |
| Household vow and Holy Family meal | PIT1900-IT-008 | p.443 / PDF 501 | `un vecchio, una giovane ed un bambino` |
| Distribution of St Joseph breads after sung Mass | PIT1900-IT-027–028 | p.448 / PDF 506 | `celebrasi la messa cantata`; `le tre ciambelle grandi ai tre poveri` |
| Catania's processional *candelore* | PIT1900-IT-054–059 | pp.219–222 / PDFs 277–280 | `episodi del martirio di Sant' Agata`; `prima e dopo entro il Duomo, lungo i pilastri` |
| Acclamation and handkerchiefs at St Agatha relics | PIT1900-IT-062 | p.225 / PDF 283 | `diecimila pezzuole si agitano` (the relic raising begins p.224) |
| St Lucy's cooked wheat tradition | PIT1900-IT-072 | p.274 / PDF 332 | `ragione della cuccia` |
| Syracuse's thirteen-day St Lucy preparation | PIT1900-IT-074–075 | p.274 / PDF 332 | `preceduta da una tredicina` |
| Melilli barefoot pilgrimage and invocations | PIT1900-IT-087–088 | p.288 / PDF 346 | `dodici miglia`; `Yiva Sammastianu` |
| Palazzolo St Paul serpent-shaped loaves | PIT1900-IT-094 | p.355 / PDF 413 | `una grossa ciiddura a forma di serpente` |
| Agrigento/Naro St Calogero food offerings | PIT1900-IT-109–112 | pp.375, 377 / PDFs 433, 435 | `Pezzi di pane, pagnotte divise`; `offrono agnelli e capre` |
| Caltanissetta Michael home candles | PIT1900-IT-124 | p.516 / PDF 574 | `accenderle quindi durante` |

These are *attested statements in Pitrè's 1900 original edition*, not independent historical confirmations of every practice or current liturgical permission.

**Important ecclesiastical distinction:** Pitrè's original p.448 quotes a correspondent's distribution of `pane consacrato` after sung Mass. That phrase alone does not identify consecrated Eucharistic species, authorize a priest's blessing formula, or establish a current approved Roman Ritual rite. The report remains research-only; avoid mapping it into Communion or 1962 ritual content without separate primary liturgical evidence.

## Reconciled counts (non-additive research source/detail observations)

| Component | Status |
| --- | ---: |
| Original 1900 Pitrè first-wave P0 | **25 / 25** original printed folios checked (earlier pass) |
| Original 1900 Pitrè first-wave P1 | **17 / 17** original printed folios checked (earlier pass) |
| Original 1900 Pitrè first-wave P2 | **87 / 87** original printed folios checked (**this pass**) |
| **Original 129-record first wave** | **129 / 129** page-checked |
| Later 1900 Pitrè observations | **16 / 293** page-checked |
| **All indexed Pitrè original 1900 observations** | **145 / 422** page-checked |
| **Remaining newer original-page checks** | **277** |
| Unified historical source/detail observations across all research sources | **3,407 unchanged** |
| Provisional practice groups | **408 unchanged** |
| Newly certified unique customs / independent historical authors / 1962 rite approvals / app publications | **0 / 0 / 0 / 0** |

All 129 older source entries remain on the original IDs, without repeating the completed 71 manual relationships and 47 separately screened observations. The 87 new page checks are **not new source/action observations**, so the unified count does not increase.

The earlier `pitre-1900-364-unverified-records-page-lookup-queue.v1.json` is deliberately preserved as a **dated historical search-plan snapshot**; its 87 older P2 rows have since been verified and must not be counted as outstanding. The current complete pending file is now:

`data/customs/master/pitre-1900-277-new-observations-current-original-page-queue.v1.json`.

It contains exactly the 277 unverified records among the newer 293, and does not silently assert that its interpolated page candidates have been visually checked.

## Testing and next substantive work

The dedicated source gate `tests/customs-pitre-1900-original-scan-full-129-folio-integrity.mjs` cross-checks all 87 new source IDs, original actions and HTML OCR line locators, page/anchor evidence, exact page-reference parity, existing P0/P1 IDs, new current queue, preserved 3,407 corpus count and zero publication. These tests validate the *committed metadata*; the original uploaded PDF is not available to GitHub CI, and exact phrase-to-pixel review occurred outside GitHub in this research session.

The `Customs Master Identity and Source Audit` workflow is configured to run the added gate.

**Next batch:** the 277 remaining newer Pitrè 1900 observations should be checked in two high-volume batches, grouped by already-defined locality/feast complexes rather than reclassifying the older 129. Every row must acquire a correct original printed page and a confirmable Italian phrase from the user-supplied scan; leave genuine mismatches in an exception queue. Continue keeping civic history, popular belief, liturgical rites, historical variants and modern Calendar suggestions strictly separate, with no publication.
