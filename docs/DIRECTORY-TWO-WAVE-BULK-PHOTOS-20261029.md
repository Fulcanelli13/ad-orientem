# Directory photo programme — two bulk waves, then curated audit

Decision: run source-owned bulk acquisition **by role**, not one church at a time.
The canonical Directory R49 contains 1,879 frozen physical venue identities. The
separate Sacred Places/Explore corpus contains 516 Places. They overlap; do not
sum them, duplicate photo files, mint new Place IDs or treat a proximity match
as a confirmed `LOCATED_AT` relation.

## Wave 1 — one exterior cover per exact church

- Discover Commons/Wikidata/Openverse candidates for **EXTERIOR** only.
- Target as many of the 1,879 Directory venues as possible, using bounded
  100–200 venue invocations. Prioritize verified exact Directory→Place matches
  for application publication; maintain research-only candidates for others.
- Choose one candidate suitable as a card hero; additional facades remain gallery
  candidates, not a reason to hold the entire wave.
- Preserve original source page, file SHA1, author, copyright and derivation
  provenance. Do not infer identity from dedication/camera coordinates alone.
- Missing results and identity/rights uncertainty remain explicit HOLD rows.

## Wave 2 — church interior, high altar and panoramic material

- Search **INTERIOR** and **SACRED_DETAIL** (altar, sanctuary, side chapels,
  reliquaries where accurately identified); do not repeat exterior searches.
- One good nave/interior and one high-altar image are practical *targets*,
  not mandatory per church. Authentic high-altars and architectural interiors
  take precedence over generic devotional images.
- Retain licensed equirectangular 360°/spherical photos where available. The
  `panorama_hint` metadata merely marks review candidates: exact subject,
  projection, privacy, attribution, original source and display rights must
  be independently checked. Ordinary wide panoramas are not 360° media.
- No remote 360°/Street View embedding or Google Maps image harvesting.
  A local interactive viewer would need a separate tested UI release; until
  then a verified panorama may be displayed as a static image with truthful
  labeling if its licence permits.

## Run the existing Directory discoverer twice

The existing W1 discoverer handles identity evidence, country checks, candidate
rights metadata, source URLs and Openverse budget. It is **metadata-only**.
This change introduces a strict `--wave` filter with legacy `all` available.

Launch manually via the existing `directory-open-photo-discovery-batch.yml`
workflow: select `wave=exterior`, `offset=0`, `limit=100` for the first
bounded smoke run. Then work through stable non-overlapping R49 ranges, using
100–200 sites per dispatch and increasing only if actual API errors and runtime
allow. Finish Wave 1 coverage before launching `wave=interior` over the same
frozen ranges. Every research output is written to
`research/directory-photo-candidates` with a wave-specific filename
`r49-<wave>-<offset>-<limit>.json`; old three-category files remain intact.

The workflow is deliberately manual, rate-limited and commits **research metadata
only** to its existing dedicated research branch, never to `main`. It does
not download binaries or advertise candidate results as approved photos.
A complete wave is 1,879 *processed* venue identities, **not** 1,879 licensed,
correct, usable photographs.

## Bulk binary acquisition, without the single-site bottleneck

Use W7 / PR #1932 as the precedent for staged originals and optimized local
WebPs, not a reason to script a bespoke uploader for each church. The next
bounded production component should read a **deduplicated, source-verified
candidate selection manifest** and perform bulk original-byte download,
sha1/sha256 verification, local WebP encoding and attribution logging on a
research/asset branch in batches (e.g. 30–50 candidate files per PR).
Each file must be eligible under its actual original-page rights statement;
photographs of copyrighted artworks need separate underlying-work checks.
A discovery hit cannot be promoted or shown in the app merely because an API
claims a permissive licence.

Until this generic binary stager has been independently tested, bulk metadata
discovery does not imply that binary acquisition has occurred. Avoid 7-day
Actions artifacts as the sole binary archive; commit approved binaries and
their source/provenance records to durable free Git history, within free
resource limits.

## Audit AFTER bulk coverage, not 1,879 serial research interruptions

Keep **machine-enforced hard checks during ingest**: source exists, permitted
reuse licence, author and attribution, original hash, no wrong-country
evidence, exact subject/site link or HOLD, and no automatic publication.
Do **not** block mass discovery on subjective choice of the prettiest facade.

