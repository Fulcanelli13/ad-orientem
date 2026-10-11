# Sacred Geography R70 — coverage-first worldwide publication

Date: 11 October 2026. **This pass prioritises broad physical-place coverage over repeated image galleries and long illustrated histories.**

## What actually changed
Six **source-backed physical sites** were added to the existing Ad Orientem Explore map, using geographic features already researched on 10 October and freshly checked original identity / ecclesiastical sources.

| Country | Published physical location | Original authoritative identity | Coordinate lineage |
|---|---|---|---|
| Singapore | Church of Our Lady of Lourdes, 50 Ophir Road | Official Catholic parish; Singapore National Heritage Board | OSM way/191010553 |
| Singapore | Church of the Nativity of the Blessed Virgin Mary, 1259 Upper Serangoon Road | Singapore National Heritage Board + URA | OSM way/32922403 |
| Morocco | Cathédrale Saint-Pierre de Rabat, Place du Golan | Archdiocese of Rabat | OSM way/236725316 |
| Morocco | Église Notre-Dame de Lourdes, Casablanca, Rond-point d'Europe | Archdiocese of Rabat's parish list and patronal celebration | OSM node/13365630026 |
| Canada | Bishop Velychkovsky National Martyr's Shrine, Winnipeg, 250 Jefferson Avenue | Original shrine and St Joseph's Ukrainian Catholic Church | OSM node/3183027127 |
| Zambia | Archdiocese of Lusaka Marian Shrine, Great East Road | Archdiocese's official 2025 Assumption pilgrimage; map confirms named shrine | OSM node/4468672099 |

The exact records with bilingual English/French descriptions, custodian URLs and coordinate source URLs are in `data/geography/research/sacred-geography-r70-global-six-site-evidence.v1.json`. The production Place registry, Shrine/heritage corpus and source registry each contain the same canonical IDs and corresponding links. Only Canada and Zambia received **destination-pilgrimage** records; ordinary churches and cathedrals did not acquire fabricated pilgrimage events. All six have `recognition_class: UNKNOWN` until independent canonical/juridical investigation. The Canadian site is **Ukrainian Catholic**, not a Roman 1962 Mass venue. No Mass schedule, special-day calendar binding, new imagery or Bible Atlas changes.

## Worldwide coverage position
- Published physical Places: **229**; shrine/heritage entries: **225**; destination pilgrimage entries: **211**.
- Countries with active shrine/heritage records: **51**.
- Basic foundation gate: all 225 published shrine/heritage entries have coordinates, English and French summaries and resolved source IDs.
- Approved hero photographs remain **18**; approved additional gallery images remain **6**; illustrated guides remain **14**. These are **enrichment metrics**, not prerequisites for broad site publication.

## The canonical 750-site research queue
This branch **updates**, rather than duplicates, the already existing `data/geography/research/sacred-geography-coverage-first-r70.v1.json` with the six newly published sites. The 750 physical candidates remain divided into ten geographically balanced 75-site waves.

| Publication reconciliation state | Candidates | Meaning |
|---|---:|---|
| Confirmed existing via explicit release records | **44** | The release record names a canonical Place ID found in production |
| Potential existing via text/name match | **106** | Requires physical-identity check before being treated as same site |
| Still needing source, identity and/or pin reconciliation | **600** | A candidate—not automatically a missing or publishable physical site |

These figures classify **candidate identity link evidence**; they do not mean that only 44 of the 750 major sites are covered, nor that exactly 600 new pins are necessary. The historic curated inventory contains discovery entries, many with no original site-specific sources yet, as well as occasional church/route/custody ambiguity.

### Editorial rule for all subsequent passes
1. For each research batch of up to 75, first identify physical duplicates and existing canonical IDs.
2. For genuinely missing sites, find independent original custodial/diocesan/heritage source, precise site pin with provenance and readable short bilingual overview.
3. Publish multiple countries in one batch where evidence permits; prioritise essential candidates, poorly represented countries and documented historically significant sites.
4. Keep **primary religious identity distinct from canonical shrine recognition, apparition authenticity, relic identity and Mass provision**.
5. Only after adequate worldwide distribution, deepen histories, liturgical dates, individual chapel maps, artwork and cinematics.

## Validation
`tests/sacred-geography-r70-six-global-sites.mjs` verifies six Place IDs, coordinate/source audit, two true pilgrimage associations, no new galleries, EN/FR in-app profiles and 750 crosswalk identity bookkeeping. The prior `tests/sacred-geography-coverage-r70.mjs` remains the only editorial authority on the 750-case queue. Registered through `tests/explore-surface.mjs`; existing Shrine and Geography count-gates are updated.

Do not merge this work into the independent worldwide TLM-directory site audit or Bible Atlas pipelines.
