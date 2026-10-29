# Worldwide Directory photo preflight — batched Commons source metadata

## Actual observed baseline

The unified physical research intake covers 2,579 CL2 anchors in 76 countries. The first 200 legacy R49 photo searches yielded 42 **unverified** research links across 21 unique anchors, not 42 usable images. The eight-country WDQS image index trigger is committed, but its permanent results must not be assumed available until the archive is actually inspected.

## Delivery

`tools/directory/verify-worldwide-commons-source-metadata.py` consumes a frozen `AO_DIRECTORY_BULK_MEDIA_SOURCE_INDEX_V1` export (never a public venue registry). It deduplicates Commons `File:` references across physical anchors, processes up to 1,500 unique source titles in batches of 25, and writes a rights/source-hash disposition per title. One batched Commons API call verifies up to 25 titles instead of one network call per venue. No original file download occurs.

Status `METADATA_ELIGIBLE_SUBJECT_NOT_VERIFIED` requires precise current Commons source title, SHA1, upload.wikimedia.org original URL, JPEG/PNG/WebP format, sane file size/dimensions, explicit supported CC0/CC-BY/CC-BY-SA licence URL, and nonempty attribution. Public-domain tags are **not** automatically presumed legally cleared. Missing, redirected, oversized, wrong-licence and unavailable files receive explicit holds. Identical Commons files reused for multiple anchors share one metadata check, but building identity still requires independent inspection. Every record remains `RESEARCH_ONLY_NEVER_APP_VISIBLE` with subject and rights approval false.

The tool distinguishes network errors from true empty/unsupported rights results, obeys Retry-After for 429, spaces requests, caps returned JSON and refuses overwrite. Offline tests cover batching, no network, title/path safety, licence tampering, photographer omission, missing hashes, redirected files, oversized images and error state. No fees or automatic publication.

## Next gate

Once actual country harvest results are archived, run the metadata preflight on its full 2,579-anchor index, partitioned at 1,500 unique Commons titles per job, then report exact eligible/held totals. Only eligible files proceed to source-byte SHA1 verification, rights/attribution recheck and contact-sheet visual review. Existing Places gallery assets may be reused only through confirmed exact identity crosswalk. No list of "approved photos" is asserted before those checks.
