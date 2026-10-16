# Biblical Atlas — physical-geography map review (15 October 2026)

**Owner:** Explore 151-event Atlas (`src/find/bible-atlas.js`, `browser-entry.js`, shared `map-runtime.js`). **Tracking:** #342. **Previous opt-in cinematic review:** #1235/#1236, design donor #1010. **Entry:** `?atlasCinema=1` only.

## Editorial definition

This is **a contemporary physical geography reference**, not a reconstruction of Biblical-period geography or political boundaries. It displays modern coastlines, six named natural lake families (7 features), the most relevant named river segments (17 features), and Natural Earth 1:50m land polygons (1,420 features). There are **no country polygons, national borders, modern city labels, street names, schematic Exodus or Abraham routes, unapproved sacred artworks, or inferred historical pins**. Named lakes/rivers were whitelisted for physical geography but their names were removed from in-app layer properties, preventing automatic political/scholarly claims. Care is required: features such as present-day Dead Sea shorelines and modern waterways are not faithful to the Second Millennium BC or all Biblical eras.

Sources: **Natural Earth** official project, physical vectors, public domain. https://www.naturalearthdata.com/about/terms-of-use/ and https://www.naturalearthdata.com/downloads/50m-physical-vectors/ . Upstream repository: https://github.com/nvkelso/natural-earth-vector (`geojson/`).

Immutable source blob hashes at acquisition:
- `ne_50m_land.geojson`: `c412c52b5286ba727dcb7047ecd6080bcbeb8298`.
- `ne_50m_lakes.geojson`: `5ddced58279ea13ae5023929f135bb7ecfd12d95`.
- `ne_50m_rivers_lake_centerlines.geojson`: `6f9d88ea3498448c7f29f458ce42a771a36bd6be`.

The application vendors **three scoped GeoJSON files** into `data/explore/`; geographical coordinate precision is rounded to 4 decimal places and unused GIS attribute dictionaries removed, while polygon rings and feature geometry remain intact. These are no longer dependent on the availability or CORS policies of a third-party data provider. The only external runtime dependency remains the **existing MapLibre library CDN**, shared with the existing Explore map.

## Architecture

`ATLAS_PHYSICAL_STYLE` is a self-contained MapLibre v8 style containing only background, land, coastal line, lakes and river lines. `mountExploreMap` gains a nullable `styleOverride` parameter; only `state.bibleAtlas && bibleCinemaPreview` passes this option. For all other Explore routes (Directory, pilgrimage, shrine, saints, other maps) and for the default Biblical Atlas, the preexisting OpenFreeMap dark style remains authoritative. Canonical 151 event keys, geocoding confidence, map clustering, input handling, chapter bar, compact sheet, no-location state and native Scripture roundtrip remain untouched.

An explicit bilingual header note discloses *modern shorelines, no political borders*. Do not change the name to “ancient world reconstruction” until an independent, source-based period-appropriate coastline, hydrology, topography, attribution and artwork review is complete.

## Testing and promotion gate

Dedicated test asserts count/shape/size, source URLs, no symbol or administrative features, the conditional style override and no changes to 151 canonical milestones. Chromium browser must successfully fetch **all three self-hosted GeoJSON files (HTTP 200)**, reach map-ready, and capture 320/390/768 views, followed by canonical Scripture return. CI and screenshot reviews precede merging even into the opt-in site preview. **Physical Android handset touch/pan/Follow is not certified by desktop Playwright** and remains a mandatory human check before promoting the cinematic mode to default.

No new app module is created and no prior research PR is closed. The existing unapproved legacy atlas geographical/historical scene interpretations in #1069 remain held.
