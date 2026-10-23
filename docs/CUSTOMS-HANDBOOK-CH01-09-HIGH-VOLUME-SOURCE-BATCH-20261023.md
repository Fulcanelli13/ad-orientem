# Weiser Handbook — high-volume second-pass chapters 1–9 (23 October 2026)

This research branch is source-first and separate from Ad Orientem content publication. **No Calendar, Mass, Prayer, Saints, or UI implementation changes.**

## Batch delivered

**162 source-located detail records** from Handbook chapters 1–9, following the original printed text and a searchable OCR witness. The first batch captured **41** details from Sunday, weekday prayer, Ember Days and Rogations (chapters 1–4), and the second captured **121** details from Advent, Nativity, Christmas hymns and carols, Christmas symbols, and Christmas foods (chapters 5–9).

**34** of the 162 observations have no suitable direct parent in the previous 568-record index and are marked **POTENTIALLY_UNINDEXED_SOURCE_ACTION_REVIEW**. They are not newly approved *distinct customs* until their identity is reconciled. The remainder are retained as narrowed descriptions, local variants, historical uses, or specific actions found within earlier general Weiser passages.

There are **0 new verified distinct custom identities** and **0 app publications** in this batch.

## Examples recovered

### Weekly life and Rogations

- Medieval *horaria* and lay prayer from Books of Hours, memorized psalter substitutions, hourly Passion prayers and vernacular Office reading.
- Sunday family catechesis at meals and marking the Sign of the Cross on new Sunday bread.
- Sunday churchyard circuits praying at graves, Thursday Eucharistic High Mass with household attendance, Thursday Holy Hour, home Sacred Heart Friday lamps.
- Ember-day charitable baths for the poor and prayer for expectant mothers.
- Rogation bells, field and orchard sprinkling, visits by nearby villages converging for Mass, private homestead litanies, and historical local weather processions.

### Advent and Nativity

- Historical Eastern fasts **kept distinct from the Roman Advent discipline**.
- Household Advent wreath prayers and candle-lighting roles, children's Christmas letters, Advent calendar and good-deeds straw.
- Marian-image relay and Saint Joseph schoolchildren's image-carrying rounds.
- *Herbergsuchen*, *Posadas* and associated games, plus **pre-dawn Rorate Mass lantern attendance**.
- Central European Saint Thomas's Eve farmyard blessing rounds, described separately from superstition and masked noise rituals.
- Christmas Eve handbell-gift signaling, straw bedding, household reconciliation, bird feeding and extra farm fodder.
- Historical Christmas Eve bell tolling, carols from church towers, the Bethlehem Christ Child figure procession, French *réveillon*, Spanish street musicians.

### Christmas carols, images and food

- Native Christmas mission hymn gatherings, organized Boston street carollers, French Canadian *guignolée*, Polish and Hungarian illuminated-star rounds.
- Old Christmas dance carols and historical church-specific customs; Tyrolean cradle rocking, house-to-house Child Jesus figure devotions, carol-yodelling.
- Slavic blessed Christmas candles placed in bread, three-wick Trinity candles, Irish window candles, Christmas pyramids, religious door wreaths and popular holly, mistletoe, and Barbara branches with disputed magical claims clearly flagged.
- German decorated edible tree pastries, Lithuanian festive pastry balls, Spanish almond sweets, Venezuelan hallaca, French-Canadian household sweets, Scandinavian animal-shaped Christmas breads, English historical boar's head and manger-shaped mince pies.

## Revised audited counts

