# P69 — High-volume image discovery without duplicate registries

## Status and scope

A **read-only, source-owned discovery system** for the existing 516 canonical physical Places and 122 source-backed relic records. No new Place pins, Saints, Calendar observances, scraped Google Maps photos or approved images are created.

Current approved baseline: **31 hero images; 6 additional gallery images; zero exact-object photograph binaries added by P68**. The existing per-file licence/provenance and local WebP publication gates continue to apply.

The canonical P69 batch-0 search plan is `data/geography/research/media-discovery-p69-batch0.v1.jsonl`:

- **150 actual Places** from the canonical Geography registry; 141 of these have no approved hero or gallery photo.
- **122 actual existing relic records** from the Sacred Phenomena registry, associated by exact existing Place IDs.
- **272 unique search tasks**; not 272 photographs or photos approved.
- Places are divided into stable 150-record shards (four batches for 516 Places), with the Indian Ocean/Mauritius and Ireland first. No rebalancing after a Place gains imagery.
- Relics are included in batch 0 only; avoid scanning all 122 again in every batch unless deliberately requested.

## High-throughput discovery pipeline

`tools/discover-sacred-media-p69.py` is the only new discovery interface. It uses Python stdlib and Wikimedia Commons search API, not a paid API, image download or browser automation.

```sh
# Offline, no external request; emit the first exact 272 search tasks
python tools/discover-sacred-media-p69.py --mode plan --batch 0 --batch-size 150

# Explicit, bounded live search: 272 real searches, at most 500 candidates
# Use on an authorized checkout and review the resulting research-only JSONL
python tools/discover-sacred-media-p69.py --mode discover --batch 0 --batch-size 150 \
  --max-requests 300 --candidate-cap 500 --delay 0.7 \
  --output data/geography/research/media-p69-candidates-batch0.jsonl

# Remaining Places, stable ID shards; no repeated relic sweep
python tools/discover-sacred-media-p69.py --mode discover --batch 1 --batch-size 150 \
  --without-relics --max-requests 150 --candidate-cap 500 --delay 0.7 \
  --output data/geography/research/media-p69-candidates-batch1.jsonl
```

**Discovery output is not production data.** It includes canonical owner/Place IDs, Commons page ID and original file page, reported Commons original SHA1, reported photographer and licence metadata, image dimensions, mime type, query and restricted research status. Each candidate retains:

- `publication=RESEARCH_ONLY_NOT_APPROVED`
- `subject_identity=UNVERIFIED_SEARCH_MATCH`
- `visual_quality=NOT_INSPECTED`
- `source_bytes_hash_verified=false`
- `image_binary_archived=false`
- `rights_for_depicted_artwork=NOT_ASSESSED`
- `current_site_display=UNVERIFIED`

This is essential for relic imagery: a photograph of a saint, painting, sculpture or shrine **may not depict the relic, reliquary or verified current location**. A photo associated with a building is not proof of any sacred object inside it. Existing photos are excluded by their Commons original page; local image hashes and visual duplicates are checked later at approval.

The crawler accepts up to 400 API requests and outputs up to 500 distinct per-entity candidates in a deliberately invoked run; uses bounded responses and a default 0.7 second request delay. A loss of Commons connectivity is reported rather than manufacturing results. **300–500 candidates is a throughput objective when actual Commons results justify it, not a number to fabricate.** Each request typically produces 0–4 candidates after technical filtering; no candidate can enter the approved gallery via this script.

## Publication gates — existing P68 path only

1. Deterministic discovery through Commons source metadata, source URLs, licensed-file leads and exact existing IDs.
2. **Identity review**: confirm this particular photo depicts the exact building, chapel, relic, shrine or reliquary; distinguish historic displays from current installations. Indoor location and access still belong to P67 and are not inferred from image captions.
3. **Rights review**: actual photographer, licence, possible underlying living artwork rights, attribution, licence URL and local reuse conditions. Exclude ambiguous or restricted sources. Public-domain historical painting rights and photograph rights are separate.
4. **Visual review**: intrinsic quality, subject prominence, framing/no frame, lack of intrusive watermarks or irrelevant crops. The user prefers compelling, faithful photographic presentation, not indiscriminate bulk imports.
5. **Asset acquisition**: use the P68 approved-gallery acquisition contract—original byte SHA1 verification, no-crop local WebP derivative, SHA256, photographer/changes/EN-FR caption and exact object key. The source and permanent binary are committed together through a **normal reviewed asset PR**, never direct `main` pushes by GitHub Actions.
6. **Mobile UX**: existing Place folios and object cards render the local approved asset using `object-fit:contain` and preserve credit, licence, date and contextual caveats.

## Finite progress measurement

- **Completeness:** 516 canonical Places covered by four deterministic 150-record planning batches (last batch has 66); 122 relic search tasks in first pass.
- **Input throughput:** 100–200 Place records plus all 122 relic records where relevant, potentially 300–500 Commons candidates per intentional discovery batch.
- **Quality:** source identity confirmed, duplicate hash blocked, attribution/rights checked, photograph visually assessed, local binary verified, subject and Place bound.
- **Publication:** count only approved asset files actually merged and rendered. Candidate count is not publication count.
- **Exception queue:** unknown subject, false search match, incorrect Place, copyright of underlying artwork, unverifiable photographer, weak quality, old/deprecated display or source download failure.
- **Budget:** no paid API, automatic cloud write, metered storage or unattended loop. If free GitHub storage or Actions capacity would be exceeded, pause new ingestion instead of incurring charges.

## Verification

```sh
python -m unittest discover -s tests -p 'test_explore_p69_media_discovery.py' -v
node tests/explore-p68-sacred-object-photo-binding.mjs
node tests/explore-p67-relic-indoor-placement.mjs
```

The CI workflow **does not call Wikimedia Commons** or push to main: it tests the 272-task offline batch, all 516 Place + 122 relic coverage, licence-hold classification, mistaken-cross-site suppression and research-only publication states. The explicit `--discover` command must be run in an authorized checkout before a candidate registry can be claimed; future nightly tasks may use an automation only if explicitly configured and free-capacity limits are documented.

## Next practical order

1. Merge P69 if release gates pass; **source-only** production state changes.
2. Run and commit first Commons candidate result as a **review-only PR**; report actual candidate and error counts, not projected values.
3. Visual + legal triage of selected candidates in batches of 30–50 approved assets; commit WebPs and provenance together as ordinary image PRs.
4. Prioritize unpublished Place cards and exact relic photographs; integrate the already-approved 33 illustrated guides and P67 indoor labels. Measure actual completed public coverage after deployment.
