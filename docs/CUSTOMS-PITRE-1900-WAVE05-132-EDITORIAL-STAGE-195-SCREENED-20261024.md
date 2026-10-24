# Pitrè 1900 — Wave 5 editorial source screening and noncanonical staging

**Date:** 24 October 2026. **Scope:** Research-only continuation of draft PR #1572. No Ad Orientem Calendar, ritual, prayer, Mass or runtime publication.

## Results and denominators

| Gate | Verified in this execution |
| --- | ---: |
| Original 1900 book PDF, SHA-256 match | 1/1 |
| Original printed chapters previously absent from the 1900 inventory | 29 |
| Distinct machine-extracted source leads | 195 |
| Exact OCR excerpt matches on assigned PDF-text-layer pages | **195/195** |
| Distinct original-PDF page locations used by the 195 leads | **141** |
| Manually worded, reversible source-detail observation descriptions **staged** | **132** |
| Source leads retained outside intake for more context, legend / quoted history or fragmentation | **63** |
| Of 29 previously unrepresented chapters, with at least one staged source-detail description | **29/29** |
| New original-page image-level verifications certified | **0** |
| New distinct Catholic customs / liturgical or miracle claims certified | **0** |
| App/calendar content published | **0** |

**Important:** 132 descriptions are provisional *source observations*, not 132 unique customs. They are not yet merged into `comprehensive-customs-working-catalogue.v1.json`; the existing 3,512-row official research denominator and `31/60` represented-chapter inventory must therefore **not** be silently inflated. The 60/60 number is an **evidence-screening/staging** coverage metric, not publication or chapter-exhaustion completion.

## Primary source provenance

Giuseppe Pitrè, *Feste patronali in Sicilia*, Carlo Clausen 1900, original Archive item `afm3499.0021.001.umich.edu`, compressed PDF SHA-256 `100e2b3164bd7a342c5c0c5d01df2a60b4635d5695dea456e9b93769866ee5ee`. The historic PDF OCR text layer is imperfect. Every one of the 195 excerpts was **independently re-extracted from the stored original compressed PDF**, with literal whitespace-normalized match on its attributed 1-based PDF page. This reconfirms textual location but is **not** equivalent to viewing each page-image facsimile.

## Staging method

The 195 automatically selected Italian excerpts were read individually to differentiate actionable descriptions from context, repeated ritual formulas, legends and source-dependency issues. Original Italian OCR excerpts, short anchors, printed pages, one-based scan page and original SHA-256 are preserved. A human-readable English editorial paraphrase is supplied for 132 action or historical-context observations. Some concern abusive penances, alleged miracle cures, superstition, violent factional behavior and pageants; no endorsement is implied. The other 63 are explicitly held with full source context, rather than discarded, or converted into ungrounded practice owners.

All 132 remain `SOURCE_OBSERVATION_STAGED_NOT_CANONICAL`; none claims exact historical fact, a present-day devotion, accepted Roman Ritual formula, unique-custom identity, independent source, or app publication. The existing 408 provisional groups and 56 overlapping master owners remain untouched.

## Next source and publication gates

1. **Individual image review:** inspect original facsimile pixels for the 132 staged Wave 5 records and all older 105 Wave 4 pending records; where a source excerpt has important OCR errors, correct in source-preserving annotated records rather than overwriting its original evidence text.
2. **Locality and feast review:** verify per-record chapter boundaries, specific municipality, processional route, seasonal date and whether a 1900-era historical description is a continuing local devotion. The 63 held records require additional surrounding-page adjudication, not automated promotion.
3. **Catalogue integration:** map the 132 source-detail IDs exactly once into the canonical research workbench and chapter index, revise the 3,512-row denominator and CI assertions atomically, and recheck other concurrent research branches before committing. No automatic merges into 408 groups or the 56 historical working owners.
4. **Authorization:** any explicit blessing or shrine ritual requires separately attested historical and ecclesiastical authority; miracle or therapeutic efficacy should be described only as attributed popular belief.
5. **No calendar release:** the existing Ad Orientem Calendar may eventually surface a subset of carefully reviewed historical customs; this research pass publishes none.

## Audit files

- `data/customs/master/pitre-1900-wave05-editorial-staging-and-holds.v1.json` — the complete 195-record disposition set, 132 staged / 63 held.
- `tests/customs-pitre-1900-wave05-editorial-staging-integrity.mjs` — count, individual source evidence, zero-promotion and nonloss assertions.

**Overall position:** 3,512 preexisting workbench research observations; 132 additional **separately staged** source observations; 0 unique customs certified; 0 published. 31/60 previous original-edition chapters are integrated, and 29/29 previously blank original chapters now have screened evidence and provisional editorial descriptions outside the unified catalogue.