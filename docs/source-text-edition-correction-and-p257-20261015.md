# Phase 6 — Fortescue edition correction and first complete paragraphs (15 October 2026)

Status: **DRAFT PR #1229 / PRELIMINARY TEXT COLLATION, HUMAN EDITORIAL APPROVAL PENDING.**

## Critical identity correction (supersedes earlier Phase 4 and Phase 5 labels)

Fortescue's encyclopedia **article** “Canon of the Mass” was first published in **1908** (*The Catholic Encyclopedia*, volume 3, Robert Appleton Company), as documented by the original article bibliography at https://www.newadvent.org/cathen/03255c.htm. However the exact **scanned book used by this pipeline** is a **1913 special edition, Knights of Columbus Catholic Truth Committee / The Encyclopedia Press**, not a verified scan of that 1908 first printing.

Primary evidence for the *scanned witness*:
- Wikimedia original DJVU Commons metadata: https://commons.wikimedia.org/wiki/File:Catholic_Encyclopedia,_volume_3.djvu (date: **1913**, source IA `catholicencyclop03herbuoft`).
- The original scanned title: https://en.wikisource.org/wiki/Page:Catholic_Encyclopedia,_volume_3.djvu/11; prominently says **SPECIAL EDITION / under the auspices of the Knights of Columbus Catholic Truth Committee**.
- Independent edition history: https://onlinebooks.library.upenn.edu/webbin/metabook?id=cathency records later **1913–1914** special editions following the original 1905–1912 volumes, with substantially the same but not necessarily identical contents.

**One work does not imply one edition.** The legacy `WORK-CE1908-FORTESCUE-CANON-MASS` remains the work/first-publication identity. The *edition* and *witness* IDs are now **`ED-CE1913-V3-KOC-SPECIAL`** and **`WIT-CE1913-V3-KOC-PRINT-FORTESCUE`**. All review records, excerpt anchors and tests are migrated. Existing filenames containing `fortescue-1908` are grandfathered article identifiers, **NOT** witness edition labels. No assertion that the 1913 words match the 1908 printing word for word is permitted without direct two-edition comparison.

## Genuine text progress — explicitly limited

The 13 scan images corresponding to printed pp. 255–267 (DJVU images 303–315) remain indexed as before. **No complete printed page has been independently transcribed and approved**. Only the following **four selected excerpts** appear in the technical fixture:

| Printed page | Scan image | Selected text | Verification level |
|---|---:|---|---|
| 255 | 303 | One previously selected sentence | Preliminary image comparison |
| 256 | 304 | One previously selected sentence | Preliminary image comparison |
| 257 | 305 | First complete paragraph of the page: Fortescue speculates on a past reordering of the Canon | Preliminary comparison to the image, human sign-off pending |
| 257 | 305 | Second complete paragraph: Fortescue's reconstruction of early Roman Eucharistic practice | Preliminary comparison to the image, human sign-off pending |

Printed p.257: https://en.wikisource.org/wiki/Page:Catholic_Encyclopedia,_volume_3.djvu/305 (page is marked **Not proofread** on Wikisource). Two-column order and the authorial transition into historical speculation are deliberate. The new paragraphs are not recast as controlling 1962 instructions, nor are they a completed article/chapter/full-page approval.

`data/source-text/fortescue-1908-print-excerpts.v1.json` contains the four precisely whitelisted excerpts, exact scan URLs, printed pages, new 1913 witness/edition IDs and **editorialPublicationApproval: NOT_GRANTED**. Tests should enforce each of those boundaries. The source parser cannot itself provide a second independent human proofread.

## Real OCR error register

The Wikisource-hosted page 257 OCR is visibly unreliable, with e.g. misread *century*, *will be seen*, *Rome*, *Sanctus* and *Victor*; it also contains an illegible multiword run near the reference to Palestine. Six concrete cases, one still unresolved, are recorded in `data/source-text/fortescue-1913-p257-ocr-triage.v1.json`. **Automatic substitutions are prohibited**. Corrected snippets are work aids only; the entire unproofread text is not imported.

## Integration and limits

The 1913 printing is now the sole digitized witness for these scanned-page excerpts. The 1908 publication information is bibliographical. Every package identifier must preserve *work + edition + witness + page/anchor*, with page numbers distinct from scan image indices. The existing review-only lazy reader should allow metadata lookup without downloading text and should reject altered or unapproved excerpts.

Human editor must next: verify all four against 1913 page images; independently compare 1908 original if textual parity is desired; collate complete p.257 in column order; resolve page-end continuation, proper names, quotations, italics and footnotes; then extend page by page **without manufacturing approved paragraph counts**. Keep all other pipelines independently owned and PR #1229 draft/unmerged, with no production route.
