# Ad Orientem — Prayer Module final-scope inventory

**Baseline audited:** 11 November 2026 · **Reconciled after:** GitHub Pages release run #42971928438 · **Decision:** frozen existing Prayer scope, not an open-ended collection of historical prayers.

**Current release disposition (11 Nov):** The source-owned Prayer module's relevant technical release gates passed on GitHub Pages. The original nine acquisition PRs are **all closed unmerged**; their 23 proposed units are historical proposals, **not released texts**. Canonical source references are now 48/48 present by effective `sourceUrl` or existing provenance witness; the Immaculate Heart English-only historical recension remains intentionally untranslated in FR/LA. Owner-wide original-print collation and a complete required-work denominator for the ICKSP collections or 2013 red booklet are **not certified**. [Release evidence](https://github.com/Fulcanelli13/ad-orientem/actions/runs/42971928438) · [closure tracking](https://github.com/Fulcanelli13/ad-orientem/issues/2831).

> **Counting rule:** A canonical text, novena programme, routed reader, historical wording variant, source link and acquisition candidate are different units; their counts must NEVER be added to create a false “total prayers” figure. This inventory fixes **what constitutes the module**, records where bodies live, and separates work still to do from optional acquisitions. A source-owner record does not independently certify original printed editions or phone access.

## 1. Scope at a glance

| Layer | Records | Inclusion rule |
|---|---:|---|
| Canonical individual prayers | **48** | All retained. English 48, French 47, Latin 47; one held Immaculate Heart recension |
| Original novena programmes | **16** | Retained with their complete nine-day reading structure |
| Further installed novena programmes | **3** | Divine Infant King, Institute Immaculate Conception, Holy Face |
| Distinct Prayer entry routes | **41** | 9 directly open canonical texts; 32 open multi-text/guided readers |
| Sacred hymns | **11** | Three traditional + eight seasonal recension records |
| Communion Treasury prayers | **11** | Five EN/FR/LA and six English-only, already source-owned |
| Further ownership foundation records | **17** | Litanies, consecration, alternate witnesses, source links, other prayers; **not** 17 extra unique prayers |
| Historical acquisition-candidate master | **97** | Research/approval queue, not an extra published collection |
| Historical proposed acquisition units | **23** | Across 9 PRs, **all closed unmerged**; not part of approved baseline |

