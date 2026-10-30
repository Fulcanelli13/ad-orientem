# Ad Orientem — Photo Finder editorial export, 30 October 2026

## Source of truth, not a second photo master

The exact user review from the Photo Finder is preserved here as `decisions.json` (451 canonical Place decisions) and `credits.csv` (972 individual Commons source/credit claims), **without changing the decisions**. There are 395 Places with selected photographs, 56 with *none suitable*, 395 rank-1 covers and 577 secondary gallery picks. All 451 Place IDs resolve to the current 530-place canonical seed. Original author and licence values in the CSV remain *claims until source-verified*; the reviewer field was blank.

The source archive is research evidence. Publication still uses the pre-existing registries:
`data/geography/approved-place-media.v1.json` and `data/geography/approved-place-gallery.v1.json`, with physically stored derivatives under `assets/approved/`. Nothing is app-visible because it appears in the research folder.

## Deterministic release adapter

```bash
python tools/directory/release-photo-finder-decisions.py --plan

# Run source/checksum verification for up to 20 metadata-eligible choices:
python tools/directory/release-photo-finder-decisions.py --role cover --offset 0 --limit 20 --output-dir /tmp/ao-photos-cover-b1

# After source verification, to place successful WebPs and media records
# into a dedicated GitHub checkout/branch (does not commit or deploy):
python tools/directory/release-photo-finder-decisions.py --role cover --offset 0 --limit 20 --output-dir /tmp/ao-photos-cover-b1-apply --apply
```

The first choice is a cover; the second/third are gallery candidates. Existing approved covers are never overwritten. Existing exact same-file approvals, cross-Place SHA reuse, legally uncertain public-domain claims, nonstandard licences, undersized originals and obvious exceptional subjects receive explicit dispositions, rather than silently passing. Public-domain exceptions can be revisited with established legal basis and metadata, but no generic `PUBLIC_DOMAIN` label is treated as sufficient proof. The importer is strict: altered roles, missing/mismatched credit records, unknown Places and changed Commons files fail closed.

CC0 and correctly versioned CC BY/CC BY-SA licences 2.0–4.0 (including 2.5) take the ordinary machine-verification route. Live Commons author/licence/original SHA1, downloaded byte checksum and image decoding remain mandatory. Every allowed derivative has a verified source reference, source photographer, exact licence URL and bilingual alt text, and must be committed with its corresponding approved-media record. No additional routine editorial review is requested.

The Photo Finder export predates the latest P79 V2 attestation: your **choice is the editorial decision about the pictured building and quality**, not a claim that the work's legal provenance has been independently verified. A source exception can still be held without revisiting every other choice.

### Boundary

The adapter does **not** create new geographical Place IDs or Directory venue links, overwrite another publication's cover, or hotlink original Wikimedia files in the production app. It does **not** store photographs on ephemeral Actions artifacts as the sole archive. Any actual image release still requires a commit/PR, CI and verification of the running app. Both existing Explore and TLM Directory readers already render approved credited local images; Directory still requires a confirmed `LOCATED_AT` venue-to-Place relation.

### Status

The user's selections are durably archived in this branch. This intake PR itself **publishes zero new image files**. Technical staging and the first real app-asset batch are separate release actions and should be performed immediately after this import passes CI, not replaced by another discovery campaign.
