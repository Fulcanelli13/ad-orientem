# P101 — technical/preview crosswalk for verified source originals

P100 ([PR #2023](https://github.com/Fulcanelli13/ad-orientem/pull/2023)) is merged. P101 moves the original-file checksums into a targeted **editorial inspection queue** without inventing visual observations.

## Research-only candidate status

| Status | Images | Interpretation |
| --- | --- | --- |
| First visual editorial inspection | **#58 Adelhauser, #61 Hannover exterior, #71 Kolbermoor** | Original decoded and hash-verified, prior preview deemed viable/preferred, wide crop meets illustrated 1920×1080 minimum with at least 50% original retained, no obvious automated luminance warning |
| Targeted manual review for specific risks | **#12, #15, #20, #52, #62, #75, #96** | Original hash+decode confirmed but low resolution, portrait-to-landscape loss, visible clutter, highlights, or secondary-role limitations |
| Original hash verified, full decode not performed | **#195 Blandford Forum** | Single-file probe successful; prior preview preferred exterior, source-page CC0 claim. Needs pixel-level inspection before final quality judgment |
| Original integrity not verified | **20 other P98 candidate IDs** | Wikimedia request throttling blocked acquisition |

These are **review-order categories, not acceptance or rejections**. The first group is not already approved for publication.

## Quality risks that require actual-image inspection

- **#52 Prague St Peter**: 35.97% of *sampled grayscale values* are in near-white band; possible bright sky, not proof of overexposure. Investigate against image pixels and actual composition before making any editorial judgment.
- **#15 Maria Lebing and #75 Grafing**: portrait originals retain roughly 42% of their original area in a hypothetical center crop to 16:9. Reframe rather than blindly crop away steeples and the facade.
- **#96 Bayonne**: 1,536×2,048 portrait source would yield a 1,536×864 16:9 crop, below a true 1,920×1,080 output without upscaling. Prior preview also cut spire tops and the file has misleading Sainte-Cécile naming. Verify exact Sainte-Marie depiction, already corroborated in P91.
- **#12 Fatimakapelle**: 1,280×960 produces a maximum crop of 1,280×720 at 16:9; not suitable for large high-density hero without upscaling.
- **#20 Sydney St Mary's**: 5,621×4,216 image has ample pixels; a P97 preview established significant traffic, signage and tree interference. Larger source resolution does not fix poor visual composition.
- **#62 Hannover crypt**: excellent near-16:9 aspect (4,000×2,252) but *crypt secondary interior*, not main church nave/altar. Do not use as a false church-wide image.
- **#61 Hannover St Clemens**: stronger candidate with 5,392×3,595 source and low clipping indicators, but still needs original-resolution image-quality review and proper CC BY-SA 4.0 attribution.
- **#195 Blandford Forum**: previous SHA-1/SHA-256 verification is valid. Original JPEG decoding did not happen in the one-file probe. CC0 requires no mandatory attribution, but source and author provenance remain recommended.

The illustrative 16:9 calculations are not an assertion of the actual Ad Orientem directory card aspect ratio; inspect the actual image component before deciding crops.

## Non-negotiable release gates

For any photo, approval requires all of: (a) correct **physical Mass site** and source URL, (b) original bytes/hash and inspection of actual image rather than only PNG/JPEG decoding, (c) fit to the app's actual card geometry including mobile aspect, (d) fully recorded author/rights/license and derivative terms, (e) explicit editorial sign-off. For accurate historical and architectural imagery, reject picture frames, misidentified sites and dominant irrelevant foreground objects.

No image was published, accepted for production, or assigned a new canonical site. All 385 photo assignments preserve 90 wrong-site rejections, 83 research corroborations and 212 unresolved. The four inaccessible exact previews #77, #110, #204 and #261 remain held.

No new Wikimedia downloads or automatic retry workflow were created. The 20 acquisition exceptions should be handled only through a rate-compliant plan after throttling is respected.

Validate with `node docs/research/directory/p101-verified-original-quality-triage-20261030/verify-p101.mjs` plus the P100 and canonical P91 integrity checks.
