> **AUTHORITATIVE EDITION CORRECTION — 15 OCT 2026:** The Fortescue article first appeared in 1908, but this Wikisource/Commons DJVU is the **1913 Knights of Columbus special edition**. Any references below to the scanned images as "original 1908 printed pages" are superseded. The correct scanned edition and witness IDs are `ED-CE1913-V3-KOC-SPECIAL` and `WIT-CE1913-V3-KOC-PRINT-FORTESCUE`. See [Phase 6 edition and p257 correction](source-text-edition-correction-and-p257-20261015.md). Historical staging statistics below are not the current totals: current fixture has **four excerpts across three printed pages**, zero complete pages independently collated.

# Phase 5 — Multi-page scan acquisition and proofreading queue (2026-10-15)

**Repository:** `Fulcanelli13/ad-orientem`, existing draft PR #1229. This source-text pipeline does not own Mass commentary interpretation, Q&A content, liturgical cues, Scripture, or presentation.

## Verified scope and why bulk OCR is held

Adrian Fortescue, **“Canon of the Mass,”** *The Catholic Encyclopedia* III (Robert Appleton, 1908), begins on **printed p. 255 / DjVu image 303** and ends on **printed p. 267 / DjVu image 315**. The shared boundary pages also carry *other* encyclopedia entries. All 13 identified Wikisource Page: URLs (303–315) have been opened; the online transcriptions are explicitly marked **“This page needs to be proofread.”** OCR artifacts, mixed column ordering, line breaks and overlapping article boundaries prevent automatic publication.

- Bibliographic landing page (not the print authority): https://www.newadvent.org/cathen/03255c.htm
- Original scan start: https://en.wikisource.org/wiki/Page:Catholic_Encyclopedia,_volume_3.djvu/303
- Original scan end: https://en.wikisource.org/wiki/Page:Catholic_Encyclopedia,_volume_3.djvu/315
- First two *short excerpts* already visually checked in Phase 4: printed pp. 255–256 only; human editorial certification still pending.
- The article has **13 digitized page witnesses indexed, but zero complete pages independently transcribed or approved**. Do not confuse a page URL map with complete source-text acquisition.

## Artifacts and protections

`data/source-text/fortescue-1908-print-page-plan.v1.json` holds the article-level page map, printed-page vs scan-image identifiers, separate first/last article boundary holds, one exact source root and zero full-page text approvals.

`src/source-text/scan-review.js` establishes the **temporary candidate ➝ proofreading queue ➝ selected approved excerpt** path:

1. Validate edition/work/witness plus a contiguous ordered print-page list, and bind every scan URL to its declared digitized source root and exact scan page.
2. Stage prospective text, retaining page, column and type (body, heading, footnote, running header, adjacent article). Flag article-boundary ambiguity, unknown column order, page continuation, replacement characters, soft hyphens, end-of-line hyphenation and potential markup.
3. Export only **review metadata, flags, character counts and scan links**; **candidate OCR text is excluded** from the queue. Every item is `HELD_FOR_INDEPENDENT_PRINT_COLLATION`.
4. The explicit promotion interface requires named reviewer and evidence IDs, separately verified scan images, resolved uncertainty flags, and manual confirmation of any cross-page join. Non-body candidates cannot silently join the article text.
5. The existing **source-work edition/witness match and exact two-excerpt reproduction whitelist** are checked before an excerpt becomes eligible to package. Additional real OCR content, even if flagged “reviewed,” cannot bypass this list.
6. Reviewed cross-page source image links can be carried in `sourcePages` through the manifest and on-demand chunks; the reader checks the full span against metadata. Older packages without this optional field are unchanged.
7. The output explicitly declares `productionPublishApproved:false`; human editorial sign-off and production integration remain separate.

## Node 22 acceptance

`tests/source-text-scan-review.mjs` runs **325 synthetic OCR-like candidates across the 13 real page IDs**. It verifies review-flag detection, text exclusion from exported metadata, rejection of duplicate or noncontiguous spans, scan-host spoofing, non-body releases, missing reviewer proof and unresolved cross-page joins. A cross-page example is **project-authored synthetic text**, not a fabricated Fortescue quotation. The **two previously scoped genuine 1908 excerpts** remain the only tested third-party text and never reach production.

A review plan for 13 pages is not a claim of hundreds of authentic, collated Fortescue paragraphs. The only current 1,200-passage corpus test is synthetic and tests stress/identity mechanics, not scholarly accuracy.

## Next acquisition batch

Original printed pages must be proofread **against page images**, beginning p. 255 (entry start boundary), then the continuous pp. 256–266, and p. 267 (article end). Each selected original-text paragraph needs authorial attribution, precise page and section, any multi-page parts, footnote designation and a separate human collation/rights decision. Track OCR corrections explicitly rather than replacing unreadable words by prediction. The owning Mass interpretation pipeline may later consume approved references, but this pipeline must not change or reproduce its Mass reader or decide what Fortescue's opinions mean for 1962 rubrics.

**Deployment / merge gate:** original article not acquired; phone/browser QA, source-owner review, network gzip measurements and rights verification outstanding. Keep PR **draft, unmerged, no pages deployment**.
