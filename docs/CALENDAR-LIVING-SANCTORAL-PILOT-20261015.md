# Living Sanctoral — Phase 2 source-bound pilot (15 October 2026)

**Canonical issue:** [#1224](https://github.com/Fulcanelli13/ad-orientem/issues/1224)  
**Status (15 Oct):** 70/70 protected 1962 feast IDs; 34/38 Doctors matched to old resolver; **51/51 official source-year pages transcribed** (258 named post-1960 saints, 13 cohorts); **NOT** an exhaustive person/feast-day or liturgical certification, and **NOT** wired to runtime.  
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

**Acceptance tests:** the `calendar-living-sanctoral.yml` workflow now executes eight structural/reconciliation/rubrical tests, preserving the historical source audit. Success verifies schema and conservative logic only, not a theological or legal attestation.

**Remaining scope:** full coverage of the 42 years, group-member expansion, audit of modern universal vs particular dates and promulgation dates, review of special Mass/Office cases under *Cum sanctissima* and subsequent norms, and then non-invasive visual integration with saints profiles and artwork. No live Calendar/Proper/reader files have been modified.


## 15 October — second Vatican-source census batch (eleven more years)

The **original Dicastery canonisation-year pages** were inspected and eleven previously unprocessed years transcribed into the existing census: **2004–2013 inclusive (ten years), plus 2015**. This brought the cumulative source-intake coverage to **20/51 indexed post-cutoff years** (31 indexed years pending), with **38 calendar-dated canonisation events** and **132 individually named saint records**. Six pilot identities and 132 intake people reconcile to **136 unique canonical person IDs** (Newman and Carlo Acutis occur in both and retain the same identity).

Research details requiring preserved distinctions:

- **2015-10-18:** Ludovico/Louis Martin and Maria Azelia/Zélie Guérin each receive their own canonical person ID although the Dicastery publishes them under one jointly named couple; that ceremony's named individual count is four, not three. [2015 official year](https://www.causesanti.va/it/celebrazioni/canonizzazioni/2015.html).
- **2013-05-12:** Antonio Primaldo and the Martyrs of Otranto are described by the Dicastery as **approximately 800**; there is **no certified exact individual count or full named list**. Store `memberCount:null`, `estimatedMemberCount:800` and a separate count precision. The 57 *exact* unexpanded members from Damascus, Compiègne and Brazil remain counted separately. [2013 official year](https://www.causesanti.va/it/celebrazioni/canonizzazioni/2013.html).
- **2012-05-10:** Hildegard of Bingen's canonisation is independently recorded; her Doctor title is a separate 7 October 2012 event in the Doctors roster. A single canonical identity (`saint.hildegard-bingen`) is reused, never two saints. [2012 official year](https://www.causesanti.va/it/celebrazioni/canonizzazioni/2012.html).
- Spot rechecking prior intake against [2014](https://www.causesanti.va/it/celebrazioni/canonizzazioni/2014.html), [2017](https://www.causesanti.va/it/celebrazioni/canonizzazioni/2017.html) and [2024](https://www.causesanti.va/it/celebrazioni/canonizzazioni/2024.html) supports the existing event date and jointly canonised group structures; further line-by-line review remains open.

Every newly staged person has a source-year URL and canonisation event ID. **No** newly staged person has an inferred universal feast date, optional traditional Mass, approved proper text or change to the 1962 principal observance. Groups remain unexpanded rather than being flattened into a fictitious single saint or unverified people. Reconciliation and source-year tests enforce these distinctions.

This is an auditable source-intake batch, **not** 20/51 of all persons or a claim that all indexed events are completely verified against primary decree images. The 31 remaining year-level entries and full member-name expansion are open.


## 15 October — third Vatican-source intake: 1999 and 2001–2003

Four further Dicastery year pages were inspected: [1999](https://www.causesanti.va/it/celebrazioni/canonizzazioni/1999.html), [2001](https://www.causesanti.va/it/celebrazioni/canonizzazioni/2001.html), [2002](https://www.causesanti.va/it/celebrazioni/canonizzazioni/2002.html), and [2003](https://www.causesanti.va/it/celebrazioni/canonizzazioni/2003.html).

**Cumulative published intake:** **24/51** indexed years; **27** indexed years untranscribed. **51** canonisation events, **169** individually named saint records, **5** unexpanded martyr groups with **66 exactly enumerated members**, and a *separate unverified approximate* 800-person Otranto cohort. The six-person historical pilot and 169 named source persons converge on **172 unique canonical person IDs**, reusing Newman, Carlo Acutis and (now) **Padre Pio** by the exact stable `saint.pio-pietrelcina` ID.

- **16 June 2002:** Padre Pio's canonisation is now anchored to the Dicastery and cross-checked against the pilot source; do not generate an extra saint, change the September 23 Ember Wednesday rule or import a modern Proper.
- **21 November 1999:** `Cirilo Bertrán e 8 compagni` is recorded as a Lasallian nine-martyr group, distinct from the separately named Passionist priest Innocencio de la Inmaculada. Individual identities await expansion.
- **Year 2000 intentionally remains pending**, notwithstanding that the Dicastery year page has been inspected. It separately lists the **120 Martyrs of China** as a cohort and the two named Salesian martyrs Luigi Versiglia and Callisto Caravario. Those may overlap the group's membership. **Do not naively add 120 group members plus two named individuals until the member crosswalk resolves the overlap.** A reliable group audit precedes import.

The new source records have no universal feast dates; the optional Mass eligibility evaluator and production Calendar/Proper are unchanged. The source-year denominator measures pages, not all individuals or completed legal review. The existing focused CI workflow protects cardinalities, deduplication and the mixed exact/approximate martyr-group treatment.


## 15 October — fourth intake: 2000, overlap resolved using Holy See evidence

Additional independent [Dicastery year source](https://www.causesanti.va/it/celebrazioni/canonizzazioni/2000.html) and [Holy See briefing](https://press.vatican.va/content/salastampa/it/bollettino/pubblico/2000/09/22/0550/01911.html), corroborated by the [Papal Canonisation Mass of 123 persons](https://press.vatican.va/content/salastampa/it/bollettino/pubblico/2000/10/01/0568/01964.html), resolves the earlier 2000 cohort hold.

- **1 October 2000:** the Chinese Martyrs are **one 120-person canonised cohort**, not 120 plus Luigi Versiglia and Callisto Caravario. Three members are directly represented as named person identities in the current intake: Agostino Zhao Rong, Luigi Versiglia and Callisto Caravario. The record retains the **full group size 120**, and only **117 as still-unexpanded**. Three *other* saints were canonised that day: María Josefa Sancho de Guerra, Katharine Drexel and Giuseppina Bakhita. Group 120 + other 3 = **123 total**. Do not infer a full 120-member list from this partial crosswalk.
- **21 May 2000:** Cristóbal Magallanes belongs to a **25-person Mexican martyrs group**, with 24 names unexpanded, plus two other separately named saints. The single group member is not counted twice. **30 April:** Faustina Kowalska is a distinct individual.
- **2000 all ceremonies:** the three events account for **151 canonised persons** as 1 + (25+2) + (120+3), but only **10** individuals are named in the current research corpus. The remaining **141** members from these two groups are not fabricated into person records.

**Latest cumulative counts:** **25/51** source years staged; 26 indexed years outstanding; **54 canonisation events**; **179 named individual canonised persons**; **7 martyr groups**, with **207 precisely countable unexpanded members** (including 141 in 2000) and **Otranto c. 800 as a separate approximate cohort**; after the original six pilot records are merged and three existing names reused, **182 unique canonical research person IDs**.

This is a source and identity inventory only; it does not certify new feast dates or change the 1962 Mass selection. Existing pure source-projection and eligibility tests remain in the CI pipeline.


## 15 October — final source-year intake: **51/51 Dicastery-listed post-cutoff years**

The official [Dicastery year index](https://www.causesanti.va/it/celebrazioni/canonizzazioni.html) was rechecked as of 15 October 2026. The 26 remaining listed years (1961–1977 and 1982–1998, for years actually enumerated in that index) have been transcribed from their respective original Vatican year pages. The census intake now has:

- **51/51 indexed years recorded**; no remaining *indexed year-page* transcription tasks.
- **112 recorded canonisation event dates** and **258 individually named canonised persons** in `data/calendar/post1960-canonizations.official-batch1.v1.json`.
- **13 martyr/group cohort records**, with **497 precisely countable but as-yet-unexpanded individuals** after excluding 15 already named cohort members. The **approximately 800 Martyrs of Otranto** remain a separate, expressly approximate cohort and are not treated as 800 individually verified identities.
- Reconciliation with the six-person original pilot gives **261 distinct canonical research person IDs** (Newman, Carlo Acutis and Padre Pio appear in both sources and are counted once).

**Critical distinction:** This closes **the 51 source-year-page intake**, *not* the entire global person inventory, every equivalent canonisation, or all liturgical observance metadata. Years absent from the public directory, including 2026 at the audit timestamp, have not been certified empty; future canonisations are a maintenance input.

**Cohort boundaries:** Year 1984's 103 Korean martyrs (2 individually named, 101 still unexpanded); 1987's 16 Japanese martyrs (3 identified, 13 unexpanded); 1988's 117 Vietnamese martyrs (1 linked, 116 unexpanded) and three Paraguay Jesuit martyrs (all 3 named); 1970's Forty Martyrs of England and Wales (40 unexpanded), and 1964's 22 Ugandan Catholic martyrs (2 named, 20 unexpanded) are stored separately. `memberCount` must never be added to individually named members again, and other Christian martyrs must not be silently included in a Catholic canonisation cohort.

**1997 source correction:** [The Dicastery's 1997 year page](https://www.causesanti.va/it/celebrazioni/canonizzazioni/1997.html) names Edwige di Polonia / Jadwiga, but its descriptive paragraph describes a duchess and Cistercian connections consistent with an earlier different St Hedwig. The [8 June 1997 papal canonisation homily](https://www.vatican.va/content/john-paul-ii/en/homilies/1997/documents/hf_jp-ii_hom_19970608_cracovia.html) explicitly names **Queen Hedwig of Poland**, Wawel and the Jagiellonians, settling the identity. Canonical ID `saint.jadwiga-queen-poland` is now tagged as adjudicated by a primary papal document, with the erroneous secondary description recorded as a source discrepancy. **Do not link her to Hedwig of Silesia.**

**Formal limitations:** No newly transcribed individual has an inferred universal 1962/modern feast date, liturgical class, Proper, independently approved celebrant option or artwork assignment. `Cum sanctissima` gate remains fail-closed; this research census is not wired to live Calendar, the homepage, or the Mass reader.

**Next acceptance sequence (do not restart the same year audit):** (1) expand 497 exactly enumerated martyr identities where authoritative member lists exist and retain Otranto approximate status; (2) align identities with the established historical saints/art and Doctors registries; (3) independently certify *universal vs particular vs devotional* saint dates and required local authorities, beginning with well-supported current-calendar dates; (4) inspect legal precedence/permission and available approved traditional formularies; (5) add a small reviewed supplementary visual Calendar panel without changing the principal 1962 Mass. Maintain one GitHub source-of-truth PR, not a second calendar.
