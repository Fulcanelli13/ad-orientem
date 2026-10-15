# Phase 8 — Printed p.257 provisional transcription, page-258 handoff (2026-10-15)

**Source:** Adrian Fortescue, *Canon of the Mass*, originally published 1908, examined witness **1913 Catholic Encyclopedia volume III Knights of Columbus special edition** (`ED-CE1913-V3-KOC-SPECIAL`, `WIT-CE1913-V3-KOC-PRINT-FORTESCUE`).

Primary scans:
- [Original scanned printed p.257, image 305](https://en.wikisource.org/wiki/Page:Catholic_Encyclopedia,_volume_3.djvu/305)
- [Original scanned printed p.258, image 306](https://en.wikisource.org/wiki/Page:Catholic_Encyclopedia,_volume_3.djvu/306)
- Wikisource's Page transcription on both scans is explicitly **“Not proofread”**. [New Advent's article transcription](https://www.newadvent.org/cathen/03255c.htm) provides a useful *secondary comparison*, but may be based on a different setting and includes hyperlinks/editorial processing. It cannot establish literal 1913 punctuation or eliminate the need to examine the scan.

## Actual work performed

Created `data/source-text/fortescue-1913-p257-provisional-transcription.v1.json`, containing **ten OCR-assisted historical text draft blocks (approximately 1,209 whitespace-delimited words) plus two non-duplicated references to existing limited excerpts**. The working transcription covers the transition from the first-century liturgy to Greek/Latin source use; Clement, Justin, Polycarp and Hippolytus; the adoption of Latin; Damasus; and the extended Latin *De Sacramentis* quotation. Original *printed-page* and digitized-image IDs are separate, and the physical reading order is left column → right column.

The working text is a **real-source transcription candidate, not an independently certified edition**. OCR defects were manually flagged and some words checked visually, but there has not been a complete independent, character-by-character verification of the page or every paragraph indentation. The long Latin excerpt and its patristic attribution are held at the highest proofreading priority. Editorially, Fortescue's historical hypotheses are attributed opinions, not binding 1962 rubrics or newly established historical facts.

The last sentence on the original p.257 ends midway through a clause, which resumes on **printed p.258**. The separate `pageJoinCandidate` now carries source pages **257→258**, image indices **305→306**, the provisional next-page continuation, and an explicit `mergeApproved:false` / `independentImageProofread:false` lock. Neither the held next-page text nor the p257 draft is part of any production text package.

## Technical quarantine and regression protection

- Added `src/source-text/provisional-page.js`: validates work/edition/witness/source scans, block identity and basic page content; produces **metadata-only** held audit results without leaking candidate text; refuses drafts marked as publication-approved, promotion-eligible or fully proofread.
- Added `tests/source-text-provisional-page.mjs`: verifies ten draft blocks plus two already selected excerpt references, the distinct embedded patristic quote, unresolved column/page transitions, and rejection of forged witness, URLs, approved status, mismatched continuations and draft-to-package attempts.
- Kept the previous **four** exact, limited third-party excerpt approvals unchanged; the **1,200 synthetic passages** and **325 synthetic OCR-candidate tests** remain strictly technical stress fixtures, not independently transcribed original text.
- Updated `data/source-text/fortescue-1913-p257-layout-audit.v1.json` to acknowledge the new **quarantined** transcription while retaining **zero whole printed pages approved**, **zero human-signed-off paragraphs**, uncertain paragraph census and outstanding Latin collation.
- The source parser owns extraction mechanics and provenance only; Mass interpretation, the 65-card reader, Formation, Scripture, Prayer and all production routes remain untouched.

## Certification handoff — not automatically satisfied

Before promoting printed page 257, a human editor must independently compare all draft blocks with image 305 at high resolution, repair exact ligatures/accents/quotes and book citations, identify original paragraph breaks, review the *De Sacramentis* Latin against the scan, verify the physical join onto page 258/image 306 and record actual corrections. Only then should an explicit **page-level and excerpt-level approved witness** be created. The existing `REVIEWED_EXCERPTS_ONLY` whitelist is **not expanded**.

**Counts:** 13 article-page images indexed; one page has a provisional broad transcription candidate; four original selected short excerpts remain; zero full-page original prints independently collated; zero production bundles; PR #1229 stays draft and unmerged.
