# Sacred Atlas — R29: one batch release for 19 owner-approved exact originals

**Status: import tooling only. No new public covers.** GitHub `main` holds the 19 owner selections in R28 and the 379/530 approved-cover baseline. R29 does not change the images, their decisions, or the public registry.

## Why the previous 64-original audit cannot be used to publish

The Round 24 workflow artifact `13318214603` is **6,120 bytes** and contains only audit evidence, not the original JPEG files. The R28 GitHub Actions source preflight received Wikimedia **HTTP 429** at the first selected photograph (Licheń); no original was acquired. A source hash recorded in an audit is not interchangeable with the actual bytes needed to generate a local WebP.

The owner's exact original selection export has SHA-256 `8b04c4cc71a15aba4b326dc4af42ff29b2d8bba13c675b5d600bd59af200773a`; the user choices are already imported and must not be solicited again.

## One batch, no external network access

Script: `tools/atlas/stage-sacred-atlas-r29-owner-selected-originals.py`.

It accepts *only legitimately acquired* original JPEGs named `<original_sha1>.jpg` in a local directory. It does **not** download anything from Wikimedia or another service, retry errors, use proxies or run on a schedule.

1. `python tools/atlas/stage-sacred-atlas-r29-owner-selected-originals.py` — prints current readiness with no source files, network requests, or mutations.
2. Once exact original files have been legitimately obtained, `python tools/atlas/stage-sacred-atlas-r29-owner-selected-originals.py --source-dir /tmp/ao-r29-originals --output-dir /tmp/ao-r29-stage` — checks each original SHA-1, byte count, JPEG format, pixel bounds, and produces full-frame 1280px review WebPs outside the repository. Creates a single `report.json` with ready/held/missing counts; **no public app assets or registry edits**.
3. Complete the per-source independently evidenced rights checklist `data/geography/research/sacred-atlas-r29-selected19-final-rights-checklist-20261104.v1.json`. All seven required gates and `publication_authorized` start **false**. Fill actual reviewer, Commons source revision, author/licence, rights evidence, exact site and full-frame mobile-quality checks. Explicitly resolve the exceptional issues below. Never set flags solely from owner preference.
4. **Only after original bytes and rights evidence are both present**, run a separate reviewed publication PR using `--apply` and a fresh staging output directory, with exactly the same source directory and completed checklist. The tool copies only eligible image derivatives into `assets/approved/place-media/` and adds their matching canonical media records. All 379 existing records remain intact. Validate full GitHub CI, merge and check GitHub Pages; do not use Vercel.

One source file that remains absent or held does not require reopening another owner's selection. The tool is capable of a partial independently cleared publication batch while keeping unresolved rows untouched. It refuses a release with zero clearance.

## Four explicit exceptions

| Owner-selected source | Required extra review |
|---|---|
| Annaya monastery panorama | Full-frame readability on mobile; source page states 4,000 × 2,250 pixels |
| Haemi martyrs' shrine photograph | Verify depiction of the specific canonical *main church*, not merely the wider shrine |
| La Salette, Attleboro | Explicit acceptance of seasonal Christmas-night cover presentation |
| Historic Guadalupe sanctuary, Zacatecas | Explicit acceptance of the real 1,032 × 776 source without claiming increased native resolution |

The Aachen photo remains on hold. Pau has no chosen cover. Pukekaraka and La Tirana only have context/gallery images in this batch. The three Haemi alternatives previously rejected are never inputs to R29.

**GitHub Actions contract:** the new R29 workflow is read-only, offline and exercises the SHA1/source-lock and final-rights validation logic. Passing that workflow is **not** evidence that any original is downloaded, or that any photograph is approved for public release.
