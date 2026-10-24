# Independent customs registry — McLoughlin source intake (23 October 2026)

## Scope and evidence

A new author/source was added to the comprehensive historical Catholic customs research corpus, without filtering for Ad Orientem UI, geography or publication priority.

**Author:** Helen McLoughlin. **Work:** *Family Advent Customs*, originally published by the Liturgical Press in 1954 (36-page booklet). **Accessible full online textual witness:** EWTN, <https://www.ewtn.com/catholicism/library/family-advent-customs-10412>.

### Source-edition warning

The EWTN online transcription carries an original 1954 imprint but contains later address details with US ZIP codes (which postdate 1954). It may therefore reproduce later revisions or annotations. **Do not claim every online sentence appears in the first 1954 edition.** Evidence locators in the new data are *EWTN HTML line ranges*, not unverifiable 1954 printed page numbers.

The booklet acknowledges reproducing source information from Francis X. Weiser's *The Christmas Book* and recipes from Florence Berger's *Cooking for Christ*. Such inherited passages are **not independent corroboration** for their underlying historical claims. McLoughlin's personal household descriptions are first-person testimony of an adopted practice but not proof of a regional tradition's origins or universal observance.

## Completed source extraction

- **70 explicitly source-located observations** with independently worded labels and original EWTN line ranges, across **15 textual headings**.
- Claims tagged individually: 46 author's own family practices; 4 wider reported customs; 4 proposed rites/blessing authority claims; 4 regional reported customs; 6 feast-food recipes; 3 origin/historical claims; 2 suggested adaptations; 1 comparative other-rite passage.
- Observations grouped in **26 reversible action-family clusters**, each containing an exact set of the original 70 IDs. **11** families have at least one proposed match to earlier master/provisional groups; **15** have no such confirmed candidate relation.
- Zero automatic identity merges; zero unique-new-custom certifications; zero app publication changes.
- Home blessing formulae and ministerial/lay agency need an independent liturgical-source audit before ever being presented as authorized rites. The source describes practices, not the Church's guarantee of a 1962 Roman Ritual formula.

### Illustrative independently recorded details

| Source heading | Attested actions, or explicitly authored proposals |
|---|---|
| Advent wreath | Domestic blessing with holy water, weekly family collects, adding stars, transferring wreath decor to Christmas |
| Stir-up Sunday | Preparing Christmas pudding early in Advent, each family member stirring and saying the day's collect |
| Gifts for Jesus | Children's individual straw-filled good-deeds mangers, an Infant figure at Christmas, Advent wheat seeds grown for the crib |
| Advent prayers | Household pre-meal Lauds/Vespers versicles, seasonal Gospel readings, singing Advent hymns |
| Saint Nicholas | Distributed gift days, biscuit and Bishopwyn party, donating presents to poorer children |
| Mary Candle | White-veiled candle, Christ Child image, blue-ribbon Marian candle on the Immaculate Conception |
| Saint Lucy | Swedish saffron cat-shaped buns at the feast |
| Children's Advent | Household Gospel dramas, handmade Nativity figurines, portrait banners at the crib |
| Advent House | Seven symbol-windows linked to the O Antiphons, opened December 17–23 |
| Tree and food | Jesse-tree figures, French brioche, German stollen, Greek Melachrino, Italian cassata, English mince-pie manger |
| Christmas Eve | Candlelit domestic procession with Infant Jesus, Martyrology proclamation, Magnificat, Gospel, domestic crib/tree blessing |

Some are newly indexed **practices as used in the McLoughlin family**, not objectively distinct Catholic customs. These deserve preservation as documented 20th-century domestic models even if not independently older or regionally widespread.

## Registry accounting

| Layer | Source rows / working groups |
|---|---:|
| 1958 Weiser Handbook base observations incl. six prior omissions | 574 |
| Weiser *Religious Customs in the Family* direct-scan observations | 111 |
| Additional nested Weiser Handbook action/details | 340 |
| **Weiser research rows before McLoughlin** | **1,025** |
| New McLoughlin online source observations | **70** |
| **Total indexed research source/detail rows** | **1,095** |
| Existing provisional Weiser action groups | 408 |
| Additional McLoughlin *action-family clusters* | 26 |
| Final distinct Catholic customs established | **Not determined** |

**Do not sum 408+26 as distinct customs.** The 26 are an additional author/source grouping and can correspond to earlier Weiser group identities or be proposed household adaptations, combinations or historically attested variants.

## Added data and tests

- `data/customs/master/mcloughlin-family-advent-fulltext-ewtn-first-pass.v1.json`: 70 source records, URL and EWTN line anchors; source type distinguishing first-person vs wider vs ritual vs historical claims.
- `data/customs/master/mcloughlin-family-advent-action-family-reconciliation.v1.json`: 26 full-coverage nonmerging action clusters, all 70 original IDs represented exactly once.
- `data/customs/master/comprehensive-customs-working-catalogue.v1.json`: integrated third source alongside earlier 1,025 Weiser rows, with separate accounting.
- `tests/customs-full-registry-census.mjs`: source count, full-coverage mapping, existing ID references, source locator validity, app nonpublication assertions.

## Next research gates

1. Acquire original 1954 print edition for a text-variant comparison with the EWTN transcription; record evidence claims only to the edition actually read.
2. Read *Cooking for Christ* (Florence Berger), cited repeatedly by McLoughlin, as a separate source only when actual pages can be inspected.
3. Add independent liturgical-year household sources (e.g. Maria von Trapp, Mary Reed Newland), recording direct text passages and similarities without treating later quotation as independent evidence.
4. Return to the Handbook's 222 main-text pages with no new second-pass detailed action location; aim for actual page-by-page completeness gates, not inflated source-row counts.
5. Resolve the 408+26 practice-family clusters against their underlying actions, places, variants and periods, without collapsing related but distinct Catholic customs.

Ad Orientem integration, geographical targeting, devotional instructions, release approvals and UI remain outside this work.
