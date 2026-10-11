# Explore R57 — canonical major-place editorial experience

## Purpose and ownership

Explore is a map-first discovery layer over canonical physical Places. The `data/geography/major-places-editorial.v1.json` index selects 20 existing source-backed places for optional “Places in focus” discovery. **Editorial ordering is neither ecclesiastical status nor popularity ranking.** It must never alter physical site identity, merge nearby records, or create map markers.

Each selection must satisfy:
- An existing `place_id` in the canonical Geography register;
- An exact `source_id` in that Place's provenance;
- At least one publishable map relationship and source-linked content;
- Existing source-owned narratives reused in the Place reader, without generated historical claims.

The in-focus list lives **inside More**, not as a new permanent toolbar or a large strip over the map.

## Editor and source treatment

A major Place opens with its physical identity, documentary synopsis and four possible **in-page** chapters: place, prayer, visit and original sources. Render only chapters that have real source-owned content; do not show empty actions. The factual summary remains provided by the Shrine, Pilgrimage, Relic, Apparition or Custom record and its own original source links.

Follow original Calendar semantic links; do not compute invented feast dates. Devotions open the canonical Pray owner, and traditional Mass is linked only at exact shared Place ID where `LOCATED_AT` is evidenced. Nearby travel suggestions must never suggest an una-cum or affiliation relationship.

## Site-specific photograph acquisition — separate from Calendar sacred art

As of R57, **0/216 reviewed shrine photographs were curated/approved**. The 20 in-focus Places all have `media_review: NOT_CURATED`. That is intentional: a prominent typography-led Place header is preferable to a misleading painting or an unlicensed website thumbnail.

When a photo is genuinely ready, the *independent* `data/geography/approved-place-media.v1.json` gate requires:
- Exact Place identity and photograph subject verification;
- Original rights URL, photographer/institution credit and compatible license;
- Local optimized asset path; no external hotlink;
- English and French alt text, crop review and mobile inspection.

The Calendar's multiple-original saint and feast art pipeline is a **different owner**. PR #949 is ON HOLD pending broad acquisition and full-year negative-exception review. Do not transfer a Calendar saint painting into a physical shrine card merely because of a saint's association.

The curated index is a research and prioritisation aid; it is not approval to publish photos. Site media remain absent until the gate is satisfied. Reuse originals by canonical artwork ID only after subjects, rights and context have been independently verified.

## Parallel branches

The Bible Atlas PR #998 changes Explore browser/map/presentation source. Rebase or reconcile its implementation with R55/R56/R57, preserving persistent MapLibre canvas, Nearby, curated Place reader and rights gating. Bible chronology remains independently owned.

## Acceptance

- All curated `place_id` / source pairs resolve;
- No duplicate curated identities, invented geocodes, unreviewed photos, or synthetic Mass associations;
- Four phone/tablet widths remain navigable, with the map canvas stable;
- More → Places in focus → Place → full reader → Sources works with touch;
- Reduced-motion mode bypasses automatic smooth transitions.
