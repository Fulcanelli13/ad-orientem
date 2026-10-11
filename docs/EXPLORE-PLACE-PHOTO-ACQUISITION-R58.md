# Explore R58 — source-verified Place photograph acquisition

## Status

The R57 curated set contains 20 existing physical Places. R58 records **18 Commons file-page candidates with CC BY-SA 4.0 claims** and explicitly holds two older-licence cases: the Père Laval tomb at Sainte-Croix, Mauritius, and the Catholic Slipper Chapel at Walsingham. These two sites must **not** be replaced by similarly named churches or devotional paintings.

Research source: [place-media-candidates-r58.v1.json](../data/geography/research/place-media-candidates-r58.v1.json).

**None of the 20 photographs is approved for public rendering at this stage.** The production registry [approved-place-media.v1.json](../data/geography/approved-place-media.v1.json) remains intentionally empty until the exact original file, derivative, attribution, licensing and physical-site identity have been checked. The previously documented 216-shrine photo audit remains a separate inventory and must not be overwritten with a false 18/216 published figure.

## Batch

| Stage | Number | Acceptance condition |
| --- | ---: | --- |
| In-focus physical Places | 20 | Existing, exact canonical `place_id` |
| Commons CC BY-SA 4.0 candidates | 18 | File page with own-work/open-license statement; live Commons API reconfirmation required |
| Older-license or identity hold | 2 | Walsingham and Père Laval; do not substitute different sites |
| Automatically publication-approved images | **0** | **Never** publish from acquisition alone |

The Commons file page for each photo provides the actual licence claim. License metadata is rechecked via Commons API during import; if it disagrees, the image is held. An image's file-page title alone is not adequate legal or subject verification.

## Staging and provenance

`tools/stage-place-media.py` is a single-owner importer.

- `python3 tools/stage-place-media.py --validate-only` verifies full 20-site identity coverage, canonical matches, expected source domain, bilingual alt and the zero-approved gate without accessing the network.
- `python3 tools/stage-place-media.py` rechecks current Commons API `LicenseShortName` and `LicenseUrl`, fetches an official upload.wikimedia.org image, verifies decoded image type and dimensions, resizes it to fit within 1440 px, and writes a local WebP under `assets/staged/place-media/`.
- It writes an immutable-style report with original file SHA-1, derivative SHA-256, dimensions, source URL, actual author metadata, conversion description and exact file page. Failures are retained as explicit HOLD records.
- It **does not** write `approved-place-media.v1.json`. A separate editorial gate must check physical building identity, permitted adaptation, attribution, actual thumbnail/crop at mobile size, author credit, bilingual alt text, no unrelated Calendar painting, and the `CC BY-SA 4.0` ShareAlike obligations.

The read-only workflow `.github/workflows/explore-stage-place-photos.yml` downloads and verifies Commons images on its temporary runner, builds an overview and two 9-site contact sheets, and uploads an `explore-r58-photo-review` GitHub Actions artifact. The 18 downloaded candidate WebPs already stored under `assets/staged/place-media/` remain **review-only**. The workflow has `contents: read` and never pushes to any branch. It writes no user location and touches no geography pins or routes.

## Editorial safeguards

1. The physical site must match the exact canonical Place; a nearby cathedral, an apparition picture or a church of the same name is **not** a substitute.
2. Copyright licence compatibility alone does not certify that a photograph depicts the intended shrine.
3. A rights holder must be credited on-screen with an original source URL and a licence link; image resizing and conversion must be identified as changes.
4. The R57 artwork family and Calendar sacred-art acquisition are **independent**. Do not move an artwork asset across these owners without a new documented subject/licensing review.
5. If the pipeline cannot download actual Commons bytes, report failures without claiming import success. Nothing appears in Explore until staged derivatives pass human or equivalent exact-image review and the explicit approved-media registry is populated.

## Next gate after staging

Review all available WebP derivatives together, comparing the photo with Commons' source page and the physical Place's registry record. Mark exact subject, useful crop and rights evidence per image, then promote the **fully approved** results through a separate PR into `approved-place-media.v1.json`; review the two held older licences independently.

## R58 acquisition result and residual acceptance

The successful Commons import report on the review branch records **18 locally staged WebP files, zero failed image transfers, two old-licence holds, and zero approved/public images**. The images were fetched after accepting `thumb.wikimedia.org` as an additional official Wikimedia delivery host, with licence verification through Commons API. A subsequent run generated visual contact sheets, but an attempted write to the feature branch was rejected; that workflow was replaced by a **read-only GitHub Actions artifact**. Use the artifact for detailed identity/crop review, not a public production feed.

The production resolver explicitly rejects `assets/staged/` paths and requires a separately copied approved asset, matching Creative Commons licence URL, photographer credit, original source, change disclosure, bilingual alt text, subject and crop review, and true rights verification. Do not infer editorial publication status from GitHub Actions job success.
