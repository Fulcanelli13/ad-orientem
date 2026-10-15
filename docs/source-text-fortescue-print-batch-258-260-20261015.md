# Source-text Phase 13 — 1913 Fortescue batch, printed pages 258–260

Date: **2026-10-15**. Existing `Fulcanelli13/ad-orientem` draft PR **#1229** only. This parser pipeline is not the 65-card Mass reader or its source-commentary owner.

## What was actually inspected

Three consecutive **original page images**, not a synthetic corpus:
- [Printed p. 258 / scan image 306](https://en.wikisource.org/wiki/Page:Catholic_Encyclopedia,_volume_3.djvu/306). The beginning completes the sentence at the foot of printed p.257/image305 about the names commemorated in the Canon; the printed paragraph ends just before the new inquiry about the relationship between Roman and Eastern anaphoras. The existing `pageJoinCandidate.continuedTextDraft` in `fortescue-1913-p257-provisional-transcription.v1.json` was **compared to this physical page opening**. It is not separately duplicated or authorized for app reproduction. The page then compares the Roman Canon with Syrian, Alexandrian and other ancient anaphoras.
- [Printed p. 259 / scan image 307](https://en.wikisource.org/wiki/Page:Catholic_Encyclopedia,_volume_3.djvu/307). This begins in continuation of p.258's analysis. Fortescue describes **Dr Drews' hypothetical reordered Canon**. Mark these passages as an attributed historical argument, not an accepted original order and certainly not the 1962 Mass card sequence. Also, this same printed article uses `Fac nobis` here, whereas its distinct quotation on p.257 uses `Fac nos`; **both witnesses keep separate physical-page locators**.
- [Printed p. 260 / scan image 308](https://en.wikisource.org/wiki/Page:Catholic_Encyclopedia,_volume_3.djvu/308). The top continues the discussion from p.259. A printed subheading, **“From the time of St. Gregory I (590–604)”**, appears in the right column; it is an **internal subsection**, not the start of another work or an independent article.

All three scanned pages retain Wikisource's **“needs to be proofread”** warning. A human editor has **not** independently transcribed and accepted any of these complete printed pages. Source images and the provisional textual evidence are research input, not an external editable-book import.

## Source identities and review invariants

`data/source-text/fortescue-1913-print-batch-258-260.v1.json` contains the edition- and witness-qualified map for precisely these pages, substantive topics, three physical page breaks and the previously staged p.257→258 continuation. The printed-page IDs (258, 259, 260) and the distinct DjVu image sequence (306, 307, 308) are both retained and must not be conflated.

`src/source-text/print-batch-review.js` and `tests/source-text-print-batch.mjs` validate the three-image sequence against the existing 13-page plan, the first page's link to p.257's review-only draft, authorship and subsection boundaries, and the p.257 `Fac nos` versus p.259 `Fac nobis` difference. They reject a forged scan URL, broken page order, wrong source edition, proposed publication without clearance, or source-text claims treated as authoritative 1962 rubrics. The audit output omits all unreviewed source bodies.

Nothing was changed in the Mass-card engine, canonical historical edition texts, Formation questions, Scripture, prayer modules, Calendar, artwork or production GitHub Pages app.

## Precise remaining work

1. Complete independent character-by-character reading of the p.257 Latin quotation and certify its three apparent typeset paragraphs with a named human editor.
2. Independently verify the **opening printed p.258 paragraph** against the scan, with exact punctuation, quotation marks, line-end word breaks and the letter of Innocent I; then verify its join to p.257 with both page images.
3. For pp.258–260, collate each page in physical **left-column then right-column** sequence, retaining genuine original paragraphs separately from software editing chunks.
4. On p.259, keep all suggested **Drews reconstructed Canon orders** clearly marked as a historical theory, not liturgical instructions, and isolate quoted Latin/Greek textual witnesses for their own edition review.
5. Confirm the correct p.260 Gregory subsection heading, then index the next batch (pp.261–263) with the same process.
6. Only after independently reviewed page/edition rights approval may an explicitly delimited subset move from held OCR candidate to the reader; **four existing short, scope-limited test excerpts remain unchanged**.

**Status:** indexed article pp.255–267 = 13; original-scan page image review pp.257–260 = 4 (different from fully collated pages); this batch adds **three images**, zero full-page certifications, zero additional text grants, and zero live app imports.
