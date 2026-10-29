# One-sweep photography campaign — P79 (2026-10-29)

## Decision

**Stop the 17/30/48-image pre-selection and sequential human review loops.**
Complete a *whole frozen batch*, then present one editorial interface.

P79 ingests **all 502 Commons source assignments** already discovered in P70, without cherry-picking previously curated sources. They represent **501 distinct Commons original SHA1s**, **109 Sacred Places** and **26 distinct sacred-phenomena/relic identities**. Not all 502 are usable photos or independent physical church sites. Include the 28 assignments already linked to an approved original to prevent reinsertion, but never remove them from the audit.

## One campaign

1. **One 502-record frozen manifest**: `data/geography/research/p79-all-502-commons-review.v1.json`. It preserves source URL, exact Commons file/page ID, original SHA1 metadata, image dimensions, licence claim, preliminary triage, any P75 earlier preference, and existing publication ID.
2. **One read-only GitHub Actions campaign**: `.github/workflows/p79-single-502-campaign.yml`. Five machine-only shards (105/105/105/105/82) exist solely to respect API size and rate limits. No editorial stop between shards, no automatic import, no `contents:write`, no paid services, no Google imagery.
3. **Actual source metadata + thumbnail attempts**: `tools/screen-all-502-commons-p79.py` verifies Commons page ID, current original SHA1 *metadata* (not downloaded original SHA1), current source licence label/version/path, image MIME, author presence, then retrieves <=540-pixel Commons thumbnails when accessible. Public-domain and rights-uncertain results remain HOLD. Invalid matches are not silently dropped. Source-site identity always requires human verification.
4. **Consolidation gate** fails if *any* of 502 input positions is absent. One ZIP includes one complete 502-record screen audit, thumbnail previews, source-held rows, contact sheets, and `index.html`.
5. **One user review**: `docs/SACRED_PLACES_COMMONS_502_SINGLE_REVIEW_20261029.html` provides 100-image paged presentation, site/file search, prior-edit evidence, exact source-page link, and **Import / Import with corrections / Reject / Hold**. Export one JSON including the entire set of decisions. Previous P75 labels are *visible but not pre-approvals*. Already-approved original SHA1s cannot be re-imported. File remains usable even if the two-day audit artifact expires: it falls back to Wikimedia's source-hosted live preview.
6. **Only after review**: one bulk original-byte acquisition stage for approved unique originals; verify SHA1 bytes and full-res quality, source/person/artwork rights, make uncropped local WebP and SHA256, then commit approved assets and bilingual credits in bulk. Holds stay outside production.

## Distinct registries, one photographic intake

- **Sacred Places**: 516 currently published Place identities. This first one-sweep campaign exhausts the already discovered 502 assignments, NOT all potential photos for all 516 Places.
- **Mass Directory**: the existing CL2 intake has **2,579 consolidated physical-site research anchors**, of which 1,879 old R49 rows belong to a historical subset. These are not added to the 516 total because some sites overlap. The existing `tools/directory/build-unified-photo-intake.py` / source-first country index are the authority for their full-world image query stage. Do not build a second Directory source master or scrape all names into a rival registry.
- After this 502 campaign, direct the **existing 2,579-anchor Directory pipeline** to execute its 11 pre-defined 250-identity shards without editorial stops; consolidate original discovery candidates from all shards before the next large review. Establish exact Directory↔Sacred Places link before reuse.

## Success counters (never conflate)

**Physical identities processed** / candidate-bearing entities / **source files with current metadata** / actual thumbnail previews / **original bytes SHA1 verified** / reviewed user decisions / accepted full-resolution images / **deployed Places with photographs**. The first review produces no automatic new published images.

No expenditure: €0, no paid APIs, no unbounded or metered storage. Reuse existing GitHub Actions and repository provenance. Keep reviewed approved WebPs durably in Git; temporary thumbnail artifacts are caches, never the sole source-of-truth.
