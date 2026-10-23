# Pitrè 1900 — controlled integration of 121 newly staged original-edition OCR observations

**Date:** 2026-10-24. **Scope:** source research master only. No app production changes.

## Results and counting

The two previously staged but not unified direct-1900-edition OCR extraction files were preserved intact and indexed **once** in `data/customs/master/comprehensive-customs-working-catalogue.v1.json`:

| Chapter / locality | New source observations | Original staging file |
| --- | ---: | --- |
| St Rosalia, Palermo | 27 | `pitre-1900-new-rosalia-cosmas-piazza-original-ocr-stage01.v1.json` |
| Ss Cosmas and Damian, Palermo | 29 | same |
| Assumption, Piazza Armerina | 12 | same |
| Holy Spirit, Gangi | 5 | `pitre-1900-new-gangi-gratteri-geraci-marineo-original-ocr-stage02.v1.json` |
| St James, Gratteri | 10 | same |
| Blessed Sacrament, Geraci Siculo | 16 | same |
| St Cyrus, Marineo | 22 | same |
| **Total** | **121** | IDs `PIT1900-NEW-001` to `PIT1900-NEW-121` |

**Master source/detail count: 3,114 + 121 = 3,235.** This is an **underdeduplicated, nonadditive historical evidence workbench**, **not** a distinct-custom count. There are **129 separate first-pass original-1900 Pitrè entries**, `PIT1900-IT-001`–`129`, whose existing 71 comparisons + 47 nonpaired reviews were **not repeated or changed**. Earlier **408 provisional groups** and **56 older overlapping working master identities** are unchanged.

The new records retain original Pitrè OCR HTML line references, exact source file paths, place, occasion, editorial claim class, and candidate printed chapter span. **Printed chapter spans are not record-level printed folios.** Every added record has `original_printed_folio_verified=false`, `source_independence_certified=false`, `official_1962_rite_approved=false`, `unique_practice_identity_certified=false`, `present_continuity_certified=false`, `working_master_owner=null`, `publication_state=RESEARCH_ONLY`.

## Verification limits and source-access attempts

The 1900 volume and bibliographic structure are externally documented:
- Full Google Books original 1900 bibliographic record: https://books.google.com/books/about/Feste_patronali_in_Sicilia_descritte_da.html?id=RvGBAAAAMAAJ
- Wikimedia Commons Michigan scan: https://commons.wikimedia.org/wiki/File:Biblioteca_delle_tradizioni_popolari_siciliane_(IA_afm3499.0021.001.umich.edu).pdf
- Internet Archive OCR source recorded in both datasets: https://archive.org/stream/afm3499.0021.001.umich.edu/afm3499.0021.001.umich.edu_djvu.txt

During this reconciliation pass the original PDF (22.8 MB; 632 scan pages) exceeded the web reader's input limit; direct Internet Archive text/download endpoints returned access errors, and Google's linked `output=text` returned HTTP 403. **Zero newly verified original-page images**, zero newly extracted observations beyond the 121 already staged and counted in this pass, and **zero newly checked 1881 St Lucy passages**. Current verification must not be misreported as successful page audits.

### Source-critical holds

- Geraci Siculo cheese/cattle protection belief and supposed blessed food, Palermo/Cosmas and Damian touching cloth to statues, putative prior ecclesiastical privileges: theological/ritual authorization and older-document evidence remain **unverified**.
- Palermo Rosalia route/format changed in the late nineteenth century: historical variants **must not** become automatically recurring modern Calendar instructions.
- Marineo's Dimostranza and triumphal cart are alternatives in the reported account, **not two obligatory or simultaneous annual observances**.
- Multiple works/scans by **Giuseppe Pitrè** do **not** provide independent authors. His 1881 account must be tagged same-author reuse when inspected; field correspondents and older historians must be independently retrieved before corroboration claims.

## Executed nonloss checks

- `tests/customs-full-registry-census.mjs` now enforces all **121 original IDs** and source-file/description/locators, old **129** intact, **3,235** total, seven section labels, zero folio and publication promotion, **408** groups untouched.
- `tests/customs-pitre-1900-new-ocr-stage01.mjs` and `stage02.mjs` remain in the integrity workflow; the latter also verifies 121 new integrated source rows and 3,235 total.
- Existing source-folio gates `pitre-1900-129-original-witness-facsimile-and-1881-dependency-gates.v1.json` remain applicable **only to the older 129 observations**. Do not infer new page checks from those records.

## Next actual research pass (no more repetitive identity comparison)

1. Obtain **page-addressable original 1900 scan images**, and check original folios for the existing 25 P0 cases **and** high-risk new passages before asserting page-level verification.
2. Mine at least **100–200 additional original-text observations** from as-yet unsampled 1900 chapters, separate from these seven new sections and the seven feast families of the older 129. **Do not fabricate new entries from table-of-contents anchors.**
3. Attach exact page, source edition, original-language snippet/location and independent historical author/dependence flag to every new record; update both workbench count and regression tests in the same commit series.
4. Keep exact Catholic rites, local folklore, civic spectacles and legendary etiologies editorially distinct. **No publication into Calendar, rites, prayers or Mass experience without separate evidence gates.**

**PR:** https://github.com/Fulcanelli13/ad-orientem/pull/1572 — remains an unmerged research draft.
