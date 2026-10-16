# Source witness / scan reconciliation — 15 October 2026

**Integration owner:** `src/reference`. **Evidence donor:** draft [PR #1229](https://github.com/Fulcanelli13/ad-orientem/pull/1229) head `dfcc197bf3203af47cff6a3bfddf8ff9e1af741f`. **Register:** [#342](https://github.com/Fulcanelli13/ad-orientem/issues/342).

This is the **metadata/rights and print-scan staging slice**, not migration of the alternative `src/source-text` parser, packager or reader. The canonical parsing runtime remains `src/reference/text-parser.js`, `html-parser.js`, `passage-packs.js` and `passage-reader.js`, merged in #1222. No Home/Formation/Mass/Scripture/Explore runtime imports this research.

## Integrated unique capabilities

- `edition-witness-contracts.js`: explicit work/edition/witness schema validation; review ID; optional exact-approved-excerpt text and anchor whitelist; signed-off scan-page span *shape* validation. These are programming guards **not evidence of legal or editorial authorization**.
- `witness-locators.js`: real observed locator grammar for numbered papal paragraphs, EWTN Tanquerey sections with correct installment URL, Hume's distinct E vs SBN format, de Sales part/chapter, 1913 Fortescue printed page/excerpt; index-only Denzinger `D` versus `DS` distinction. No third-party text is fetched.
- `scan-staging.js`: print-page sequence and OCR candidate flagging, deliberately excluding the text or publishing/export methods from the donor branch. Its queue can never package a work.
- `data/reference/research/`: donor's nine inspected/candidate witness profiles, 13-page Fortescue scanned-witness plan, six disputed short OCR readings preserved with their human-recheck holds.

## Publication and data integrity holds

Fortescue's **original article publication (1908)** is **not** the same as the **1913 Knights of Columbus special-edition print scan**. Stable identity is `WORK-CE1908-FORTESCUE-CANON-MASS` / `ED-CE1913-V3-KOC-SPECIAL` / `WIT-CE1913-V3-KOC-PRINT-FORTESCUE`. Filenames in #1229 containing 1908 sometimes refer to the article provenance only. Four preliminary excerpt paragraphs in the research branch do **not** authorize full-page text or public publication; no original complete page was approved. The OCR is unproofread, including one undecided segment. This integration copies **no** original body paragraphs or packages.

**Still missing from #1229:** a single work/edition-qualified binding at the actual SHA-256 passage-pack boundary, exact approved-excerpt preservation through packaging and opening, metadata-only search without full-text fetch, controlled historical-witness extraction, and independent real browser/phone adoption tests for a genuine source work. Until these are implemented *within* `src/reference`, the new identity guards are **editorial/import utilities only**. Do not merge the parallel `src/source-text/{parse,package,reader}.js` runtime.

Existing 13-work registry `data/reference/canonical-works-pilot.v1.json` remains canonical. Other product owner modules are unchanged. This integration is a narrow first slice and does not supersede/close #1229.
