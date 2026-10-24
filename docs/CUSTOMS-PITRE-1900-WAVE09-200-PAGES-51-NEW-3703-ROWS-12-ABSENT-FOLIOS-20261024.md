# Pitrè 1900 — Wave09: 200 no-observation folios screened; 51 new sourced research observations

**24 October 2026. Draft PR #1572. Research-only. No app, Calendar, rite or distinct-custom publication.**

## Results and denominators

| Gate | Before Wave09 | Wave09 result |
| --- | ---: | ---: |
| Total undeduplicated cross-source research observations/details | 3,652 | **3,703 (+51)** |
| Original-edition Pitrè 1900 research rows | 667 | **718 (+51)** |
| Numbered chapters represented by original-edition source observations | 60/60 | **60/60** |
| Main printed pages with one or more indexed source observations | 307/560 | **358/560** |
| Main printed pages with no indexed source observations | 253/560 | **202/560** |
| New gap folio locations opened in original 1900 PDF for systematic text-layer screening | — | **200** |
| Screened gap folios with substantial extracted source text | — | **183** |
| Screened gap folios containing illustration / fewer than 100 text characters | — | **17** |
| Machine keyword-hit sentence fragments generated for review | — | **438** (noncanonical leads) |
| Manually worded source action observations with original printed page and short Italian anchor | — | **51** |
| 51 new anchors directly normalized-matched to their assigned original PDF text pages | — | **51/51** |
| Original numbered folios not present in either available 632-page scan | — | **12** |
| Exhaustively line-audited chapter sections / authenticated unique customs | 0/60 / 0 | **0/60 / 0** |
| App, Calendar, or Roman Ritual permissions newly established | 0 | **0** |

The **200-page screening batch is real original-PDF text reading and noncanonical action extraction**, but *not* a 200-page full-image visual certification nor a declaration that each paragraph was exhausted for every possible action or historical custom. The 438 keyword hits include cultural context, repeated assertions, quotations, legends and unrelated festival descriptions; counting all 438 as source observations would be misleading. The source workbench only adds 51 original-edition, source-located and explicitly provisional action descriptions.

**Scanned source:** Giuseppe Pitrè, *Feste patronali in Sicilia* (1900), University of Michigan scan / Internet Archive `afm3499.0021.001.umich.edu`. Compressed searchable PDF SHA-256:
`100e2b3164bd7a342c5c0c5d01df2a60b4635d5695dea456e9b93769866ee5ee`.
The 22.8-MB original binary contains the same 632 scan pages; it has not been added to GitHub or any paid storage. Source pagination was checked against existing catalogue locators across 307 earlier indexed printed folios. The segmented body has **548 scanned printed folios corresponding to 560 originally numbered pages**.

## An important source defect: 12 unavailable numbered folios

The scan jumps over these original numbered main-text folios:

- **pp. 7–10**, within chapter I / Santa Rosalia;
- **pp. 23–26**, within chapter I / Santa Rosalia;
- **pp. 151–154**, within chapter XII / Messina Assumption.

The document's consistent scan-page-offset progression is printed **1–6 → PDF +70**, **11–22 → PDF +66**, **27–150 → PDF +62**, and **155–560 → PDF +58**. These same page-number jumps occur in the compressed PDF and the original 22.8-MB scan. A page that is absent must **not** be fabricated by reading an adjacent page under the missing number. Those 12 stay on an explicit external-source-acquisition queue, not on a completed-page register. The reason why the scan omitted them (scan/digitization or edition/plate arrangement) remains unresolved until another independent facsimile is checked.

## What was added

51 strictly historical-source descriptions on 51 previously no-observation pages in 23 chapters. Representative entries:

- Palermo Santa Rosalia: makeshift street altars, replacement candles, festive fruit-cart displays and small clay devotional figurines.
- Palermo Saint Francis of Paola: first-thirteen-Friday devotion, counted pilgrimage prayer, confraternity office renewal and gardeners' agricultural statue procession.
- Messina Assumption: staged Marian figure enthroned at the high altar and donations supporting the chosen participant's dowry.
- Catania Saint Agatha: processional Candelore guild precedence, Wednesday ribboned votive candles, relic transfer and differentiated fercolo attendants.
- Saint Calogero: dated festivities and octave, ornamented gift-baskets, bearer shifts, mountain pilgrimage, historically reported bread offerings and extreme penances. Any supposed curative efficacy is **folk belief, not accepted medical or devotional truth**.
- Campobello's Madonna dell'Aiuto: now-abolished pasta gifts and a smaller Monday continuation; keep **Campobello (chapter XL)** distinct from Villafranca (chapter XLI).
- Calatafimi Crucifix: laurel-and-bread cart, folk loaf distribution and children's processional song.
- Santa Caterina: apicultural income donations and collected baker's dough for the Marian feast.

No newly indexed record has a certified independent witness, unique customary identity, approved liturgical rite, or verified present continuity. The 51 new rows in `comprehensive-customs-working-catalogue.v1.json` have preserved research IDs `PIT1900-W09-OBS-001` through `-051`, noncanonical source provenance, explicit source SHA and original page/PDF page, normalized Italian OCR search anchors, and false publication / ecclesiastical-authority gates.

## Why the remaining 202 printed-page gaps are not all identical

After indexing the 51 pages, the remaining no-observation queue is **202/560**:

1. **41** additional available printed folios not selected for this Wave09 200-page screening.
2. **149** previously screened pages without a newly accepted indexed observation. This includes image-heavy pages with little OCR, historical context, folk-legend leads, and pages requiring fuller passage review. They are **not proved empty of customs**.
3. **12** source folios missing outright from both available PDFs and requiring independent acquisition.

This is the new research workload; neither the 358 indexed pages nor any 60 chapter is classified as exhaustive.

## Integrity and future research

Committed files:

- `data/customs/master/pitre-1900-wave09-200-original-page-screening.v1.json` — individual 200 source folio-to-PDF mapping, 438 heuristic text-hit totals, text/illustration states, 12 absent-folio documentation.
- `data/customs/master/pitre-1900-wave09-200-page-action-staging.v1.json` — original research stage of 51 selectively described action observations, retaining its original unverified acceptance flags as dated provenance.
- `data/customs/master/comprehensive-customs-working-catalogue.v1.json` — **51 added source observation rows, 3,703 total** with post-stage exact normalized OCR anchor confirmation, all higher-level authority and publication flags false.
- `data/customs/master/pitre-1900-wave09-post-intake-560-page-coverage.v1.json` — separate updated 358/202 page matrix; Wave08 snapshot preserved.
- `data/customs/master/pitre-1900-complete-60-chapter-source-coverage-inventory.v1.json` — current 3,703 / 718 and 358/202 counters, while keeping original table-of-contents and corrected body chapter-boundary facts.
- `tests/customs-pitre-1900-wave09-200-page-source-integrity.mjs` — 200 source folios, original printed/PDF mapping, 51 ID nonloss, remaining 202 source gaps, 12 original scan absences and zero publication.
- `.github/workflows/customs-master-integrity.yml` — Wave09 regression gate.

**Next wave:** (1) review the still-unindexed **41 available folios** plus selected complex pages from the 149 screened-but-not-indexed pool; (2) acquire or independently verify the 12 missing numbered folios; (3) do true full-folio-image reviews and exact paragraph-level source separation in highest-value chapters; (4) deduplicate across the already indexed source details before any theological and Calendar presentation work. No reason to repeat already completed prior master classifications.

No paid storage, no Customs Atlas or new Calendar. The existing Ad Orientem Calendar remains the eventual context-sensitive surface for verified customs.
