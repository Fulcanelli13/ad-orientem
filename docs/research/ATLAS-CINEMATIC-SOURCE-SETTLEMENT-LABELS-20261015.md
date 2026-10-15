# Source-qualified settlement labels — Biblical Atlas review

**Design:** Continue canonical #1237 physical map; **owner:** existing 151-event Atlas; **tracking:** #342. This is neither a new ancient place corpus nor geocoding/mapping project.

## Admission gate
The only input to a label is a *previously accepted* `ATLAS_GEO` pin. Its `geo.key` must be on the explicitly curated English/French alias allowlist, `kind` must be `settlement` or `city_context`, and its existing source URL and finite geographic coordinates must be recorded. None of those coordinates, names or historical certainty statuses are enhanced by a visible label. A city-level reference point remains a **city-level reference**, not a pin for an individual event within the city.

The label allowlist currently covers 22 established settlements and city-level anchors, including Hebron, Jerusalem, Jericho, Nazareth, Samaria, Rome and key Pauline destinations. This is a conservative display layer over already owned place identities. Traditional sites (including the candidate Transfiguration mountain, Gethsemane site and Bethlehem's traditionally identified locus), disputed identifications, natural features or unlocated episodes do not gain new labels. An existing place ID and its latitude/longitude are never overwritten.

## Runtime boundary
`atlasMapItems(stops,index,{cinematic:true,language})` derives labels only for entries already source-qualified in the current era up to the current chronological index. The ordinary `atlasMapItems(stops,index)` is unchanged and emits no labels. Feature conversion preserves original geometry and object IDs, and exposes one optional `atlas_label` map property. The existing MapLibre `ao-explore-items` GeoJSON source gains a collision-aware symbol layer **only when `styleOverride` is supplied**, i.e. on the opt-in `?atlasCinema=1` Biblical Atlas map. No independent marker or label source, separate map engine, new place pin, secondary gazetteer, hardcoded journey, or source-book import.

The in-app selector and native Scripture return remain existing owner flows. French strings are source-review/display aliases only, not certified historical transliterations.

## Attribution and limitations
Canonical coordinates and source IDs remain in `src/find/bible-atlas.js` `ATLAS_GEO`, often grounded in the pinned OpenBible.info Bible Geocoding Data witness; that dataset distinguishes ancient place identification from modern position and grades uncertainty (https://github.com/openbibleinfo/Bible-Geocoding-Data). Its documented license is CC BY 4.0; maintain its existing per-anchor provenance. The physical basemap is the separately sourced public-domain Natural Earth #1237 data; it still represents modern coastal and river geography.

These labels **do not imply** period-correct city boundaries, Bible-era routes, certainty of exact temple sites, date of settlement, or accuracy of a site's modern pin. Exact ancient names and period-specific identifications should be reconciled against independent scholarly gazetteers (such as Pleiades where relevant) before adopting a permanent historic-toponym set.

## Acceptance
CI asserts the 151 original stops, no added map geometry across all 151 selections, English/French names, exclusion of traditional sites and zero labels in unflagged Atlas mode. Real Chromium 320/390/768 screenshots from the physical map workflow remain required for design review. A passing CI test does not certify actual Android map/label gestures, all period names or final visual quality.
