# Living Sanctoral — Phase 2 source-bound pilot (15 October 2026)

**Canonical issue:** [#1224](https://github.com/Fulcanelli13/ad-orientem/issues/1224)  
**Status:** source-ID reconciliation completed for all 70 protected third-class feasts and 34/38 Doctors; six-person devotional projection is **not wired to runtime**. Not a complete post-1960 canonisations census.  
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
| Teresa of Ávila | Protected 15 October 1962 feast, 1970 Doctor | Principal identity `sancti:10-15:3:w` recovered from both archived resolver years; title/profile addition remains unimplemented |
| Irenaeus of Lyon | 2022 Doctor title | 1962 identity `sancti:07-03r:3:r` recovered from both archived resolver years; Doctor title remains a separate later status |

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

**Status distinction:** The list is an identity census corroborated by a published July 2026 38-Doctor compilation plus USCCB's 38th Doctor report; it is **not** a primary-source certification of all 38 entries. The archived 2024/2027 production day resolver now directly attests **34 of 38** Doctor source identities, including displaced observances; four have no matched older-calendar entry in this audit. This does not certify the original printed books or the entire Doctors recognition source corpus. See `node tests/calendar-doctors-roster-review.mjs`.


## Protected-feast annex transcription

`data/calendar/cum-sanctissima-protected-third-class.review.v1.json` enumerates **all 70** protected third-class feasts from the Vatican decree annex, grouped across 12 months. Titles are explanatory English review labels; **all 70 exact class-III resolver IDs have now been recovered from the archived 2024/2027 day-sweep**. Never apply a date-only rule to change a liturgical day. The Calendar must match the actual observed feast and source identity. Test: `node tests/calendar-cum-sanctissima-protected-annex.mjs`.

This is a completed source-list transcription, **not** a certified rubrical evaluator, day override or permission to celebrate an alternate Mass.

## 15 October — source-ID reconciliation with the archived full-year audit

Recovered the original CI evidence from the [9 October full-year calendar audit](https://github.com/Fulcanelli13/ad-orientem/actions/runs/37941952423), artifact `calendar-1962-full-year-comparison`, `calendar-1962-full-year-audit.json`, **731 dated rows** (366 in 2024, 365 in 2027). Each record exposes production `day.main`, its exact rank-bearing ID, and where relevant a `displaced` list of recorded source candidates. Archive audit itself states **AUDITED_NOT_CERTIFIED**.

**Protected annex: 70/70 identities matched**, each as one III-class `sancti:...` identity attested in **both** years. Examples:
- 25 January: `sancti:01-25r:3:w` (Conversion of St Paul; separate Peter commemoration retained)
- 3 October: `sancti:10-03:3:w` (St Thérèse)
- 15 October: `sancti:10-15:3:w` (St Teresa)
- 18 November: `sancti:11-18r:3:w` (Dedication of the two Basilicas)
- 13 December: `sancti:12-13r:3:r` (St Lucy)

**Doctors: 34/38 older-calendar source identities recovered** in those same dated 2024/2027 principal/displaced rows. The four without such an entry are John of Ávila, Hildegard of Bingen, Gregory of Narek and John Henry Newman. This is an audit finding for this 1962 dataset, not an assertion that those saints lack legitimate modern feasts, particular calendars, or cults. Example: `sancti:07-03r:3:r` is St Irenaeus (traditional 3 July); `sancti:02-23r:3:w` is St Peter Damian even where displaced by the Lenten feria.

Source identity recovery must **not** be misreported as permission for an optional Mass or liturgical certification. The ongoing review is: comprehensive post-1960 canonisation register; correct general vs particular liturgical dates; approved text availability; 2020 decree eligibility (with protected-feast and temporal collisions); and finally a reviewed Calendar secondary display.

### Presentation logic staged but not activated

`src/calendar/living-sanctoral.js` now provides a pure date-aware presentation projection, with no imports into `calendar-runtime.js` or `src/home`. It enforces saint canonisation date, Doctor declaration date, publication date of documented new General Calendar entries, source-presence, and suppression of a secondary duplicate when the principal 1962 source ID matches even if rank/colour suffixes differ.

No calendar/Proper/Office calculation or celebrant choice has been changed. CI checks are isolated in `.github/workflows/calendar-living-sanctoral.yml`. Four tests must pass, but CI passing would **not** constitute independent theological certification.


## 15 October — official post-1960 canonisation intake, batch 1

**Canonical source:** [Dicastery year index](https://www.causesanti.va/it/celebrazioni/canonizzazioni.html). The index identifies **51 post-cutoff years with entries from 1961–2025**; absence of a year (especially 2026) is not a claim that no canonisation occurred. The 1960 index has canonisations in May and June, both before the 26 July 1960 threshold.

**Year progress: 9/51 sources transcribed.** Staged 2014, 2016, 2017, 2018, 2019, 2021, 2022, 2024 and 2025. Remaining 42 indexed years appear individually in `data/calendar/post1960-canonizations.source-year-coverage.v1.json`.

**Event census:** `data/calendar/post1960-canonizations.official-batch1.v1.json` now has 19 documented canonisation events, **67 individually named saints**, and three **unexpanded** canonisation groups comprising **57 persons** (eleven Martyrs of Damascus, sixteen Carmelites of Compiègne, thirty Martyrs of Brazil). Group counts do *not* count as completed person-level saint records. The ordinary vs equivalent canonisation event type is separately preserved; no memorial date is assumed from canonisation.

**Canonical person reconciliation:** `src/calendar/sanctoral-person-reconciliation.js` combines the pilot six with the 67 source-indexed named saints by one stable person ID; exactly **71 unique canonical people** in the current *research* input, since Newman and Carlo Acutis are shared. The source records are not published as a competing saints registry or automatically included on homepage. If an event date conflicts with a prior recognised date, reconciliation throws rather than silently overwriting.

**Conservative rubrical review:** `src/calendar/optional-post1960-saint-review.js` classifies an individually canonised post-26-July-1960 saint's optional 1962 Mass as blocked (I/II class or an exactly matched protected III-class feast), unresolved (missing universal memorial, rank, verified day or annex), or **candidate requiring review** (III/IV class with no established blocker). It does not presume a celebrant's actual Mass, select propers, grant competence/permissions, settle votive Mass provisions, or modify commemorations. For the test cases: Newman on 9 October 2026 is a candidate only; Padre Pio on 23 September 2026 is blocked by Ember Wednesday II class; Carlo's universal memorial remains unresolved.

**Acceptance tests:** the `calendar-living-sanctoral.yml` workflow now executes seven structural/reconciliation/rubrical tests, preserving the historical source audit. Success verifies schema and conservative logic only, not a theological or legal attestation.

**Remaining scope:** full coverage of the 42 years, group-member expansion, audit of modern universal vs particular dates and promulgation dates, review of special Mass/Office cases under *Cum sanctissima* and subsequent norms, and then non-invasive visual integration with saints profiles and artwork. No live Calendar/Proper/reader files have been modified.
