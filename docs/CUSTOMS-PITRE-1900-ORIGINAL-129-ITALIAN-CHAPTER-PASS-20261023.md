# Ad Orientem Catholic customs — Pitrè's original *Feste patronali in Sicilia* (1900), source pass 01

**Date of research:** 23 October 2026. **Research branch:** `research/customs-full-registry-census-20261023`, draft PR #1572. **Domain:** regional Italian historical source evidence, distinct from the parallel chat's English-language household books, Portuguese/Spanish regional work and already-completed cross-source clustering of the **different** Pitrè posthumous Palermo history.

## Substantial breakthrough: original edition readable

The **complete OCR of the University of Michigan copy of Giuseppe Pitrè, *Feste patronali in Sicilia* (Torino–Palermo, Carlo Clausen, 1900; volume XXI of his *Biblioteca delle tradizioni popolari siciliane*)** is openly readable at:

<https://archive.org/stream/afm3499.0021.001.umich.edu/afm3499.0021.001.umich.edu_djvu.txt>

Archive catalogue and scan:

<https://archive.org/details/afm3499.0021.001.umich.edu>

The original 1900 title page is transcribed in OCR lines 180–206, not inferred from a modern reprint. Pitrè's *Avvertenza* at OCR lines 244–307 expressly says he published *Spettacoli e feste popolari* in 1881 and then undertook **60 patronal feast descriptions concerning 92 Sicilian municipalities**, gathering information from local correspondents as well as direct observation. The book thus remains **one historical author-compilation**, not sixty firsthand testimonies. His description of a practice can draw on an earlier chronicle, a correspondent, local legend, or a cited part of his own 1881 book.

**Unlike the prior Palermo volumes** (`pitre-palermo-retrospective-vol1-vol2-source-details-wave01.v1.json`, posthumously published volume II 1950), this wave actually accesses the **original 1900** text. The 1881 original *Spettacoli e feste popolari siciliane* is still only bibliographically identified; **its original body has not been directly read**.

An attempted direct download of the 1900 PDF scan was blocked by the archive gateway; **none of the 1900 printed page images has been visually reviewed**. HTML/OCR locators are therefore genuine **OCR-text source locations, not visually confirmed original printed-page coordinates**. Suspicious text and dates require a later facsimile check.

## 129 directly sourced historical action and variant details

The register `data/customs/master/pitre-1900-feste-patronali-original-edition-ocr-actions-wave01.v1.json` contains **129 uniquely numbered details** (`PIT1900-IT-001..129`) from seven selected main feast chapters and 14 localities. Each row records the source document URL, displayed OCR line, locality, feast, claim class, historical-period scope and editorial holds. This is **a substantial first pass, not exhaustive examination of the entire 60-chapter book**.

### Sampled original-book chapters

1. **St Joseph, Ribera / Canicattini / Santa Croce Camerina / Pachino / Spadafora / Raccuia:** highly informative source lines **16751–17234**, printed chapter beginning ~p.441. The *stràgula* laurel-and-bread ceremonial tower pulled by oxen; symbolically costumed poor Holy Family invitees; staged refusal and reception of shelter; household meals, breads and almsgiving; town-specific nineteenth-century dates and 19th-of-the-month rites; auctioning feast donations. **Not one generic St Joseph feast** and not twenty-seven independent customs. Local families' acted blessings are **not a substitute for a priest's blessing**.
2. **St Agatha, Catania:** source lines **9297–9701**, original chapter pp.219–230. Guild-borne *candelore* (distinct from Candlemas candles), `partiti` groups singing regional hymns, white *sacco*, barefoot `nudi`, relic-fercolo transport, seminarians' paper rain. The source quotes a **1641** historian and refers to an **1834** illustration; the original older works were not separately inspected.
3. **St Lucy, Syracuse:** source lines **11067–11260**, printed chapter ~pp.273–279. Boiled wheat *cuccìa* with a locally reported famine etiology (legend does **not** prove a miracle), the thirteen-day preparation, December procession and eight-day suburban shrine stay, and a **separate May quail celebration** with an older religious-house bird-release/throwing practice which Pitrè explicitly says he already described in **1881**. That mention **is not independent corroboration** of his own earlier account.
4. **St Sebastian, Melilli:** lines **11522–11696**, ~pp.287–291. May processions, pilgrims' barefoot vows, procession-route circuits, some historic physical penitential extremes, and claimed cures. The **1899 Sebastiano Crescimanno** text is a cited independent *lead* that has not itself been read; descriptions of miracle-seeking gestures and vulnerable or nude pilgrims are **historical context, not current approved recommendations**.
5. **St Paul, Palazzolo Acreide / Solarino:** lines **13903–14076**, ~pp.355–359. Serpent-carrying `cerauli`, large snake-shaped loaves, devotion gifts and auctions, offerings of eggs and herbs, January observances at Solarino and legendary well-water healing. These are **not Cocullo's St Dominic serpent celebration**, despite the shared live-snake elements; distinct saint, date, and place. Folk claims remain quarantined.
6. **St Calogero, Agrigento / Naro:** lines **14523–14802**, ~pp.375–383. Votary bread thrown onto the fercolo, sweat-cloth handling, votive shaped breads, animals and candles, separate octave procession, Naro's January remembrance of the reputed 1693 event, June dates and pilgrimages. The 1820s traveller and late-nineteenth-century clerical narratives **quoted or cited by Pitrè are not independently verified source witnesses**.
7. **St Michael, Caltanissetta:** lines **19142–19251**, printed chapter ~pp.515–517. The nine-day hymn tradition sung outside homes, September and May celebrations, transfer of the image between Cathedral and sanctuary, historic reported nine-year penitential fast-and-candle rite, and superstitious weather/omen interpretations. The extraordinary long-term fast is **not a contemporary prescription** and its candles do not establish Roman Ritual blessing text.

