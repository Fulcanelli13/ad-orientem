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
