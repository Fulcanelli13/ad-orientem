# Ad Orientem — canonical Place → Wikidata → Commons → Openverse photo acquisition

This is an **execution pipeline for existing canonical physical places**, not another catalogue or a proposal to acquire images manually one venue at a time. It reuses the production Place registry and the already reviewed Directory media/rights rules.

## Authoritative inputs

- `data/geography/seed-registry.v1.json`: authoritative canonical Place IDs, official names, countries and site coordinates; **530 Places at launch (2026-10-30)**, not a frozen permanent count. The initial registry contains **29 explicit Wikidata QID references**; the remainder require research lookup.
- `data/geography/approved-place-media.v1.json` and `data/geography/approved-place-gallery.v1.json`: the **only** production approval sources. Research results must never be appended automatically.
- `data/geography/seed-registry.v1.json.directoryPlaceLinks`: exact Directory-to-Place joins; never match media by approximate proximity alone.
- `data/directory/preliminary-map-r49.v1.json`: legacy 1,879-source snapshot remains supported by the original discovery command, but is **not the new canonical acquisition owner**.

## Efficient process

1. **Canonical ID and deduplication:** read sorted, unique `place_id` records from the live Place registry, preserving geo source, country, locality, geospatial precision, and any explicit Wikidata QID. Reject malformed IDs, missing provenance, duplicates and unknown precision; do not create proxy venues.
2. **Wikidata P18/P373:** where QID is explicit, fetch the Wikidata entity directly (no name-search API call), and independently check named-building coordinates **within 100 m** and name overlap. Where no QID is explicit, use the existing bounded name-and-geometry candidate discovery (250 m for a building pin); merely nearby Wikidata items are never automatically accepted as the correct church. Retrieve P18 main image, P373 category or Commons category sitelink, relevant exterior/interior child categories.
3. **Commons metadata:** deduplicate exact file titles. Apply the existing bulk rights preflight (`verify-worldwide-commons-source-metadata.py`) to the shortlist. Canonical licence URL, author, photo dimensions, source SHA1, image MIME and original source URL all must agree. CC0, permitted CC BY and CC BY-SA are candidates only; NC/ND excluded. Public-domain marks require jurisdiction-specific manual legal review. Commons metadata is not itself proof of copyright status.
4. **Openverse only for gaps:** the existing `api.openverse.org/v1/images/` search supports appropriate CC licence filters. New canonical runs skip Openverse for a Place when Commons already offers at least one technically eligible photograph; no exhaustively paginated API scraping. Openverse results are research leads, *never independently rights-cleared*. Recheck at the original provider.
5. **Evidence and editorial gates:** screen each candidate for correct physical building, correct church/site (not an adjacent chapel), photographic subjects and original 100%-pixel quality, architecture, obstructions, framing, image composition, author and license. The high-volume batch is metadata-only; shortlisted originals may be acquired later through a bounded, rate-compliant, hash-verified process. Never infer the building solely from 100 m proximity.
6. **Publication:** preserve original checksum, photographer, source file page, exact license URL, changes and derivative SHA256; make a source-derived production WebP at suitable original-native resolution. Link to the exact canonical Place, existing Directory venue only where confirmed. Use existing approved media registries, bilingual credits and full-frame rendering. Only after an image has passed those gates may it become public.

**No paid service, photographer contact, permission solicitations, image scraping, auto-publication, or expiring Action artifacts as the sole archive.** Repository governance deliberately prohibits GitHub Actions from writing to branches. Run the acquisition script in a reviewed worktree; immediately commit source metadata and provenance to `research/canonical-place-photo-candidates` through a normal authenticated GitHub commit/PR, not an ephemeral Action download. Approved derivatives require durable free archival storage within provider limits.

## Execute 50–100 canonical Places per metadata batch

Use the existing CLI from a **reviewed local/Work checkout** of the repository, on a dedicated research branch. It writes research JSON directly to the worktree, not to an expiring GitHub Actions artifact. The read-only CI job checks both old R49 and new canonical-source contracts.

Example:

```bash
mkdir -p data/directory/research/canonical-place-photo-candidates
python tools/directory/discover-open-place-media.py \
 --source data/geography/seed-registry.v1.json \
 --offset 0 --limit 50 --wave exterior \
 --openverse-budget 10 --openverse-per-venue 1 \
 --output data/directory/research/canonical-place-photo-candidates/canonical-exterior-0-50.json
```

Repeat `--offset 50,100,150,…,500`, using `--limit 30` for the final 530-place batch; refresh the sorted Place manifest if the canonical registry changes. Use `--wave interior` for the second pass only where relevant. Review the API errors and licence/identity holds, then preserve metadata through the normal GitHub commit/PR process; **do not delete the source research branch** until its records are merged or archived permanently.

This method retains source JSON, avoids expiring transport artifacts and obeys repository `contents: read` workflow governance. The candidate JSON remains `RESEARCH_ONLY_NEVER_APP_VISIBLE` with `image_downloads: 0` and `publications: 0`. Bulk metadata is not an approved photo release.

## Workflows already in the repository that this consolidates

- `tools/directory/harvest-wikidata-country-photo-index.py`: bounded country-level P18 index, useful as offline/reusable discovery evidence; not a complete set of churches.
- `tools/directory/discover-open-place-media.py`: P18, P373, Commons category and Openverse research (now accepts canonical Places directly while preserving R49 functionality).
- `tools/directory/verify-worldwide-commons-source-metadata.py`: deduplicated bulk Commons rights metadata preflight, with source SHA1 and canonical licence URL.
- `tools/directory/build-unified-photo-intake.py`: existing broader 2,579 physical-anchor queue for Directory-wide coverage; **do not add its counts to the 530 canonical Places**.
- Existing final approval, binary-integrity, derivative and real Directory card contracts remain untouched.

**Success metrics are distinct:** canonical sites screened; sites with candidate exterior; unique Commons files checked; copyright/source-metadata eligible; site and original verified; published new images and verified visible renderings. The last two are intentionally **zero until publication actually occurs**.
