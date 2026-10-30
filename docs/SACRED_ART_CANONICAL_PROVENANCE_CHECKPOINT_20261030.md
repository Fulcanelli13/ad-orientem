# Sacred Art — canonical provenance recovery checkpoint (30 October 2026)

**Research-only, strictly €0.** Draft [PR #1999](https://github.com/Fulcanelli13/ad-orientem/pull/1999). The locked canonical 383, all frozen user selections and production assets remain unchanged.

## Baselines

- 2,455 historically reviewed cards: 772 IMPORT; 84 IMPORT_WITH_CORRECTIONS; 1,599 REJECT.
- 856 accepted or conditional cards; 72 already tied by identity evidence to 383 canonical artwork records; 784 unlinked. Unlinked does **not** mean unique new painting.
- All 479 accepted museum source identities and 305 Commons source-file identities have been verified in prior research batches.
- Three Commons/museum cross-source same-work groups and three Commons alternate-media work-QID families are tracked separately. Two false joins caused by colliding museum accession numbers are explicitly excluded.

## Recovered canonical 383 archival provenance

The prior canonical catalogue had 94 non-empty `source_page` fields and 289 blank fields.

An exact canonical-ID/legacy photo SHA sweep of 252 archived research files produced:

| Category | Canonical artworks |
|---|---:|
| Previously recorded source page | 94 |
| Broad archival museum object-page lead | 119 |
| Broad archival Commons file-page lead | 60 |
| Hash-associated photo metadata only | 89 |
| Archive record without explicit object page | 21 |
| **Total** | **383** |

The 179 museum/Commons URL leads above were a **broad preliminary** count. A stricter requirement that the URL appear under the **same exact canonical artwork ID** reduced that set to **163**: 111 artworks with one archived URL and 52 with multiple conflicting/alternative URLs. The other 16 preliminary URL leads were demoted rather than silently accepted.

The resulting exact-ID source repair queue for all 289 missing `source_page` values is:

- **111** single archived URL candidates, ready for independent source identity checking.
- **52** multiple archived URL candidates, requiring work/photograph distinction and possible attribution review.
- **126** no acceptable exact-ID archived object/file URL; prioritize original asset SHA provenance and original object registry recovery.

### Official-source recheck of the 111 single-URL candidates

GitHub Actions [run #41008854954](https://github.com/Fulcanelli13/ad-orientem/actions/runs/41008854954) **passed**:

| Source system | Records | Outcome |
|---|---:|---|
| Cleveland Museum official object API | 34 | 34 exact object IDs **and inventory numbers** confirmed |
| Met official Collection API | 30 | 30 exact object IDs and archived museum object pages confirmed |
| Wikimedia Commons official File API | 46 | 46 current file/image pages resolved; not independent physical painting certification |
| North Carolina Museum collection page | 1 | Current publisher HTML retrieved; artwork identifier not independently confirmed |
| **Total** | **111** | **64 museum-object verified, 46 Commons file identities, 1 further review** |

No archival source URLs were written into the locked canonical source field. They remain in an auditable overlay pending the physical-work/photographic review gate.

A research-only exact canonical archive source-page join against all 856 accepted sources yielded **zero new exact direct source-page links**. Existing **72** confirmed canonical links remain unchanged. Shared artist/title, accession collisions, P180 depicts, and image byte/filename differences must never be promoted as physical artwork identity.

## Evidence ledgers

1. [383 archive-wide provenance sweep](../data/calendar/sacred-art-phase1-canonical383-archive-provenance-20261030.v1.json)
2. [All 289 missing-page repair priorities](../data/calendar/sacred-art-phase1-canonical383-source-repair-priorities-20261030.v1.json)
3. [Official 111-page source verification](../data/calendar/sacred-art-phase1-canonical383-111-official-source-verification-20261030.v1.json)
4. [Archive-to-accepted 856 exact join](../data/calendar/sacred-art-phase1-archive-exact-source-to-accepted856-20261030.v1.json)
5. [784 unlinked review queue](../data/calendar/sacred-art-phase1-856-to-383-exhaustive-candidate-triage-20261030.v1.json)

## Next evidence gates

1. Reconcile the **52 multiple-URL** canonical records by original artwork, museum accession/collection, alternate photos, works after an artist, workshop copies and panels/ensembles; avoid automatic title-based deduplication.
2. Process the **126 no-direct-URL** cases through preserved archive image SHA, old source registries and institution-backed object identifiers; isolate the genuinely untraceable exceptions rather than generating thousands of new searches.
3. In parallel, use the already prepared accepted-source **200-photograph QA worklist** to inspect the **exact native original bytes** and photograph metadata, and record frames, detail-only shots, colour and exact-image licences. Keep user-approved historical art and image-specific decisions separate.
4. Before publication, require explicit exact photograph rights (including CC BY/CC BY-SA conditions), attribution, object identity and responsive crop quality. **No automatic imports, photo substitution or production activation.**

No costs incurred. The research PR remains draft and must not be merged into the live art catalogue without a separate release decision.
