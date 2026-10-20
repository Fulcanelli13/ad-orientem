# Pilgrimage route geometry and publication rights — R3
20 October 2026 · Ad Orientem / Explore D · **Research-to-production gate**

## Result

- Canonical journeys examined: **20/20**.
- Pilgrimages already with organizer-attested named locations: **17 routes, 64 named places** (previous R2 work).
- Exact edition-matched, geospatial route line **licensed and technically certified for Ad Orientem: 0/20**.
- Safe external itinerary reference: **Walk to Mary organizer map / Ngā Tapuwae diocesan PDF**.
- GPX evidence found for **different Walsingham journeys**, not the canonical LMS Ely–Walsingham 2026 route.
- Nothing in this R3 assessment authorizes generating route lines, publishing map-derived vectors, offering turn-by-turn safety guidance or marking a journey as navigable.

**Machine-readable complete review register:** `data/shrines/route-geometry-review-20261020.v1.json`.
**Named stages:** `data/shrines/route-stage-evidence-20261020.v1.json`.
Both join the existing canonical `route_id`; there is no new duplicate pilgrimage database.

## What we learned from organizers

1. **Walk to Mary:** [Official Our Path](https://walktomary.com/our-path/) presents an organizer interactive map with mile markers, join-in points, parking and aid stops. The 2023 [published map PDF](https://walktomary.com/wp-content/uploads/2023/02/WTM-Route-Map-2023.pdf) is historical relative to the scheduled 2027 edition. Link to the official map; **do not import Google My Maps geometry** without permission and edition match.
2. **LMS Ely–Walsingham 2026:** [British Pilgrimage Trust Ely–Weeting](https://www.britishpilgrimage.org/portfolio/pilgrim-ways-to-walsingham-ely-to-wheeting) is a different two-day route segment. [Trailblazer London–Walsingham Camino](https://trailblazer-guides.com/update/london-to-walsingham-camino) advertises updated 2026 GPX/KML and downloadable stage files, but starts in London and is a **different thirteen-stage Camino**, with files available to guidebook readers and no Ad Orientem republication rights. Neither is the 2026 LMS Ely–Priory pilgrimage GPS file.
3. **Ngā Tapuwae:** [Auckland Diocese self-guided itinerary](https://www.aucklandcatholic.org.nz/lifeinfaith/nga_tapuwae/) and [official route overview PDF](https://www.aucklandcatholic.org.nz/wp-content/uploads/2024/08/NGA-TAPUWAE-Route-Overview-1.pdf) describe a broad regional set of visits (Auckland, Waipoua, Hokianga, Waitangi/Russell) with *driving and ferry transfers*. The route cannot be reduced to a Russell-bound walking path. `route_model=MULTIMODAL_REGIONAL`, and the linked PDF is presented externally with a mode warning.
4. **Nigeria:** [FSSP annual member page](https://www.fsspnigeria.org/pages/donate/associate-membership.php) advertises 30-km Rosary processions; [FSSP event archive](https://www.fsspnigeria.org/pages/current-events/2016-events.php) records a 2016 Shrine-to-Holy Trinity Cathedral procession, while older accounts describe Holy Rosary Parish in Orlu toward Umuaka. Different years and celebrations must not be treated as the same path. Historical variants can be separately entered if the organizer provides date, origin/destination and identifiable route.
5. **Paris–Chartres:** [Notre-Dame de Chrétienté 2026](https://www.nd-chretiente.com/en/the-pilgrimage/the-paris-chartres-pilgrimage/) confirms organizer dates, camps, route type and Mass sites, but a rights-cleared 2026 GPX/KML download was not verified in this research batch.
6. **Paray:** [Sanctuary's four-stage path](https://sacrecoeur-paray.org/parcours-du-pelerin-fr/) is suitable for an *ordered devotional guide*, not an inferred line across the complex.

### Full 20-route acquisition status

| Canonical route ID | Current evidence class | Safe external organizer guide | Non-equivalent route assets |
| --- | --- | --- | --- |
| `route:FR:laghet-paillon-old-road` | ORGANIZER DESCRIPTION NO VECTOR VERIFIED | — | — |
| `route:FR:paray-pilgrim-path` | OFFICIAL TEXT STAGES ONLY | — | — |
| `route:FR:paris-chartres-pentecost` | ORGANIZER ROUTE FILE REQUEST NEEDED | — | — |
| `route:FR:sainte-anne-chemin-nicolazic` | ORGANIZER DESCRIPTION NO VECTOR VERIFIED | — | — |
| `route:MU:pere-laval-saint-louis` | ORGANIZER DESCRIPTION NO VECTOR VERIFIED | — | — |
| `route:MU:pere-laval-saint-joseph` | ORGANIZER DESCRIPTION NO VECTOR VERIFIED | — | — |
| `route:US:walk-to-mary` | ORGANIZER INTERACTIVE MAP LINK ONLY | [Organizer guide](https://walktomary.com/our-path/) | 1 non-equivalent historical/related reference |
| `route:CA:canadian-martyrs-traditional` | ORGANIZER DESCRIPTION NO VECTOR VERIFIED | — | — |
| `route:GB:ely-walsingham-lms` | RELATED DIFFERENT ROUTE GPX AVAILABLE | — | 2 non-equivalent historical/related references |
| `route:GB:holywell-church-to-well` | ORGANIZER DESCRIPTION NO VECTOR VERIFIED | — | — |
| `route:NZ:nga-tapuwae-russell` | OFFICIAL MULTIMODAL GUIDE LINK ONLY | [Organizer guide](https://www.aucklandcatholic.org.nz/wp-content/uploads/2024/08/NGA-TAPUWAE-Route-Overview-1.pdf) | — |
| `route:NG:nne-enyemaka-rosary-procession` | HISTORICAL VARIANTS DIRECTION CONFLICT | — | 2 non-equivalent historical/related references |
| `route:MX:guadalajara-zapopan-romeria` | ORGANIZER DESCRIPTION NO VECTOR VERIFIED | — | — |
| `route:BR:belem-cathedral-nazare` | ORGANIZER DESCRIPTION NO VECTOR VERIFIED | — | — |
| `route:NL:winthagen-maastricht-sterre-der-zee` | ORGANIZER DESCRIPTION NO VECTOR VERIFIED | — | — |
| `route:PT:braga-cathedral-sameiro` | ORGANIZER DESCRIPTION NO VECTOR VERIFIED | — | — |
| `route:US:great-meadows-doylestown-czestochowa` | ORGANIZER ROUTE FILE REQUEST NEEDED | — | — |
| `route:DE:preith-bettbrunn` | ORGANIZER DESCRIPTION NO VECTOR VERIFIED | — | — |
| `route:US:lake-george-auriesville-restoration` | ORGANIZER DESCRIPTION NO VECTOR VERIFIED | — | — |
| `route:US:amsterdam-auriesville` | ORGANIZER DESCRIPTION NO VECTOR VERIFIED | — | — |

## Concrete geometry-certification checklist

For each proposed KML/GPX/GeoJSON, require:
- **Route ownership:** original organizer or a provider licensed by the organizer.
- **Event identity:** exact route ID, route name, start/end, direction and edition; no substitution by a nearby Camino or a different annual loop.
- **Topology:** connected stages and ferry/road/walking modes; verify GPX timestamp/metadata and obvious excursions, distances and access restrictions.
- **Rights:** explicit permission for hosting/simplification/display in an app (commercial status and redistribution included), credit, attribution text and license source. Public downloadability **is not** redistribution permission.
- **Safety and freshness:** organizer's current instructions, access times, closures and edition validity. A previous route can remain historical but cannot be claimed current.
- **Versioning:** preserve source URL, retrieval date, file hash, transformed-file hash, approvals and owner; never quietly overwrite prior editions.
- **QA:** compare vector against independently documented named stops without turning a name into a guessed coordinate; mobile gestures and pan/zoom visual review before release.

### Priority outbound requests (no message sent)

1. Walk to Mary — request the 2027 definitive organizer GPX/KML/GeoJSON, reusable rights and attribution language.
2. Notre-Dame de Chrétienté — request 2026 geospatial trail, camps and edition-specific restrictions.
3. Latin Mass Society — ask for the exact August 2026 **Ely→Walsingham Priory** GPX, not London Camino / Ely–Weeting alternatives.
4. Paray Sacred Heart sanctuary — seek the four-chapel official on-site layout with approved display rights.
5. Auckland Diocese — ask permission to link/embed itinerary maps and whether downloadable **per-leg**, transport-aware route data exists.
6. FSSP Nigeria — request the *current* 30-km processional route, precise annual edition, start/end and stops.

## UI/engine disposition

`src/find/explore-data-service.js` optionally loads the R3 register. `src/find/pilgrimage-journey.js` may render organizer **links and mode warnings only**. It **must never** set a route geometry reference or populated intermediate coordinate from this file. The normal D named-stage timeline remains the highest in-app representation unless separate certification succeeds.

Acceptance: `tests/explore-pilgrimage-journey.mjs` verifies **20 exact canonical route IDs**, an unchanged `null` geometry for all, rights `NOT_CLEARED`, historical Nigeria caveat, Walsingham non-equivalent GPX, and the Ngā Tapuwae external PDF + multimodal warning. Browser acceptance checks those distinctions at 320, 390 and 1440 pixels.

**Research round status: complete. GPS publishing status: not approved.**
