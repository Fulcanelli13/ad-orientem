# Catholic customs registry — Mueller and Kelly complete-online-text source screening (23 October 2026)

## Scope and source witnesses

A **new 204-observation source-action batch** was transcribed as concise independently worded research labels from EWTN's online versions of:

1. Therese Mueller, *Our Children's Year of Grace*. The online opening explicitly identifies fifth edition 1955 and original copyright 1943, with the same author's Advent, Christmas, pre-Lent, Lent, Easter, Pentecost, and Time After Pentecost chapters. **122 observations** with EWTN text-line anchors within 122–317. <https://www.ewtn.com/catholicism/library/our-childrens-year-of-grace-10488>
2. Rev. George A. Kelly, *The Catholic Family Handbook* (Random House 1959, imprimatur dated 22 August 1959), **chapter 16 religious practices in the home**. **82 observations** from EWTN lines 1477–1549. <https://www.ewtn.com/catholicism/library/catholic-family-handbook-10441>

The source material was read as **one online textual witness per book**. This is not a certified line-by-line check against original physical editions, and Kelly's other chapters were not scanned exhaustively for customs. **No original printed-page numbers are asserted.** EWTN line numbers are page-render positions that may shift, so recheck the URL and surrounding prose when verifying.

## Concrete examples and source-critical notes

- **Advent and Christmas:** Mueller's hanging four-candle wreath (128–135), staged Nativity crib and family Gospel (159–168), St John's blessed wine and cup passing (169–170), Epiphany household chalk and food blessing descriptions (180–184).
- **Pre-Lent and Holy Week:** farewell to Alleluia (Mueller 206), burning old household palm (213), Holy Week palms (223–224), cathedral Triduum attendance and home meal customs (227–230).
- **Easter through Pentecost:** household baptismal vow renewal and blessed-water sprinkling (238–239), blessed Easter foods (247–248), Pentecost prayer and crafted dove decoration (258–266).
- **Corpus Christi and Assumption:** processional decorated roads, house fronts and stations (Mueller 291); wild-herb bouquets and distribution after Assumption blessing (305–307), the latter explicitly rooted in Mueller's childhood rural memory.
- **Regional traditions newly located in Kelly:** French straw for the manger (1498), German Christ candle (1500), Irish three candles and hospitality door (1501), Slovak reunion supper (1501–1502) and Polish opłatek with reconciliation (1502–1503).
- **Personal devotional milestones:** baptism anniversary candle, name day, First Communion, Confirmation, and traditional sickroom preparation (Kelly 1538–1549).

An observation can be a historic action report, the author's first-person memory, an author-recommended adaptation, a current/historical parish sacramental, or a component of a larger custom. **Not every record is a distinct custom.** Different authors' descriptions can be derivative of Weiser or one another. Even where regional terms are present, this does not prove regional prevalence, age, or current use.

### Source-level nonapproval locks

EWTN reproduces historical wording; an author's description does **not** establish exact liturgical authorization, ministerial role or ritual text under the 1962 Roman Ritual. Especially requiring independent checks: Epiphany blessings and prayers, St John's blessed wine, religious-house visitation, domestic Candlemas procession, burning palms, Easter food blessings, Holy Saturday holy-water practices, and Kelly's 1959 sickroom directions. Do not take a 1959 disciplinary description as currently binding law.

## Accounting and preservation

| Layer | Current research rows |
| --- | ---: |
| Weiser base + overlapping granular details | 1,025 |
| McLoughlin EWTN observations | 70 |
| Stokes EWTN action observations | 198 |
| Trapp/Berger/Newland CatholicCulture excerpts | 132 |
| **Mueller EWTN passage-specific action observations** | **122** |
| **Kelly EWTN chapter 16 action observations** | **82** |
| **TOTAL source/detail rows** | **1,629** |

Original provisional group worklist **408**, unchanged; earlier master identities **56**, unchanged. **Zero certified new distinct customs and zero Calendar/app publications.**

The batch is persisted in:
- `data/customs/master/mueller-1955-kelly-1959-ewtn-action-intake.v1.json` — 204 IDs, claim classes, paragraph-line evidence locators.
- `data/customs/master/comprehensive-customs-working-catalogue.v1.json` — all 204 references integrated noncanonically, source count 1,629.
- `data/customs/master/mueller-kelly-204-cross-source-candidate-review.v1.json` — 204 independently routed records, **380 lexical comparisons across 138 records**; remaining 66 have no lexical hit. **0** equivalence, source-independence or ecclesiastical validation judgments made. These links are *search leads*, not verified overlap conclusions.
- `tests/customs-full-registry-census.mjs` — nonloss tests, line bounds, source IDs, aggregate accounting, cross-source target validity and mandatory nonpromotion.

## Next gates

1. **Triage 380 retrieval leads at action level**: same practice, subpractice, different feast, different regional setting, author-reused material, or only similar vocabulary. Keep the previous 132-excerpt comparison queue independent until adjudication; do not silently merge.
2. Validate **source dependence**: Kelly, Stokes, Mueller, McLoughlin, Weiser and the earlier author excerpts often describe the same religious customs. Confirm quotation/citation provenance before claiming genuine independent corroboration.
3. Expand beyond U.S. English-language mid-century household witnesses. Obtain independent **Irish, French and Italian historical and ethnographic documentary sources** and regional evidence with actual page or stable web locators.
4. Continue omitted Weiser Handbook **222 printed pages without second-pass detailed observation locations**; only exhaustive passage-level checks can close that gate.
5. No Calendar, Mass, prayers, liturgical engine, existing source-of-truth identifiers or published-custom mutations.

## Interpretation of progress

The **204 rows are real source-extracted action details**. The **380 lexical links are candidate associations**. Neither number is a tally of independently verified new historical customs. This wave makes the existing corpus wider and easier to cross-check without prematurely inventing a definitive census.
