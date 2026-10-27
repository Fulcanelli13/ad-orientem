# Sacred-art reproduction quality gate — 22 module heroes
**Version:** 2026-10-26 / audit2 visual fidelity
**Scope:** finished module hero paintings only. This is NOT an editorial reselection exercise.

## What "good quality" means

A painting must look like the actual painting, not a more vivid picture made from it. A 5,000-pixel file is not good when the underlying reproduction is blurred, noisy, sharpened, heavily compressed, glary, photographed at an angle, cut off, colour-shifted, overprocessed, falsely AI-restored, or artificially enlarged.

The **preferred image** is the most faithful and informative legally reusable photograph of the **correct museum/inventory object**, not simply the one with the largest pixel dimensions or most dramatic colours.

## Evidence hierarchy

1. The owning museum's downloadable, colour-managed original or official IIIF image, where terms permit.
2. A well-documented professional photograph with a reliable museum reference and permitted reuse.
3. A community photograph only if an original-size visual inspection confirms no unacceptable artefacts, geometric distortion, environmental glare, or incorrect colours.
4. Third-party previews solely for finding/reconciling candidates — NEVER as trusted publication masters.

If an original museum image has slightly fewer pixels but demonstrably cleaner painterly detail and more accurate colour than an enormous community copy, prefer the museum image.

## Mandatory nine-part master review

| ID | Gate | Review at 100% and alongside museum reference |
| --- | --- | --- |
| 01 | Exact original | Artist, composition, accession, location; no anonymous replica, copy or variant |
| 02 | Full painting | No unintentional cut-off of canvas, hands, figures, medallions, halo, text or original margins |
| 03 | Faithful colour | Compare reds, blues, greens, flesh, gold against institution; no blue/orange "cinematic" grade |
| 04 | Faithful light | Deep real shadows are allowed; absence of genuine tonal detail, blocked posterization or clipped whites is not |
| 05 | Material texture | Genuine craquelure, impasto and age remain; reject denoising, painted-over detail or AI-reconstructed pigment |
| 06 | Optical quality | Focus adequate for subject; no glare, flash hotspots, reflection, keystone, strong chromatic fringe or lens distortion |
| 07 | File quality | Check JPEG blocks, ringing, halos, moiré, doubled edges, banding, watermark, fake sharpening or enlargement |
| 08 | True useful detail | Check face, hands, garment transitions and small narrative scenes at native pixel scale — not just EXIF width/height |
| 09 | Actual hero | Portrait and landscape responsive compositions legible without deleting necessary subject, with full original accessible |

A source may be **visually usable with attribution** and still *not* be released until file-specific rights/credit and archival checks pass.

### Preserve aesthetic intent

Ad Orientem's dark, sacred visual atmosphere comes from the UI. We do **not** make bright paintings falsely dark or dark paintings falsely bright. No fabricated details, inappropriate saturation, generative upscaling, AI colourization of historic masters or noise smoothing that erases real paint texture.

Where a whole complex altarpiece becomes illegible as a narrow phone cover, show it **contained with framing** or use a separately approved close view while retaining the accessible full painting. Avoid automated centre-crop.

## Evidence/status vocabulary

- **museum_reference_found:** Correct official source and its artwork record located.
- **candidate_reproduction_found:** A possible photo URL exists. No positive quality verdict.
- **source_bytes_acquired:** Real immutable bytes downloaded; record SHA-256 and source terms.
- **technical_preflight_complete:** Contact sheet generated with full painting + 100%-scale detail crops, ICC/EXIF and flags. NOT "artistically approved".
- **visual_quality_reviewed_pass:** Explicit human examination of the actual downloaded master and museum comparison, with reviewer/date and nine gate decisions.
- **reuse_cleared:** Terms and photographer credit verified for that exact file.
- **cropping_approved:** Mobile and desktop staging reviewed with complete full-artwork fallback.
- **app_release_verified:** Final rendered screen tested in app with image provenance and no runtime regressions.

**Only** a complete set qualifies for production. Missing evidence means pending — do not infer.

## Tools

`python3 scripts/art/acquire-module-hero-masters.py --download` stages Commons public-domain candidates only (after its per-file API check).

`python3 scripts/art/review-module-hero-quality.py` produces an unenhanced review sheet and machine-readable technical report for every local staged master (requires free Python Pillow package).

**Do not** treat noise metrics as automatic rejection of impasto or dark chiaroscuro. Human visual review and artwork reference remain authoritative.

## Priority painting-specific inspection

- **Holy Rosary, Lotto (Cingoli):** compare the original regional painting reference with the 1772×2652 Sailko photograph and 2304×3456 alternate. The larger alternate was captured at ISO 6400; check sensor noise, lens shake and medallion detail, and avoid selecting whichever image has brighter blue. The fifteen roundels must remain visible in the full-work view.
- **Seven Sorrows, MNAC 008327-000:** seven vignettes and sword must remain; inspect dark dress and small narrative illustrations for image compression, not genuine pigment aging.
- **Confession, Murillo NGA 1948.12.1:** use official NGA open-access IIIF photograph; inspect muted colour and face/hand detail; retain father/son embrace and secondary figures in primary view.
- **Saints, Dürer GG838:** KHM's whole altarpiece with ornate carved frame is a context reference. Obtain a painting-focused version if used as hero, but do not pretend the full framed altarpiece is a separate painting.
- **Guardian Angel, Pietro da Cortona:** current file only 694×1100 (101 KB), therefore lacks archival detail. A ~2428×3852 commercial photograph has usage restrictions and is *not eligible under the €0 rule*. Seek a lawful and cleaner independent original.
- **Holy Spirit, Restout:** current alternative carries conflicting photographer rights metadata; neither large file nor reconstructed copy is safe to ship without resolving this.
- **Our Lady of Perpetual Help:** approval is for a specific clean **poster** reproduction. Check visible printed halftone dots, moiré, glare, edge stretching and how poster differs from original icon.
- **Historia Salutis, Gérôme:** original is horizontal and complex; keep wide compositional context; low-resolution thumbnail may not resolve detail.
- **Christ the King, Benson:** verify correct painting and Christie's corrected lot BEFORE any visual comparison or download.

## No-cost preservation

Keep original checksummed bytes in permanent free storage, with provenance and rights next to files. GitHub Actions artifacts expire and are not an archive. Do not purchase image licences, use metered storage or create charges. Never promote low-grade internet thumbnails because higher quality is harder to obtain.
