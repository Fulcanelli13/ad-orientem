# Pitrè 1900 — Wave08: 63 held cases closed at source-action level, eight recoveries and all 560 printed pages censused

**24 October 2026 — Draft research PR #1572.** This is a historical source-workbench update, not a Catholic customs identity approval, rite authorization or Ad Orientem app publication.

## Main result

| Research gate | Before Wave08 | After Wave08 |
|---|---:|---:|
| All-source observations/details, overlapping and undeduplicated | 3,644 | **3,652** (+8) |
| Original-edition Pitrè 1900 source/detail rows | 659 | **667** (+8) |
| Wave05 held source leads awaiting individual disposition | 63 | **0 unclassified**; 55 remain excluded from source-observation intake |
| Source actions recovered from the 63 earlier held leads | 0 | **8** |
| Numbered chapters with one or more source observations | 60/60 | **60/60** |
| Chapter sections exhaustively mined | 0/60 | **0/60** |
| Book-body printed pages with >=1 indexed original observation | Not previously enumerated | **307/560** |
| Main printed pages with zero indexed original observations | Not previously enumerated | **253/560** |
| Pages exhaustively audited line by line | 0 | **0** |
| Newly certified unique Catholic customs, Roman Ritual authority, or Calendar releases | 0 | **0** |

The 60-chapter **representation** milestone does not imply exhaustive source extraction. The scan has 560 numbered main text pages before the original printed index; the latter begins after the main body. **307** printed pages now have at least one source-specific observation. The other **253** represent a concrete high-volume page-audit queue. A page with at least one source locator is *also not certified exhaustively mined*.

## All 63 held source cases

This batch reviewed the saved passage excerpts with targeted original-PDF surrounding text, and recorded an explicit individual case disposition for all 63. The cases break down as:

- **8** recoverable, source-located historical action details, added as original-1900 source observations with IDs `PIT1900-W08-OBS-001` to `008`.
- **28** folk-efficacy, healing, supernatural/origin or other uncorroborated claim passages; none endorsed as true or suitable devotional instruction.
- **10** Pitrè passages referring to earlier authors, oral traditions, local testimony or historical material rather than an authenticated independent primary witness.
- **9** civic rivalry, public-spectacle or potentially unsafe behaviours; not approved Catholic rites.
- **8** duplicate, broadly contextual or incompletely separated source fragments, including one wrongly attributed chapter snippet already captured by an earlier observation.

**Source recoveries:** original pp. **65** (Palermo ex-voto offerings), **91** (Altavilla image procession), **108** (Monreale processional flowers), **116** (Chiusa Sclafani Pentecost festino and cherries), **305** (Noto barefoot pilgrimage offerings), **393** (Casteltermini staged sword/drum performance), **484** (Alcamo processional confraternities and candles), and **520** (Santa Caterina novena and straw fires). For flowers, objects, candles, cures and miracle legends, only the historical description is retained; efficacy and ecclesiastical approval are not independently proved. The eight were compared against already indexed same-folio records to avoid simply re-adding the same quoted snippet. This is **not** a claim of eight new distinct Catholic customs.

The 55 source leads that remain excluded are preserved under explicit reason codes. They were *reviewed*, not discarded, and remain available for later source-dependency, legend or exception work.

## Significant original book-index discrepancy: chapters XI and XLI

The **printed 1900 table of contents itself** says chapter XI begins on p. 141 and chapter XLI on p. 400. But the **actual numbered chapter headings in the same original 1900 book** begin:

| Chapter | Printed table of contents | Actual printed body heading | Source consequence |
|---|---:|---:|---|
| XI, Saint Vitalis, Castronovo | 141 | **140** | Maintain chapter XI for correctly attributed p. 140 records |
| XLI, Madonna delle Mortelle, Villafranca | 400 | **406** | Printed pp. 400–405 belong to chapter XL, *Madonna dell'Aiuto*, Campobello di Licata |

The 1900 body has explicit `XL. La Festa della Madonna dell'Aiuto in Campobello di Licata` at printed p. 400, continued through p. 405; `XLI. Le Festa della Madonna delle Mortelle in Villafranca` only begins printed p. 406. Consequently:

- `PIT1900-W05-OBS-097` (donated Marian mantle/crown/halo brought by children, printed p.401), and
- `PIT1900-W05-OBS-098` (winch-based elevation of the Madonna statue at Vespers, printed p.402)

were incorrectly assigned to Villafranca and have been **re-attributed to Campobello, chapter XL**. Original source IDs, printed pages, image references and old erroneous labels remain preserved as provenance. The held snippet `PIT1900-SCREEN-099` on printed p.402 also belongs to Campobello and overlaps the already indexed `...OBS-098`; it was **not** inflated into a ninth recovery.

This is a real geographic/contextual catalogue correction, not a revision to Catholic doctrine, a claim about modern feast dates or an automated merge.

## Source gaps and next production-scale evidence pass

The top unindexed-page concentrations, based on original numbered folios and actual chapter boundaries, are **Santa Rosalia/Palermo I (33 pages)**, **St Calogero/XXXVI (14)**, **St Francis of Paola/Palermo II (13)**, **Assumption/Messina XII (12)**, **St Agatha/Catania XIX (11)** and **St Joseph/XLVI (9)**. These six account for **92 of 253** pages with no indexed source observation.

Next conduct a **150–200 printed-page high-volume audit** across those page gaps and other geographically diverse gaps, recording a per-page full-text review state, genuinely new source passages, and missing/unclear OCR exceptions. Do not reprocess the same 667 indexed entries or interpret existing page-coverage as proof of completeness.

**Primary witness:** Giuseppe Pitrè, *Feste patronali in Sicilia* (1900), Internet Archive item `afm3499.0021.001.umich.edu`, checksum of research scan `100e2b3164bd7a342c5c0c5d01df2a60b4635d5695dea456e9b93769866ee5ee`. No paid acquisition or storage.

## Committed artifacts

- `data/customs/master/pitre-1900-wave08-63-held-source-cases-adjudication.v1.json` — all 63 individual dispositions, with 8 research recoveries and 55 excluded historical/context cases.
- `data/customs/master/comprehensive-customs-working-catalogue.v1.json` — eight additional, strictly research-only observation rows; repaired Campobello attribution for two earlier rows.
- `data/customs/master/pitre-1900-complete-60-chapter-source-coverage-inventory.v1.json` — preserved original printed contents values, separately documented body-heading corrections and current counts.
- `data/customs/master/pitre-1900-wave08-560-original-body-pages-completeness-queue.v1.json` — all 560 printed pages individually routed by chapter; 253 source-observation-gap worklist records.
- `tests/customs-pitre-1900-wave08-63-holds-and-560-page-census.mjs` — cardinalities, nonloss, corrected chapter ownership, source hash, zero publication, chapter and page coverage checks.
- `.github/workflows/customs-master-integrity.yml` — Wave08 regression integrated.

The original scan page-image and individual full-folio certification remains pending where indicated; CI validates the committed metadata and reference integrity, **not** the facsimile pixels. Earlier immutable source intake is preserved.

No Ad Orientem Calendar, Mass, liturgical rite, UI, source-of-truth prayers or runtime content changed.
