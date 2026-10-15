# Phase 14 — Fortescue 1913 Catholic Encyclopedia vol. III pp. 261–263

15 October 2026. Draft PR #1229, source-text parsing pipeline only. Fortescue's *Canon of the Mass* was first published in 1908; **the indexed scanned witness here is the 1913 Knights of Columbus special edition**.

## Evidence quality — mandatory qualification

The page-specific **Wikisource transcriptions** were read for pp. 261, 262, 263. Each page is marked **Not proofread**. Page links point to the correct 1913 DjVu scan pages, but the full-resolution page images were not reliably accessible for a new direct magnified image collation in this pass. Accordingly this is **a provisional subject/section map inferred from unproofread hosted transcription plus anchored scanned-page identifiers**, *not* a completed original-print facsimile collation. Explicitly marked as such in the JSON and CI.

References:
- Printed [261 / scan 309](https://en.wikisource.org/wiki/Page:Catholic_Encyclopedia,_volume_3.djvu/309)
- Printed [262 / scan 310](https://en.wikisource.org/wiki/Page:Catholic_Encyclopedia,_volume_3.djvu/310)
- Printed [263 / scan 311](https://en.wikisource.org/wiki/Page:Catholic_Encyclopedia,_volume_3.djvu/311)

## Findings and ownership routing

**Printed 261** — The history discussion ends with medieval variants, Trent, Pius V and later Missals; a new major internal section, **“III. The Text and Rubrics of the Canon”**, introduces descriptions of the Canon's silent recitation and ceremonies. The **“Te igitur”** subsection begins on this page. The older Denzinger paragraph numbers **819 and 830** are *historical edition locators*, not direct `DH` identifiers. Trent-related quotations must be collated to an exact original edition and cannot be treated as exact text from OCR. Fortescue's assertion of Canon stability is his historical interpretation, not a fresh independent certification of the reader's liturgical data.

**Printed 262** — Continues **Te igitur** with historical mention of pope, ordinary and sovereign; then moves through **Commemoratio pro vivis**, **Communicantes**, and the beginning of **Hanc igitur**. The OCR contains both `Intra Actionem` and `Infra Actionem` as apparent variants; the print reading must be checked, not guessed from Latin or the modern missal. Fortescue's descriptions of sovereign-name clauses and local feast additions are period-specific, not a ready-to-import 1962 instruction.

**Printed 263** — Continues **Hanc igitur** with older feast/votive interpolations and gestures, then **Quam oblationem** and **Qui pridie**, with an inline discussion headed **“Gratias agens”**. That last phrase is *part of the Institution narrative analysis*, not a separate original Mass prayer/card. The same page discusses the Elevation's historical development. When future Mass reference modules link here, use source-to-semantic-segment links only: **never rewrite the established 65-card Mass reader, cues or calendar overlays**.

## Files and technical protections

- `data/source-text/fortescue-1913-print-batch-261-263.v1.json` records the three pages, the 11 historical/prayer commentary subject segments, section transitions, printed-page/scan-page locators, source-review limitations and source-specific questions. No historical body text is approved or imported.
- Extended `src/source-text/print-batch-review.js` with a generic **follow-on batch** validator. It validates previous-batch adjacency (260→261), three printed/scan page pairs (261/309, 262/310, 263/311), three *unproofread* textual transition descriptions, unique section subjects, major section versus inline phrase hierarchy and rubric/citation ownership. It refuses publication, newly-certified full pages, wrong edition, forged URLs, asserted image verification and accidental creation of a new `Gratias agens` prayer.
- `tests/source-text-print-followon.mjs` is the eighth automated suite, including negative tests for invalid publication statuses, wrong scan pages, misassigned headings, claimed direct image verification, false cross-page joins, false 1962 rubrical authority, and legacy Denzinger-to-DH conflation.
- Updated the article's master page plan to mark the three records as **unproofread transcription structurally reviewed**. The prior 258–260 batch and the p257 preliminary image work remain intact.

## Position and next priorities

Indexed article print pages **255–267**: 13. Pages 257–260 have research-level page layout/image reviews in previous records. Pages **261–263** now have a bounded *hosted unproofread transcription* subject index and page/image locators; **do not combine the different evidence grades into a single “image certified” count**.

**Entire independently proofread historical pages: 0.** Explicit print-edition and rights authorization for bulk historical text: pending. Limited four-excerpt test whitelist unchanged. No new Mass reference attribution decisions made, no production import, no merging, no public-site changes.

Next: review printed pp. 264–266; when full-resolution original scan images become accessible, resolve original typeset sections and complete the Latin quotation and cross-page joins. Publication and full-text promotion remain separate gates.
