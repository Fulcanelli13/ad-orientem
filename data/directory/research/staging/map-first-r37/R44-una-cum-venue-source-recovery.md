# R44 — Rome-recognised venue-first map recovery

Date: 2026-10-10. **Research map only; not activated in the production application.**

## Executed

Source-indexed exact-coordinate harvest, not town-centre geocoding:
- GitHub Actions: https://github.com/Fulcanelli13/ad-orientem/actions/runs/38061354857 (all three source-harvest shards passed).
- Input: 593 locality-only source claims, including 561 with index links to the public Ad Orientem Church directory. The remaining 32 need other institute sources.
- 61 unique source-index pages read and matched to their original listing identities; linked venue detail pages supplied source-marker coordinates.
- 516 candidate source-coordinate assertions recovered across three shards, 0 reported fetch errors.
- Reconciled against R43's 1,310 existing pins:
  - **389** new *provisional* map markers.
  - **12** additional source aliases attached to existing venues.
  - **115** candidate coordinates withheld for physical-site identity review.
  - **45** other input source claims still lack unambiguous, usable linked detail coordinates.
- Result: **1,699** provisional worldwide map markers, of which **842** have a source-reported affiliation to a Rome-recognised group.
- All 1,699 markers have at least one recorded URL; mapped across 71 ISO countries.

## Editorial limitations

- This is **not** an assertion that 842 different currently active una-cum Masses have been verified. Affiliation refers to the source's ministering group, not direct inspection of the Canon.
- Public source pins lack door-level precision certification.
- A source provider may have duplicate records for the same site; positional/name candidates are not silently merged where identity remains uncertain.
- The 3,118 original source records are preserved without timetable imports.
- Map UI opens on the Rome-recognised filter; SSPX and other affiliations remain available separately.
- Preserve source detail URL, original index URL, OSM map URL, and ODbL attribution.

## Remaining source backlog

Coverage status after R44 (1,537 Rome-recognised or potentially relevant source claims):
- 847 claims have known pin identities (not 847 distinct churches).
- 375 still have geocoded-but-held addresses requiring alternate venue verification.
- 115 candidate-source matches need physical identity review.
- 59 possible existing source matches are not yet confirmed.
- 45 source-detail coordinate lookups inconclusive.
- 32 other-provider locality-only claims.
- 47 records without geolocatable addresses and 6 mailing addresses.
- 11 earlier address geocodes under identity review.

Next step should prioritize source-provider map links and structured address searches for the 375 failed-address claims, without delaying the preliminary map release.

## Research delivery

- `Ad_Orientem_Una_Cum_Preliminary_Map_R44.html` (standalone interactive prototype)
- `Ad_Orientem_Una_Cum_Preliminary_R44.geojson`
- `Ad_Orientem_Una_Cum_Pin_Coverage_R44.csv`
- `Ad_Orientem_Una_Cum_R44_Audit.json`

These files were generated as conversation artifacts; the repository currently contains the reproducible source harvester, source queue and workflow. Production UI is unchanged.
