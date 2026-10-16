# Round 40 — Latin Mass Directory six-country coordinate acquisition

Date: 2026-10-10. Research staging only; **the production map and R39's 1,093-marker layer are unchanged**.

## Executed acquisition

- GitHub Actions run: https://github.com/Fulcanelli13/ad-orientem/actions/runs/38056410682
- Artifact: `lmd-public-map-coordinate-evidence` containing `source-pins.geojson`, `holds.json`, and `report.json`.
- Provider: https://www.latinmassdir.org/ (venue pages' explicit Google Maps coordinate links).
- 113 listed physical-venue pages processed from six complete paginated country listings.
- 113 source-coordinate assertions extracted; 0 extraction holds, 0 fetch errors, 122 requests.
- By country: Australia 40, Canada 39, Ireland 16, New Zealand 12, Mauritius 5, South Africa 1.
- Directory listing audits: 6/6 complete. Previous code extracted only the first listing page, silently skipping 20 of 40 Australian and 19 of 39 Canadian venues. Fixed by paginating `/country/{cc}/page/{n}/?view=list` and checking collected venue URLs against each country total.
- Numeric HTML-entity decoding fixed map links such as `&#038;query=...`; previous run returned no coordinates.

## Preliminary comparison against R39's 1,093 provisional markers

These counts are **reconciliation work buckets, not certified physical-venue matches**.

| Bucket | Source venues |
| --- | ---: |
| Exact existing source-URL aliases (Mauritius) | 5 |
| Likely existing marker: within 150m and material name resemblance | 7 |
| Nearby/co-located existing marker requiring identity review | 5 |
| No close coordinate/name candidate in R39; possible additional map venue | 96 |
| **Total source-coordinate assertions** | **113** |

The 96 are *candidate additions*, **not 96 published or verified new churches**. They need source-linked affiliation and distinct-physical-venue validation. The seven likely aliases and five co-located points must not be duplicated automatically. Same coordinate is not proof of same physical worship site, nor is fuzzy similarity alone proof of identity.

None of the LMD-only sources has an independently verified ministry affiliation extracted by the new script yet: its label remains `Unclassified (LMD source)`. **Do not publish these as compliant map pins before affiliation verification**. Do not infer una-cum or canonical/communion classification from operator proximity. Coordinate precision remains `SOURCE_MARKER_UNASSESSED`, not door-level certification.

Do not import Sunday/weekday schedules in this map-first phase. Retain all R39 source records and each external URL, preserving provenance and OSM/ODbL obligations for previously recovered points.

## Required next actions

1. Extract provider Community/affiliation from each LMD venue page with exact text and URL, preserving unclassified where absent; no speculative assignment.
2. Resolve the 12 possible matches with R39 site IDs using source URLs, location and identity; merge only verified physical duplicates.
3. Promote only site-distinct, named, sourced and labelled candidates to the *provisional* map layer; update the operational register with source IDs and all aliases.
4. Continue through the directory's remaining 59 countries in bounded batches with complete pagination, then compare with other registry sources (Mass of the Ages, Ad Orientem, official institutes/dioceses/SSPX etc.).
5. Keep the production Mass timetable phase locked until global map-first coverage and filter semantics are reconciled.
