# Pilgrimage route evidence — R1 (20 October 2026)

Status: **named stages published for six of twenty documented routes; route geometry certified for zero**. Editorial candidate evidence only, not a GPS routing release.

## Release boundary
- Source registry: `data/shrines/shrines-pilgrimages-seed.v1.json` (240 pilgrimage records; 20 exact route IDs). All 20 canonical routes remain `DOCUMENTED_UNMAPPED`; do not change to `MAPPED`.
- New linked evidence: `data/shrines/route-stage-evidence-20261020.v1.json` (six route identities and 18 ordered names). Each entry has the exact route ID and an organizer or diocesan URL, edition context, and explicitly null latitude and longitude.
- The D Journey timeline may show those **named** stages. It must not call them geolocated or navigable, place a pin at the destination's coordinate for a stage, estimate distances, or draw connecting polylines.
- A route can gain renderable geometry only after direct KML/GPX/GeoJSON or cartographic evidence is obtained for the exact organizer route/edition and reuse rights are confirmed. A route planner's shortest path or straight line between buildings is **not** the pilgrimage.

## R1 evidence accepted

| Canonical route ID | Names | Organizer source | Evidence scope |
| --- | ---: | --- | --- |
| `route:FR:paray-pilgrim-path` | 4 | https://sacrecoeur-paray.org/parcours-du-pelerin-fr/ | Official order: Sacred Heart Basilica, Saint-Jean Chapel, Apparitions Chapel, La Colombière Chapel; on-site walking line not published |
| `route:FR:paris-chartres-pentecost` | 4 | https://www.nd-chretiente.com/pelerinage-chartres/pelerins-marcheurs/ | Official 2026 context: Paris Saint-Sulpice, bivouac Choisel, bivouac Gas, Chartres Cathedral; four named places are **not** the same as the source's three journey days |
| `route:US:walk-to-mary` | 4 | https://walktomary.com/our-path/ | Official published joining sequence at Old St Joseph, St Peter & Paul, Holy Cross, Our Lady of Champion; page now advertises 2027; organizer's embedded external map can be opened but has not been copied |
| `route:MU:pere-laval-saint-louis` | 2 | https://dioceseportlouis.org/informations-sur-le-pelerinage-au-caveau-du-pere-laval/ | Diocese's 2026 departure at Saint-Louis Cathedral, arrival at Père Laval, Sainte-Croix |
| `route:MU:pere-laval-saint-joseph` | 2 | https://dioceseportlouis.org/informations-sur-le-pelerinage-au-caveau-du-pere-laval/ | Diocese's 2026 departure at Saint-Joseph Terre-Rouge, arrival at Père Laval, Sainte-Croix |
| `route:US:lake-george-auriesville-restoration` | 2 | https://pilgrimage-for-restoration.org/arrival/check-in-thursday/ | Organizer's 2026 Wood Park gathering and step-off, Auriesville shrine destination; camping/check-in details are edition-specific |

## Evidence not allowed to change stage geometry yet
- Walk to Mary's official Google My Maps embed is **external**: https://www.google.com/maps/d/embed?ll=44.50775787430333%2C-87.9387949855585&mid=1Kf_rYIo3dg2Gltpn8sWmxkiJULpS6mY&z=11 . No rights or validated downloadable route artifact has been certified for republication.
- Père Laval diocesan 2026 announcement names event departure locations and devotional animation zones. The more detailed published street-by-street pathway located in an older diocesan archival page concerns an earlier edition; do not present it as the 2026 route.
- Walsingham 2026 requires reconciliation: Latin Mass Society's chairman announced on 31 March 2026 that its 2026 conclusion would be at **Walsingham Priory grounds** rather than the RC Shrine's previous Mass venue: https://www.lmschairman.org/2026/03/lms-walsingham-pilgrimage-booking-open.html . Existing route's canonical Catholic shrine destination and generic official source should not be silently rewritten; determine how to model route-specific ceremonial endpoint versus sanctuary destination before mapping it.
- Paray's existing canonical destination coordinates locate the sanctuary, not the exact fourth-stage La Colombière chapel. UI must call the action 'Show sanctuary anchor', not 'Show final chapel'.

## Production gates for future geometry
1. Exact published route or downloadable edition-specific GPX/KML/GeoJSON from the organizer, or an independently surveyed path with provenance and permission.
2. Route identity and edition, accuracy/precision and geographic plausibility reviewed against named stages.
3. Reproduction terms, attribution and publishing permission checked; for licensed OSM derivatives carry ODbL attribution/obligations.
4. Only then populate a versioned `routeGeometry` reference, waypoint lat/lng values, and visible lines. Keep route status `DOCUMENTED_UNMAPPED` until all gates pass.
5. Retain older journeys as historical editions. Never imply an obsolete route is safe/current for navigation.

Remaining source-discovery queue: 14 routes without ordered named-stage evidence; 20 without app-owned certified walking line; all require 2026/2027 variant checks where applicable.

## UX gate
`node tests/explore-pilgrimage-journey.mjs` checks exact route joins, all 18 names, zero guessed locations and source links. `tests/explore-medallion-visual-acceptance.mjs` must verify the ordered 4-stage Chartres timeline at mobile and desktop widths before the draft PR is eligible for a merge review.
