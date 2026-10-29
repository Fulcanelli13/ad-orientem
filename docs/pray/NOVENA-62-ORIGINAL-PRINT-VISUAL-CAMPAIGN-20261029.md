# Prayer — 62-body original printed-page visual campaign
**29 October 2026 · Ad Orientem · single four-book cohort · PR #1981**

This continues the historical Novena work after the 10 lower-scoring exceptions (PR #1979). It does **not** count digital transcription comparisons as original print verification.

## What was actually executed

The source-backed GitHub Actions [first bulk render](https://github.com/Fulcanelli13/ad-orientem/actions/runs/40879466498) downloaded all **four original source PDFs**, checked each against the SHA-256 retained in PR #1976, extracted existing PDF text layers, and rendered all page windows for the **remaining 62 novena day prayers** into **69 unique 1550px historical page images**. It generated one [side-by-side HTML visual review](https://github.com/Fulcanelli13/ad-orientem/actions/runs/40879466498/artifacts/12900031155) with the original page photographs next to the entire current English prayer and a bounded list of potentially differing word sequences.

This is a single four-book campaign, not another sequence of small one-prayer collection runs. The 10 already resolved exceptions are kept separate; there is no re-collection or rewriting of the donor corpus.

| Printed book cohort | Prayer bodies processed | Extracted-text overlap >=95% | 80–95% |
| --- | ---: | ---: | ---: |
| Callan/McHugh *Blessed Be God* (nominal 1925 copyright, scanned text with post-1933 material) | 18 | 14 | 4 |
| Moran *The Catholic Prayer Book* (1883) | 18 | 7 | 11 |
| Hammer *Mary, Help of Christians* (1909) | 22 | 16 | 6 |
| Redemptorist *Manual of the Purgatorian Society* (1894 copyright / 1907 imprimatur copy) | 4 | 2 | 2 |
| **Total** | **62** | **39** | **23** |

The scores in this table were computed **before** the subsequent day-five/day-eight corrections. Scores measure PDF text-layer overlap, not unbroken editorial certificates. The PDF images make the source pages available for actual visual checking; simply rendering an image is **not** equivalent to inspecting every word.

The reproducible [single-pass reader/render script](../../tools/pray/bulk-original-print-62-visual-review.mjs) and [per-day 62-entry permanent evidence](../../data/pray/original-print-62-bulk-review-20261029.v1.json) include source-cohort IDs, PDF zero-based page windows, OCR gaps, and the negative certification state for every day. The full historical PDFs are **not** copied into Git. Temporary source-page renderings are three-day GitHub Actions review artifacts; the reproducible script and original-source hashes remain permanent.

### Post-correction recheck — independently rerun

The complete four-book [post-correction run](https://github.com/Fulcanelli13/ad-orientem/actions/runs/40881455788) succeeded using the edited live V4 corpus. It again produced **62 source-page comparisons and 69 original scan-page images**, now **40** at least 95% and **22** at 80–95%. The only changed scores were **Holy Souls day 5: 83.33% → 95.35%** and **day 8: 86.60% → 91.84%**, precisely the two wording corrections applied after inspecting the actual source pictures. Remaining unmatched text is confined to PDF/OCR-layer gaps around printed forms and does **not** establish a new historical variant by itself.

[Consolidated corrected-text visual review package](https://github.com/Fulcanelli13/ad-orientem/actions/runs/40881455788/artifacts/12900457415). The package is temporary (three days); the scan-and-render code and permanent 62-row evidence retain the route to regenerate it free of charge.

## Verified corrections arising from the photographs

### Holy Souls, day five — complete missing resolution restored

The original Redemptorist source on **printed p. 205 / PDF zero-based index 204** says:

- **“O infinite Good”**, not the modern digital transcription's “O infinite God.”
- **“I am sincerely sorry for having offended Thee.”** The app's previous “having ever offended Thee again” was ungrammatical and did not match the print.
- **“I wish rather to die than ever offend Thee again.”** This entire sentence was **missing** from the app.

These words were read directly from the scanned page image, not inferred from OCR. The existing Novena V4 prayer text and its editorial French translation were corrected in the single existing Holy Souls print-alignment overlay. No new prayer structure was introduced.

### Holy Souls, day eight — wish versus will

The original on **printed p. 208 / PDF zero-based index 207** says **“I wish rather to die than ever again offend Thee”**, not the app's **“I will rather die”**. The existing English and editorial French have been aligned to the original source.

Across the Holy Souls programme, the print-alignment overlay now contains **seven** source-page-backed English wording corrections, on days **1, 2, 4, 5, 6, 8, and 9**. Days **3 and 7** remain the previous wording. Every other historical Novena day prayer remains unchanged.

### Callan — a false printed-page locator corrected

The original **Novena for Christmas** begins on **printed p. 292 / PDF zero-based page 341**, visibly headed *Novena for Christmas* with December 16 beneath it. Our earlier cohort register wrongly listed **printed p. 268**. All nine Christmas day-source locator records and the regression gate have been corrected to **p. 292**. The separate Pentecost novena is correctly identified on **p. 296**.

The Callan physical-volume edition caveat remains: despite the original 1925 copyright, the scanned copy has later references. We must not claim it is a first 1925 printing, whatever its text overlap.

### Additional spot checks, no unnecessary rewriting

- **Christmas, day 3:** the original O Adonai prayer is visibly present on printed p. 293. A decorative initial O explains the low beginning anchor score; the text itself was not modified.
- **St Joseph, days 5 and 9:** direct scans of original printed pp. 605 and 607 confirm that large OCR gap counts can come from drop capitals, italicized biblical quotations and page-layout hyphenation. No unsupported alterations to these prayers.

## Release and next quality gate

A dedicated source-data test protects **all 62 matched page windows**, counts **69 distinct source page images**, and asserts only the **seven explicitly approved Holy Souls day bodies** may differ from the historical N3 donor. It checks the corrected **Christmas p. 292** and requires zero invented full-printed-edition and modern indulgence certificates.

The work performed is real acquisition and comparison, but **the complete 62-prayer word-by-word visual sign-off is not finished**. We inspected the material discrepancies and spot-checked other candidates; **60 additional high-overlap prayers still need complete individual visual line collation** before any should be called fully certified. The other ten historical exception outcomes remain recorded separately. Historic French originals and any contemporary indulgence grants/conditions are independent requirements and remain unverified.

**Next consolidation:** prioritize the remaining higher-gap candidates across Moran, Hammer and Callan using the single already-rendered HTML review. Each original prayer should receive a word-for-word pass, a printed-page citation and an explicit ACCEPT / TEXT CORRECTION / EVIDENCE HOLD disposition. Do not publish a “62/62 visually certified” number before those human visual checks are actually performed. There is no need to collect the books or build another reader.
