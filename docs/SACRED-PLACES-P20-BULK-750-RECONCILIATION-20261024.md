# Sacred Places P20 — 750-record bulk reconciliation

_Date: 24 October 2026. Stage: research-only. Production owners unchanged._

## Result against merged P19

- Current canonical baseline: **361 physical Places**, **659 typed sources**, **9 verified Directory–Place links**. P19 is merged as `3c4e15a25df394eed4310d1ad2aefadf35c94c2f`.
- Compared **all 750 legacy inventory candidate rows** with existing exact reviewed promotion mappings and present canonical IDs.
- **170** have an independently reviewed link to a physical Place that is currently in the canonical registry. The original R70 queue predates P14–P19 and had only 164 explicit promotion mappings; later research recognizes six further exact links.
- **580** are *not explicitly linked* after current reconciliation. This number is **not** the number of genuinely missing sacred buildings; duplicate names, overlapping complexes, unverified titles and outside-Catholic entries remain mixed in it.
- Existing independent exception review applies **13 P16 title holds within the 750**, **5 non-P16 physical-scope holds**, **2 outside-Catholic holds**, and **6 explicitly rejected old suggested matches**. The rejected old matches can still generate independent site-specific research; they must not reuse the rejected canonical ID.
- The full **16 historic P16 holds** remain preserved. Three do not have a candidate ID represented in this 750-record snapshot.
- **560** non-linked entries are eligible for source investigation after excluding the protected holds/scope cases. This eligibility means *research*, not approval of site identity or publication.

## High-volume P20 source-acquisition tranche

The [machine-readable P20 master](../data/geography/research/sacred-places-p20-750-bulk-triage.v1.json) contains an audit row for all 750 inputs, a **500-lead research assignment across 100 countries**, and a **first 200-lead source-verification priority set across 100 countries**. There are **60 additional eligible leads** outside the 500-lead tranche. The first 200 contain **37** provisional official/institutional source-discovery URLs inherited from the earlier Europe research; they must be checked against the exact named building. The other 163 require new or better site-specific custodian/episcopal evidence before geometry work.

Ordering is not a quality score: the first priorities balance Essential labels, existing research URLs and country coverage. A country is not certified complete merely because it has a published Place.

## Promotion gate — what a candidate actually needs

1. Name the physical Catholic church/sanctuary/subsite; cite the competent custodian, diocese, episcopate or equivalent accountable primary source; establish site and rite attribution accurately.
2. Compare location, address and religious affiliation to the 361 existing IDs. Reject same-title different-building and different-title same-building false matches using recorded exception history; retain site-within-complex relationships.
3. Establish independent site-level geographic evidence (named OSM object, reliable precise site reference, or primary site geolocation), its attribution and honest coordinate precision. A site centroid is not an entrance or walking route.
4. Add text-only Place and typed provenance records only for sites that clear the gates. Calendar, events, shrine owner records, relics, media and 1962-Missal schedules have separate approvals.
5. Run geography/source/heritage/app-convergence checks; keep historical exceptions unchanged except on a separately evidenced, explicit adjudication.

## What this pass does not claim

This is **bulk identity and source-routing triage**, not independent page-by-page review of 500 official sources. No new Catholic site has been independently verified or published in P20. Do not treat the 580 unlinked titles as 580 newly discovered real Catholic sites or as a measured percentage of worldwide completeness. The canonical content and map remain **361 / 659** until a later qualifying release changes them.

## Next execution

Process the first 200 with parallel source evidence extraction, then verify the strongest complete identity-plus-geometry cohorts and publish a **single appropriately sized release**. Record per-site gates and held reasons; bulk-screen the remaining 300 without redoing the 170 known reuse matches. Include original-source URL and date of inspection when promoting.
