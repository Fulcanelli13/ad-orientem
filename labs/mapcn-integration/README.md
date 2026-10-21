# MapCN × Ad Orientem — P0/P1 integration laboratory

**Non-production / review-only.** Accessible at \`/labs/mapcn-integration/\` on this branch's preview deployment. This directory has no import into the application's production Explore entry point; it adds no migration and no new JavaScript framework.

## Four working adaptations

1. **Discover** — MapCN [Store Locator](https://www.mapcn.dev/blocks/store-locator) pattern: list ↔ map selection, search, source links and camera focus.
2. **Time & Mass** — MapCN [Uptime Monitor](https://www.mapcn.dev/blocks/uptime-monitor) status-sidebar pattern: source-attested schedule records, human-readable schedule wording, date selector showing the canonical liturgical *season*, no guessed next-Mass or live operational status.
3. **Heatmap** — MapCN [Heatmap](https://www.mapcn.dev/blocks/heatmap) pattern: MapLibre native heatmap layer over *existing publishable mapped* places.
4. **Choropleth** — MapCN [Choropleth](https://www.mapcn.dev/blocks/choropleth) pattern: Natural Earth country geometry and counts of canonical publishable mapped records, grouped only by explicit country provenance. Counts indicate our database coverage, not religious participation.

Source of truth: \`src/find/explore-data-service.js\` → \`src/find/explore-projection.js\` → \`src/find/heritage-map.js\` and \`src/calendar/liturgical-year.js\`. Read-only adapter is \`./adapter.js\`; layout/MapLibre layer controller is \`./lab.js\`.

## Architectural decision

These are **native-JavaScript ports of the documented MapCN block patterns**, **not imported original React/Next.js components**. This is deliberate: the original Store Locator and Uptime Monitor require React/shadcn; Ad Orientem already has MapLibre, place projections and a client-side shell. Evaluate visual quality before deciding whether additional React overhead is warranted. MapCN's own block source is [MIT-licensed](https://github.com/AnmolSaini16/mapcn/blob/main/LICENSE). The country geometry URL is the same Natural Earth v5.1.2 URL consumed by MapCN; MapLibre uses the app's existing OpenFreeMap dark style instead of MapCN's CARTO defaults.

## Provenance and uncertainty gates

- Only \`map_publishable\` records with explicitly valid published geocoordinates may appear; approximate positions remain labelled.
- Directory schedules remain attached to their ministry and original source. Raw strings are **not parsed into next-Mass occurrences**; “source-attested” is not “currently open.”
- The date selection shows the 1962 **season**, not an independently computed ordo. The canonical Calendar retains ownership of the feast observed on a given day.
- Choropleth and heatmap are explicitly labelled **coverage**, not accurate regional participation or complete Catholic population datasets.
- No geographic matching by name/proximity and no line geometry for pilgrimage routes.
- If Natural Earth country polygons fail to load, no invented polygons are substituted. UI exposes a failure message.
- Clicking MapCN originals opens public source demos in a separate tab; no demo store or earthquake records are imported.

## Acceptance

\`node --test tests/mapcn-lab-contract.mjs\`

The browser check runs the real route under an ephemeral local HTTP server with viewport coverage at 320px, 390px, 1440px. It writes screenshots into \`artifacts/mapcn-lab/\` and verifies tab interaction, the map canvas and no document overflow. PR review is required **before** integration into production Explore.

## Pending after P1

Get user visual ratings of all four modes; decide whether the native ports look close enough to the MapCN originals. If not, keep the lab and trial an *isolated* React island, never a full app migration. Only after approval should any Explore production screens change.

This laboratory does **not** implement the Bible Theatre StoryMaps pilot; that remains a distinct track using the existing 151-event biblical chronology.
