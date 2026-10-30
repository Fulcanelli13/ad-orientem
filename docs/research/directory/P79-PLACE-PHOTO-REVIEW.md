# P79 canonical Place photo quick reviewer

Open `docs/research/directory/p79-canonical-place-photo-review.html` in a browser (download the raw HTML file first). This is an offline, single-page reviewer for the **existing** P79 Commons candidate assignments; thumbnails load from Wikimedia Commons when online.

- 430 assignments for 109 canonical Places; default view shows the **79 P79 Places without already-approved media**.
- Up to six photos per Place are visible initially; reveal more as needed. You can **approve one photo editorially in one click**, choose none, or hold each Place. The click confirms the exact church and acceptable composition/quality; only exceptions should require another decision. Existing `REJECT` and wrong-location dispositions remain unselectable, never silently rehabilitated.
- Save/reopen in the same browser to retain choices in local storage; export or import a complete JSON decision snapshot. **Never use export decisions as automatic approvals**. The V2 export carries the one-click editorial approvals but still marks unverified Commons rights/original bytes and app publication false. Those are checked automatically by the release tool, never asserted from a thumbnail.
- Author, stated licence, original SHA1 and full-size dimensions are source claims. P79 does **not** consistently include reliable per-file Commons category, geotag or Wikidata P180 depicts statements; we intentionally do **not** invent an identity-confidence percentage.
- The user checks exact-building identity, visual quality and exceptional subjects when selecting. A single subsequent command verifies current Commons licence/author/source SHA1, downloads and verifies bytes, creates full-frame WebPs and can update **existing** approved-media records. Licence exceptions, protected modern artwork and sensitive identifiable subjects stay on hold; never assume the filename or Commons category alone establishes identity.
- Rebuild with `node tools/directory/build-p79-place-photo-review.mjs` after source changes. Run `node tools/directory/build-p79-place-photo-review.mjs --check` in CI. The generated file is a **snapshot**, not a new master.
- Remaining uncovered Places must go through the same pipeline after this existing backlog is handled; do not create a separate acquisition catalogue.

This is not a production app or a public photo page. It does not contact owners, incur paid storage or publish any photos.

## One-click selection to app-approved media

The updated reviewer exports `AO_P79_PLACE_PHOTO_SELECTIONS_V2`. Earlier V1 choices are **not** silently promoted; the V2 browser storage key is separate. Export the review JSON to a checkout, then:

```bash
python tools/directory/release-p79-approved-photos.py --review /path/to/review.json --validate-only

# Source-check and retain proposed WebPs without modifying the app:
python tools/directory/release-p79-approved-photos.py --review /path/to/review.json --output-dir /tmp/ao-p79-verified-1

# In a reviewed working tree/branch, install only verified WebPs + media entries:
python tools/directory/release-p79-approved-photos.py --review /path/to/review.json --output-dir /tmp/ao-p79-release-1 --apply
```

**No further routine human approval** between editorial choice and verified local publication. `--apply` does not push to GitHub: review/commit the updated existing registry and generated WebPs through the normal PR path, run the existing photo/media CI, and check the actual app rendering. Photos with source/rights/errors are held individually in `verification-report.json`. Keep originals/derivative and checksums durably under an approved zero-cost archive; do not rely on expiring Actions artifacts or treat a staged local file as deployed. The release tool does not create or infer a Directory venue link; an exact CONFIRMED `directoryPlaceLinks` relation remains required for Mass cards.

The automated machine-compatible lane currently supports CC0, CC BY 3.0/4.0 and CC BY-SA 2.0/3.0/4.0 with exact licence URLs and credited authors. Country-specific licence variants, public-domain legal claims and other licences remain exceptions for qualification rather than universal re-review.
