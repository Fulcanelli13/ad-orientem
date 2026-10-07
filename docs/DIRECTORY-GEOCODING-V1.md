# Directory geocoding v1

This layer adds coordinates to DIRECTORY_SOT_V1 without turning coordinates into identity.

## Ownership

- Directory venues remain operational records.
- Explore places remain the shared geographic identity layer.
- Coordinates are locator assertions only; they are never stable ids and never imply cross-domain association.
- Existing official-source coordinates win. The geocoder does not overwrite a provenance-valid coordinate.

## Coordinate contract

Published directory coordinates require:

- latitude/longitude in valid ranges;
- precision: `building | address | street | locality`;
- provenance: `OFFICIAL_SOURCE | OSM_NOMINATIM | MANUAL | OTHER`;
- a stable `source_ref`;
- a source URL for external sources;
- for Nominatim results, OSM attribution, match score, and matched country code.

`street` and `locality` pins are explicitly approximate in the UI. `region` and `unknown` coordinates do not become map pins.

## Public Nominatim use

The public OSMF Nominatim endpoint is not an application runtime dependency and is not part of scheduled directory refresh.

Its policy is: https://operations.osmfoundation.org/policies/nominatim/

Ad Orientem uses it only through the explicit `snapshot/directory-geocode-*` review-branch gate. The runner:

1. is single-process and sequential;
2. waits at least 1.1 seconds between uncached requests;
3. identifies Ad Orientem through its User-Agent;
4. caches successful, empty and rejected candidate sets;
5. hard-filters by ISO country code and rejects country mismatches;
6. requires an explicit `AO_PUBLIC_NOMINATIM_ACK=1`;
7. never provides client-side autocomplete or end-user geocoding.

For recurring or materially larger geocoding work, switch to a paid/provider-hosted or self-hosted Nominatim-compatible endpoint rather than increasing public OSMF usage.

## Refresh model

`directory-snapshot-promotion.yml` runs geocoding in offline mode after source re-imports. It can only rehydrate coordinates already present in the committed cache. It cannot make geocoder requests.

New or changed addresses require an explicit geocode review branch and promotion request marker. The resulting generated data are reviewed and merged through a normal PR.

## Acceptance

A map feature is emitted only when the coordinate passes the same provenance contract used by the runtime. GeoJSON feature counts must match the set of map-publishable venue coordinates. The detail sheet exposes location precision and OSM attribution where applicable.
