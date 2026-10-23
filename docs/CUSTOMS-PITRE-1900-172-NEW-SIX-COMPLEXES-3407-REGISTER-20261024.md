# Pitrè 1900 — Wave 3, 172 original-OCR details across six unmined complexes

Research date: **2026-10-24**. This is historical-source research, **not an Ad Orientem publication**. Work continues on the existing draft PR #1572 / branch `research/customs-full-registry-census-20261023`.

## Evidence and actual new output

The original Pitrè 1900 Internet Archive full-text OCR was opened and read directly via the item's **FULL TEXT** link:

https://archive.org/stream/afm3499.0021.001.umich.edu/afm3499.0021.001.umich.edu_djvu.txt

The 1900 first-edition Michigan scan remains described at:

https://commons.wikimedia.org/wiki/File:Biblioteca_delle_tradizioni_popolari_siciliane_(IA_afm3499.0021.001.umich.edu).pdf

**172 new descriptive historical source/detail observations** were extracted with exact Internet Archive rendered OCR line numbers, place, feast complex, claim classification and original-author evidence holds. The original text passages were read in six previously unmined regional chapters:

| Complex | New rows | Approx. printed chapter span from running headers / contents |
| --- | ---: | --- |
| Assumption and Vara, Messina | 47 | pp. 147–168 |
| St George and St John Baptist, Ragusa | 40 | pp. 323–332 |
| Madonna delle Milizie, Scicli | 33 | pp. 333–341 |
| Easter encounter, Comiso | 15 | pp. 343–348 |
| St Vitus, Mazara del Vallo (historical Mazzara) | 20 | pp. 496–501 |
| Holy Crucifix, Calatafimi | 17 | pp. 501–505 |
| **Total** | **172** | **Six local historical complexes** |

Staged original 1900 source dataset:
`data/customs/master/pitre-1900-original-ocr-unmined-messina-ragusa-scicli-comiso-mazara-calatafimi-wave03.v1.json`

Stable IDs: `PIT1900-NEW-122` to `PIT1900-NEW-293`.

The source-derived portions include late-nineteenth-century procession geometry; vow-pullers on the Messina Vara, and its earlier live/modern mechanical figure substitutions; April St George and June/August St John distinctions in Ragusa; Scicli's historical battle *re-enactment*, Marian pilgrimage and exceptional-time sung Mass report; Comiso's Easter symbolic image meeting; Mazara's boat procession and earlier animal-related civic games; Calatafimi's Passion-symbol processional display and discontinuous allegorical pageants.

The six-complex split is an **editorial container**, not six newly certified independent customary practices, and the 172 records are **observations and components**, not 172 new unique Catholic customs.

## Registry reconciliation and controls

- Previous unified source/detail count: **3,235**.
- New source/detail observations: **172**.
- **Current unified research workbench: 3,407** non-deduplicated source/detail records.
- Pitrè original 1900 work: **129 existing `PIT1900-IT-` records + 121 prior `PIT1900-NEW-` records + 172 new records = 422** historical-source observations.
- Previously reconciled 129 original records (71 pair comparisons and 47 exception reviews) remain intact; **not reclassified**.
- Earlier **408 provisional practice groups** and **56 pre-existing overlapping working identities** remain unchanged.
- **Zero** new individually certified distinct Catholic practices, automatic merges, approved 1962 liturgical rites or Ad Orientem Calendar/runtime/prayer publications.

Both the integrated subset under `external_source_observations_pitre_original_1900_new_ocr` in `comprehensive-customs-working-catalogue.v1.json` and the raw wave03 source dataset have the same 172 exact IDs/locators and source labels. The unified source/detail total is asserted at **3,407** and the entire original-edition Pitrè source subset at **422** by CI regression tests.

## Historical and theological caution

Pitrè's own 1900 introduction explicitly states that his material combines what he observed *de visu* with correspondence and other accounts; individual testimony is not automatically firsthand. His 1881 `Spettacoli e feste popolari siciliane` is the **same author**, not independent corroboration.

1. **Messina:** historical commercial fair blessing and obsolete cavalcade (around OCR 7003–7045) **were not current even in Pitrè's 1900 writing**. Living children formerly attached to the Vara are a discontinued and potentially hazardous pageant practice (7353–7389). A claimed 1681 'miraculous' accident preservation derives from older quoted reports and **must not be certified as a miracle**.
2. **Ragusa:** St George's blessed-seeming field-bread custom is a *reported agricultural practice* (12830–12840), not evidence of an approved ritual formula. Reputed healing with St John's reliquary (12905–12931; 13124–13131) remains folklore and provenance on hold. The Sarda horse parade was **abolished** by Pitrè's time (13019–13021).
3. **Scicli:** the armed Virgin / battle legend is not a verified military apparition. The unusual 02:00 sung Mass and asserted papal brief (13421–13425) are **not ecclesiastically authenticated**. The author refers explicitly to his **1881 book** (13357–13358), requiring an edition-dependence link, not a second independent witness.
4. **Comiso:** the Easter `paci` statue encounter is distinct from the reported violent rivalry of factions and competitive noisy bands. Neither factional abuse nor the 1900 civic setting should be presented as a devotional recommendation.
5. **Mazara:** the duck-on-rope game and firework-prank costume are historical civic descriptions, not religious endorsements; the window candle for the saint's nighttime ride is marked as **folk belief**, not evidence of a literal apparition.
6. **Calatafimi:** the dramatic `riali` procession is explicitly **nonannual when unaffordable**; old decennial accounts are **unread prior prints** (18855–18860).

**Per-record original printed folio verification remains ZERO** for these 172 records and the earlier 129/121, because the public-domain 632-page scan exceeded the available PDF web-reader limit and could not be loaded through direct download in this run. The printed-page spans are chapter bounds inferred from available running headers, **not individually verified source-page images**. OCR textual locators are exact within the Internet Archive web-transcription view (21,354 source lines) but may require corrections against scanned folios.

## CI and next research

Updated:
- `tests/customs-full-registry-census.mjs` — 3,407 source count, 172 source-level nonloss assertions, 293 additional rows, full 129 retained.
- `tests/customs-pitre-1900-new-ocr-stage02.mjs` — prior 121 extraction preserved in expanded workbench.
- `tests/customs-pitre-1900-original-ocr-wave03.mjs` — independent 129 + 293 Pitrè ID check and zero promotion.
- `.github/workflows/customs-master-integrity.yml` — executes the new regression test.

**Next meaningful work:** use a page-addressable public-domain facsimile or smaller image-service endpoint, verify the 25 previously flagged P0 rows *plus high-risk new passages*, and continue **100–200 entirely new OCR observations per volume pass** from still-unmined locality chapters, not repeat identity classification. All CI statuses must be confirmed against the current branch head; creating this documentation commit may retrigger checks.

No paid services, automated contemporary Catholic blessing assumptions, modern Calendar dates, publication or runtime changes.