**Source and language repair completed:** [#2835](https://github.com/Fulcanelli13/ad-orientem/pull/2835) merged the two direct canonical Latin digital-witness links (`mass_confiteor` and `adoration_lord_i_am_not_worthy`); effective canonical source-reference coverage is **48/48** using direct source URL or recorded provenance, with **24/48 directly populated `sourceUrl`**. This is **not** an original-print/translation certificate. [#2836](https://github.com/Fulcanelli13/ad-orientem/pull/2836) merged the standalone reader's French missing-language notice and qualified Essentials source copy, without changing the held Immaculate Heart source text or inventing French/Latin.

## 2. Canonical 48 — full named list, grouped by existing owner category

All below come from `src/pray/canonical-data.js`. The notation **EN/FR/LA** describes text *presence*, not line-by-line critical certification.

### Essential, daily and sacramental — 15

| Prayer | Canonical ID | Available body |
|---|---|---|
| Sign of the Cross | `foundations_sign_of_cross` | EN · FR · LA |
| Our Father | `foundations_our_father` | EN · FR · LA |
| Hail Mary | `foundations_hail_mary` | EN · FR · LA |
| Glory Be | `foundations_glory_be` | EN · FR · LA |
| Apostles’ Creed | `foundations_apostles_creed` | EN · FR · LA |
| Act of Contrition | `sacrament_act_of_contrition` | EN · FR · LA |
| Act of Faith | `foundations_act_of_faith` | EN · FR · LA |
| Act of Hope | `foundations_act_of_hope` | EN · FR · LA |
| Act of Love | `foundations_act_of_love` | EN · FR · LA |
| Guardian Angel Prayer | `foundations_guardian_angel` | EN · FR · LA |
| Grace Before Meals | `foundations_grace_before_meals` | EN · FR · LA |
| Grace After Meals | `foundations_grace_after_meals` | EN · FR · LA |
| Morning Offering | `foundations_morning_offering` | EN · FR · LA |
| My Lord and My God | `foundations_prayer_of_adoration` | EN · FR · LA |
| Confiteor | `mass_confiteor` | EN · FR · LA |

### Marian prayers — 7

| Prayer | Canonical ID | Available body |
|---|---|---|
| Hail Holy Queen (Salve Regina) | `marian_hail_holy_queen` | EN · FR · LA |
| Memorare (to Mary) | `marian_memorare` | EN · FR · LA |
| Magnificat (Mary) | `weekday_magnificat` | EN · FR · LA |
| Consecration to Immaculate Heart | `marian_consecration_immaculate_heart` | EN |
| Sub Tuum Praesidium | `sub_tuum` | EN · FR · LA |
| Litany of Loreto · 1962-era form | `litany_loreto_1962` | EN · FR · LA |
| Litany of Loreto · current invocations | `litany_loreto_current` | EN · FR · LA |

### Eucharistic and Benediction — 8

| Prayer | Canonical ID | Available body |
|---|---|---|
| Anima Christi | `adoration_anima_christi` | EN · FR · LA |
| Spiritual Communion | `adoration_spiritual_communion` | EN · FR · LA |
| O Salutaris Hostia | `benediction_o_salutaris` | EN · FR · LA |
| Tantum Ergo | `benediction_tantum_ergo` | EN · FR · LA |
| Divine Praises | `benediction_divine_praises` | EN · FR · LA |
| Litany of the Most Blessed Sacrament | `adoration_litany_blessed_sacrament` | EN · FR · LA |
| Versicle & Prayer (English) | `benediction_versicles` | EN · FR · LA |
| Adoremus in aeternum · Psalm 116/117 | `benediction_adoremus_ps116` | EN · FR · LA |

### Mass-related private prayers — 2

| Prayer | Canonical ID | Available body |
|---|---|---|
| Lord, I Am Not Worthy | `adoration_lord_i_am_not_worthy` | EN · FR · LA |
| Leonine Prayers After Low Mass | `mass_devotion_leonine` | EN · FR · LA |

### Holy Ghost — 2

| Prayer | Canonical ID | Available body |
|---|---|---|
| Come, Holy Spirit | `sacrament_come_holy_spirit` | EN · FR · LA |
| Veni Sancte Spiritus · Pentecost Sequence | `traditional_veni_sancte_sequence` | EN · FR · LA |

### Biblical canticles — 1

| Prayer | Canonical ID | Available body |
|---|---|---|
| Benedictus (Zechariah) | `weekday_benedictus` | EN · FR · LA |

### Saints, Church and protection — 7

| Prayer | Canonical ID | Available body |
|---|---|---|
| Prayer to St. Michael | `devotion_prayer_st_michael` | EN · FR · LA |
| Memorare to St. Joseph | `devotion_memorare_st_joseph` | EN · FR · LA |
| Consecration to Christ the King | `devotion_consecration_christ_king` | EN · FR · LA |
| Prayer for the Pope | `church_prayer_for_pope` | EN · FR · LA |
| Si quæris miracula — St Anthony for Lost Things | `devotion_st_anthony_lost_items` | EN · FR · LA |
| Litany of Saint Joseph | `devotion_litany_st_joseph` | EN · FR · LA |
| To Thee, O Blessed Joseph | `devotion_ad_te_beate_ioseph` | EN · FR · LA |

### Sacred Heart and reparation — 2

| Prayer | Canonical ID | Available body |
|---|---|---|
| Act of Reparation to the Sacred Heart of Jesus | `sacred_heart_short_prayer` | EN · FR · LA |
| Sacred Heart Aspiration | `sacred_heart_aspiration_trust` | EN · FR · LA |

### Holy Souls and departed — 4

| Prayer | Canonical ID | Available body |
|---|---|---|
| Eternal Rest (Requiem) | `foundations_eternal_rest` | EN · FR · LA |
| De Profundis — Psalm 129 | `dead_de_profundis` | EN · FR · LA |
| Prayer for All the Faithful Departed | `dead_fidelium_deus` | EN · FR · LA |
| Eternal Rest · for one deceased person | `dead_eternal_rest_singular` | EN · FR · LA |

**Canonical language exception:** `marian_consecration_immaculate_heart` has a complete English Fatima recension but its French and Latin fields remain withheld. A different historical consecration is **not** an acceptable untranslated substitute. All other 47 entries have EN, FR and LA fields present. **Canonical text presence is 48/48 EN, 47/48 FR, 47/48 LA.**

## 3. All 19 novena programmes

| Novena | Internal programme ID | Form / source |
|---|---|---|
| Holy Ghost | `holy_ghost` | 9 day-specific texts · Blessed Be God: A Complete Catholic Prayer Book |
| Christmas | `christmas` | 9 day-specific texts · Blessed Be God: A Complete Catholic Prayer Book |
| Corpus Christi | `corpus_christi` | 9 repetitions of a fixed form · The Catholic Prayer Book and Manual of Meditations |
| Sacred Heart | `sacred_heart` | 9 repetitions of a fixed form · The Catholic Prayer Book and Manual of Meditations |
| Immaculate Conception (Moran) | `immaculate_conception` | 9 day-specific texts · The Catholic Prayer Book and Manual of Meditations |
| Annunciation | `annunciation` | 9 day-specific texts · Mary, Help of Christians: Novenas in Preparation for the Principal Feasts of the Blessed Virgin |
| Assumption | `assumption` | 9 day-specific texts · Mary, Help of Christians: Novenas in Preparation for the Principal Feasts of the Blessed Virgin |
| Seven Sorrows | `seven_sorrows` | 9 day-specific texts · Mary, Help of Christians: Novenas in Preparation for the Principal Feasts of the Blessed Virgin |
| St Joseph | `st_joseph` | 9 day-specific texts · The Catholic Prayer Book and Manual of Meditations |
| Holy Souls | `holy_souls` | 9 day-specific texts · Novena for the Holy Souls in Purgatory |
| Our Lady of Perpetual Help | `perpetual_help` | 9 repetitions of a fixed form · With God: A Book of Prayers and Reflections |
| St Thérèse · Twenty-Four Glory Bes | `st_therese` | 9 repetitions of a fixed form · Novena of the Twenty-Four Glory Bes to St Thérèse of Lisieux |
| St Anthony · Nine Tuesdays | `st_anthony_nine_tuesdays` | 9 repetitions of a fixed form · Devotion of the Nine Tuesdays to St Anthony |
| Christ the King | `christ_the_king` | 9 repetitions of a fixed form · Preces et Pia Opera / Thésaurisons pour le Ciel |
| Immaculate Heart | `immaculate_heart` | 9 repetitions of a fixed form · The Raccolta · Prayer to the Immaculate Heart of Mary |
| St Michael | `st_michael` | 9 repetitions of a fixed form · Leonine Prayer to St Michael the Archangel |
| Divine Infant King · monthly Institute form | `divine_infant_king` | ICKSP-selected programme; source-qualified historic prayers |
| Immaculate Conception · Institute form | `icksp_immaculate_conception` | Distinct Institute nine-day repetition, not Moran's novena |
| Holy Face · Janvier | `holy_face_1887` | Historic 1887 English and a **distinct 1895 French** public reading; not the same original edition |

**19 programmes × nine day occasions = 171 reader occasions**, not 171 unique prayers. The original 16 have English and French day texts (some editorial translations), with full independent printed-edition collation still open. The Holy Face French source is the separately released 1895 recension and should not be described as a literal translation of the 1887 English. The Institute's Tuesday St Thérèse perpetual novena is an **external/source-linked weekly practice**, not a twentieth complete in-app programme.

## 4. The 41 registered public entry routes

These are **products/readers**, not 41 extra prayers. Their existing owner files, reader IDs and historic acceptance holds are recorded in `data/pray/prayer-release-coverage-evidence.v1.json` and `data/pray/prayer-language-route-matrix.v1.json`.

### Daily prayer — 4 entry links

`pray.angelus_regina` (collection/guided reader) · `pray.morning_evening` (collection/guided reader) · `pray.meal_prayers` (collection/guided reader) · `pray.nightly_examen` (collection/guided reader)

### Rosary and chaplets — 5 entry links

`pray.rosary` (collection/guided reader) · `pray.divine_mercy` (collection/guided reader) · `pray.five_wounds` (collection/guided reader) · `pray.precious_blood` (collection/guided reader) · `pray.little_crown` (collection/guided reader)

### Eucharistic prayer — 4 entry links

`pray.benediction` (collection/guided reader) · `pray.adoration` (collection/guided reader) · `pray.forty_hours` (collection/guided reader) · `pray.communion_treasury` (collection/guided reader)

### Marian devotion — 5 entry links

`litany_loreto_1962` (direct canonical prayer) · `marian_memorare` (direct canonical prayer) · `marian_hail_holy_queen` (direct canonical prayer) · `sub_tuum` (direct canonical prayer) · `marian_consecration_immaculate_heart` (direct canonical prayer)

### Novenas and commitments — 4 entry links

`programme.first_friday` (collection/guided reader) · `programme.first_saturday` (collection/guided reader) · `pray.novenas` (collection/guided reader) · `pray.montfort_consecration` (collection/guided reader)

### Christ, Passion and Holy Name — 5 entry links

`pray.stations` (collection/guided reader) · `pray.seven_words` (collection/guided reader) · `pray.sacred_heart` (collection/guided reader) · `pray.holy_name_litany` (collection/guided reader) · `pray.tenebrae` (collection/guided reader)

### Saints — 6 entry links

`pray.litany_saints` (collection/guided reader) · `pray.st_joseph_seven_sorrows` (collection/guided reader) · `devotion_prayer_st_michael` (direct canonical prayer) · `devotion_litany_st_joseph` (direct canonical prayer) · `devotion_st_anthony_lost_items` (direct canonical prayer) · `foundations_guardian_angel` (direct canonical prayer)

### Confession and intentions — 6 entry links

`pray.confession` (collection/guided reader) · `pray.penitential_psalms` (collection/guided reader) · `pray.good_death` (collection/guided reader) · `pray.dying_companion` (collection/guided reader) · `pray.occasional_intercessions` (collection/guided reader) · `pray.for_priests` (collection/guided reader)

### Other registered routes — 2

`pray.library` · `pray.sacred_hymns`

**Cross-links are intentional.** A prayer in the Rosary, Morning/Evening, Confession, Mass preparation, or the Communion Treasury may be the *same source-owned text*, not another work. The historical 41-route ledger originally recorded zero whole-route/all-variant certificates. Since then, [#2846](https://github.com/Fulcanelli13/ad-orientem/pull/2846) passed **164/164 online route-entry observations** (41 routes × 2 widths × EN/FR) and **80/80 cold-offline first-use route-entry observations** (40 non-Rosary routes × 2 representative profiles after initial PWA installation). Existing full-stage suites cover the 19 novenas and major guided journeys. These are **not** a certificate for every nested state, first-ever offline installation, uncached Scripture or independently collated printed text.

## 5. Sacred hymns — 11 named source-owned records

| Hymn | Language bodies present | Source owner |
|---|---|---|
| Te Deum | EN · FR · LA | `src/pray/traditional-pray-data.js` |
| Veni Creator Spiritus | EN · FR · LA | `src/pray/traditional-pray-data.js` |
| Ave Maris Stella | EN · FR · LA | `src/pray/traditional-pray-data.js` |
| Vexilla Regis | EN · FR · LA | `src/pray/icrsp-seasonal-hymns.v1.js` |
| Audi, benigne Conditor | EN · FR · LA | `src/pray/icrsp-seasonal-hymns.v1.js` |
| Ad regias Agni dapes | EN · LA | `src/pray/icrsp-seasonal-hymns.v1.js` |
| Ad cenam Agni providi | EN · LA | `src/pray/icrsp-seasonal-hymns.v1.js` |
| Æterne Rex altissime | EN · LA | `src/pray/icrsp-seasonal-hymns.v1.js` |
| Lustra sex | EN · FR · LA | `src/pray/icrsp-seasonal-hymns.v1.js` |
| O sol salutis intimis | EN · FR · LA | `src/pray/icrsp-seasonal-hymns.v1.js` |
| Ex more docti mystico | EN · FR · LA | `src/pray/icrsp-seasonal-hymns.v1.js` |

These are hymn texts and recensions, not eleven new canonical prayers. The three seasonal hymns `Ad regias Agni dapes`, `Ad cenam Agni providi`, and `Æterne Rex altissime` have **no French body** in this owner ledger. Only add warranted translations and distinguish the historical Latin source.

## 6. Communion Treasury — eleven individually titled prayers

| Prayer | Existing source ID | Languages |
|---|---|---|
| Prayer of St Thomas Aquinas Before Communion | `beforeThomas` | EN · FR · LA |
| Prayer of St Ambrose Before Communion | `beforeAmbrose` | EN · FR · LA |
| Prayer of St Thomas Aquinas After Communion | `afterThomas` | EN · FR · LA |
| Prayer of St Bonaventure After Communion | `afterBonaventure` | EN · FR · LA |
| Thanksgiving After Communion · My Good Jesus | `thanksgivingMyGoodJesus` | EN |
| May the Heart of Jesus in the Most Blessed Sacrament | `eucharisticHeartAspiration` | EN |
| Prayer to the Holy Spirit · Traditional Attribution | `holySpiritAugustineTraditional` | EN |
| A Prayer to Our Lady After Communion | `ourLadyAfterCommunionTraditional` | EN |
| Prayer for Those in Their Agony · O Most Merciful Jesus | `mercifulJesusDying1911` | EN |
| Prayer to the Sacred Heart for the Church | `sacredHeartIntercession1910` | EN |
| Prayer Before a Crucifix · En ego | `enEgo` | EN · FR · LA |

Five Communion Treasury works have EN/FR/LA bodies; six have English only. They are already indexed in the red-booklet pointer list: **do not duplicate them**. The precise English wording of the 2013 booklet has not been certified identical to these historic source versions.

## 7. Other existing owned prayers and devotional content

The historical foundation ledger contains **17 other non-canonical / non-novena / non-hymn records**; they include variants and links as well as real prayer texts:

| Record class | Titles or identities |
|---|---|
| PERPETUAL WEEKLY DEVOTION | Perpetual Novena in Honor of St Thérèse |
| PRAYER ALTERNATE WITNESS | Complete Grace after Meals · Baltimore Manual (1888); Grace after Meals · Baltimore Catechism No. 3; Act of Hope · traditional French witness; Act of Contrition · St Pius X (1905) |
| RELATED EXTERNAL PRAYER LINK | August Queen of Heaven · separate Marian prayer |
| TRADITIONAL LITANY | Litany of the Most Holy Name of Jesus; Litany of the Sacred Heart of Jesus |
| TRADITIONAL CONSECRATION | Consecration of the Human Race to the Sacred Heart of Jesus |
| COMMUNION PRAYER | Prayer of St Thomas Aquinas Before Communion; Prayer of St Ambrose Before Communion; Prayer of St Thomas Aquinas After Communion; Prayer of St Bonaventure After Communion; Prayer Before a Crucifix · En ego |
| RELATED HOLY FACE REPARATION | The Golden Arrow · Reparation to the Holy Name |
| ROMAN RITUAL PRAYER | Go forth, Christian soul · Proficiscere |
| HISTORICAL LITANY RECENSION | Litany of St Joseph · pre-2021 sequence |

Other already registered source-owned reader groups not counted separately above:

- **Eight historical intercessions:** three for priests/vocations/perseverance, two occasional prayers (sickness and family), three later occasional prayers (peace, travel, discernment), plus the canonical St Joseph prayer reused for difficulties. These are exposed through `pray.for_priests` and `pray.occasional_intercessions`.
- **Seven source-deep work links:** Golden Arrow, Holy Face novena, three Montfort historical prayers, Jesus–Mary–Joseph invocations, and `Proficiscere`. These lead to their existing owner readers; they do not add seven more independently published works.
- **The seven Sorrows and Joys of St Joseph:** historical sequence of seven prayers, ending with source-owned antiphon, verses and collect.
- **Five chaplet routes:** Holy Rosary, Divine Mercy, Five Wounds, Precious Blood, Little Crown of the Infant Jesus. Repeated beads do **not** create new distinct prayer works.
- **Daily and liturgical-use journeys:** morning/evening sequences, Angelus/Regina Cæli, meal prayer, nightly examination, Confession preparation and thanksgiving, adoration and Benediction, Forty Hours, first Friday and first Saturday, stations, Seven Last Words, seven penitential psalms, Litany of Saints and Rogation-related uses, Tenebrae, and good-death/bedside prayers.
- **Red booklet pointers:** eleven Communion works already counted above; one `Suscipe` EN/LA reader link; four private English historical prayer readers (before Mass and around Confession); three short English comparisons (guardian angel before Confession, Sacred Heart aspirations, Fatima decade). These **19 links/witnesses are overlapping records**, not nineteen wholly independent additional prayers.

The Office of the Dead belongs to the **Divine Office** workstream (source and Vespers composition staged, public complete Office not released). The Mass Ordinary and rites belong to the **Mass** reader. The Prayer Module should cross-link those works, not duplicate ownership or count them as missing Prayer texts.

## 8. Pending work is not approved Prayer Module content

The original 97-row acquisition master is **research and triage**: 33 ICKSP, 28 Raccolta, 16 Sensus, 10 Lasance, 6 Baltimore and 4 Catechism. Its October release snapshot has 5 live source-scoped, 5 released post-B22, 25 owned but not certified, 21 intent-only, 5 elsewhere, 13 source/variant holds, 19 editorial deferrals and 4 excluded. The 97 rows overlap existing owners; **do not add them to the above totals**.

The nine **historical** acquisition PRs [#2812](https://github.com/Fulcanelli13/ad-orientem/pull/2812), #2815, #2817, #2821, #2822, #2823, #2824, #2825 and #2829 proposed **23 units**. **All nine are now closed unmerged; none of their proposal text entered the public Prayer module.** The original [#2832](https://github.com/Fulcanelli13/ad-orientem/pull/2832) preliminary 2 keep / 9 decide / 12 defer triage was a historical recommendation, **not** approval. The August Queen and two Infant Jesus works from the last two drafts are **deferred, not rejected**. Future additions require an explicit new owner request plus source/rights/editorial checks; do not reopen the 97-item master as a default acquisition backlog.

## 9. Final finite closure register — 11 November 2026

| Scope | Evidence-based disposition | Remaining obligation |
|---|---|---|
| **Canonical 48 identities and references** | **ACCEPTED for the released reader scope.** EN 48/48; FR 47/48; LA 47/48; effective reference links 48/48 after merged #2835. | Preserve the intentional English-only Immaculate Heart witness and its bilingual missing-language notice. Do not substitute a different consecration text or invent Latin. |
| **Novenas / guided journeys** | **ACCEPTED for the tested scope.** 19 registered programmes; full-stage novena and guided Adoration/Confession/Benediction suites already exist and passed, plus the 36/36 public Holy Face states. | Original printed-edition line-by-line certificates are separate editorial evidence, not an outstanding code regression gate. |
| **Online and offline Prayer entry** | **ACCEPTED.** 164/164 online route-entry observations and 80/80 first-use cold-offline entry observations after installed PWA. | Do not imply all nested guided states, Rosary beads, uncached Scripture, or offline-first installation were tested. |
| **Published source-language reader and phone fit** | **ACCEPTED for public canary.** GitHub Pages run [#42971928438](https://github.com/Fulcanelli13/ad-orientem/actions/runs/42971928438) passed **12/12** 320/390 EN/FR canonical/Immaculate Heart/Communion paths, with source and fallback disclosure; the separate Holy Face check passed **36/36**; published offline snapshot also passed. | Human final visual/editorial sign-off remains distinct from automated geometry and source ownership assertions. |
| **Communion Treasury** | **ACCEPTED with qualified languages.** 11 works: five EN/FR/LA; six historical EN-only with visible French UI fallback and `lang=en`, repaired/guarded by #2844. | Do not claim source-proven French translations for the English-only six or an exact complete 2013 booklet collation. |
| **Additional sacred hymns** | **RETAIN EXISTING.** 11 source-owned names; three seasonal hymn recensions lack a French body. | Preserve language ownership. Translate only if a specific required reader warrants an editorial translation; do not mark the Latin original as French. |
| **ICKSP/ICRSP and red-booklet scope** | **EXPLICITLY BOUNDED, not 100% claimed.** Historical crosswalk covers 33 Institute-labelled candidates and 19 overlapping booklet pointers/witness records, not each website or the complete physical booklet. Existing 11 P0/P1 Institute candidates have 7 source-owned/live and 4 optional alternatives. | An authoritative exhaustive required-work denominator has not been defined. Treat only a newly evidenced owner-required omission as a release decision; do not invent completion percentages. |
| **Nine acquisition drafts / 23 proposals** | **CLOSED UNMERGED.** No automatic acquisition remains queued. | Deferred August Queen and two Infant Jesus proposals are not required for this release. Future inclusion needs a fresh explicit decision and proper source/rights/editorial review. |
| **GitHub publication and branch hygiene** | **ACCEPTED.** #2835/#2836/#2844/#2846/#2850/#2851 merged; public GitHub Pages release and phone/offline jobs green. Redundant #2853 closed unmerged. | GitHub Actions + GitHub Pages exclusively. No further Prayer CI expansion without a reproducible defect. |

**Release-closure interpretation:** Existing technical requirements for the tested Prayer reader scope are met. The remaining actions are deliberate final owner editorial/visual approval and any *concrete* later source discrepancy, not a new general research or acquisition cycle. Keep a documented historical-edition limitation rather than portraying an absent edition certificate as a missing prayer.

## 10. Current readiness conclusion

**Implemented and technically accepted for the tested scope:** 48 canonical prayer identities; 19 novena programmes; 41 registered entry routes; existing hymn, Communion, chaplet, litany, intercession, Confession, bedside and supplementary reader owners; source-language fallbacks, mobile entry and installed PWA cold-offline navigation. The exact public Prayer witness canary and Holy Face published-stage acceptance have both passed on [GitHub Pages run #42971928438](https://github.com/Fulcanelli13/ad-orientem/actions/runs/42971928438).

**Unresolved editorial/definition limitations—not unimplemented routes:** no independently audited universal ICKSP work denominator or complete 2013 red-booklet work denominator; no general original-print text certificate; intentional English-only Immaculate Heart and Communion witnesses; three hymn recensions without French owner bodies. None authorises making up translations, retroactively approving all 97 historical master rows or starting another acquisition series.

**Final decision boundary:** Treat the current Prayer Module as technically release-ready for its evidenced scope. Final closure of [#2831](https://github.com/Fulcanelli13/ad-orientem/issues/2831) requires affirmative owner sign-off on this bounded, source-transparent scope, not another broad engineering pass.
