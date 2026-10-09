# Contextual study coverage — cross-module audit v1

**10 October 2026 · source-level matrix, not a production release**

Machine-readable source of truth: [`data/app/contextual-study-coverage.v1.json`](../data/app/contextual-study-coverage.v1.json).
Reuses the existing [navigation and ownership register](../data/app/content-navigation-registry.v1.json), [item census](../data/app/content-item-census.v1.json), and merged [PR #777](https://github.com/Fulcanelli13/ad-orientem/pull/777). No reader, app route, content, bibliography, colour, button or publication state is changed by this audit.

## Boundary and scope

All **63** registered route, alias or lens identifiers and **31** corpus families are inventoried. These identities are not 63 individual visible screens, and corpus families overlap. Individual source texts, 450 Glossary concepts, the Prayer catalogue and formation records remain owned by their existing ledgers; **do not make a second content corpus**.

Statuses: `SOURCE_WIRED` means an inspected code path exists, **not** phone/browser certification, complete content coverage or independent source verification. `FAMILY_LEVEL_ONLY` is a Prayer-family heading and does not add a capsule to every child. `NOT_AUDITED` is unknown, not a defect. `PUBLICATION_GATED` and `ALIAS_OR_RETIRED` must not cause additional public buttons.

Scripture has one canonical reader and edition policy. Glossary retains the definitions and their original references. The local Bible catalogue contains **no enabled full-text editions** at this snapshot; external Catholic links are still legitimate when labelled as external. Source control must distinguish biblical text from liturgical adaptations, devotional compositions, editorial summaries and historical commentary.

## Evidence already present in source

| Evidence | Route | Capability | Placement | Scope |
|---|---|---|---|---|
| W01 | `mass` | glossary | Mass rubric guide | Source-wired |
| W02 | `mass` | originalSources | Mass guide sources | Source-wired |
| W03 | `pray.adoration` | glossary | Prayer Eucharistic family entry | Family-level only |
| W04 | `pray.confession` | glossary | Prayer Penance family entry | Family-level only |
| W05 | `pray.stations` | glossary | Prayer Passion family entry | Family-level only |
| W06 | `pray.rosary` | scripture | Rosary mystery opening | Source-wired |
| W07 | `pray.stations` | scripture | Stations | Source-wired |
| W08 | `pray.library` | scripture | Canonical Prayer Library prayer block | Source-wired |
| W09 | `pray.penitential_psalms` | scripture | Seven Penitential Psalms | Source-wired |
| W10 | `pray.seven_words` | scripture | Seven Words | Source-wired |
| W11 | `learn.spiritual_life` | glossary | Spiritual Life SL01/SL03/SL06/SL07/SL12 | Source-wired |
| W12 | `learn.spiritual_life` | originalSources | Spiritual Life lesson claims | Source-wired |
| W13 | `learn.sexual_ethics` | scripture | Sexual Ethics biblical source | Source-wired |
| W14 | `learn.sexual_ethics` | originalSources | Sexual Ethics question and argument | Source-wired |
| W15 | `apostolate` | scripture | Apostolate source list | Source-wired |
| W16 | `apostolate` | originalSources | Apostolate source list | Source-wired |
| W17 | `find` | originalSources | Explore detail view | Source-wired |
| W18 | `scripture` | scripture | Shared Scripture owner | Source-wired |
| W19 | `scripture` | originalSources | Scripture reader source handoff | Source-wired |
| W20 | `learn.glossary` | glossary | Canonical Glossary owner | Source-wired |
| W21 | `learn.glossary` | originalSources | Glossary original source references | Index only |

The Prayer source register records **48** canonical prayers (14 with `source_visible:true`, 34 `false`); **46** carry a base source URL. The `source_visible` marker is metadata and **does not govern the Prayer Library's rendered Source / provenance accordion**; see the item-level audit below. It is not evidence of 34 missing controls.

## Coverage grid — all 63 route identifiers

| Route | Scripture | Glossary | Original sources |
|---|---|---|---|
| `home` | NOT_AUDITED | NOT_AUDITED | NOT_AUDITED |
| `mass` | NOT_AUDITED | SOURCE_WIRED | SOURCE_WIRED |
| `pray` | NOT_AUDITED | NOT_AUDITED | NOT_AUDITED |
| `learn` | NOT_AUDITED | NOT_AUDITED | NOT_AUDITED |
| `calendar` | NOT_AUDITED | NOT_AUDITED | NOT_AUDITED |
| `find` | NOT_AUDITED | NOT_AUDITED | SOURCE_WIRED |
| `settings` | NOT_AUDITED | NOT_AUDITED | NOT_AUDITED |
| `apostolate` | SOURCE_WIRED | NOT_AUDITED | SOURCE_WIRED |
| `learn.catechism.daily` | NOT_AUDITED | NOT_AUDITED | NOT_AUDITED |
| `learn.catechism` | NOT_AUDITED | NOT_AUDITED | NOT_AUDITED |
| `learn.spiritual_life` | NOT_AUDITED | SOURCE_WIRED | SOURCE_WIRED |
| `learn.sexual_ethics` | SOURCE_WIRED | NOT_AUDITED | SOURCE_WIRED |
| `learn.scapular` | NOT_AUDITED | NOT_AUDITED | NOT_AUDITED |
| `learn.mass` | NOT_AUDITED | NOT_AUDITED | NOT_AUDITED |
| `learn.serve_mass.responses` | NOT_AUDITED | NOT_AUDITED | NOT_AUDITED |
| `learn.rites.sick` | NOT_AUDITED | NOT_AUDITED | NOT_AUDITED |
| `learn.rites.baptism` | NOT_AUDITED | NOT_AUDITED | NOT_AUDITED |
| `learn.rites.first_communion` | NOT_AUDITED | NOT_AUDITED | NOT_AUDITED |
| `learn.rites.confirmation` | NOT_AUDITED | NOT_AUDITED | NOT_AUDITED |
| `learn.rites.holy_orders` | NOT_AUDITED | NOT_AUDITED | NOT_AUDITED |
| `learn.rites.matrimony` | NOT_AUDITED | NOT_AUDITED | NOT_AUDITED |
| `learn.latin` | NOT_AUDITED | NOT_AUDITED | NOT_AUDITED |
| `learn.glossary` | NOT_AUDITED | CANONICAL_OWNER | NOT_AUDITED |
| `pray.hub` | NOT_AUDITED | NOT_AUDITED | NOT_AUDITED |
| `pray.rosary` | SOURCE_WIRED | NOT_AUDITED | NOT_AUDITED |
| `pray.angelus_regina` | NOT_AUDITED | NOT_AUDITED | NOT_AUDITED |
| `pray.angelus` | ALIAS_OR_RETIRED | ALIAS_OR_RETIRED | ALIAS_OR_RETIRED |
| `pray.confession` | NOT_AUDITED | FAMILY_LEVEL_ONLY | NOT_AUDITED |
| `pray.benediction` | NOT_AUDITED | NOT_AUDITED | NOT_AUDITED |
| `pray.adoration` | NOT_AUDITED | FAMILY_LEVEL_ONLY | NOT_AUDITED |
| `pray.stations` | SOURCE_WIRED | FAMILY_LEVEL_ONLY | NOT_AUDITED |
| `pray.visit_blessed_sacrament` | NOT_AUDITED | NOT_AUDITED | NOT_AUDITED |
| `pray.library` | SOURCE_WIRED | NOT_AUDITED | NOT_AUDITED |
| `pray.penitential_psalms` | SOURCE_WIRED | NOT_AUDITED | NOT_AUDITED |
| `pray.litany_saints` | NOT_AUDITED | NOT_AUDITED | NOT_AUDITED |
| `pray.seven_words` | SOURCE_WIRED | NOT_AUDITED | NOT_AUDITED |
| `pray.forty_hours` | NOT_AUDITED | NOT_AUDITED | NOT_AUDITED |
| `pray.de_profundis` | NOT_AUDITED | NOT_AUDITED | NOT_AUDITED |
| `pray.eternal_rest` | NOT_AUDITED | NOT_AUDITED | NOT_AUDITED |
| `programme.first_friday` | NOT_AUDITED | NOT_AUDITED | NOT_AUDITED |
| `programme.first_saturday` | NOT_AUDITED | NOT_AUDITED | NOT_AUDITED |
| `pray.morning_evening` | NOT_AUDITED | NOT_AUDITED | NOT_AUDITED |
| `pray.meal_prayers` | NOT_AUDITED | NOT_AUDITED | NOT_AUDITED |
| `pray.nightly_examen` | NOT_AUDITED | NOT_AUDITED | NOT_AUDITED |
| `pray.communion_treasury` | NOT_AUDITED | NOT_AUDITED | NOT_AUDITED |
| `pray.novenas` | NOT_AUDITED | NOT_AUDITED | NOT_AUDITED |
| `pray.sacred_heart` | NOT_AUDITED | NOT_AUDITED | NOT_AUDITED |
| `pray.holy_name_litany` | NOT_AUDITED | NOT_AUDITED | NOT_AUDITED |
| `pray.sacred_hymns` | NOT_AUDITED | NOT_AUDITED | NOT_AUDITED |
| `pray.good_death` | NOT_AUDITED | NOT_AUDITED | NOT_AUDITED |
| `pray.dying_companion` | NOT_AUDITED | NOT_AUDITED | NOT_AUDITED |
| `explore.lens.tlm` | NOT_AUDITED | NOT_AUDITED | NOT_AUDITED |
| `explore.lens.shrines` | NOT_AUDITED | NOT_AUDITED | NOT_AUDITED |
| `explore.lens.apparitions` | NOT_AUDITED | NOT_AUDITED | NOT_AUDITED |
| `explore.lens.relics` | NOT_AUDITED | NOT_AUDITED | NOT_AUDITED |
| `explore.lens.traditions` | NOT_AUDITED | NOT_AUDITED | NOT_AUDITED |
| `explore.lens.pilgrimages` | NOT_AUDITED | NOT_AUDITED | NOT_AUDITED |
| `scripture` | CANONICAL_OWNER | NOT_AUDITED | SOURCE_WIRED |
| `learn.apologetics` | PUBLICATION_GATED | PUBLICATION_GATED | PUBLICATION_GATED |
| `learn.church_crisis` | PUBLICATION_GATED | PUBLICATION_GATED | PUBLICATION_GATED |
| `learn.catholic_life` | ALIAS_OR_RETIRED | ALIAS_OR_RETIRED | ALIAS_OR_RETIRED |
| `learn.seasonal_rites` | ALIAS_OR_RETIRED | ALIAS_OR_RETIRED | ALIAS_OR_RETIRED |
| `today.calendar` | NOT_AUDITED | NOT_AUDITED | NOT_AUDITED |

## Corpus-family crosscheck — all 31 canonical families

| Corpus | Current audit scope | Canonical owner file |
|---|---|---|
| `mass-1962` | NOT_AUDITED | `data/mass/form-registry.v2.json` |
| `liturgical-calendar` | NOT_AUDITED | `src/calendar/calendar-runtime.js` |
| `prayer-core` | SOURCE_WIRED_PARTIAL_SCOPE | `src/pray/canonical-data.js` |
| `prayer-experiences` | SOURCE_WIRED_PARTIAL_SCOPE | `src/pray/presentation-runtime.js` |
| `novenas` | NOT_AUDITED | `data/pray/novena-sot.v1.json` |
| `catechism-st-pius-x` | NOT_AUDITED | `docs/FORMATION-MASTER-INVENTORY-2026-10-09.md` |
| `learn-the-faith-54` | PUBLICATION_GATED | `data/learn/learn-the-faith-recovered-54.v1.json` |
| `apologetics` | PUBLICATION_GATED | `data/learn/apologetics-canonical.v1.json` |
| `church-crisis` | PUBLICATION_GATED | `data/learn/church-crisis-canonical.v1.json` |
| `traditional-mass-objections` | PUBLICATION_GATED | `data/learn/traditional-mass-objections-reconciliation.v1.json` |
| `contemporary-controversies` | PUBLICATION_GATED | `data/learn/contemporary-controversies-reconciliation.v1.json` |
| `sexual-ethics-questions` | SOURCE_WIRED_PARTIAL_SCOPE | `src/learn/sexual-ethics-data/index.js` |
| `sexual-ethics-debates` | NOT_AUDITED | `docs/FORMATION-MASTER-INVENTORY-2026-10-09.md` |
| `spiritual-life` | SOURCE_WIRED_PARTIAL_SCOPE | `data/learn/spiritual-life-course.v1.json` |
| `latin-course` | NOT_AUDITED | `data/learn/latin-course-40-core350.v1.json` |
| `sacramental-formation` | NOT_AUDITED | `data/learn/sacramental-formation-sot.v1.json` |
| `glossary` | CANONICAL_OWNER | `data/glossary/glossary-navigation-sot.v1.json` |
| `apostolate-scenarios` | SOURCE_WIRED_PARTIAL_SCOPE | `src/apostolate/contracts.js` |
| `apostolate-skills` | SOURCE_WIRED_PARTIAL_SCOPE | `src/apostolate/contracts.js` |
| `scripture-editions` | FULL_TEXT_DISABLED | `src/scripture/catalogue.js` |
| `scripture-context` | CANONICAL_OWNER | `src/scripture/context.js` |
| `geographical-places` | NOT_AUDITED | `data/geography/seed-registry.v1.json` |
| `shrines` | NOT_AUDITED | `data/shrines/shrines-pilgrimages-seed.v1.json` |
| `pilgrimages` | NOT_AUDITED | `data/shrines/shrines-pilgrimages-seed.v1.json` |
| `pilgrimage-routes` | NOT_AUDITED | `data/shrines/shrines-pilgrimages-seed.v1.json` |
| `apparitions` | NOT_AUDITED | `data/explore/sacred-phenomena-seed.v1.json` |
| `relics` | NOT_AUDITED | `data/explore/sacred-phenomena-seed.v1.json` |
| `published-relic-principal-sites` | NOT_AUDITED | `data/explore/relic-principal-sites-publication.2026-10-09.json` |
| `customs` | NOT_AUDITED | `data/customs/customs-atlas-seed.v1.json` |
| `customs-attestations` | NOT_AUDITED | `data/customs/customs-atlas-seed.v1.json` |
| `mass-directory` | NOT_AUDITED | `src/find/data-service.js` |

## Next work packages (no duplicate controls)

1. **Prayer provenance first (P1):** review 30 not-yet-anchor-reviewed prayer records and 18 anchor-reviewed/non-verbatim records, verify exact English/French/Latin source matches, and phone-check the existing provenance accordion without creating new buttons.
2. **R17 Scripture (P1):** examine all Epistle/Gospel/extended lessons against their source-ordered Proper identity and exact source reference; do not rewrite or re-order a Mass section.
3. **Shared Scripture context (P1):** confirm first-use lazy loading, Bible-selection limitations, explicit edition/versification cautions, optional commentary and return to the same card/position.
4. **Learn and formation (P2):** inspect each of the 15 launchers and nested sources. Maintain the publication hold on the 60 Apologetics and 81 Church Crisis dossiers; no automatic mass activation of contextual links.
5. **Prayer references (P2):** audit 20 Rosary mysteries, 14 Stations (some deliberately without biblical narrative equivalents), seven penitential psalms, seven last words, and eight curated Prayer Library origins. Distinguish original source text, biblical inspiration and later devotion.
6. **Apostolate and Explore (P2):** inspect scenario and place source controls before adding Glossary citations; never create a duplicate doctrine or place record.
7. **Visual consolidation (P3):** only after the coverage and real phone/browser pass, standardise discreet Scripture, Glossary and original-source capsule placement.

## Acceptance gate

Every proposed new control must record exact content ID, canonical owner, reference/term/source ID, editorial identity, source URL/locator, English/French behaviour, source scope (original/translation/commentary), return-context semantics, error-state behaviour and browser evidence. For every `NOT_AUDITED` row, first prove there is a relevant user-facing claim and that existing nested controls are inadequate. A missing cross-link is not automatically an error.

Preserve current six ribbon destinations, all existing route aliases, Prayer owner, R17 reader, Calendar authority, Glossary lazy-loading, and the unpublished Formation/Bible-edition publication gates. The proposed broader navigation redesign is a separate decision.

## 48-prayer item-level source presentation audit (2026-10-10)

See [`data/pray/prayer-source-presentation-audit.v1.json`](../data/pray/prayer-source-presentation-audit.v1.json), cross-joined with the **48 canonical Prayer items** and existing [v3 certification inventory](../data/pray/prayer-source-certification-inventory.v3.json). The following is a **source-level display/certification review**, not live browser or external-source validation.

**Correction of an earlier interpretation:** `source_visible:false` is metadata; it is **not** a missing source disclosure in the actual Prayer Library. The canonical `renderLibrary()` detail calls `prayerBlock(LIB.open,{scriptureContext:true})`, whose HTML always includes `sourceLine(p)` without consulting `sourceVisible`. Thus the claim that 34 prayers need new provenance buttons is **not supported**. The existing Source / provenance accordion is the correct surface and should be retained.

| Structural finding | Count |
|---|---:|
| Canonical prayer objects inspected | 48 |
| Base source URLs recorded | 46 |
| Edition-specific reader overrides | 5 |
| Base-URL-absent prayers with a reader edition source | 2 |
| Reader source URL available by recorded code selection | 48 |
| Source anchors reviewed, full verbatim collation still pending | 18 |
| Source anchors not yet reviewed | 30 |
| Independently fully certified prayers | **0** |

The v3 inventory's `notReviewed:46` is a **64-record programme total** (including novenas); this audit separately classifies the **48 prayers only** into 18 + 30. The 48 linked source selections are **runtime assignments, not proof of HTTP success, exact source location or publication approval**.

### Item-level register

| Canonical prayer | source_visible metadata | Linked citation carrier | Edition distinction | Collation state | Recorded variant |
|---|---|---|---|---|---|
| `foundations_sign_of_cross` | false | Base | — | Anchor reviewed | SAME_FORM_NORM |
| `foundations_our_father` | false | Base | — | Anchor reviewed | FRENCH_HISTORICAL_VARIANT |
| `foundations_hail_mary` | false | Base | — | Anchor reviewed | SAME_FORM_NORM |
| `foundations_glory_be` | false | Base | — | Anchor reviewed | SAME_FORM_NORM |
| `foundations_apostles_creed` | false | Base | — | Anchor reviewed | FRENCH_HISTORICAL_VARIANT |
| `sacrament_act_of_contrition` | false | Base | — | Anchor reviewed | AUTHORITATIVE_LOCALE_VARIANTS |
| `foundations_act_of_faith` | false | Base | — | Anchor reviewed | AUTHORITATIVE_LOCALE_VARIANTS |
| `foundations_act_of_hope` | false | Base | — | Anchor reviewed | PUBLISHED_FRENCH_ANOMALY |
| `foundations_act_of_love` | false | Base | — | Anchor reviewed | AUTHORITATIVE_LOCALE_VARIANTS |
| `foundations_guardian_angel` | false | Base | — | Anchor reviewed | SAME_FORM_NORM |
| `foundations_grace_before_meals` | false | Base | — | Anchor reviewed | HISTORICAL_PRAYER_PRESENT |
| `foundations_grace_after_meals` | false | Base | — | Anchor reviewed | HISTORICAL_PRAYER_ALTERNATIVE |
| `foundations_morning_offering` | true | Base | — | Not reviewed | — |
| `foundations_prayer_of_adoration` | false | Base | — | Not reviewed | — |
| `mass_confiteor` | false | Edition only | PRINTED_MISSAL_FACSIMILE_UNCOLLATED | Not reviewed | — |
| `marian_hail_holy_queen` | false | Base | — | Anchor reviewed | FRENCH_HISTORICAL_VARIANT |
| `marian_memorare` | false | Base | — | Anchor reviewed | FRENCH_ALTERNATE_WITNESS |
| `weekday_magnificat` | false | Base | — | Anchor reviewed | OFFICIAL_TEXT_VARIANTS |
| `marian_consecration_immaculate_heart` | true | Base | — | Not reviewed | — |
| `adoration_anima_christi` | false | Base | — | Anchor reviewed | ENGLISH_TRANSLATION_VARIANT |
| `adoration_spiritual_communion` | true | Base | — | Not reviewed | — |
| `benediction_o_salutaris` | true | Base | — | Not reviewed | — |
| `benediction_tantum_ergo` | true | Base | — | Not reviewed | — |
| `benediction_divine_praises` | true | Base | — | Not reviewed | — |
| `adoration_litany_blessed_sacrament` | true | Base | — | Not reviewed | — |
| `benediction_versicles` | true | Base | — | Not reviewed | — |
| `adoration_lord_i_am_not_worthy` | false | Edition only | PRINTED_MISSAL_FACSIMILE_UNCOLLATED | Not reviewed | — |
| `mass_devotion_leonine` | false | Base | — | Not reviewed | — |
| `sacrament_come_holy_spirit` | false | Base | — | Not reviewed | — |
| `weekday_benedictus` | false | Base | — | Anchor reviewed | BIBLE_EDITORIAL_VARIANTS |
| `devotion_prayer_st_michael` | true | Base | — | Not reviewed | — |
| `devotion_memorare_st_joseph` | false | Base | — | Not reviewed | — |
| `devotion_consecration_christ_king` | true | Base | — | Not reviewed | — |
| `church_prayer_for_pope` | true | Base | — | Not reviewed | — |
| `devotion_st_anthony_lost_items` | true | Base | — | Not reviewed | — |
| `sacred_heart_short_prayer` | true | Base | — | Not reviewed | — |
| `sacred_heart_aspiration_trust` | false | Base | — | Not reviewed | — |
| `foundations_eternal_rest` | false | Base | — | Anchor reviewed | FRENCH_TRANSLATION_VARIANT |
| `dead_de_profundis` | false | Base | — | Not reviewed | — |
| `devotion_litany_st_joseph` | false | Base | CURRENT_HOLY_SEE_WITH_DECREE | Not reviewed | — |
| `devotion_ad_te_beate_ioseph` | false | Base | — | Not reviewed | — |
| `traditional_veni_sancte_sequence` | false | Base | — | Not reviewed | — |
| `dead_fidelium_deus` | false | Base | — | Not reviewed | — |
| `dead_eternal_rest_singular` | false | Base | — | Not reviewed | — |
| `sub_tuum` | false | Base | — | Not reviewed | — |
| `benediction_adoremus_ps116` | true | Base | — | Not reviewed | — |
| `litany_loreto_1962` | false | Base | PRECONCILIAR_COMPARATIVE_WITNESS | Not reviewed | — |
| `litany_loreto_current` | false | Base | CURRENT_HOLY_SEE_WITH_DECREE | Not reviewed | — |

### Editorial decision

Do **not** add 34 citation buttons or rewrite any prayer to match a generic source page. Instead, next actions are: (1) check exact anchors and EN/FR/LA wording for the 30 unreviewed prayers in batches; (2) resolve the 18 anchor-reviewed but not full-verbatim records, beginning with documented variants; (3) make any genuinely inadequate original-source target an explicit `link-to-work-not-exact-passage` finding before replacing it; (4) verify the existing collapsible source control on phone for every Prayer family. The canonical source owner stays unchanged. No extra card or full-text duplication is justified by the metadata flag.
