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

The Prayer source register records **48** canonical prayers: **14** marked `source_visible:true`, **34** `source_visible:false`, and **46** with `source_url`. A false visibility field is a **candidate presentation gap**; it is not proof of absent attribution or that an original link should be duplicated. Audit each item in its existing reader first.

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

1. **Prayer provenance first (P1):** trace the 34 source-hidden prayer records to their rendered location, then determine whether the nested reader already shows the link. Fix the source presentation rather than adding another prayer card.
2. **R17 Scripture (P1):** examine all Epistle/Gospel/extended lessons against their source-ordered Proper identity and exact source reference; do not rewrite or re-order a Mass section.
3. **Shared Scripture context (P1):** confirm first-use lazy loading, Bible-selection limitations, explicit edition/versification cautions, optional commentary and return to the same card/position.
4. **Learn and formation (P2):** inspect each of the 15 launchers and nested sources. Maintain the publication hold on the 60 Apologetics and 81 Church Crisis dossiers; no automatic mass activation of contextual links.
5. **Prayer references (P2):** audit 20 Rosary mysteries, 14 Stations (some deliberately without biblical narrative equivalents), seven penitential psalms, seven last words, and eight curated Prayer Library origins. Distinguish original source text, biblical inspiration and later devotion.
6. **Apostolate and Explore (P2):** inspect scenario and place source controls before adding Glossary citations; never create a duplicate doctrine or place record.
7. **Visual consolidation (P3):** only after the coverage and real phone/browser pass, standardise discreet Scripture, Glossary and original-source capsule placement.

## Acceptance gate

Every proposed new control must record exact content ID, canonical owner, reference/term/source ID, editorial identity, source URL/locator, English/French behaviour, source scope (original/translation/commentary), return-context semantics, error-state behaviour and browser evidence. For every `NOT_AUDITED` row, first prove there is a relevant user-facing claim and that existing nested controls are inadequate. A missing cross-link is not automatically an error.

Preserve current six ribbon destinations, all existing route aliases, Prayer owner, R17 reader, Calendar authority, Glossary lazy-loading, and the unpublished Formation/Bible-edition publication gates. The proposed broader navigation redesign is a separate decision.
