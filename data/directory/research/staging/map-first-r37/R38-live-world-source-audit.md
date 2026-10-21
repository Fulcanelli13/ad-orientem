# Round 38 — official worldwide pin feed and map-first union

Date: 2026-10-10. Staging only; production map **unchanged**. This report accompanies [PR #926](https://github.com/Fulcanelli13/ad-orientem/pull/926).

## Executed first-party acquisition

The [official SSPX worldwide map API](https://map.fsspx.org/api) was harvested via the existing `SSPX Official Global Map Geolocation` GitHub Actions workflow. Successful run: [38053596314](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38053596314).

- Official source records returned: **942** across **71** countries. All have upstream CRM IDs, names, country codes, relationship labels, source URLs and valid map coordinates.
- Relationship labels: **839 fsspx**, **102 friend**, **1 ecclesia_dei**. Neither friend nor Ecclesia Dei should be automatically classified SSPX.
- Initial Mass-site candidates: **742** (689 fsspx, 52 friend, 1 ecclesia_dei).
- Mixed-use facilities withheld for review: **56**.
- Non-Mass facilities withheld: **144**.
- Official provider pins have **unassessed geometric precision**: they are map markers, not certified church entrance points.

The artifact `sspx-official-global-map-reconciliation` from the Actions run contains the raw, distinct-CRM geolocated source evidence and separate review files. The build script `tools/directory/acquire-sspx-official-map-geo.mjs` is updated in this PR to regenerate that artifact, including its relationship distinctions.

## Standalone R38 source-map export

Reconciled against 369 earlier provisional site markers and 34 previously inherited coordinates. The explicit strict rule is **same country + exactly normalized venue name + precisely equal coordinate**. This identified 22 duplicated source assertions retained under common markers. 33 of the 34 inherited pins were already represented; one additional inherited pin was added.

- **1,090** provisional source map markers across **70** countries.
- **1,090/1,090** have names, affiliation/source-family labels and source URLs.
- **474** conservative links to the 3,118 prior source claims, plus 20 ambiguous name comparisons held.
- This is **not** a count of verified distinct physical churches or verified door-level pins.
- No Sunday, weekday or other Mass times were imported.

The standalone HTML and self-contained GeoJSON/CSV package are maintained outside the production branch pending final map integration and rights review. Recovered OSM/Nominatim coordinates must keep attribution and comply with ODbL before redistribution.

## Next source families

Latin Mass Directory maintains an interactive country/venue listing with no confirmed public bulk export endpoint. Mass of the Ages currently embeds a Mapme map, rather than publishing a validated open coordinate feed. Acquire additional exact pins only with traceable source provenance; do not fabricate geocodes, and never duplicate the 942 official provider records blindly.