| Dataset | Count | What it actually means |
|---|---:|---|
| Original Handbook first-pass source observations | 568 | Research index, not comprehensive edition audit |
| Previously page-inspected Handbook omissions | +6 | Distinctly numbered **source observations**, not necessarily new distinct customs |
| **Handbook base observations** | **574** | Kept separate from narrower paragraphs |
| Second Weiser family book base observations | 111 | First source-wide pass, not exhaustive |
| **Base source observations across two Weiser books** | **685** | The prior preview duplicates are not added |
| Detail records, chapters 1–4 | 41 | **12** possible unindexed source actions |
| Detail records, chapters 5–9 | 121 | **22** possible unindexed source actions |
| Detail records, chapters 10–13 | 57 | Parent-linked details |
| Detail records, chapters 14–28 | 121 | Parent-linked details |
| **Total fine-grained details** | **340** | May overlap existing practices |
| **All independent research rows** | **1,025** | 685 base observations + 340 details; **not 1,025 customs** |
| Provisional custom, variant or historical practice groups | 347 | Overlaps with existing identities; **not certified distinct** |
| Existing source master identities | 56 | Separate prior identities, possible overlap |
| New confirmed unique customs released to app | 0 | No app integration |

## Source-location integrity and remaining gap

The source citations are **printed page number** plus line interval in a public searchable witness:

- 1958 image-scan edition: https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf
- Public OCR: https://www.scribd.com/document/447017805/Handbook-of-Christian-Feasts-and-Customs
- The original edition's main text uses `PDF zero-based page = printed page + 17`, verified visually for selected printed pages including 12, 18, 21, 55, 58, 96 and 118.
- All labels are newly written source fact descriptions. The book's text is not reproduced at length.
- Some named practices were historically discontinued, non-Catholic, from another rite, or carry disputed folk-benefit claims. Their admission to a **historical research register** does not endorse practice, efficacy or current universality.

**Page-location ledger:** `data/customs/master/weiser-1958-second-pass-page-coverage.v1.json` enumerates **28 chapters** covering **342 printed main-text pages**. New source-detail rows have localities on **120 unique printed pages**; **222 pages have no new fine-grained detail location** in the second-pass files. This does **not** establish that the remaining 222 pages lack customs; many were indexed in the earlier 568-observation pass. Nor do the 120 touched pages constitute 120 exhaustively read pages. **0 chapters and 0 pages are certified as rechecked line by line for exhaustive completeness.**

The key strategic next steps are (1) advance full-page source coverage of all 28 chapters to detect further unindexed practices, (2) adjudicate 34 orphaned new action descriptions and deduplicate all 340 details against the 347 provisional groups and 56 previous identities, and (3) expand independent source books; keep every regional variant and source witness in place. Do not introduce publication priorities yet.

## Committed files

- `data/customs/master/weiser-handbook-targeted-addendum-ch01-04.v1.json`
- `data/customs/master/weiser-handbook-targeted-addendum-ch05-09.v1.json`
- `data/customs/master/weiser-1958-second-pass-page-coverage.v1.json`
- `data/customs/master/comprehensive-customs-working-catalogue.v1.json` updated
- `tests/customs-full-registry-census.mjs` extended

All results remain in draft PR #1572, dependent on draft research master PR #1536.

## Same-turn supplemental identity grouping (after the source extraction)

A second manual check classified all **34** source details without a suitable match in the earlier 568-observation Handbook index. Rather than assign them to a possibly unrelated existing identity, the reviewer recorded **24 provisional practice-identity leads** and **10 other relationships**: **3 reported folk beliefs**, **2 potential variants of older observations**, **2 historical civic contexts**, **1 liturgical/rubric context**, and **2 comparative other-rite discussions**. Original evidence locators and null relations remain preserved in `weiser-ch01-09-unindexed-leads-adjudication.v1.json`.

This increases the **provisional practice-group working population from 347 to 371** (308 original + 39 historical + 24 early-orphan leads). The 56 master identity records are separate and may duplicate or contextualize these groups. The new 24 labels are **not** yet independent evidence of 24 distinct living Catholic customs, and some specifically concern historical customs or mixed Christian-season folk practice.

The unified `comprehensive-customs-working-catalogue.v1.json` now includes these 24 proposals under `provisional_unindexed_practice_leads`; source observation totals remain **685 base + 340 nested = 1,025 research rows**. No new source observations, no app publications, and no claim that a page was comprehensively verified came from this classification step.
