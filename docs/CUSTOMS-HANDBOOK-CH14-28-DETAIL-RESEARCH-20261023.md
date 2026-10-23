# Comprehensive Customs Registry — Handbook detail extraction, chapters 14–28
**Date:** 23 October 2026  
**Status:** Research-only draft, stacked on PR #1536 as part of PR #1572.

## Delivered, not merely planned

A second-pass **source-driven targeted extraction** across all fifteen chapters 14–28 of Francis X. Weiser, *Handbook of Christian Feasts and Customs* (Harcourt, Brace, 1958) identified **121 finer-grained source observations** at **42 distinct printed-page locations**. Each new detail has a unique `WEI58-DETAIL-B-###` identifier, original printed-page number, searchable OCR line interval, corresponding 1958 scan page index, existing general Handbook observation parent, an action/variant characterization, and explicit limits on present-day use or Catholic rite authenticity.

New research data: `data/customs/master/weiser-handbook-targeted-addendum-ch14-28.v1.json`.

**This is not a cover-to-cover exhaustive audit of all lines in chapters 14–28.** It is source-located spot extraction through several page spans and search points. Nor are the 121 detail records automatically new practices: they are often geographic subtypes, descriptions of object use, historical forms, secular/civic festivities, comparisons to other rites or features previously collapsed into a single source row.

### Illustrative practice types extracted

- **Lent, Holy Week:** papal Laetare golden rose; English Mothering Sunday homecoming and simnel cake; Polish Lenten mourning dress; Maundy Thursday `monumento` decorations and multi-church visits; South American Last Supper dramatizations; Malta charity table; Russian candle brought from the Eastern Holy Thursday vigil; Austrian military guards at Holy Sepulchre shrine; Good Friday regional simple meals, silent eating, Syriac/Chaldean greeting variant.
- **Easter:** Austrian Easter morning music and hill gatherings; water-pan Easter sunrise folklore; Eastern and Slavic Easter Thursday memorials; British Easter egg requests and egg gifting; Polish/Ukrainian pysanky as durable family heirlooms; non-Catholic comparative Easter customs labelled clearly.
- **Ascension, Pentecost, Corpus Christi:** historical Ascension church-pageant mechanisms (never assume Roman rite authorization), bird pastries, Pentecost Holy Ghost-hole dove pageants with wind and petal effects, domestic dove figures, dew-collection folk practices with disputed efficacy, Trinity column festivals, Spanish Eucharistic procession giants, Polish blessed Corpus Christi wreaths.
- **Harvest, saints and Marian feasts:** regional last-sheaf festivities, French cross-shaped wheat sheaf, Hungarian and Polish harvest wreath offerings, Martinmas meals; local Marian name-day patterns, the Inchinata and Candelieri, fruit-basket practices and Assumption livestock/sea blessing; decorated Candlemas candles, Breton Holy Souls calls, Polish Wypominki, Hungarian orphan charity, St John's herb rituals, St Christopher vehicle blessings and Scandinavian St Lucy candle and bonfire customs.

Weiser himself mixes Roman ceremonies, Eastern Christian observances, local religious devotions, inherited seasonal folklore and efficacy claims. The register preserves these exact conceptual differences in `evidence_class`, and no source-level observation is promoted directly to an Ad Orientem devotional instruction.

## Auditable counts

| Layer | Count | Counting rule |
|---|---:|---|
| Original 1958 Handbook indexed observations | 568 | First-pass, not exhaustive |
| Prior Handbook page-checked omissions | +6 | New separate source observations |
| **1958 Handbook base source observations** | **574** | May still hide further omissions |
| 1956 `Religious Customs in the Family` observations | 111 | Complete-book broad first-pass, not exhaustive |
| **Two-book source rows** | **685** | Excludes 16 superseded preview rows |
| Nested details, Handbook ch. 10–13 | 57 | Components/variants, not necessarily independent customs |
| Nested details, Handbook ch. 14–28 | 121 | Components/variants, not necessarily independent customs |
| **Total research source/detail rows** | **863** | 685 base + 178 nested; *not 863 Catholic customs* |
| Earlier Handbook proposed group identities | 308 | Provisional |
| Historically recovered group leads | 39 | Provisional |
| Existing working-master identities | 56 | Overlap above; not additive |
| New independently approved *distinct* custom identities in this pass | **0** | No final identity certification |
| Ad Orientem app records published or updated | **0** | Calendar, Mass, Saints, Prayers and UI untouched |

The presently documented detailed passage locations are **24 distinct printed pages** from chapters 10–13 and **42 distinct printed pages** from chapters 14–28, **66 non-overlapping printed-page locations** across both passes. That is a count of page locations supporting recorded observations, **not 66 pages fully audited for completeness**. Chapters 1–9 remain an important targeted follow-on for broadening the fine-grained corpus.

## Provenance and edition handling

- Original public 1958 scan: https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf
- Public searchable OCR witness: https://www.scribd.com/document/447017805/Handbook-of-Christian-Feasts-and-Customs
- `printed_page` records the page shown in the 1958 book, not a website's pagination.
- Main book text page mapping `pdf_page_zero_based = printed_page+17` was calibrated through sample PDF screenshots. The individual data rows also carry OCR line locators; these are witness-specific and may change if the third-party site reprocesses the document. Original printed page is the stable source locator.
- The short labels were independently composed. No long copyrighted source passages are copied into the research data.

## Next source-work requirements

1. Re-read or examine the missed and sparse pages of **chapters 1–9**, while checking if the original 568 index collapsed distinct names, practices or local variants.
2. Audit page intervals in chapters 10–28 that were **not** visited in this targeted scan. An end-to-end completeness claim would be false at this stage.
3. Map the 178 nested details to the **347 provisional practice group records**, 56 original master identities and 53 regional families. Do not make false merges. Separate material variants, rites, folk acts and feast-day associations.
4. Mine the three precursors omitted from Weiser's later Handbook, when source text is available; their titles alone do not imply additional extracted content.
5. Begin independent ethnographic and primary local source confirmation of living practice, preserving single-source historical traditions in the registry even if modern continuity is uncertain.

## Validation

The Node suite `tests/customs-full-registry-census.mjs`, wired to `.github/workflows/customs-master-integrity.yml`, now checks new detail uniqueness, every Handbook parent ID, correct printed-to-PDF page mapping, source counts, 15-chapter representation, and the non-publication boundary. A committed test is not itself a passed test: consult the GitHub Actions result on the latest PR head.
