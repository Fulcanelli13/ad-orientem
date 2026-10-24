# Sacred Places P22 — Minimum publication record and first 10-site map-first release

_Date: 24 October 2026. Branch proposal; acceptance contingent on CI and merge._

## Governing simplification

From P22 onward, new Catholic Sacred Places do **not** need a biography, bilingual historical introduction, photograph, independent source record for the already-attributed OSM map feature, feast date, visitor opening hours, entrance, pilgrimage narrative, shrine/relic/saint linkage, or relationship to TLM Mass Times. Such fields can be added later.

**Mandatory:** a stable unique physical-site ID and honest name/type, country and locality, accountable source showing Catholic identity, site-level coordinates tied to the correct named physical building, map attribution/precision, and no conflicting prior canonical record. One typed source record for the site identity is enough; its distinct location assertion belongs in `Place.geo` with a link to the named OSM feature. Keep evidence URLs internally: they are not automatically user-facing action links. Source research holds, institutional doubts and separate chapel/building geometry **remain binding**.

This does **not** authorize publishing vague country shrines, Coptic Orthodox/Anglican buildings as currently Catholic, or appending every parish in the world. It also does not waive OSM attribution or replace country-by-country discovery and deduplication.

## First release proposal

The attached `data/geography/research/sacred-places-p22-map-first-ten-sites.v1.json` records ten separate institutionally attested Catholic sites with mapped OSM way IDs:

- Vicenza: Santuario Santa Maria di Monte Berico
- Šaštín-Stráže: Basilica of Our Lady of Seven Sorrows
- Lyon: Basilica Notre-Dame de Fourvière
- Marseille: Basilica Notre-Dame de la Garde
- Madrid: Basilica-Parish Nuestra Señora de Atocha
- Scherpenheuvel: Basilica of Our Lady
- Mellieħa: National Marian Sanctuary
- Ballintubber: operating Catholic Abbey Church (not assertion of monastic abbey community)
- Bologna: Sanctuary of the Madonna di San Luca
- Braga: Basilica of Bom Jesus do Monte (distinct from grounds polygon)

**Canonical delta:** 361 → 371 Places; 659 → 669 typed sources; 361 → 371 heritage crosswalk; 102 → 112 Places awaiting optional direct heritage-category claims. Geographic area identities remain 141; Directory–Place links remain nine. The original P16 sixteen unresolved title/identity holds remain preserved. Every new location uses a *site/building feature*, not a square, grounds polygon, nearby chapel or route. Coordinates are approximate building centroids, **not certified entry gates**.

## Source assurance and acceptance

Primary custodian, diocesan or accountable regional tourism records establish the ten identities; OSM feature names, Catholic denomination where indicated, building type and map location independently establish geometry. Exact original source and OpenStreetMap link are preserved in the release manifest; no attribution or source URLs are stripped.

The dedicated `test:sacred-places-p22` must run under `test:explore-geography`; historical Place/source/heritage regression tests must be adjusted to the new counts without weakening legacy assertions or redefining old source research manifests. Complete CI checks before merge.

**Faster next waves:** prioritize direct custodian lists and verifiable specific building map features; publish qualified new records in larger increments. Maintain holds for ambiguous site/complex relationships. Continue parallel study/photo/links research only when it does not slow verified map coverage.
