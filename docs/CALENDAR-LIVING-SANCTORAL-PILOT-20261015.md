# Living Sanctoral — Phase 2 source-bound pilot (15 October 2026)

**Canonical issue:** [#1224](https://github.com/Fulcanelli13/ad-orientem/issues/1224)  
**Status:** `RESEARCH_ONLY_NOT_RUNTIME`. Six exemplar saints only; **not** the complete Doctors / post-1960 canonisations census.  
**Canonical baseline:** `main` 1962 Calendar and shared day/Proper resolver. No mass-text, rank, colour, commemoration or selected-formulary override in this pilot.

## Existing production ownership discovered

- `src/calendar/calendar-runtime.js`: Day/Month/Year UI and Month Sanctorale listing, presently projected from resolved 1962 principal entries, not a complete contemporary saints catalogue.
- `src/calendar/observance-title.js`: specific bilingual source-ID aliases; contains `sancti:10-03` for St Thérèse. This is a display alias, not a saint-master registry.
- `src/calendar/intelligence.js` and `src/calendar/devotional-registry.js`: recurring practices, novenas, other devotional/semantic date links. Do not append newly canonised saints to this practice register as a substitute for an authoritative saints table.
- Calendar currently routes principal `today.saint` detail via the existing module. Any new living-sanctoral profile should resolve canonical saint IDs without displacing the principal calendar date.
- `src/home/`: consume Calendar projections and the existing sacred-art registry. Do not make a second date engine.
- `docs/CALENDAR-1962-EDITORIAL-CROSSWALK-20261009.md`: 132 historical crosswalk flags already dispositioned. Do not reopen them as new sanctoral bugs.

## Documents and interpretation

1. [*Cum sanctissima*, CDF decree of 22 February 2020](https://www.vatican.va/roman_curia/congregations/cfaith/documents/rc_con_cfaith_doc_20200222_decreto-cum-sanctissima_en.html): post-26-July-1960 saint rule, optional festive Mass, protected list, other rubrical conditions.
2. [CDF explanatory note](https://www.vatican.va/roman_curia/congregations/cfaith/documents/rc_con_cfaith_doc_20200222_nota-decreto-cumsanctissima_en.html): the older calendar may continue unchanged; optional alternatives must meet the rules and pastoral judgment.
3. [Newman's addition to the *current* Roman General Calendar](https://press.vatican.va/content/salastampa/en/bollettino/pubblico/2026/02/03/260203a.html): 9 October optional memorial. This is **not** itself an approved 1962 proper-text supplement.
4. [General 1960 rubrics](https://www.vatican.va/archive/aas/documents/AAS-52-1960-ocr.pdf): precedence, commemoration, temporal and sanctoral rules.
5. [*Traditionis custodes*](https://www.vatican.va/content/francesco/en/motu_proprio/documents/20210716-motu-proprio-traditionis-custodes.html): later legal context. Any claimed permission under a particular diocesan/institute practice must be independently documented, not inferred from a client-side app.

## First pilot

`data/calendar/living-sanctoral-pilot.v1.json` contains six source-linked exemplars:

| Person | Purpose | Provisional state |
|---|---|---|
| John Henry Newman | 2019 canonisation, 2025 Doctor, 2026 published general-calendar decree | Universal date witnessed; *1962* optional-Mass eligibility NOT computed |
| Pio of Pietrelcina | 2002 canonisation; 23 September modern memorial | No override of 2026 Ember Wednesday |
| Carlo Acutis | 2025 canonisation | A universal-calendar memorial date has **not** been verified by this pass; not automatically eligible on an assumed date |
| Thérèse of Lisieux | Protected 3 October 1962 feast, 1997 Doctor | Update title/profile only; feast retained |
| Teresa of Ávila | Protected 15 October 1962 feast, 1970 Doctor | Update title/profile only; principal resolver ID still to be verified |
| Irenaeus of Lyon | 2022 Doctor title | Older-calendar identity/date remains to be confirmed before projection |

Every asserted status has a linked source ID; missing material remains flagged rather than invented. One canonical person ID can later serve Calendar, Saint of the Day, image registry and Map of Saints.

## Acceptance gates before promotion

- Inventory and reconcile the *actual* resolved 1962 saint identities and cross-references. Determine baseline counts independently; no completeness percentages until both numerator and denominator exist.
- Assemble the full post-1960 canonisations list and full Doctors roster as of the review date, recording decree date, original source, universal/particular date authority, and any merge with existing saint.
- Curate the exact 70 protected third-class observances from the *Cum sanctissima* annex, with source IDs, aliases and collision tests.
- Build a **pure** eligibility function that consumes the already resolved date/rank: legal eligibility ≠ local authorisation ≠ actual celebrant selection. No date-only override.
- Date-aware sainthood and doctor-title displays; do not retroject a later recognition into historical years.
- Run special cases (9 Oct Newman/Leonardi, 15 Oct Teresa, 3 Oct Thérèse, 23 Sep 2026 Padre Pio/Ember Wednesday, local Blessed, Sundays, vigils, Lent, transfers).
- Integrate only as a separate secondary visual/list layer first; Mass/Proper unchanged until its own certified crosswalk and approved text sources exist.
- Independent liturgical review and phone/CI acceptance required prior to merging any runtime integration.

## Tests

`node tests/calendar-living-sanctoral-pilot.mjs` verifies unique IDs, present primary source links, correctly segregated 1962/current calendar dates and a hard guard against inferred Mass selection. It does **not** certify every factual claim or prove that the full app UI works.

## Cross-pipeline dependencies

- Existing calendar cycle identity [#721](https://github.com/Fulcanelli13/ad-orientem/issues/721)
- Commemoration applicability [#1076](https://github.com/Fulcanelli13/ad-orientem/issues/1076)
- Sacred-art calendars [#885](https://github.com/Fulcanelli13/ad-orientem/issues/885) and [#944](https://github.com/Fulcanelli13/ad-orientem/issues/944)

No duplicate saints library, separate frontend or replacement Mass engine should arise from this workstream.


## Additional Doctor-title census gate (same branch)

`data/calendar/doctors-of-church-roster.review.v1.json` now enumerates **38 candidate Doctor identities**, reconciled to the six-person pilot IDs where they overlap. Eight Doctor declarations after 1962 have dated Holy See witnesses or index entries: Teresa of Ávila (1970), Catherine of Siena (1970), Thérèse of Lisieux (1997), John of Ávila (2012), Hildegard of Bingen (2012), Gregory of Narek (2015), Irenaeus of Lyon (2022), and John Henry Newman (2025).

**Status distinction:** The list is an identity census corroborated by a published July 2026 38-Doctor compilation plus USCCB's 38th Doctor report; it is **not** a primary-source certification of all 38 entries. Pre-1962 doctor records still require canonical ID reconciliation against the source resolver. No invented dates or feast ranks are published. See `node tests/calendar-doctors-roster-review.mjs`.


## Protected-feast annex transcription

`data/calendar/cum-sanctissima-protected-third-class.review.v1.json` enumerates **all 70** protected third-class feasts from the Vatican decree annex, grouped across 12 months. Titles are explanatory English review labels; **resolver IDs remain null pending source-ID crosswalk**. Never apply a date-only rule to change a liturgical day. The Calendar must match the actual observed feast and source identity. Test: `node tests/calendar-cum-sanctissima-protected-annex.mjs`.

This is a completed source-list transcription, **not** a certified rubrical evaluator, day override or permission to celebrate an alternate Mass.