After each full wave, review an image contact sheet/gallery in broad groups,
ranking sharpness, perspective, uncropped/framed suitability, historical
accuracy, distracting objects, liturgical value, and replacement alternatives.
Publish only when exact photo identity, rights and image quality are approved.
Record rejects and their reasons to avoid rediscovery.

## Status counters, report separately for each wave

1. Frozen venues processed / 1,879; candidate-bearing venues; unique source
   file IDs; candidates with verified exact site + rights; failures and holds.
2. Original files archived and hash-verified; deduplicated staged WebPs;
   contact-sheet reviewed; rejected and replacement candidates.
3. Venues with **merged, deployed** exterior cover; venues with deployed nave,
   high-altar or verified 360° assets. Count published canonical Place assets
   separately from Directory candidates.
4. Costs: **€0 mandatory**. Stop on API quotas, storage constraints or possible
   metered charges. Never use Google Maps photo scraping or paid APIs.

Coordinate with the already-merged W1 discovery pipeline, P69 Places/relic
discovery and the still-draft St Alphonsus W7 PR #1932. The W7 two approved
exteriors must remain reviewed on that branch; its soft nave/altar images
remain research holds unless independently accepted later.

## Implemented binary staging workflow (W8; awaiting merge)

The generic importer is now implemented as
`tools/directory/stage-bulk-place-photos.py` and the manually
triggered **Directory bulk photo staging - permanent research archive**
GitHub Actions workflow. It does **not** add files to production:

- Input: the existing wave-specific W1 JSON file on branch
  `research/directory-photo-candidates`, referenced by its frozen
  `r49-<wave>-<offset>-<limit>.json` filename.
- It deterministically takes at most one Commons-derived file per source
  venue/role and skips Openverse-only rows without a source-file SHA1.
  `selection_offset` selects subsequent groups, up to 50 originals
  per execution; the discovery wave must exist first.
- It re-queries the individual Commons file for current permissible CC0/CC
  BY/BY-SA licence URL and credited author; checks the original Commons SHA1
  against the source metadata and locally downloaded bytes; rejects restricted
  licences, an altered file, unknown hosts, image types and excessive sizes.
- It converts full-frame/no-crop to WebP with an independently recorded SHA256.
  Possible true 360° candidates retain up to 4096px resolution but are **not**
  declared verified spherical images. Other photos fit within 1280px.
- It stages only on branch `research/directory-photo-assets`,
  under `assets/staged/directory-bulk/<batch>/`, with an
  equivalent JSON report under
  `data/directory/research/photo-staging/reports/<batch>.json`.
  No writes to approved manifests, public cards, or main. The archive branch
  holds persistent Git files rather than seven-day Actions artifacts.
- Every staged candidate remains `UNVERIFIED_DISCOVERY_MATCH`.
  An existing confirmed Directory→Place link is recorded only as evidence of
  *site linking*, not proof of the photograph's subject. A later auditor must
  independently verify what the photograph shows before any publication.
- If no image passes hard gates the run fails; if some fail, the others can
  be committed with explicit hold reasons. Existing batch reports cannot
  be overwritten or silently reprocessed under the same batch key.
- Free-only execution: bounded single-job runs, 50 original files, 16MB per
  source, 160MB original total, and 45-minute job cap. No paid services,
  scheduled loops, Google Maps images, automatic website links or direct
  publication.

### Launch sequence

1. After merging W8, run `directory-open-photo-discovery-batch.yml`
   manually with `wave=exterior, offset=0, limit=100`. Confirm
   its research-branch output and actual candidate/error counts.
2. Run `directory-bulk-photo-stage.yml` manually on main with the
   **same wave/offset/limit** and `selection_offset=0, selection_limit=30`.
   It reads the exact research file; it does not run discovery or choose a
   different input from remote filenames.
3. Check the archived report: staged WebPs, sha256, file-by-file holds, total
   unique venues and (provisional) 360 candidates. Run subsequent
   `selection_offset=30, 60, 90` as supported by the
   actual `available_candidates` count in previous reports.
4. Continue through the frozen R49 venue ranges, finish exterior coverage,
   then repeat as `wave=interior` for nave/high altar.
5. Run separate bulk contact-sheet/quality and exact-subject verification
   before preparing any reviewed publication PR.

This workflow has no live binary batch results until manually executed after
the release gates. A metadata candidate is **not** a successfully acquired
image, and a staged image is **not** an approved/published photograph.
