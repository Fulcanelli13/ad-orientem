# Ad Orientem Sacred Places: research completion summary

Generated 2026-10-28. Research only: no production file, Google Sheet or PR was touched, no photo or image research was done, and `release_authorized` / `publish_authorized` are false on every row.

## Headline
- 750 candidates, 750 unique IDs; every row has a disposition and a confidence. Cohorts preserved: 500 acquisition, 150 priority, 428 unlinked, 349 unresolved acquisition leads.
- 322 frozen canonical links unchanged; 34 further candidates proposed as the same physical site as an existing Place (review_required, LOW/MEDIUM).
- Coordinates: 707 of 750 (94.3%); unlinked 385 of 428 (90.0%). 43 remain unlocated (listed in unresolved_exceptions.csv).
- Dispositions: EXISTING_CANONICAL_REUSE 356, NEW_DISTINCT_PHYSICAL_SITE 302, EXACT_SITE_NEEDS_MORE_GEOMETRY 39, CURRENT_NON_CATHOLIC_HERITAGE 29, HISTORIC_CATHOLIC_HERITAGE 20, NOT_INDIVIDUAL_PLACE_ROUTE_OR_LANDSCAPE 3, OUT_OF_SCOPE_OR_INVALID 1.
- new_sites.jsonl: 302 original candidates judged distinct from all 512 canonical Places (not additive with the 349/500 sets).
- Geography exceptions: all 35 accounted for; status LOCATED_RESEARCH_ONLY_NEEDS_AUDIT 35. Mapping country DY→BJ, HV→BF, Armagh IE→GB; original country kept.
- unresolved_exceptions.csv: 81 true blockers (CATHOLIC_IDENTITY_UNCERTAIN 33, NO_LOCATION_EVIDENCE_FOUND 43, POSSIBLE_DUPLICATE_PAIR 5).

## Field completion, % populated (explicit + inferred)

| Field | All 750 | Unlinked 428 | Unresolved 349 | Priority 150 |
|---|---|---|---|---|
| official_name | 100.0 | 100.0 | 100.0 | 100.0 |
| locality | 70.5 | 56.5 | 60.7 | 58.7 |
| region | 55.2 | 71.5 | 73.6 | 63.3 |
| address | 48.4 | 49.3 | 46.4 | 49.3 |
| latitude | 94.3 | 90.0 | 90.5 | 94.0 |
| geometry_precision | 94.3 | 90.0 | 90.5 | 94.0 |
| osm_ref | 38.8 | 6.3 | 7.4 | 24.0 |
| google_maps_url | 94.3 | 90.0 | 90.5 | 94.0 |
| site_category | 100.0 | 100.0 | 100.0 | 100.0 |
| catholic_status | 100.0 | 100.0 | 100.0 | 100.0 |
| rite | 82.1 | 82.9 | 79.7 | 72.7 |
| diocese | 81.6 | 82.0 | 81.4 | 76.0 |
| custodian | 26.9 | 31.1 | 32.1 | 32.0 |
| existing_canonical_place_id | 47.5 | 7.9 | 3.4 | 12.0 |
| source_url | 95.6 | 93.0 | 93.1 | 89.3 |
| source_tier | 95.6 | 93.0 | 93.1 | 89.3 |

Explicit / inferred / unknown / conflicting splits with denominators for all 30 columns and five cohorts are in field_coverage.json. 'address' counts only street-level addresses; where GCatholic gives only a locality line it is stored in region instead.

## Method
- Linked rows: canonical Live_Places record (name, city, coordinates, OSM/Wikidata reference) plus Source_Registry sources by directness tier. Geometry precision derived from the reference type and flagged inferred (canonical geometry is unaudited).
- Unlinked rows: master P52–P56 geometry where present, else GCatholic Plus Codes decoded locally, else custodian, heritage, UNESCO or tourism pages found in three research rounds.
- 514 GCatholic church pages were fetched to extract the stated address, jurisdiction, rite, custodian and titles.
- Duplicate screen: every located unlinked row was measured against all 512 canonical Places (≤250 m = proposed same site, 250–1500 m = distinct_from) and against each other (<60 m = possible duplicate pair, not merged).
- Inference is always listed in inferred_fields: category from the name, Latin rite only from a stated Latin diocese outside Eastern-rite countries, Catholic status from jurisdiction.

## For the audit
- No building footprints were verified. GCatholic points are tier C, EXACT_SITE_POINT, MEDIUM. osm_ref is filled only from canonical records, master P-sheets or OSM IDs actually seen on a page; none was invented.
- Name-and-town-only links (e.g. Brive, Alba de Tormes, Ovada, Jeoldusan, Lusaka, Asunción, Ampefy, Matagalpa) carry canonical coordinates as inferred and are flagged.
- Possible duplicates kept separate: SG-INV-0437/0441 (Atotonilco, same GCatholic page), 0617/0619 (Nagasaki martyrs), 0698/0700 (Abu Serga), 0511/0515 (both point to the El Quinche page). Seven canonical Places are each linked from two frozen candidates (see crosswalk notes).
- Specific flags: 0612 Tianjin Lourdes may be mislabelled; 0106 had the wrong GCatholic URL (Montserrat page, ignored); 0021 page may be the wrong Tours church; 0382 GCatholic says 'Paulists', which may be an error for the Pauline Fathers (recorded as stated); 0562 Yardenit set out of scope (kibbutz-run baptism site); 0611 Donglu under the Patriotic diocese structure; 0104 Sacra di San Michele titles look odd on the source page.
- Wikipedia and Wikimedia were never cited; source URLs pointing to them or to image files were removed.

## Files
completed_candidates.csv (30 contract columns) · completed_candidates.jsonl (repo schema) · new_sites.jsonl · source_evidence.csv · canonical_reuse_crosswalk.csv · geography_exceptions.csv · field_coverage.json · unresolved_exceptions.csv · summary.md
