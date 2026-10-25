# Ad Orientem — map-first GeoJSON recovery (Round 37)

Status: research/staging, 2026-10-10. **Not a production activation.** No Sunday or weekday timetable data is imported.

The pre-existing repository had 20 generated coordinate files. We have extracted **844 coordinate assertions** into five auditable source batch files without deleting or merging source identities. Of these, **369** have usable site-scale precision and passed the initial facility-type filter. The rest are **373 locality-only points** and **102 non-worship facilities**; both groups remain withheld from the map layer.

`provider-pins-merged.geojson` contains 369 distinct source venue IDs with name, ISO country, affiliation, source URL and coordinates. Precision: 137 building, 135 address, 97 street. By affiliation: FSSP 185, ICKSP 95, SSPX 61, IBP 12, Czech Una Voce-related 16. These figures count **source venue IDs, not certified distinct churches**, and some may overlap other source layers.

- Do not treat office, residence, school, headquarters or city-centre geocodes as public Mass pins.
- Do not infer una-cum, sedevacantist, canonical or communion positions from building or provider association. They require sourced ministry-level evidence.
- Coordinates are **provisional**, not church-entrance certified; proximity or shared geocodes cannot justify automatic physical-venue merging.
- Sources include official operator pages and geocoder-derived coordinates. OpenStreetMap/Nominatim-derived data requires preservation of attribution and ODbL compliance review before redistribution.
- Source URLs should be kept in publication even if a label or position changes.
- The live SSPX API (`https://map.fsspx.org/api/v1/places.geojson`) remains a separate potential acquisition; **no live API dataset has been silently counted** in these totals.
- Latin Mass Directory and Mass of the Ages source-coordinate reconciliation remains outstanding.

This pull request stages recovered evidence only. The R37 standalone HTML is a separate test artifact loading the staged GeoJSON through the public raw GitHub URL. Integration into the application source-of-truth map requires the usual review and deduplication gates.
