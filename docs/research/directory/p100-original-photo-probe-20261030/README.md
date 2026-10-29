# P100 — independently verified source originals (research-only)

**Actual Wikimedia original bytes have now been downloaded and hashed**, not inferred from Commons file metadata.

## Evidence and permanent storage

- One small exact-original probe succeeded for Blandford Forum **#195**: 3,209,643 bytes, SHA-1 matched both source API and prior ledger; independent SHA-256 computed. No full-resolution pixel decoding performed in this probe.
- The subsequent 31-candidate acquisition run successfully downloaded, independently SHA-1/SHA-256 checked, and fully decoded **10 additional distinct original JPEGs**: **#12, #15, #20, #52, #58, #61, #62, #71, #75, #96**.
- **21 attempted entries** returned Wikimedia HTTP **429**; one of them was #195, already independently verified in the earlier probe. Thus **11 distinct source originals have independently verified hashes**, **10** were fully decoded and have exposure/size diagnostics, and **20** have never had a successful original-byte verification.
- Full source JSON is [p100-original-integrity-evidence.json](./p100-original-integrity-evidence.json); it includes both GitHub workflow run links, per-image exact URL, original file checksum, byte size, source revision timestamp, dimensions, artist and license declarations, and all failure reasons.
- **No original JPEGs were committed or stored as expiring GitHub Actions artifacts.** Only the permanent metadata evidence was committed. No fees or owner outreach.

## Technical observations (not artistic acceptance)

| Photo ID | Site | Decoded original dimensions | Note |
| ---: | --- | ---: | --- |
| 12 | Fatimakapelle | 1280 × 960 | Resolution marginal for a large hero |
| 15 | Maria Lebing | 3024 × 4032 | Portrait original; framing still needs 16:9 editorial crop review |
| 20 | Sydney St Mary's | 5621 × 4216 | Ample pixels; street obstructions already noted in preview |
| 52 | Prague St Peter | 2333 × 3500 | Bright pixels occupy 35.97% of sampled luminance; investigate sky/highlights before approval |
| 58 | Adelhauser | 3944 × 2933 | Technical file integrity verified |
| 61 | Hannover St Clemens | 5392 × 3595 | Suitable resolution for full-building exterior, preview preferred |
| 62 | Hannover crypt | 4000 × 2252 | Secondary crypt interior, not generic high altar |
| 71 | Kolbermoor Bruder Konrad | 4475 × 3455 | Technical file integrity verified |
| 75 | Grafing Marktkirche | 2736 × 3648 | Portrait architectural exterior; statue-only #76 remains excluded |
| 96 | Bayonne Sainte-Marie | 1536 × 2048 | Correct cathedral, despite filename ‘Sainte-Cecile’; relatively modest resolution |
| 195 | Blandford Forum | 3400 × 2600 (Commons-reported) | Separate full-original byte and hash verification; no full decode in that probe |

These tests verify JPEG decoding and give basic luminance/clipping diagnostics; they **cannot prove sharpness, aesthetics, correct church-wide crop, absence of picture frames or editorial suitability.** The P94–P97 visual judgments remain separate.

## Wikimedia request throttling

The broad audit initially worked, then Wikimedia returned `HTTP 429: Your bot is making too many requests` for 21 requests. **Do not immediately retry the blocked files or run the bulk workflow again.** Follow Wikimedia request limits; use a separate, much slower rate-limited recovery design with backoff, bounded volume and no concurrent origin downloads if any future attempt is justified. This batch is not a release and does not authorize repeated background traffic.

## Source and release safeguards

The P91 identity ledger (385 total, 90 wrong buildings, 83 research-corroborated, 212 unresolved) and P98/P99 sidecars were left untouched. Four exact preview exceptions (#77, #110, #204, #261) remain **unviewed**.

All verified images still require manual/original-pixel image quality judgment, precise physical worship-site correlation, explicit rights/attribution version and adaptation analysis, editorial sign-off and independent production-image CI. Original hash checks **never** clear these gates. **0 new app images published**.

The research workflow was intentionally removed from the proposed main changes after completion to prevent an accidental repeat and further Commons throttling.

Validate with:

```bash
node docs/research/directory/p100-original-photo-probe-20261030/verify-p100.mjs
node docs/research/directory/p91-source-pin-visual-reconciliation-20261029/verify-evidence.mjs
```
