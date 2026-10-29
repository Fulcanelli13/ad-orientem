# All 19 Novenas — whole-devotion component census and source-aware stage repair

**29 October 2026 · Ad Orientem · phase after original-book 72/72 proper English day-prayer word checks.**

## Scope and the real denominator

The runtime imports **16 source-locked bilingual core novena programmes** from `NOVENA_CORPUS_V4` and **three specialist forms**: ICKSP Divine Infant King (monthly), ICKSP Immaculate Conception (distinct from Moran) and Janvier's Holy Face (1887 digital English). Together this means **19 programmes × nine prayer occasions = 171 day occasions**. The weekly ICKSP St Thérèse presentation is an additional distinct reader route, not a twentieth nine-day programme silently added to this denominator.

The imported source objects, not hand-authored approximations, yield a pre-repair **729 guided day-card instances** and **171 simple day-card instances**. The stage repair in this PR removes the unsupported empty `Common prayers` card for **five** standard-pattern programmes, reducing guided instances to **684** without changing source words, recurrence, completion, or French. These are 9 omitted redundant cards per programme, or 45 obsolete cards from the full nine-day 19-programme matrix.

**This is a runtime component *presence* audit**, not a statement that 19 complete historical programmes have been source-certified. The earlier **72/72** result is specifically the printed English **proper day-body** verification for eight distinct historical nine-day programmes, and is not inherited by their other prayer elements or eleven other forms.

## Complete programme map — after source-aware stage repair