### Evidence classes explicitly kept separate

| Class | Number |
| --- | ---: |
| Reported devotional actions | 35 |
| Processional actions or components | 22 |
| Historical variant, former date or special sequence | 20 |
| Objects, foods and material preparations | 19 |
| Community, civic or festival logistics | 11 |
| Folk efficacy or supernatural legend **not endorsed** | 12 |
| Historical sacred representations | 6 |
| Blessing or ritual claim requiring authority verification | 2 |
| Explicit older author cited but source **not** read directly | 2 |
| **Total** | **129** |

No automatic merge of a 1900 source record into a previously worked calendar practice has been performed. These 129 are **source/detail descriptions** potentially overlapping with the modern Salemi ritual-bread museum, regional Italian municipal pages, and earlier Pitrè Palermo compilation; their matching text or feast label is **not source independence** or a distinct-custom certification.

## Shared master reconciliation

| Metric | Immediately before | After pass |
|---|---:|---:|
| Research source/detail rows, not unique customs | 2,985 | **3,114** |
| 1900 original Pitrè OCR observations | 0 | **129** |
| Earlier provisional action groups | 408 | **408** |
| Earlier master identity working rows, possibly overlapping | 56 | **56** |
| New globally verified distinct Catholic customs | 0 | **0** |
| Original 1900 facsimile pages visually certified | 0 | **0** |
| App/Calendar published customs | 0 | **0** |

The original register was added to `data/customs/master/comprehensive-customs-working-catalogue.v1.json`, maintaining all prior source details; metadata says `printed_scan_page_verified:false`, `independent_witness_certified:false`, `practice_identity_certified:false`, and `app_publication:NONE` for all 129 rows.

`tests/customs-full-registry-census.mjs` now validates all 129 IDs, 14 named locality buckets, evidence/source URL consistency, category totals, exact 3,114 non-deduplicated research-row count and no publication or identity promotion. This deliberately avoids inventing 129 historically distinct devotional customs.

## High-volume next wave with no parallel duplication

The 1900 author says his original has **60 feast descriptions** (the first wave has sampled **seven main feast chapters**, not certified them exhaustively). Continue the remaining printed sections **directly from this same fully accessible original OCR** in high-volume chunks of 100–200 *source details*, grouped by chapter, place and date; use the actual index at OCR lines ~20740–21280 for breadth and avoid confining everything to Palermo. Prefer untouched original chapters covering other provinces of Sicily and local St Joseph, Marian, apostolic, Saints Cosmas–Damian and Holy Cross traditions. **Do not again re-mine the already indexed 129 descriptions.**

In parallel only where independent originals become readable, verify Pitrè's **1881** book and named local correspondents or 1641/1899 older sources as **independent textual witnesses**, with exact edition and page; if quotations originated from the same author or copying, record dependence. Original pagination and correct Latin-Rite ecclesiastical ritual authority remain different verification gates.

This documentation is strictly research-only and does **not** create a new Calendar or modify the user's existing Ad Orientem Calendar, Mass reader, prayers or Roman liturgical source-of-truth.
