# Sacred Geography R70 — Coverage first, depth second

> **Policy superseded for new Places by P22 (24 October 2026):** R70's bilingual historical introductions and extra typed map-source records are no longer required for map-first physical-site publication. See `data/geography/sacred-places-map-first-minimum.v1.json` and `docs/SACRED-PLACES-P22-MAP-FIRST-20261024.md`. Older numbers below describe R70's frozen research snapshot, not the live 371-Place proposed P22 baseline.

## Why R70 supersedes further gallery expansion

The 2026-10-11 repository already publishes **219 shrines across 48 countries**, with **219 physically geolocated pins, 219 bilingual English/French historical introductions and 219 places with source URLs**; it includes 209 linked pilgrimage records. There are **14 detailed guides**, **18 approved hero photographs**, and **6 supplemental gallery images**. That is a good source-backed *base* for the current catalogue, not good coverage of the full world.

The research pipeline has a much broader **750 physical-site curated inventory spanning 113 country codes**, plus **98 route/event/non-physical records** correctly excluded from physical pins. The crosswalk still refers to an older 182-site canonical baseline, so textual hints must be reconciled with the current 223 Places and later promotion records. The new R70 report is `data/geography/research/sacred-geography-coverage-first-r70.v1.json`.

### Current candidate classification, not a missing-site claim

| State | Count | Meaning |
| --- | ---: | --- |
| Confirmed existing via explicit dated site promotion record | 38 | Candidate ID maps to a now-published exact canonical Place through R64/R65 predecessor promotion records. |
| Existing Place suggested by older textual crosswalk | 106 | Needs individual physical-identity reconciliation. A text match does not certify a site. |
| No existing canonical Place determined by these two mechanisms | 606 | Needs source and physical-site identity investigation; **not automatically 606 confirmed missing**. |
| Total curated physical research candidates | **750** | 64 Essential, 576 Strong, 110 Review. |

Never add the existing 219 to 750: the lists overlap and provenance is not exhaustively reconciled. The original four curated discovery sources are valuable editorial leads, not proof of exact modern buildings, dates, affiliation or coordinates.

## New delivery order

1. **Worldwide reconciliation, in batches of 75**: 10 preassigned research-review waves, geographically round-robin within priority. All 64 Essential candidates appear at the head of wave one. For each, reuse an existing physical Place when confirmed; don't create duplicate churches or pilgrimage-town markers.
2. **Map-first publication**: source-backed actual Place identity, current name, custodianship / ecclesial affiliation, physical point with original map attribution, at least one original custodian/site URL and concise distinct **English and French descriptions**. Do this for wide geographic batches. A shrine is not a traditional Latin Mass venue without separately verified Mass evidence.
3. **Universal useful reader**: ensure any published Place already has an in-app introductory paragraph with the source hyperlink, visitor directions and related pilgrimage where available. Dates must be qualified as historical anniversary or independently published current programme, never inferred.
4. **Broad image pass**: choose at most one correctly identified, approved cover image per previously unillustrated major site before adding second and third images for the same site. Missing photos must not delay a correct map-first release.
5. **Only then progressive depth**: multi-chapter histories, chapels/relics, dates, official pilgrimage programme, devotional texts, historical artwork and cinematic scenes.

## Editorial and safety gates

- 750 research items are *not* automatically promoted. The report has no invented coordinates, official URLs, new shrine IDs or route changes; `publication:NO_AUTOMATIC_CHANGE` for every candidate.
- Non-physical festival routes, regional pilgrimages, localities and subsidiary monuments stay separate from physical Place markers; 98 such records remain excluded from the crosswalk.
- Original source validity, custodian and Catholic affiliation must be checked. Historic Christian buildings currently Anglican or Orthodox are not silently classified as current Catholic Mass venues.
- App sections, date labels and translations come from their proper source owners; do not use destination URL or place name to infer apparition approval, sainthood, precise entrance or current Mass service.
- Sacred Geography site rollout is distinct from the parallel world **traditional Latin Mass Directory** and **Bible Atlas** pipelines.
- **Focus rule:** no further photo-gallery deepening of already photographed places until the next broad source-and-pin coverage batches are completed.

## Work queue and user-review load

A single 750-card/image-approval gallery would be counterproductive. Review at most 75 sites per research batch, with an exceptions-only human review surface. Names that are already clearly matched to published physical Places should be silently reconciled first. Only uncertain identity, denominational status, conflicting coordinates, historical-versus-active usage or questionable licensing should surface for editorial decision.

Run `node tests/sacred-geography-coverage-r70.mjs` to validate this frozen research reconciliation and the *current* shrine minimum-publication gates. Production expansion updates the canonical seed; subsequent coverage reports can be regenerated after each world batch without affecting app runtime or the separate atlas pipelines.
