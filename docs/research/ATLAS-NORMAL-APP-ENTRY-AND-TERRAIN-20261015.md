# Biblical Atlas — normal-app feature integration and mobile acceptance

**Issue:** #342. **Date:** 15 October 2026. The user reported that the map in Ad Orientem remained plain and the historical context was absent, despite the successful PR merges and GitHub Pages deployment.

## Verified cause
The code under `src/find/browser-entry.js` used `query.get("atlasCinema")==="1"` to activate the map-first 151-event cinematic map, physical geography and 22 settlement labels. It further required `?atlasHistory=1` **in addition** to `?atlasCinema=1` for the 11 historical-name and Ephesus/Miletus source notes. The notes were nested in a collapsed sheet. A normal app URL therefore visibly lacked them. The previous claim “deployed” was factually true of dormant code, **not** normal product integration.

## Remedy
- Biblical Atlas now opens map-first with the physical map, timeline/chapter navigation and existing context by default at ordinary `index.html` — no query flags required. The 151 canonical event story ID corpus, geolocation and ordinary non-Bible Explore modules are untouched.
- A **permanently visible, keyboard-accessible Context / Contexte shortcut** on the event sheet expands the scene's canonical summary, geographic qualification and Scripture controls; when an editorially sourced `Historical name` or `Ancient landscape` research note exists, the same button opens it immediately.
- Historical notes remain explicitly source-linked and no research-only bulk ledger is imported. `?atlasCinema=0` opts back into the classic Atlas for targeted regression; `?atlasHistory=0` switches off optional historic research cards while retaining cinematic display.
- The formerly featureless physical background adds **modern topographical hillshade** derived from public Mapzen/Tilezen Terrarium raster DEM, openly hosted on AWS at `s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png`. This is a physical elevation raster, not an ancient reconstruction. Land, lake, rivers and geopolitical-free base style remain from pinned Natural Earth assets. Attribution includes the Tilezen/source credits. If DEM tiles are unreachable, the map keeps the base physical geography. No fabricated ancient harbours or geo-rectified Biblical terrains are introduced.
- In-app disclaimer is explicit: `MODERN PHYSICAL RELIEF · PRESENT-DAY COASTLINES` / `RELIEF ACTUEL · LITTORAUX ACTUELS`.

## Acceptance
Directly test the normal URL without parameters on Chromium at 320/390/768; verify that the map-first layout, 151 events, chapter rail and visible Context control load; select Ephesus and Miletus, open their cited notes with one click, and round-trip the Scripture reader. Check actual AWS DEM tile responses rather than just a source configuration. Run the same full existing mobile, visual, app and main acceptance. The former “classic” browser test explicitly chooses `?atlasCinema=0` instead of accidentally asserting that default is still classic.

**Unresolved:** MapLibre's real-world DEM tile availability, quality/performance on lower-end devices, full ancient shoreline reconstruction, aesthetic historical relief, and touch-drag/Follow on an actual Android handset are separate from Chromium emulation and must not be represented as certified. The historical-name cards cover selected 11 names, not an approved ancient-language label for every event. Avoid permissions requests and further inventories.
