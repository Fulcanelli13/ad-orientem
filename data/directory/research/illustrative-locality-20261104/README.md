# TLM Atlas — illustrative locality map markers (2026-11-04)

The **CL2 physical site directory** is the only registry. This work does not create a second church, venue, Ministry, Place or Mass schedule registry, and it does not redesign the approved Explore map.

The user-facing TLM Atlas is primarily a **church discovery and source-information map**. It does not provide navigation-grade coordinates. Building, address and locality-level coordinates can be shown with explicit precision and provenance. **A locality marker must never be passed to an external navigation service as an arrival point.** Search the documented church name and source address instead.

## Source and decision census

- Worldwide directory: **2,582** existing records (2,579 CL2 physical sites plus 3 separately published additions), unchanged.
- Initial mapped baseline on `main`: **2,147**.
- Frozen unpinned research records: **435**, each separately assessed in `review.v1.json`.
- Eligible **illustrative locality** additions: **170** (following reclassification of the Poprad church due to a source-city conflict).
- Explicit source-site / alias / historical / closure holds: **8**.
- Ambiguous gazetteer matches: **8**.
- No sufficiently reliable locality match: **249**.
- Potential mapped count after all 170 additions are safely released: **2,317 / 2,582** (89.7%), leaving **265** unpinned.
- **No new active Mass, Mass time, canon, Una Cum, canonical status, Missal edition or priest assertions.**

All 170 positions are **centres of named populated places**. They are neither church footprints, chapel entrances, church street addresses nor validated GPS destinations.

## Data provenance

The locality gazetteer is `joelacus/world-cities/world_cities_15000_(including_all_states_and_counties).csv`, pinned to commit `e9afd6a75709df79ce9c3d1332eac2c4b5937477` and Git blob `95a1e4245fc0ef338785fd9da5369f812dfb16ba`. The derived locations are from **GeoNames, CC BY 4.0**. Attribution is retained: *GeoNames contributors · CC BY 4.0 · locality only, not the church*. Full source: https://github.com/joelacus/world-cities/blob/e9afd6a75709df79ce9c3d1332eac2c4b5937477/world_cities_15000_%28including_all_states_and_counties%29.csv

The review joins the frozen CL2 country, exact source identifier, exact church title and source location description. US matches additionally require a state match. Distinct same-named towns are not auto-selected; the incomplete smaller-village cohort is left unpinned rather than guessed.

## Safety, existing functionality and maintenance

1. The existing `REVIEWED_NEW_SITE_PINS` exact church geometry always takes precedence. Original CL2 identities and source links remain immutable.
2. The new `CL2_ILLUSTRATIVE_LOCALITY_PINS` adapter overlay provides precision `locality`, `approximate: true`, `map_state: PROVISIONAL` and an explicit visitor warning in English and French.
3. Google Maps receives a **search query built from the documented church name and original source address**, not the indicative latitude and longitude. A result must be checked by the visitor; this is not a verified navigation destination.
4. Known identity exceptions (including the Poprad source-city conflict, Reading St Mary's, Holy Spirit Bootle and physical aliases) remain blocked. A closed former church is not presented as a verified active Mass location.
5. CL27 source-scoped community, `una cum`, canonical and liturgical-book uncertainty remains unchanged; no new photographs, photo georeferences, or accurate walking/driving distances may derive from these city points.
6. Older town markers may be improved to exact physical-site positions later, with the original source identity unchanged and an independent source/geometry review. **Do not replace a better pin with a town centroid.**

## Validation and release

Run:
```sh
node tests/tlm-illustrative-locality-pins.mjs
node tests/cl2-worldwide-directory-acceptance.mjs
```

The targeted workflow runs on changed TLM files; existing Directory, main, Explore browser and release gates remain required. The 170 locations are **candidates in a PR**, not published production pins until all relevant checks and release review pass.

This code is a **controlled change of the precision contract**; no alteration to CL2 site counts, canonical IDs, approved UI, Schola, Sacred Atlas or unrelated PR workstreams.