| Devotion | Daily form | Guided cards/day | Simple cards/day | Explicit reusable canonical daily prayer components | Current whole-devotion review |
|---|---|---:|---:|---|---|
| Holy Ghost / Pentecost | Nine proper prayers | 4 | 1 | 1 Our Father; 1 Hail Mary; 1 Glory Be | Sequence/source-component full collation pending |
| Christmas | Nine proper prayers | 4 | 1 | 1 Our Father; 1 Hail Mary; 1 Glory Be | Sequence/source-component full collation pending |
| Corpus Christi | Repeated historic form | **3**, formerly 4 | 1 | None explicitly prescribed in this record | Empty common stage removed |
| Sacred Heart | Repeated historic form | **3**, formerly 4 | 1 | None explicitly prescribed in this record | Empty common stage removed |
| Immaculate Conception (Moran) | Nine proper prayers | 5 | 1 | 9 Hail Marys; 1 Glory Be (plus distinct opening and canonical close) | All components and optional Litany/*Tota pulchra* choice pending |
| Annunciation | Nine Hammer prayers | 6 | 1 | 1 Hail Mary (plus historical church prayer, Marian litany, invocation) | Long meditation/practice English-only in expandable details |
| Assumption | Nine Hammer prayers | 6 | 1 | 1 Hail Mary (plus historical church prayer, Marian litany, invocation) | Long meditation/practice English-only in expandable details |
| Seven Sorrows | Nine Hammer prayers | 6 | 1 | 1 Hail Mary (plus historical church prayer, Marian litany, invocation) | Long meditation/practice English-only in expandable details |
| St Joseph (Moran) | Nine proper prayers | 4 | 1 | 3 Our Fathers; 3 Hail Marys | Full recitation/printed sequence pending |
| Holy Souls | Nine proper prayers | 5 | 1 | 1 Our Father; 1 Hail Mary; recurring verse and seven intercessions in separate source-owned closing stage | Full shared-prayer/verse printed collation pending |
| Our Lady of Perpetual Help | Same prayer repeated nine days | 4 | 1 | 3 Hail Marys before source repeat | Full common-prayer/recitation count pending |
| St Thérèse | 24 Glory Bes repeated daily | 4 | 1 | **24 Glory Bes**, currently shown as one `24×` block | UX follow-along/counting issue |
| St Anthony — Nine Tuesdays | Weekly repeat | 4 | 1 | Our Father; Hail Mary; Glory Be, plus referenced St Anthony responsory/canonical close | Verify canonical closing selection and nine-*Tuesday* cadence |
| Christ the King | Repeated form | **3**, formerly 4 | 1 | None explicitly prescribed in this record | Empty common stage removed |
| Immaculate Heart | Repeated form | **3**, formerly 4 | 1 | None explicitly prescribed in this record | Empty common stage removed |
| St Michael | Repeated form | **3**, formerly 4 | 1 | None explicitly prescribed in this record | Empty common stage removed |
| ICKSP Divine Infant King | Same historical prayer repeated (monthly 17–25) | 3 | 1 | No invented common repetitions | Original 1885 printed French not yet directly inspected |
| ICKSP Immaculate Conception | Same St Pius X prayer repeated (Nov 30–Dec 8) | 3 | 1 | Litany/invocations local or optional, not automatic extra cards | Historic 1903 French / later English distinct recensions |
| Janvier Holy Face (1887) | Nine long meditation/prayer bodies | 3 | 1 | Historical day body includes act/virtue/bouquet/collect in extended text | **English-only**, original print not image-collated, very long single card |

The reader uses actual source-owned patterns: **11 standard**, **1 opening/day/common/close variant**, **3 Hammer**, **1 common-before-repeat**, **3 source-repeat-only**. Each has an introductory recollection card; the guided count above includes source reading and conclusion cards. Simple mode uses a single day card for each occasion. All cards in the inventory are structural card instances, **not** 684 separately historical prayer texts.

## Verified finding and immediate production correction

Previously the **Corpus Christi, Sacred Heart, Christ the King, Immaculate Heart and St Michael** forms had a four-stage standard guided rail `prepare → prayer → Common prayers → close` even though their source-owned `commonPrayers` collection was empty. The third stage gave explanatory text rather than the prescribed prayer, wasting navigation and suggesting a mandatory act absent from its source.

This PR makes `commonRequired` conditional in the shared `novenaStageChapters` adapter; the novena runtime now derives stage count from the actual named chapters and correctly maps those five to `prepare → prayer → close`. It does **not** add any prayer, rewrite the donor or reorder an attested sequence. Other stages remain unchanged, including Holy Souls' five-stage verse/closing and the Hammer six-stage readers.

## Remaining review findings (7 scoped flags across 5 programmes)

1. **Hammer meditation/practice source ownership (3 programmes):** The historical day meditations and practices exist in an expandable **English-only** source disclosure inside the day-prayer stage. They are not first-class source section cards or historically verified French. Editorial review must distinguish optional practice from mandatory prayer and avoid fabricating historical French.
2. **St Thérèse 24 Glory Bes (one programme):** Canonical `Glory Be` currently appears once with `24×`. No recitation-by-recitation guide, per-unit tracking or completion feedback; a better counting interaction would not change the prayer.
3. **Holy Face French-body availability (one flag):** All nine historical English bodies exist, **zero of nine French prayer bodies**. The reader explicitly displays French unavailable and offers the English witness. It must not be labelled a complete bilingual prayer.
4. **Holy Face original-print evidence (one flag):** The 1887 source is a digitally transcribed English witness; the photographed **1887 original printing is not yet compared**.
5. **Holy Face reading depth (one flag):** A long meditation, act, virtue and bouquet sit inside a large scrolling daily card. After source section boundaries are verified, separate reading cards could improve the UX without inventing new material.

There are **zero structural blocking errors** in the current inventory (no missing English daily body and no missing day records). However, **zero whole-devotion programme certifications** were inferred: presence in code is not historical authentication.

## Language and source status

- **171/171 available English daily bodies** (this is field completeness only, **not** 171/171 historical printed-word proofs).
- **162/171 available French daily bodies**: 16 core programmes and two specialist forms have French proper texts; the Holy Face's nine remain English-only. Some French is expressly **editorial** and the ICKSP forms draw on different historical language recensions, not literal translations of one edition.
- Separate historical edition authentication, complete historical devotion sequence, and currently applicable indulgence concessions and conditions: **zero certified** in this whole-programme audit.
- The earlier English **72/72 printed-body proof** remains preserved unchanged; no textual/source edits were introduced here.

## Efficient next work packages

**One:** For all **19 forms**, map each source book's actual opening, canonical common prayers/repeat count, nine daily sources or repeated source text, meditations and practices, invocations, closing, source instructions, calendars and optionality to the actual runtime stage. Evaluate each component as PRESENT / HISTORICALLY VERIFIED / EDITORIAL / MISSING / OPTIONAL. Because the 19-record inventory now exists, do not restart searching for the same books.

**Two:** Improve follow-along UI for repeated prayers and the already-owned Hammer source meditations, preserving the historical section order and French/source labeling. Any UI change needs phone acceptance at 320px/390px and progression/back-navigation tests.

**Three:** Treat missing original printed French and modern indulgence grants/conditions as different source programmes. Do not block an otherwise accurately labelled English-only historic witness simply because a French print is unavailable, and never interpret a historical indulgence notice as a current grant.

The machine-generated exact census is reproduced by `node tools/pray/audit-whole-novena-components.mjs --out /tmp/pray-whole-novena-audit` and its [zero-cost GitHub Actions review](https://github.com/Fulcanelli13/ad-orientem/actions/workflows/pray-whole-novena-component-audit.yml). The [runtime component regression test](../../tests/pray-whole-novena-component-audit.mjs) locks the population, removal of 45 redundant cards, honest French count and unchanged exceptional source patterns.
